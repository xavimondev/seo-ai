import Conf from 'conf'

export type Providers = 'openai' | 'mistral' | 'groq'

const providers: Record<string, Providers> = {
  OPENAI_API_KEY: 'openai',
  MISTRAL_API_KEY: 'mistral',
  GROQ_API_KEY: 'groq'
}

export const getProvider = ({ keyName }: { keyName: string }) => providers[keyName]

const conf = new Conf({ projectName: 'seo-ai' })

export const setKey = ({ keyName, keyValue }: { keyName: string; keyValue: string }) => {
  conf.set(getProvider({ keyName }) as string, keyValue)
}

export const getKey = ({ provider }: { provider: Providers }) => {
  return conf.get(provider, '')
}

export const clearConf = () => {
  return conf.clear()
}

export const deleteKey = ({ provider }: { provider: Providers }) => {
  conf.delete(provider)
}

export const getConf = () => conf.store
