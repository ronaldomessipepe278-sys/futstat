// ============================================================
//  FÓRMULA DE VALORACIÓN DE FUTSTAT
//  Todo lo que decide cuánto vale tu carta está en este archivo.
//  Si quieres cambiar algo, toca solo los números de AJUSTES.
// ============================================================

import { nivelDe } from './niveles.js'

export const AJUSTES = {
  // --- 1. Puntuación de un partido (de 1 a 99) ---
  puntosBase: 40, // punto de partida
  puntosPorNota: 5, // cada punto de tu nota suma esto (nota 6 → 30, nota 10 → 50)
  puntosPorGol: 3,
  puntosPorAsistencia: 2,
  maxGolesQueCuentan: 3, // a partir de aquí ya no suma más (evita cartas infladas)
  maxAsistenciasQueCuentan: 3,
  puntosResultado: { ganado: 3, empatado: 1, perdido: -2 },

  // --- 2. Rendimiento: mezcla de forma reciente e histórico ---
  partidosRecientes: 5, // cuántos partidos cuentan como "forma reciente"
  pesoReciente: 0.7, // 70 % los últimos 5 partidos
  pesoHistorico: 0.3, // 30 % todos tus partidos

  // --- 3. Valoración general ---
  pesoAtributos: 0.5, // 50 % lo que dicen tus atributos
  pesoRendimiento: 0.5, // 50 % lo que dicen tus partidos

  // --- 4. Cómo se mueven los atributos con los partidos ---
  rendimientoNormal: 70, // si rindes por encima de esto, los atributos suben
  efectoForma: 0.3, // cuánto mueve la forma a todos los atributos
  extraTiroPorGol: 5, // goles de media en los últimos partidos → más tiro
  extraPasePorAsistencia: 5, // asistencias de media → más pase
  maxExtra: 10, // tope del extra de tiro y pase

  // --- 5. Atributos de partida (los ajustas tú al crear la carta) ---
  atributoMin: 30,
  atributoMax: 90,
  puntosParaRepartir: 360, // media de 60 por atributo
}

export const ATRIBUTOS = [
  { clave: 'ritmo', nombre: 'Ritmo', corto: 'RIT' },
  { clave: 'tiro', nombre: 'Tiro', corto: 'TIR' },
  { clave: 'pase', nombre: 'Pase', corto: 'PAS' },
  { clave: 'regate', nombre: 'Regate', corto: 'REG' },
  { clave: 'defensa', nombre: 'Defensa', corto: 'DEF' },
  { clave: 'fisico', nombre: 'Físico', corto: 'FIS' },
]

const limitar = (valor, min = 1, max = 99) => Math.min(max, Math.max(min, valor))
const media = (numeros) =>
  numeros.length === 0 ? 0 : numeros.reduce((suma, n) => suma + n, 0) / numeros.length

// 1. Cuánto vale UN partido (1-99)
export function puntuacionPartido(partido) {
  const a = AJUSTES
  const goles = Math.min(partido.goles, a.maxGolesQueCuentan)
  const asistencias = Math.min(partido.asistencias, a.maxAsistenciasQueCuentan)
  const puntos =
    a.puntosBase +
    partido.nota * a.puntosPorNota +
    goles * a.puntosPorGol +
    asistencias * a.puntosPorAsistencia +
    (a.puntosResultado[partido.resultado] ?? 0)
  return limitar(puntos)
}

// 2. Rendimiento: 70 % últimos 5 partidos + 30 % todos.
//    `partidos` va ordenado del más antiguo al más reciente.
export function rendimiento(partidos) {
  if (partidos.length === 0) return null
  const puntuaciones = partidos.map(puntuacionPartido)
  const recientes = puntuaciones.slice(-AJUSTES.partidosRecientes)
  return AJUSTES.pesoReciente * media(recientes) + AJUSTES.pesoHistorico * media(puntuaciones)
}

// 3. Atributos actuales = los de partida + cómo vas de forma
export function atributosActuales(base, partidos) {
  const a = AJUSTES
  const rend = rendimiento(partidos)
  if (rend === null) return { ...base }

  const recientes = partidos.slice(-a.partidosRecientes)
  const ajusteForma = (rend - a.rendimientoNormal) * a.efectoForma
  const extraTiro = Math.min(a.maxExtra, media(recientes.map((p) => p.goles)) * a.extraTiroPorGol)
  const extraPase = Math.min(
    a.maxExtra,
    media(recientes.map((p) => p.asistencias)) * a.extraPasePorAsistencia,
  )

  const resultado = {}
  for (const { clave } of ATRIBUTOS) {
    let valor = base[clave] + ajusteForma
    if (clave === 'tiro') valor += extraTiro
    if (clave === 'pase') valor += extraPase
    resultado[clave] = Math.round(limitar(valor))
  }
  return resultado
}

// 4. Valoración general (0-99)
export function valoracionGeneral(base, partidos) {
  const atributos = atributosActuales(base, partidos)
  const mediaAtributos = media(ATRIBUTOS.map(({ clave }) => atributos[clave]))
  const rend = rendimiento(partidos)
  if (rend === null) return Math.round(mediaAtributos)
  return Math.round(
    limitar(AJUSTES.pesoAtributos * mediaAtributos + AJUSTES.pesoRendimiento * rend),
  )
}

// 5. La flecha: cuánto ha cambiado la valoración con el último partido
export function cambioUltimoPartido(base, partidos) {
  if (partidos.length === 0) return 0
  return valoracionGeneral(base, partidos) - valoracionGeneral(base, partidos.slice(0, -1))
}

// Nombre del nivel de la carta según la valoración (los niveles están en niveles.js)
export function nivel(valoracion) {
  return nivelDe(valoracion).nombre
}
