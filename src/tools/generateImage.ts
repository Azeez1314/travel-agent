import type { ToolFn } from '../../types'
import { openai } from '../ai'
import { z } from 'zod'

export const generateImageToolDefinition = {
  name: 'generate_image',
  parameters: z.object({
    prompt: z.string().describe(
      'Cinematic travel photography prompt for the destination'
    ),
  }).describe('Generate a stunning destination image using DALL-E 3'),
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>

// Add detailed logging for debugging
export const generateImage: ToolFn<Args, string> = async ({ toolArgs }) => {
  try {
    console.log('Generating image with prompt:', toolArgs.prompt); // Log the input prompt

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: toolArgs.prompt,
      n: 1,
      size: '1024x1024',
    });

    console.log('OpenAI API response:', response); // Log the API response

    const url = response?.data?.[0]?.url;
    if (!url) throw new Error('Image generation failed: no URL returned');

    return url;
  } catch (err: any) {
    console.error('Error during image generation:', err); // Log the error details

    if (err?.status === 403 || err?.code === 'model_not_found') {
      console.error('Access denied to DALL-E 3 model. Please check your OpenAI project permissions.'); // Log detailed error
      return `Image generation unavailable: your OpenAI project does not have access to DALL-E 3. Please verify your project permissions or contact OpenAI support.\n\nError Details: ${err.message}`;
    }

    throw err;
  }
};
