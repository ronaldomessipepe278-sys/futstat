-- ============================================================
--  VOTACIÓN "MVP DE LA SEMANA"
--  Cada jugador vota una vez por semana (lunes a domingo, hora
--  de España) a un compañero de su grupo. Puede cambiar el voto.
-- ============================================================

create table public.votos (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  semana date not null, -- el lunes de esa semana
  votante_id uuid not null references public.jugadores (id) on delete cascade,
  votado_id uuid not null references public.jugadores (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (grupo_id, semana, votante_id),
  check (votante_id <> votado_id)
);
create index votos_grupo_semana on public.votos (grupo_id, semana);

alter table public.votos enable row level security;

-- Ves los votos de tus grupos. No hay reglas para escribir: solo se vota con votar().
create policy "ver votos de mis grupos" on public.votos
  for select to authenticated using (privado.soy_miembro(grupo_id));

create function public.votar(p_grupo uuid, p_votado uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  esta_semana date := date_trunc('week', now() at time zone 'Europe/Madrid')::date;
begin
  if auth.uid() is null then
    raise exception 'Necesitas una cuenta';
  end if;
  if p_votado = auth.uid() then
    raise exception 'No puedes votarte a ti mismo';
  end if;
  if not exists (
    select 1 from public.miembros where grupo_id = p_grupo and jugador_id = auth.uid()
  ) then
    raise exception 'No estás en este grupo';
  end if;
  if not exists (
    select 1 from public.miembros where grupo_id = p_grupo and jugador_id = p_votado
  ) then
    raise exception 'Ese jugador no está en el grupo';
  end if;

  insert into public.votos (grupo_id, semana, votante_id, votado_id)
  values (p_grupo, esta_semana, auth.uid(), p_votado)
  on conflict (grupo_id, semana, votante_id)
  do update set votado_id = excluded.votado_id, creado_en = now();
end;
$$;

revoke execute on function public.votar(uuid, uuid) from public, anon;
grant execute on function public.votar(uuid, uuid) to authenticated;
