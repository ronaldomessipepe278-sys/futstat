-- ============================================================
--  BASE DE DATOS DE FUTSTAT
--  Cómo usarlo: en Supabase → SQL Editor → pega TODO este
--  archivo → Run. Solo hay que hacerlo una vez.
-- ============================================================

-- ---------- TABLAS ----------

-- Un jugador = una carta. El id es el mismo que el de su cuenta.
create table public.jugadores (
  id uuid primary key references auth.users (id) on delete cascade,
  apodo text not null check (char_length(trim(apodo)) between 2 and 16),
  ritmo smallint not null check (ritmo between 30 and 90),
  tiro smallint not null check (tiro between 30 and 90),
  pase smallint not null check (pase between 30 and 90),
  regate smallint not null check (regate between 30 and 90),
  defensa smallint not null check (defensa between 30 and 90),
  fisico smallint not null check (fisico between 30 and 90),
  creado_en timestamptz not null default now(),
  -- igual que en la web: 360 puntos para repartir
  check (ritmo + tiro + pase + regate + defensa + fisico <= 360)
);

create table public.partidos (
  id uuid primary key default gen_random_uuid(),
  jugador_id uuid not null default auth.uid() references public.jugadores (id) on delete cascade,
  fecha timestamptz not null default now(),
  resultado text not null check (resultado in ('ganado', 'empatado', 'perdido')),
  goles smallint not null default 0 check (goles between 0 and 20),
  asistencias smallint not null default 0 check (asistencias between 0 and 20),
  nota smallint not null check (nota between 1 and 10)
);
create index partidos_jugador_fecha on public.partidos (jugador_id, fecha);

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 2 and 30),
  codigo text not null unique,
  creado_por uuid references public.jugadores (id) on delete set null,
  creado_en timestamptz not null default now()
);

create table public.miembros (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  jugador_id uuid not null references public.jugadores (id) on delete cascade,
  unido_en timestamptz not null default now(),
  primary key (grupo_id, jugador_id)
);
create index miembros_jugador on public.miembros (jugador_id);

-- ---------- FUNCIONES DE AYUDA PARA LOS PERMISOS ----------

-- ¿Estoy yo en este grupo?
create function public.soy_miembro(p_grupo uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.miembros
    where grupo_id = p_grupo and jugador_id = auth.uid()
  );
$$;

-- ¿Comparto algún grupo con este jugador?
create function public.comparto_grupo(p_jugador uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.miembros yo
    join public.miembros otro on otro.grupo_id = yo.grupo_id
    where yo.jugador_id = auth.uid() and otro.jugador_id = p_jugador
  );
$$;

-- ---------- PERMISOS (quién puede ver y cambiar qué) ----------
-- Regla general: ves tus datos y los de la gente de tus grupos. Solo cambias los tuyos.

alter table public.jugadores enable row level security;
alter table public.partidos enable row level security;
alter table public.grupos enable row level security;
alter table public.miembros enable row level security;

create policy "ver mi carta y la de mis grupos" on public.jugadores
  for select to authenticated
  using (id = auth.uid() or public.comparto_grupo(id));
create policy "crear mi carta" on public.jugadores
  for insert to authenticated with check (id = auth.uid());
create policy "editar mi carta" on public.jugadores
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "ver mis partidos y los de mis grupos" on public.partidos
  for select to authenticated
  using (jugador_id = auth.uid() or public.comparto_grupo(jugador_id));
create policy "apuntar mis partidos" on public.partidos
  for insert to authenticated with check (jugador_id = auth.uid());
create policy "borrar mis partidos" on public.partidos
  for delete to authenticated using (jugador_id = auth.uid());

create policy "ver mis grupos" on public.grupos
  for select to authenticated using (public.soy_miembro(id));

create policy "ver miembros de mis grupos" on public.miembros
  for select to authenticated using (public.soy_miembro(grupo_id));
create policy "salir de un grupo" on public.miembros
  for delete to authenticated using (jugador_id = auth.uid());

-- Crear grupos y unirse se hace SOLO con estas funciones, que comprueban todo.

-- ---------- CREAR GRUPO ----------
create function public.crear_grupo(p_nombre text)
returns public.grupos
language plpgsql security definer set search_path = ''
as $$
declare
  letras constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin 0/O ni 1/I para no confundir
  nuevo_codigo text;
  grupo public.grupos;
begin
  if auth.uid() is null then
    raise exception 'Necesitas una cuenta';
  end if;
  if (select count(*) from public.grupos where creado_por = auth.uid()) >= 10 then
    raise exception 'Has llegado al máximo de 10 grupos creados';
  end if;

  loop
    nuevo_codigo := '';
    for i in 1..6 loop
      nuevo_codigo := nuevo_codigo || substr(letras, 1 + floor(random() * length(letras))::int, 1);
    end loop;
    begin
      insert into public.grupos (nombre, codigo, creado_por)
      values (trim(p_nombre), nuevo_codigo, auth.uid())
      returning * into grupo;
      exit;
    exception when unique_violation then
      -- ese código ya existía: probamos otro
    end;
  end loop;

  insert into public.miembros (grupo_id, jugador_id) values (grupo.id, auth.uid());
  return grupo;
end;
$$;

-- ---------- UNIRSE A UN GRUPO CON SU CÓDIGO ----------
create function public.unirse_grupo(p_codigo text)
returns public.grupos
language plpgsql security definer set search_path = ''
as $$
declare
  grupo public.grupos;
begin
  if auth.uid() is null then
    raise exception 'Necesitas una cuenta';
  end if;

  select * into grupo from public.grupos
  where codigo = upper(replace(trim(p_codigo), '-', ''));
  if not found then
    raise exception 'No existe ningún grupo con ese código';
  end if;

  if not exists (
    select 1 from public.miembros where grupo_id = grupo.id and jugador_id = auth.uid()
  ) and (select count(*) from public.miembros where grupo_id = grupo.id) >= 50 then
    raise exception 'Este grupo está lleno (máximo 50 jugadores)';
  end if;

  insert into public.miembros (grupo_id, jugador_id)
  values (grupo.id, auth.uid())
  on conflict do nothing;
  return grupo;
end;
$$;

-- ---------- BORRAR MI CUENTA Y TODOS MIS DATOS ----------
create function public.borrar_mi_cuenta()
returns void
language sql security definer set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

-- Solo los usuarios con cuenta pueden usar estas funciones
revoke execute on function
  public.soy_miembro(uuid), public.comparto_grupo(uuid), public.crear_grupo(text),
  public.unirse_grupo(text), public.borrar_mi_cuenta()
from public, anon;
grant execute on function
  public.soy_miembro(uuid), public.comparto_grupo(uuid), public.crear_grupo(text),
  public.unirse_grupo(text), public.borrar_mi_cuenta()
to authenticated;
