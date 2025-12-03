import math
import logging
import requests
from typing import List, Tuple, Dict, Optional


def _to_unit_vector(lat: float, lng: float) -> Tuple[float, float, float]:
    lat_r = math.radians(lat)
    lng_r = math.radians(lng)
    return (
        math.cos(lat_r) * math.cos(lng_r),
        math.cos(lat_r) * math.sin(lng_r),
        math.sin(lat_r),
    )

def _from_unit_vector(x: float, y: float, z: float) -> Tuple[float, float]:
    lng = math.atan2(y, x)
    hyp = math.sqrt(x * x + y * y)
    lat = math.atan2(z, hyp)
    return (math.degrees(lat), math.degrees(lng))

logger = logging.getLogger(__name__)

def midpoint(coords: List[Tuple[float, float]]) -> Tuple[float, float]:
    """Calculate geographic midpoint using 3D cartesian coordinates"""
    if not coords:
        raise ValueError('No coordinates provided')
    x = y = z = 0.0
    for lat, lng in coords:
        vx, vy, vz = _to_unit_vector(lat, lng)
        x += vx
        y += vy
        z += vz
    x /= len(coords)
    y /= len(coords)
    z /= len(coords)
    return _from_unit_vector(x, y, z)


def geodesic_median(coords: List[Tuple[float, float]], max_iter: int = 50, tol: float = 1e-6) -> Tuple[float, float]:
    """
    Approximate the point on the sphere minimizing the sum of great-circle distances
    (Fermat–Weber on the sphere) using a Weiszfeld-like iterative update.

    Simple, fast, and more fair than the plain centroid for skewed sets.
    """
    if not coords:
        raise ValueError('No coordinates provided')
    if len(coords) == 1:
        return coords[0]
    
    # Initialize at simple midpoint
    lat0, lng0 = midpoint(coords)
    x, y, z = _to_unit_vector(lat0, lng0)

    for iteration in range(max_iter):
        # Compute weighted sum of directions
        sum_weight = 0.0
        wx = wy = wz = 0.0
        
        for lat, lng in coords:
            vx, vy, vz = _to_unit_vector(lat, lng)
            dot = max(-1.0, min(1.0, x * vx + y * vy + z * vz))
            d = math.acos(dot)
            
            if d < 1e-9:
                # Current point coincides with this participant
                w = 1e9
            else:
                w = 1.0 / d
            
            wx += w * vx
            wy += w * vy
            wz += w * vz
            sum_weight += w
        
        if sum_weight < 1e-12:
            break
            
        # Normalize weighted average
        wx /= sum_weight
        wy /= sum_weight
        wz /= sum_weight
        
        # Renormalize to sphere
        norm = math.sqrt(wx * wx + wy * wy + wz * wz)
        if norm < 1e-12:
            break
        
        newx = wx / norm
        newy = wy / norm
        newz = wz / norm
        
        # Check convergence
        change = math.sqrt((newx - x) ** 2 + (newy - y) ** 2 + (newz - z) ** 2)
        x, y, z = newx, newy, newz
        
        if change < tol:
            break
    
    return _from_unit_vector(x, y, z)


def get_venues_from_osm(center: Tuple[float, float], radius_m: int = 1000, limit: int = 20) -> List[Dict]:
    """Fetch real venues from OpenStreetMap Overpass API"""
    lat, lng = center
    
    # Overpass API query for cafes, restaurants, bars, parks
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"~"^(cafe|restaurant|bar|pub|fast_food|ice_cream)$"](around:{radius_m},{lat},{lng});
      node["leisure"~"^(park|garden)$"](around:{radius_m},{lat},{lng});
    );
    out body {limit};
    """
    
    try:
        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=query,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        venues = []
        for element in data.get('elements', []):
            tags = element.get('tags', {})
            name = tags.get('name', 'Unnamed Location')
            category = tags.get('amenity') or tags.get('leisure', 'location')
            
            venues.append({
                'name': name,
                'category': category,
                'lat': element['lat'],
                'lng': element['lon'],
                'address': tags.get('addr:street', ''),
            })
        
        # Sort venues by distance to center so they're near the midpoint
        def _haversine(a_lat, a_lng, b_lat, b_lng):
            R = 6371000.0
            dlat = math.radians(b_lat - a_lat)
            dlng = math.radians(b_lng - a_lng)
            sa = math.sin(dlat / 2.0)
            sb = math.sin(dlng / 2.0)
            h = sa * sa + math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) * sb * sb
            return 2.0 * R * math.asin(min(1.0, math.sqrt(h)))

        venues.sort(key=lambda v: _haversine(lat, lng, v['lat'], v['lng']))
        logger.info(f"Found {len(venues)} venues from OSM near ({lat}, {lng}); returning nearest first")
        return venues
        
    except Exception as e:
        logger.warning(f"OSM API error: {e}, falling back to dummy venues")
        return dummy_venues(center)


def osrm_table(durations_url: str, sources: List[Tuple[float, float]], destinations: List[Tuple[float, float]]) -> Optional[List[List[float]]]:
    """
    Query OSRM table API to get travel-time matrix from sources to destinations.
    durations_url example: 'http://localhost:5000/table/v1/driving/'
    Returns durations in seconds or None on failure.
    """
    try:
        # Build coordinates string lon,lat;...
        coords = ';'.join([f"{lng},{lat}" for lat, lng in sources + destinations])
        # Sources are first n, destinations are last m
        src_idx = ','.join(str(i) for i in range(len(sources)))
        dst_idx = ','.join(str(i) for i in range(len(sources), len(sources) + len(destinations)))
        url = f"{durations_url}{coords}?sources={src_idx}&destinations={dst_idx}"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        js = r.json()
        return js.get('durations')
    except Exception as e:
        logger.warning(f"OSRM table failed: {e}")
        return None


def rerank_by_travel_time(participants: List[Tuple[float, float]], venues: List[Dict], profile: str = 'driving') -> List[Dict]:
    """
    If an OSRM server is available, compute total travel time to each venue and sort ascending.
    Fallback: return original venues.
    """
    durations_url = f"http://localhost:5000/table/v1/{profile}/"
    dests = [(v['lat'], v['lng']) for v in venues]
    matrix = osrm_table(durations_url, participants, dests)
    if not matrix:
        return venues
    totals = [sum(row) for row in matrix]  # row i: times from participant i to all venues
    # We need total per venue: sum over participants of time to venue j
    totals_per_venue = [sum(matrix[i][j] for i in range(len(participants))) for j in range(len(venues))]
    ranked_idx = sorted(range(len(venues)), key=lambda j: totals_per_venue[j])
    return [venues[j] for j in ranked_idx]


def dummy_venues(center: Tuple[float, float]) -> List[Dict]:
    """Fallback dummy venues if OSM API fails"""
    lat, lng = center
    return [
        {'name': 'Cafe Central', 'category': 'cafe', 'lat': lat + 0.001, 'lng': lng + 0.001, 'address': ''},
        {'name': 'Park Plaza', 'category': 'park', 'lat': lat - 0.001, 'lng': lng - 0.001, 'address': ''},
        {'name': 'Pizza Point', 'category': 'restaurant', 'lat': lat + 0.002, 'lng': lng - 0.001, 'address': ''},
    ]
