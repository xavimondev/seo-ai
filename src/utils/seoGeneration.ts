import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { writeFile } from 'node:fs/promises'
import { type ReadableStream } from 'node:stream/web'
import { getPackageJson } from '@/utils/getPackageJson.js'
import { generateGlobalSEO, generateIconDefinition } from '@/utils/ai.js'
import { generateIcon } from '@/utils/replicate.js'

export const generateCoreSeoTags = async ({ description }: { description: string }) => {
  const seo = await generateGlobalSEO({
    description
  })

  // Generating icons
  const iconDefinition = await generateIconDefinition({
    prompt: description
  })

  const iconUrl = await generateIcon({
    iconDefinition
  })

  const cwd = path.resolve(process.cwd())
  const seoDirectory = `public/seo/icons`
  const publicDirectory = `${cwd}/${seoDirectory}`

  if (!existsSync(publicDirectory)) {
    mkdirSync(publicDirectory, {
      recursive: true
    })
  }

  const response = await fetch(iconUrl)
  const body = Readable.fromWeb(response.body as ReadableStream<any>)
  const fileIconPath = path.join(publicDirectory, 'icon.png')
  await writeFile(fileIconPath, body)
  const fileAppleIconPath = path.join(publicDirectory, 'apple-icon.png')
  await writeFile(fileAppleIconPath, body)

  const icons = {
    icon: '/seo/icons/icon.png',
    apple: '/seo/icons/apple-icon.png'
  }

  return {
    ...seo,
    icons
  }
}

export const generateApplicationName = () => {
  const packageInfo = getPackageJson()
  const applicationName = packageInfo.name ?? 'wonderful-app'

  return { applicationName }
}

export const generateMetadataBase = () => ({ metadataBase: 'https://example.com' })

export const generateAuthors = () => {
  const packageInfo = getPackageJson()
  const authors = packageInfo.author
    ? typeof packageInfo.author === 'string'
      ? { name: packageInfo.author, url: `https://github.com/${packageInfo.author}` }
      : {
          name: packageInfo.author?.name ?? '@seodev',
          url: packageInfo.author?.url ?? 'https//github.com/seodev'
        }
    : '@seodev'

  return { authors }
}

export const generateCreator = () => {
  const packageInfo = getPackageJson()
  const creator = packageInfo.author
    ? typeof packageInfo.author === 'string'
      ? packageInfo.author
      : packageInfo.author?.name ?? '@seodev'
    : '@seodev'

  return { creator }
}

export const generatePublisher = () => ({ publisher: 'seo-AI' })

export const generateClassification = () => ({ classification: 'My Classification' })

export const generateBookmarks = () => ({ bookmarks: 'https://example.com/bookmarks' })

export const generateAssets = () => ({ assets: 'https://example.com/assets' })

export const generateArchives = () => ({ archives: 'https://example.com/archives' })

export const generateReferrer = () => ({ referrer: 'origin' })

export const generateAlternates = () => ({ alternates: { canonical: 'https://example.com' } })

export const generateformatDetection = () => ({ formatDetection: { telephone: false } })

export const generateManifest = () => ({ manifest: 'https://example.com/manifest.json' })

export const generateGeneratorTag = () => ({ generator: 'AI' })

export const generateVerification = () => ({
  verification: { google: '1234567890', yandex: '1234567890', me: '1234567890' }
})

export const generateGraphImages = () => ({
  images: [
    {
      url: '/seo/banner/og.png',
      with: 1200,
      height: 675,
      alt: 'Banner AI'
    }
  ]
})

const generateColors = () => ({
  viewport: {
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
      { media: '(prefers-color-scheme: light)', color: '#ffffff' }
    ],
    colorScheme: 'dark'
  }
})

export const SEO_GENERATOR: Record<string, any> = {
  applicationName: generateApplicationName,
  authors: generateAuthors,
  creator: generateCreator,
  publisher: generatePublisher,
  generator: generateGeneratorTag,
  metadataBase: generateMetadataBase,
  classification: generateClassification,
  bookmarks: generateBookmarks,
  assets: generateAssets,
  archives: generateArchives,
  referrer: generateReferrer,
  alternates: generateAlternates,
  formatDetection: generateformatDetection,
  manifest: generateManifest,
  verification: generateVerification,
  viewport: generateColors,
  images: generateGraphImages
}
