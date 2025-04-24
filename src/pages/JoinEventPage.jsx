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
    // in final, we send this name and description data to the backend to do word-vectorization

    // for demo, navigate to final page
    navigate("/final")
  }

  return (
    <div className="join-event-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
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
            <p className="card-description">Tell us a bit about yourself to help find the best meeting spot</p>
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
                <span className="helper-text">Tell us about your preferences or any special requirements</span>
              </label>
              <textarea
                id="your-description"
                className="textarea"
                placeholder="E.g., I prefer locations with parking, I'm coming from downtown, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="card-footer">
            <button className="button primary-button" onClick={handleSubmit} disabled={!name.trim()}>
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
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <div className="info-icon">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className="info-content">
              <h3 className="info-title">How it works</h3>
              <p className="info-text">
                After you submit your information, our algorithm will calculate the optimal meeting location based on
                everyone's starting points and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="back-link">
          <a href="/" className="link">
            <svg
              className="icon-left"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default JoinEventPage
