import PropTypes from 'prop-types'
import { LEVEL_STYLES } from '../constants/levels'
import LevelBadge from './LevelBadge'
import TablaResumenIPRA from './TablaResumenIPRA'
import styles from './PlanIntervencionIA.module.css'

/**
 * BONUS (extra y separado del enunciado base):
 * Render del plan IPRA generado por endpoint de IA.
 */
export default function PlanIntervencionAI({ plan, loading, error, selectedId, onSelect }) {
  if (!plan) return null

  const highlightId = selectedId || plan.planes?.[0]?.id

  return (
    <div className={styles.container}>
      <TablaResumenIPRA
        dimensions={plan.resumen}
        selectedId={highlightId}
        onSelect={onSelect}
        defaultSort="prioridad"
      />

      {error && (
        <div className={styles.errorBanner}>
          No se pudo contactar a la IA. Se conserva la estructura del plan, pero sin contenido generado.
        </div>
      )}

      <div className={styles.cards}>
        {plan.planes.map((p, i) => (
          <PlanCard
            key={p.id}
            plan={p}
            resumenDim={plan.resumen.find(d => d.id === p.id)}
            rank={i + 1}
            highlighted={highlightId === p.id}
            loading={loading}
            error={!!error}
          />
        ))}
      </div>
    </div>
  )
}

function PlanCard({ plan, resumenDim, rank, highlighted, loading, error }) {
  const s = LEVEL_STYLES[plan.nivel] || LEVEL_STYLES['moderado']

  return (
    <article className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}>
      <header className={styles.head}>
        <div className={styles.headTop}>
          <span className={styles.pcode}>{plan.id}</span>
          <span>PRIORIDAD</span>
          <span className={styles.priority}>#{rank} de 8</span>
        </div>
        <h3 className={styles.title}>{resumenDim ? resumenDim.nombre : plan.id}</h3>
        <div className={styles.meta}>
          <LevelBadge level={plan.nivel} size="sm" />
          <span className={`${styles.pill} ${styles.pillPlazo}`} style={{ background: s.bg, color: s.fg }}>
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
        <RoleBlock
          iconClass={styles.roleIconSupervisor}
          title="Para el supervisor"
          actions={plan.supervisor}
          loading={loading}
          error={error}
        />
        <RoleBlock
          iconClass={styles.roleIconJefe}
          title="Para el jefe directo"
          actions={plan.jefe}
          loading={loading}
          error={error}
        />
        <RoleBlock
          iconClass={styles.roleIconSistema}
          title="Para el sistema / organización"
          actions={plan.sistema}
          loading={loading}
          error={error}
        />
      </div>

      <footer className={styles.foot}>
        <div className={styles.footLabel}>Indicadores de seguimiento</div>
        {loading ? (
          <div className={styles.loadingKpi}>
            IA generando KPI<span className={styles.dots} />
          </div>
        ) : error ? (
          <div className={styles.footKpi}>No se pudo generar KPI con IA para esta dimensión.</div>
        ) : (
          <div className={styles.footKpi}>{plan.kpi}</div>
        )}
      </footer>
    </article>
  )
}

function RoleBlock({ iconClass, title, actions, loading, error }) {
  return (
    <div className={styles.roleBlock}>
      <div className={styles.roleHead}>
        <span className={iconClass}>IA</span>
        <span className={styles.roleTitle}>{title}</span>
      </div>

      {loading ? (
        <ul className={styles.roleList}>
          <li className={styles.loadingItem}>La IA está generando acciones<span className={styles.dots} /></li>
          <li className={styles.loadingItem}>Ajustando contexto industrial colombiano<span className={styles.dots} /></li>
        </ul>
      ) : error ? (
        <ul className={styles.roleList}>
          <li className={styles.errorItem}>No disponible por fallo de conexión con IA.</li>
        </ul>
      ) : (
        <ul className={styles.roleList}>
          {actions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      )}
    </div>
  )
}

PlanIntervencionAI.propTypes = {
  plan: PropTypes.shape({
    resumen: PropTypes.array.isRequired,
    planes: PropTypes.array.isRequired,
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
}

PlanCard.propTypes = {
  plan: PropTypes.object.isRequired,
  resumenDim: PropTypes.object,
  rank: PropTypes.number.isRequired,
  highlighted: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.bool,
}

RoleBlock.propTypes = {
  iconClass: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
}
