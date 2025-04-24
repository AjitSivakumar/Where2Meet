import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function WaitingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // TODO: replace this mock with a real API call:
    // fetch(`/api/events/${eventId}/participants`)
    //   .then(res => res.json())
    //   .then(data => setParticipants(data));
    setParticipants([ 'Alice', 'Bob', 'Charlie' ]);
  }, [eventId]);

  const handleFinalize = () => {
    // Optionally, pass state or params if FinalOutputPage needs them:
    // navigate('/final', { state: { eventId, participants } });
    navigate('/final');
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Event Created!</h1>
      <p>Your Event ID is:</p>
      <code style={{ fontSize: '1.2rem', padding: '0.5rem', background: '#f0f0f0' }}>
        {eventId}
      </code>
      <p>Share this ID so others can join.</p>

      <h2 style={{ marginTop: '2rem' }}>Participants</h2>
      {participants.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {participants.map((name, i) => (
            <li key={i} style={{ margin: '0.5rem 0' }}>
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p>Waiting for participants to join…</p>
      )}

      <div style={{ marginTop: '2.5rem' }}>
        <button
          onClick={handleFinalize}
          disabled={participants.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: participants.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Finalize Group
        </button>
      </div>
    </div>
  );
}
