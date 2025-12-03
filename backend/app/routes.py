import os
import logging
from flask import Blueprint, request, jsonify
from .services.geo import midpoint, geodesic_median, get_venues_from_osm, rerank_by_travel_time
from .services.ai import AIService

logger = logging.getLogger(__name__)
api = Blueprint('api', __name__)
ai_service = AIService()
#choose number of returned venues (make it configurable later)
retCount = 10
EVENTS = {}

@api.post('/events')
def create_event():
    data = request.get_json(force=True)
    title = (data.get('title') or 'Untitled').strip()
    event_id = os.urandom(6).hex()
    EVENTS[event_id] = {
        'id': event_id,
        'title': title,
        'participants': [],
        'final': False
    }
    return jsonify(EVENTS[event_id]), 201

@api.get('/events/<event_id>')
def get_event(event_id):
    if event_id not in EVENTS:
        return jsonify({'error': 'Event not found'}), 404
    return jsonify(EVENTS[event_id])

@api.post('/events/<event_id>/locations')
def add_location(event_id):
    if event_id not in EVENTS:
        return jsonify({'error': 'Event not found'}), 404
    data = request.get_json(force=True)
    name = (data.get('name') or '').strip()
    lat = float(data.get('lat'))
    lng = float(data.get('lng'))
    EVENTS[event_id]['participants'].append({'name': name, 'lat': lat, 'lng': lng})
    return jsonify({'message': 'Location added', 'count': len(EVENTS[event_id]['participants'])})

@api.post('/events/<event_id>/finalize')
def finalize(event_id):
    if event_id not in EVENTS:
        return jsonify({'error': 'Event not found'}), 404
    
    event = EVENTS[event_id]
    if len(event['participants']) < 2:
        return jsonify({'error': 'Need at least 2 participants to finalize'}), 400
    
    EVENTS[event_id]['final'] = True
    pts = [(p['lat'], p['lng']) for p in event['participants']]
    # Objective selection: 'centroid' (default) or 'median'
    objective = (request.args.get('objective') or 'centroid').lower()
    if objective == 'median':
        center = geodesic_median(pts)
    else:
        center = midpoint(pts)
    
    try:
        radius = int(request.args.get('radius') or 1500)
    except Exception:
        radius = 1500
    venues = get_venues_from_osm(center, radius_m=radius, limit=30)
    mode = (request.args.get('mode') or 'driving').lower()
    venues_time_ranked = rerank_by_travel_time(pts, venues, profile=mode)
    
    ranked = ai_service.rank_venues(event['title'], venues_time_ranked)
    
    return jsonify({
        'event': EVENTS[event_id],
        'center': center,
        'venues': ranked[:retCount]
    })
