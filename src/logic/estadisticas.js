// Cuentas sencillas para el resumen de "Mi carta".
import { valoracionGeneral } from './valoracion.js'

export function resumen(partidos) {
  const total = partidos.length
  const sumar = (campo) => partidos.reduce((suma, p) => suma + p[campo], 0)
  const victorias = partidos.filter((p) => p.resultado === 'ganado').length

  return {
    partidos: total,
    goles: sumar('goles'),
    asistencias: sumar('asistencias'),
    porcentajeVictorias: total ? Math.round((victorias / total) * 100) : 0,
    notaMedia: total ? (sumar('nota') / total).toFixed(1) : '–',
    racha: racha(partidos),
  }
}

// Racha actual: cuántos partidos seguidos llevas ganando (o sin ganar)
function racha(partidos) {
  if (partidos.length === 0) return { tipo: null, cantidad: 0 }
  const ganando = partidos.at(-1).resultado === 'ganado'
  let cantidad = 0
  for (let i = partidos.length - 1; i >= 0; i--) {
    if ((partidos[i].resultado === 'ganado') !== ganando) break
    cantidad++
  }
  return { tipo: ganando ? 'ganando' : 'sin ganar', cantidad }
}

// Valoración después de cada partido (para la gráfica de evolución)
export function evolucion(base, partidos, maximo = 10) {
  const puntos = []
  for (let i = 0; i <= partidos.length; i++) {
    puntos.push(valoracionGeneral(base, partidos.slice(0, i)))
  }
  return puntos.slice(-maximo)
}
