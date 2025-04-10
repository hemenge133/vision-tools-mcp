#!/usr/bin/env node
// import * as WebSocket from 'ws'; // Remove WebSocket
// import * as http from 'http'; // Remove HTTP
import * as readline from 'readline'; // Add readline
import { analyzeImage } from './services/vision';
import { captureScreenshot } from './services/screenshot';
import { logInfo, logError } from './utils/logger';

// Remove server setup
// const PORT = parseInt(process.env.PORT || '3050', 10);
// const HOST = process.env.HOST || '0.0.0.0';
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Vision Tools MCP Server');
// });
// const wss = new WebSocket.Server({ server });

// Create readline interface for stdin/stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false // Important for non-TTY interaction
});

logInfo('Vision Tools MCP Server started in stdio mode.');

// Handle incoming lines from stdin
rl.on('line', async (line) => {
  logInfo(`Received line: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`); // Log truncated line
  try {
    const request = JSON.parse(line);
    logInfo(`Parsed request: ${request.method}`);

    let response;

    switch (request.method) {
      case 'analyzeImage':
        response = await handleAnalyzeImage(request);
        break;
      case 'captureScreenshot':
        response = await handleCaptureScreenshot(request);
        break;
      default:
        response = {
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        };
    }

    const responseStr = JSON.stringify(response);
    logInfo(`Sending response: ${responseStr.substring(0, 100)}${responseStr.length > 100 ? '...' : ''}`); // Log truncated response
    process.stdout.write(responseStr + '\n'); // Write response to stdout

  } catch (error) {
    logError('Error processing line:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const requestId = line.length < 100 ? line : 'truncated'; // Use line as ID if parsing failed

    // Attempt to construct a valid JSON-RPC error response
    const errorResponse = {
      jsonrpc: "2.0", // Add JSON-RPC version
      id: null, // ID might be unknown if parsing failed
      error: {
        code: -32700, // Parse error
        message: `Parse error or internal error: ${errorMessage}`
      }
    };
    try {
      // If we could parse the original request, use its ID
      const originalRequest = JSON.parse(line);
      errorResponse.id = originalRequest.id !== undefined ? originalRequest.id : null;
      errorResponse.error.code = -32603; // Internal error if parsing succeeded but processing failed
    } catch (parseError) {
      // Keep id null and code as Parse error (-32700)
    }
    const errorResponseStr = JSON.stringify(errorResponse);
    logInfo(`Sending error response: ${errorResponseStr}`);
    process.stdout.write(errorResponseStr + '\n'); // Write error response to stdout
  }
});

// Handle stdin close
rl.on('close', () => {
  logInfo('Input stream closed event received.');
  logInfo('Exiting.');
  process.exit(0);
});

// Keep the process alive - readline handles this implicitly
// We no longer need server.listen()

// Handle analyze image requests
async function handleAnalyzeImage(request: any) {
  try {
    const { image_base64, prompt, model } = request.params;
    
    if (!image_base64) {
      return {
        id: request.id,
        error: {
          code: -32602,
          message: 'Missing required parameter: image_base64'
        }
      };
    }

    const analysis = await analyzeImage(image_base64, prompt, model);
    
    return {
      id: request.id,
      result: { analysis }
    };
  } catch (error) {
    logError('Error in analyzeImage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      id: request.id,
      error: {
        code: -32603,
        message: `Error analyzing image: ${errorMessage}`
      }
    };
  }
}

// Handle screenshot capture and analysis requests
async function handleCaptureScreenshot(request: any) {
  try {
    const { prompt, model } = request.params;
    
    const { screenshot, analysis } = await captureScreenshot(prompt, model);
    
    return {
      id: request.id,
      result: {
        screenshot_base64: screenshot,
        analysis
      }
    };
  } catch (error) {
    logError('Error in captureScreenshot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      id: request.id,
      error: {
        code: -32603,
        message: `Error capturing screenshot: ${errorMessage}`
      }
    };
  }
}

// Remove server start
// server.listen(PORT, () => {
//   logInfo(`Vision Tools MCP Server started on ${HOST}:${PORT}`);
// }); 