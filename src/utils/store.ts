import { DEFAULT_AI_MODEL } from '@/constants'
import Conf from 'conf'

const conf = new Conf({ projectName: 'seo-ai' })

export const setKey = ({ keyName, keyValue }: { keyName: string; keyValue: string }) => {
  conf.set(keyName, keyValue)
}

export const getKey = () => {
  return conf.get(DEFAULT_AI_MODEL) as string
}

export const clearConf = () => {
  return conf.clear()
}

export const deleteKey = () => {
  conf.delete(DEFAULT_AI_MODEL)
}

export const getConf = () => conf.store
