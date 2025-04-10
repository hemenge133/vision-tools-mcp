import Anthropic from '@anthropic-ai/sdk';
import { logInfo, logError } from '../utils/logger';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnthropicError {
  status?: number;
  error?: {
    type?: string;
    message?: string;
  };
  message?: string;
}

/**
 * Analyze an image using Claude Vision API
 * 
 * @param imageBase64 Base64-encoded image data
 * @param prompt User prompt for image analysis
 * @param model Model to use (default: claude)
 * @returns The analysis result text
 */
export async function analyzeImage(
  imageBase64: string, 
  prompt: string = 'What do you see in this image? Describe it in detail.', 
  model: string = 'claude'
): Promise<string> {
  try {
    logInfo('Analyzing image with Claude Vision API');
    
    // Ensure the prompt is not empty
    if (!prompt || prompt.trim() === '') {
      prompt = 'What do you see in this image? Describe it in detail.';
    }
    
    // Add base64 data URI prefix if not present
    if (!imageBase64.startsWith('data:')) {
      imageBase64 = `data:image/jpeg;base64,${imageBase64}`;
    }

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    });

    // Extract and return the analysis text
    const analysisText = response.content.filter(item => item.type === 'text')
                                    .map(item => item.text)
                                    .join('\n');
    
    logInfo('Image analysis complete');
    return analysisText;
  } catch (error) {
    logError('Error analyzing image with Claude:', error);
    
    // Handle error with proper type checking
    const err = error as AnthropicError;
    
    if (err.status === 429) {
      const errorDetails = err.error ? JSON.stringify(err.error) : '{}';
      throw new Error(`Claude API error: ${err.status} ${errorDetails}`);
    } else {
      const errorMessage = err.message || 'Unknown error';
      throw new Error(`Failed to analyze image: ${errorMessage}`);
    }
  }
} 