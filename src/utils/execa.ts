import { exec } from 'node:child_process'

export const execa = ({ cmd }: { cmd: string }): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stdout)
    })
  })
}
