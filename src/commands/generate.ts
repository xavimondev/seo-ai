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
import { handleError } from '@/utils/handleError'
import { SEO_GENERATOR, SEO_GENERATOR_HTML } from '@/utils/seoGeneration'
import { logger } from '@/utils/logger'
import { getConf, getKey, Providers } from '@/utils/conf'
import {
  generateHTMLTags,
  generateIcons,
  generateKeyProjectFiles,
  generateSEOMetadata
} from '@/utils/ai'
import { execa } from '@/utils/execa'
import { DIRECTORIES_TO_IGNORE, FILES_TO_IGNORE, OPTIONS_TAGS, SeoMetadata } from '@/constants'
import { Icon } from '@/types'

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
    let { isNextAppDirectory: isMetadata, appDirectory } = getNextAppDirectory({ html: opts.html })

    const lastProvider = Object.keys(getConf()).at(-1) as Providers | undefined
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
      let openaiIconKey: string | symbol = ''

      if (seoTags.includes('icons') || seoTags.includes('core')) {
        const apiKey = getKey({ provider: lastProvider }) as string
        model = await getAIProvider({ lastProvider, apiKey })
        if (!model) {
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
            if (seoTags.includes('icons') && lastProvider !== 'openai') {
              openaiIconKey = await text({
                message: 'Using DALL-E for icons, please enter your OpenAI API Key',
                placeholder: 'sk-proj-82mlo09s',
                validate(value) {
                  const descriptionLength = value.trim().length
                  if (descriptionLength === 0) return `OpenAI API Key is required!`
                }
              })
              if (isCancel(openaiIconKey)) {
                cancel('Operation cancelled.')
                process.exit(0)
              }
            }

            const suggestedPaths = await generateSuggestedPaths({ gitTree, model })
            PROJECT_OVERVIEW = await generateProjectSummary({ suggestedPaths })
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
      s.start('Generating SEO...')

      let SEO_METADATA: SeoMetadata = {}
      let HTML_METATAGS = ''

      for (const seoTag of seoTags) {
        const isValidTag = OPTIONS_TAGS.find((tag) => tag.value === seoTag)
        if (!isValidTag && !isMetadata) {
          logger.warn(`Invalid tag: ${seoTag}`)
          continue
        }

        if (seoTag === 'core' && model) {
          // Generate core SEO metdata and tags using AI
          if (isMetadata) {
            SEO_METADATA = await generateSEOMetadata({
              projectSummary: PROJECT_OVERVIEW,
              model
            })
          } else {
            HTML_METATAGS = await generateHTMLTags({ projectSummary: PROJECT_OVERVIEW, model })
          }
        } else if (seoTag === 'icons' && model) {
          const keyForIcons = openaiIconKey || (getKey({ provider: 'openai' }) as string)
          const icons = await generateIcons({
            projectSummary: PROJECT_OVERVIEW,
            isMetadata,
            model,
            apiKey: keyForIcons,
            appDirectory
          })

          if (!icons) continue

          HTML_METATAGS = HTML_METATAGS.concat(icons as string)
          // if (isMetadata && icons) {
          //   SEO_METADATA = {
          //     ...SEO_METADATA,
          //     icons: icons as Icon
          //   }
          // } else {
          //   HTML_METATAGS = HTML_METATAGS.concat(icons as string)
          // }
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

      if (isMetadata && SEO_METADATA.openGraph && SEO_METADATA.twitter) {
        SEO_METADATA = {
          ...SEO_METADATA,
          openGraph: {
            ...SEO_METADATA.openGraph,
            ...SEO_GENERATOR['images']()
          },
          twitter: {
            ...SEO_METADATA.twitter,
            ...SEO_GENERATOR['images']()
          }
        }
      }

      s.stop('SEO generated')

      if (!isMetadata) {
        logger.break()
        logger.success(`HTML metatags:`)
        logger.info(HTML_METATAGS)
        return
      }

      if (seoTags.length === 1 && seoTags.at(0) === 'icons') return

      await generateNextMetadataObject({ SEO_METADATA })
    } catch (error) {
      handleError(error)
    }
  })

// checking if it's a nextjs project, so let's build a metadata object
const getNextAppDirectory = ({ html }: { html: boolean }) => {
  const pwd = path.resolve(process.cwd())

  const nextMjsFile = path.join(pwd, 'next.config.mjs')
  const nextJsFile = path.join(pwd, 'next.config.js')
  const nextTsFile = path.join(pwd, 'next.config.ts') // next-canary
  const isNextProject = existsSync(nextMjsFile) || existsSync(nextJsFile) || existsSync(nextTsFile)

  const appPaths = [path.join('app'), path.join('src/app')]
  let appDirectory = ''
  for (const path of appPaths) {
    if (existsSync(path)) {
      appDirectory = path
      break
    }
  }

  const existsDirectory = appDirectory !== ''

  const isNextAppDirectory = isNextProject && existsDirectory && !html

  return {
    isNextAppDirectory,
    appDirectory
  }
}

const getAIProvider = async ({
  lastProvider,
  apiKey
}: {
  lastProvider: string
  apiKey: string
}) => {
  if (lastProvider === 'mistral') {
    const mistral = createMistral({
      apiKey
    })
    return mistral('mistral-large-latest')
  } else if (lastProvider === 'openai') {
    const openai = createOpenAI({
      apiKey,
      compatibility: 'strict'
    })
    return openai('gpt-4o')
  } else if (lastProvider === 'groq') {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: apiKey
    })
    return groq('llama-3.1-70b-versatile')
  }
  return
}

const generateSuggestedPaths = async ({
  gitTree,
  model
}: {
  gitTree: string
  model: LanguageModel
}) => {
  const s = spinner()
  s.start('Scanning project files...')
  const files = gitTree
    .split('\n')
    .filter(
      (file) =>
        !DIRECTORIES_TO_IGNORE.includes(file) && !FILES_TO_IGNORE.includes(file) && file !== ''
    )

  // Asking LLM to generate a list of files that are essential for the SEO.
  const SUGGESTED_PATHS: string[] = []
  if (files.length > 25) {
    const projectKeyFiles = await generateKeyProjectFiles({
      files: files.join('\n'),
      model
    })
    SUGGESTED_PATHS.push(...projectKeyFiles)
  } else {
    SUGGESTED_PATHS.push(...files)
  }
  await setTimeout(1000)
  s.stop('Scanning has ended')
  return SUGGESTED_PATHS
}

const generateProjectSummary = async ({ suggestedPaths }: { suggestedPaths: string[] }) => {
  const s = spinner()
  s.start('Generating a project summary...')

  const promises = suggestedPaths.map(async (file) => {
    const cwd = path.resolve(process.cwd())
    const pathfile = path.join(cwd, file)

    const content = await fs.readFile(pathfile, { encoding: 'utf8' })
    return {
      path: file,
      content
    }
  })

  const filesWithContent = await Promise.allSettled(promises)

  let projectSummary = ''

  filesWithContent.forEach((result) => {
    // @ts-ignore
    const { status, value } = result
    if (status === 'fulfilled') {
      const { path, content } = value
      projectSummary += `File: ${path}\n\nFile contents: ${content}\n\n`
    }
  })

  await setTimeout(1000)
  s.stop('Summary has been generated')

  return projectSummary
}

// It's a Next project, so prompt the user to enter file's path where they want to add the metadata
const generateNextMetadataObject = async ({ SEO_METADATA }: { SEO_METADATA: SeoMetadata }) => {
  const filePathEntered = await text({
    message: `Where would you like to add the metadata object?`,
    placeholder: 'src/app/layout.tsx',
    defaultValue: 'src/app/layout.tsx'
  })
  if (isCancel(filePathEntered)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

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
}
