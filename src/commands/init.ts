import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { writeFile } from 'node:fs/promises'
import { type ReadableStream } from 'node:stream/web'
import { Command } from 'commander'
import { cancel, outro, text, group, multiselect, spinner } from '@clack/prompts'
import chalk from 'chalk'
import { handleError } from '@/utils/handleError.js'
import { DEFAULT_SEO_SCHEMA } from '@/constants.js'
import { generateGlobalSEO, generateIconDefinition } from '@/utils/ai.js'
import { generateIcon } from '@/utils/replicate.js'

export const init = new Command()
  .name('init')
  .description('generate seo')
  .action(async () => {
    try {
      const result = await group(
        {
          description: () =>
            text({
              message: 'Enter a brief description of your project',
              placeholder: 'page to generate readmes using ai',
              validate(value) {
                const descriptionLength = value.trim().length
                if (descriptionLength === 0) return `Description is required!`
                if (descriptionLength < 10) return `Description must be at least 10 characters!`
              }
            }),
          seoItems: () =>
            multiselect({
              message: `The following SEO items are going to be generated for your project:`,
              options: [
                { value: 'title', label: 'Title', hint: 'recommended' },
                { value: 'description', label: 'Description', hint: 'recommended' },
                { value: 'keywords', label: 'Keywords', hint: 'recommended' },
                { value: 'metadataBase', label: 'URL prefix for metadata fields' },
                { value: 'openGraph', label: 'Open Graph', hint: 'recommended' },
                { value: 'twitter', label: 'Twitter', hint: 'recommended' },
                { value: 'applicationName', label: 'Application Name' }, // from package.json
                { value: 'authors', label: 'Authors of the web page' }, // from package.json
                { value: 'generator', label: 'The generator used' },
                { value: 'creator', label: 'The creator of the document' }, // from package.json
                { value: 'publisher', label: 'The publisher of the document' }, // from package.json
                { value: 'robots', label: 'The robots setting for the document' },
                { value: 'icons', label: 'The icons for the document', hint: 'recommended' },
                { value: 'category', label: 'The category meta name property' },
                { value: 'themeColor', label: 'The theme color for the document' }, // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
                { value: 'colorSchema', label: 'The color scheme for the document' }
              ],
              initialValues: ['title', 'description', 'openGraph', 'twitter']
            })
        },
        {
          onCancel: ({ results }) => {
            // console.log(results)
            cancel('Operation cancelled.')
            process.exit(0)
          }
        }
      )

      const { description, seoItems } = result

      const fieldsToInclude = seoItems.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      const seoSchema = DEFAULT_SEO_SCHEMA.pick(fieldsToInclude)

      const s = spinner()
      s.start('Generating SEO data...')

      const seo = await generateGlobalSEO({
        description,
        seoSchema
      })

      console.log(seo)

      s.stop('SEO generated 🚀!')

      if (seoItems.includes('icons')) {
        const s = spinner()
        s.start('Generating icons...')

        const iconDefinition = await generateIconDefinition({
          prompt: description
        })

        const iconUrl = await generateIcon({
          iconDefinition
        })

        console.log(iconUrl)

        const cwd = path.resolve(process.cwd())
        const publicDirectory = `${cwd}/public/seo/icons`

        if (!existsSync(publicDirectory)) {
          mkdirSync(publicDirectory, {
            recursive: true
          })
        }

        const response = await fetch(iconUrl)
        const body = Readable.fromWeb(response.body as ReadableStream<any>)
        const filePath = path.join(publicDirectory, 'icon.png')
        await writeFile(filePath, body)

        s.stop(`Icons stored in ${chalk.green('public/seo/icons')}`)
      }

      outro("You're all set!")
    } catch (error) {
      handleError(error)
    }
  })
