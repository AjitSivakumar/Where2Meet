"use client"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "../styles.css"

// ───── Fix Leaflet's default icon paths (CRA/Webpack) ─────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

// Create a custom icon for the optimal location
const optimalIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "optimal-marker", // We'll style this with CSS
})

function FinalOutputPage() {
  // in final, we will fetch the top 10 locations from the backend
  // for now, we will mock the data
  const mockLocations = [
    { name: "Central Park", lat: 40.7812, lng: -73.9665 },
    { name: "Times Square", lat: 40.758, lng: -73.9855 },
    { name: "Brooklyn Bridge", lat: 40.7061, lng: -73.9969 },
    { name: "Empire State Building", lat: 40.7484, lng: -73.9857 },
    { name: "Grand Central Terminal", lat: 40.7527, lng: -73.9772 },
    { name: "Rockefeller Center", lat: 40.7587, lng: -73.9787 },
    { name: "One World Trade Center", lat: 40.7127, lng: -74.0134 },
    { name: "The High Line", lat: 40.748, lng: -74.0048 },
    { name: "Washington Square Park", lat: 40.7308, lng: -73.9973 },
    { name: "Battery Park", lat: 40.7032, lng: -74.0153 },
  ]

  // Optimal location (in a real app, this would come from your ML backend)
  const optimalLocation = {
    name: "Optimal Meeting Point",
    lat: 40.7484,
    lng: -73.9857,
    description: "This is the most convenient location for everyone to meet based on our calculations.",
  }

  return (
    <div className="final-output-page">
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
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
                  <div>
                    <h3 className="location-name">{optimalLocation.name}</h3>
                    <p className="location-coordinates">
                      Latitude: {optimalLocation.lat.toFixed(4)}, Longitude: {optimalLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <p className="location-description">{optimalLocation.description}</p>
              </div>

              <div className="map-container">
                <MapContainer
                  center={[optimalLocation.lat, optimalLocation.lng]}
                  zoom={13}
                  className="map"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[optimalLocation.lat, optimalLocation.lng]} icon={optimalIcon}>
                    <Popup>
                      <strong>{optimalLocation.name}</strong>
                      <br />
                      {optimalLocation.description}
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
                {mockLocations.map((loc, idx) => (
                  <li key={idx} className="location-item">
                    <span className="location-rank">{idx + 1}</span>
                    <div className="location-info">
                      <h3 className="location-name">{loc.name}</h3>
                      <p className="location-coordinates">
                        Latitude: {loc.lat.toFixed(4)}, Longitude: {loc.lng.toFixed(4)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button className="button primary-button">Share Results</button>
          <button className="button secondary-button">Create New Event</button>
        </div>

        <div className="thank-you-section">
          <p>Thank you for using where2meet!</p>
        </div>
      </div>
    </div>
  )
}

export default FinalOutputPage
