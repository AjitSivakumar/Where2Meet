#!/usr/bin/env python3
"""
Standalone midpoint and nearby-amenities finder using OpenStreetMap.

Usage example:
  python midpoint_finder.py \
    --addresses \
      "1600 Amphitheatre Parkway, Mountain View, CA" \
      "1 Infinite Loop, Cupertino, CA" \
    --radius 1500 \
    --amenity restaurant
"""

import requests
import math
import argparse
import sys

def geocode(address):
    """Geocode an address to (lat, lon) using Nominatim."""
    url = 'https://nominatim.openstreetmap.org/search'
    params = {'format': 'json', 'q': address}
    headers = {'User-Agent': 'midpoint-finder-script'}
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    if not data:
        raise ValueError(f"No geocode result for: {address}")
    return float(data[0]['lat']), float(data[0]['lon'])

def calculate_midpoint(coords):
    """Calculate geographic midpoint from a list of (lat, lon) tuples."""
    x = y = z = 0.0
    for lat, lon in coords:
        phi = math.radians(lat)
        lam = math.radians(lon)
        x += math.cos(phi) * math.cos(lam)
        y += math.cos(phi) * math.sin(lam)
        z += math.sin(phi)
    L = len(coords)
    x /= L; y /= L; z /= L
    hyp = math.hypot(x, y)
    return math.degrees(math.atan2(z, hyp)), math.degrees(math.atan2(y, x))

def find_nearby(lat, lon, radius=1500, amenity=None):
    """Query Overpass API for nearby amenities or anything within radius (meters)."""
    overpass_url = "https://overpass-api.de/api/interpreter"

    if amenity:
        # Search for specific amenity using node, way, and relation
        query = f"""
        [out:json][timeout:25];
        (
          node(around:{radius},{lat},{lon})["amenity"="{amenity}"];
          way(around:{radius},{lat},{lon})["amenity"="{amenity}"];
          relation(around:{radius},{lat},{lon})["amenity"="{amenity}"];
        );
        out center;
        """
    else:
        # No amenity filter — return everything
        query = f"""
        [out:json][timeout:25];
        (
          node(around:{radius},{lat},{lon});
          way(around:{radius},{lat},{lon});
          relation(around:{radius},{lat},{lon});
        );
        out center;
        """

    response = requests.post(overpass_url, data=query)
    data = response.json()
    results = []
    for el in data.get('elements', []):
        name = el.get('tags', {}).get('name')
        if not name:
            continue  # Skip unnamed stuff
        center = el.get('center', el)
        results.append({'id': el['id'], 'name': name, 'lat': center['lat'], 'lon': center['lon']})
    return results

def main():
    parser = argparse.ArgumentParser(description="Midpoint & nearby-amenities finder")
    parser.add_argument('--addresses', nargs='+', required=True,
                        help="List of addresses (wrap each in quotes)")
    parser.add_argument('--radius', type=int, default=1500,
                        help="Search radius in meters (default: 1500)")
    parser.add_argument('--amenity', default=None,
                        help="OSM amenity type to search for (default: restaurant)")
    args = parser.parse_args()

    coords = []
    print("Geocoding addresses...")
    for addr in args.addresses:
        try:
            lat, lon = geocode(addr)
            print(f"  {addr} -> ({lat:.6f}, {lon:.6f})")
            coords.append((lat, lon))
        except Exception as e:
            print(f"Error geocoding '{addr}': {e}", file=sys.stderr)
            sys.exit(1)

    print("\nCalculating geographic midpoint...")
    mid_lat, mid_lon = calculate_midpoint(coords)
    print(f"Midpoint: ({mid_lat:.6f}, {mid_lon:.6f})")

    if args.amenity:
        print(f"\nSearching for nearby '{args.amenity}' within {args.radius} meters...")
    else:
        print(f"\nSearching for any mapped locations within {args.radius} meters...")
    pois = find_nearby(mid_lat, mid_lon, args.radius, args.amenity)
    print(f"Found {len(pois)} results:\n")
    for i, poi in enumerate(pois):
        print(f" - {poi['name']} at ({poi['lat']:.6f}, {poi['lon']:.6f})")
        if i == 19:  # Pause after 20 results (0-indexed)
            input("\n⏸️ Paused after 20 results. Press Enter to continue...\n")
        
if __name__ == '__main__':
    main()
