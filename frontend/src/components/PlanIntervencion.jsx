import PropTypes from 'prop-types'
import { LEVEL_STYLES } from '../constants/levels'
import LevelBadge from './LevelBadge'

const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconKpi = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

function PlanCard({ plan, summaryDim, rank, highlighted }) {
  const level = plan.level
  const s = LEVEL_STYLES[level] || LEVEL_STYLES['moderate']

  return (
    <article
      className="plan-card"
      style={
        highlighted
          ? { boxShadow: '0 0 0 2px #4F46E5, 0 20px 48px rgba(79,70,229,0.12)' }
          : undefined
      }
    >
      <header className="plan-head">
        <div className="plan-head-top">
          <span className="pcode">{plan.id}</span>
          <span>PRIORIDAD</span>
          <span className="priority">#{rank} de 8</span>
        </div>
        <h3 className="plan-title">
          {summaryDim ? summaryDim.name : plan.id}
        </h3>
        <div className="plan-meta">
          <LevelBadge level={level} size="sm" />
          <span
            className="pill plazo"
            style={{ background: s.bg, color: s.fg }}
          >
            <IconClock /> {s.deadline}
          </span>
          {summaryDim && (
            <>
              <span className="pill">Score {summaryDim.score.toFixed(1)}</span>
              <span className="pill">Peso {summaryDim.weight}%</span>
            </>
          )}
        </div>
      </header>

      <div className="plan-body">
        <div className="role-block">
          <div className="role-head">
            <span className="role-icon supervisor">SV</span>
            <span className="role-title">Acciones para el Supervisor</span>
            <span className="role-sub">{plan.supervisor.length} acciones</span>
          </div>
          <ul className="role-list supervisor">
            {plan.supervisor.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>

        <div className="role-block">
          <div className="role-head">
            <span className="role-icon jefe">JD</span>
            <span className="role-title">Acciones para el Jefe Directo</span>
            <span className="role-sub">{plan.manager.length} acciones</span>
          </div>
          <ul className="role-list jefe">
            {plan.manager.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>

        <div className="role-block">
          <div className="role-head">
            <span className="role-icon sistema">SI</span>
            <span className="role-title">Acciones para el Sistema / Organización</span>
            <span className="role-sub">{plan.system.length} acciones</span>
          </div>
          <ul className="role-list sistema">
            {plan.system.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="plan-foot">
        <div className="kpi-label">
          <IconKpi /> Indicadores de seguimiento
        </div>
        <div className="kpi-list">
          {plan.kpis.map((kpi, i) => (
            <span key={i}>
              {i > 0 && <span> · </span>}
              {kpi}
            </span>
          ))}
        </div>
      </footer>
    </article>
  )
}

PlanCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    supervisor: PropTypes.arrayOf(PropTypes.string).isRequired,
    manager: PropTypes.arrayOf(PropTypes.string).isRequired,
    system: PropTypes.arrayOf(PropTypes.string).isRequired,
    kpis: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  summaryDim: PropTypes.object,
  rank: PropTypes.number.isRequired,
  highlighted: PropTypes.bool,
}

export default function PlanIntervencion({ plans, summary, highlightedId }) {
  const summaryMap = Object.fromEntries((summary || []).map(d => [d.id, d]))

  return (
    <div className="plans">
      {plans.map((plan, i) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          summaryDim={summaryMap[plan.id]}
          rank={i + 1}
          highlighted={highlightedId === plan.id}
        />
      ))}
    </div>
  )
}

PlanIntervencion.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      level: PropTypes.string.isRequired,
      supervisor: PropTypes.arrayOf(PropTypes.string).isRequired,
      manager: PropTypes.arrayOf(PropTypes.string).isRequired,
      system: PropTypes.arrayOf(PropTypes.string).isRequired,
      kpis: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  summary: PropTypes.array.isRequired,
  highlightedId: PropTypes.string,
}
