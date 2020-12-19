import { once } from 'events'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'

import { PackageContents } from "./PackageContents"

export class PackageSources extends PackageContents {
  #file!: string
  upstream: null|string = null
  upstreamUrl: null|string = null 
  upstreamRegex: null|string = null

  github(line: string) {
    this.upstream = "github"
    this.upstreamRegex = line

    // Regex used to find if a user or a project is specified.
    let userRgx = /\user=\S*(?=\s)/
    let projectRgx = /\project=\S*(?=\s)/ 

    // Extract the contents of "project=*" or "user=*".
    var extContent = (contentRgx: RegExp): string => {
      var result = line.match(contentRgx)
      // Remove quotes if necessary.
      if (result![1].includes("'") || result![1].includes('"')) {
        return result![1].slice(1, -1)
      } else {
        return result![1]
      }
    }

    // If it's not specified, the user and the project have the name of the package.
    if (!userRgx.test(line) && !projectRgx.test(line)) {
      this.upstreamUrl = `https://github.com/${this.name}/${this.name}`
    } 
    // Check if user OR project is specified (match single, double and no quote).
    if (userRgx.test(line) && !projectRgx.test(line)) {
      let user = extContent(/user=('([^']+)'|"([^"]+)"|([^ ]+))/)
      this.upstreamUrl = `https://github.com/${user}/${this.name}`
    } else if (!userRgx.test(line) && projectRgx.test(line)) {
      let project = extContent(/project=('([^']+)'|"([^"]+)"|([^ ]+))/)
      this.upstreamUrl = `https://github.com/${this.name}/${project}`
    }
    // Check if user AND project is specified
    if (userRgx.test(line) && projectRgx.test(line)) {
      let user = extContent(/user=('([^']+)'|"([^"]+)"|([^ ]+))/)
      let project = extContent(/project=('([^']+)'|"([^"]+)"|([^ ]+))/)
      this.upstreamUrl = `https://github.com/${user}/${project}`
    }
  }

  pecl(line: string) {
    this.upstream = "pecl"
    this.upstreamRegex = line
    this.upstreamUrl = `https://pecl.php.net/get/${this.name}`
  }

  async findSource() {
    // The file that will be used to find the source (exlib or the most recent exheres).
    if (this.exlib == null) {
      Array.isArray(this.exheres) ? this.#file = `${this.exheres[0]}` : this.#file = `${this.exheres}`
    } else {
      this.#file = `${this.exlib}`
    }

    // TODO: Make regex more complex in the future.
    let github = /require.*github/
    let pecl = /require.*pecl/

    try {
      const rl = createInterface({
        input: createReadStream(`${this.path}/${this.#file}`),
      });
      // Loop on each row and test the regex.
      // TODO: stop readline if successful
      rl.on('line', (line: string) => {
        if (github.test(line)) {
          this.github(line)
        } else if (pecl.test(line)) {
          this.pecl(line)
        }
      });
      await once(rl, 'close');

    } catch (err) {
      console.error(err);
    }
  }
}
