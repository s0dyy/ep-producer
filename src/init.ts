const fs = require("fs")
const axios = require('axios');
const simpleGit = require('simple-git');
const git = simpleGit();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

import { Pkg } from "./Pkg";

async function cloneRepositories() {
  const groupsId = ['4'] 
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
        repositories.push(p.name)
      }
    }
  }
  findPathsPackages()
}

async function pullRepositories() {
  // check remote and pull if necessary
  for (const repository of repositories) {
    var diff = await git.cwd(`${process.cwd()}/repositories/${repository}`).diff("--name-only", ["--"], ["origin/master"])
    if (diff.length) {
      await git.pull(console.log)
    }
  }
  findPathsPackages()
}

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
    // initialize a new pkg object 
    const pkg = new Pkg(packagePath)
    pkg.packageRepCatName()
    pkg.packageContents()
    pkg.packageVersions()
    packages.push(pkg)
  }
  sendToPulsar(packages)
}

async function sendToPulsar(packages: Array<Pkg>) {
  console.log(packages)
  console.log(`${packages.length} packages have been processed and sent to pulsar`)
  init()
}

const repositories: Array<string> = []
function init() {
  !fs.existsSync("./repositories") ? cloneRepositories() : pullRepositories()
}

init()
