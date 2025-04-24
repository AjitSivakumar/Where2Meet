"use client"

import React from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import "../styles.css"

export default function WaitingPage() {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Grab the payload that your Create/Join pages sent:
  const { eventData } = location.state || {}
  if (!eventData) {
    return (
      <div className="waiting-page">
        <p style={{ textAlign: "center", padding: "2rem" }}>
          ⚠️ No event data available for ID <strong>{eventId}</strong>. Please go back and create or join an event.
        </p>
      </div>
    )
  }

  // Destructure what your Flask /add_location returned:
  const { locations, optimal_location } = eventData
  const { midpoint, suggestions } = optimal_location

  const handleFinalize = () => {
    // Pass along the same state into FinalOutputPage if needed
    navigate("/final", { state: { eventData, eventId } })
  }

  return (
    <div className="waiting-page" style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Event Created!</h1>
      <p>Your Event ID is:</p>
      <code style={{ fontSize: "1.2rem", padding: "0.5rem", background: "#f0f0f0" }}>
        {eventId}
      </code>
      <p>Share this ID so others can join.</p>

      <h2 style={{ marginTop: "2rem" }}>Participants ({locations.length})</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {locations.map(([lat, lon], i) => (
          <li key={i} style={{ margin: "0.5rem 0" }}>
            Participant {i + 1}: ({lat.toFixed(4)}, {lon.toFixed(4)})
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Current Midpoint</h2>
      <p>
        ({midpoint.lat.toFixed(4)}, {midpoint.lon.toFixed(4)})
      </p>

      <h2 style={{ marginTop: "2rem" }}>Suggestions</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {suggestions.map((place, i) => (
          <li key={i} style={{ margin: "0.5rem 0" }}>
            {place.name} — ({place.lat.toFixed(4)}, {place.lon.toFixed(4)})
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "2.5rem" }}>
        <button
          onClick={handleFinalize}
          disabled={locations.length === 0}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            cursor: locations.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          Finalize Group
        </button>
      </div>
    </div>
  )
}
