const fs = require("fs")
const axios = require('axios');
const simpleGit = require('simple-git');
const git = simpleGit();
const glob = require("glob")

import { ExherboPackage } from "../src/classes/ExherboPackage"
import { Upstream } from "../src/classes/Upstream"
import { Package } from "../src/interfaces/Package"

function logToFile(packages: Package[]): void {
  // TODO: make a better logging system later
  fs.writeFile('build/ep-producer-log.json', JSON.stringify(packages, null, 2), function(err: any) {
    if(err) { console.log(err) }
  });
}

async function cloneRepositories(): Promise<void> {
  const groupsId = ['4'] 
  //const groupsId = ['2','3','4'] 
  const weirdRepositories = ["musl"]
  fs.mkdirSync("./repositories")
  // Loop on each group, get the url of each project and clone the repos.
  for (const id of groupsId) { 
    const response = await axios.get('https://gitlab.exherbo.org/api/v4/groups/' + id)
    for (const p of response.data.projects) {
      // Ignore some weird repositories, like musl...
      if (!weirdRepositories.includes(p.name)) { 
        await git.cwd(`${process.cwd()}/repositories`).clone(p.http_url_to_repo, p.name)
        console.log(`Cloning into 'repositories/${p.name}'...`)
        repositories.push(p.name)
      }
    }
  }
  findPathsPackages()
}

async function pullRepositories(): Promise<void> {
  // Check remote and pull if necessary.
  for (const repository of repositories) {
    var diff = await git.cwd(`${process.cwd()}/repositories/${repository}`).diff("--name-only", ["--"], ["origin/master"])
    if (diff.length) {
      await git.pull(console.log)
    }
  }
  findPathsPackages()
}

function findPathsPackages(): void {
  const packagesPaths = glob.sync("repositories/*/packages/*/*")
  buildObjects(packagesPaths)
}

function buildObjects(packagesPaths: Array<string>): void {
  const packages = []
  for (const packagePath of packagesPaths) {
    // Initialize a new pkg object.
    const pkg = new ExherboPackage(packagePath)
    pkg.findRepCatName()
    pkg.findFiles()
    pkg.findVersions()
    Upstream.findSource(pkg)
    packages.push(pkg)
  }
  logToFile(packages)
  sendToPulsar(packages)
}

function sendToPulsar(packages: Package[]): void {
  //console.dir(packages)
  init()
}

// Filled during the clone and used in the next loops for the pull.
const repositories: Array<string> = []

function init(): void {
  !fs.existsSync("./repositories") ? cloneRepositories() : pullRepositories()
}

init()
