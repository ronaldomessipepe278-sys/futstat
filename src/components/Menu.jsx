// Barra de menú fija abajo, como en las apps del móvil.
const OPCIONES = [
  {
    pantalla: 'carta',
    texto: 'Mi carta',
    icono: <path d="M7 3h10l3 3v12l-3 3H7l-3-3V6z M9 9h6 M9 13h6 M9 17h3" />,
  },
  { pantalla: 'apuntar', texto: 'Apuntar', destacado: true, icono: <path d="M12 5v14 M5 12h14" /> },
  {
    pantalla: 'grupo',
    texto: 'Mi grupo',
    icono: (
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 5a3 3 0 0 1 0 6 M18 14c2 .8 3 3 3 6" />
    ),
  },
]

export default function Menu({ pantalla, onIr }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-borde bg-fondo/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {OPCIONES.map((o) => {
          const activa = pantalla === o.pantalla
          return (
            <li key={o.pantalla}>
              <button
                onClick={() => onIr(o.pantalla)}
                aria-current={activa ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 py-2 font-titulo text-xs ${
                  activa ? 'text-neon' : 'text-apagado'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    o.destacado ? 'bg-neon text-fondo shadow-[0_0_16px_rgb(34_229_240/0.5)]' : ''
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {o.icono}
                  </svg>
                </span>
                {o.texto}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
