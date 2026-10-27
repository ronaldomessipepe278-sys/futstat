import { useCallback, useEffect, useState } from 'react'
import Menu from './components/Menu.jsx'
import { borrarDatos, cargarDatos, guardarDatos } from './logic/almacen.js'
import * as nube from './logic/nube.js'
import ApuntarPartido from './pantallas/ApuntarPartido.jsx'
import Bienvenida from './pantallas/Bienvenida.jsx'
import Cuenta from './pantallas/Cuenta.jsx'
import CrearCarta from './pantallas/CrearCarta.jsx'
import MiCarta from './pantallas/MiCarta.jsx'
import MiGrupo from './pantallas/MiGrupo.jsx'
import Privacidad from './pantallas/Privacidad.jsx'

// La pantalla actual se guarda en la dirección (#apuntar, #grupo...).
// Así el botón "atrás" del móvil funciona.
function leerPantalla() {
  return window.location.hash.replace('#', '') || 'carta'
}

function irA(pantalla) {
  window.location.hash = pantalla === 'carta' ? '' : pantalla
}

// Enlaces de invitación: futstat.../#unirse/ABC123
const CLAVE_INVITACION = 'futstat:invitacion'

function leerInvitacion() {
  try {
    return sessionStorage.getItem(CLAVE_INVITACION)
  } catch {
    return null
  }
}

function guardarInvitacion(codigo) {
  try {
    if (codigo) sessionStorage.setItem(CLAVE_INVITACION, codigo)
    else sessionStorage.removeItem(CLAVE_INVITACION)
  } catch {
    // sin almacenamiento: la invitación se pierde, pueden meter el código a mano
  }
}

export default function App() {
  // Con Supabase los datos llegan de internet, así que empezamos "cargando"
  const [datos, setDatos] = useState(() => (nube.hayNube ? null : cargarDatos()))
  const [pantalla, setPantalla] = useState(leerPantalla)
  const [invitacion, setInvitacion] = useState(leerInvitacion)
  const [codigoNuevo, setCodigoNuevo] = useState(null)
  const [error, setError] = useState('')
  const [crearAbierto, setCrearAbierto] = useState(false)

  useEffect(() => {
    const alCambiar = () => {
      setPantalla(leerPantalla())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  // Si se abre un enlace de invitación, lo apartamos y vamos a "Mi grupo"
  useEffect(() => {
    if (pantalla.startsWith('unirse/')) {
      const codigo = pantalla.slice('unirse/'.length)
      guardarInvitacion(codigo)
      setInvitacion(codigo)
      window.location.replace('#grupo')
    }
  }, [pantalla])

  const recargar = useCallback(async () => {
    if (!nube.hayNube) return setDatos(cargarDatos())
    try {
      setDatos(await nube.cargarMisDatos())
    } catch (e) {
      setError(e.message)
      setDatos({ jugador: null, partidos: [] })
    }
  }, [])

  useEffect(() => {
    if (nube.hayNube) recargar()
  }, [recargar])

  const invitacionUsada = useCallback(() => {
    guardarInvitacion(null)
    setInvitacion(null)
  }, [])

  // Ejecuta una acción y, si falla, enseña el error arriba
  async function intentar(accion) {
    setError('')
    try {
      await accion()
    } catch (e) {
      setError(e.message)
    }
  }

  // ---------- ACCIONES ----------
  function actualizarLocal(nuevosDatos) {
    setDatos(nuevosDatos)
    guardarDatos(nuevosDatos)
  }

  const crearCarta = (jugador) =>
    intentar(async () => {
      if (!nube.hayNube) return actualizarLocal({ ...datos, jugador })
      // Si había datos de la versión sin cuentas, los subimos a la nube
      const antiguos = cargarDatos()
      const codigo = await nube.crearCuenta(jugador, antiguos.partidos)
      borrarDatos()
      await recargar()
      setCodigoNuevo(codigo)
    })

  const editarCarta = (jugador) =>
    intentar(async () => {
      if (nube.hayNube) {
        await nube.guardarCarta({ ...jugador, id: datos.jugador.id })
        await recargar()
      } else {
        actualizarLocal({ ...datos, jugador })
      }
      irA('carta')
    })

  const apuntarPartido = (partido) =>
    intentar(async () => {
      if (nube.hayNube) {
        const guardado = await nube.apuntarPartido(partido)
        setDatos({ ...datos, partidos: [...datos.partidos, guardado] })
      } else {
        const nuevo = { ...partido, id: crypto.randomUUID(), fecha: new Date().toISOString() }
        actualizarLocal({ ...datos, partidos: [...datos.partidos, nuevo] })
      }
      irA('carta')
    })

  const borrarPartido = (id) =>
    intentar(async () => {
      if (nube.hayNube) await nube.borrarPartido(id)
      const nuevos = { ...datos, partidos: datos.partidos.filter((p) => p.id !== id) }
      if (nube.hayNube) setDatos(nuevos)
      else actualizarLocal(nuevos)
    })

  const entrar = async (codigo) => {
    await nube.entrarConCodigo(codigo)
    await recargar()
  }

  const salir = () =>
    intentar(async () => {
      await nube.salir()
      setDatos({ jugador: null, partidos: [] })
      irA('carta')
    })

  const borrarCuenta = () =>
    intentar(async () => {
      await nube.borrarCuenta()
      setDatos({ jugador: null, partidos: [] })
      irA('carta')
    })

  // ---------- QUÉ PANTALLA SE VE ----------
  let contenido

  if (datos === null) {
    contenido = <p className="py-20 text-center font-titulo text-apagado">Cargando…</p>
  } else if (pantalla === 'privacidad') {
    contenido = (
      <Privacidad
        hayNube={nube.hayNube}
        onVolver={() => history.back()}
        onBorrarTodo={() => {
          borrarDatos()
          setDatos(cargarDatos())
          irA('carta')
        }}
      />
    )
  } else if (!datos.jugador) {
    // Sin carta: crearla (o, con cuentas, entrar con tu código)
    const crear = (
      <CrearCarta
        jugador={nube.hayNube ? cargarDatos().jugador : undefined}
        nueva
        onGuardar={crearCarta}
        onCancelar={nube.hayNube ? () => setCrearAbierto(false) : undefined}
      />
    )
    contenido =
      nube.hayNube && !crearAbierto ? (
        <Bienvenida
          invitado={Boolean(invitacion)}
          onCrear={() => setCrearAbierto(true)}
          onEntrar={entrar}
        />
      ) : (
        crear
      )
  } else if (codigoNuevo) {
    contenido = (
      <Cuenta
        codigo={codigoNuevo}
        nueva
        onListo={() => {
          setCodigoNuevo(null)
          setCrearAbierto(false)
          irA(invitacion ? 'grupo' : 'carta')
        }}
      />
    )
  } else if (pantalla === 'cuenta' && nube.hayNube) {
    contenido = (
      <Cuenta codigo={nube.codigoGuardado()} onSalir={salir} onBorrarCuenta={borrarCuenta} />
    )
  } else if (pantalla === 'grupo') {
    contenido = (
      <MiGrupo
        yo={datos.jugador}
        codigoInvitacion={invitacion}
        onInvitacionUsada={invitacionUsada}
      />
    )
  } else if (pantalla === 'apuntar') {
    contenido = <ApuntarPartido onGuardar={apuntarPartido} onCancelar={() => irA('carta')} />
  } else if (pantalla === 'editar') {
    contenido = (
      <CrearCarta jugador={datos.jugador} onGuardar={editarCarta} onCancelar={() => irA('carta')} />
    )
  } else {
    contenido = (
      <MiCarta
        jugador={datos.jugador}
        partidos={datos.partidos}
        hayNube={nube.hayNube}
        onApuntar={() => irA('apuntar')}
        onEditar={() => irA('editar')}
        onCuenta={() => irA('cuenta')}
        onBorrarPartido={borrarPartido}
      />
    )
  }

  // El menú de abajo se ve cuando ya tienes carta
  const hayMenu = Boolean(datos?.jugador) && !codigoNuevo

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <button onClick={() => irA('carta')} className="font-titulo text-2xl font-bold">
          Fut<span className="text-neon">Stat</span>
        </button>
      </header>

      {error && (
        <p className="mb-4 rounded-xl border border-baja/50 bg-baja/10 p-3 text-sm text-baja">
          {error}
        </p>
      )}

      <main className="flex-1 pb-8">{contenido}</main>

      <footer
        className={`border-t border-borde pt-4 text-center text-xs text-apagado ${
          hayMenu ? 'pb-28' : 'pb-4'
        }`}
      >
        <a href="#privacidad" className="underline">
          Privacidad
        </a>
        <span> · FutStat no tiene relación con EA Sports, FIFA ni ningún club.</span>
      </footer>

      {hayMenu && <Menu pantalla={pantalla} onIr={irA} />}
    </div>
  )
}
