// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateEventPage from './pages/CreateEventPage';
import JoinEventPage from './pages/JoinEventPage';
import FinalOutputPage from './pages/FinalOutputPage';

function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
