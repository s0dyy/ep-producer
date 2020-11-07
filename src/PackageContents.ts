import glob from 'glob'
const semver = require('semver')

import { Package } from "./Package"

export class PackageContents extends Package {
  exheres: string|Array<string> = ""
  exlib: string|null = null
  files: Array<string>|null = null
  versions: string|Array<string> = ""
  bestVersion: string = ""
  bestIsValid: boolean = false

  findFiles() {
    var pathCleaner = (paths: Array<string>): Array<string> => {
      let newPaths = []
      for (let p of paths) {
        let crop = p.replace(`repositories/${this.repository}/packages/${this.category}/${this.name}/`, '')
        newPaths.push(crop)
      } 
      return newPaths.reverse()
    }
    // Check if one or more exheres exists.
    let exheres = glob.sync(`${this.path}/*.exheres-0`)
    exheres.length < 2 ? this.exheres = pathCleaner(exheres).toString() : this.exheres = pathCleaner(exheres)
    // Check if exlib exists.
    let exlib = glob.sync(`${this.path}/*.exlib`)
    if (exlib.length) { this.exlib = pathCleaner(exlib).toString() }
    // And if the package has additional files.
    let files = glob.sync(`${this.path}/files/**`)
    if (files.length) { this.files = pathCleaner(files) }
  }

  findVersions() {
    // Single exheres.
    if (typeof(this.exheres) === 'string') {
      let pv = semver.coerce(this.exheres, '*')
      if (pv.raw == "0.0.0" && this.exheres.includes("scm")) {
        this.versions = "scm"
        this.bestVersion = "scm"
      } else {
        this.versions = pv.raw
        this.bestVersion = pv.raw
        // TODO: Find a solution for invalid versions, ep-worker will not process packages
        // with mostRecentVersionIsValid = false (not a priority, ~500 packages, most of them are related to KDE or Perl).
        if (semver.valid(pv.raw)) {
          this.bestIsValid = true
        }
      }
    // Multiple exheres.
    } else if (typeof(this.exheres) === 'object') {
      let versions = []
      let scm = false
      let notValidForSort = []
      // Loop, check scm or invalid versions.
      for (const e of this.exheres) {
        var version = semver.coerce(e, '*')
        if (version.raw == "0.0.0" && e.includes("scm")) {
          scm = true
        } else if (!semver.valid(version.raw)) {
          notValidForSort.push(version.raw)
        } else {
          versions.push(version.raw)
        }
      }
      // Sort first, cannot sort with invalid version or scm.
      if (versions.length) {
        semver.rsort(versions)
      } else {
        // TODO: Same as above.
        //console.log(`WARNING: No valid version found for ${this.category}/${this.name}.`)
      }
      // Push scm and no valid if exists.
      if (notValidForSort.length) { 
        for (const version of notValidForSort) { 
          versions.push(version) 
        }
      } 
      if (scm) { versions.push("scm") }
      this.versions = versions
      this.bestVersion = versions[0]
      if (!notValidForSort.length) { this.bestIsValid = true }
    }
  }
}

