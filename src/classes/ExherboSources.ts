const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');


import { Contents } from "../interfaces/Contents"

export class ExherboSources {
  #path: string
  #name: string
  #exheres!: string|Array<string>
  #exlib!: string|null
  #file!: string
  upstream: null|string = null
  upstreamUrl: null|string = null 
  upstreamRegex: null|string = null

  constructor(cts: Contents) {
    this.#path = cts.path
    this.#name = cts.name
    this.#exheres = cts.exheres
    this.#exlib = cts.exlib
  }

  github(line: string) {
    this.upstream = "github"
    this.upstreamRegex = line
  }

  pecl(line: string) {
    this.upstream = "pecl"
    this.upstreamRegex = line
    this.upstreamUrl = `https://pecl.php.net/get/${this.#name}`
  }

  setFile() {
    // The file that will be used to find the source (exlib or the most recent exheres).
    if (this.#exlib == null) {
      Array.isArray(this.#exheres) ? this.#file = `${this.#exheres[0]}` : this.#file = `${this.#exheres}`
    } else {
      this.#file = `${this.#exlib}`
    }
  }

  async findSource() {
    // TODO: Make regex more complex in the future.
    let github = /require.*github/
    let pecl = /require.*pecl/

    try {
      const rl = createInterface({
        input: createReadStream(`${this.#path}/${this.#file}`),
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
