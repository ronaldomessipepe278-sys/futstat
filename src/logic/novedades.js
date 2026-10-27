// Avisos dentro de la web: recordamos cuándo miraste "Mi grupo" por última vez
// (solo en este dispositivo) y comparamos con lo último que ha pasado.

const CLAVE = 'futstat:grupo-visto'

export function ultimaVisita() {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

export function marcarVisto() {
  const ahora = new Date().toISOString()
  try {
    localStorage.setItem(CLAVE, ahora)
  } catch {
    // sin almacenamiento: el punto volverá a salir, no pasa nada
  }
  return ahora
}

// ¿Pasó algo después de tu última visita?
export function esNuevo(fecha, visita = ultimaVisita()) {
  return Boolean(fecha) && (!visita || new Date(fecha) > new Date(visita))
}
