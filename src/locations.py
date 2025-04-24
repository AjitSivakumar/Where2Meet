import requests

overpass_url = "http://overpass-api.de/api/interpreter"

def getLocationsDescriptions(midpoint):
    latitude, longitude = midpoint[0], midpoint[1]
    lat_south = latitude - 0.05
    lat_north = latitude + 0.05
    lon_west = longitude - 0.05
    lon_east = longitude + 0.05

    location_descriptions = {}

    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["amenity"~"^(restaurant|bar|college|cafe|fast_food|food_court|ice_cream|pub|library|university|casino|cinema|music_venue|nightclub|theatre|bbq|bench|lounge|marketplace|monastery|place_of_worship)$"]
      ({lat_south},{lon_west},{lat_north},{lon_east});
    );
    out body;
    """

    response = requests.post(overpass_url, data={'data': overpass_query})

    # Check for successful response
    if response.status_code != 200:
        print("Error:", response.status_code, response.text)
        return {}

    data = response.json()
    for element in data.get("elements", []):
        elementwords = ""
        tags = element.get("tags", {})
        name = tags.get("name")
        description = tags.get("description")
        amenity = tags.get("amenity")
        cuisine = tags.get("cuisine")
        opening_hours = tags.get("opening_hours")
        operator = tags.get("operator")
        brand = tags.get("brand")
        wheelchair = tags.get("wheelchair")
        internet_access = tags.get("internet_access")
        building = tags.get("building")
        
        if description: elementwords += description
        if amenity: elementwords += " " + amenity
        if cuisine: elementwords += " " + cuisine
        if opening_hours: elementwords += " " + opening_hours
        if operator: elementwords += " " + operator
        if brand: elementwords += " " + brand
        if wheelchair: elementwords += " " + wheelchair
        if internet_access: elementwords += " " + internet_access
        if building: elementwords += " " + building

        if name and description:
            lat = element.get("lat")
            lon = element.get("lon")
            if lat is not None and lon is not None:
                location_descriptions[(lat, lon, name)] = elementwords

    return location_descriptions

def main():
    results = getLocationsDescriptions([37.7749, -122.4194])
    for coords, desc in results.items():
        print(f"{coords}: {desc}")

main()
