from midpoint_finder import calculate_midpoint, find_nearby
from wordvectorization import rank_groups
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global state (this could be refactored into a better storage solution later)
locations = []
description_input = ""

# Example groups data for vectorization
groups_data = [
    ["Coffee shop great for catching up with friends.", "I love meeting friends at cafes."],
    ["Had a great time with family at the park.", "Family gatherings are always fun."],
    ["Work meeting was productive and engaging.", "Team meetings can be very effective."],
    ["Had a wonderful time with friends at the beach.", "Beach outings are the best with friends."],
    ["Enjoyed a lovely dinner with family.", "Family dinners are always special."],
    ["Caught up with old friends over lunch.", "Lunch with friends is always enjoyable."],
    ["Had a fun day out with colleagues.", "Colleagues make work more enjoyable."],
    ["I can't believe how much I struggled with this.", "Learning AI takes time."]
]

@app.route('/set_description', methods=['POST'])
def set_description():
    global description_input
    data = request.get_json() or {}
    description_input = data.get("description", "")
    return jsonify({"message": "Description set successfully", "description": description_input})

@app.route('/add_location', methods=['POST'])
def add_location():
    global locations
    data = request.get_json() or {}
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "lat and lon must be provided"}), 400

    locations.append((float(lat), float(lon)))
    optimal_location = getNearby(locations)
    return jsonify({"locations": locations, "optimal_location": optimal_location})

@app.route('/reset', methods=['POST'])
def reset():
    global locations, description_input
    locations = []
    description_input = ""
    return jsonify({"message": "State reset successfully"})

@app.route('/vectorize', methods=['POST'])
def vectorize():
    data = request.get_json() or {}
    text = data.get("description", description_input)
    # Rank groups and take top 10
    ranked = rank_groups(text, groups_data)
    top10 = ranked[:10]
    # Format for JSON
    result = [
        {"group": group, "score": float(score)} for group, score in top10
    ]
    return jsonify({"input": text, "ranked_groups": result})

def getNearby(arr):
    midpoint = calculate_midpoint(arr)
    suggestions = find_nearby(midpoint[0], midpoint[1])

    # Simplify and remove duplicates
    unique_suggestions = list({place['name']: {
        'lat': place['lat'],
        'lon': place['lon'],
        'name': place['name']
    } for place in suggestions}.values())

    return {
        "midpoint": {"lat": midpoint[0], "lon": midpoint[1]},
        "suggestions": unique_suggestions[:10]  # Limit to 10 suggestions
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
