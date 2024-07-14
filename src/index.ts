#!/usr/bin/env node
import { Command } from 'commander'
import { intro } from '@clack/prompts'
import chalk from 'chalk'
import { getPackageJson } from '@/utils/getPackageJson.js'
import { generate } from '@/commands/generate.js'
import { config } from '@/commands/config.js'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const NAME_APP = 'seo-ai'
async function main() {
  const packageInfo = getPackageJson()

  const program = new Command()
    .name(NAME_APP)
    .description('Generate SEO data for your website')
    .version(packageInfo.version || '0.0.1', '-v, --version', 'display the version number')

  intro(chalk.inverse(NAME_APP))
  program.addCommand(generate).addCommand(config)
  program.parse()
}

main().catch(console.error)
