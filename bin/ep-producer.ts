import fs from 'fs'
import axios from 'axios'
import simpleGit, {SimpleGit} from 'simple-git';
const git: SimpleGit = simpleGit();
import glob from 'glob'
import { PackageSources } from "../src/PackageSources"
import { Pkg } from "../src/Pkg"

function logToFile(packagesPaths: any): void {
  // TODO: make a better logging system later
  fs.writeFile('build/ep-producer-log.json', JSON.stringify(packagesPaths, null, 2), function(err: any) {
    if(err) { console.log(err) }
  });
}

async function cloneRepositories() {
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

async function pullRepositories() {
  // Check remote and pull if necessary.
  for (const repository of repositories) {
    var diff = await git.cwd(`${process.cwd()}/repositories/${repository}`).diff(["--name-only", "--", "origin/master"])
    if (diff.length) {
      await git.pull()
    }
  }
  findPathsPackages()
}

function findPathsPackages() {
  const packagesPaths = glob.sync("repositories/*/packages/*/*", { ignore: [ 
    "repositories/*/packages/*/exlibs",
    // TODO: Fix packages with multiple exlib.
    "repositories/*/packages/sys-libs/wayland",
    "repositories/*/packages/x11-drivers/nvidia-drivers",
    "repositories/*/packages/kde-frameworks/kirigami",
    "repositories/*/packages/app-office/libreoffice"
  ] })
  buildObjects(packagesPaths)
}

async function buildObjects(packagesPaths: string[]) {
  const packages = []
  for (const packagePath of packagesPaths) {
    if (!packagePath.length) {
      console.log(packagePath)
      process.exit()
    }
    // Get the contents of the package (name, version, files...).
    const pkg = new PackageSources(packagePath)
    pkg.findFiles()
    pkg.findVersions()
    await pkg.findSource()
    packages.push(pkg)
  }
  logToFile(packages)
  sendToPulsar(packages)
}

function sendToPulsar(packages: Pkg[]) {
  console.dir(packages)
  //init()
}

// Filled during the clone and used in the next loops for the pull.
const repositories: string[] = []

function init(): void {
  !fs.existsSync("./repositories") ? cloneRepositories() : pullRepositories()
}

init()
