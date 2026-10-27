import { estiloNivel, nivelDe } from '../logic/niveles.js'
import { ATRIBUTOS } from '../logic/valoracion.js'

// La carta de jugador. Solo dibuja: los números le llegan ya calculados.
// Sus colores dependen del nivel (Cantera, Titular, Crack, Leyenda): ver niveles.js
// `estatica` = sin animaciones (para convertirla en imagen).
export default function Carta({
  apodo,
  valoracion,
  atributos,
  cambio,
  partidosJugados,
  racha = 0,
  estatica,
}) {
  const nivel = nivelDe(valoracion)

  return (
    <div
      style={estiloNivel(valoracion)}
      className={`mx-auto w-full max-w-[320px] ${estatica ? 'brillo-fijo' : 'brillo-neon aparecer'}`}
    >
      {/* Capa exterior = borde de neón con los colores del nivel */}
      <div
        className={`forma-carta bg-[linear-gradient(135deg,var(--acento),var(--acento-2),var(--acento))] p-[3px] ${
          nivel.holografico && !estatica ? 'holografico' : ''
        }`}
      >
        <div className="forma-carta relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--acento)_26%,#0d1730)_0%,#0d1730_45%,#070b1a_100%)] px-6 pt-6 pb-7">
          {/* Líneas decorativas y destello de luz */}
          <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-linear-gradient(135deg,transparent_0_14px,rgb(255_255_255/0.05)_14px_15px)]" />
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[var(--acento)] opacity-20 blur-3xl" />
          {!estatica && <div className="destello" />}

          <div className="relative flex items-start justify-between">
            <div>
              <div className="bg-[linear-gradient(180deg,#fff_0%,var(--acento)_55%,var(--acento-2)_100%)] bg-clip-text font-titulo text-6xl leading-none font-bold text-transparent">
                {valoracion}
              </div>
              <div className="mt-1 font-titulo text-xs font-bold tracking-[0.3em] text-[var(--acento)] uppercase">
                {nivel.nombre}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Flecha cambio={cambio} />
              {racha > 0 && (
                <div
                  className="rounded-md border border-orange-400/50 bg-orange-500/10 px-2 py-0.5 font-titulo text-sm font-bold text-orange-300"
                  title={`${racha} ${racha === 1 ? 'semana' : 'semanas'} seguidas jugando`}
                >
                  🔥 {racha}
                </div>
              )}
            </div>
          </div>

          {/* Emblema con la inicial del apodo */}
          <div className="relative my-5 flex justify-center">
            <div className="flex h-24 w-24 rotate-45 items-center justify-center border-2 border-[var(--acento)] bg-[color-mix(in_srgb,var(--acento)_12%,transparent)] shadow-[0_0_28px_var(--brillo)_inset,0_0_18px_var(--brillo)]">
              <span className="-rotate-45 font-titulo text-5xl font-bold text-texto">
                {apodo.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <h2 className="relative truncate text-center font-titulo text-2xl font-bold tracking-wider uppercase">
            {apodo}
          </h2>
          <div className="relative mx-auto my-4 h-px w-3/4 bg-[linear-gradient(90deg,transparent,var(--acento),transparent)]" />

          <ul className="relative grid grid-cols-2 gap-x-6 gap-y-3">
            {ATRIBUTOS.map(({ clave, corto, nombre }) => (
              <li key={clave} title={nombre}>
                <div className="flex items-baseline justify-between font-titulo">
                  <span className="text-xl font-bold">{atributos[clave]}</span>
                  <span className="text-xs tracking-widest text-apagado">{corto}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-[linear-gradient(90deg,var(--acento-2),var(--acento))] shadow-[0_0_8px_var(--brillo)]"
                    style={{ width: `${atributos[clave]}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="relative mt-5 text-center font-titulo text-[11px] tracking-[0.25em] text-apagado uppercase">
            {partidosJugados} {partidosJugados === 1 ? 'partido' : 'partidos'} · FutStat
          </p>
        </div>
      </div>
    </div>
  )
}

function Flecha({ cambio }) {
  if (cambio === 0) {
    return (
      <div className="rounded-md border border-white/15 px-2 py-1 font-titulo text-sm text-apagado">
        = 0
      </div>
    )
  }
  const sube = cambio > 0
  return (
    <div
      className={`flex items-center gap-1 rounded-md border px-2 py-1 font-titulo text-lg font-bold ${
        sube ? 'border-sube/50 bg-sube/10 text-sube' : 'border-baja/50 bg-baja/10 text-baja'
      }`}
      aria-label={sube ? `Ha subido ${cambio}` : `Ha bajado ${-cambio}`}
    >
      <span>{sube ? '▲' : '▼'}</span>
      <span>{sube ? `+${cambio}` : cambio}</span>
    </div>
  )
}
