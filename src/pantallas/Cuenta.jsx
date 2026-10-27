import { useState } from 'react'

// Muestra tu código de acceso. `nueva` = acabas de crear la cuenta.
export default function Cuenta({ codigo, nueva, onListo, onSalir, onBorrarCuenta }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
    } catch {
      // algunos navegadores no dejan copiar: el código se puede apuntar a mano
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">{nueva ? '¡Carta creada!' : 'Mi cuenta'}</h1>
        <p className="mt-1 text-sm text-apagado">
          Este es tu <strong className="text-texto">código de acceso</strong>. Con él entras desde
          cualquier móvil u ordenador. Guárdalo bien (captura de pantalla, notas…) y no se lo pases
          a nadie: quien lo tenga puede entrar en tu cuenta.
        </p>
      </div>

      <div className="rounded-2xl border border-neon/50 bg-neon/5 p-5 text-center">
        <div className="font-titulo text-3xl font-bold tracking-widest text-neon select-all">
          {codigo ?? 'No disponible en este dispositivo'}
        </div>
        {codigo && (
          <button onClick={copiar} className="mt-3 font-titulo text-sm text-neon underline">
            {copiado ? '¡Copiado!' : 'Copiar código'}
          </button>
        )}
      </div>

      {nueva ? (
        <button
          onClick={onListo}
          className="w-full rounded-xl bg-neon py-4 font-titulo text-lg font-bold text-fondo"
        >
          Ya lo he guardado
        </button>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => {
              if (confirm('Para volver a entrar necesitarás tu código. ¿Cerrar sesión?')) onSalir()
            }}
            className="w-full rounded-xl border border-borde py-3 font-titulo font-bold"
          >
            Cerrar sesión
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  'Se borrarán para siempre tu carta, tus partidos y tu sitio en los grupos. ¿Seguro?',
                )
              )
                onBorrarCuenta()
            }}
            className="w-full rounded-xl border border-baja/60 py-3 font-titulo font-bold text-baja"
          >
            Borrar mi cuenta y mis datos
          </button>
        </div>
      )}
    </div>
  )
}
