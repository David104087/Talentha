export const LEVEL_STYLES = {
  critical:  { bg: '#FFF1F2', fg: '#7F1D1D', ring: '#FCA5A5', label: 'Crítico',  deadline: '0–15 días' },
  high:      { bg: '#FFFBEB', fg: '#B45309', ring: '#FCD34D', label: 'Alto',     deadline: '15–30 días' },
  moderate:  { bg: '#FEF9E7', fg: '#D97706', ring: '#FDE68A', label: 'Moderado', deadline: '30–60 días' },
  low:       { bg: '#ECFDF5', fg: '#059669', ring: '#A7F3D0', label: 'Bajo',     deadline: 'Sostenimiento' },
}

export function getSemaforo(score) {
  if (score < 65) return 'critical'
  if (score < 75) return 'high'
  if (score < 85) return 'moderate'
  return 'low'
}

export const LEVEL_DEADLINES = {
  critical: '0–15 días',
  high: '15–30 días',
  moderate: '30–60 días',
  low: 'Sostenimiento',
}
