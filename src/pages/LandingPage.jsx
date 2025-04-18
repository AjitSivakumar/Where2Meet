
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [eventId, setEventId] = useState('');
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate('/create');
  };

  const handleJoinEvent = () => {
    // in final, we will validate the eventId with the backend
    navigate(`/join/${eventId}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to where2meet!</h1>
      <p>Find the best place for your group to meet, easily.</p>
      <button onClick={handleCreateEvent}>Create an Event</button>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleJoinEvent}>Join an Event</button>
      </div>
    </div>
  );
}

export default LandingPage;
