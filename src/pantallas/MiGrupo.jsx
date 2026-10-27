// Pantalla "Mi grupo". Se activa en la Fase 2, cuando haya cuentas y base de datos:
// sin eso, tus amigos no pueden ver tu carta desde sus móviles.
const NOVEDADES = [
  { titulo: 'Crea tu grupo', texto: 'Tu pachanga, tu equipo del barrio o tu clase.' },
  { titulo: 'Invita con un código', texto: 'Comparte el enlace por WhatsApp y entran al momento.' },
  { titulo: 'Ranking', texto: 'Las cartas de todos ordenadas por valoración.' },
  { titulo: 'Cara a cara', texto: 'Compara tu carta con la de un colega, atributo por atributo.' },
]

export default function MiGrupo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Mi grupo</h1>
        <p className="mt-1 text-sm text-apagado">
          Compárate con tus colegas. Muy pronto disponible.
        </p>
      </div>

      <div className="rounded-2xl border border-neon/40 bg-neon/5 p-5 text-center">
        <div className="font-titulo text-xs tracking-[0.3em] text-neon uppercase">Próximamente</div>
        <p className="mt-2 text-sm">
          Para jugar en grupo necesitas una cuenta (solo con apodo y correo). Estamos en ello.
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
