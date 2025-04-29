# app.py
from midpoint_finder import calculate_midpoint
from wordvectorization import rank_groups, top_matches
from flask import Flask, request, jsonify
from flask_cors import CORS
from locations import getLocationsDescriptions

app = Flask(__name__)
CORS(app)

# per-event in-memory store
events = {}

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

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {e}", exc_info=True)
    return jsonify({"error": str(e)}), 500

def compute_optimal(loc_list, description):
    if not loc_list:
        return {"midpoint": {"lat": None, "lon": None}, "suggestions": []}
    midpoint = calculate_midpoint(loc_list)
    loc_map  = getLocationsDescriptions(midpoint)
    if not loc_map:
        return {"midpoint": {"lat": midpoint[0], "lon": midpoint[1]}, "suggestions": []}

    keys  = list(loc_map.keys())
    descs = list(loc_map.values())
    topn  = top_matches(description, descs, top_n=10)
    sugg  = [{
        "lat":   keys[i][0],
        "lon":   keys[i][1],
        "name":  keys[i][2],
        "score": float(score)
    } for i, score in topn]
    return {"midpoint": {"lat": midpoint[0], "lon": midpoint[1]}, "suggestions": sugg}


@app.route('/set_description', methods=['POST'])
def set_description():
    data = request.get_json() or {}
    eid  = data.get("event_id")
    if not eid:
        return jsonify({"error": "event_id is required"}), 400
    if eid not in events:
        events[eid] = {
            "description_input": "",
            "locations": [],
            "participants": [],
            "finalized": False
        }
    events[eid]["description_input"] = data.get("description", "")
    return jsonify({"message": "Description set", "event_id": eid})


@app.route('/add_location', methods=['POST'])
def add_location():
    data = request.get_json() or {}
    eid  = data.get("event_id")
    if not eid:
        return jsonify({"error": "event_id is required"}), 400
    if eid not in events:
        return jsonify({"error": "Event not found"}), 404

    lat = data.get("lat"); lon = data.get("lon")
    if lat is None or lon is None:
        return jsonify({"error": "lat and lon must be provided"}), 400

    events[eid]["locations"].append((float(lat), float(lon)))

    name = (data.get("name") or "").strip()
    if not events[eid]["participants"]:
        # first submit = host
        events[eid]["participants"].append({
            "name": name or "Host",
            "lat": float(lat),
            "lon": float(lon)
        })
    elif name:
        # joiner
        events[eid]["participants"].append({
            "name": name,
            "lat": float(lat),
            "lon": float(lon)
        })

    return jsonify({
        "locations":    events[eid]["locations"],
        "participants": events[eid]["participants"],
        "finalized":    events[eid]["finalized"]
    })


@app.route('/get_event/<event_id>', methods=['GET'])
def get_event(event_id):
    if event_id not in events:
        return jsonify({"error": "Event not found"}), 404

    ev      = events[event_id]
    optimal = compute_optimal(ev["locations"], ev["description_input"])
    return jsonify({
        "event_id":         event_id,
        "participants":     ev["participants"],
        "locations":        ev["locations"],
        "optimal_location": optimal,
        "finalized":        ev["finalized"]
    })


@app.route('/finalize/<event_id>', methods=['POST'])
def finalize(event_id):
    if event_id not in events:
        return jsonify({"error": "Event not found"}), 404
    events[event_id]["finalized"] = True
    return jsonify({"message": "Event finalized", "event_id": event_id})


@app.route('/reset', methods=['POST'])
def reset():
    global events
    events = {}
    return jsonify({"message": "State reset"})


@app.route('/vectorize', methods=['POST'])
def vectorize():
    data   = request.get_json() or {}
    text   = data.get("description", "")
    ranked = rank_groups(text, groups_data)[:10]
    return jsonify({
        "input": text,
        "ranked_groups": [
            {"group": g, "score": float(s)} for g, s in ranked
        ]
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
