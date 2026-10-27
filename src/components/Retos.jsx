import { diasParaNuevosRetos, retosActuales } from '../logic/retos.js'

export default function Retos({ partidos }) {
  const retos = retosActuales(partidos)
  const hechos = retos.filter((r) => r.completado).length
  const dias = diasParaNuevosRetos()

  return (
    <div className="rounded-2xl border border-borde bg-panel p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-titulo text-lg font-bold">
          {hechos === retos.length ? '¡Semana completada! 🎉' : `${hechos}/${retos.length} hechos`}
        </span>
        <span className="text-xs text-apagado">
          Cambian en {dias} {dias === 1 ? 'día' : 'días'}
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        {retos.map((r) => (
          <li key={r.id}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className={r.completado ? 'text-sube' : ''}>
                {r.completado ? '✓ ' : ''}
                {r.texto}
              </span>
              <span className="font-titulo font-bold text-apagado">
                {r.valor}/{r.objetivo}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-borde">
              <div
                className={`h-1.5 rounded-full transition-all ${r.completado ? 'bg-sube' : 'bg-neon'}`}
                style={{ width: `${(r.valor / r.objetivo) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
