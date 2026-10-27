import { rachaSemanas } from '../logic/estadisticas.js'
import { nivelDe, siguienteNivel } from '../logic/niveles.js'
import { valoracionGeneral } from '../logic/valoracion.js'

// Un partido "bueno" de ejemplo para decirte cuánto te subiría
const PARTIDO_EJEMPLO = { resultado: 'ganado', goles: 1, asistencias: 0, nota: 8 }

// "Próximo objetivo": lo que te falta para el siguiente nivel y cómo va tu racha.
export default function Objetivos({ base, partidos }) {
  const valoracion = valoracionGeneral(base, partidos)
  const actual = nivelDe(valoracion)
  const siguiente = siguienteNivel(valoracion)
  const racha = rachaSemanas(partidos)

  return (
    <div className="space-y-3">
      {siguiente ? (
        <ObjetivoNivel
          valoracion={valoracion}
          actual={actual}
          siguiente={siguiente}
          subidaEjemplo={valoracionGeneral(base, [...partidos, PARTIDO_EJEMPLO]) - valoracion}
        />
      ) : (
        <Tarjeta color="#fbbf24" icono="🏆">
          <strong>Eres Leyenda.</strong> Estás en lo más alto: ¡defiende tu nivel partido a partido!
        </Tarjeta>
      )}
      <ObjetivoRacha racha={racha} />
    </div>
  )
}

function ObjetivoNivel({ valoracion, actual, siguiente, subidaEjemplo }) {
  const faltan = siguiente.minimo - valoracion
  const progreso = (valoracion - actual.minimo) / (siguiente.minimo - actual.minimo)

  return (
    <Tarjeta color={siguiente.color} icono="🎯">
      <p>
        Te faltan{' '}
        <strong className="font-titulo text-lg" style={{ color: siguiente.color }}>
          {faltan} {faltan === 1 ? 'punto' : 'puntos'}
        </strong>{' '}
        para ser <strong style={{ color: siguiente.color }}>{siguiente.nombre}</strong>
      </p>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${Math.max(4, progreso * 100)}%`,
            background: `linear-gradient(90deg, ${actual.color}, ${siguiente.color})`,
            boxShadow: `0 0 10px ${siguiente.brillo}`,
          }}
        />
      </div>
      {subidaEjemplo > 0 && (
        <p className="mt-2 text-xs text-apagado">
          Una victoria con gol y un 8 de nota te subiría +{subidaEjemplo}.
        </p>
      )}
    </Tarjeta>
  )
}

function ObjetivoRacha({ racha }) {
  if (racha.enRiesgo) {
    return (
      <Tarjeta color="#fb923c" icono="⚠️" urgente>
        <strong>
          ¡Tu racha de {racha.semanas} {racha.semanas === 1 ? 'semana' : 'semanas'} está en peligro!
        </strong>{' '}
        Juega un partido antes del domingo para no perderla.
      </Tarjeta>
    )
  }
  if (racha.jugoEstaSemana) {
    return (
      <Tarjeta color="#fb923c" icono="🔥">
        <strong>
          {racha.semanas} {racha.semanas === 1 ? 'semana seguida' : 'semanas seguidas'} jugando.
        </strong>{' '}
        La semana que viene, a por la {racha.semanas + 1}.
      </Tarjeta>
    )
  }
  return (
    <Tarjeta color="#fb923c" icono="🔥">
      Juega un partido esta semana y <strong>empieza una racha</strong>. Cada semana seguida suma.
    </Tarjeta>
  )
}

function Tarjeta({ color, icono, urgente, children }) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border bg-panel/80 p-4 text-sm ${urgente ? 'animate-pulse' : ''}`}
      style={{
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${color} 14%, transparent), transparent 70%)`,
      }}
    >
      <span className="text-2xl" aria-hidden="true">
        {icono}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
