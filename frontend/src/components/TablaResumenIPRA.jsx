import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { LEVEL_STYLES } from '../constants/levels'
import LevelBadge from './LevelBadge'
import styles from './TablaResumenIPRA.module.css'

/**
 * Componente reutilizable — Bonus B.
 * Muestra las 8 dimensiones IPRA con score, nivel con color de semáforo,
 * peso y plazo. Soporta selección de fila y ordenamiento por:
 *   - prioridad (usa `prioridad_orden` del plan)
 *   - score ascendente (menor score = más urgente)
 *   - peso descendente
 *
 * Contrato esperado en `dimensions[*]` (claves en español):
 *   id, nombre, score, peso, nivel, plazo, prioridad_orden
 */
export default function TablaResumenIPRA({
  dimensions,
  selectedId,
  onSelect,
  defaultSort = 'prioridad',
}) {
  const [sort, setSort] = useState(defaultSort)

  const sorted = useMemo(() => {
    const arr = [...dimensions]
    if (sort === 'prioridad') arr.sort((a, b) => a.prioridad_orden - b.prioridad_orden)
    if (sort === 'score')     arr.sort((a, b) => a.score - b.score)
    if (sort === 'peso')      arr.sort((a, b) => b.peso - a.peso)
    return arr
  }, [dimensions, sort])

  const sortLabel = sort === 'prioridad' ? 'prioridad' : sort === 'score' ? 'score ascendente' : 'peso'
  const maxPeso = Math.max(...dimensions.map(d => d.peso), 1)

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLabel}>
          <strong>{dimensions.length} dimensiones</strong> ordenadas por{' '}
          <span style={{ color: '#0F0D2E' }}>{sortLabel}</span>
        </div>
        <div className={styles.seg}>
          <button
            className={sort === 'prioridad' ? styles.segButtonActive : styles.segButton}
            onClick={() => setSort('prioridad')}
          >
            Prioridad
          </button>
          <button
            className={sort === 'score' ? styles.segButtonActive : styles.segButton}
            onClick={() => setSort('score')}
          >
            Score
          </button>
          <button
            className={sort === 'peso' ? styles.segButtonActive : styles.segButton}
            onClick={() => setSort('peso')}
          >
            Peso
          </button>
        </div>
      </div>

      <table className={styles.table}>
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
            const s = LEVEL_STYLES[d.nivel] || LEVEL_STYLES['moderado']
            const isSelected = selectedId === d.id
            return (
              <tr
                key={d.id}
                className={isSelected ? styles.selected : ''}
                onClick={() => onSelect && onSelect(d.id)}
              >
                <td>
                  <span className={styles.dimCode}>{d.id}</span>
                  <span className={styles.dimName}>{d.nombre}</span>
                  {isSelected && <span className={styles.selectedChip}>seleccionado</span>}
                </td>
                <td>
                  <div className={styles.scoreCell}>
                    <span className={styles.scoreNum} style={{ color: s.fg }}>
                      {d.score.toFixed(1)}
                    </span>
                    <div className={styles.scoreBar}>
                      <span style={{ width: `${d.score}%`, background: s.fg }} />
                    </div>
                  </div>
                </td>
                <td>
                  <LevelBadge level={d.nivel} size="sm" />
                </td>
                <td className={styles.weightCell}>
                  <span className={styles.weightBar}>
                    <span style={{ width: `${(d.peso / maxPeso) * 100}%` }} />
                  </span>
                  {d.peso}%
                </td>
                <td className={styles.plazoCell}>{d.plazo}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

TablaResumenIPRA.propTypes = {
  /** Lista de 8 dimensiones IPRA anotadas por el generador. */
  dimensions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      peso: PropTypes.number.isRequired,
      nivel: PropTypes.oneOf(['critico', 'alto', 'moderado', 'bajo']).isRequired,
      plazo: PropTypes.string.isRequired,
      prioridad_orden: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Id de la dimensión actualmente resaltada. */
  selectedId: PropTypes.string,
  /** Callback que recibe el id al hacer clic en una fila. */
  onSelect: PropTypes.func,
  /** Ordenamiento inicial de la tabla. */
  defaultSort: PropTypes.oneOf(['prioridad', 'score', 'peso']),
}
