import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function LocationPicker({ onLocationSelect, selectedLocation }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>Your Location</Popup>
    </Marker>
  ) : null;
}

export default function App() {
  const [view, setView] = useState('landing');
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState('Coffee meetup');
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [location, setLocation] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Midpoint and OSM options
  const [objective, setObjective] = useState('centroid');
  const [mode, setMode] = useState('driving');
  const [radius, setRadius] = useState(1500);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 40.7128, lng: -74.006 })
      );
    } else {
      setLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  const createEvent = async () => {
    if (!title.trim()) return setError('Please enter an event title');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      setEvent(json);
      setView('create');
    } catch (err) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async () => {
    if (!joinId.trim()) return setError('Please enter an event ID');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/events/${joinId}`);
      if (!res.ok) throw new Error('Event not found');
      const json = await res.json();
      setEvent(json);
      setView('join');
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!location) return setError('Please select location on map');
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_URL}/events/${event.id}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat: location.lat, lng: location.lng }),
      });
      setView('waiting');
    } catch (err) {
      setError('Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const finalizeEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ objective, mode, radius: String(radius) });
      const res = await fetch(`${API_URL}/events/${event.id}/finalize?${params.toString()}`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      const json = await res.json();
      setResults(json);
      setView('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!location) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>Where2Meet</h1>
        <p>Its like when2meet but where...</p>
      </header>

      {error && <div className="error">{error}</div>}

      {view === 'landing' && (
        <div className="container">
          <div className="card">
            <h2>Create New Event (description of the place)</h2>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="input" />
            <button onClick={createEvent} disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
          <div className="divider">OR</div>
          <div className="card">
            <h2>Join Existing Event</h2>
            <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Event ID" className="input" />
            <button onClick={joinEvent} disabled={loading} className="btn btn-secondary">
              {loading ? 'Joining...' : 'Join Event'}
            </button>
          </div>
        </div>
      )}

      {(view === 'create' || view === 'join') && (
        <div className="container">
          <div className="card">
            <h2>{view === 'create' ? 'Share Event ID' : 'Add Your Location'}</h2>
            {view === 'create' && (
              <div className="event-id">
                Event ID: <code className="code-block">{event.id}</code>
                <button onClick={() => navigator.clipboard.writeText(event.id)} className="btn-small">Copy</button>
              </div>
            )}
            <p className="subtitle">Click map to select location</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" />
            <div className="map-container">
              <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onLocationSelect={setLocation} selectedLocation={location} />
              </MapContainer>
            </div>
            {location && <p className="location-info">Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
            <div className="options-row">
              <div className="option">
                <label>Midpoint Objective</label>
                <select className="input" value={objective} onChange={(e) => setObjective(e.target.value)}>
                  <option value="centroid">Centroid (fast)</option>
                  <option value="median">Geodesic Median (fair)</option>
                </select>
              </div>
              <div className="option">
                <label>OSRM Mode</label>
                <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="driving">Driving</option>
                  <option value="walking">Walking</option>
                  <option value="cycling">Cycling</option>
                </select>
              </div>
              <div className="option">
                <label>Search Radius (m)</label>
                <input className="input" type="number" min="200" max="5000" step="100" value={radius} onChange={(e) => setRadius(parseInt(e.target.value || '1500', 10))} />
              </div>
            </div>
            <button onClick={addLocation} disabled={loading} className="btn btn-primary">
              {loading ? 'Adding...' : 'Add My Location'}
            </button>
          </div>
        </div>
      )}

      {view === 'waiting' && (
        <div className="container">
          <div className="card">
            <h2>Location Added!</h2>
            <p>Waiting for participants...</p>
            <div className="event-id"><strong>Event ID:</strong> <code className="code-block">{event.id}</code></div>
            <div className="options-row">
              <div className="option">
                <label>Midpoint Objective</label>
                <select className="input" value={objective} onChange={(e) => setObjective(e.target.value)}>
                  <option value="centroid">Centroid (fast)</option>
                  <option value="median">Geodesic Median (fair)</option>
                </select>
              </div>
              <div className="option">
                <label>OSRM Mode</label>
                <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="driving">Driving</option>
                  <option value="walking">Walking</option>
                  <option value="cycling">Cycling</option>
                </select>
              </div>
              <div className="option">
                <label>Search Radius (m)</label>
                <input className="input" type="number" min="200" max="5000" step="100" value={radius} onChange={(e) => setRadius(parseInt(e.target.value || '1500', 10))} />
              </div>
            </div>
            <button onClick={finalizeEvent} disabled={loading} className="btn btn-primary">
              {loading ? 'Finding venues...' : 'Finalize & Find Venues'}
            </button>
            <button onClick={() => setView('landing')} className="btn btn-secondary">Back</button>
          </div>
        </div>
      )}

      {view === 'results' && results && (
        <div className="container">
          <div className="card">
            <h2>Recommended Meeting Spots</h2>
            <div className="map-container">
              <MapContainer center={[results.center[0], results.center[1]]} zoom={14} style={{ height: '400px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={results.center}><Popup>Midpoint</Popup></Marker>
                {results.event.participants.map((p, i) => (
                  <Marker key={i} position={[p.lat, p.lng]}><Popup>{p.name}</Popup></Marker>
                ))}
                {results.venues.map((v, i) => (
                  <Marker key={`v${i}`} position={[v.lat, v.lng]}>
                    <Popup><strong>{v.name}</strong><br/>{v.category}<br/>Score: {(v.score * 100).toFixed(1)}%</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <div className="venues-list">
              {results.venues.slice(0, 5).map((venue, i) => (
                <div key={i} className="venue-card">
                  <div className="venue-rank">{i + 1}</div>
                  <div className="venue-info">
                    <h3>{venue.name}</h3>
                    <p className="venue-category">{venue.category}</p>
                    {venue.address && <p className="venue-address">{venue.address}</p>}
                    <p className="venue-score">Match: {(venue.score * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setView('landing')} className="btn btn-secondary">New Event</button>
          </div>
        </div>
      )}
    </div>
  );
}
