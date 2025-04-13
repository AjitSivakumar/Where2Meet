
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function JoinEventPage() {
  const { eventId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    // in final, we send this name and description data to the backend to do word-vectorization

    // for demo, navigate to final page
    navigate('/final');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Join Event (ID: {eventId})</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <textarea
          placeholder="Short Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '300px', height: '100px' }}
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default JoinEventPage;
