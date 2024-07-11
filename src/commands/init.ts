import { setTimeout } from 'node:timers/promises'
import { Command } from 'commander'
import chalk from 'chalk'
import { cancel, outro, text, group, multiselect } from '@clack/prompts'
import { handleError } from '@/utils/handleError.js'

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
                { value: 'openGraph', label: 'Open Graph metadata', hint: 'recommended' },
                { value: 'twitter', label: 'Twitter metadata', hint: 'recommended' },
                { value: 'applicationName', label: 'Application Name' }, // from package.json
                { value: 'authors', label: 'Authors of the web page' }, // from package.json
                { value: 'generator', label: 'The generator used' },
                { value: 'creator', label: 'The creator of the document' }, // from package.json
                { value: 'publisher', label: 'The publisher of the document' }, // from package.json
                { value: 'robots', label: 'The robots setting for the document' },
                // { value: 'alternates', label: 'The canonical and alternate URLs for the document' },
                { value: 'icons', label: 'The icons for the document', hint: 'recommended' }, // using AI like Stable Diffusion -> https://replicate.com/nandycc/sdxl-app-icons and https://replicate.com/galleri5/icons
                { value: 'category', label: 'The category meta name property' },
                { value: 'themeColor', label: 'The theme color for the document' }, // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
                { value: 'colorSchema', label: 'The color scheme for the document' }
              ],
              initialValues: ['title', 'description', 'openGraph', 'twitter']
            })
        },
        {
          // On Cancel callback that wraps the group
          // So if the user cancels one of the prompts in the group this function will be called
          onCancel: ({ results }) => {
            // console.log(results)
            cancel('Operation cancelled.')
            process.exit(0)
          }
        }
      )

      outro(chalk.green('SEO generated successfully!'))

      await setTimeout(500)

      console.log(result.description, result.seoItems)
    } catch (error) {
      handleError(error)
    }
  })
