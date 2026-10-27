import { toBlob } from 'html-to-image'
import { useRef, useState } from 'react'
import Carta from './Carta.jsx'
import { estiloNivel } from '../logic/niveles.js'

// Botón que convierte la carta en una imagen (1080x1350, formato Instagram)
// y abre el menú de compartir del móvil. Si no se puede, la descarga.
export default function CompartirCarta(props) {
  const marco = useRef(null)
  const [estado, setEstado] = useState('')

  async function compartir() {
    setEstado('creando')
    try {
      await document.fonts.ready
      const imagen = await toBlob(marco.current, { pixelRatio: 3, cacheBust: true })
      const archivo = new File([imagen], `futstat-${props.apodo}.png`, { type: 'image/png' })
      const texto = `Mi carta en FutStat: ${props.valoracion} de media. ¿Me superas? ${window.location.origin}`

      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], text: texto })
        } catch {
          // ha cancelado el menú de compartir: no pasa nada
        }
      } else {
        const enlace = document.createElement('a')
        enlace.href = URL.createObjectURL(imagen)
        enlace.download = archivo.name
        enlace.click()
        URL.revokeObjectURL(enlace.href)
      }
      setEstado('')
    } catch {
      setEstado('error')
    }
  }

  return (
    <>
      <button
        onClick={compartir}
        disabled={estado === 'creando'}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neon/60 py-3 font-titulo text-lg font-bold text-neon disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12 M7 8l5-5 5 5 M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
        </svg>
        {estado === 'creando' ? 'Creando imagen…' : 'Compartir mi carta'}
      </button>
      {estado === 'error' && (
        <p className="text-center text-sm text-baja">
          No se pudo crear la imagen. Prueba otra vez.
        </p>
      )}

      {/* Marco de la imagen: está fuera de la pantalla, solo sirve para "fotografiarlo" */}
      <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[9999px]">
        <div
          ref={marco}
          className="flex h-[450px] w-[360px] flex-col items-center justify-between bg-fondo px-8 py-6"
          style={{
            ...estiloNivel(props.valoracion),
            backgroundImage:
              'radial-gradient(circle at 50% 38%, var(--brillo), transparent 62%), radial-gradient(circle at 100% 0%, rgb(168 85 247 / 0.25), transparent 50%), linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 100% 100%, 24px 24px, 24px 24px',
          }}
        >
          <div className="font-titulo text-xl font-bold text-texto">
            Fut<span className="text-[var(--acento)]">Stat</span>
          </div>
          {/* La carta se dibuja a su tamaño normal y se encoge para que quepa */}
          <div className="h-[344px] w-[218px]">
            <div className="w-[320px] origin-top-left scale-[0.68]">
              <Carta {...props} estatica />
            </div>
          </div>
          <div className="font-titulo text-sm tracking-[0.25em] text-apagado uppercase">
            ¿Me superas?
          </div>
        </div>
      </div>
    </>
  )
}
