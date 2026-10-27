import Carta from '../components/Carta.jsx'
import {
  atributosActuales,
  cambioUltimoPartido,
  puntuacionPartido,
  valoracionGeneral,
} from '../logic/valoracion.js'

const TEXTO_RESULTADO = { ganado: 'Victoria', empatado: 'Empate', perdido: 'Derrota' }
const COLOR_RESULTADO = { ganado: 'bg-sube', empatado: 'bg-neon', perdido: 'bg-baja' }

export default function MiCarta({ jugador, partidos, onApuntar, onEditar, onBorrarPartido }) {
  const ultimos = [...partidos].reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      <Carta
        apodo={jugador.apodo}
        valoracion={valoracionGeneral(jugador.base, partidos)}
        atributos={atributosActuales(jugador.base, partidos)}
        cambio={cambioUltimoPartido(jugador.base, partidos)}
        partidosJugados={partidos.length}
      />

      <button
        onClick={onApuntar}
        className="w-full rounded-xl bg-neon py-4 font-titulo text-xl font-bold text-fondo shadow-[0_0_24px_rgb(34_229_240/0.4)] active:scale-[0.98]"
      >
        + Apuntar partido
      </button>

      <section>
        <h2 className="font-titulo text-sm tracking-widest text-apagado uppercase">
          Últimos partidos
        </h2>
        {ultimos.length === 0 ? (
          <p className="mt-2 text-sm text-apagado">
            Aún no has apuntado ninguno. ¡Apunta tu primer partido para que tu carta empiece a
            moverse!
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {ultimos.map((p) => (
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
        )}
      </section>

      <button onClick={onEditar} className="w-full py-2 text-sm text-apagado underline">
        Editar apodo y atributos
      </button>
    </div>
  )
}
