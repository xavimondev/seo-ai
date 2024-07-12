import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { writeFile } from 'node:fs/promises'
import { type ReadableStream } from 'node:stream/web'
import { Command } from 'commander'
import { cancel, outro, text, group, spinner } from '@clack/prompts'
import { handleError } from '@/utils/handleError.js'
import { SEO_ITEMS_AI } from '@/constants.js'
import { generateGlobalSEO, generateIconDefinition } from '@/utils/ai.js'
import { generateIcon } from '@/utils/replicate.js'
import { getPackageJson } from '@/utils/getPackageJson.js'

export const generate = new Command()
  .name('generate')
  .description('Generate SEO metadata or metatags')
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

      const { description } = result

      const s = spinner()
      s.start('Generating SEO data...')

      let SEO_METADATA = undefined

      const seo = await generateGlobalSEO({
        description
      })

      // Generating icons
      const iconDefinition = await generateIconDefinition({
        prompt: description
      })

      const iconUrl = await generateIcon({
        iconDefinition
      })

      const cwd = path.resolve(process.cwd())
      const seoDirectory = `public/seo/icons`
      const publicDirectory = `${cwd}/${seoDirectory}`

      if (!existsSync(publicDirectory)) {
        mkdirSync(publicDirectory, {
          recursive: true
        })
      }

      const response = await fetch(iconUrl)
      const body = Readable.fromWeb(response.body as ReadableStream<any>)
      const fileIconPath = path.join(publicDirectory, 'icon.png')
      await writeFile(fileIconPath, body)
      const fileAppleIconPath = path.join(publicDirectory, 'apple-icon.png')
      await writeFile(fileAppleIconPath, body)

      const icons = {
        icon: '/seo/icons/icon.png',
        apple: '/seo/icons/apple-icon.png'
      }

      SEO_METADATA = {
        ...seo,
        icons
      }

      if (SEO_ITEMS_AI.includes('applicationName')) {
        const packageInfo = getPackageJson()
        const appName = packageInfo.name ?? 'wonderful-app'

        SEO_METADATA = {
          ...SEO_METADATA,
          applicationName: appName
        }
      }

      if (SEO_ITEMS_AI.includes('authors')) {
        const packageInfo = getPackageJson()
        const authors = packageInfo.author
          ? typeof packageInfo.author === 'string'
            ? { name: packageInfo.author, url: `https://github.com/${packageInfo.author}` }
            : {
                name: packageInfo.author?.name ?? '@seodev',
                url: packageInfo.author?.url ?? 'https//github.com/seodev'
              }
          : '@seodev'

        SEO_METADATA = {
          ...SEO_METADATA,
          authors
        }
      }

      if (SEO_ITEMS_AI.includes('creator')) {
        const packageInfo = getPackageJson()
        const creator = packageInfo.author
          ? typeof packageInfo.author === 'string'
            ? packageInfo.author
            : packageInfo.author?.name ?? '@seodev'
          : '@seodev'

        SEO_METADATA = {
          ...SEO_METADATA,
          creator
        }
      }

      if (SEO_ITEMS_AI.includes('publisher')) {
        SEO_METADATA = {
          ...SEO_METADATA,
          publisher: 'seo-AI'
        }
      }

      if (SEO_ITEMS_AI.includes('twitter') && SEO_METADATA) {
        const twitterGraphImage = [
          {
            url: '/seo/banner/og.png',
            with: 1200,
            height: 675,
            alt: 'Seo AI'
          }
        ]

        SEO_METADATA = {
          ...SEO_METADATA,
          twitter: {
            // @ts-ignore
            ...SEO_METADATA.twitter,
            images: twitterGraphImage
          }
        }
      }

      if (SEO_ITEMS_AI.includes('openGraph') && SEO_METADATA) {
        const graphImage = [
          {
            url: '/seo/banner/og.png',
            with: 1200,
            height: 675,
            alt: 'Seo AI'
          }
        ]

        if (SEO_METADATA) {
          SEO_METADATA = {
            ...SEO_METADATA,
            openGraph: {
              // @ts-ignore
              ...SEO_METADATA.openGraph,
              images: graphImage
            }
          }
        }
      }

      s.stop('SEO generated 🚀!')

      outro(`You're all set!`)
      console.log(SEO_METADATA)
    } catch (error) {
      handleError(error)
    }
  })
