import ignored from '@/ignore.json'

export const checkIfStartsWith = ({ input, pattern }: { input: string; pattern: string }) => {
  const regex = new RegExp(`^${pattern}`)
  return regex.test(input)
}

export const cleanTree = ({ gitTree }: { gitTree: string }) => {
  const { files, paths } = ignored
  const listOfIgnored = files.concat(paths)
  return gitTree
    .split('\n')
    .filter(
      (file) =>
        !listOfIgnored.some((ig) => checkIfStartsWith({ input: file, pattern: ig })) && file !== ''
    )
}
