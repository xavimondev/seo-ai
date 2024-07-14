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
