# Supabase en FutStat

## Estado: ✅ conectado

- Proyecto: **futstat** (región París, `eu-west-3`, plan gratuito).
- Tablas y reglas de seguridad: aplicadas (`supabase/migrations/`).
- La web publicada se conecta sola gracias a `.env.production` (claves públicas).
  No hace falta poner nada en Vercel.

## Ajuste obligatorio en el panel de Supabase
FutStat no usa correos reales (cada jugador entra con su código), así que:
**Authentication → Sign In / Providers → Email → desactivar "Confirm email" → Save.**

Si está activado, al crear una carta saldrá el error
"Supabase pide confirmar el correo".

## Si algún día creas otro proyecto
1. Crea el proyecto en una región de Europa.
2. SQL Editor → pega y ejecuta, en orden, los archivos de `supabase/migrations/`.
3. Desactiva "Confirm email".
4. Cambia la URL y la clave `anon` en `.env.production` (Project Settings → API).
   ⚠️ Nunca uses la clave `service_role` / `secret`.
