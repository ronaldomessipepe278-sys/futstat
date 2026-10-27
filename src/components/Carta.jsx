import { ATRIBUTOS, nivel } from '../logic/valoracion.js'

// La carta de jugador. Solo dibuja: los números le llegan ya calculados.
export default function Carta({ apodo, valoracion, atributos, cambio, partidosJugados }) {
  return (
    <div className="brillo-neon mx-auto w-full max-w-[320px]">
      {/* Capa exterior = borde neón */}
      <div className="forma-carta bg-gradient-to-br from-neon via-neon-suave to-neon p-[2px]">
        <div className="forma-carta relative overflow-hidden bg-gradient-to-b from-[#0d2236] via-panel to-[#060a14] px-6 pt-6 pb-7">
          {/* Líneas decorativas */}
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-linear-gradient(135deg,transparent_0_14px,rgb(34_229_240/0.08)_14px_15px)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="font-titulo text-6xl leading-none font-bold text-neon">
                {valoracion}
              </div>
              <div className="mt-1 font-titulo text-xs tracking-[0.3em] text-apagado uppercase">
                {nivel(valoracion)}
              </div>
            </div>
            <Flecha cambio={cambio} />
          </div>

          {/* Emblema con la inicial del apodo */}
          <div className="relative my-5 flex justify-center">
            <div className="flex h-24 w-24 rotate-45 items-center justify-center border-2 border-neon/70 bg-neon/5 shadow-[0_0_24px_rgb(34_229_240/0.35)_inset]">
              <span className="-rotate-45 font-titulo text-5xl font-bold text-texto">
                {apodo.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <h2 className="relative truncate text-center font-titulo text-2xl font-bold tracking-wider uppercase">
            {apodo}
          </h2>
          <div className="relative mx-auto my-4 h-px w-3/4 bg-gradient-to-r from-transparent via-neon to-transparent" />

          <ul className="relative grid grid-cols-2 gap-x-6 gap-y-3">
            {ATRIBUTOS.map(({ clave, corto, nombre }) => (
              <li key={clave} title={nombre}>
                <div className="flex items-baseline justify-between font-titulo">
                  <span className="text-xl font-bold">{atributos[clave]}</span>
                  <span className="text-xs tracking-widest text-apagado">{corto}</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-borde">
                  <div
                    className="h-1 rounded-full bg-neon"
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
      <div className="rounded-md border border-borde px-2 py-1 font-titulo text-sm text-apagado">
        = 0
      </div>
    )
  }
  const sube = cambio > 0
  return (
    <div
      className={`flex items-center gap-1 rounded-md border px-2 py-1 font-titulo text-lg font-bold ${
        sube ? 'border-sube/50 text-sube' : 'border-baja/50 text-baja'
      }`}
      aria-label={sube ? `Ha subido ${cambio}` : `Ha bajado ${-cambio}`}
    >
      <span>{sube ? '▲' : '▼'}</span>
      <span>{sube ? `+${cambio}` : cambio}</span>
    </div>
  )
}
