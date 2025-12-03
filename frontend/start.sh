#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Starting frontend"
REACT_APP_API_URL=http://localhost:5001/api npm start
