import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { writeFile } from 'node:fs/promises'
import { type ReadableStream } from 'node:stream/web'
import { generateObject, generateText, type LanguageModel } from 'ai'
import { z } from 'zod'
import { DEFAULT_SEO_SCHEMA, SEO_TAGS } from '@/constants.js'
import { generateIcon } from '@/utils/replicate.js'

export const generateGlobalSEO = async ({
  description,
  model
}: {
  description: string
  model: LanguageModel
}) => {
  const result = await generateObject({
    model,
    schema: z.object({ seo: DEFAULT_SEO_SCHEMA }),
    prompt: `You are a SEO expert. Analyze the project information: ${description} and generate a comprehensive, SEO-friendly metadata.`
    // maxTokens: 1024
  })

  return result.object.seo
}

export const generateHTMLTags = async ({
  description,
  model
}: {
  description: string
  model: LanguageModel
}) => {
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
  description,
  metadata,
  model,
  apiKey
}: {
  description: string
  metadata: boolean
  model: LanguageModel
  apiKey: string
}) => {
  const iconDefinition = await generateIconDefinition({
    prompt: description,
    model
  })

  const iconUrl = await generateIcon({
    iconDefinition,
    apiKey
  })

  const cwd = path.resolve(process.cwd())
  const seoDirectory = `public/seo/icons`
  const publicDirectory = `${cwd}/${seoDirectory}`

  if (!existsSync(publicDirectory)) {
    mkdirSync(publicDirectory, {
      recursive: true
    })
  }

  const response = await fetch(iconUrl)
  const body = Readable.fromWeb(response.body as ReadableStream<any>)
  const fileIconPath = path.join(publicDirectory, 'icon.png')
  await writeFile(fileIconPath, body)

  if (metadata) {
    return {
      icon: '/seo/icons/icon.png',
      apple: '/seo/icons/icon.png'
    }
  }
  return `<link rel="icon" href="https://example.com/seo/icons/icon.png" />\n<link rel="apple-touch-icon" href="https://example.com/seo/icons/icon.png" />\n`
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
    prompt: `You are a codebase analysis assistant. Please analyze the list of directories and files provided and identify the 15 most important files that are essential for understanding the core functionalities,and key features of the project.
    Here is the list of directories and files:
    ${files}`
  })

  return result.object.paths
}

export const generateFileSummary = async ({
  filePath,
  fileContents,
  model
}: {
  filePath: string
  fileContents: string
  model: LanguageModel
}) => {
  const { text } = await generateText({
    model,
    prompt: `Create a concise summary that captures the primary purpose and key features of this file.
    Emphasize the functionality and objectives of the code, avoiding technical implementation specifics. Reference the following codebase details while generating the summary:
    - File path: ${filePath}
    - File contents: ${fileContents}
    
    Additional requirements:
    - Avoid starting with 'This file', 'The file', or 'This code', etc. and don't include the file path or name in the summary.
    - Exclude quotes, code snippets, or bullet points from your response.Your response should be a maximum of 30 words.`
  })

  return text
}

export const generateProjectOverview = async ({
  model,
  codeSummary
}: {
  model: LanguageModel
  codeSummary: string
}) => {
  const { text } = await generateText({
    model,
    prompt: `Craft an overview that highlights the key functionalities, purpose, and value proposition of the project.
    While generating the project summary, please reference the following codebase details:
    ${codeSummary}

    Exclude quotes, code snippets, or bullet points from your response. Avoid deep technical details and focus on the project's high-level use cases and features.
    Your response should be a maximum of 30 words.`
  })

  return text
}
