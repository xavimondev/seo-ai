import { z } from 'zod'
import { SeoMetadataOptional } from '@/types'

export const DEFAULT_SEO_SCHEMA = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  openGraph: z
    .object({
      type: z.string(),
      url: z.string(),
      title: z.string(),
      description: z.string(),
      locale: z.string(),
      siteName: z.string()
    })
    .optional(),
  twitter: z
    .object({
      card: z.string(),
      site: z.string(),
      title: z.string(),
      description: z.string()
    })
    .optional(),
  robots: z.string().optional(),
  category: z.string().optional(),
  applicationName: z.string().optional(),
  generator: z.string().optional()
})

export type SeoMetadata = z.infer<typeof DEFAULT_SEO_SCHEMA> & SeoMetadataOptional

type OptionValue = SeoMetadataOptional & { core: string }
type OptionTag = { value: keyof OptionValue; label: string; hint?: string }

export const OPTIONS_TAGS: OptionTag[] = [
  { value: 'core', label: 'Core SEO tags', hint: 'recommended' },
  { value: 'icons', label: 'Icons', hint: 'recommended' },
  { value: 'authors', label: 'Authors' },
  { value: 'creator', label: 'Creator' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'classification', label: 'Classification' },
  { value: 'bookmarks', label: 'Bookmarks' },
  { value: 'assets', label: 'Assets' },
  { value: 'archives', label: 'Archives' },
  { value: 'referrer', label: 'Referrer' },
  { value: 'alternates', label: 'Canonical URL' },
  { value: 'formatDetection', label: 'Format Detection' },
  { value: 'manifest', label: 'Manifest' },
  { value: 'verification', label: 'Verification' },
  { value: 'viewport', label: 'Colors' } // only when using nextjs
]

export const DEFAULT_AI_PROVIDER = 'openai'
export const DEFAULT_AI_MODEL = 'GPT-4o'
