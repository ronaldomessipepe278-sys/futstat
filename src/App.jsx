import { useEffect, useState } from 'react'
import { borrarDatos, cargarDatos, guardarDatos } from './logic/almacen.js'
import Menu from './components/Menu.jsx'
import ApuntarPartido from './pantallas/ApuntarPartido.jsx'
import CrearCarta from './pantallas/CrearCarta.jsx'
import MiCarta from './pantallas/MiCarta.jsx'
import MiGrupo from './pantallas/MiGrupo.jsx'
import Privacidad from './pantallas/Privacidad.jsx'

// La pantalla actual se guarda en la dirección (#apuntar, #privacidad...).
// Así el botón "atrás" del móvil funciona.
function leerPantalla() {
  return window.location.hash.replace('#', '') || 'carta'
}

function irA(pantalla) {
  window.location.hash = pantalla === 'carta' ? '' : pantalla
}

export default function App() {
  const [datos, setDatos] = useState(cargarDatos)
  const [pantalla, setPantalla] = useState(leerPantalla)

  useEffect(() => {
    const alCambiar = () => {
      setPantalla(leerPantalla())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  function actualizar(nuevosDatos) {
    setDatos(nuevosDatos)
    guardarDatos(nuevosDatos)
  }

  function guardarPartido(partido) {
    const nuevo = { ...partido, id: crypto.randomUUID(), fecha: new Date().toISOString() }
    actualizar({ ...datos, partidos: [...datos.partidos, nuevo] })
    irA('carta')
  }

  let contenido
  if (pantalla === 'privacidad') {
    contenido = (
      <Privacidad
        onVolver={() => history.back()}
        onBorrarTodo={() => {
          borrarDatos()
          setDatos(cargarDatos())
          irA('carta')
        }}
      />
    )
  } else if (!datos.jugador) {
    contenido = <CrearCarta onGuardar={(jugador) => actualizar({ ...datos, jugador })} />
  } else if (pantalla === 'grupo') {
    contenido = <MiGrupo />
  } else if (pantalla === 'apuntar') {
    contenido = <ApuntarPartido onGuardar={guardarPartido} onCancelar={() => irA('carta')} />
  } else if (pantalla === 'editar') {
    contenido = (
      <CrearCarta
        jugador={datos.jugador}
        onGuardar={(jugador) => {
          actualizar({ ...datos, jugador })
          irA('carta')
        }}
        onCancelar={() => irA('carta')}
      />
    )
  } else {
    contenido = (
      <MiCarta
        jugador={datos.jugador}
        partidos={datos.partidos}
        onApuntar={() => irA('apuntar')}
        onEditar={() => irA('editar')}
        onBorrarPartido={(id) =>
          actualizar({ ...datos, partidos: datos.partidos.filter((p) => p.id !== id) })
        }
      />
    )
  }

  // El menú de abajo se ve en todo menos al crear la carta por primera vez
  const hayMenu = Boolean(datos.jugador)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <button onClick={() => irA('carta')} className="font-titulo text-2xl font-bold">
          Fut<span className="text-neon">Stat</span>
        </button>
      </header>

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
