import path from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import sharp from 'sharp'
import ico from 'sharp-ico'

const createIconDirectory = ({ directory }: { directory: string }) => {
  const cwd = path.resolve(process.cwd())
  const favdir = `${cwd}/${directory}`
  if (!existsSync(favdir)) {
    mkdirSync(favdir, {
      recursive: true
    })
  }
}

export const generateFavicon = async ({
  iconUrl,
  path,
  isMetadata
}: {
  iconUrl: string
  path: string
  isMetadata: boolean
}) => {
  if (!isMetadata) {
    createIconDirectory({ directory: path })
  }

  const response = await fetch(iconUrl)
  const buffer = await response.arrayBuffer()
  await ico.sharpsToIco([sharp(buffer)], `${path}/favicon.ico`, {
    sizes: [32],
    resizeOptions: {}
  })
}

export const generateAppleIcon = async ({
  iconUrl,
  path,
  isMetadata
}: {
  iconUrl: string
  path: string
  isMetadata: boolean
}) => {
  if (!isMetadata) {
    createIconDirectory({ directory: path })
  }

  const response = await fetch(iconUrl)
  const buffer = await response.arrayBuffer()
  const sharpInstance = sharp(buffer)
  const resized = sharpInstance.resize(32, 32)
  await resized.toFile(`${path}/apple-icon.png`)
}
