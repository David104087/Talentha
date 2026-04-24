import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LEVEL_STYLES, getSemaforo } from '../constants/levels'
import { generatePlanAI } from '../api/ipra'
import { generarPlanIntervencion } from '../lib/generarPlan'
import PlanIntervencionAI from '../components/PlanIntervencionAI'
import '../styles/main.css'

const DEFAULT_PAYLOAD = {
  nombreSupervisor: 'Sofia Moreno',
  scores: [
    { id: 'D1', nombre: 'Controles Críticos y Condiciones del Área', peso: 16, score: 36.4 },
    { id: 'D2', nombre: 'Planeación y Arranque Seguro del Trabajo', peso: 13, score: 32.5 },
    { id: 'D3', nombre: 'Cumplimiento y Exigencia de Reglas', peso: 14, score: 36.4 },
    { id: 'D4', nombre: 'Detención de Trabajos Inseguros (Stop Work)', peso: 18, score: 32.5 },
    { id: 'D5', nombre: 'Aprendizaje de Incidentes', peso: 11, score: 32.5 },
    { id: 'D6', nombre: 'Participación y Clima de Seguridad', peso: 9, score: 32.5 },
    { id: 'D7', nombre: 'Liderazgo Visible y Coherente', peso: 12, score: 68.0 },
    { id: 'D8', nombre: 'Gestión de Fatiga y Factores Humanos', peso: 7, score: 82.0 },
  ],
}

function ScoreDial({ value, level }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES['critico']
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
            transition: 'stroke-dashoffset 0.9s ease',
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

export default function InterventionPlanAI() {
  const location = useLocation()
  const navigate = useNavigate()

  const payload = location.state?.payload || DEFAULT_PAYLOAD

  const basePlan = useMemo(
    () => generarPlanIntervencion(payload.scores, payload.nombreSupervisor),
    [payload]
  )

  const [plan, setPlan] = useState(basePlan)
  const [loadingAI, setLoadingAI] = useState(true)
  const [errorAI, setErrorAI] = useState('')
  const [selected, setSelected] = useState(basePlan.planes[0]?.id || 'D4')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let active = true

    async function run() {
      setLoadingAI(true)
      setErrorAI('')
      try {
        const result = await generatePlanAI(payload)
        await new Promise(resolve => setTimeout(resolve, 1200))
        if (!active) return
        setPlan(result)
        if (result.planes?.[0]?.id) setSelected(result.planes[0].id)
      } catch (err) {
        if (!active) return
        setErrorAI(err.message || 'No se pudo contactar a la IA en este momento.')
      } finally {
        if (active) setLoadingAI(false)
      }
    }

    run()
    return () => { active = false }
  }, [payload])

  const criticalCount = useMemo(
    () => plan.resumen.filter(d => d.nivel === 'critico').length,
    [plan.resumen]
  )

  const avgScore = useMemo(
    () => (plan.resumen.reduce((s, d) => s + d.score, 0) / plan.resumen.length).toFixed(1),
    [plan.resumen]
  )

  const nivelGlobal = getSemaforo(plan.ipra_global)
  const estiloGlobal = LEVEL_STYLES[nivelGlobal]

  return (
    <div className="app">
      <aside className="nav">
        <div className="brand">
          <img src="/talentha-mark.png" alt="Talentha" className="brand-mark" />
          <div>
            <div className="brand-name">Talentha</div>
            <div className="brand-sub">IPRA · v2.4</div>
          </div>
        </div>

        <div className="nav-group">
          <a className="nav-item" href="#section-summary" onClick={e => e.preventDefault()}>
            <span className="dot" />
            <span>Resumen IPRA</span>
          </a>
          <a className="nav-item" href="#section-plans" onClick={e => e.preventDefault()}>
            <span className="dot" />
            <span>Planes con IA</span>
          </a>
        </div>

        <div className="nav-footer">
          <div className="avatar">SM</div>
          <div>
            <div className="who">Sofía Moreno</div>
            <div className="who-sub">Analista HSE</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="crumbs">
            <span>Panel</span>
            <span className="sep">/</span>
            <span>Supervisores</span>
            <span className="sep">/</span>
            <strong>{plan.supervisor}</strong>
            <span className="select-chip">PLAN DE INTERVENCIÓN CON IA (BONUS)</span>
          </div>
          <div className="top-actions">
            <button
              className="btn"
              onClick={() => navigate('/')}
              style={{ borderColor: 'var(--brand-3)', color: 'var(--brand-3)' }}
            >
              ← Nuevo ingreso
            </button>
          </div>
        </div>

        <div className="page">
          <section className="hero">
            <div>
              <div className="hero-meta">
                <span>MODO<b>BONUS IA</b></span>
                <span>MODELO<b>gpt-4o</b></span>
                <span>PERÍODO<b>Q1 2026</b></span>
                <span>ESTADO<b>{loadingAI ? 'Generando' : errorAI ? 'Sin conexión IA' : 'Completado'}</b></span>
              </div>
              <h1>
                Plan de <em>Intervención</em>
                <br />
                con IA
              </h1>
              <p className="hero-sub">
                Funcionalidad extra y separada del enunciado base: la estructura se conserva,
                pero el contenido de acciones y KPI se genera con IA en el backend.
              </p>
            </div>

            <div className="score-card">
              <ScoreDial value={plan.ipra_global} level={nivelGlobal} />
              <div className="score-right">
                <div className="eyebrow">IPRA Global</div>
                <h3>Índice Predictivo de Riesgo en Seguridad</h3>
                <span className="level-chip" style={{ background: estiloGlobal.bg, color: estiloGlobal.fg }}>
                  <span className="bullet" />
                  {estiloGlobal.label}
                </span>
                <p>Las acciones se ajustan al contexto industrial colombiano.</p>
              </div>
            </div>
          </section>

          {errorAI && <div className="flash error">{errorAI}</div>}

          <div className="kpi-strip">
            <div className="kpi">
              <div className="kpi-label">Dimensiones críticas</div>
              <div className="kpi-value">{criticalCount}<span className="unit">/ 8</span></div>
              <div className="kpi-trend">intervención prioritaria</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Score promedio</div>
              <div className="kpi-value">{avgScore}</div>
              <div className="kpi-trend">promedio simple 8 dimensiones</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Score ponderado (IPRA)</div>
              <div className="kpi-value">{plan.ipra_global.toFixed(1)}</div>
              <div className="kpi-trend">peso por dimensión aplicado</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Generación IA</div>
              <div className="kpi-value" style={{ color: loadingAI ? '#4F46E5' : errorAI ? '#7F1D1D' : '#059669' }}>
                {loadingAI ? '...' : errorAI ? 'Error' : 'OK'}
              </div>
              <div className="kpi-trend">endpoint /api/plan-intervencion-ia/</div>
            </div>
          </div>

          <div id="section-summary">
            <PlanIntervencionAI
              plan={plan}
              loading={loadingAI}
              error={errorAI}
              selectedId={selected}
              onSelect={setSelected}
            />
          </div>

          <footer className="page-footer">
            <div className="copyright">
              <span>© 2026 Talentha · Analítica predictiva de seguridad industrial</span>
              <span>Módulo BONUS IA (separado del enunciado base)</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
