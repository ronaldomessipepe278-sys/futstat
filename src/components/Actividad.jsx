import { insigniasConseguidas } from '../logic/insignias.js'
import { esNuevo } from '../logic/novedades.js'
import { valoracionGeneral } from '../logic/valoracion.js'

const PARTIDOS_POR_JUGADOR = 10 // solo miramos los últimos de cada uno
const MAXIMO_EVENTOS = 25
const TEXTO_RESULTADO = { ganado: 'ganó', empatado: 'empató', perdido: 'perdió' }

// Junta lo que ha pasado en el grupo: partidos apuntados e insignias ganadas.
function eventosDelGrupo(jugadores) {
  const eventos = []
  for (const j of jugadores) {
    const desde = Math.max(0, j.partidos.length - PARTIDOS_POR_JUGADOR)
    for (let i = desde; i < j.partidos.length; i++) {
      const p = j.partidos[i]
      const cambio =
        valoracionGeneral(j.base, j.partidos.slice(0, i + 1)) -
        valoracionGeneral(j.base, j.partidos.slice(0, i))
      eventos.push({
        tipo: 'partido',
        id: `p-${p.id}`,
        jugador: j,
        fecha: p.fecha,
        partido: p,
        cambio,
      })
    }
    for (const insignia of insigniasConseguidas(j.base, j.partidos)) {
      eventos.push({
        tipo: 'insignia',
        id: `i-${j.id}-${insignia.id}`,
        jugador: j,
        fecha: insignia.fecha,
        insignia,
      })
    }
  }
  // Lo más reciente arriba; si coinciden, la insignia va encima de su partido
  return eventos
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || (a.tipo === 'insignia' ? -1 : 1))
    .slice(0, MAXIMO_EVENTOS)
}

function haceCuanto(fecha) {
  const minutos = Math.round((Date.now() - new Date(fecha)) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function Actividad({ jugadores, yo, visitaAnterior }) {
  const eventos = eventosDelGrupo(jugadores)

  if (eventos.length === 0) {
    return (
      <p className="text-sm text-apagado">
        Todavía no hay actividad. ¡Apunta un partido y estrena el grupo!
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {eventos.map((e) => {
        const quien = e.jugador.id === yo.id ? 'Tú' : e.jugador.apodo
        return (
          <li
            key={e.id}
            className={`flex items-start gap-3 rounded-xl border px-3 py-2 ${
              e.tipo === 'insignia' ? 'border-neon/40 bg-neon/5' : 'border-borde bg-panel'
            }`}
          >
            <span className="mt-0.5 text-xl" aria-hidden="true">
              {e.tipo === 'insignia' ? e.insignia.icono : '⚽'}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              {e.tipo === 'insignia' ? (
                <p>
                  <strong className="font-titulo">{quien}</strong>{' '}
                  {quien === 'Tú' ? 'has conseguido' : 'ha conseguido'} la insignia{' '}
                  <strong className="text-neon">{e.insignia.nombre}</strong>
                </p>
              ) : (
                <p>
                  <strong className="font-titulo">{quien}</strong>{' '}
                  {quien === 'Tú'
                    ? { ganado: 'ganaste', empatado: 'empataste', perdido: 'perdiste' }[
                        e.partido.resultado
                      ]
                    : TEXTO_RESULTADO[e.partido.resultado]}
                  {e.partido.goles > 0 &&
                    ` · ${e.partido.goles} ${e.partido.goles === 1 ? 'gol' : 'goles'}`}
                  {e.partido.asistencias > 0 &&
                    ` · ${e.partido.asistencias} ${e.partido.asistencias === 1 ? 'asistencia' : 'asistencias'}`}
                  {` · nota ${e.partido.nota}`}
                </p>
              )}
              <p className="text-xs text-apagado">
                {haceCuanto(e.fecha)}
                {e.jugador.id !== yo.id && esNuevo(e.fecha, visitaAnterior) && (
                  <span className="ml-2 rounded-full bg-baja px-2 py-0.5 font-titulo text-[10px] font-bold text-texto uppercase">
                    Nuevo
                  </span>
                )}
              </p>
            </div>
            {e.tipo === 'partido' && e.cambio !== 0 && (
              <span
                className={`font-titulo text-sm font-bold ${e.cambio > 0 ? 'text-sube' : 'text-baja'}`}
              >
                {e.cambio > 0 ? `▲${e.cambio}` : `▼${-e.cambio}`}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
