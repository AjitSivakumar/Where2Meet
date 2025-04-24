import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ───── Fix Leaflet's default icon paths (CRA/Webpack) ─────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:      require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:    require('leaflet/dist/images/marker-shadow.png'),
});

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

  const center = { lat: 40.7128, lng: -74.0060 };  // NYC

  // Leaflet click handler
  const handleMapClick = (e) =>
    setMarkerPosition({ lat: e.latlng.lat, lng: e.latlng.lng });

  // A little helper to wire up the click event on the map
  function ClickHandler() {
    useMapEvent('click', handleMapClick);
    return null;
  }

  const handleCreate = () => {
    const generatedEventId = '12345'; // mock
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
          onChange={e => setEventName(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <textarea
          placeholder="Event Description..."
          value={eventDescription}
          onChange={e => setEventDescription(e.target.value)}
          style={{ width: '300px', height: '100px' }}
        />
      </div>

      <MapContainer
        style={mapContainerStyle}
        center={center}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* wire up the click-to-place-marker */}
        <ClickHandler />

        {markerPosition && (
          <Marker
            position={[markerPosition.lat, markerPosition.lng]}
          />
        )}
      </MapContainer>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleCreate}>Create Event</button>
      </div>
    </div>
  );
}

export default CreateEventPage;
