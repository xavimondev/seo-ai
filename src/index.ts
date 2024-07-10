import { mistral } from '@ai-sdk/mistral'
import { generateText } from 'ai'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const { text } = await generateText({
    model: mistral('open-mixtral-8x7b'),
    prompt: `Write a vegetarian lasagna recipe for 4 people.`,
    maxTokens: 150
    // messages: []
  })

  console.log(text)
}

const data = {
  title: 'SEO AI',
  description: 'Generate seo data for your website',
  version: '0.0.1',
  keywords: ['seo', 'ai', 'cli']
}

console.log(data)
main().catch(console.error)
