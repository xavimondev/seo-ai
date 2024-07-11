import path from 'node:path'
import fs from 'node:fs'
import { type PackageJson } from 'type-fest'

export const getPackageJson = () => {
  const packageJsonPath = path.join('package.json')
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson
}
