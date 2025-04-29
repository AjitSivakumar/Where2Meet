"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css"

const API_URL = "http://localhost:5000"

// ───── Fix Leaflet's default icon paths ─────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:      require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:    require("leaflet/dist/images/marker-shadow.png"),
})

// generate a simple 6-char event ID
function generateEventId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function CreateEventPage() {
  const [eventName, setEventName]             = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [markerPosition, setMarkerPosition]     = useState(null)
  const navigate = useNavigate()
  const center = { lat: 40.7128, lng: -74.0060 }

  useEffect(() => {
    fetch(`${API_URL}/reset`, { method: "POST" }).catch(console.error)
  }, [])

  function ClickHandler() {
    useMapEvent("click", e => {
      setMarkerPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
    return null
  }

  const handleCreate = async () => {
    if (!eventDescription.trim() || !markerPosition) return
    const newEventId = generateEventId()

    try {
      // 1) POST description + name
      let res = await fetch(`${API_URL}/set_description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: newEventId,
          name: eventName,
          description: eventDescription
        })
      })
      if (!res.ok) throw new Error(`desc status ${res.status}`)

      // 2) POST leader’s map pin
      res = await fetch(`${API_URL}/add_location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: newEventId,
          lat: markerPosition.lat,
          lon: markerPosition.lng
        })
      })
      if (!res.ok) throw new Error(`loc status ${res.status}`)

      // 3) navigate in
      navigate(`/waiting/${newEventId}`)
    } catch (err) {
      console.error("Create event error:", err)
      alert("Unable to create event. Check console & ensure backend is running.")
    }
  }

  return (
    <div className="create-event-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">{/* …icon SVG… */}</div>
          <h1 className="title">create a new event</h1>
          <p className="subtitle">fill in a description and click your location</p>
        </div>

        <div className="card create-event-card">
          <div className="card-content">
            <div className="form-group">
              <label htmlFor="event-name" className="form-label">name</label>
              <input
                id="event-name"
                className="input"
                placeholder="(optional) event name"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-description" className="form-label">description</label>
              <textarea
                id="event-description"
                className="textarea"
                placeholder="event description goes here"
                value={eventDescription}
                onChange={e => setEventDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                event location
                <span className="helper-text">click the map to set your location</span>
              </label>
              <div className="map-container">
                <MapContainer center={center} zoom={10} className="map">
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickHandler />
                  {markerPosition && (
                    <Marker position={[markerPosition.lat, markerPosition.lng]} />
                  )}
                </MapContainer>
              </div>
              {markerPosition && (
                <div className="location-info">
                  selected: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          <div className="card-footer">
            <button
              className="button primary-button"
              onClick={handleCreate}
              disabled={!eventDescription.trim() || !markerPosition}
            >
              create event
            </button>
          </div>
        </div>

        <div className="back-link">
          <a href="/" className="link">home</a>
        </div>
      </div>
    </div>
  )
}
