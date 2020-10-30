export interface Package {
  repository: string
  category: string
  name: string
  exheres: string|Array<string>
  exlib: string|null
  files: Array<string>|null
  versions: string|Array<string>
  mostRecentVersion: string
  mostRecentVersionIsValid: boolean
  upstreamSource: string
}
