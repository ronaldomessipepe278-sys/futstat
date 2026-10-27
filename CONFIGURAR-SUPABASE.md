# Conectar FutStat a Supabase (una sola vez, ~10 minutos)

Sin esto la web funciona en "modo local" (sin cuentas ni grupos).

## 1. Crear el proyecto
1. Entra en https://supabase.com → **Start your project** → entra con GitHub.
2. **New project**. Nombre: `futstat`. Pon una contraseña de base de datos (guárdala, aunque no la usaremos).
3. **Region**: elige una de Europa (por ejemplo *West EU (Ireland)* o *Central EU (Frankfurt)*). Importante por privacidad.
4. Espera 1-2 minutos a que se cree.

## 2. Crear las tablas
1. Menú de la izquierda → **SQL Editor** → **New query**.
2. Abre el archivo `supabase/migrations/20261027000000_futstat.sql` de este proyecto en GitHub, pulsa el botón de copiar y pégalo entero.
3. Pulsa **Run**. Debe decir *Success. No rows returned*.

## 3. Quitar la confirmación por correo
FutStat no usa correos reales (cada jugador entra con su código), así que:
1. Menú → **Authentication** → **Sign In / Providers** (o *Providers → Email*).
2. Desactiva **Confirm email** y guarda.

## 4. Copiar las claves
1. Menú → **Project Settings** → **API** (o *Data API* / *API Keys*).
2. Copia la **Project URL** y la clave **anon public** (también llamada *publishable*). Esta clave es pública: está pensada para ir dentro de la web, la seguridad la ponen las reglas de la base de datos.
3. ⚠️ **Nunca** copies ni compartas la clave **service_role / secret**.

## 5. Ponerlas en Vercel
1. Vercel → tu proyecto `futstat` → **Settings** → **Environment Variables**.
2. Añade:
   - `VITE_SUPABASE_URL` = la Project URL
   - `VITE_SUPABASE_ANON_KEY` = la clave anon public
3. **Deployments** → en el último, los tres puntos → **Redeploy**.

¡Listo! Al abrir la web verás "Crear mi carta / Ya tengo carta". Si tenías partidos apuntados en ese móvil, se suben solos al crear la carta.
