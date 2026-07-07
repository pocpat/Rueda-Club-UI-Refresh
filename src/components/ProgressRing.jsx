/**
 * Circular SVG progress ring — represents the circular nature of Rueda.
 * size in px, stroke in px, percent 0-100, color is a CSS color.
 */
export default function ProgressRing({ percent, size = 60, stroke = 4, color = '#4ecdc4', children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        {/* Track */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--glass-border)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}