// Política de privacidad PROVISIONAL. Conviene revisarla antes de abrir la web a mucha gente.
export default function Privacidad({ hayNube, onVolver, onBorrarTodo }) {
  return (
    <article className="space-y-4 text-sm leading-relaxed">
      <h1 className="font-titulo text-2xl font-bold">Privacidad</h1>
      <p className="text-apagado">Versión provisional</p>

      <p>
        FutStat está pensada para que puedas usarla sin dar datos personales. Solo usamos un{' '}
        <strong>apodo</strong>: no pongas tu nombre real.
      </p>

      {hayNube ? (
        <>
          <p>
            Para entrar no pedimos correo, teléfono ni contraseña: cada jugador tiene un{' '}
            <strong>código de acceso</strong> que se crea al hacer su carta.
          </p>
          <p>
            Guardamos tu apodo, tus atributos, tus partidos (resultado, goles, asistencias y nota),
            los grupos a los que perteneces y tus votos al MVP de la semana. Esos datos están en
            Supabase, nuestro proveedor de base de datos.
          </p>
          <p>
            Tu carta y tus partidos solo los ven las personas de tus grupos. Nadie más puede verlos.
          </p>
          <p>
            Puedes borrar tu cuenta y todos tus datos cuando quieras desde{' '}
            <a href="#cuenta" className="text-neon underline">
              Mi código de acceso
            </a>
            .
          </p>
        </>
      ) : (
        <p>
          Ahora mismo, todo lo que apuntas (tu carta y tus partidos) se guarda{' '}
          <strong>solo en este navegador</strong>, en tu dispositivo. No se envía a ningún servidor
          y nadie más puede verlo.
        </p>
      )}

      <p>No pedimos ni guardamos tu nombre, ubicación, edad, foto ni teléfono.</p>
      <p>
        FutStat es un proyecto independiente y no tiene relación con EA Sports, FIFA ni ningún club
        de fútbol.
      </p>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onVolver}
          className="flex-1 rounded-xl border border-borde py-3 font-titulo font-bold"
        >
          Volver
        </button>
        {!hayNube && (
          <button
            onClick={() => {
              if (
                confirm('Esto borrará tu carta y todos tus partidos de este dispositivo. ¿Seguro?')
              )
                onBorrarTodo()
            }}
            className="flex-1 rounded-xl border border-baja/60 py-3 font-titulo font-bold text-baja"
          >
            Borrar mis datos
          </button>
        )}
      </div>
    </article>
  )
}
