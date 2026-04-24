// Colores EXACTOS del semáforo según la tabla de §2.2 del enunciado.
// Claves de nivel en español: critico | alto | moderado | bajo.
export const LEVEL_STYLES = {
  critico:  { bg: '#FFF1F2', fg: '#7F1D1D', ring: '#FCA5A5', label: 'Crítico',  plazo: '0-15 dias'   },
  alto:     { bg: '#FFFBEB', fg: '#B45309', ring: '#FCD34D', label: 'Alto',     plazo: '15-30 dias'  },
  moderado: { bg: '#FEF9E7', fg: '#D97706', ring: '#FDE68A', label: 'Moderado', plazo: '30-60 dias'  },
  bajo:     { bg: '#ECFDF5', fg: '#059669', ring: '#A7F3D0', label: 'Bajo',     plazo: 'Sostenimiento' },
}

export function getSemaforo(score) {
  if (score < 65) return 'critico'
  if (score < 75) return 'alto'
  if (score < 85) return 'moderado'
  return 'bajo'
}

export const LEVEL_DEADLINES = {
  critico:  '0-15 dias',
  alto:     '15-30 dias',
  moderado: '30-60 dias',
  bajo:     'Sostenimiento',
}
