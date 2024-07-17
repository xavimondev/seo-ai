import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { generateObject, generateText, type LanguageModel } from 'ai'
import { z } from 'zod'
import { DEFAULT_SEO_SCHEMA, SEO_TAGS } from '@/constants.js'
import { generateIcon } from '@/utils/replicate.js'
import { writeImage } from '@/utils/writeImage.js'

export const generateProjectDescription = async ({
  model,
  projectSummary
}: {
  model: LanguageModel
  projectSummary: string
}) => {
  const { text } = await generateText({
    model,
    prompt: `Craft a brief description that highlights the key functionalities, purpose, and value proposition of the project.
    While generating the project description, please reference the following codebase details:
    ${projectSummary}

    Exclude quotes, code snippets, or bullet points from your response. Avoid deep technical details and focus on the project's high-level use cases and features.
    Your response should be a maximum of 30 words.`
  })

  return text
}

export const generateHTMLTags = async ({
  projectSummary,
  model
}: {
  projectSummary: string
  model: LanguageModel
}) => {
  const description = await generateProjectDescription({
    model,
    projectSummary
  })

  const { text } = await generateText({
    model,
    prompt: `You are a SEO expert.Given the project description: "${description}".
    Generate HTML meta tags for the following fields:

    ${SEO_TAGS.join(',')}

    Include title,description,type,url,site_name,locale for openGraph, and for twitter include card,site,title,description.
    For openGraph and twitter include the meta tags images,width,height andalt.

    Return the meta tags directly without adding any extra characters like backticks, explanations, or formatting.`,
    maxTokens: 1024
  })

  return text
}

export const generateSEOMetadata = async ({
  projectSummary,
  model
}: {
  projectSummary: string
  model: LanguageModel
}) => {
  const result = await generateObject({
    model,
    schema: z.object({ seo: DEFAULT_SEO_SCHEMA }),
    prompt: `You are an SEO expert. Analyze the following codebase information to determine what the project is about and generate world-class, SEO-friendly metadata.

${projectSummary}

Your analysis should result in comprehensive SEO metadata that accurately reflect the project's purpose and enhance its search engine visibility.`
  })

  return result.object.seo
}

const generateIconDefinition = async ({
  prompt,
  model
}: {
  prompt: string
  model: LanguageModel
}) => {
  const { text } = await generateText({
    model,
    prompt: `Given the following app description: ${prompt}, return a definition using only three words.`,
    maxTokens: 1024
  })

  return text
}

export const generateIcons = async ({
  projectSummary,
  metadata,
  model,
  apiKey
}: {
  projectSummary: string
  metadata: boolean
  model: LanguageModel
  apiKey: string
}) => {
  const projectDescription = await generateProjectDescription({
    model,
    projectSummary
  })

  const iconDefinition = await generateIconDefinition({
    prompt: projectDescription,
    model
  })

  const iconUrl = await generateIcon({
    iconDefinition,
    apiKey
  })

  const response = await fetch(iconUrl)

  if (!metadata) {
    await saveIconDefaultLocation({ response })

    return `<link rel="icon" href="https://example.com/seo/icons/favicon.png" />\n<link rel="apple-touch-icon" href="https://example.com/seo/icons/favicon.png" />\n`
  }

  const appDirectory = path.join('src/app')
  if (existsSync(appDirectory)) {
    await writeImage({
      response,
      nameFile: 'favicon.png',
      pathFile: appDirectory
    })

    return null
  }

  await saveIconDefaultLocation({ response })

  return {
    icon: '/seo/icons/favicon.png',
    apple: '/seo/icons/favicon.png'
  }
}

export const generateKeyProjectFiles = async ({
  files,
  model
}: {
  files: string
  model: LanguageModel
}) => {
  const result = await generateObject({
    model,
    schema: z.object({ paths: z.array(z.string()) }),
    prompt: `You are a codebase analysis expert. Your task is to examine the provided list of directories and files, and identify the 20 most crucial files 
necessary for generating SEO meta tags.
Here is the list of directories and files:
${files}

Please ensure your selection focuses on the following meta tags: ${SEO_TAGS.join(',')}`
  })

  return result.object.paths
}

const saveIconDefaultLocation = async ({ response }: { response: Response }) => {
  const cwd = path.resolve(process.cwd())
  const seoDirectory = `public/seo/icons`
  const publicDirectory = `${cwd}/${seoDirectory}`

  if (!existsSync(publicDirectory)) {
    mkdirSync(publicDirectory, {
      recursive: true
    })
  }

  await writeImage({
    response,
    nameFile: 'favicon.png',
    pathFile: publicDirectory
  })
}
