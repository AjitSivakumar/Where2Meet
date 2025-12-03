#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "🚀 Starting Where2Meet backend..."
.venv/bin/python wsgi.py
