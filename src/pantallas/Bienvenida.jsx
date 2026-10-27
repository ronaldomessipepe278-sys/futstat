import { useState } from 'react'

// Primera pantalla cuando hay cuentas: crear carta nueva o entrar con tu código.
export default function Bienvenida({ invitado, onCrear, onEntrar }) {
  const [modo, setModo] = useState('inicio')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await onEntrar(codigo)
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6 pt-6 text-center">
      <div>
        <h1 className="font-titulo text-4xl font-bold">
          Tu carta de <span className="text-neon">jugador</span>
        </h1>
        <p className="mt-3 text-apagado">
          Apunta tus partidos, sube tu valoración y pica a tus colegas en el ranking.
        </p>
      </div>

      {invitado && (
        <div className="rounded-xl border border-neon/40 bg-neon/5 p-4 text-sm">
          Te han invitado a un grupo. Crea tu carta (o entra con tu código) y te unirás al momento.
        </div>
      )}

      {modo === 'inicio' ? (
        <div className="space-y-3">
          <button
            onClick={onCrear}
            className="w-full rounded-xl bg-neon py-4 font-titulo text-xl font-bold text-fondo shadow-[0_0_24px_color-mix(in_srgb,var(--color-neon)_40%,transparent)]"
          >
            Crear mi carta
          </button>
          <button
            onClick={() => setModo('entrar')}
            className="w-full rounded-xl border border-borde py-4 font-titulo font-bold"
          >
            Ya tengo carta: entrar con mi código
          </button>
        </div>
      ) : (
        <form onSubmit={entrar} className="space-y-3 text-left">
          <label className="block">
            <span className="font-titulo text-sm tracking-widest text-apagado uppercase">
              Tu código de acceso
            </span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck="false"
              className="mt-2 w-full rounded-xl border border-borde bg-panel px-4 py-3 text-center font-titulo text-2xl tracking-widest uppercase outline-none focus:border-neon"
            />
          </label>
          {error && <p className="text-sm text-baja">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModo('inicio')}
              className="flex-1 rounded-xl border border-borde py-4 font-titulo font-bold"
            >
              Volver
            </button>
            <button
              disabled={enviando || codigo.trim().length < 12}
              className="flex-[2] rounded-xl bg-neon py-4 font-titulo text-lg font-bold text-fondo disabled:opacity-40"
            >
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
