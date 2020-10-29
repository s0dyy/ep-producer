const path = require('path');
const glob = require("glob")
const semver = require('semver')

export class Pkg {
  #path: string
  repository!: string
  category!: string
  pn!: string
  exheres!: string|Array<string>
  exlib!: string|null
  files!: Array<string>|null
  pv!: string|Array<string>
  mostRecentPv!: string

  constructor(packagePath: string) {
    this.#path = packagePath
  }

  packageRepCatName() {
    let segments = this.#path.split(path.sep)
    this.repository = segments[1]
    this.category = segments[3]
    this.pn = segments[4]
  }

  pathCleaner(paths: Array<string>): Array<string> {
    let newPaths = []
    for (let p of paths) {
      let crop = p.replace(`repositories/${this.repository}/packages/${this.category}/${this.pn}/`, '')
      newPaths.push(crop)
    } 
    return newPaths
  }

  packageContents() {
    // check if one or more exheres exists, an empty list was in the results, because glob 
    // found a folder without exheres (hasufell/packages/net-www/exlibs, old exlibs folder?)
    let exheres = glob.sync(`${this.#path}/*.exheres-0`)
    if (exheres.length) {
      if (exheres.length < 2) {
        this.exheres = this.pathCleaner(exheres).toString()
      } else {
        this.exheres = this.pathCleaner(exheres)
      }
    }
    // check if exlib exists
    let exlib = glob.sync(`${this.#path}/*.exlib`)
    exlib.length ? this.exlib = this.pathCleaner(exlib).toString(): this.exlib = null
    // and if the package has additional files
    let files = glob.sync(`${this.#path}/files/**`)
    files.length ? this.files = this.pathCleaner(files) : this.files = null
  }

  packageVersions() {
    // single exheres
    if (typeof(this.exheres) === 'string') {
      let pv = semver.coerce(this.exheres, '*')
      if (pv.raw == "0.0.0" && this.exheres.includes("scm")) {
        this.pv = "scm"
        this.mostRecentPv = "scm"
      } else {
        this.pv = pv.raw
        this.mostRecentPv = pv.raw
      }
    // multiple exheres
    } else if (typeof(this.exheres) === 'object') {
      let pv = []
      let scm = false
      let notValidForSort = []
      // loop, check scm or invalid versions
      for (const e of this.exheres) {
        var v = semver.coerce(e, '*')
        if (v.raw == "0.0.0" && e.includes("scm")) {
          scm = true
        } else if (!semver.valid(v.raw)) {
          notValidForSort.push(v.raw)
        } else {
          pv.push(v.raw)
        }
      }
      // sort first, cannot sort with invalid version or scm
      // if no version is valid, it could be a problem later to compare the upstream version
      // TODO: maybe just keep the major version and sort
      if (pv.length) { 
        semver.rsort(pv)
      } else {
        //console.log("WARNING: No valid version found.")
      }
      // push not valid and scm if exists
      if (notValidForSort.length) {
        for (const v of notValidForSort) {
          pv.push(v)
        }
      }
      if (scm) { pv.push("scm") }
      this.pv = pv
      this.mostRecentPv = pv[0]
    }
  }
}

