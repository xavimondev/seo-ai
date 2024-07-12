import { z } from 'zod'

export const DEFAULT_SEO_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  // metadataBase: z.string().url(),
  openGraph: z.object({
    type: z.string(),
    url: z.string(),
    title: z.string(),
    description: z.string(),
    locale: z.string(),
    siteName: z.string()
  }),
  twitter: z.object({
    card: z.string(),
    site: z.string(),
    title: z.string(),
    description: z.string()
  }),
  // applicationName: z.string(),
  // authors: z.array(z.object({ name: z.string(), url: z.string() })), ✅
  // generator: z.string(),
  // creator: z.string(), ✅
  // publisher: z.string(), ✅
  robots: z.string(), // index, follow
  // icons: z.object({ ✅
  //   icon: z.string(),
  //   apple: z.string()
  // }),
  category: z.string()
})

export const SEO_ITEMS_AI = [
  'title',
  'description',
  'keywords',
  'openGraph',
  'twitter',
  'robots',
  'category'
]

export const SEO_ITEMS_WITHOUT_AI = ['applicationName', 'authors', 'creator', 'publisher', 'icons']
