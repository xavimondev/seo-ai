import { Command } from 'commander'
import { cancel, outro, text, spinner, multiselect, isCancel } from '@clack/prompts'
import { z } from 'zod'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { handleError } from '@/utils/handleError.js'
import { SEO_GENERATOR, SEO_GENERATOR_HTML } from '@/utils/seoGeneration.js'
import { logger } from '@/utils/logger.js'
import { getConf, getKey, Providers } from '@/utils/conf.js'
import { generateGlobalSEO, generateHTMLTags } from '@/utils/ai.js'

const generateSchema = z.object({
  tags: z.array(z.string()).optional(),
  metadata: z.boolean().optional(),
  html: z.boolean().optional()
})

export const generate = new Command()
  .name('generate')
  .argument('[tags...]', 'metatag property')
  .description('Generate object metadata or HTML metatags')
  .option('-m, --metadata', 'generate JSON metadata', false)
  .option('-h, --html', 'generate HTML metatags', false)
  .action(async (tags, opts) => {
    const options = generateSchema.parse({ tags, ...opts })
    let seoTags = options.tags

    const lastProvider = Object.keys(getConf()).at(-1)
    if (!lastProvider) {
      logger.info(`You need to configure your provider first. Run:`)
      logger.success(`npx seo-ai config set YOUR_AI_PROVIDER=YOUR_API_KEY`)
      process.exit(0)
    }

    const apiKey = getKey({ provider: lastProvider as Providers }) as string
    // AI Providers
    let model = undefined
    if (lastProvider === 'mistral') {
      const mistral = createMistral({
        apiKey
      })
      model = mistral('mistral-large-latest')
    } else if (lastProvider === 'openai') {
      const openai = createOpenAI({
        apiKey,
        compatibility: 'strict'
      })
      model = openai('gpt-3.5-turbo')
    } else {
      logger.error('Invalid provider')
      process.exit(0)
    }

    try {
      if (!options.tags?.length) {
        const aditionalSeoTags = await multiselect({
          message: `Which SEO items do you want to generate for your project?`,
          options: [
            { value: 'core', label: 'Include core SEO tags', hint: 'recommended' },
            { value: 'applicationName', label: 'Application Name' },
            { value: 'metadataBase', label: 'URL prefix for metadata fields' },
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
            { value: 'viewport', label: 'Colors' }, // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
            { value: 'generator', label: 'Generator used' }
          ],
          initialValues: ['core'],
          required: true
        })

        if (isCancel(aditionalSeoTags)) {
          cancel('Operation cancelled.')
          process.exit(0)
        }

        seoTags = aditionalSeoTags as string[]
      }

      const description = await text({
        message: 'Enter a brief description of your project',
        placeholder: 'page to generate readmes using ai',
        validate(value) {
          const descriptionLength = value.trim().length
          if (descriptionLength === 0) return `Description is required!`
          if (descriptionLength < 10) return `Description must be at least 10 characters!`
        }
      })

      if (isCancel(description)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      const s = spinner()
      s.start('Generating SEO data...')

      let SEO_METADATA = {}
      let HTML_METATAGS = ''

      if (seoTags) {
        for (const seoTag of seoTags) {
          // Generate core SEO tags using AI
          if (seoTag === 'core') {
            if (opts.metadata) {
              SEO_METADATA = await generateGlobalSEO({ description, model })
            } else {
              HTML_METATAGS = await generateHTMLTags({ description, model })
            }
          } else {
            if (opts.metadata) {
              const getTagContent = SEO_GENERATOR[seoTag]

              SEO_METADATA = {
                ...SEO_METADATA,
                ...getTagContent()
              }
            } else {
              const getTagContent = SEO_GENERATOR_HTML[seoTag]
              HTML_METATAGS = HTML_METATAGS.concat(getTagContent())
            }
          }
        }

        // @ts-ignore
        if (opts.metadata && SEO_METADATA.openGraph && SEO_METADATA.twitter) {
          // TODO: improve this, looks weird
          SEO_METADATA = {
            ...SEO_METADATA,
            openGraph: {
              // @ts-ignore
              ...SEO_METADATA.openGraph,
              ...SEO_GENERATOR['images']()
            },
            twitter: {
              // @ts-ignore
              ...SEO_METADATA.twitter,
              ...SEO_GENERATOR['images']()
            }
          }
        }
      }

      s.stop('SEO generated 🚀!')

      outro(`You're all set!`)
      logger.break()
      logger.info(opts.metadata ? JSON.stringify(SEO_METADATA, null, 2) : HTML_METATAGS)
    } catch (error) {
      handleError(error)
    }
  })
