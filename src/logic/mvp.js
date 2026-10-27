// Cálculos del "MVP de la semana" a partir de los votos del grupo.
import { inicioSemana } from './retos.js'

// Lunes de la semana en formato 2026-10-26 (igual que en la base de datos)
export function claveSemana(fecha = new Date()) {
  const lunes = inicioSemana(fecha)
  const mes = String(lunes.getMonth() + 1).padStart(2, '0')
  const dia = String(lunes.getDate()).padStart(2, '0')
  return `${lunes.getFullYear()}-${mes}-${dia}`
}

export function semanaPasada() {
  const haceUnaSemana = new Date()
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7)
  return claveSemana(haceUnaSemana)
}

// { idJugador: número de votos } de una semana
export function recuento(votos, semana) {
  const cuenta = {}
  for (const v of votos) {
    if (v.semana === semana) cuenta[v.votado_id] = (cuenta[v.votado_id] ?? 0) + 1
  }
  return cuenta
}

// Quién ganó (puede haber empate). Vacío si nadie votó.
export function ganadores(votos, semana) {
  const cuenta = recuento(votos, semana)
  const maximo = Math.max(0, ...Object.values(cuenta))
  return maximo === 0 ? [] : Object.keys(cuenta).filter((id) => cuenta[id] === maximo)
}
