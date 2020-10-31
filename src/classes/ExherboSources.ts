import { Package } from "../interfaces/Package";

export class ExherboSources {
  #path: string
  upstreamSource!: string|null
  upstreamUrl!: string|null

  constructor(packagePath: string) {
    this.#path = packagePath
  }

  findSource(): void {
    const grep = (options: string): boolean => {
      return true
    }

    if (grep("require.*github")) {
      //this.github()
    }
    this.upstreamSource = "github"
    this.upstreamUrl = "https://github.com/sozu-proxy/sozu"
  }
}
