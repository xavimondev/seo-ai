import { getPackageJson } from '@/utils/getPackageJson'

export const generateMetadataBase = () => ({ metadataBase: new URL('https://example.com') })

export const generateAuthors = () => {
  const packageInfo = getPackageJson()
  const authors = packageInfo.author
    ? typeof packageInfo.author === 'string'
      ? { name: packageInfo.author, url: `https://github.com/${packageInfo.author}` }
      : {
          name: packageInfo.author?.name ?? '@seodev',
          url: packageInfo.author?.url ?? 'https//github.com/seodev'
        }
    : { name: '@seodev', url: 'https://github.com/seodev' }

  return { authors }
}

export const generateAuthorsHtml = () => {
  const packageInfo = getPackageJson()
  const authors = packageInfo.author
    ? typeof packageInfo.author === 'string'
      ? { name: packageInfo.author, url: `https://github.com/${packageInfo.author}` }
      : {
          name: packageInfo.author?.name ?? '@seodev',
          url: packageInfo.author?.url ?? 'https//github.com/seodev'
        }
    : '@seodev'

  if (typeof authors === 'string') return `<meta name="author" content="${authors}" />\n`

  return `<meta name="author" content="${authors.name}" />\n<link rel="author" href="${authors.url}" />\n`
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

export const generateCreatorHtml = () => {
  const packageInfo = getPackageJson()
  const creator = packageInfo.author
    ? typeof packageInfo.author === 'string'
      ? packageInfo.author
      : packageInfo.author?.name ?? '@seodev'
    : '@seodev'

  return `<meta name="creator" content="${creator}" />\n`
}

export const generatePublisher = () => ({ publisher: 'seo-AI' })
export const generatePublisherHtml = () => `<meta name="publisher" content="seo AI" />\n`

export const generateClassification = () => ({ classification: 'My Classification' })
export const generateClassificationHtml = () =>
  `<meta name="classification" content="My Classification" />\n`

export const generateBookmarks = () => ({ bookmarks: 'https://example.com/bookmarks' })
export const generateBookmarksHtml = () =>
  `<link rel="bookmarks" href="https://example.com/bookmarks" />\n`

export const generateAssets = () => ({ assets: 'https://example.com/assets' })
export const generateAssetsHtml = () => `<link rel="assets" href="https://example.com/assets" />\n`

export const generateArchives = () => ({ archives: 'https://example.com/archives' })
export const generateArchivesHtml = () =>
  `<link rel="archives" href="https://example.com/archives" />\n`

export const generateReferrer = () => ({ referrer: 'origin' })
export const generateReferrerHtml = () => `<meta name="referrer" content="origin" />\n`

export const generateAlternates = () => ({ alternates: { canonical: 'https://example.com' } })
export const generateAlternatesHtml = () => `<link rel="canonical" href="https://example.com" />\n`

export const generateformatDetection = () => ({ formatDetection: { telephone: false } })
export const generateformatDetectionHtml = () =>
  `<meta name="format-detection" content="telephone=no" />\n`

export const generateManifest = () => ({ manifest: 'https://example.com/manifest.json' })
export const generateManifestHtml = () =>
  `<link rel="manifest" href="https://example.com/manifest.json" />\n`

export const generateVerification = () => ({
  verification: { google: '1234567890', yandex: '1234567890', me: '1234567890' }
})
export const generateVerificationHtml =
  () => `<meta name="google-site-verification" content="1234567890" />
<meta name="yandex-verification" content="1234567890" />
<meta name="me" content="@me" />\n`

export const generateGraphImages = () => ({
  images: [
    {
      url: '/seo/banner/og.png',
      width: 1200,
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
export const generateColorsHtml =
  () => `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="color-scheme" content="dark" />\n`

export const SEO_GENERATOR: Record<string, any> = {
  authors: generateAuthors,
  creator: generateCreator,
  publisher: generatePublisher,
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

export const SEO_GENERATOR_HTML: Record<string, any> = {
  authors: generateAuthorsHtml,
  creator: generateCreatorHtml,
  publisher: generatePublisherHtml,
  classification: generateClassificationHtml,
  bookmarks: generateBookmarksHtml,
  assets: generateAssetsHtml,
  archives: generateArchivesHtml,
  referrer: generateReferrerHtml,
  alternates: generateAlternatesHtml,
  formatDetection: generateformatDetectionHtml,
  manifest: generateManifestHtml,
  verification: generateVerificationHtml,
  viewport: generateColorsHtml
}
