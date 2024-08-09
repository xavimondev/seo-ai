import sharp from 'sharp'
import ico from 'sharp-ico'
// ;('https://replicate.delivery/pbxt/e9KYpu64YOWPBS7IhNkh9LWihlIk9op232pVwxffIzRQ0bKjA/out-0.png')
export const transformToIco = async ({ iconUrl, path }: { iconUrl: string; path: string }) => {
  const response = await fetch(iconUrl)
  const buffer = await response.arrayBuffer()
  const result = await ico.sharpsToIco([sharp(buffer)], `${path}/favicon.ico`, {
    sizes: [32],
    resizeOptions: {}
  })
  console.log(result)
}
