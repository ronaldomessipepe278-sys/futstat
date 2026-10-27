import { useState } from 'react'
import { claveSemana, ganadores, recuento, semanaPasada } from '../logic/mvp.js'
import { diasParaNuevosRetos } from '../logic/retos.js'

// Votación del MVP de la semana dentro de un grupo
export default function Mvp({ jugadores, yo, votos, onVotar }) {
  const [enviando, setEnviando] = useState(null)
  const [error, setError] = useState('')

  const semana = claveSemana()
  const cuenta = recuento(votos, semana)
  const miVoto = votos.find((v) => v.semana === semana && v.votante_id === yo.id)?.votado_id
  const votantes = votos.filter((v) => v.semana === semana).length
  const ganadoresPasados = ganadores(votos, semanaPasada())
    .map((id) => jugadores.find((j) => j.id === id))
    .filter(Boolean)
  const votosPasados = recuento(votos, semanaPasada())
  const candidatos = jugadores
    .filter((j) => j.id !== yo.id)
    .sort((a, b) => (cuenta[b.id] ?? 0) - (cuenta[a.id] ?? 0))
  const dias = diasParaNuevosRetos()

  async function votar(id) {
    setError('')
    setEnviando(id)
    try {
      await onVotar(id)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div className="space-y-6">
      {ganadoresPasados.length > 0 && (
        <div className="brillo-neon rounded-2xl border border-neon/60 bg-neon/10 p-4 text-center">
          <div className="font-titulo text-xs tracking-[0.3em] text-neon uppercase">
            MVP de la semana pasada
          </div>
          <div className="mt-1 font-titulo text-2xl font-bold">
            👑 {ganadoresPasados.map((j) => (j.id === yo.id ? '¡Tú!' : j.apodo)).join(' y ')}
          </div>
          <div className="text-xs text-apagado">
            {votosPasados[ganadoresPasados[0].id]}{' '}
            {votosPasados[ganadoresPasados[0].id] === 1 ? 'voto' : 'votos'}
            {ganadoresPasados.length > 1 && ' cada uno (empate)'}
          </div>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-titulo text-sm tracking-widest text-apagado uppercase">
            Vota al MVP de esta semana
          </h2>
          <span className="text-xs text-apagado">
            Cierra en {dias} {dias === 1 ? 'día' : 'días'}
          </span>
        </div>
        <p className="mb-3 text-sm text-apagado">
          ¿Quién se lo ha currado más? {votantes} de {jugadores.length} han votado. Puedes cambiar
          tu voto hasta el domingo.
        </p>
        {(cuenta[yo.id] ?? 0) > 0 && (
          <p className="mb-3 font-titulo text-sm text-neon">
            🔥 Tú llevas {cuenta[yo.id]} {cuenta[yo.id] === 1 ? 'voto' : 'votos'} esta semana
          </p>
        )}
        {error && <p className="mb-2 text-sm text-baja">{error}</p>}

        {candidatos.length === 0 ? (
          <p className="text-sm text-apagado">Invita a alguien al grupo para poder votar.</p>
        ) : (
          <ul className="space-y-2">
            {candidatos.map((j) => {
              const elegido = miVoto === j.id
              const n = cuenta[j.id] ?? 0
              return (
                <li
                  key={j.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                    elegido ? 'border-neon/60 bg-neon/5' : 'border-borde bg-panel'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-titulo font-bold">{j.apodo}</span>
                    <span className="text-xs text-apagado">
                      {n} {n === 1 ? 'voto' : 'votos'}
                    </span>
                  </span>
                  <button
                    onClick={() => votar(j.id)}
                    disabled={elegido || enviando !== null}
                    aria-pressed={elegido}
                    className={`rounded-lg px-4 py-2 font-titulo text-sm font-bold ${
                      elegido
                        ? 'bg-neon text-fondo'
                        : 'border border-neon/60 text-neon disabled:opacity-50'
                    }`}
                  >
                    {elegido ? 'Tu voto ✓' : enviando === j.id ? 'Votando…' : 'Votar'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
