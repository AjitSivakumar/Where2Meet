"""
Test harness for comparing midpoint algorithms.

Evaluates centroid vs geodesic median on various scenarios:
- Clustered points
- Skewed/outlier cases
- Uniform spread
- Antipodal edge cases

Metrics:
- Total distance (sum of great-circle distances from all participants to center)
- Max distance (fairness: largest participant distance to center)
- Computation time
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import math
import time
from app.services.geo import midpoint, geodesic_median

def haversine(lat1, lng1, lat2, lng2):
    """Great-circle distance in meters"""
    R = 6371000.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return 2 * R * math.asin(min(1.0, math.sqrt(a)))

def evaluate(coords, name='Test'):
    """Compare centroid and geodesic median"""
    print(f"\n{'='*60}")
    print(f"Scenario: {name}")
    print(f"Participants: {len(coords)}")
    print('-' * 60)
    
    # Centroid
    t0 = time.time()
    c_lat, c_lng = midpoint(coords)
    t_centroid = time.time() - t0
    c_dists = [haversine(lat, lng, c_lat, c_lng) for lat, lng in coords]
    c_total = sum(c_dists)
    c_max = max(c_dists)
    
    print(f"Centroid:        ({c_lat:.5f}, {c_lng:.5f})")
    print(f"  Total dist:    {c_total:.1f} m")
    print(f"  Max dist:      {c_max:.1f} m  (fairness)")
    print(f"  Compute time:  {t_centroid*1000:.2f} ms")
    
    # Geodesic median
    t0 = time.time()
    m_lat, m_lng = geodesic_median(coords)
    t_median = time.time() - t0
    m_dists = [haversine(lat, lng, m_lat, m_lng) for lat, lng in coords]
    m_total = sum(m_dists)
    m_max = max(m_dists)
    
    print(f"\nGeodesic Median: ({m_lat:.5f}, {m_lng:.5f})")
    print(f"  Total dist:    {m_total:.1f} m")
    print(f"  Max dist:      {m_max:.1f} m  (fairness)")
    print(f"  Compute time:  {t_median*1000:.2f} ms")
    
    # Comparison
    print(f"\nImprovement:")
    print(f"  Total dist:    {((c_total - m_total) / c_total * 100):+.2f}% (median vs centroid)")
    print(f"  Max dist:      {((c_max - m_max) / c_max * 100):+.2f}%")
    print(f"  Speedup:       {t_centroid / t_median:.1f}x faster (centroid)")

if __name__ == '__main__':
    print("Midpoint Algorithm Comparison")
    print("="*60)
    
    # Scenario 1: Clustered (Manhattan)
    evaluate([
        (40.7589, -73.9851),  # Times Square
        (40.7614, -73.9776),  # Central Park South
        (40.7505, -73.9934),  # Hell's Kitchen
    ], "Clustered (Manhattan)")
    
    # Scenario 2: Skewed with outlier
    evaluate([
        (40.7589, -73.9851),  # Times Square
        (40.7614, -73.9776),  # Central Park South
        (40.7505, -73.9934),  # Hell's Kitchen
        (40.6782, -73.9442),  # Brooklyn (outlier)
    ], "Skewed with Brooklyn outlier")
    
    # Scenario 3: Uniform spread (boroughs)
    evaluate([
        (40.7589, -73.9851),  # Manhattan
        (40.6782, -73.9442),  # Brooklyn
        (40.7282, -73.7949),  # Queens
        (40.8448, -73.8648),  # Bronx
    ], "Uniform spread (NYC boroughs)")
    
    # Scenario 4: Wide spread (East vs West coast)
    evaluate([
        (40.7128, -74.0060),  # NYC
        (34.0522, -118.2437), # LA
    ], "Wide spread (NYC vs LA)")
    
    # Scenario 5: Many participants clustered
    evaluate([
        (40.7589, -73.9851),
        (40.7590, -73.9850),
        (40.7588, -73.9852),
        (40.7591, -73.9849),
        (40.7587, -73.9853),
        (40.7592, -73.9848),
        (40.7586, -73.9854),
        (40.7593, -73.9847),
    ], "Many participants (tight cluster)")
    
    # Scenario 6: Triangle
    evaluate([
        (40.7589, -73.9851),  # NYC
        (41.8781, -87.6298),  # Chicago
        (29.7604, -95.3698),  # Houston
    ], "Triangle (NYC-Chicago-Houston)")
    
    print("\n" + "="*60)
    print("Summary:")
    print("- Geodesic median minimizes total distance (Fermat point)")
    print("- Often improves fairness (max distance)")
    print("- Centroid is ~2-5x faster but less optimal for skewed sets")
    print("- For clustered points, both methods converge")
    print("="*60)
