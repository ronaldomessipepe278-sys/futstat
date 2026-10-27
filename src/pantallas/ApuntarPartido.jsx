import { useState } from 'react'

const RESULTADOS = [
  { valor: 'ganado', texto: 'Ganado', color: 'border-sube text-sube bg-sube/10' },
  { valor: 'empatado', texto: 'Empate', color: 'border-neon text-neon bg-neon/10' },
  { valor: 'perdido', texto: 'Perdido', color: 'border-baja text-baja bg-baja/10' },
]

// Formulario rápido: todo viene ya relleno (0 goles, 0 asistencias, nota 6).
// Lo mínimo es: tocar el resultado y pulsar Guardar.
export default function ApuntarPartido({ onGuardar, onCancelar }) {
  const [resultado, setResultado] = useState(null)
  const [goles, setGoles] = useState(0)
  const [asistencias, setAsistencias] = useState(0)
  const [nota, setNota] = useState(6)

  function guardar() {
    if (!resultado) return
    onGuardar({ resultado, goles, asistencias, nota })
  }

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-bold">Apuntar partido</h1>

      <section>
        <Titulo>Resultado</Titulo>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {RESULTADOS.map((r) => (
            <button
              key={r.valor}
              type="button"
              onClick={() => setResultado(r.valor)}
              aria-pressed={resultado === r.valor}
              className={`rounded-xl border-2 py-5 font-titulo text-lg font-bold transition ${
                resultado === r.valor ? r.color : 'border-borde bg-panel text-apagado'
              }`}
            >
              {r.texto}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Contador etiqueta="Goles" valor={goles} onCambio={setGoles} />
        <Contador etiqueta="Asistencias" valor={asistencias} onCambio={setAsistencias} />
      </div>

      <section>
        <div className="flex items-baseline justify-between">
          <Titulo>Mi nota</Titulo>
          <span className="font-titulo text-2xl font-bold text-neon">{nota}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNota(n)}
              aria-pressed={nota === n}
              className={`rounded-lg border py-3 font-titulo text-lg font-bold ${
                nota === n
                  ? 'border-neon bg-neon text-fondo'
                  : 'border-borde bg-panel text-texto'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 rounded-xl border border-borde py-4 font-titulo font-bold"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={!resultado}
          className="flex-[2] rounded-xl bg-neon py-4 font-titulo text-lg font-bold text-fondo disabled:opacity-40"
        >
          {resultado ? 'Guardar partido' : 'Elige el resultado'}
        </button>
      </div>
    </div>
  )
}

function Titulo({ children }) {
  return (
    <h2 className="font-titulo text-sm tracking-widest text-apagado uppercase">{children}</h2>
  )
}

function Contador({ etiqueta, valor, onCambio }) {
  return (
    <section className="rounded-xl border border-borde bg-panel p-3">
      <Titulo>{etiqueta}</Titulo>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onCambio(Math.max(0, valor - 1))}
          className="h-12 w-12 rounded-lg border border-borde font-titulo text-2xl"
          aria-label={`Quitar ${etiqueta.toLowerCase()}`}
        >
          −
        </button>
        <span className="font-titulo text-3xl font-bold">{valor}</span>
        <button
          type="button"
          onClick={() => onCambio(Math.min(20, valor + 1))}
          className="h-12 w-12 rounded-lg border border-neon/60 font-titulo text-2xl text-neon"
          aria-label={`Añadir ${etiqueta.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </section>
  )
}
