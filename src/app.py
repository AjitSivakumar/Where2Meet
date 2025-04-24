from midpoint_finder import calculate_midpoint, find_nearby

def getMidpoint(arr):
    midpoint = calculate_midpoint(arr)
    s = find_nearby(midpoint[0], midpoint[1])
    for i in s:
        print("hi")
        print(f" - {i['name']} at ({i['lat']:.6f}, {i['lon']:.6f})")
    print(f"Midpoint: ({midpoint[0]:.6f}, {midpoint[1]:.6f})")
    return midpoint


getMidpoint([(37.7749, -122.4194), (34.0522, -118.2437), (40.7128, -74.0060)])