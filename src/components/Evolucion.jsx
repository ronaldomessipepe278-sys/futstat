// Gráfica de línea con la valoración después de cada partido.
export default function Evolucion({ puntos }) {
  if (puntos.length < 2) {
    return (
      <p className="text-sm text-apagado">
        Apunta un partido y aquí verás cómo sube o baja tu valoración.
      </p>
    )
  }

  const ancho = 300
  const alto = 90
  const min = Math.min(...puntos) - 3
  const max = Math.max(...puntos) + 3
  const x = (i) => (i / (puntos.length - 1)) * ancho
  const y = (v) => alto - ((v - min) / (max - min)) * alto
  const linea = puntos.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  return (
    <svg
      viewBox={`-8 -14 ${ancho + 16} ${alto + 28}`}
      className="w-full"
      role="img"
      aria-label={`Valoración: de ${puntos[0]} a ${puntos.at(-1)}`}
    >
      <polygon
        points={`0,${alto} ${linea} ${ancho},${alto}`}
        style={{ fill: 'color-mix(in srgb, var(--color-neon) 15%, transparent)' }}
      />
      <polyline
        points={linea}
        fill="none"
        stroke="var(--color-neon)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {puntos.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r="3.5"
          fill="var(--color-fondo)"
          stroke="var(--color-neon)"
          strokeWidth="2"
        />
      ))}
      <text
        x={ancho}
        y={y(puntos.at(-1)) - 9}
        textAnchor="end"
        fill="var(--color-neon)"
        className="font-titulo text-[13px] font-bold"
      >
        {puntos.at(-1)}
      </text>
    </svg>
  )
}
