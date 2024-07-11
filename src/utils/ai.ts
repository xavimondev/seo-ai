import { mistral } from '@ai-sdk/mistral'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'

export const generateSEO = async ({ description }: { description: string }) => {
  const { text } = await generateText({
    model: mistral('open-mixtral-8x7b'),
    prompt: `Write a vegetarian lasagna recipe for 4 people.`,
    maxTokens: 150
    // messages: []
  })

  return text
}

export const generateGlobalSEO = async ({
  description,
  seoSchema
}: {
  description: string
  seoSchema: z.ZodType<any, any> // TODO: type
}) => {
  const result = await generateObject({
    model: mistral('open-mixtral-8x7b'),
    schema: z.object({ seo: seoSchema }),
    prompt: `You are an SEO expert. Analyze the project information: ${description} and generate a comprehensive, SEO-friendly metadata.`
    // maxTokens: 1024
  })

  return result.object
}
