import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CreateEventPage from './pages/CreateEventPage'
import JoinEventPage from './pages/JoinEventPage'
import WaitingPage from './pages/WaitingPage'
import FinalOutputPage from './pages/FinalOutputPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateEventPage />} />
        <Route path="/join/:eventId" element={<JoinEventPage />} />
        <Route path="/waiting/:eventId" element={<WaitingPage />} />
        <Route path="/final" element={<FinalOutputPage />} />
      </Routes>
    </Router>
  )
}

export default App
