import path from 'path'

export class Package {
  path: string
  repository: string
  category: string
  name: string

  constructor(packagePath: string) {
    this.path = packagePath
    let segments = this.path.split(path.sep)
    this.repository = segments[1]
    this.category = segments[3]
    this.name = segments[4]
  }
}
