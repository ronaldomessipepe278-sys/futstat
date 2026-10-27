import { resumen } from '../logic/estadisticas.js'
import { ATRIBUTOS } from '../logic/valoracion.js'

// Compara dos jugadores. Cada jugador llega ya calculado desde el ranking:
// { id, apodo, valoracion, atributos, partidos }
export default function CaraACara({ jugadores, izquierda, derecha, onCambiar }) {
  const a = jugadores.find((j) => j.id === izquierda)
  const b = jugadores.find((j) => j.id === derecha)
  if (!a || !b) return null

  const ra = resumen(a.partidos)
  const rb = resumen(b.partidos)
  const filas = [
    { nombre: 'Valoración', va: a.valoracion, vb: b.valoracion, grande: true },
    ...ATRIBUTOS.map(({ clave, nombre }) => ({
      nombre,
      va: a.atributos[clave],
      vb: b.atributos[clave],
    })),
    { nombre: 'Goles', va: ra.goles, vb: rb.goles },
    { nombre: 'Asistencias', va: ra.asistencias, vb: rb.asistencias },
    { nombre: '% victorias', va: ra.porcentajeVictorias, vb: rb.porcentajeVictorias },
    { nombre: 'Partidos', va: ra.partidos, vb: rb.partidos },
  ]
  const ganadosA = ATRIBUTOS.filter(({ clave }) => a.atributos[clave] > b.atributos[clave]).length
  const ganadosB = ATRIBUTOS.filter(({ clave }) => b.atributos[clave] > a.atributos[clave]).length

  return (
    <div className="rounded-2xl border border-borde bg-panel p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Selector valor={izquierda} jugadores={jugadores} otro={derecha} onCambiar={(id) => onCambiar(id, derecha)} />
        <span className="font-titulo text-sm font-bold text-apagado">VS</span>
        <Selector valor={derecha} jugadores={jugadores} otro={izquierda} onCambiar={(id) => onCambiar(izquierda, id)} />
      </div>

      <ul className="mt-4 space-y-2">
        {filas.map(({ nombre, va, vb, grande }) => (
          <li key={nombre} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
            <Valor valor={va} gana={va > vb} grande={grande} />
            <div>
              <div className="text-center text-xs text-apagado">{nombre}</div>
              <Barras va={va} vb={vb} />
            </div>
            <Valor valor={vb} gana={vb > va} grande={grande} />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center font-titulo text-sm">
        {ganadosA === ganadosB
          ? `Empate: ${ganadosA} atributos cada uno`
          : `${ganadosA > ganadosB ? a.apodo : b.apodo} gana en ${Math.max(ganadosA, ganadosB)} de 6 atributos`}
      </p>
    </div>
  )
}

function Selector({ valor, jugadores, otro, onCambiar }) {
  return (
    <select
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      className="w-full truncate rounded-lg border border-borde bg-fondo px-2 py-2 text-center font-titulo font-bold"
    >
      {jugadores
        .filter((j) => j.id !== otro)
        .map((j) => (
          <option key={j.id} value={j.id}>
            {j.apodo}
          </option>
        ))}
    </select>
  )
}

function Valor({ valor, gana, grande }) {
  return (
    <span
      className={`text-center font-titulo font-bold ${grande ? 'text-2xl' : 'text-lg'} ${
        gana ? 'text-neon' : 'text-apagado'
      }`}
    >
      {valor}
    </span>
  )
}

// Dos barras que crecen desde el centro hacia cada lado
function Barras({ va, vb }) {
  const maximo = Math.max(va, vb, 1)
  return (
    <div className="mt-1 flex gap-1">
      <div className="flex h-1.5 flex-1 justify-end rounded-full bg-borde">
        <div
          className={`h-1.5 rounded-full ${va >= vb ? 'bg-neon' : 'bg-apagado'}`}
          style={{ width: `${(va / maximo) * 100}%` }}
        />
      </div>
      <div className="h-1.5 flex-1 rounded-full bg-borde">
        <div
          className={`h-1.5 rounded-full ${vb >= va ? 'bg-neon' : 'bg-apagado'}`}
          style={{ width: `${(vb / maximo) * 100}%` }}
        />
      </div>
    </div>
  )
}
