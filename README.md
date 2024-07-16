<div align="center">
  <p>A Command-line tool that generates SEO metadata and HTML meta tags using AI models.</p>
	<a href="https://www.npmjs.com/package/seo-ai"><img src="https://img.shields.io/npm/v/seo-ai" alt="Current version"></a>
  <a href="https://img.shields.io/github/release/xavimondev/seo-ai"><img src="https://img.shields.io/github/release/xavimondev/seo-ai" alt="Release"></a>
  <a href="https://img.shields.io/github/license/xavimondev/seo-ai"><img src="https://img.shields.io/github/license/xavimondev/seo-ai" alt="License"></a>
  <a href="https://github.com/xavimondev/seo-ai/actions/workflows/main.yml/badge.svg"><img src="https://github.com/xavimondev/seo-ai/actions/workflows/main.yml/badge.svg" alt="Workflow"></a>
</div>

## Requirements

- Node >= 18
- pnpm > 8

## Setup

You can use one of the following AI providers to generate SEO data:

### OPENAI_API_KEY

- Go to the [OpenAI](https://openai.com/) and retrieve your API key from the [API settings](https://platform.openai.com/account/api-keys).
- Set the key:

```bash
npx seo-ai config set OPENAI_API_KEY=<your-key>
```

### MISTRAL_API_KEY

- Go to the [Mistral](https://www.mistral.ai/) and retrieve your API key from the [API settings](https://console.mistral.ai/api-keys/).
- Set the key:

```bash
npx seo-ai config set MISTRAL_API_KEY=<your-key>
```

### Usage

> [!NOTE]  
> When running the CLI in a Next.js project, it will create a medatata object according to the [Next.js docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata), if you still want to generate HTML meta tags, use the `--html` or `-h` option.

```sh
npx seo-ai generate 

Arguments:
[tags]       metatag property - optional

Options:
-h, --html   generate SEO in HTML meta tags

## Generating specific SEO tags or metadata
npx seo-ai generate core icons creator
```


### Available Tags
  
| Command           | Description                                                                                          |
|-------------------|------------------------------------------------------------------------------------                  |
| `core`            | Generate meta tags: `title`, `description`, `keywords`, `openGraph`, `twitter`, `robots`, `category` |
| `icons`           | Define icon meta tags. You'll be prompted for a Replicate Token. You can find it here: [Replicate](https://replicate.com/account/api-tokens)                     |
| `applicationName` | Specify the name of the web application                                                              |
| `metadataBase`    | Set the base URL for metadata relative paths                                                         |
| `authors`         | List authors of the content                                                                          |
| `creator`         | Identify the creator of the content                                                                  |
| `publisher`       | Specify the publisher of the content                                                                 |
| `classification`  | Provide the classification of the content                                                            |
| `bookmarks`       | Define bookmarks for the web application                                                             |
| `assets`          | Specify the assets related to the content                                                            |
| `archives`        | List archives related to the content                                                                 |
| `referrer`        | The referrer setting for the document                                                                |
| `alternates`      | The canonical and alternate URLs for the document                                                    |
| `formatDetection` | Indicates if devices should try to interpret various formats and make actionable links out of them   |
| `manifest`        | Specify a link to the web application's manifest file                                                |
| `verification`    | The common verification tokens for the document                                                      |
| `viewport`        | The viewport setting for the document                                                                |
| `generator`       | The generator used for the document                                                                  |

### API Keys

```sh
# Get an API key:
npx seo-ai config get mistral
# or
npx seo-ai config get openai

# Clear all keys:
npx seo-ai config clear
```

## Stack

- [tsup](https://github.com/egoist/tsup): A TypeScript-focused module bundler.
- [chalk](https://github.com/chalk/chalk): Chalk is a library for styling terminal text with color and formatting options, making console output more visually appealing and readable.
- [commander](https://github.com/tj/commander.js/): Commander is a feature-rich library for creating command-line interfaces (CLIs) in Node.js.
- [@clack/prompts](https://github.com/bombshell-dev/clack): Prompts is a library that creates elegant terminal spinners and loading indicators.
- [zod](https://github.com/colinhacks/zod): TypeScript-first schema validation with static type inference.

## Run Locally

1.Clone the seo-ai repository:

```sh
git clone https://github.com/xavimondev/seo-ai
```

2.Install the dependencies:

```bash
pnpm install
```

3.Start the development:

```bash
pnpm dev
```

## Contributors

<a href="https://github.com/xavimondev/seo-ai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=xavimondev/seo-ai" />
</a>

## License

[**MIT**](https://github.com/xavimondev/seo-ai/blob/main/LICENSE).