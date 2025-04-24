"use client"

import React from "react"
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
  const location = useLocation()
  const navigate = useNavigate()
  const { eventData } = location.state || {}

  if (!eventData) {
    return (
      <div className="final-output-page">
        <div className="container">
          <p style={{ textAlign: "center", padding: "2rem" }}>
            No event data found. Please create or join an event first.
          </p>
        </div>
      </div>
    )
  }

  const { optimal_location } = eventData
  const { midpoint, suggestions } = optimal_location

  return (
    <div className="final-output-page">
      <div className="container">
        <div className="page-header">
          <div className="icon-circle">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h1 className="title">Your Optimal Meeting Location</h1>
          <p className="subtitle">Based on everyone's starting points, here's the best place to meet</p>
        </div>

        <div className="optimal-location-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Optimal Meeting Point</h2>
              <p className="card-description">This location minimizes travel time for all participants</p>
            </div>
            <div className="card-content">
              <div className="optimal-location-details">
                <div className="location-badge">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <h3 className="location-name">Midpoint</h3>
                    <p className="location-coordinates">
                      Latitude: {midpoint.lat.toFixed(4)}, Longitude: {midpoint.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="map-container">
                <MapContainer
                  center={[midpoint.lat, midpoint.lon]}
                  zoom={13}
                  className="map"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[midpoint.lat, midpoint.lon]} icon={optimalIcon}>
                    <Popup>
                      <strong>Midpoint</strong><br />
                      {midpoint.lat.toFixed(4)}, {midpoint.lon.toFixed(4)}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="alternative-locations-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Alternative Meeting Locations</h2>
              <p className="card-description">Other possible locations ranked by convenience</p>
            </div>
            <div className="card-content">
              <ul className="location-list">
                {suggestions.map((loc, idx) => (
                  <li key={idx} className="location-item">
                    <span className="location-rank">{idx + 1}</span>
                    <div className="location-info">
                      <h3 className="location-name">{loc.name}</h3>
                      <p className="location-coordinates">
                        Latitude: {loc.lat.toFixed(4)}, Longitude: {loc.lon.toFixed(4)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button className="button primary-button" onClick={() => navigator.clipboard.writeText(window.location.href)}>
            Share Results
          </button>
          <button className="button secondary-button" onClick={() => navigate("/create")}>Create New Event</button>
        </div>

        <div className="thank-you-section">
          <p>Thank you for using where2meet!</p>
        </div>
      </div>
    </div>
  )
}
