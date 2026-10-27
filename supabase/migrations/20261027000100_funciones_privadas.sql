-- Las funciones de ayuda de los permisos pasan a un esquema "privado"
-- que Supabase no publica en internet (antes se podían llamar como /rpc/...).

create schema if not exists privado;
grant usage on schema privado to authenticated;

alter function public.soy_miembro(uuid) set schema privado;
alter function public.comparto_grupo(uuid) set schema privado;

-- Las reglas de permisos ahora usan las funciones privadas
drop policy "ver mi carta y la de mis grupos" on public.jugadores;
create policy "ver mi carta y la de mis grupos" on public.jugadores
  for select to authenticated
  using (id = auth.uid() or privado.comparto_grupo(id));

drop policy "ver mis partidos y los de mis grupos" on public.partidos;
create policy "ver mis partidos y los de mis grupos" on public.partidos
  for select to authenticated
  using (jugador_id = auth.uid() or privado.comparto_grupo(jugador_id));

drop policy "ver mis grupos" on public.grupos;
create policy "ver mis grupos" on public.grupos
  for select to authenticated using (privado.soy_miembro(id));

drop policy "ver miembros de mis grupos" on public.miembros;
create policy "ver miembros de mis grupos" on public.miembros
  for select to authenticated using (privado.soy_miembro(grupo_id));
