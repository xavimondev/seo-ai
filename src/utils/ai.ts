import { generateObject, generateText, type LanguageModel } from 'ai'
import { z } from 'zod'
import { DEFAULT_SEO_SCHEMA, SEO_TAGS } from '@/constants.js'

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

export const generateIconDefinition = async ({
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
