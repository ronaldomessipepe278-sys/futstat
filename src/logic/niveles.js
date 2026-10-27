// ============================================================
//  NIVELES DE LA CARTA
//  Cada nivel tiene su valoración mínima y sus colores.
//  Cambia aquí los números o los colores y cambia toda la web.
// ============================================================

export const NIVELES = [
  {
    id: 'cantera',
    nombre: 'Cantera',
    minimo: 0,
    color: '#34d399', // verde esmeralda
    color2: '#059669',
    brillo: 'rgb(52 211 153 / 0.55)',
  },
  {
    id: 'titular',
    nombre: 'Titular',
    minimo: 60,
    color: '#22e5f0', // cian eléctrico
    color2: '#0e7c8a',
    brillo: 'rgb(34 229 240 / 0.6)',
  },
  {
    id: 'crack',
    nombre: 'Crack',
    minimo: 75,
    color: '#c084fc', // violeta → rosa
    color2: '#ec4899',
    brillo: 'rgb(217 70 239 / 0.65)',
  },
  {
    id: 'leyenda',
    nombre: 'Leyenda',
    minimo: 85,
    color: '#fde68a', // dorado holográfico
    color2: '#f59e0b',
    brillo: 'rgb(251 191 36 / 0.7)',
    holografico: true,
  },
]

// Nivel que corresponde a una valoración
export function nivelDe(valoracion) {
  return NIVELES.findLast((n) => valoracion >= n.minimo)
}

// Siguiente nivel (o null si ya eres Leyenda)
export function siguienteNivel(valoracion) {
  return NIVELES.find((n) => n.minimo > valoracion) ?? null
}

// Variables CSS para pintar algo con los colores de un nivel
export function estiloNivel(valoracion) {
  const n = nivelDe(valoracion)
  return { '--acento': n.color, '--acento-2': n.color2, '--brillo': n.brillo }
}
