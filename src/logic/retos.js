// ============================================================
//  RETOS DE LA SEMANA
//  Cada semana (de lunes a domingo) tocan 3 retos de esta lista.
//  Cambian solos cada lunes y son los mismos para todo el mundo,
//  así puedes picarte con tus colegas por completarlos.
// ============================================================

const RETOS = [
  { id: 'jugar2', texto: 'Juega 2 partidos', objetivo: 2, cuenta: (ps) => ps.length },
  { id: 'jugar3', texto: 'Juega 3 partidos', objetivo: 3, cuenta: (ps) => ps.length },
  { id: 'goles3', texto: 'Marca 3 goles', objetivo: 3, cuenta: (ps) => sumar(ps, 'goles') },
  {
    id: 'asist2',
    texto: 'Da 2 asistencias',
    objetivo: 2,
    cuenta: (ps) => sumar(ps, 'asistencias'),
  },
  {
    id: 'ganar2',
    texto: 'Gana 2 partidos',
    objetivo: 2,
    cuenta: (ps) => ps.filter((p) => p.resultado === 'ganado').length,
  },
  {
    id: 'nota8',
    texto: 'Sácate un 8 o más',
    objetivo: 1,
    cuenta: (ps) => ps.filter((p) => p.nota >= 8).length,
  },
  {
    id: 'participa4',
    texto: 'Participa en 4 goles (goles + asistencias)',
    objetivo: 4,
    cuenta: (ps) => sumar(ps, 'goles') + sumar(ps, 'asistencias'),
  },
]

const RETOS_POR_SEMANA = 3
const UNA_SEMANA = 7 * 24 * 60 * 60 * 1000

function sumar(partidos, campo) {
  return partidos.reduce((total, p) => total + p[campo], 0)
}

// Lunes a las 00:00 de la semana de `fecha`
export function inicioSemana(fecha = new Date()) {
  const lunes = new Date(fecha)
  lunes.setHours(0, 0, 0, 0)
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))
  return lunes
}

// Qué retos tocan esta semana: van rotando por la lista
function retosDeLaSemana(lunes) {
  const numeroSemana = Math.round(lunes.getTime() / UNA_SEMANA)
  return Array.from(
    { length: RETOS_POR_SEMANA },
    (_, i) => RETOS[(numeroSemana * RETOS_POR_SEMANA + i) % RETOS.length],
  )
}

// Retos de esta semana con tu progreso
export function retosActuales(partidos, ahora = new Date()) {
  const lunes = inicioSemana(ahora)
  const deEstaSemana = partidos.filter((p) => new Date(p.fecha) >= lunes)
  return retosDeLaSemana(lunes).map((reto) => {
    const valor = reto.cuenta(deEstaSemana)
    return {
      id: reto.id,
      texto: reto.texto,
      objetivo: reto.objetivo,
      valor: Math.min(valor, reto.objetivo),
      completado: valor >= reto.objetivo,
    }
  })
}

// Días que quedan para que cambien los retos
export function diasParaNuevosRetos(ahora = new Date()) {
  const siguienteLunes = new Date(inicioSemana(ahora).getTime() + UNA_SEMANA)
  return Math.max(1, Math.ceil((siguienteLunes - ahora) / (24 * 60 * 60 * 1000)))
}
