"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css"

// ───── Fix Leaflet's default icon paths ─────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

// Custom icon for the optimal location
const optimalIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "optimal-marker",
})

export default function FinalOutputPage() {
  const [interactive, setInteractive] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { eventData } = location.state || {}

  // Sample data for development/preview
  const sampleData = {
    optimal_location: {
      midpoint: { lat: 40.7484, lng: -73.9857, lon: -73.9857 },
      suggestions: [
        { name: "Empire State Building", lat: 40.7484, lon: -73.9857 },
        { name: "Times Square", lat: 40.758, lon: -73.9855 },
        { name: "Central Park", lat: 40.7812, lon: -73.9665 },
        { name: "Grand Central Terminal", lat: 40.7527, lon: -73.9772 },
        { name: "Rockefeller Center", lat: 40.7587, lon: -73.9787 },
      ],
    },
  }

  // Use sample data if no event data is provided
  const data = eventData || sampleData

  if (!data) {
    return (
      <div className="final-output-page">
        <div className="container">
          <div className="error-message">
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
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No event data found. Please create or join an event first.</p>
            <button className="button primary-button" onClick={() => navigate("/")}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { midpoint, suggestions } = data.optimal_location

  return (
    <div className="map-results-container">
      {/* Map background always rendered */}
      <MapContainer
        center={[midpoint.lat, midpoint.lon || midpoint.lng]}
        zoom={13}
        scrollWheelZoom={interactive}
        className="results-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[midpoint.lat, midpoint.lon || midpoint.lng]} icon={optimalIcon}>
          <Popup>
            <div className="map-popup">
              <strong>Optimal Meeting Point</strong>
              <br />
              {midpoint.lat.toFixed(4)}, {(midpoint.lon || midpoint.lng).toFixed(4)}
              <br />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${midpoint.lat},${midpoint.lon || midpoint.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                Open in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
        {suggestions.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lon || loc.lng]}>
            <Popup>
              <div className="map-popup">
                <strong>{loc.name}</strong>
                <br />
                {loc.lat.toFixed(4)}, {(loc.lon || loc.lng).toFixed(4)}
                <br />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lon || loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Toggle button */}
      <button
        onClick={() => setInteractive(!interactive)}
        className={`map-toggle-button ${interactive ? "active" : ""}`}
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {interactive ? (
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </>
          ) : (
            <>
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </>
          )}
        </svg>
        {interactive ? "View Results" : "Explore Map"}
      </button>

      {/* Overlay UI: only show when not interactive */}
      {!interactive && (
        <div className="results-overlay">
          <div className="results-header">
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h1 className="title">Your Optimal Meeting Location</h1>
            <div className="optimal-location-badge">
              <span className="location-name">{suggestions[0]?.name || "Optimal Point"}</span>
              <span className="location-coordinates">
                {midpoint.lat.toFixed(4)}, {(midpoint.lon || midpoint.lng).toFixed(4)}
              </span>
            </div>
          </div>

          <div className="results-content">
            <div className="card results-card">
              <div className="card-header">
                <h2 className="card-title">Suggested Meeting Locations</h2>
                <p className="card-description">Ranked by convenience for all participants</p>
              </div>
              <div className="card-content">
                <ul className="location-list">
                  {suggestions.map((loc, idx) => (
                    <li key={idx} className="location-item">
                      <span className="location-rank">{idx + 1}</span>
                      <div className="location-info">
                        <h3 className="location-name">{loc.name}</h3>
                        <p className="location-coordinates">
                          {loc.lat.toFixed(4)}, {(loc.lon || loc.lng).toFixed(4)}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lon || loc.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location-link"
                      >
                        <svg
                          className="icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="actions-section">
              <button
                className="button primary-button"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <svg
                  className="icon-left"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share Results
              </button>
              <button className="button secondary-button" onClick={() => navigate("/create")}>
                <svg
                  className="icon-left"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New Event
              </button>
            </div>

            <div className="thank-you-section">
              <p>Thank you for using where2meet!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
