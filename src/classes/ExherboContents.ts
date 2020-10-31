const path = require('path');
const glob = require("glob")
const semver = require('semver')

export class ExherboContents {
  #path: string
  repository!: string
  category!: string
  name!: string
  exheres!: string|Array<string>
  exlib!: string|null
  files!: Array<string>|null
  versions!: string|Array<string>
  bestVersion!: string
  bestIsValid!: boolean
  upstreamSource!: string

  constructor(packagePath: string) {
    this.#path = packagePath
  }

  findRepCatName() {
    let segments = this.#path.split(path.sep)
    this.repository = segments[1]
    this.category = segments[3]
    this.name = segments[4]
  }

  findFiles() {
    var pathCleaner = (paths: Array<string>): Array<string> => {
      let newPaths = []
      for (let p of paths) {
        let crop = p.replace(`repositories/${this.repository}/packages/${this.category}/${this.name}/`, '')
        newPaths.push(crop)
      } 
      return newPaths
    }
    // Check if one or more exheres exists.
    let exheres = glob.sync(`${this.#path}/*.exheres-0`)
    if (exheres.length) { // Because hasufell/packages/net-www/exlibs has no exheres (and maybe others).
      exheres.length < 2 ? this.exheres = pathCleaner(exheres).toString() : this.exheres = pathCleaner(exheres)
    }
    // Check if exlib exists.
    let exlib = glob.sync(`${this.#path}/*.exlib`)
    exlib.length ? this.exlib = pathCleaner(exlib).toString(): this.exlib = null
    // And if the package has additional files.
    let files = glob.sync(`${this.#path}/files/**`)
    files.length ? this.files = pathCleaner(files) : this.files = null
  }

  findVersions() {
    // Single exheres.
    if (typeof(this.exheres) === 'string') {
      let pv = semver.coerce(this.exheres, '*')
      if (pv.raw == "0.0.0" && this.exheres.includes("scm")) {
        this.versions = "scm"
        this.bestVersion = "scm"
        this.bestIsValid = false
      } else {
        this.versions = pv.raw
        this.bestVersion = pv.raw
        if (semver.valid(pv.raw)) {
          this.bestIsValid = true
        } else {
          // TODO: Find a solution for invalid versions, ep-worker will not process packages
          // with mostRecentVersionIsValid = false (not a priority, ~500 packages, most of them are related to KDE or Perl).
          this.bestIsValid = false
          //console.log(`WARNING: No valid version found for ${this.category}/${this.name}.`)
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
      notValidForSort.length ? this.bestIsValid = false : this.bestIsValid = true
    }
  }
}

