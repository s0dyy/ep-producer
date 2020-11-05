export interface Contents {
  path: string
  repository: string
  category: string
  name: string
  exheres: string|Array<string>
  exlib: string|null
  files: Array<string>|null
  versions: string|Array<string>
  bestVersion: string
  bestIsValid: boolean
}
