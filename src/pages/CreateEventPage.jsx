
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function CreateEventPage() {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const navigate = useNavigate();

  const mapContainerStyle = {
    width: '600px',
    height: '400px',
    margin: '0 auto'
  };

  const center = { lat: 40.7128, lng: -74.0060 }; // example nyc coords

  const handleMapClick = (e) => {
    setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handleCreate = () => {
    const generatedEventId = '12345'; // mock

    // going to the join page with the eventId for now
    navigate(`/join/${generatedEventId}`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Create a New Event</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <textarea
          placeholder="Event Description..."
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          style={{ width: '300px', height: '100px' }}
        />
      </div>

      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          onClick={handleMapClick}
        >
          {markerPosition && (
            <Marker position={markerPosition} />
          )}
        </GoogleMap>
      </LoadScript>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleCreate}>Create Event</button>
      </div>
    </div>
  );
}

export default CreateEventPage;
