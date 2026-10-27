# Supabase en FutStat

## Estado: ✅ conectado

- Proyecto: **futstat** (región París, `eu-west-3`, plan gratuito).
- Tablas y reglas de seguridad: aplicadas (`supabase/migrations/`).
- La web publicada se conecta sola gracias a `.env.production` (claves públicas).
  No hace falta poner nada en Vercel.

## Cómo se crean las cuentas
FutStat no usa correos reales (cada jugador entra con su código). Las cuentas las crea
la función **crear-cuenta** (`supabase/functions/crear-cuenta`), que las deja ya
confirmadas. Por eso da igual cómo esté el ajuste "Confirm email" del panel.

## Si algún día creas otro proyecto
1. Crea el proyecto en una región de Europa.
2. SQL Editor → pega y ejecuta, en orden, los archivos de `supabase/migrations/`.
3. Despliega la función `supabase/functions/crear-cuenta` (Edge Functions → Deploy).
4. Cambia la URL y la clave `anon` en `.env.production` (Project Settings → API).
   ⚠️ Nunca uses la clave `service_role` / `secret`.
