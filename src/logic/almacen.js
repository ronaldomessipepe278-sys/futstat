// Guarda y lee los datos en el propio navegador (localStorage).
// En la Fase 2 esto se cambiará por la base de datos (Supabase).

const CLAVE = 'futstat:v1'

const VACIO = { jugador: null, partidos: [] }

export function cargarDatos() {
  try {
    const texto = localStorage.getItem(CLAVE)
    if (!texto) return VACIO
    const datos = JSON.parse(texto)
    return { jugador: datos.jugador ?? null, partidos: datos.partidos ?? [] }
  } catch {
    return VACIO
  }
}

export function guardarDatos(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  } catch {
    // Modo incógnito o almacenamiento lleno: la web sigue funcionando sin guardar.
  }
}

export function borrarDatos() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // nada que hacer
  }
}
