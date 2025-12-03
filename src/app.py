"""
Where2Meet Backend API

A Flask application that helps groups find optimal meeting locations
using geographic midpoint calculation and AI-powered venue recommendations.
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import our custom modules
from services.location_service import LocationService
from services.ai_service import AIService
from utils.event_manager import EventManager
from utils.validators import validate_event_data, validate_location_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')
app.config['DEBUG'] = app.config['ENV'] == 'development'

# Initialize services
event_manager = EventManager()
location_service = LocationService()
ai_service = AIService()

@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler"""
    logger.error(f"Unhandled exception: {e}", exc_info=True)
    return jsonify({
        "error": "Internal server error",
        "message": str(e) if app.config['DEBUG'] else "Something went wrong"
    }), 500

@app.errorhandler(400)
def handle_bad_request(e):
    """Handle bad request errors"""
    return jsonify({"error": "Bad request", "message": str(e)}), 400

@app.errorhandler(404)
def handle_not_found(e):
    """Handle not found errors"""
    return jsonify({"error": "Resource not found"}), 404

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Where2Meet API"})

# Event management endpoints
@app.route('/events', methods=['POST'])
def create_event():
    """Create a new event with description"""
    try:
        data = request.get_json() or {}
        
        # Validate input
        validation_error = validate_event_data(data)
        if validation_error:
            return jsonify({"error": validation_error}), 400
        
        event_id = data.get("event_id")
        description = data.get("description", "")
        name = data.get("name", "")
        
        # Create event
        event = event_manager.create_event(event_id, description, name)
        
        logger.info(f"Created event {event_id}")
        return jsonify({
            "message": "Event created successfully",
            "event_id": event_id,
            "event": event
        })
        
    except Exception as e:
        logger.error(f"Error creating event: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<event_id>/locations', methods=['POST'])
def add_location_to_event(event_id):
    """Add a participant location to an event"""
    try:
        data = request.get_json() or {}
        
        # Validate input
        validation_error = validate_location_data(data)
        if validation_error:
            return jsonify({"error": validation_error}), 400
        
        # Check if event exists
        if not event_manager.event_exists(event_id):
            return jsonify({"error": "Event not found"}), 404
        
        lat = float(data.get("lat"))
        lon = float(data.get("lon"))
        name = data.get("name", "").strip()
        
        # Add location to event
        event_manager.add_location(event_id, lat, lon, name)
        
        # Get updated event data
        event = event_manager.get_event(event_id)
        
        logger.info(f"Added location to event {event_id}: {name} at ({lat}, {lon})")
        return jsonify({
            "message": "Location added successfully",
            "event": event
        })
        
    except ValueError as e:
        return jsonify({"error": "Invalid coordinates"}), 400
    except Exception as e:
        logger.error(f"Error adding location to event {event_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<event_id>', methods=['GET'])
def get_event(event_id):
    """Get event details with optimal location suggestions"""
    try:
        if not event_manager.event_exists(event_id):
            return jsonify({"error": "Event not found"}), 404
        
        event = event_manager.get_event(event_id)
        
        # Calculate optimal meeting location if we have locations
        optimal_location = None
        if event["locations"]:
            try:
                # Calculate geographic midpoint
                midpoint = location_service.calculate_midpoint(event["locations"])
                
                # Get nearby venues
                venues = location_service.get_nearby_venues(midpoint)
                
                # Rank venues using AI
                suggestions = ai_service.rank_venues(event["description"], venues)
                
                optimal_location = {
                    "midpoint": {"lat": midpoint[0], "lon": midpoint[1]},
                    "suggestions": suggestions
                }
            except Exception as e:
                logger.error(f"Error calculating optimal location for event {event_id}: {e}")
                optimal_location = {
                    "midpoint": {"lat": None, "lon": None},
                    "suggestions": []
                }
        
        return jsonify({
            "event_id": event_id,
            "event": event,
            "optimal_location": optimal_location
        })
        
    except Exception as e:
        logger.error(f"Error retrieving event {event_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<event_id>/finalize', methods=['POST'])
def finalize_event(event_id):
    """Finalize an event (no more changes allowed)"""
    try:
        if not event_manager.event_exists(event_id):
            return jsonify({"error": "Event not found"}), 404
        
        event_manager.finalize_event(event_id)
        
        logger.info(f"Finalized event {event_id}")
        return jsonify({
            "message": "Event finalized successfully",
            "event_id": event_id
        })
        
    except Exception as e:
        logger.error(f"Error finalizing event {event_id}: {e}")
        return jsonify({"error": str(e)}), 500

# Admin endpoints
@app.route('/admin/reset', methods=['POST'])
def reset_all_events():
    """Reset all events (development only)"""
    if not app.config['DEBUG']:
        return jsonify({"error": "Not available in production"}), 403
    
    event_manager.reset_all()
    logger.info("Reset all events")
    return jsonify({"message": "All events reset successfully"})

@app.route('/admin/events', methods=['GET'])
def list_all_events():
    """List all events (development only)"""
    if not app.config['DEBUG']:
        return jsonify({"error": "Not available in production"}), 403
    
    events = event_manager.get_all_events()
    return jsonify({"events": events})

# AI testing endpoint
@app.route('/ai/test', methods=['POST'])
def test_ai_ranking():
    """Test AI venue ranking (development only)"""
    if not app.config['DEBUG']:
        return jsonify({"error": "Not available in production"}), 403
    
    try:
        data = request.get_json() or {}
        description = data.get("description", "")
        
        if not description:
            return jsonify({"error": "Description is required"}), 400
        
        # Use sample venues for testing
        sample_venues = [
            {"name": "Central Coffee", "description": "cozy cafe with wifi"},
            {"name": "Park Pavilion", "description": "outdoor meeting space"},
            {"name": "Library Study Room", "description": "quiet workspace"},
            {"name": "Restaurant Bar", "description": "casual dining atmosphere"}
        ]
        
        ranked_venues = ai_service.rank_venues(description, sample_venues)
        
        return jsonify({
            "input_description": description,
            "ranked_venues": ranked_venues
        })
        
    except Exception as e:
        logger.error(f"Error testing AI ranking: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Use port 5001 to avoid macOS AirPlay conflict
    app.run(
        host='0.0.0.0',
        port=port,
        debug=app.config['DEBUG']
    )
