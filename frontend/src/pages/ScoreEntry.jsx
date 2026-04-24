import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatePlan } from '../api/ipra'
import { getSemaforo, LEVEL_STYLES } from '../constants/levels'
import '../styles/score-entry.css'

const INITIAL_DIMS = [
  { id: 'D1', name: 'Controles Críticos y Condiciones del Área',       weight: 16, score: 36.4 },
  { id: 'D2', name: 'Planeación y Arranque Seguro del Trabajo',         weight: 13, score: 32.5 },
  { id: 'D3', name: 'Cumplimiento y Exigencia de Reglas',               weight: 14, score: 36.4 },
  { id: 'D4', name: 'Detención de Trabajos Inseguros (Stop Work)',      weight: 18, score: 32.5 },
  { id: 'D5', name: 'Aprendizaje de Incidentes',                        weight: 11, score: 32.5 },
  { id: 'D6', name: 'Participación y Clima de Seguridad',               weight:  9, score: 32.5 },
  { id: 'D7', name: 'Liderazgo Visible y Coherente',                    weight: 12, score: 68.0 },
  { id: 'D8', name: 'Gestión de Fatiga y Factores Humanos',             weight:  7, score: 82.0 },
]

const SUPERVISOR = {
  nombre: 'Sofía Moreno',
  cargo: 'Coordinador de Operaciones',
  site: 'Planta Norte · Manufactura',
  id: 'SUP-00247',
  evaluators: 12,
  period: 'Q1 2026',
}

function DimRow({ dim, onChange, onReset, hasError }) {
  const level = getSemaforo(dim.score)
  const s = LEVEL_STYLES[level]

  return (
    <tr className={hasError ? 'error' : ''}>
      <td>
        <span className="dim-code">{dim.id}</span>
        <span className="dim-name">{dim.name}</span>
      </td>

      <td className="input-cell">
        <div className="num-field">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={dim.score}
            onChange={e =>
              onChange({ score: e.target.value === '' ? '' : Number(e.target.value) })
            }
            aria-label={`Score ${dim.id}`}
          />
          <span className="unit">/ 100</span>
        </div>
        <div className="mini-bar">
          <span
            style={{
              width: `${Math.max(0, Math.min(100, Number(dim.score) || 0))}%`,
              background: s.fg,
            }}
          />
        </div>
      </td>

      <td className="input-cell">
        <div className="num-field sm">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={dim.weight}
            onChange={e =>
              onChange({ weight: e.target.value === '' ? '' : Number(e.target.value) })
            }
            aria-label={`Peso ${dim.id}`}
          />
          <span className="unit">%</span>
        </div>
      </td>

      <td className="row-action">
        <button
          className="btn ghost sm"
          onClick={onReset}
          title="Restablecer al valor original"
        >
          ↺
        </button>
      </td>
    </tr>
  )
}

export default function ScoreEntry() {
  const navigate = useNavigate()
  const [dims, setDims] = useState(INITIAL_DIMS.map(d => ({ ...d })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const totalWeight = useMemo(
    () => dims.reduce((sum, d) => sum + (Number(d.weight) || 0), 0),
    [dims]
  )

  const ipraPreview = useMemo(() => {
    const tp = totalWeight || 1
    return dims.reduce((sum, d) => sum + (Number(d.score) || 0) * (Number(d.weight) || 0), 0) / tp
  }, [dims, totalWeight])

  const globalLevel = getSemaforo(ipraPreview)

  const errors = useMemo(() => {
    const errs = {}
    dims.forEach(d => {
      if (d.score === '' || Number(d.score) < 0 || Number(d.score) > 100)
        errs[d.id + '_score'] = true
      if (d.weight === '' || Number(d.weight) < 0 || Number(d.weight) > 100)
        errs[d.id + '_weight'] = true
    })
    if (Math.abs(totalWeight - 100) > 0.5) errs.total = true
    return errs
  }, [dims, totalWeight])

  const isValid = Object.keys(errors).length === 0

  function hasRowError(id) {
    return !!(errors[id + '_score'] || errors[id + '_weight'])
  }

  function updateDim(index, patch) {
    setDims(prev => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function resetRow(index) {
    setDims(prev => prev.map((d, i) => (i === index ? { ...INITIAL_DIMS[index] } : d)))
  }

  function resetAll() {
    setDims(INITIAL_DIMS.map(d => ({ ...d })))
    setError(null)
    setSubmitted(false)
  }

  function distributeWeights() {
    const even = Math.round((100 / dims.length) * 10) / 10
    setDims(prev => prev.map(d => ({ ...d, weight: even })))
  }

  async function handleSubmit() {
    setSubmitted(true)
    if (!isValid) {
      setError('Revisa los campos marcados — los pesos deben sumar 100%.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await generatePlan({
        supervisorName: 'Sofia Moreno',
        scores: dims.map(d => ({
          id: d.id,
          name: d.name,
          weight: Number(d.weight),
          score: Number(d.score),
        })),
      })
      navigate('/plan', { state: { plan: result } })
    } catch (err) {
      setError(err.message || 'Error al generar el plan. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const globalLevelStyle = LEVEL_STYLES[globalLevel]

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <img src="/talentha-mark.png" alt="Talentha" className="brand-mark-img" />
          <div>
            <div className="brand-name">Talentha</div>
            <div className="brand-sub">IPRA · Generador de planes</div>
          </div>
        </div>

        <div className="top-user">
          <div className="u-text">
            <div className="u-name">Carolina Mejía</div>
            <div className="u-sub">Analista HSE</div>
          </div>
          <div className="avatar-photo" aria-hidden="true">
            <span>CM</span>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="breadcrumb">
          <span>Panel</span>
          <span className="sep">/</span>
          <span>Supervisores</span>
          <span className="sep">/</span>
          <strong>{SUPERVISOR.nombre}</strong>
          <span className="sep">/</span>
          <span className="muted">Nuevo plan IPRA</span>
        </div>

        <section className="hero">
          <div>
            <div className="eyebrow">PASO 2 DE 3 · INGRESO DE SCORES</div>
            <h1>
              Ingresa el <em>peso</em> y el <em>score</em> de cada dimensión
            </h1>
            <p className="sub">
              El supervisor ya está registrado. Completa únicamente los valores numéricos por
              dimensión — los nombres y la estructura 360° se mantienen fijos por metodología.
            </p>
          </div>

          <div className="supervisor-card">
            <div className="who-row">
              <div className="avatar-lg">SM</div>
              <div>
                <div className="who-name">{SUPERVISOR.nombre}</div>
                <div className="who-meta">{SUPERVISOR.cargo}</div>
                <div className="who-meta">{SUPERVISOR.site}</div>
                <div className="who-id">
                  {SUPERVISOR.id} · {SUPERVISOR.period}
                </div>
              </div>
            </div>
            <div className="who-stats">
              <div>
                <span>{SUPERVISOR.evaluators}</span>
                <small>Evaluadores 360°</small>
              </div>
              <div>
                <span>8</span>
                <small>Dimensiones</small>
              </div>
              <div>
                <span>37</span>
                <small>Ítems</small>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flash error">{error}</div>
        )}

        <section className="form-card">
          <div className="form-toolbar">
            <div>
              <div className="eyebrow">DIMENSIONES IPRA · 8</div>
              <h2>Scores por dimensión</h2>
            </div>
            <div className="toolbar-actions">
              <button className="btn ghost" onClick={distributeWeights}>
                Distribuir pesos iguales
              </button>
              <button className="btn ghost" onClick={resetAll}>
                Restablecer
              </button>
            </div>
          </div>

          <table className="form-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Dimensión</th>
                <th>Score (0–100)</th>
                <th>Peso (%)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dims.map((dim, i) => (
                <DimRow
                  key={dim.id}
                  dim={dim}
                  hasError={submitted && hasRowError(dim.id)}
                  onChange={patch => updateDim(i, patch)}
                  onReset={() => resetRow(i)}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <strong>Totales</strong>
                </td>
                <td className="muted">
                  Promedio ponderado:{' '}
                  <strong style={{ color: globalLevelStyle.fg }}>
                    {ipraPreview.toFixed(1)}
                  </strong>
                </td>
                <td>
                  <LevelBadge level={globalLevel} />
                </td>
                <td>
                  <strong
                    style={{
                      color: Math.abs(totalWeight - 100) > 0.5 ? '#B91C1C' : '#059669',
                    }}
                  >
                    {totalWeight}%
                  </strong>
                </td>
                <td colSpan="2" className="muted">
                  {Math.abs(totalWeight - 100) > 0.5
                    ? '⚠ Los pesos deben sumar exactamente 100%'
                    : '✓ Listo para generar'}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="form-footer">
          <div className="actions" style={{ marginLeft: 'auto' }}>
            <button className="btn ghost" onClick={() => navigate(-1)}>
              ← Cancelar
            </button>
            <button
              className="btn primary"
              onClick={handleSubmit}
              disabled={loading || (!isValid && submitted)}
            >
              {loading ? 'Generando…' : 'Generar plan IPRA →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
