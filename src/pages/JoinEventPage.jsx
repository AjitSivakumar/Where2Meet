// JoinEventPage.jsx
"use client"

import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css"

const API_URL = "http://localhost:5000"

// fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:      require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:    require("leaflet/dist/images/marker-shadow.png"),
})

export default function JoinEventPage() {
  const { eventId } = useParams()
  const [name, setName] = useState("")
  const [markerPos, setMarkerPos] = useState(null)
  const navigate = useNavigate()
  const center = { lat: 40.7128, lng: -74.0060 }

  function ClickHandler() {
    useMapEvent("click", e => {
      setMarkerPos({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
    return null
  }

  const handleSubmit = async () => {
    if (!name.trim() || !markerPos) return

    try {
      const res = await fetch(`${API_URL}/add_location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name:     name.trim(),
          lat:      markerPos.lat,
          lon:      markerPos.lng
        })
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      navigate(`/waiting/${eventId}`)
    } catch (err) {
      console.error("Join failed:", err)
      alert("Could not join—ensure the backend is running and the Event ID is correct.")
    }
  }

  return (
    <div className="join-event-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">{/* …icon SVG… */}</div>
          <h1 className="title">Join Event</h1>
          <div className="event-id-badge">
            <span className="event-id-label">Event ID:</span>
            <span className="event-id-value">{eventId}</span>
          </div>
          <p className="subtitle">
            Enter your name and click the map to set your location
          </p>
        </div>

        <div className="card join-event-card">
          <div className="card-content">
            <div className="form-group">
              <label htmlFor="your-name" className="form-label">Your Name</label>
              <input
                id="your-name"
                className="input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Location
                <span className="helper-text">Click the map below</span>
              </label>
              <div className="map-container">
                <MapContainer center={center} zoom={10} className="map">
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickHandler />
                  {markerPos && (
                    <Marker position={[markerPos.lat, markerPos.lng]} />
                  )}
                </MapContainer>
              </div>
              {markerPos && (
                <div className="location-info">
                  selected: {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>
          <div className="card-footer">
            <button
              className="button primary-button"
              onClick={handleSubmit}
              disabled={!name.trim() || !markerPos}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
