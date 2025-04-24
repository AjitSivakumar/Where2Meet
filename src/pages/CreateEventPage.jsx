"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css"  

// ───── Fix Leaflet's default icon paths ─────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:      require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:    require("leaflet/dist/images/marker-shadow.png"),
})

export default function CreateEventPage() {
  const [eventName, setEventName]             = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [markerPosition, setMarkerPosition]     = useState(null)
  const navigate = useNavigate()

  const center = { lat: 40.7128, lng: -74.006 }

  // Reset backend state on mount (relies on CRA proxy in package.json)
  useEffect(() => {
    fetch("http://localhost:5000/reset", { method: "POST" })
      .catch(err => console.error('Reset failed', err));
  }, [])

  const handleMapClick = (e) =>
    setMarkerPosition({ lat: e.latlng.lat, lng: e.latlng.lng })

  function ClickHandler() {
    useMapEvent("click", handleMapClick)
    return null
  }

  const handleCreate = async () => {
    try {
      // 1) send the description
      await fetch("http://localhost:5000/set_description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: eventDescription })
      })

      // 2) send the leader’s location
      const res = await fetch("http://localhost:5000/add_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: markerPosition.lat,
          lon: markerPosition.lng
        })
      })
      if (!res.ok) throw new Error(`Add location failed: ${res.status}`)
      const payload = await res.json()

      // 3) navigate to waiting room
      const generatedEventId = "12345"
      navigate(`/waiting/${generatedEventId}`, { state: { eventData: payload } })
    } catch (error) {
      console.error('Create event error', error)
      alert('Unable to create event. Make sure your backend is running and proxy is set.')
    }
  }

  return (
    <div className="create-event-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">
            <svg className="icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
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
                  {markerPosition && <Marker position={[markerPosition.lat, markerPosition.lng]} />}
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
              disabled={!eventDescription || !markerPosition}
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
