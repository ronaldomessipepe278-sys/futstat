import { useState } from 'react'
import { INSIGNIAS } from '../logic/insignias.js'

// Colección de insignias: las conseguidas brillan, las demás salen apagadas.
export default function Insignias({ conseguidas }) {
  const [elegida, setElegida] = useState(null)
  const ids = new Set(conseguidas.map((i) => i.id))
  const detalle = INSIGNIAS.find((i) => i.id === elegida)
  const fecha = conseguidas.find((i) => i.id === elegida)?.fecha

  return (
    <div className="rounded-2xl border border-borde bg-panel p-4">
      <p className="font-titulo text-lg font-bold">
        {ids.size}/{INSIGNIAS.length} conseguidas
      </p>
      <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {INSIGNIAS.map((i) => {
          const tiene = ids.has(i.id)
          return (
            <li key={i.id}>
              <button
                onClick={() => setElegida(elegida === i.id ? null : i.id)}
                aria-label={`${i.nombre}: ${i.descripcion}${tiene ? ' (conseguida)' : ''}`}
                aria-pressed={elegida === i.id}
                className="flex w-full flex-col items-center gap-1"
              >
                <span
                  className={`forma-carta flex h-14 w-12 items-center justify-center text-2xl ${
                    tiene
                      ? 'bg-gradient-to-b from-neon/40 to-neon-suave/30 shadow-[0_0_14px_rgb(34_229_240/0.45)]'
                      : 'bg-borde/60 opacity-40 grayscale'
                  } ${elegida === i.id ? 'ring-2 ring-neon' : ''}`}
                >
                  {i.icono}
                </span>
                <span
                  className={`text-center text-[10px] leading-tight ${tiene ? 'text-texto' : 'text-apagado'}`}
                >
                  {i.nombre}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {detalle && (
        <p className="mt-3 rounded-lg bg-fondo/60 p-3 text-center text-sm">
          <strong className="font-titulo">{detalle.nombre}:</strong> {detalle.descripcion}
          {fecha && (
            <span className="block text-xs text-sube">
              Conseguida el{' '}
              {new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </span>
          )}
        </p>
      )}
    </div>
  )
}
