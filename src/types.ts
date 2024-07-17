export type SeoMetadataOptional = {
  icons?: Icon
  applicationName?: string
  authors?: Authors
  creator?: string
  publisher?: string
  classification?: string
  bookmarks?: string
  assets?: string
  archives?: string
  referrer?: string
  alternates?: { canonical: string }
  formatDetection?: { telephone: boolean }
  manifest?: string
  verification?: Verification
  viewport?: Viewport
  generator?: string
  metadataBase?: URL
}

export type Icon = {
  icon: string
  apple: string
}

type Authors = { name: string; url: string }

type ThemeColor = { media: string; color: string }
export type Viewport = { themeColor: ThemeColor[]; colorScheme: string }

type Verification = { google: string; yandex: string; me: string }
