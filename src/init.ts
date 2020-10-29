const fs = require("fs")
const axios = require('axios');
const simpleGit = require('simple-git');
const git = simpleGit();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const sleep = require('sleep'); 
const path = require('path');
const Pulsar = require('pulsar-client');
const glob = require("glob")
const semver = require('semver')

class Pkg {
  path: string
  repository: string
  category: string
  pn: string
  exheres!: string|Array<string>
  exlib!: string|null
  files!: Array<string>|null
  pv!: string|Array<string>
  mostRecentPv!: string

  constructor(path: string, repository: string, category: string, pn: string) {
    this.path = path
    this.repository = repository
    this.category = category
    this.pn = pn
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
    let exheres = glob.sync(`${this.path}/*.exheres-0`)
    if (exheres.length) {
      if (exheres.length < 2) {
        this.exheres = this.pathCleaner(exheres).toString()
      } else {
        this.exheres = this.pathCleaner(exheres)
      }
    }
    // check if exlib exists
    let exlib = glob.sync(`${this.path}/*.exlib`)
    exlib.length ? this.exlib = this.pathCleaner(exlib).toString(): this.exlib = null
    // and if the package has additional files
    let files = glob.sync(`${this.path}/files/**`)
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

async function cloneRepositories() {
  const groupsId = ['4'] 
  //const groupsId = ['2', '3', '4'] 
  const weirdRepositories = ["musl"]
  fs.mkdirSync("./repositories")
  // loop on each group, get the url of each project and clone the repos
  for (const id of groupsId) { 
    const response = await axios.get('https://gitlab.exherbo.org/api/v4/groups/' + id)
    for (const p of response.data.projects) {
      // ignore some weird repositories, like musl...
      if (!weirdRepositories.includes(p.name)) { 
        await git.cwd(`${process.cwd()}/repositories`).clone(p.http_url_to_repo, p.name)
        console.log(`Cloning into 'repositories/${p.name}'...`)
      }
    }
  }
  findPathsPackages()
}

//async function pullRepositories() {
  // check remote and pull if necessary
  //for (const repository of repositories) {
    //var diff = await git.cwd(`${process.cwd()}/repositories/${repository}`).diff("--name-only", ["--"], ["origin/master"])
    //if (diff.length) {
      //await git.pull(console.log)
    //}
  //}
  //findPathsPackages()
//}

async function findPathsPackages() {
  // create an array containing the path of each package
  const { stdout, stderr } = await exec('ls -d repositories/*/packages/*/*');
  if (stderr) { 
    console.log(stderr)
    process.exit() 
  }
  const packagesPaths = stdout.trim().split("\n").sort() 
  buildObjects(packagesPaths)
}

function buildObjects(packagesPaths: Array<string>) {
  const packages = []
  for (const packagePath of packagesPaths) {
    // initialize a new object with the path, the repository, the category
    // and the name of the package present in packagePath
    let segments = packagePath.split(path.sep)
    const pkg = new Pkg(packagePath, segments[1],segments[3],segments[4]);

    pkg.packageContents()
    pkg.packageVersions()

    packages.push(pkg)
  }
  sendToPulsar(packages)
}

async function sendToPulsar(packages: Array<Pkg>) {
  console.log(packages)
  console.log(`${packages.length} packages have been processed and sent to pulsar`)
  //init()
}

function init() {
  //sleep.sleep(SLEEP)
  //!fs.existsSync("./repositories") ? cloneRepositories() : pullRepositories()
  if (!fs.existsSync("./repositories")) { cloneRepositories() }
}

init()
