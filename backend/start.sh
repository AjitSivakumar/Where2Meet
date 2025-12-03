#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Starting backend"
.venv/bin/python wsgi.py
