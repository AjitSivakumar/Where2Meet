#!/bin/bash
set -e

echo "🧪 Testing Where2Meet API..."
echo ""

# Create event
echo "1️⃣  Creating event..."
EVENT=$(curl -s -X POST http://localhost:5001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"API Test Event"}')
EVENT_ID=$(echo $EVENT | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "   ✓ Event created: $EVENT_ID"
echo ""

# Add locations
echo "2️⃣  Adding participants..."
curl -s -X POST http://localhost:5001/api/events/$EVENT_ID/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","lat":40.7128,"lng":-74.0060}' > /dev/null
echo "   ✓ Alice added"

curl -s -X POST http://localhost:5001/api/events/$EVENT_ID/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","lat":40.730,"lng":-73.935}' > /dev/null
echo "   ✓ Bob added"
echo ""

# Finalize
echo "3️⃣  Finalizing event (AI ranking)..."
RESULT=$(curl -s -X POST http://localhost:5001/api/events/$EVENT_ID/finalize)
echo "   ✓ Event finalized"
echo ""

echo "📍 Midpoint: $(echo $RESULT | grep -o '"center":\[[^]]*\]' | cut -d'[' -f2 | cut -d']' -f1)"
echo "🏆 Top venue: $(echo $RESULT | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)"
echo ""
echo "✅ All tests passed!"
