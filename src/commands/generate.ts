import { Command } from 'commander'
import { cancel, text, spinner, multiselect, isCancel, outro } from '@clack/prompts'
import { z } from 'zod'
import { type LanguageModel } from 'ai'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import fs from 'node:fs/promises'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { existsSync, mkdirSync } from 'node:fs'
import { handleError } from '@/utils/handleError.js'
import { SEO_GENERATOR, SEO_GENERATOR_HTML } from '@/utils/seoGeneration.js'
import { logger } from '@/utils/logger.js'
import { getConf, getKey, Providers } from '@/utils/conf.js'
import {
  generateFileSummary,
  generateGlobalSEO,
  generateHTMLTags,
  generateIcons,
  generateKeyProjectFiles,
  generateProjectOverview
} from '@/utils/ai.js'
import { execa } from '@/utils/execa.js'
import { DIRECTORIES_TO_IGNORE, FILES_TO_IGNORE, OPTIONS_TAGS } from '@/constants.js'

const generateSchema = z.object({
  tags: z.array(z.string()).optional(),
  metadata: z.boolean().optional(),
  html: z.boolean().optional()
})

export const generate = new Command()
  .name('generate')
  .argument('[tags...]', 'metatag property')
  .description('Generate object metadata or HTML metatags')
  .option('-h, --html', 'generate HTML metatags', false)
  .action(async (tags, opts) => {
    const options = generateSchema.parse({ tags, ...opts })
    let seoTags = options.tags ?? []
    let isMetadata = false

    // checking if it's a nextjs project, so let's build a metadata object
    const pwd = path.resolve(process.cwd())
    const nextMjsFile = path.join(pwd, 'next.config.mjs')
    const nextJsFile = path.join(pwd, 'next.config.js')
    if ((existsSync(nextMjsFile) || existsSync(nextJsFile)) && !opts.html) {
      isMetadata = true
    }

    const lastProvider = Object.keys(getConf()).at(-1)
    if (!lastProvider) {
      logger.info(`You need to configure your provider first. Run:`)
      logger.success(`npx seo-ai config set YOUR_AI_PROVIDER=YOUR_API_KEY`)
      process.exit(0)
    }

    try {
      const optionsSelect = !isMetadata
        ? OPTIONS_TAGS
        : OPTIONS_TAGS.concat({ value: 'metadataBase', label: 'URL prefix for metadata fields' })

      if (!options.tags?.length) {
        const aditionalSeoTags = await multiselect({
          message: `Which SEO items do you want to generate for your project?`,
          options: optionsSelect,
          initialValues: ['core'],
          required: true
        })
        if (isCancel(aditionalSeoTags)) {
          cancel('Operation cancelled.')
          process.exit(0)
        }
        seoTags = aditionalSeoTags as string[]
      }

      // AI
      let PROJECT_OVERVIEW = ''
      let model: LanguageModel | undefined = undefined
      let replicateKey: string | symbol = ''

      if (seoTags.includes('icons') || seoTags.includes('core')) {
        const apiKey = getKey({ provider: lastProvider as Providers }) as string
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

        const listFiles = await fs.readdir('.')
        const isGitInitialized = listFiles.includes('.git')

        if (!isGitInitialized) {
          // It's not a git repository, so display a prompt to enter a description
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

          PROJECT_OVERVIEW = description
        } else {
          const cmdGitTree = 'git ls-tree -r HEAD --name-only'
          const gitTree = await execa({ cmd: cmdGitTree })

          // Filtering files that are not in the ignore list
          if (gitTree !== '') {
            if (seoTags.includes('icons')) {
              replicateKey = await text({
                message: 'For generating icons, enter your Replicate API Key',
                placeholder: 'r5_0398114l4312165232',
                validate(value) {
                  const descriptionLength = value.trim().length
                  if (descriptionLength === 0) return `Replicate API Key is required!`
                }
              })
              if (isCancel(replicateKey)) {
                cancel('Operation cancelled.')
                process.exit(0)
              }
            }

            const s = spinner()
            s.start('Scanning project files...')
            const files = gitTree
              .split('\n')
              .filter(
                (file) =>
                  !DIRECTORIES_TO_IGNORE.includes(file) &&
                  !FILES_TO_IGNORE.includes(file) &&
                  file !== ''
              )

            // Asking LLM to generate a list of files that are essential for the project.
            const SUGGESTED_PATHS: string[] = []
            if (files.length > 15) {
              const projectKeyFiles = await generateKeyProjectFiles({
                files: files.join('\n'),
                model
              })
              SUGGESTED_PATHS.push(...projectKeyFiles)
            } else {
              SUGGESTED_PATHS.push(...files)
            }
            await setTimeout(2000)
            s.stop('Scanning has ended')

            // Formatting the results and reading the files, then generating a summary for each file
            s.start('Generating a summary for each file...')
            const promises = SUGGESTED_PATHS.map(async (file) => {
              const cwd = path.resolve(process.cwd())
              const pathfile = path.join(cwd, file)

              const content = await fs.readFile(pathfile, { encoding: 'utf8' })
              return {
                path: file,
                content
              }
            })

            const results = await Promise.allSettled(promises)

            const listSummary = results.map(async (result) => {
              // @ts-ignore
              const { status, value } = result
              if (status === 'fulfilled' && model) {
                const { path, content } = value
                const fileSummary = await generateFileSummary({
                  filePath: path,
                  fileContents: content,
                  model
                })
                return {
                  path,
                  summary: fileSummary
                }
              }
              return null
            })
            const listSummaries = await Promise.allSettled(listSummary)

            s.stop('Summary has been generated')

            // Formatting code summary and generating project overview
            s.start('Generating project overview...')
            let codeSummary = ''
            listSummaries.forEach((result) => {
              // @ts-ignore
              const { status, value } = result
              if (status === 'fulfilled' && value) {
                const { path, summary } = value
                codeSummary += `Path: ${path}\nSummary: ${summary}\n\n`
              }
            })

            const overview = await generateProjectOverview({
              model,
              codeSummary
            })

            PROJECT_OVERVIEW = overview

            s.stop('Overview has been generated')
          } else {
            logger.warn('Your directory has no files to generate a summary for.')
            process.exit(0)
          }
        }

        if (!PROJECT_OVERVIEW) {
          logger.warn('You need to provide the description')
          process.exit(0)
        }
      }

      const s = spinner()
      s.start('Generating SEO data...')

      let SEO_METADATA = {}
      let HTML_METATAGS = ''
      for (const seoTag of seoTags) {
        const isValidTag = OPTIONS_TAGS.find((tag) => tag.value === seoTag)
        if (!isValidTag && !isMetadata) {
          logger.warn(`Invalid tag: ${seoTag}`)
          continue
        }

        if (seoTag === 'core' && model) {
          // Generate core SEO tags using AI
          if (isMetadata) {
            SEO_METADATA = await generateGlobalSEO({ description: PROJECT_OVERVIEW, model })
          } else {
            HTML_METATAGS = await generateHTMLTags({ description: PROJECT_OVERVIEW, model })
          }
        } else if (seoTag === 'icons' && model) {
          const icons = await generateIcons({
            description: PROJECT_OVERVIEW,
            metadata: isMetadata,
            model,
            apiKey: replicateKey
          })
          if (isMetadata) {
            SEO_METADATA = {
              ...SEO_METADATA,
              icons
            }
          } else {
            HTML_METATAGS = HTML_METATAGS.concat(icons as string)
          }
        } else {
          if (isMetadata) {
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
      if (isMetadata && SEO_METADATA.openGraph && SEO_METADATA.twitter) {
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

      s.stop('SEO generated!')

      if (!isMetadata) {
        logger.break()
        logger.success(`HTML metatags:`)
        logger.info(HTML_METATAGS)
        return
      }

      // It's a Next.js project, so prompt the user to enter file's path where they want to add the metadata
      const filePathEntered = await text({
        message: `Where would you like to add the metadata object?`,
        placeholder: 'src/app/layout.tsx'
        // defaultValue: 'src/app/layout.tsx'
      })
      if (isCancel(filePathEntered)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      // @ts-ignore
      const { viewport, ...metadata } = SEO_METADATA
      const metadataHasContent = Object.keys(metadata).length > 0
      const metadataObject = metadataHasContent
        ? `export const metadata: Metadata = ${JSON.stringify(metadata, null, 2)}`
        : ''
      // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
      const viewportObject = viewport
        ? `export const viewport: Viewport = ${JSON.stringify(viewport, null, 2)}`
        : ''
      const seoObject = `\n${metadataObject}\n${viewportObject}`

      if (!filePathEntered || filePathEntered.trim().length === 0) {
        outro(`Here's the metadata object:`)
        logger.success(seoObject)
      } else {
        const nextFilePath = path.join(filePathEntered)
        const dir = path.dirname(nextFilePath)
        const file = path.basename(nextFilePath)

        if (!existsSync(dir)) {
          mkdirSync(dir, {
            recursive: true
          })
        }

        await fs.appendFile(path.join(dir, file), seoObject)
        outro('Metadata object added!')
      }
    } catch (error) {
      handleError(error)
    }
  })
