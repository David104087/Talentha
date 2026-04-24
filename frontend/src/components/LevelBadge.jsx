import PropTypes from 'prop-types'
import { LEVEL_STYLES } from '../constants/levels'

export default function LevelBadge({ level, size = 'md' }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES['moderado']
  return (
    <span
      className="level-badge"
      style={{
        background: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.ring}55`,
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        fontSize: size === 'sm' ? 11 : 12,
      }}
    >
      <span className="bullet" />
      {s.label}
    </span>
  )
}

LevelBadge.propTypes = {
  level: PropTypes.oneOf(['critico', 'alto', 'moderado', 'bajo']).isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
}
