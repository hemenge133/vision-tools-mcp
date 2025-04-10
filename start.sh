#!/bin/bash

# Add this at the top
LOG_FILE="/tmp/vision-tools-mcp.log"
# Clear/create log file and indicate redirection
echo "Redirecting STARTUP output to $LOG_FILE..." > $LOG_FILE
echo "-------------------------------------" >> $LOG_FILE

# Start script for Vision Tools MCP
echo "==================================="
echo "Starting Vision Tools MCP server..."
echo "==================================="

# Make sure we're in the right directory
cd "$(dirname "$0")"
echo "Working directory: $(pwd)"

# Check if node_modules exists, if not run npm install
# if [ ! -d "node_modules" ]; then
#  echo "Installing dependencies..."
#  npm install --no-audit --no-fund
# fi

# Build the project (with --force flag to ignore TypeScript errors if any remain)
# echo "Building TypeScript..."
# npx tsc --noEmitOnError false

# Create the dist directory if it doesn't exist
mkdir -p dist

# Check if the .env file exists, if not create it
if [ ! -f ".env" ]; then
  echo "Creating placeholder .env file..."
  echo "# Please replace these placeholders with your actual API keys"
  echo "ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY" > .env
  echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY" >> .env
  echo ".env file created. Please edit it with your API keys before running again." >> $LOG_FILE
  # Optionally exit here if keys are absolutely required for the script to function
  # exit 1 
fi

# Kill any existing node process on port 3050
echo "Checking for existing processes on port 3050..."
pid=$(lsof -t -i:3050 2>/dev/null)
if [ -n "$pid" ]; then
  echo "Killing process $pid on port 3050..."
  kill -9 $pid
fi

# Start the server in foreground mode
echo "Starting server on port 3050 in foreground..."
exec env PORT=3050 HOST="0.0.0.0" node -r dotenv/config dist/index.js

echo "start.sh script finished." 