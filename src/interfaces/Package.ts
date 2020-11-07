export interface Package {
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
  upstream: string|null
  upstreamUrl: string|null
  upstreamRegex: string|null
}
