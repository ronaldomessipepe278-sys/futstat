// Política de privacidad PROVISIONAL. Revisar y completar antes de la Fase 2
// (cuando haya cuentas y datos en un servidor).
export default function Privacidad({ onVolver, onBorrarTodo }) {
  return (
    <article className="space-y-4 text-sm leading-relaxed">
      <h1 className="font-titulo text-2xl font-bold">Privacidad</h1>
      <p className="text-apagado">Versión provisional · Fase de pruebas</p>

      <p>
        FutStat está pensada para que puedas usarla sin dar datos personales. Solo usamos un{' '}
        <strong>apodo</strong>: no pongas tu nombre real.
      </p>
      <p>
        Ahora mismo, todo lo que apuntas (tu carta y tus partidos) se guarda{' '}
        <strong>solo en este navegador</strong>, en tu dispositivo. No se envía a ningún
        servidor y nadie más puede verlo.
      </p>
      <p>No pedimos ni guardamos tu ubicación, tu edad, tu foto ni tu teléfono.</p>
      <p>
        FutStat es un proyecto independiente y no tiene relación con EA Sports, FIFA ni ningún
        club de fútbol.
      </p>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onVolver}
          className="flex-1 rounded-xl border border-borde py-3 font-titulo font-bold"
        >
          Volver
        </button>
        <button
          onClick={() => {
            if (confirm('Esto borrará tu carta y todos tus partidos de este dispositivo. ¿Seguro?'))
              onBorrarTodo()
          }}
          className="flex-1 rounded-xl border border-baja/60 py-3 font-titulo font-bold text-baja"
        >
          Borrar mis datos
        </button>
      </div>
    </article>
  )
}
