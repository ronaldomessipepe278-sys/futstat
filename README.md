# FutStat

Web de estadísticas para jugadores de fútbol amateur: apuntas tus partidos y se genera tu carta de jugador.

## Cómo arrancarla

```bash
npm install     # solo la primera vez
npm run dev     # abre http://localhost:5173
```

## Dónde está cada cosa

- `src/logic/valoracion.js` → **la fórmula** de la valoración (toca los números de `AJUSTES`)
- `src/logic/almacen.js` → guardar/leer datos en el navegador
- `src/components/Carta.jsx` → el dibujo de la carta
- `src/pantallas/` → cada pantalla (Mi carta, Apuntar partido, Crear carta, Privacidad)
- `src/index.css` → colores y tipografías

## Estado

- [x] Fase 1: Mi carta (con resumen y evolución) + Apuntar partido + menú inferior (datos en el navegador)
- [ ] Fase 2: cuentas, base de datos (Supabase) y grupos con ranking
- [ ] Fase 3: PWA instalable, compartir carta como imagen, pulir diseño
