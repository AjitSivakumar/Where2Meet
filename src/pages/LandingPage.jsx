"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles.css"

export default function LandingPage() {
  const [eventId, setEventId] = useState("")
  const navigate = useNavigate()

  // Clear any prior state on the backend
  useEffect(() => {
    fetch("/reset", { method: "POST" })
  }, [])

  const handleCreateEvent = () => {
    navigate("/create")
  }

  const handleJoinEvent = () => {
    if (!eventId.trim()) return
    navigate(`/join/${eventId}`)
  }

  return (
    <div className="landing-page">
      <div className="container">
        {/* Hero section */}
        <div className="hero">
          <div className="icon-circle">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h1 className="title">we are <span className="highlight">where2meet!</span></h1>
          <p className="subtitle">
            find the perfect meeting spot for your group, effortlessly coordinate locations, and make decisions together.
          </p>
          <button className="button primary-button" onClick={handleCreateEvent}>
            create an event
          </button>
        </div>

        {/* Cards section */}
        <div className="cards-grid">
          {/* Create Event Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">create a new event</h2>
              <p className="card-description">press the button lmao</p>
            </div>
            <div className="card-content">
              <div className="feature-item">
                <div className="icon-circle small">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="feature-title">invite your group!</h3>
                  <p className="feature-description">share this link with everyone</p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="button primary-button full-width" onClick={handleCreateEvent}>
                same button as above
                <svg className="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Join Event Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">join an event</h2>
              <p className="card-description">enter the event ID to join</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="event-id" className="form-label">event ID</label>
                <input
                  id="event-id"
                  className="input"
                  type="text"
                  placeholder="enter event ID"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                />
              </div>
            </div>
            <div className="card-footer">
              <button
                className="button primary-button full-width"
                onClick={handleJoinEvent}
                disabled={!eventId.trim()}
              >
                join
                <svg className="icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>where2meet helps you find the optimal meeting location based on everyone's starting points.</p>
        </div>
      </div>
    </div>
  )
}
