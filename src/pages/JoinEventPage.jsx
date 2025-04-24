"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../styles.css"

function JoinEventPage() {
  const { eventId } = useParams()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const navigate = useNavigate()

  const handleSubmit = () => {
    // TODO: send name & description to backend for vectorization…

    // navigate to waiting page instead of final
    navigate(`/waiting/${eventId}`)
  }

  return (
    <div className="join-event-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">
            {/* …icon SVG… */}
          </div>
          <h1 className="title">Join Event</h1>
          <div className="event-id-badge">
            <span className="event-id-label">Event ID:</span>
            <span className="event-id-value">{eventId}</span>
          </div>
          <p className="subtitle">Enter your details to join this meetup</p>
        </div>

        <div className="card join-event-card">
          <div className="card-header">
            <h2 className="card-title">Your Information</h2>
            <p className="card-description">
              Tell us a bit about yourself to help find the best meeting spot
            </p>
          </div>
          <div className="card-content">
            <div className="form-group">
              <label htmlFor="your-name" className="form-label">
                Your Name
              </label>
              <input
                id="your-name"
                className="input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="your-description" className="form-label">
                Short Description
                <span className="helper-text">
                  Tell us about your preferences or any special requirements
                </span>
              </label>
              <textarea
                id="your-description"
                className="textarea"
                placeholder="E.g., I prefer locations with parking…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="card-footer">
            <button
              className="button primary-button"
              onClick={handleSubmit}
              disabled={!name.trim()}
            >
              Submit
              <svg
                className="icon-right"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* … info-section & back-link … */}
      </div>
    </div>
  )
}

export default JoinEventPage
