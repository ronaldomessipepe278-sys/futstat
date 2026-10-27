import { useCallback, useEffect, useMemo, useState } from 'react'
import Actividad from '../components/Actividad.jsx'
import CaraACara from '../components/CaraACara.jsx'
import Mvp from '../components/Mvp.jsx'
import { claveSemana, ganadores, semanaPasada } from '../logic/mvp.js'
import { esNuevo } from '../logic/novedades.js'
import { rachaSemanas } from '../logic/estadisticas.js'
import { insigniasConseguidas } from '../logic/insignias.js'
import { estiloNivel } from '../logic/niveles.js'
import * as nube from '../logic/nube.js'
import {
  atributosActuales,
  cambioUltimoPartido,
  nivel,
  valoracionGeneral,
} from '../logic/valoracion.js'

const CLAVE_GRUPO = 'futstat:grupo'

function leerGrupoElegido() {
  try {
    return localStorage.getItem(CLAVE_GRUPO)
  } catch {
    return null
  }
}

function recordarGrupoElegido(id) {
  try {
    localStorage.setItem(CLAVE_GRUPO, id)
  } catch {
    // no pasa nada: la próxima vez se abrirá el primer grupo
  }
}

export default function MiGrupo({ yo, visitaAnterior, codigoInvitacion, onInvitacionUsada }) {
  if (!nube.hayNube) return <Proximamente />
  return (
    <GruposConectados
      yo={yo}
      visitaAnterior={visitaAnterior}
      codigoInvitacion={codigoInvitacion}
      onInvitacionUsada={onInvitacionUsada}
    />
  )
}

function GruposConectados({ yo, visitaAnterior, codigoInvitacion, onInvitacionUsada }) {
  const [grupos, setGrupos] = useState(null)
  const [elegido, setElegido] = useState(leerGrupoElegido)
  const [jugadores, setJugadores] = useState(null)
  const [formulario, setFormulario] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const recargarGrupos = useCallback(async (idAElegir) => {
    const lista = await nube.misGrupos()
    setGrupos(lista)
    const id = idAElegir ?? leerGrupoElegido()
    const valido = lista.find((g) => g.id === id) ?? lista[0]
    setElegido(valido?.id ?? null)
    if (valido) recordarGrupoElegido(valido.id)
  }, [])

  // Al entrar: si vienes de un enlace de invitación, te une; después carga tus grupos
  useEffect(() => {
    let cancelado = false
    async function arrancar() {
      try {
        let idNuevo
        if (codigoInvitacion) {
          const grupo = await nube.unirseGrupo(codigoInvitacion)
          idNuevo = grupo.id
          if (!cancelado) setAviso(`¡Te has unido a «${grupo.nombre}»!`)
        }
        if (!cancelado) await recargarGrupos(idNuevo)
      } catch (e) {
        if (!cancelado) {
          setError(e.message)
          await recargarGrupos().catch(() => setGrupos([]))
        }
      } finally {
        if (codigoInvitacion) onInvitacionUsada()
      }
    }
    arrancar()
    return () => {
      cancelado = true
    }
  }, [codigoInvitacion, onInvitacionUsada, recargarGrupos])

  // Cargar las cartas del grupo elegido
  useEffect(() => {
    if (!elegido) return
    let cancelado = false
    setJugadores(null)
    nube
      .cargarGrupo(elegido)
      .then((lista) => !cancelado && setJugadores(lista))
      .catch((e) => !cancelado && setError(e.message))
    return () => {
      cancelado = true
    }
  }, [elegido])

  async function alCrearOUnirse(accion) {
    setError('')
    setAviso('')
    const grupo = await accion()
    setFormulario(false)
    await recargarGrupos(grupo.id)
  }

  if (grupos === null) return <Cargando />

  const grupo = grupos.find((g) => g.id === elegido)

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-bold">Mi grupo</h1>

      {aviso && (
        <p className="rounded-xl border border-sube/50 bg-sube/10 p-3 text-sm text-sube">{aviso}</p>
      )}
      {error && (
        <p className="rounded-xl border border-baja/50 bg-baja/10 p-3 text-sm text-baja">{error}</p>
      )}

      {grupos.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {grupos.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setElegido(g.id)
                recordarGrupoElegido(g.id)
                setFormulario(false)
              }}
              className={`shrink-0 rounded-full border px-4 py-2 font-titulo text-sm font-bold ${
                g.id === elegido && !formulario
                  ? 'border-neon bg-neon text-fondo'
                  : 'border-borde text-apagado'
              }`}
            >
              {g.nombre}
            </button>
          ))}
          <button
            onClick={() => setFormulario(!formulario)}
            className={`shrink-0 rounded-full border px-4 py-2 font-titulo text-sm font-bold ${
              formulario ? 'border-neon text-neon' : 'border-dashed border-borde text-apagado'
            }`}
          >
            + Otro grupo
          </button>
        </div>
      )}

      {grupos.length === 0 || formulario ? (
        <CrearOUnirse onAccion={alCrearOUnirse} />
      ) : (
        grupo && (
          <VistaGrupo
            grupo={grupo}
            visitaAnterior={visitaAnterior}
            jugadores={jugadores}
            yo={yo}
            onSalir={async () => {
              await nube.salirDeGrupo(grupo.id, yo.id)
              await recargarGrupos()
            }}
          />
        )
      )}
    </div>
  )
}

function CrearOUnirse({ onAccion }) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function ejecutar(evento, accion) {
    evento.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onAccion(accion)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-baja">{error}</p>}
      <form
        onSubmit={(e) => ejecutar(e, () => nube.unirseGrupo(codigo))}
        className="rounded-2xl border border-borde bg-panel p-4"
      >
        <h2 className="font-titulo text-lg font-bold">Unirme a un grupo</h2>
        <p className="text-sm text-apagado">Pide el código a tus colegas.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="CÓDIGO"
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            className="w-0 flex-1 rounded-xl border border-borde bg-fondo px-3 py-3 text-center font-titulo text-xl tracking-widest uppercase outline-none focus:border-neon"
          />
          <button
            disabled={enviando || codigo.trim().length < 6}
            className="rounded-xl bg-neon px-5 font-titulo font-bold text-fondo disabled:opacity-40"
          >
            Unirme
          </button>
        </div>
      </form>

      <form
        onSubmit={(e) => ejecutar(e, () => nube.crearGrupo(nombre))}
        className="rounded-2xl border border-borde bg-panel p-4"
      >
        <h2 className="font-titulo text-lg font-bold">Crear un grupo</h2>
        <p className="text-sm text-apagado">
          Tu pachanga, tu equipo o tu clase. Sin nombres reales.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Pachanga del martes"
            maxLength={30}
            autoComplete="off"
            className="w-0 flex-1 rounded-xl border border-borde bg-fondo px-3 py-3 outline-none focus:border-neon"
          />
          <button
            disabled={enviando || nombre.trim().length < 2}
            className="rounded-xl border border-neon px-5 font-titulo font-bold text-neon disabled:opacity-40"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  )
}

function VistaGrupo({ grupo, jugadores, yo, visitaAnterior, onSalir }) {
  const ranking = useMemo(
    () =>
      (jugadores ?? [])
        .map((j) => ({
          ...j,
          valoracion: valoracionGeneral(j.base, j.partidos),
          cambio: cambioUltimoPartido(j.base, j.partidos),
          atributos: atributosActuales(j.base, j.partidos),
          insignias: insigniasConseguidas(j.base, j.partidos).length,
          racha: rachaSemanas(j.partidos).semanas,
        }))
        .sort((x, y) => y.valoracion - x.valoracion || y.partidos.length - x.partidos.length),
    [jugadores],
  )
  const [comparar, setComparar] = useState(null)
  const [pestana, setPestana] = useState('ranking')
  const [votos, setVotos] = useState([])

  // Votos del MVP de esta semana y la anterior
  const cargarVotos = useCallback(
    () => nube.votosDelGrupo(grupo.id, [claveSemana(), semanaPasada()]).then(setVotos),
    [grupo.id],
  )
  useEffect(() => {
    cargarVotos().catch(() => setVotos([]))
  }, [cargarVotos])

  if (jugadores === null) return <Cargando />

  const mvpPasados = new Set(ganadores(votos, semanaPasada()))
  const actividadNueva = ranking.some(
    (j) => j.id !== yo.id && j.partidos.some((p) => esNuevo(p.fecha, visitaAnterior)),
  )
  // Solo hay líder si el primero va por delante del segundo (no en empate)
  const hayLider = ranking.length > 1 && ranking[0].valoracion > ranking[1].valoracion

  // Por defecto: yo contra el mejor del grupo que no sea yo
  const rival = ranking.find((j) => j.id !== yo.id)
  const izquierda = comparar?.[0] ?? yo.id
  const derecha = comparar?.[1] ?? rival?.id

  const PESTANAS = [
    ['ranking', 'Ranking'],
    ['actividad', 'Actividad'],
    ['mvp', 'MVP'],
    ['cara', '1 vs 1'],
  ]

  return (
    <div className="space-y-6">
      <Invitar grupo={grupo} />

      <div
        role="tablist"
        className="grid grid-cols-4 gap-1 rounded-xl border border-borde bg-panel p-1"
      >
        {PESTANAS.map(([id, texto]) => (
          <button
            key={id}
            role="tab"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={`rounded-lg py-2 font-titulo text-sm font-bold ${
              pestana === id ? 'bg-neon text-fondo' : 'text-apagado'
            }`}
          >
            {texto}
            {id === 'actividad' && actividadNueva && pestana !== 'actividad' && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-baja align-middle">
                <span className="sr-only">Hay novedades</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {pestana === 'ranking' && (
        <section>
          <ObjetivoGrupo ranking={ranking} yo={yo} />
          <h2 className="mb-2 font-titulo text-sm tracking-widest text-apagado uppercase">
            {ranking.length} {ranking.length === 1 ? 'jugador' : 'jugadores'} · toca a alguien para
            compararte
          </h2>
          <ol className="space-y-2">
            {ranking.map((j, i) => (
              <li key={j.id}>
                <button
                  onClick={() => {
                    if (j.id === yo.id) return
                    setComparar([yo.id, j.id])
                    setPestana('cara')
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${
                    j.id === yo.id ? 'border-neon/60 bg-neon/5' : 'border-borde bg-panel'
                  }`}
                >
                  <span
                    className={`w-6 text-center font-titulo text-lg font-bold ${
                      i < 3 ? 'text-neon' : 'text-apagado'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={estiloNivel(j.valoracion)}
                    className={`forma-carta flex h-12 w-10 items-center justify-center bg-[linear-gradient(180deg,var(--acento),var(--acento-2))] font-titulo text-lg font-bold text-fondo ${
                      i === 0 && hayLider ? 'brillo-neon' : ''
                    }`}
                  >
                    {j.valoracion}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-titulo font-bold">
                      {mvpPasados.has(j.id) && <span title="MVP de la semana pasada">👑 </span>}
                      {j.apodo}
                      {j.id === yo.id && <span className="text-neon"> (tú)</span>}
                    </span>
                    <span className="text-xs text-apagado">
                      {i === 0 && hayLider && <span className="text-neon">Líder · </span>}
                      {nivel(j.valoracion)} · {j.partidos.length} partidos · 🏅 {j.insignias}
                      {j.racha > 0 && ` · 🔥 ${j.racha}`}
                    </span>
                  </span>
                  {j.cambio !== 0 && (
                    <span
                      className={`font-titulo text-sm font-bold ${j.cambio > 0 ? 'text-sube' : 'text-baja'}`}
                    >
                      {j.cambio > 0 ? `▲${j.cambio}` : `▼${-j.cambio}`}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {pestana === 'actividad' && (
        <Actividad jugadores={ranking} yo={yo} visitaAnterior={visitaAnterior} />
      )}

      {pestana === 'mvp' && (
        <Mvp
          jugadores={ranking}
          yo={yo}
          votos={votos}
          onVotar={async (id) => {
            await nube.votar(grupo.id, id)
            await cargarVotos()
          }}
        />
      )}

      {pestana === 'cara' &&
        (rival ? (
          <CaraACara
            jugadores={ranking}
            izquierda={izquierda}
            derecha={derecha}
            onCambiar={(a, b) => setComparar([a, b])}
          />
        ) : (
          <p className="text-sm text-apagado">
            Invita a alguien al grupo para poder compararte cara a cara.
          </p>
        ))}

      <button
        onClick={() => {
          if (confirm(`¿Salir de «${grupo.nombre}»?`)) onSalir()
        }}
        className="w-full py-2 text-sm text-apagado underline"
      >
        Salir de este grupo
      </button>
    </div>
  )
}

// "Te faltan X puntos para adelantar a Beto": el rival que tienes justo delante
function ObjetivoGrupo({ ranking, yo }) {
  const puesto = ranking.findIndex((j) => j.id === yo.id)
  if (puesto === -1 || ranking.length < 2) return null
  const mio = ranking[puesto]

  let texto
  if (puesto === 0) {
    const segundo = ranking[1]
    const ventaja = mio.valoracion - segundo.valoracion
    texto =
      ventaja === 0 ? (
        <>
          Empatas en cabeza con <strong>{segundo.apodo}</strong>. ¡Un buen partido y te quedas solo
          arriba!
        </>
      ) : (
        <>
          👑 Vas primero. <strong>{segundo.apodo}</strong> está a{' '}
          <strong className="text-neon">{ventaja}</strong> {ventaja === 1 ? 'punto' : 'puntos'}.
        </>
      )
  } else {
    const delante = ranking[puesto - 1]
    const faltan = delante.valoracion - mio.valoracion + 1
    texto = (
      <>
        🎯 Te {faltan === 1 ? 'falta' : 'faltan'}{' '}
        <strong className="text-neon">
          {faltan} {faltan === 1 ? 'punto' : 'puntos'}
        </strong>{' '}
        para adelantar a <strong>{delante.apodo}</strong> y subir al {puesto}º puesto
      </>
    )
  }

  return (
    <p className="mb-4 rounded-2xl border border-neon/40 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-neon)_12%,transparent),rgb(168_85_247/0.1))] p-4 text-sm">
      {texto}
    </p>
  )
}

function Invitar({ grupo }) {
  const [copiado, setCopiado] = useState(false)
  const enlace = `${window.location.origin}${window.location.pathname}#unirse/${grupo.codigo}`
  const mensaje = `¡Únete a «${grupo.nombre}» en FutStat y compara tu carta con la mía! ${enlace}`

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FutStat', text: mensaje })
        return
      } catch {
        // cancelado: probamos con WhatsApp
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener')
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
    } catch {
      // el código sigue visible para apuntarlo a mano
    }
  }

  return (
    <div className="rounded-2xl border border-neon/40 bg-neon/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-titulo text-xl font-bold">{grupo.nombre}</h2>
          <p className="text-xs text-apagado">Código del grupo</p>
          <p className="font-titulo text-2xl font-bold tracking-[0.2em] text-neon select-all">
            {grupo.codigo}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={compartir}
            className="rounded-lg bg-neon px-4 py-2 font-titulo text-sm font-bold text-fondo"
          >
            Invitar
          </button>
          <button onClick={copiar} className="font-titulo text-xs text-neon underline">
            {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Cargando() {
  return <p className="py-10 text-center font-titulo text-apagado">Cargando…</p>
}

const NOVEDADES = [
  { titulo: 'Crea tu grupo', texto: 'Tu pachanga, tu equipo del barrio o tu clase.' },
  { titulo: 'Invita con un código', texto: 'Comparte el enlace por WhatsApp y entran al momento.' },
  { titulo: 'Ranking', texto: 'Las cartas de todos ordenadas por valoración.' },
  { titulo: 'Cara a cara', texto: 'Compara tu carta con la de un colega, atributo por atributo.' },
]

// Se ve solo si la web aún no está conectada a Supabase
function Proximamente() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Mi grupo</h1>
        <p className="mt-1 text-sm text-apagado">
          Compárate con tus colegas. Muy pronto disponible.
        </p>
      </div>
      <ul className="space-y-3">
        {NOVEDADES.map((n, i) => (
          <li key={n.titulo} className="flex gap-4 rounded-xl border border-borde bg-panel p-4">
            <span className="font-titulo text-2xl font-bold text-neon/60">{i + 1}</span>
            <div>
              <div className="font-titulo font-bold">{n.titulo}</div>
              <div className="text-sm text-apagado">{n.texto}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
