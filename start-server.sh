#!/bin/bash

echo ""
echo "========================================"
echo "   GlucoBalance Development Server"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo ""
    echo "💡 Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js is available"
echo ""

# Start the server
echo "🚀 Starting GlucoBalance server..."
echo ""
node server.js