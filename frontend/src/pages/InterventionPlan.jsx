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
        'Realizar al menos 2 recorridos diarios por el área identificando condiciones inseguras y documentando en bitácora física o digital.',
        'Detener inmediatamente cualquier tarea donde el trabajador no cuente con los EPP requeridos o donde las condiciones del entorno representen riesgo inminente, sin importar el impacto en productividad.',
        'Facilitar una reunión de 5 minutos al inicio de cada turno para repasar los riesgos del día y reforzar el derecho y la obligación de detener trabajos inseguros.',
        'Reconocer públicamente a cada trabajador que ejerza el Stop Work correctamente, reforzando la conducta positiva ante el equipo.',
        'Registrar cada evento de detención en el formato corporativo indicando causa, acción tomada y resolución, y compartirlo con el jefe directo en las primeras 2 horas.',
      ],
      manager: [
        'Revisar semanalmente el registro de eventos Stop Work del supervisor y dar retroalimentación formal sobre la calidad de la respuesta y documentación.',
        'Garantizar que el supervisor cuente con autoridad real y respaldo gerencial para detener operaciones sin presión de cumplimiento de metas productivas.',
        'Incluir el indicador de eventos Stop Work ejercidos como variable positiva en la evaluación de desempeño mensual del supervisor.',
        'Realizar una sesión de acompañamiento en campo mínimo una vez por semana para observar y reforzar la conducta del supervisor frente a condiciones inseguras.',
      ],
      system: [
        'Implementar un protocolo documentado de Stop Work con definición clara de criterios de activación, pasos de actuación y responsables, disponible físicamente en el área.',
        'Garantizar que todos los trabajadores del área reciban capacitación formal (mínimo 2 horas) sobre el derecho y el deber de detener trabajos inseguros, con firma de asistencia.',
        'Crear un canal de reporte anónimo para que los trabajadores puedan escalar situaciones donde el Stop Work no fue ejercido o fue ignorado.',
        'Revisar los últimos 6 meses de incidentes del área para identificar si hubo señales previas no atendidas que debieron activar un Stop Work.',
      ],
      kpis: [
        'Número de eventos Stop Work registrados por semana',
        '% de eventos con cierre documentado en < 2 horas',
        'Número de trabajadores que ejercieron Stop Work en el período',
        '% de recorridos de seguridad realizados vs programados',
        'Tiempo promedio de resolución por evento Stop Work',
      ],
    },
    {
      id: 'D1',
      level: 'critical',
      supervisor: [
        'Verificar al inicio de cada turno que los controles críticos del área (barreras físicas, enclavamientos, señalización, permisos de trabajo) estén operativos y registrar el resultado en lista de chequeo.',
        'Identificar y reportar de inmediato cualquier control crítico degradado o ausente al jefe directo, sin esperar el reporte periódico.',
        'No autorizar el inicio de ninguna tarea de alto riesgo si los controles críticos asociados no están en condición verificada y operativa.',
        'Liderar una inspección semanal de condiciones del área con participación de al menos un trabajador del equipo, rotando quién acompaña cada semana.',
        'Documentar y escalar toda condición subestándar identificada en el formato correspondiente con fotografía, descripción y acción inmediata tomada.',
      ],
      manager: [
        'Auditar mensualmente las listas de chequeo de controles críticos del supervisor y verificar que los registros sean consistentes con las condiciones reales del área.',
        'Gestionar con mantenimiento y la gerencia técnica la corrección de controles críticos degradados en plazos máximos de 24 horas para riesgos inmediatos y 72 horas para riesgos latentes.',
        'Definir junto con el área de HSE el inventario actualizado de controles críticos del área y asegurarse de que el supervisor lo conozca y tenga acceso a él.',
        'Revisar con el supervisor los resultados de las inspecciones semanales y priorizar acciones correctivas en conjunto.',
      ],
      system: [
        'Actualizar y publicar el mapa de controles críticos por área con responsables, frecuencia de verificación y criterios de falla, accesible para supervisores y operarios.',
        'Establecer un sistema de alertas tempranas (digital o físico) que notifique automáticamente al jefe directo y al área de HSE cuando un control crítico sea reportado como degradado.',
        'Incluir la verificación de controles críticos como ítem obligatorio en las auditorías internas de seguridad con frecuencia mínima mensual.',
        'Revisar el historial de incidentes y casi-accidentes del área asociados a falla de controles críticos para identificar patrones recurrentes y rediseñar los controles si es necesario.',
      ],
      kpis: [
        '% de listas de chequeo de controles críticos completadas diariamente',
        'Número de controles críticos degradados identificados por semana',
        'Tiempo promedio de corrección de controles críticos reportados',
        '% de inspecciones semanales realizadas con participación del equipo',
        'Número de tareas de alto riesgo detenidas por control crítico no verificado',
      ],
    },
    {
      id: 'D3',
      level: 'critical',
      supervisor: ['Acción de intervención para D3 en nivel crítico — supervisor.'],
      manager: ['Acción de intervención para D3 en nivel crítico — jefe directo.'],
      system: ['Acción de intervención para D3 en nivel crítico — sistema / organización.'],
      kpis: ['% de mejora en el score de D3 en la próxima evaluación'],
    },
    {
      id: 'D2',
      level: 'critical',
      supervisor: ['Acción de intervención para D2 en nivel crítico — supervisor.'],
      manager: ['Acción de intervención para D2 en nivel crítico — jefe directo.'],
      system: ['Acción de intervención para D2 en nivel crítico — sistema / organización.'],
      kpis: ['% de mejora en el score de D2 en la próxima evaluación'],
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
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="score-dial" aria-label={`IPRA global ${value}`} data-animated={animate ? 'true' : 'false'}>
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
            strokeDashoffset: animate ? circ * (1 - pct) : circ,
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
