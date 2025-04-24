"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css" // Reusing the same CSS file

// ───── Fix Leaflet's default icon paths (CRA/Webpack) ─────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

function CreateEventPage() {
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [markerPosition, setMarkerPosition] = useState(null)
  const navigate = useNavigate()

  const center = { lat: 40.7128, lng: -74.006 } // NYC

  // Leaflet click handler
  const handleMapClick = (e) => setMarkerPosition({ lat: e.latlng.lat, lng: e.latlng.lng })

  // A little helper to wire up the click event on the map
  function ClickHandler() {
    useMapEvent("click", handleMapClick)
    return null
  }

  const handleCreate = () => {
    const generatedEventId = "12345" // mock
    navigate(`/waiting/${generatedEventId}`);
  }

  return (
    <div className="create-event-page">
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
          <h1 className="title">create a new event</h1>
          <p className="subtitle">fill in a description for your group and click your address</p>
        </div>

        <div className="card create-event-card">
          <div className="card-content">
            <div className="form-group">
              <label htmlFor="event-name" className="form-label">
                name
              </label>
              <input
                id="event-name"
                className="input"
                type="text"
                placeholder="enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-description" className="form-label">
                description
              </label>
              <textarea
                id="event-description"
                className="textarea"
                placeholder="event description goes here woooo"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                event location
                <span className="helper-text">click the map to set your location (the coords are below!)</span>
              </label>
              <div className="map-container">
                <MapContainer center={center} zoom={10} className="map">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* wire up the click-to-place-marker */}
                  <ClickHandler />

                  {markerPosition && <Marker position={[markerPosition.lat, markerPosition.lng]} />}
                </MapContainer>
              </div>
              {markerPosition && (
                <div className="location-info">
                  <svg
                    className="icon location-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>
                    location selected: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card-footer">
            <button className="button primary-button" onClick={handleCreate} disabled={!eventName || !markerPosition}>
              create event
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
            home
          </a>
        </div>
      </div>
    </div>
  )
}

export default CreateEventPage
