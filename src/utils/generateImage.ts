export const generateImage = async ({
  iconDefinition,
  apiKey
}: {
  iconDefinition: string
  apiKey: string
}) => {
  const request = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt: `beautiful icon for a ${iconDefinition} with rounded edges and solid background color that represents the concept of the app`,
      n: 1,
      size: '256x256'
    })
  })

  const response = await request.json()
  return response.data[0].url
}
