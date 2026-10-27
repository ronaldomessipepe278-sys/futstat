// ============================================================
//  INSIGNIAS DE FUTSTAT
//  Cada insignia tiene una condición. Se consigue la primera vez
//  que tus partidos la cumplen. Para añadir una nueva, copia una
//  de la lista y cambia el texto y la condición.
// ============================================================
import { NIVELES } from './niveles.js'
import { valoracionGeneral } from './valoracion.js'

const minimoDe = (id) => NIVELES.find((n) => n.id === id).minimo

const suma = (partidos, campo) => partidos.reduce((total, p) => total + p[campo], 0)
const ultimo = (partidos) => partidos.at(-1)

// ¿Los últimos `n` partidos cumplen algo?
function ultimosCumplen(partidos, n, condicion) {
  return partidos.length >= n && partidos.slice(-n).every(condicion)
}

export const INSIGNIAS = [
  {
    id: 'debut',
    nombre: 'Debut',
    icono: '👟',
    descripcion: 'Apunta tu primer partido',
    cumple: (partidos) => partidos.length >= 1,
  },
  {
    id: 'hat-trick',
    nombre: 'Hat-trick',
    icono: '🎩',
    descripcion: 'Marca 3 goles o más en un partido',
    cumple: (partidos) => ultimo(partidos).goles >= 3,
  },
  {
    id: 'pasador',
    nombre: 'Pasador',
    icono: '🎯',
    descripcion: 'Da 3 asistencias o más en un partido',
    cumple: (partidos) => ultimo(partidos).asistencias >= 3,
  },
  {
    id: 'perfecto',
    nombre: 'Partidazo',
    icono: '💯',
    descripcion: 'Ponte un 10 en un partido',
    cumple: (partidos) => ultimo(partidos).nota === 10,
  },
  {
    id: 'en-racha',
    nombre: 'En racha',
    icono: '🔥',
    descripcion: 'Gana 3 partidos seguidos',
    cumple: (partidos) => ultimosCumplen(partidos, 3, (p) => p.resultado === 'ganado'),
  },
  {
    id: 'invicto',
    nombre: 'Invicto',
    icono: '🛡️',
    descripcion: 'Juega 5 partidos seguidos sin perder',
    cumple: (partidos) => ultimosCumplen(partidos, 5, (p) => p.resultado !== 'perdido'),
  },
  {
    id: 'pichichi',
    nombre: 'Pichichi',
    icono: '👑',
    descripcion: 'Llega a 20 goles en total',
    cumple: (partidos) => suma(partidos, 'goles') >= 20,
  },
  {
    id: 'mago',
    nombre: 'Mago del pase',
    icono: '🪄',
    descripcion: 'Llega a 15 asistencias en total',
    cumple: (partidos) => suma(partidos, 'asistencias') >= 15,
  },
  {
    id: 'fijo',
    nombre: 'Fijo',
    icono: '📅',
    descripcion: 'Juega 10 partidos',
    cumple: (partidos) => partidos.length >= 10,
  },
  {
    id: 'veterano',
    nombre: 'Veterano',
    icono: '🏟️',
    descripcion: 'Juega 25 partidos',
    cumple: (partidos) => partidos.length >= 25,
  },
  {
    id: 'crack',
    nombre: 'Crack',
    icono: '⭐',
    descripcion: `Llega a ${minimoDe('crack')} de valoración (nivel Crack)`,
    cumple: (partidos, base) => valoracionGeneral(base, partidos) >= minimoDe('crack'),
  },
  {
    id: 'leyenda',
    nombre: 'Leyenda',
    icono: '🏆',
    descripcion: `Llega a ${minimoDe('leyenda')} de valoración (nivel Leyenda)`,
    cumple: (partidos, base) => valoracionGeneral(base, partidos) >= minimoDe('leyenda'),
  },
]

// Devuelve las insignias conseguidas, con la fecha del partido en que se ganó cada una.
// `partidos` va del más antiguo al más reciente.
export function insigniasConseguidas(base, partidos) {
  const conseguidas = []
  const pendientes = new Set(INSIGNIAS.map((i) => i.id))
  for (let n = 1; n <= partidos.length; n++) {
    const hastaAhora = partidos.slice(0, n)
    for (const insignia of INSIGNIAS) {
      if (pendientes.has(insignia.id) && insignia.cumple(hastaAhora, base)) {
        pendientes.delete(insignia.id)
        conseguidas.push({ ...insignia, fecha: partidos[n - 1].fecha })
      }
    }
  }
  return conseguidas
}
