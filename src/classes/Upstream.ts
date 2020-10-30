import { Package } from "../interfaces/Package";

export class Upstream {
  static findSource(pkg: Package) {
    pkg.upstreamSource = "github"
  }
}
