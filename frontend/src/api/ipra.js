const BASE_URL = '/api'

export async function generatePlan({ supervisorName, scores }) {
  const response = await fetch(`${BASE_URL}/plan-intervencion/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supervisor_name: supervisorName, scores }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function getDemoPlan() {
  const response = await fetch(`${BASE_URL}/plan-intervencion/`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
