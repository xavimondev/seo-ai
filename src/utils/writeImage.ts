import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { type ReadableStream } from 'node:stream/web'

export const writeImage = async ({
  response,
  nameFile,
  pathFile
}: {
  response: Response
  nameFile: string
  pathFile: string
}) => {
  const body = Readable.fromWeb(response.body as ReadableStream<any>)
  const fileIconPath = path.join(pathFile, nameFile)
  await writeFile(fileIconPath, body)
}
