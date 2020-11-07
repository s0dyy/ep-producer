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
