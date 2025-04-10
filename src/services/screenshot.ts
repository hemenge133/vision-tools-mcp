import axios from 'axios';
import { logInfo, logError } from '../utils/logger';
import { analyzeImage } from './vision';

// Browser Tools MCP URL (if available)
const BROWSER_TOOLS_URL = process.env.BROWSER_TOOLS_URL || 'http://localhost:3025';

/**
 * Capture a screenshot and analyze it
 * 
 * @param prompt User prompt for image analysis
 * @param model Model to use for analysis
 * @returns Object containing the screenshot base64 data and analysis text
 */
export async function captureScreenshot(
  prompt: string = 'What do you see in this image? Describe it in detail.',
  model: string = 'claude'
): Promise<{ screenshot: string; analysis: string }> {
  try {
    logInfo('Attempting to capture screenshot');
    
    let screenshotBase64 = '';
    
    // Try to get screenshot from browser-tools-mcp if available
    try {
      const response = await axios.get(`${BROWSER_TOOLS_URL}/takeScreenshot`, { 
        timeout: 5000 
      });
      
      if (response.data?.success && response.data?.screenshotBase64) {
        screenshotBase64 = response.data.screenshotBase64;
        logInfo('Successfully captured screenshot from browser-tools-mcp');
      } else {
        throw new Error('Failed to get screenshot data from browser-tools');
      }
    } catch (browserError) {
      const errorMessage = browserError instanceof Error ? browserError.message : 'Unknown error';
      logError('Error capturing screenshot from browser-tools:', errorMessage);
      
      // Fallback method: try to use native screenshot capabilities if available
      try {
        // This is a placeholder for any native screenshot mechanism
        // In a real implementation, you might use a different approach here
        throw new Error('Native screenshot capture not implemented');
      } catch (nativeError) {
        const nativeErrorMsg = nativeError instanceof Error ? nativeError.message : 'Unknown error';
        logError('Error capturing screenshot using native method:', nativeErrorMsg);
        throw new Error('Failed to capture screenshot using any available method');
      }
    }
    
    // Analyze the captured screenshot
    const analysis = await analyzeImage(screenshotBase64, prompt, model);
    
    return {
      screenshot: screenshotBase64,
      analysis
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Screenshot capture and analysis failed:', errorMessage);
    throw new Error(`Screenshot capture failed: ${errorMessage}`);
  }
} 