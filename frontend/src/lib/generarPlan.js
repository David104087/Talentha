// Port JavaScript de plan_intervencion.py (backend).
// Se usa como fallback cuando el componente <PlanIntervencion /> recibe
// `scores` directamente (firma del §2.2 del enunciado), permitiéndole
// generar el plan sin ir al backend.

import { LEVEL_DEADLINES, getSemaforo } from '../constants/levels'

const ORDEN_NIVEL = { critico: 0, alto: 1, moderado: 2, bajo: 3 }

const PLACEHOLDER_ACCIONES = (id, nivel) => ({
  supervisor: [`Acción de intervención para ${id} en nivel ${nivel} — supervisor.`],
  jefe:       [`Acción de intervención para ${id} en nivel ${nivel} — jefe directo.`],
  sistema:    [`Acción de intervención para ${id} en nivel ${nivel} — sistema / organización.`],
  kpi:        [`% de mejora en el score de ${id} en la próxima evaluación`],
})

export function calcularIpraGlobal(scores) {
  return Math.round(scores.reduce((s, d) => s + (d.score * d.peso) / 100, 0) * 10) / 10
}

export function generarPlanIntervencion(scores, nombreSupervisor, contenidoPlanes = {}) {
  const ipra_global = calcularIpraGlobal(scores)

  const anotadas = scores.map(d => {
    const nivel = getSemaforo(d.score)
    return {
      id: d.id,
      nombre: d.nombre,
      peso: d.peso,
      score: d.score,
      nivel,
      plazo: LEVEL_DEADLINES[nivel],
    }
  })

  const ordenadas = [...anotadas].sort((a, b) => {
    const levelDiff = ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel]
    return levelDiff !== 0 ? levelDiff : b.peso - a.peso
  })

  const resumen = ordenadas.map((dim, i) => ({ ...dim, prioridad_orden: i + 1 }))

  const candidatas = ordenadas
    .filter(d => d.nivel === 'critico' || d.nivel === 'alto')
    .slice(0, 4)

  const planes = candidatas.map(dim => {
    const acciones = contenidoPlanes[`${dim.id}-${dim.nivel}`] || PLACEHOLDER_ACCIONES(dim.id, dim.nivel)
    const kpi = Array.isArray(acciones.kpi) ? acciones.kpi.join(' · ') : acciones.kpi
    return {
      id: dim.id,
      nivel: dim.nivel,
      supervisor: acciones.supervisor,
      jefe: acciones.jefe,
      sistema: acciones.sistema,
      kpi,
    }
  })

  return {
    supervisor: nombreSupervisor,
    ipra_global,
    resumen,
    planes,
  }
}
