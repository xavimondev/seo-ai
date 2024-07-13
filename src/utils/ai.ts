import { mistral } from '@ai-sdk/mistral'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { DEFAULT_SEO_SCHEMA, SEO_TAGS } from '@/constants.js'

export const generateSEO = async ({ description }: { description: string }) => {
  const { text } = await generateText({
    model: mistral('open-mixtral-8x7b'),
    prompt: `Write a vegetarian lasagna recipe for 4 people.`,
    maxTokens: 150
    // messages: []
  })

  return text
}

export const generateGlobalSEO = async ({ description }: { description: string }) => {
  const result = await generateObject({
    model: mistral('open-mixtral-8x7b'),
    schema: z.object({ seo: DEFAULT_SEO_SCHEMA }),
    prompt: `You are a SEO expert. Analyze the project information: ${description} and generate a comprehensive, SEO-friendly metadata.`
    // maxTokens: 1024
  })

  return result.object
}

export const generateHTMLTags = async ({ description }: { description: string }) => {
  const { text } = await generateText({
    model: mistral('open-mixtral-8x7b'),
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

export const generateIconDefinition = async ({ prompt }: { prompt: string }) => {
  const { text } = await generateText({
    model: mistral('open-mixtral-8x7b'),
    prompt: `Given the following app description: ${prompt}, return a definition using only three words.`,
    maxTokens: 1024
  })

  return text
}
