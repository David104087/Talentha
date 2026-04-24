// Cliente del API del backend DRF. El contrato (§2.1) usa claves en español.

const BASE_URL = '/api'

/**
 * @param {{nombreSupervisor: string, scores: Array<{id, nombre, peso, score}>}} params
 * @returns {Promise<object>} Plan de intervención con claves en español.
 */
export async function generatePlan({ nombreSupervisor, scores }) {
  const response = await fetch(`${BASE_URL}/plan-intervencion/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_supervisor: nombreSupervisor, scores }),
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

/**
 * BONUS (funcionalidad extra, separada):
 * Genera el plan por IA en endpoint alterno.
 *
 * @param {{nombreSupervisor: string, scores: Array<{id, nombre, peso, score}>}} params
 * @returns {Promise<object>}
 */
export async function generatePlanAI({ nombreSupervisor, scores }) {
  const response = await fetch(`${BASE_URL}/plan-intervencion-ia/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_supervisor: nombreSupervisor, scores }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'No se pudo contactar a la IA en este momento.')
  }

  return response.json()
}
