import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { LEVEL_STYLES, getSemaforo } from '../constants/levels'
import { generarPlanIntervencion } from '../lib/generarPlan'
import LevelBadge from './LevelBadge'
import TablaResumenIPRA from './TablaResumenIPRA'
import styles from './PlanIntervencion.module.css'

/**
 * Componente principal — Parte 2 del enunciado.
 *
 * Firma esperada por el enunciado (§2.2):
 *   <PlanIntervencion supervisor="Sofia Moreno" scores={[...]} />
 *
 * El enunciado también admite recibir el output ya procesado de la función
 * Python (`plan` prop). Cualquiera de los dos modos funciona.
 *
 * Contenido renderizado (según §2.2):
 *   1. Indicador del IPRA global con color de semáforo.
 *   2. Tabla resumen con 8 dimensiones (score, nivel, peso, plazo).
 *   3. Planes detallados (máx. 4) con 3 subsecciones:
 *      "Para el supervisor" · "Para el jefe directo" · "Para el sistema / organización".
 */
export default function PlanIntervencion({
  supervisor,
  scores,
  plan: planProp,
  selectedId,
  onSelect,
  showIpraIndicator = true,
}) {
  // Modo 1: recibimos scores + supervisor → generamos el plan aquí.
  // Modo 2: recibimos `plan` ya procesado (p. ej. desde el backend).
  const plan = useMemo(() => {
    if (planProp) return planProp
    if (!scores || !supervisor) return null
    return generarPlanIntervencion(scores, supervisor)
  }, [planProp, scores, supervisor])

  if (!plan) return null

  const nivelGlobal = getSemaforo(plan.ipra_global)
  const estiloGlobal = LEVEL_STYLES[nivelGlobal]
  const highlightId = selectedId || plan.planes[0]?.id

  return (
    <div className={styles.container}>
      {showIpraIndicator && (
        <IpraGlobalBanner
          valor={plan.ipra_global}
          estilo={estiloGlobal}
          supervisor={plan.supervisor}
        />
      )}

      <TablaResumenIPRA
        dimensions={plan.resumen}
        selectedId={highlightId}
        onSelect={onSelect}
        defaultSort="prioridad"
      />

      <div className={styles.cards}>
        {plan.planes.map((p, i) => (
          <PlanCard
            key={p.id}
            plan={p}
            resumenDim={plan.resumen.find(d => d.id === p.id)}
            rank={i + 1}
            highlighted={highlightId === p.id}
          />
        ))}
      </div>
    </div>
  )
}

PlanIntervencion.propTypes = {
  /** Nombre del supervisor evaluado (requerido si no pasas `plan`). */
  supervisor: PropTypes.string,
  /** Scores crudos por dimensión (requerido si no pasas `plan`). */
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      peso: PropTypes.number.isRequired,
      score: PropTypes.number.isRequired,
    })
  ),
  /** Output ya procesado de generar_plan_intervencion (opcional). */
  plan: PropTypes.shape({
    supervisor: PropTypes.string.isRequired,
    ipra_global: PropTypes.number.isRequired,
    resumen: PropTypes.array.isRequired,
    planes: PropTypes.array.isRequired,
  }),
  /** Id de la dimensión resaltada en la tabla y en los planes. */
  selectedId: PropTypes.string,
  /** Callback cuando el usuario selecciona una fila de la tabla. */
  onSelect: PropTypes.func,
  /** Mostrar el banner interno de IPRA global. true por defecto (requisito §2.2).
   *  Se puede desactivar cuando el contenedor ya provee su propio indicador. */
  showIpraIndicator: PropTypes.bool,
}

// ---------------------------------------------------------------------------
// IPRA Global banner
// ---------------------------------------------------------------------------

function IpraGlobalBanner({ valor, estilo, supervisor }) {
  const circ = 2 * Math.PI * 44
  const pct = Math.max(0, Math.min(100, valor)) / 100

  return (
    <div className={styles.iprabox} style={{ borderColor: estilo.ring }}>
      <div className={styles.dial} aria-label={`IPRA global ${valor}`}>
        <svg viewBox="0 0 110 110">
          <circle className={styles.dialTrack} cx="55" cy="55" r="44" />
          <circle
            className={styles.dialFill}
            cx="55"
            cy="55"
            r="44"
            style={{
              stroke: estilo.fg,
              strokeDasharray: circ,
              strokeDashoffset: circ * (1 - pct),
            }}
          />
        </svg>
        <div className={styles.dialNum} style={{ color: estilo.fg }}>
          {valor.toFixed(1)}
        </div>
      </div>

      <div className={styles.iprainfo}>
        <div className={styles.eyebrow}>IPRA GLOBAL</div>
        <h3>Índice Predictivo de Riesgo en Seguridad</h3>
        <span
          className={styles.levelChip}
          style={{ background: estilo.bg, color: estilo.fg }}
        >
          <span className={styles.levelChipBullet} />
          Nivel {estilo.label}
        </span>
        <p>Σ(score × peso / 100) sobre las 8 dimensiones — ponderado por metodología.</p>
      </div>

      <div className={styles.supervisorCol}>
        <strong>{supervisor}</strong>
        SUP-00247 · Q1 2026
      </div>
    </div>
  )
}

IpraGlobalBanner.propTypes = {
  valor: PropTypes.number.isRequired,
  estilo: PropTypes.object.isRequired,
  supervisor: PropTypes.string.isRequired,
}

// ---------------------------------------------------------------------------
// Plan card
// ---------------------------------------------------------------------------

function PlanCard({ plan, resumenDim, rank, highlighted }) {
  const s = LEVEL_STYLES[plan.nivel] || LEVEL_STYLES['moderado']

  return (
    <article className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <span className={styles.pcode}>{plan.id}</span>
          <span>PRIORIDAD</span>
          <span className={styles.priority}>#{rank} de 8</span>
        </div>
        <h3 className={styles.title}>
          {resumenDim ? resumenDim.nombre : plan.id}
        </h3>
        <div className={styles.meta}>
          <LevelBadge level={plan.nivel} size="sm" />
          <span
            className={`${styles.pill} ${styles.pillPlazo}`}
            style={{ background: s.bg, color: s.fg }}
          >
            {s.plazo}
          </span>
          {resumenDim && (
            <>
              <span className={styles.pill}>Score {resumenDim.score.toFixed(1)}</span>
              <span className={styles.pill}>Peso {resumenDim.peso}%</span>
            </>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.roleBlock}>
          <div className={styles.roleHead}>
            <span className={styles.roleIconSupervisor}>SV</span>
            <span className={styles.roleTitle}>Para el supervisor</span>
            <span className={styles.roleSub}>{plan.supervisor.length} acciones</span>
          </div>
          <ul className={`${styles.roleList} ${styles.roleListSupervisor}`}>
            {plan.supervisor.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>

        <div className={styles.roleBlock}>
          <div className={styles.roleHead}>
            <span className={styles.roleIconJefe}>JD</span>
            <span className={styles.roleTitle}>Para el jefe directo</span>
            <span className={styles.roleSub}>{plan.jefe.length} acciones</span>
          </div>
          <ul className={`${styles.roleList} ${styles.roleListJefe}`}>
            {plan.jefe.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>

        <div className={styles.roleBlock}>
          <div className={styles.roleHead}>
            <span className={styles.roleIconSistema}>SI</span>
            <span className={styles.roleTitle}>Para el sistema / organización</span>
            <span className={styles.roleSub}>{plan.sistema.length} acciones</span>
          </div>
          <ul className={`${styles.roleList} ${styles.roleListSistema}`}>
            {plan.sistema.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      </div>

      <footer className={styles.foot}>
        <div className={styles.footLabel}>Indicadores de seguimiento</div>
        <div className={styles.footKpi}>{plan.kpi}</div>
      </footer>
    </article>
  )
}

PlanCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nivel: PropTypes.oneOf(['critico', 'alto', 'moderado', 'bajo']).isRequired,
    supervisor: PropTypes.arrayOf(PropTypes.string).isRequired,
    jefe: PropTypes.arrayOf(PropTypes.string).isRequired,
    sistema: PropTypes.arrayOf(PropTypes.string).isRequired,
    kpi: PropTypes.string.isRequired,
  }).isRequired,
  resumenDim: PropTypes.object,
  rank: PropTypes.number.isRequired,
  highlighted: PropTypes.bool,
}
