// Todo lo que habla con Supabase (cuentas, cartas, partidos y grupos).
// Si no hay claves de Supabase configuradas, la web funciona en "modo local"
// (todo en el navegador, como en la Fase 1) y esto no se usa.
import { createClient } from '@supabase/supabase-js'
import { ATRIBUTOS } from './valoracion.js'

const URL = import.meta.env.VITE_SUPABASE_URL
const CLAVE = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = URL && CLAVE ? createClient(URL, CLAVE) : null
export const hayNube = Boolean(supabase)

// ---------- CÓDIGO DE ACCESO ----------
// Cada jugador entra con un código tipo K7P2-QX9M-4TRA, sin correo ni contraseña.
// Por dentro, Supabase necesita un "correo": usamos uno inventado que nunca recibe nada.
const DOMINIO_CUENTAS = 'cuentas.futstat.app'
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin 0/O ni 1/I para no confundir
const CLAVE_CODIGO = 'futstat:codigo'

function nuevoCodigo() {
  const azar = crypto.getRandomValues(new Uint32Array(12))
  const letras = Array.from(azar, (n) => LETRAS[n % LETRAS.length]).join('')
  return `${letras.slice(0, 4)}-${letras.slice(4, 8)}-${letras.slice(8)}`
}

function limpiarCodigo(codigo) {
  return codigo.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function credenciales(codigo) {
  const limpio = limpiarCodigo(codigo)
  return { email: `${limpio.toLowerCase()}@${DOMINIO_CUENTAS}`, password: limpio }
}

export function codigoGuardado() {
  try {
    return localStorage.getItem(CLAVE_CODIGO)
  } catch {
    return null
  }
}

function recordarCodigo(codigo) {
  try {
    if (codigo) localStorage.setItem(CLAVE_CODIGO, codigo)
    else localStorage.removeItem(CLAVE_CODIGO)
  } catch {
    // sin almacenamiento: el jugador tendrá que apuntárselo
  }
}

// ---------- TRADUCIR ENTRE LA WEB Y LA BASE DE DATOS ----------
function aJugador(fila) {
  return {
    id: fila.id,
    apodo: fila.apodo,
    base: Object.fromEntries(ATRIBUTOS.map(({ clave }) => [clave, fila[clave]])),
  }
}

function aFila(jugador) {
  return { apodo: jugador.apodo, ...jugador.base }
}

function comprobar({ data, error }) {
  if (error) throw new Error(traducirError(error.message))
  return data
}

function traducirError(mensaje) {
  if (/Invalid login credentials/i.test(mensaje)) return 'Ese código no es correcto'
  if (/fetch|network/i.test(mensaje)) return 'Sin conexión. Revisa tu internet.'
  return mensaje
}

// ---------- CUENTA ----------
export async function hayCuenta() {
  const { data } = await supabase.auth.getSession()
  return Boolean(data.session)
}

// Crea la cuenta (si aún no hay) y la carta. Devuelve el código de acceso.
export async function crearCuenta(jugador, partidosAntiguos = []) {
  let { data } = await supabase.auth.getSession()
  let codigo = codigoGuardado()
  if (!data.session) {
    codigo = nuevoCodigo()
    const respuesta = await supabase.auth.signUp(credenciales(codigo))
    if (respuesta.error) throw new Error(traducirError(respuesta.error.message))
    if (!respuesta.data.session) {
      throw new Error('Supabase pide confirmar el correo: desactiva "Confirm email" en el panel.')
    }
    recordarCodigo(codigo)
    data = respuesta.data
  }

  comprobar(
    await supabase.from('jugadores').insert({ id: data.session.user.id, ...aFila(jugador) }),
  )
  // Si venías de la versión sin cuentas, subimos tus partidos antiguos
  if (partidosAntiguos.length > 0) {
    comprobar(
      await supabase.from('partidos').insert(
        partidosAntiguos.map(({ fecha, resultado, goles, asistencias, nota }) => ({
          fecha,
          resultado,
          goles,
          asistencias,
          nota,
        })),
      ),
    )
  }
  return codigo
}

export async function entrarConCodigo(codigo) {
  if (limpiarCodigo(codigo).length !== 12) throw new Error('El código tiene 12 letras y números')
  const { error } = await supabase.auth.signInWithPassword(credenciales(codigo))
  if (error) throw new Error(traducirError(error.message))
  recordarCodigo(codigo.toUpperCase().trim())
}

export async function salir() {
  await supabase.auth.signOut()
  recordarCodigo(null)
}

export async function borrarCuenta() {
  comprobar(await supabase.rpc('borrar_mi_cuenta'))
  await salir()
}

// ---------- MI CARTA Y MIS PARTIDOS ----------
export async function cargarMisDatos() {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return { jugador: null, partidos: [] }
  const id = data.user.id
  const [fila, partidos] = await Promise.all([
    supabase.from('jugadores').select('*').eq('id', id).maybeSingle().then(comprobar),
    supabase.from('partidos').select('*').eq('jugador_id', id).order('fecha').then(comprobar),
  ])
  return { jugador: fila ? aJugador(fila) : null, partidos }
}

export async function guardarCarta(jugador) {
  comprobar(await supabase.from('jugadores').update(aFila(jugador)).eq('id', jugador.id))
}

export async function apuntarPartido(partido) {
  return comprobar(await supabase.from('partidos').insert(partido).select().single())
}

export async function borrarPartido(id) {
  comprobar(await supabase.from('partidos').delete().eq('id', id))
}

// ---------- GRUPOS ----------
export async function misGrupos() {
  return comprobar(await supabase.from('grupos').select('*').order('creado_en'))
}

export async function crearGrupo(nombre) {
  return comprobar(await supabase.rpc('crear_grupo', { p_nombre: nombre }))
}

export async function unirseGrupo(codigo) {
  return comprobar(await supabase.rpc('unirse_grupo', { p_codigo: codigo }))
}

export async function salirDeGrupo(grupoId, jugadorId) {
  comprobar(
    await supabase.from('miembros').delete().eq('grupo_id', grupoId).eq('jugador_id', jugadorId),
  )
}

// ---------- VOTACIÓN MVP ----------
export async function votosDelGrupo(grupoId, semanas) {
  return comprobar(
    await supabase.from('votos').select('*').eq('grupo_id', grupoId).in('semana', semanas),
  )
}

export async function votar(grupoId, votadoId) {
  comprobar(await supabase.rpc('votar', { p_grupo: grupoId, p_votado: votadoId }))
}

// Todos los jugadores del grupo, cada uno con sus partidos
export async function cargarGrupo(grupoId) {
  const miembros = comprobar(
    await supabase.from('miembros').select('jugador_id').eq('grupo_id', grupoId),
  )
  const ids = miembros.map((m) => m.jugador_id)
  const [filas, partidos] = await Promise.all([
    supabase.from('jugadores').select('*').in('id', ids).then(comprobar),
    supabase.from('partidos').select('*').in('jugador_id', ids).order('fecha').then(comprobar),
  ])
  return filas.map((fila) => ({
    ...aJugador(fila),
    partidos: partidos.filter((p) => p.jugador_id === fila.id),
  }))
}
