// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateEventPage from './pages/CreateEventPage';
import JoinEventPage from './pages/JoinEventPage';
import FinalOutputPage from './pages/FinalOutputPage';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function App() {
  const center = [51.505, -0.09];

  return (
    
    <Router>
      <Routes>
        {/* 
          Landing page: accessible via '/'
        */}
        <Route path="/" element={<LandingPage />} />

        {/* 
          Create Event page: accessible via '/create'
          This is for the group leader to create a new event
        */}
        <Route path="/create" element={<CreateEventPage />} />

        {/* 
          Join Event page: accessible via '/join/:eventId'
          This is for participants to join a specific event 
          (the eventId might come in handy if you eventually set up a backend)
        */}
        <Route path="/join/:eventId" element={<JoinEventPage />} />

        {/* 
          Final output page: shows top 10 meeting locations
        */}
        <Route path="/final" element={<FinalOutputPage />} />
        <Route
          path="/map"
          element={
            <div style={{ width: '100%', height: '100vh' }}>
              <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                  <Popup>Hello from London!</Popup>
                </Marker>
              </MapContainer>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
