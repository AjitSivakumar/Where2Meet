// WaitingPage.jsx
"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../styles.css"

const API_URL = "http://localhost:5000"

export default function WaitingPage() {
  const { eventId } = useParams()
  const navigate    = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchEvent = async () => {
    try {
      const res  = await fetch(`${API_URL}/get_event/${eventId}`)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      setData(json)

      // If event is finalized, redirect immediately
      if (json.finalized) {
        navigate("/final", { state: { eventData: json, eventId } })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
    const iv = setInterval(fetchEvent, 2000)  // poll faster (2s)
    return () => clearInterval(iv)
  }, [eventId])

  if (loading) {
    return <p style={{ textAlign:"center", padding:"2rem" }}>Loading…</p>
  }
  if (error) {
    return (
      <div className="waiting-page">
        <p style={{ textAlign:"center", padding:"2rem" }}>
          ⚠️ Could not load event <strong>{eventId}</strong>: {error}
        </p>
      </div>
    )
  }

  const { participants, locations, optimal_location } = data
  const { midpoint, suggestions } = optimal_location

  const handleFinalize = async () => {
    try {
      await fetch(`${API_URL}/finalize/${eventId}`, { method: "POST" })
      // immediately redirect the host
      navigate("/final", { state: { eventData: data, eventId } })
    } catch (err) {
      console.error("Finalize failed:", err)
      alert("Could not finalize—check your backend.")
    }
  }

  return (
    <div className="waiting-page" style={{ textAlign:"center", padding:"2rem" }}>
      <h1>Waiting Room</h1>
      <p>Event ID: <strong>{eventId}</strong></p>

      <h2>Participants ({participants.length})</h2>
      <ul style={{ listStyle:"none", padding:0 }}>
        {participants.map((p,i) => (
          <li key={i} style={{ margin:"0.5rem 0" }}>
            {p.name} ({p.lat.toFixed(4)}, {p.lon.toFixed(4)})
          </li>
        ))}
      </ul>

      <h2>Current Midpoint</h2>
      <p>
        {midpoint.lat != null
          ? `(${midpoint.lat.toFixed(4)}, ${midpoint.lon.toFixed(4)})`
          : "Waiting on locations…"}
      </p>

      <h2>Suggestions</h2>
      <ul style={{ listStyle:"none", padding:0 }}>
        {suggestions.map((s,i) => (
          <li key={i} style={{ margin:"0.5rem 0" }}>
            {s.name} ({s.lat.toFixed(4)}, {s.lon.toFixed(4)})
          </li>
        ))}
      </ul>

      <button
        onClick={handleFinalize}
        disabled={participants.length === 0}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: participants.length === 0 ? "not-allowed" : "pointer"
        }}
      >
        Finalize Group
      </button>
    </div>
  )
}
