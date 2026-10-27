import { useState } from 'react'
import { AJUSTES, ATRIBUTOS } from '../logic/valoracion.js'

const MEDIA_INICIAL = AJUSTES.puntosParaRepartir / ATRIBUTOS.length

// Sirve para crear la carta y también para editarla (si llega `jugador`).
export default function CrearCarta({ jugador, onGuardar, onCancelar }) {
  const [apodo, setApodo] = useState(jugador?.apodo ?? '')
  const [base, setBase] = useState(
    jugador?.base ?? Object.fromEntries(ATRIBUTOS.map(({ clave }) => [clave, MEDIA_INICIAL])),
  )

  const usados = Object.values(base).reduce((suma, n) => suma + n, 0)
  const restantes = AJUSTES.puntosParaRepartir - usados
  const apodoLimpio = apodo.trim()
  const apodoValido = apodoLimpio.length >= 2 && apodoLimpio.length <= 16

  function cambiar(clave, valor) {
    // No dejamos pasar del total de puntos disponibles
    const maximo = Math.min(AJUSTES.atributoMax, base[clave] + restantes)
    setBase({ ...base, [clave]: Math.min(valor, maximo) })
  }

  function guardar(evento) {
    evento.preventDefault()
    if (apodoValido) onGuardar({ apodo: apodoLimpio, base })
  }

  return (
    <form onSubmit={guardar} className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">
          {jugador ? 'Editar mi carta' : 'Crea tu carta'}
        </h1>
        <p className="mt-1 text-sm text-apagado">
          Solo necesitamos un apodo. No pongas tu nombre real.
        </p>
      </div>

      <label className="block">
        <span className="font-titulo text-sm tracking-widest text-apagado uppercase">Apodo</span>
        <input
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          maxLength={16}
          placeholder="Ej: ElRayo"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-borde bg-panel px-4 py-3 font-titulo text-xl outline-none focus:border-neon"
        />
      </label>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="font-titulo text-sm tracking-widest text-apagado uppercase">
            Tus atributos
          </span>
          <span
            className={`font-titulo text-sm ${restantes > 0 ? 'text-neon' : 'text-apagado'}`}
          >
            Puntos libres: {restantes}
          </span>
        </div>
        <p className="mt-1 text-xs text-apagado">
          Reparte {AJUSTES.puntosParaRepartir} puntos. Para subir uno, baja otro. Luego tus
          partidos los irán moviendo.
        </p>

        <ul className="mt-4 space-y-4">
          {ATRIBUTOS.map(({ clave, nombre }) => (
            <li key={clave}>
              <div className="flex justify-between font-titulo">
                <span>{nombre}</span>
                <span className="font-bold text-neon">{base[clave]}</span>
              </div>
              <input
                type="range"
                min={AJUSTES.atributoMin}
                max={AJUSTES.atributoMax}
                value={base[clave]}
                onChange={(e) => cambiar(clave, Number(e.target.value))}
                className="mt-1 w-full"
                aria-label={nombre}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-xl border border-borde py-4 font-titulo font-bold"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!apodoValido}
          className="flex-[2] rounded-xl bg-neon py-4 font-titulo text-lg font-bold text-fondo disabled:opacity-40"
        >
          {jugador ? 'Guardar cambios' : 'Crear mi carta'}
        </button>
      </div>
    </form>
  )
}
