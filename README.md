# FutStat

Web de estadísticas para jugadores de fútbol amateur: apuntas tus partidos y se genera tu carta de jugador.

## Cómo arrancarla

```bash
npm install     # solo la primera vez
npm run dev     # abre http://localhost:5173
```

## Instalarla en el móvil

- **iPhone (Safari):** botón Compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** menú ⋮ → *Instalar aplicación* (o *Añadir a pantalla de inicio*).

## Ordenar el código

```bash
npm run formato   # deja el código bien ordenado (Prettier)
```

## Dónde está cada cosa

- `src/logic/valoracion.js` → **la fórmula** de la valoración (toca los números de `AJUSTES`)
- `src/logic/niveles.js` → **los niveles y sus colores** (Cantera, Titular, Crack, Leyenda)
- `src/logic/insignias.js` → **las insignias** (añade o cambia las condiciones aquí)
- `src/logic/retos.js` → **los retos semanales**
- `src/logic/mvp.js` → recuento de votos del MVP
- `src/logic/almacen.js` → guardar/leer datos en el navegador (modo local)
- `src/logic/nube.js` → cuentas, partidos y grupos en Supabase
- `supabase/migrations/` → las tablas y reglas de seguridad de la base de datos
- `CONFIGURAR-SUPABASE.md` → cómo conectar la web a Supabase
- `src/components/Carta.jsx` → el dibujo de la carta
- `src/components/CompartirCarta.jsx` → convertir la carta en imagen para compartir
- `vite.config.js` → configuración de la PWA (nombre, iconos, colores)
- `src/pantallas/` → cada pantalla (Mi carta, Apuntar partido, Crear carta, Privacidad)
- `src/index.css` → colores y tipografías

## Estado

- [x] Fase 1: Mi carta (con resumen y evolución) + Apuntar partido + menú inferior (datos en el navegador)
- [x] Fase 2: cuentas con código de acceso, base de datos (Supabase), grupos, ranking y cara a cara
- [x] Fase 7: colores por nivel (Cantera, Titular, Crack, Leyenda), racha de semanas y próximo objetivo
- [x] Fase 6: avisos dentro de la web (punto rojo en «Mi grupo» y etiquetas «Nuevo»)
- [x] Fase 5: votación «MVP de la semana» en cada grupo
- [x] Fase 4: retos semanales, insignias y feed de actividad del grupo
- [x] Fase 3: PWA instalable, compartir carta como imagen (1080x1350), aviso al guardar partido, versión de ordenador
