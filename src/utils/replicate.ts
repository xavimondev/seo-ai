import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

export const generateIcon = async ({ iconDefinition }: { iconDefinition: string }) => {
  const output = await replicate.run(
    'nandycc/sdxl-app-icons:5839ce85291601c6af252443a642a1cbd12eea8c83e41f27946b9212ff845dbf',
    {
      input: {
        width: 512,
        height: 512,
        prompt: `beautiful, high-quality ${iconDefinition} icon with rounded borders`,
        refine: 'no_refiner',
        scheduler: 'K_EULER',
        lora_scale: 0.6,
        // num_outputs: 1,
        guidance_scale: 7.5,
        high_noise_frac: 0.8,
        // negative_prompt: '',
        // prompt_strength: 0.8,
        num_inference_steps: 50
      }
    }
  )
  // @ts-ignore
  const imageUrl = output.at(0)

  const icon = await removeBackground({ imageUrl })
  return String(icon)
}

const removeBackground = async ({ imageUrl }: { imageUrl: string }) => {
  const output = await replicate.run(
    'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    {
      input: {
        image: imageUrl
      }
    }
  )
  return output
}
