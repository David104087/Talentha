import { Routes, Route, Navigate } from 'react-router-dom'
import ScoreEntry from './pages/ScoreEntry'
import InterventionPlan from './pages/InterventionPlan'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScoreEntry />} />
      <Route path="/plan" element={<InterventionPlan />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
