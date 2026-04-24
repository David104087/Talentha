import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { LEVEL_STYLES } from '../constants/levels'
import LevelBadge from './LevelBadge'

export default function TablaResumenIPRA({
  dimensions,
  selectedId,
  onSelect,
  defaultSort = 'priority',
}) {
  const [sort, setSort] = useState(defaultSort)

  const sorted = useMemo(() => {
    const arr = [...dimensions]
    if (sort === 'priority') arr.sort((a, b) => a.priority_order - b.priority_order)
    if (sort === 'score') arr.sort((a, b) => a.score - b.score)
    if (sort === 'weight') arr.sort((a, b) => b.weight - a.weight)
    return arr
  }, [dimensions, sort])

  const sortLabel = sort === 'priority' ? 'prioridad' : sort === 'score' ? 'score ascendente' : 'peso'
  const maxWeight = Math.max(...dimensions.map(d => d.weight), 1)

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          <strong style={{ color: 'var(--ink)' }}>{dimensions.length} dimensiones</strong>{' '}
          ordenadas por{' '}
          <span style={{ color: 'var(--ink)' }}>{sortLabel}</span>
        </div>
        <div className="seg">
          <button
            className={sort === 'priority' ? 'on' : ''}
            onClick={() => setSort('priority')}
          >
            Prioridad
          </button>
          <button
            className={sort === 'score' ? 'on' : ''}
            onClick={() => setSort('score')}
          >
            Score
          </button>
          <button
            className={sort === 'weight' ? 'on' : ''}
            onClick={() => setSort('weight')}
          >
            Peso
          </button>
        </div>
      </div>

      <table className="dim-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Dimensión</th>
            <th>Score</th>
            <th>Nivel</th>
            <th>Peso</th>
            <th>Plazo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(d => {
            const s = LEVEL_STYLES[d.level] || LEVEL_STYLES['moderate']
            const isSelected = selectedId === d.id
            return (
              <tr
                key={d.id}
                className={isSelected ? 'selected' : ''}
                onClick={() => onSelect && onSelect(d.id)}
                style={isSelected ? { background: '#EEF0FE' } : undefined}
              >
                <td>
                  <span className="dim-code">{d.id}</span>
                  <span className="dim-name">{d.name}</span>
                  {isSelected && (
                    <span className="select-chip">seleccionado</span>
                  )}
                </td>
                <td>
                  <div className="score-cell">
                    <span className="score-num" style={{ color: s.fg }}>
                      {d.score.toFixed(1)}
                    </span>
                    <div className="score-bar">
                      <span style={{ width: `${d.score}%`, background: s.fg }} />
                    </div>
                  </div>
                </td>
                <td>
                  <LevelBadge level={d.level} size="sm" />
                </td>
                <td className="weight-cell">
                  <span className="bar">
                    <span style={{ width: `${(d.weight / maxWeight) * 100}%` }} />
                  </span>
                  {d.weight}%
                </td>
                <td className="plazo-cell">{d.deadline}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

TablaResumenIPRA.propTypes = {
  dimensions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      weight: PropTypes.number.isRequired,
      level: PropTypes.string.isRequired,
      deadline: PropTypes.string.isRequired,
      priority_order: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
  defaultSort: PropTypes.oneOf(['priority', 'score', 'weight']),
}
