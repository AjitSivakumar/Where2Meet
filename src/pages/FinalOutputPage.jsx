
import React from 'react';

function FinalOutputPage() {
  // in final, we will fetch the top 10 locations from the backend
    // for now, we will mock the data
  const mockLocations = [
    { name: 'Location A', lat: 40.7129, lng: -74.0061 },
    { name: 'Location B', lat: 40.7130, lng: -74.0062 },
    { name: 'Location C', lat: 40.7131, lng: -74.0063 },
    // ...
  ];

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Top 10 Possible Locations</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mockLocations.map((loc, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }}>
            {loc.name} (Lat: {loc.lat}, Lng: {loc.lng})
          </li>
        ))}
      </ul>
      <p>Thank you for using where2meet!</p>
    </div>
  );
}

export default FinalOutputPage;
