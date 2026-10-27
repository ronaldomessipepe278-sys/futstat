import { useState } from 'react'
import Carta from '../components/Carta.jsx'
import CompartirCarta from '../components/CompartirCarta.jsx'
import Evolucion from '../components/Evolucion.jsx'
import Insignias from '../components/Insignias.jsx'
import Objetivos from '../components/Objetivos.jsx'
import Retos from '../components/Retos.jsx'
import { evolucion, rachaSemanas, resumen } from '../logic/estadisticas.js'
import { insigniasConseguidas } from '../logic/insignias.js'
import {
  atributosActuales,
  cambioUltimoPartido,
  puntuacionPartido,
  valoracionGeneral,
} from '../logic/valoracion.js'

const TEXTO_RESULTADO = { ganado: 'Victoria', empatado: 'Empate', perdido: 'Derrota' }
const COLOR_RESULTADO = { ganado: 'bg-sube', empatado: 'bg-neon', perdido: 'bg-baja' }

export default function MiCarta({
  jugador,
  partidos,
  hayNube,
  onApuntar,
  onEditar,
  onCuenta,
  onBorrarPartido,
}) {
  const [verTodos, setVerTodos] = useState(false)
  const datos = resumen(partidos)
  const historial = [...partidos].reverse()
  const visibles = verTodos ? historial : historial.slice(0, 5)

  const carta = {
    apodo: jugador.apodo,
    valoracion: valoracionGeneral(jugador.base, partidos),
    atributos: atributosActuales(jugador.base, partidos),
    cambio: cambioUltimoPartido(jugador.base, partidos),
    partidosJugados: partidos.length,
    racha: rachaSemanas(partidos).semanas,
  }

  return (
    // En móvil todo va en una columna; en ordenador, la carta a la izquierda
    <div className="space-y-8 lg:grid lg:grid-cols-[360px_1fr] lg:items-start lg:gap-10 lg:space-y-0">
      <div className="space-y-4 lg:sticky lg:top-6">
        <Carta {...carta} />

        <button
          onClick={onApuntar}
          className="mt-4 w-full rounded-xl bg-neon py-4 font-titulo text-xl font-bold text-fondo shadow-[0_0_24px_color-mix(in_srgb,var(--color-neon)_40%,transparent)] active:scale-[0.98]"
        >
          + Apuntar partido
        </button>
        <CompartirCarta {...carta} />
      </div>

      <div className="space-y-8">
        <Seccion titulo="Próximo objetivo">
          <Objetivos base={jugador.base} partidos={partidos} />
        </Seccion>

        <Seccion titulo="Retos de la semana">
          <Retos partidos={partidos} />
        </Seccion>

        <Seccion titulo="Resumen">
          <div className="grid grid-cols-3 gap-2">
            <Dato valor={datos.partidos} texto="Partidos" />
            <Dato valor={datos.goles} texto="Goles" />
            <Dato valor={datos.asistencias} texto="Asistencias" />
            <Dato valor={`${datos.porcentajeVictorias}%`} texto="Victorias" />
            <Dato valor={datos.notaMedia} texto="Nota media" />
            <Dato
              valor={datos.racha.cantidad}
              texto={datos.racha.tipo ? `Racha ${datos.racha.tipo}` : 'Racha'}
              color={datos.racha.tipo === 'ganando' ? 'text-sube' : undefined}
            />
          </div>
        </Seccion>

        <Seccion titulo="Evolución">
          <div className="rounded-xl border border-borde bg-panel p-4">
            <Evolucion puntos={evolucion(jugador.base, partidos)} />
          </div>
        </Seccion>

        <Seccion titulo="Insignias">
          <Insignias conseguidas={insigniasConseguidas(jugador.base, partidos)} />
        </Seccion>

        <Seccion titulo="Mis partidos">
          {historial.length === 0 ? (
            <p className="text-sm text-apagado">
              Aún no has apuntado ninguno. ¡Apunta tu primer partido para que tu carta empiece a
              moverse!
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {visibles.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-borde bg-panel px-3 py-2"
                  >
                    <span className={`h-8 w-1.5 rounded-full ${COLOR_RESULTADO[p.resultado]}`} />
                    <div className="flex-1">
                      <div className="font-titulo font-bold">{TEXTO_RESULTADO[p.resultado]}</div>
                      <div className="text-xs text-apagado">
                        {new Date(p.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        · {p.goles} G · {p.asistencias} A · nota {p.nota}
                      </div>
                    </div>
                    <span className="font-titulo text-lg font-bold text-neon">
                      {puntuacionPartido(p)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('¿Borrar este partido?')) onBorrarPartido(p.id)
                      }}
                      className="px-2 text-apagado hover:text-baja"
                      aria-label="Borrar partido"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              {historial.length > 5 && (
                <button
                  onClick={() => setVerTodos(!verTodos)}
                  className="mt-2 w-full py-2 font-titulo text-sm text-neon"
                >
                  {verTodos ? 'Ver menos' : `Ver los ${historial.length} partidos`}
                </button>
              )}
            </>
          )}
        </Seccion>

        <div className="flex justify-center gap-6 text-sm text-apagado">
          <button onClick={onEditar} className="py-2 underline">
            Editar apodo y atributos
          </button>
          {hayNube && (
            <button onClick={onCuenta} className="py-2 underline">
              Mi código de acceso
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <section>
      <h2 className="mb-2 font-titulo text-sm tracking-widest text-apagado uppercase">{titulo}</h2>
      {children}
    </section>
  )
}

function Dato({ valor, texto, color = 'text-texto' }) {
  return (
    <div className="rounded-xl border border-borde bg-panel px-2 py-3 text-center">
      <div className={`font-titulo text-2xl font-bold ${color}`}>{valor}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-apagado">{texto}</div>
    </div>
  )
}
