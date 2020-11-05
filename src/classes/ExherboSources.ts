const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');


import { Contents } from "../interfaces/Contents"

export class ExherboSources {
  #path: string
  file!: string
  upstreamSource: null|string = null
  upstreamReturnRegex: null|string = null
  upstreamUrl: null|string = null 

  constructor(packagePath: string) {
    this.#path = packagePath
  }

  github(line: string) {
    this.upstreamSource = "github"
    this.upstreamReturnRegex = line
  }

  pecl(line: string) {
    this.upstreamSource = "pecl"
    this.upstreamReturnRegex = line
  }

  setFile(cts: Contents) {
    // The file that will be used to find the source (exlib or the most recent exheres).
    if (cts.exlib == null) {
      Array.isArray(cts.exheres) ? this.file = `${cts.exheres[0]}` : this.file = `${cts.exheres}`
    } else {
      this.file = `${cts.exlib}`
    }
  }

  async findSource() {
    // TODO: Make regex more complex in the future.
    let github = /require.*github/
    let pecl = /require.*github/

    try {
      const rl = createInterface({
        input: createReadStream(`${this.#path}/${this.file}`),
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
