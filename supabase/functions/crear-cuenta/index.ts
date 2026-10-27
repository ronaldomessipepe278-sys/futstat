// Crea la cuenta de un jugador a partir de su código de acceso.
// La cuenta se crea ya "confirmada", así Supabase no intenta mandar ningún correo
// (los correos de FutStat son inventados: cada jugador entra solo con su código).
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Debe coincidir con DOMINIO_CUENTAS en src/logic/nube.js
const DOMINIO_CUENTAS = 'cuentas.futstat.app'
// 12 letras/números, sin 0/O ni 1/I (igual que los códigos que genera la web)
const FORMATO_CODIGO = /^[A-HJ-NP-Z2-9]{12}$/

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405)

  try {
    const { codigo } = await req.json()
    const limpio = String(codigo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!FORMATO_CODIGO.test(limpio)) return responder({ error: 'Código no válido' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const { error } = await admin.auth.admin.createUser({
      email: `${limpio.toLowerCase()}@${DOMINIO_CUENTAS}`,
      password: limpio,
      email_confirm: true,
    })
    if (error) return responder({ error: error.message }, 400)
    return responder({ ok: true })
  } catch {
    return responder({ error: 'No se pudo crear la cuenta' }, 500)
  }
})
