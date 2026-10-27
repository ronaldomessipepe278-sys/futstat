import { useCallback, useEffect, useRef, useState } from 'react'
import Menu from './components/Menu.jsx'
import { borrarDatos, cargarDatos, guardarDatos } from './logic/almacen.js'
import * as nube from './logic/nube.js'
import { insigniasConseguidas } from './logic/insignias.js'
import { esNuevo, marcarVisto, ultimaVisita } from './logic/novedades.js'
import { retosActuales } from './logic/retos.js'
import { rachaSemanas } from './logic/estadisticas.js'
import { nivelDe } from './logic/niveles.js'
import { cambioUltimoPartido, valoracionGeneral } from './logic/valoracion.js'
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
  const [aviso, setAviso] = useState(null)
  const temporizadorAviso = useRef(null)
  // Avisos dentro de la web: lo último que pasó en tus grupos y cuándo lo miraste
  const [novedad, setNovedad] = useState(null)
  const [visto, setVisto] = useState(ultimaVisita)
  const [visitaAnterior, setVisitaAnterior] = useState(visto)

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

  // Comprobamos si hay novedades al abrir, cada 2 minutos y al volver a la pestaña
  const miId = datos?.jugador?.id
  useEffect(() => {
    if (!nube.hayNube || !miId) return
    const comprobarNovedades = () =>
      nube
        .ultimaNovedad(miId)
        .then(setNovedad)
        .catch(() => {})
    comprobarNovedades()
    const intervalo = setInterval(comprobarNovedades, 2 * 60 * 1000)
    const alVolver = () => document.visibilityState === 'visible' && comprobarNovedades()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [miId])

  // Al entrar en "Mi grupo" se marca todo como visto (y también al salir)
  useEffect(() => {
    if (pantalla !== 'grupo') return
    setVisitaAnterior(ultimaVisita())
    setVisto(marcarVisto())
    return () => setVisto(marcarVisto())
  }, [pantalla])

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
      let nuevo
      if (nube.hayNube) {
        nuevo = await nube.apuntarPartido(partido)
        setDatos({ ...datos, partidos: [...datos.partidos, nuevo] })
      } else {
        nuevo = { ...partido, id: crypto.randomUUID(), fecha: new Date().toISOString() }
        actualizarLocal({ ...datos, partidos: [...datos.partidos, nuevo] })
      }
      mostrarAviso(datos.jugador.base, datos.partidos, [...datos.partidos, nuevo])
      irA('carta')
    })

  // Aviso tras guardar un partido: cuánto subes y si has ganado insignias o retos
  function mostrarAviso(base, antes, despues) {
    const cambio = cambioUltimoPartido(base, despues)
    const texto =
      cambio > 0
        ? `¡Subes! +${cambio} de media ▲`
        : cambio < 0
          ? `Bajas ${-cambio}. ¡El próximo lo petas! ▼`
          : 'Partido guardado. Te mantienes ='

    const extras = []
    // ¿Has cambiado de nivel?
    const nivelAntes = nivelDe(valoracionGeneral(base, antes))
    const nivelAhora = nivelDe(valoracionGeneral(base, despues))
    if (nivelAhora.minimo > nivelAntes.minimo) extras.push(`⬆️ ¡Subes a ${nivelAhora.nombre}!`)
    // ¿Primer partido de la semana? Entonces la racha crece
    const racha = rachaSemanas(despues)
    if (!rachaSemanas(antes).jugoEstaSemana && racha.jugoEstaSemana) {
      extras.push(
        `🔥 Racha: ${racha.semanas} ${racha.semanas === 1 ? 'semana' : 'semanas seguidas'}`,
      )
    }

    const yaTenia = new Set(insigniasConseguidas(base, antes).map((i) => i.id))
    extras.push(
      ...insigniasConseguidas(base, despues)
        .filter((i) => !yaTenia.has(i.id))
        .map((i) => `${i.icono} Nueva insignia: ${i.nombre}`),
    )
    const retosAntes = new Set(
      retosActuales(antes)
        .filter((r) => r.completado)
        .map((r) => r.id),
    )
    for (const reto of retosActuales(despues)) {
      if (reto.completado && !retosAntes.has(reto.id)) extras.push(`✓ Reto: ${reto.texto}`)
    }

    setAviso({ texto, extras, tipo: cambio > 0 ? 'sube' : cambio < 0 ? 'baja' : 'igual' })
    clearTimeout(temporizadorAviso.current)
    temporizadorAviso.current = setTimeout(() => setAviso(null), extras.length ? 5000 : 3500)
  }

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
        visitaAnterior={visitaAnterior}
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

  // El menú se ve cuando ya tienes carta (abajo en el móvil, arriba en el ordenador)
  const hayMenu = Boolean(datos?.jugador) && !codigoNuevo
  const avisos = { grupo: pantalla !== 'grupo' && esNuevo(novedad, visto) }
  // Toda la web toma el color de tu nivel (Cantera verde, Crack violeta, Leyenda dorado...)
  const miNivel = datos?.jugador
    ? nivelDe(valoracionGeneral(datos.jugador.base, datos.partidos))
    : null
  const temaWeb = miNivel
    ? { '--color-neon': miNivel.color, '--color-neon-suave': miNivel.color2 }
    : undefined
  // "Mi carta" y "Mi grupo" aprovechan el ancho del ordenador; el resto, columna estrecha
  const ancha = hayMenu && (pantalla === 'carta' || pantalla === 'grupo')

  return (
    <div
      style={temaWeb}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[env(safe-area-inset-top)] lg:max-w-5xl"
    >
      <header className="flex items-center justify-between py-4">
        <button onClick={() => irA('carta')} className="font-titulo text-2xl font-bold">
          Fut<span className="text-neon">Stat</span>
        </button>
        {hayMenu && <Menu pantalla={pantalla} onIr={irA} avisos={avisos} arriba />}
      </header>

      {error && (
        <p className="mx-auto mb-4 w-full max-w-md rounded-xl border border-baja/50 bg-baja/10 p-3 text-sm text-baja">
          {error}
        </p>
      )}

      <main className={`w-full flex-1 pb-8 ${ancha ? '' : 'mx-auto max-w-md'}`}>{contenido}</main>

      {aviso && (
        <div
          role="status"
          className={`aviso-entra fixed bottom-24 left-1/2 z-20 rounded-2xl border px-5 py-3 text-center font-titulo font-bold whitespace-nowrap shadow-lg backdrop-blur lg:bottom-8 ${
            aviso.tipo === 'sube'
              ? 'border-sube/60 bg-panel text-sube'
              : aviso.tipo === 'baja'
                ? 'border-baja/60 bg-panel text-baja'
                : 'border-neon/60 bg-panel text-neon'
          }`}
        >
          {aviso.texto}
          {aviso.extras.map((extra) => (
            <span key={extra} className="block text-sm text-texto">
              {extra}
            </span>
          ))}
        </div>
      )}

      <footer
        className={`border-t border-borde pt-4 text-center text-xs text-apagado ${
          hayMenu ? 'pb-28 lg:pb-6' : 'pb-4'
        }`}
      >
        <a href="#privacidad" className="underline">
          Privacidad
        </a>
        <span> · FutStat no tiene relación con EA Sports, FIFA ni ningún club.</span>
      </footer>

      {hayMenu && <Menu pantalla={pantalla} onIr={irA} avisos={avisos} />}
    </div>
  )
}
