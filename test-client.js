const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Function to read an image file and convert to base64
function imageToBase64(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath);
    return imageData.toString('base64');
  } catch (error) {
    console.error(`Error reading image: ${error.message}`);
    process.exit(1);
  }
}

// Connect to the MCP server
const ws = new WebSocket('ws://localhost:3050');

ws.on('open', () => {
  console.log('Connected to Vision Tools MCP Server');
  
  // Read the test image and convert to base64
  const imagePath = path.resolve(__dirname, './test-image.jpg');
  console.log(`Reading image from: ${imagePath}`);
  
  try {
    const imageBase64 = imageToBase64(imagePath);
    console.log('Successfully read and converted image to base64');
    
    // Prepare the request to analyze the image
    const request = {
      id: 'test-request-' + Date.now(),
      method: 'analyzeImage',
      params: {
        image_base64: imageBase64,
        prompt: 'What do you see in this image? Describe it in detail.',
        model: 'claude'
      }
    };
    
    console.log('Sending analyzeImage request...');
    ws.send(JSON.stringify(request));
  } catch (error) {
    console.error(`Error processing image: ${error.message}`);
    ws.close();
  }
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Received response:');
  
  if (response.result && response.result.analysis) {
    console.log('\nImage Analysis:');
    console.log(response.result.analysis);
  } else if (response.error) {
    console.error('Error:', response.error.message);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
  
  // Close connection after receiving response
  ws.close();
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
}); 