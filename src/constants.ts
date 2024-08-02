import { z } from 'zod'
import { SeoMetadataOptional } from '@/types'

export const DEFAULT_SEO_SCHEMA = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  openGraph: z
    .object({
      type: z.string(),
      url: z.string(),
      title: z.string(),
      description: z.string(),
      locale: z.string(),
      siteName: z.string()
    })
    .optional(),
  twitter: z
    .object({
      card: z.string(),
      site: z.string(),
      title: z.string(),
      description: z.string()
    })
    .optional(),
  robots: z.string().optional(),
  category: z.string().optional()
})

export type SeoMetadata = z.infer<typeof DEFAULT_SEO_SCHEMA> & SeoMetadataOptional

export const SEO_TAGS = [
  'title',
  'description',
  'keywords',
  'openGraph',
  'twitter',
  'robots',
  'category'
]

export const DIRECTORIES_TO_IGNORE = [
  'node_modules',
  '.git',
  '.github',
  'logs',
  '.dvc',
  '.pytest_cache',
  '.svn',
  '.tox',
  '.vscode',
  '.idea',
  'assets',
  'data',
  'dist',
  'docs',
  'htmlcov',
  'imgs',
  'media',
  'static',
  'tests',
  'testing',
  '__tests__',
  'tools',
  '.DS_Store',
  'examples',
  'samples',
  'output',
  'out',
  '.next',
  '.nuxt',
  'build',
  'tmp',
  '.husky',
  'release',
  '.devcontainer',
  '.changeset',
  'utils',
  '.svelte-kit'
]

// I think a regular expression is better here to catch all config files, etc.
export const FILES_TO_IGNORE = [
  '.editorconfig',
  '.gitignore',
  '.npmignore',
  '.dockerignore',
  '.env',
  '.env.example',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  '.babelrc',
  '.dvcignore',
  '.flake8',
  '.git',
  '.gitattributes',
  '.gitkeep',
  '.gitlab-ci',
  '.gitmodules',
  '.pre-commit-config.yaml',
  '.project-root',
  '.whitesource',
  'AUTHORS',
  'CHANGELOG',
  'CODE_OF_CONDUCT',
  'CONTRIBUTING',
  'LICENSE',
  'LICENSE-APACHE',
  'LICENSE_APACHE-2.0',
  'LICENSE-MIT',
  'MANIFEST',
  'README',
  'README.md',
  'appimage',
  'bundle_dmg',
  'gradlew',
  'start',
  'test_binary',
  'mkdocs.yml',
  '.markdownlint.yml',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  '.eslintignore',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintcache',
  '.nvmrc',
  '.prettierrc.js',
  '.prettierrc.json',
  '.prettierrc',
  '.prettierignore',
  'favicon',
  '__init__.py',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'jest.config.js',
  'karma.conf.js',
  'webpack.config.js',
  'rollup.config.js',
  'babel.config.js',
  'vite.config.js',
  'lerna.json',
  '.npmrc',
  'gulpfile.js',
  'Gruntfile.js',
  'vitest.config.ts',
  'turbo.json',
  'next.config.js',
  'next.config.mjs',
  'tailwind.config.ts',
  'tailwind.config.js',
  'tsup.config.ts',
  '.turbo',
  'next-env.d.ts',
  'postcss.config.js',
  'coverage',
  'nuxt.config.ts',
  'svelte.config.js',
  'vite.config.ts'
]

type OptionValue = SeoMetadataOptional & { core: string }
type OptionTag = { value: keyof OptionValue; label: string; hint?: string }

export const OPTIONS_TAGS: OptionTag[] = [
  { value: 'core', label: 'Core SEO tags', hint: 'recommended' },
  { value: 'icons', label: 'Icons', hint: 'recommended' },
  { value: 'applicationName', label: 'Application Name' },
  { value: 'authors', label: 'Authors' },
  { value: 'creator', label: 'Creator' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'classification', label: 'Classification' },
  { value: 'bookmarks', label: 'Bookmarks' },
  { value: 'assets', label: 'Assets' },
  { value: 'archives', label: 'Archives' },
  { value: 'referrer', label: 'Referrer' },
  { value: 'alternates', label: 'Canonical URL' },
  { value: 'formatDetection', label: 'Format Detection' },
  { value: 'manifest', label: 'Manifest' },
  { value: 'verification', label: 'Verification' },
  { value: 'viewport', label: 'Colors' },
  { value: 'generator', label: 'Generator used' }
]
