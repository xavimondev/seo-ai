import Conf from 'conf'

export type Providers = 'openai' | 'mistral'

const providers: Record<string, Providers> = {
  OPENAI_API_KEY: 'openai',
  MISTRAL_API_KEY: 'mistral'
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
  return conf.delete(provider)
}

export const getConf = () => conf.store
