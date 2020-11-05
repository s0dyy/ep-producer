const fs = require("fs")
const axios = require('axios');
const simpleGit = require('simple-git');
const git = simpleGit();
const glob = require("glob")

import { ExherboContents } from "../src/classes/ExherboContents"
import { ExherboSources } from "../src/classes/ExherboSources"
import { Package } from "../src/interfaces/Package"

function logToFile(packagesPaths: any): void {
  // TODO: make a better logging system later
  fs.writeFile('build/ep-producer-log.json', JSON.stringify(packagesPaths, null, 2), function(err: any) {
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
  const packagesPaths = glob.sync("repositories/*/packages/*/*", { ignore: "repositories/*/packages/*/exlibs" })
  buildObjects(packagesPaths)
}

async function buildObjects(packagesPaths: Array<string>): Promise<void> {
  const packages = []
  for (const packagePath of packagesPaths) {
    if (!packagePath.length) {
      console.log(packagePath)
      process.exit()
    }
    // Get the contents of the package (name, version, files...).
    const cts = new ExherboContents(packagePath)
    cts.findRepCatName()
    cts.findFiles()
    cts.findVersions()
    // Get the source of the package (name, url ...).
    const src = new ExherboSources(packagePath)
    await src.findSource(cts)
    // Merge and pushing to packages array
    const pkg = {...cts, ...src}
    packages.push(pkg)
  }
  logToFile(packages)
  sendToPulsar(packages)
}

function sendToPulsar(packages: Package[]): void {
  //console.dir(packages)
  //init()
}

// Filled during the clone and used in the next loops for the pull.
const repositories: Array<string> = []

function init(): void {
  !fs.existsSync("./repositories") ? cloneRepositories() : pullRepositories()
}

init()
