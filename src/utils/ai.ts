import { generateObject, generateText, type LanguageModel } from 'ai'
import { z } from 'zod'
import { DEFAULT_SEO_SCHEMA } from '@/constants'
import { generateImage } from './generateImage'
import { generateAppleIcon, generateFavicon } from './saveIcons'

const SEO_TAGS = [
  'title',
  'description',
  'keywords',
  'openGraph',
  'twitter',
  'robots',
  'category',
  'applicationName',
  'generator'
]

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
  isMetadata,
  model,
  apiKey,
  appDirectory
}: {
  projectSummary: string
  isMetadata: boolean
  model: LanguageModel
  apiKey: string
  appDirectory: string
}) => {
  const projectDescription = await generateProjectDescription({
    model,
    projectSummary
  })

  const iconDefinition = await generateIconDefinition({
    prompt: projectDescription,
    model
  })

  const iconUrl = await generateImage({
    iconDefinition,
    apiKey
  })

  let faviconDirectory = 'public/seo/icons'
  let appleIconDirectory = 'public/seo/icons/apple'

  if (isMetadata) {
    faviconDirectory = appDirectory
    appleIconDirectory = appDirectory
  }

  await saveIcons({
    iconUrl,
    faviconDirectory,
    appleIconDirectory,
    isMetadata
  })

  if (!isMetadata) {
    return `<link rel="icon" href="https://example.com/seo/icons/favicon.ico" />\n<link rel="apple-touch-icon" href="https://example.com/seo/icons/apple/apple-icon.png" />\n`
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

const saveIcons = async ({
  iconUrl,
  faviconDirectory,
  appleIconDirectory,
  isMetadata
}: {
  iconUrl: string
  faviconDirectory: string
  appleIconDirectory: string
  isMetadata: boolean
}) => {
  await generateFavicon({ iconUrl, path: faviconDirectory, isMetadata })
  await generateAppleIcon({ iconUrl, path: appleIconDirectory, isMetadata })
}
