from midpoint_finder import calculate_midpoint, find_nearby
#from wordvectorization import rank_groups
from flask import Flask, request, jsonify

app = Flask(__name__)

# Global state (this could be refactored into a better storage solution later)
locations = []
description_input = ""

@app.route('/set_description', methods=['POST'])
def set_description():
    global description_input
    data = request.get_json()
    description_input = data.get("description", "")
    return jsonify({"message": "Description set successfully", "description": description_input})

@app.route('/add_location', methods=['POST'])
def add_location():
    global locations
    data = request.get_json()
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
        "suggestions": unique_suggestions
    }

# def wordVectorization(input_text=None, groups=None):
#     if input_text is None:
#         input_text = description_input
#     if groups is None:
#         groups = groups_data

#     ranked_groups = rank_groups(input_text, groups)
#     return ranked_groups[:10]

if __name__ == '__main__':
    app.run(debug=True)
