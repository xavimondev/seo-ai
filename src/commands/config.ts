import { Command } from 'commander'
import { clearConf, deleteKey, getKey, setKey } from '@/utils/store'
import { handleError } from '@/utils/handleError'
import { logger } from '@/utils/logger'
import { DEFAULT_AI_PROVIDER } from '@/constants'

export const config = new Command()
  .name('config')
  .argument('<mode> <key=value...>')
  .description('Generate object metadata or HTML metatags')
  .action(async (args) => {
    const [mode, keyValues] = args

    try {
      if (mode === 'get') {
        if (!keyValues) {
          logger.error(`No key provided`)
          process.exit(0)
        }

        const key = getKey()

        if (!key) {
          logger.error(`No key found for ${keyValues}`)
          process.exit(0)
        }

        logger.info(`${keyValues} key: ${getKey()}`)
      } else if (mode === 'set') {
        if (!keyValues) {
          logger.error(`No key provided`)
          process.exit(0)
        }

        const [keyName, value] = keyValues.split('=')

        if (!keyName || !value) {
          logger.error(`No key provided`)
          process.exit(0)
        }

        setKey({ keyName, keyValue: value })
        logger.info(`${DEFAULT_AI_PROVIDER} key updated!`)
      } else if (mode === 'clear') {
        clearConf()
        logger.info('Configuration cleared!')
      } else if (mode === 'delete') {
        if (!keyValues) {
          logger.error(`No provider specified`)
          process.exit(0)
        }

        deleteKey()
        logger.info(`${keyValues} key deleted!`)
      }
    } catch (error) {
      handleError(error)
    }
  })
