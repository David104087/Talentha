import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LEVEL_STYLES, getSemaforo } from '../constants/levels'
import TablaResumenIPRA from '../components/TablaResumenIPRA'
import PlanIntervencion from '../components/PlanIntervencion'
import '../styles/main.css'

const DEMO_PLAN = {
  supervisor: 'Sofia Moreno',
  ipra_global: 41.4,
  summary: [
    { id: 'D4', name: 'Detención de Trabajos Inseguros (Stop Work)', score: 32.5, weight: 18, level: 'critical', deadline: '0–15 días', priority_order: 1 },
    { id: 'D1', name: 'Controles Críticos y Condiciones del Área',   score: 36.4, weight: 16, level: 'critical', deadline: '0–15 días', priority_order: 2 },
    { id: 'D3', name: 'Cumplimiento y Exigencia de Reglas',          score: 36.4, weight: 14, level: 'critical', deadline: '0–15 días', priority_order: 3 },
    { id: 'D2', name: 'Planeación y Arranque Seguro del Trabajo',    score: 32.5, weight: 13, level: 'critical', deadline: '0–15 días', priority_order: 4 },
    { id: 'D7', name: 'Liderazgo Visible y Coherente',               score: 68.0, weight: 12, level: 'high',     deadline: '15–30 días', priority_order: 5 },
    { id: 'D5', name: 'Aprendizaje de Incidentes',                   score: 32.5, weight: 11, level: 'critical', deadline: '0–15 días', priority_order: 6 },
    { id: 'D6', name: 'Participación y Clima de Seguridad',          score: 32.5, weight:  9, level: 'critical', deadline: '0–15 días', priority_order: 7 },
    { id: 'D8', name: 'Gestión de Fatiga y Factores Humanos',        score: 82.0, weight:  7, level: 'moderate', deadline: '30–60 días', priority_order: 8 },
  ],
  plans: [
    {
      id: 'D4',
      level: 'critical',
      supervisor: [
        'Implement the Stop Work Authority (SWA) protocol in all field operations, ensuring every worker understands their right and obligation to stop unsafe work without fear of reprisal.',
        'Hold daily 5-minute safety huddles explicitly covering Stop Work scenarios, using real examples from the work area to reinforce the culture.',
        'Publicly recognize at least 2 preventive work stoppages per week during team briefings to strengthen positive safety behavior.',
      ],
      manager: [
        'Conduct weekly field visits to validate that the supervisor is actively exercising Stop Work authority and providing backing to workers who interrupt unsafe tasks.',
        'Provide visible organizational support every time a work stoppage occurs — be present, acknowledge the decision, and communicate upward to reinforce the norm.',
      ],
      system: [
        'Create an anonymous reporting channel for unsafe work that was NOT stopped, to detect gaps in Stop Work culture and address them systemically.',
        "Implement a 'Stop Work Champion' recognition badge awarded quarterly to supervisors with the best SWA compliance and reporting metrics.",
      ],
      kpis: [
        'Number of Stop Work events reported per month',
        'Average response time from work stoppage to hazard resolution (hours)',
        '% of workers who can correctly describe the SWA procedure (quarterly survey)',
      ],
    },
    {
      id: 'D1',
      level: 'critical',
      supervisor: [
        'Conduct a critical controls inspection at the start of every shift using the standardized digital checklist before authorizing any work to begin.',
        'Document all substandard conditions found in the digital system on the same day they are identified, including photo evidence and an assigned corrective owner.',
        'Do not authorize the start of any task without completing the full critical controls verification — zero exceptions regardless of operational pressure.',
      ],
      manager: [
        "Audit 30% of the supervisor's inspection records monthly, providing written feedback within 48 hours and escalating recurring gaps to the HSE team.",
        'Allocate sufficient budget and resources for immediate correction of critical findings, removing cost as a barrier to safety compliance.',
      ],
      system: [
        'Digitize the critical controls checklist with electronic signature, geolocation, and timestamping to ensure full traceability and prevent backdating.',
        'Establish a consequence matrix for omission of critical controls, applied consistently across all hierarchical levels without exceptions.',
      ],
      kpis: [
        '% of shifts with completed critical controls checklist (target: 100%)',
        'Number of critical conditions corrected within 24 hours of identification',
        'Average closure time for critical findings (days)',
      ],
    },
    {
      id: 'D3',
      level: 'critical',
      supervisor: ['Intervention action for D3 at critical level — supervisor'],
      manager: ['Intervention action for D3 at critical level — direct manager'],
      system: ['Intervention action for D3 at critical level — system / organization'],
      kpis: ['KPI for D3 at critical level'],
    },
    {
      id: 'D2',
      level: 'critical',
      supervisor: ['Intervention action for D2 at critical level — supervisor'],
      manager: ['Intervention action for D2 at critical level — direct manager'],
      system: ['Intervention action for D2 at critical level — system / organization'],
      kpis: ['KPI for D2 at critical level'],
    },
  ],
}

const NAV_ENTRIES = [
  { id: 'section-summary', label: 'Resumen IPRA' },
  { id: 'section-plans',   label: 'Planes de Intervención' },
]

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
  </svg>
)

function ScoreDial({ value, level }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES['critical']
  const circ = 2 * Math.PI * 62
  const pct = Math.max(0, Math.min(100, value)) / 100

  return (
    <div className="score-dial" aria-label={`IPRA global ${value}`}>
      <svg viewBox="0 0 160 160">
        <circle className="track" cx="80" cy="80" r="62" />
        <circle
          className="fill"
          cx="80"
          cy="80"
          r="62"
          style={{
            stroke: s.fg,
            strokeDasharray: circ,
            strokeDashoffset: circ * (1 - pct),
          }}
        />
      </svg>
      <div className="num">
        <div>
          {value.toFixed(1)}
          <small>puntos / 100</small>
        </div>
      </div>
    </div>
  )
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function SkippedDims({ summary, plans }) {
  const plannedIds = new Set(plans.map(p => p.id))
  const skipped = summary.filter(
    d => (d.level === 'critical' || d.level === 'high') && !plannedIds.has(d.id)
  )
  if (skipped.length === 0) return null

  return (
    <div className="skipped-dims">
      <div className="skipped-header">
        <span className="skipped-title">Dimensiones elegibles sin plan detallado</span>
        <span className="skipped-sub">
          Score &lt; 75 — elegibles para intervención, fuera del top {plans.length} por prioridad de peso
        </span>
      </div>
      <div className="skipped-list">
        {skipped.map(d => {
          const s = LEVEL_STYLES[d.level]
          return (
            <div
              key={d.id}
              className="skipped-item"
              style={{ background: s.bg, borderColor: s.ring }}
            >
              <span className="skipped-code">{d.id}</span>
              <span className="skipped-badge" style={{ color: s.fg }}>
                <span className="skipped-dot" style={{ background: s.fg }} />
                {s.label}
              </span>
              <span className="skipped-name">{d.name}</span>
              <span className="skipped-meta">
                {d.score} pts · peso {d.weight}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function InterventionPlan() {
  const location = useLocation()
  const navigate = useNavigate()
  const plan = location.state?.plan || DEMO_PLAN
  const [selected, setSelected] = useState(plan.plans[0]?.id || 'D4')
  const [navActive, setNavActive] = useState('section-summary')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const globalLevel = getSemaforo(plan.ipra_global)
  const globalStyle = LEVEL_STYLES[globalLevel]

  const criticalCount = plan.summary.filter(d => d.level === 'critical').length
  const avgScore = (plan.summary.reduce((s, d) => s + d.score, 0) / plan.summary.length).toFixed(1)
  const weightedScore = plan.ipra_global.toFixed(1)
  const nearestDeadline = criticalCount > 0 ? '15 días' : plan.summary.some(d => d.level === 'high') ? '30 días' : '60 días'

  return (
    <div className="app">
      {/* Left nav */}
      <aside className="nav">
        <div className="brand">
          <img src="/talentha-mark.png" alt="Talentha" className="brand-mark" />
          <div>
            <div className="brand-name">Talentha</div>
            <div className="brand-sub">IPRA · v2.4</div>
          </div>
        </div>

        <div className="nav-group">
          {NAV_ENTRIES.map(e => (
            <a
              key={e.id}
              className={'nav-item ' + (navActive === e.id ? 'active' : '')}
              onClick={ev => {
                ev.preventDefault()
                setNavActive(e.id)
                scrollTo(e.id)
              }}
              href={`#${e.id}`}
            >
              <span className="dot" />
              <span>{e.label}</span>
            </a>
          ))}
        </div>

        <div className="nav-footer">
          <div className="avatar">SM</div>
          <div>
            <div className="who">Sofía Moreno</div>
            <div className="who-sub">Analista HSE</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>Panel</span>
            <span className="sep">/</span>
            <span>Supervisores</span>
            <span className="sep">/</span>
            <strong>Sofía Moreno</strong>
            <span className="select-chip">PLAN DE INTERVENCIÓN</span>
          </div>
          <div className="top-actions">
            <button className="btn" onClick={() => navigate('/')}
              style={{ borderColor: 'var(--brand-3)', color: 'var(--brand-3)' }}>
              ← Nuevo ingreso
            </button>
            <button className="btn" onClick={() => window.print()}>
              <IconDownload /> Exportar PDF
            </button>
          </div>
        </div>

        <div className="page">
          {/* Hero section */}
          <section className="hero">
            <div>
              <div className="hero-meta">
                <span>REPORTE<b>IPRA-2026-Q1-247</b></span>
                <span>GENERADO<b>2026-04-23</b></span>
                <span>PERÍODO<b>Q1 2026</b></span>
                <span>EVALUADORES<b>12</b></span>
              </div>
              <h1>
                Plan de <em>Intervención</em>
                <br />
                IPRA
              </h1>
              <p className="hero-sub">
                Diagnóstico y hoja de ruta priorizada para reducir el riesgo humano
                medido por el Índice Predictivo de Riesgo en Seguridad.
              </p>
              <div className="hero-supervisor">
                <div className="avatar">SM</div>
                <div className="who-col">
                  <div className="who-name">{plan.supervisor}</div>
                  <div className="who-meta">Coordinador de Operaciones</div>
                  <div className="who-meta">Planta Norte · Manufactura</div>
                  <div className="who-id">SUP-00247</div>
                </div>
              </div>
            </div>

            <div className="score-card">
              <ScoreDial value={plan.ipra_global} level={globalLevel} />
              <div className="score-right">
                <div className="eyebrow">IPRA Global</div>
                <h3>Índice Predictivo de Riesgo en Seguridad</h3>
                <span
                  className="level-chip"
                  style={{ background: globalStyle.bg, color: globalStyle.fg }}
                >
                  <span className="bullet" />
                  {globalStyle.label}
                </span>
                <p>
                  Se requiere intervención inmediata sobre las dimensiones
                  de mayor peso.
                </p>
              </div>
            </div>
          </section>

          {/* KPI strip */}
          <div className="kpi-strip">
            <div className="kpi">
              <div className="kpi-label">Dimensiones críticas</div>
              <div className="kpi-value">
                {criticalCount}
                <span className="unit">/ 8</span>
              </div>
              <div className="kpi-trend">
                <span className="down"><IconArrowUp /></span>
                activación de plan prioritario
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Score promedio</div>
              <div className="kpi-value">{avgScore}</div>
              <div className="kpi-trend">promedio simple 8 dimensiones</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Score ponderado</div>
              <div className="kpi-value">{weightedScore}</div>
              <div className="kpi-trend">peso por dimensión aplicado</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Plazo más próximo</div>
              <div className="kpi-value" style={{ color: '#7F1D1D' }}>
                {nearestDeadline.split(' ')[0]}
                <span className="unit">{nearestDeadline.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="kpi-trend">{criticalCount} dimensiones en 0–15 días</div>
            </div>
          </div>

          {/* Dimensions table section */}
          <section id="section-summary">
            <div className="sec-title">
              <div>
                <div className="eyebrow">SECCIÓN 03 · DIMENSIONES</div>
                <h2>Resumen por dimensión</h2>
                <p>
                  8 dimensiones, 37 ítems · evaluación 360° · haz clic en una fila para enfocar su plan.
                </p>
              </div>
            </div>

            <TablaResumenIPRA
              dimensions={plan.summary}
              selectedId={selected}
              onSelect={id => setSelected(id)}
              defaultSort="priority"
            />
          </section>

          {/* Intervention plans section */}
          <section id="section-plans" style={{ marginTop: 44 }}>
            <div className="sec-title">
              <div>
                <div className="eyebrow">SECCIÓN 04 · INTERVENCIÓN</div>
                <h2>Planes detallados · top {plan.plans.length} prioridades</h2>
                <p>
                  Intervención estructurada por rol. Las {plan.plans.length} dimensiones
                  con mayor impacto ponderado sobre el IPRA Global.
                </p>
              </div>
              <button className="btn ghost" onClick={() => navigate('/')}>
                ← Nueva evaluación
              </button>
            </div>

            <PlanIntervencion
              plans={plan.plans}
              summary={plan.summary}
              highlightedId={selected}
            />

            <SkippedDims summary={plan.summary} plans={plan.plans} />
          </section>

          {/* Page footer */}
          <footer className="page-footer">
            <div className="copyright">
              <span>© 2026 Talentha · Analítica predictiva de seguridad industrial</span>
              <span>IPRA v2.4 · Confidencial</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
