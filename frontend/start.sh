#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "🌐 Starting Where2Meet frontend..."
REACT_APP_API_URL=http://localhost:5001/api npm start
