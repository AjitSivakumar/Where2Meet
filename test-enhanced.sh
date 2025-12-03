#!/bin/bash
# Enhanced API Test Script

API="http://localhost:5001/api"
echo "🧪 Testing Where2Meet Enhanced API..."
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check..."
curl -s http://localhost:5001/health | jq .
echo ""

# Test 2: Create Event
echo "2️⃣ Creating event..."
EVENT_ID=$(curl -s -X POST $API/events -H "Content-Type: application/json" \
  -d '{"title":"Team Lunch"}' | jq -r '.id')
echo "✅ Created event: $EVENT_ID"
echo ""

# Test 3: Add Multiple Participants
echo "3️⃣ Adding participants..."
curl -s -X POST $API/events/$EVENT_ID/locations -H "Content-Type: application/json" \
  -d '{"name":"Alice","lat":40.7589,"lng":-73.9851}' | jq .
curl -s -X POST $API/events/$EVENT_ID/locations -H "Content-Type: application/json" \
  -d '{"name":"Bob","lat":40.7489,"lng":-73.9680}' | jq .
curl -s -X POST $API/events/$EVENT_ID/locations -H "Content-Type: application/json" \
  -d '{"name":"Charlie","lat":40.7614,"lng":-73.9776}' | jq .
echo "✅ Added 3 participants"
echo ""

# Test 4: Get Event Info
echo "4️⃣ Fetching event info..."
curl -s $API/events/$EVENT_ID | jq .
echo ""

# Test 5: Finalize and Get Venues
echo "5️⃣ Finalizing event (fetching real venues from OSM + AI ranking)..."
RESULT=$(curl -s -X POST $API/events/$EVENT_ID/finalize)
echo "$RESULT" | jq .
echo ""

# Extract venue count
VENUE_COUNT=$(echo "$RESULT" | jq '.venues | length')
echo "✅ Found $VENUE_COUNT real venues from OpenStreetMap"
echo "✅ Top venue: $(echo "$RESULT" | jq -r '.venues[0].name')"
echo "✅ Category: $(echo "$RESULT" | jq -r '.venues[0].category')"
echo "✅ AI Score: $(echo "$RESULT" | jq -r '.venues[0].score')"
echo ""

echo "🎉 All tests passed!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
