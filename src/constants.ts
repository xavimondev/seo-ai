import { z } from 'zod'

export const DEFAULT_SEO_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  metadataBase: z.string().url(),
  openGraph: z.object({
    type: z.string(),
    url: z.string(),
    title: z.string(),
    description: z.string(),
    locale: z.string(),
    siteName: z.string()
    // images: z.array(
    //   z.object({
    //     url: z.string(),
    //     with: z.number()
    //     height: z.number()
    //     alt: z.string()
    //   })
    // )
  }),
  twitter: z.object({
    card: z.string(),
    site: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.string(),
    imageAlt: z.string()
  }),
  applicationName: z.string(),
  authors: z.array(z.object({ name: z.string(), url: z.string() })),
  generator: z.string(),
  creator: z.string(),
  publisher: z.string(),
  robots: z.string(), // index, follow
  icons: z.object({
    icon: z.string(),
    apple: z.string()
  }),
  category: z.string()
})
