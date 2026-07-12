-- ============================================================================
-- GeoópS · Fotos de campo (GeofieldS V1.3) — rode este script no SQL Editor
-- do projeto Supabase (geoops-one). Pode rodar mais de uma vez sem estragar.
--
-- Cria:
--   1. bucket PRIVADO `fotos-campo` no Storage (nenhuma foto tem link público;
--      o acesso é sempre por URL assinada de curta duração, para usuário logado);
--   2. tabela permanente `campo_fotos` (metadados, SÓ-INSERÇÃO — base firme);
--   3. políticas RLS: usuário autenticado insere e lê; ninguém altera/apaga.
-- ============================================================================

-- 1) bucket privado
insert into storage.buckets (id, name, public)
values ('fotos-campo', 'fotos-campo', false)
on conflict (id) do nothing;

-- políticas do Storage (drop antes para o script ser re-executável)
drop policy if exists "fotos-campo insert autenticado" on storage.objects;
create policy "fotos-campo insert autenticado"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-campo');

drop policy if exists "fotos-campo select autenticado" on storage.objects;
create policy "fotos-campo select autenticado"
  on storage.objects for select to authenticated
  using (bucket_id = 'fotos-campo');

-- sem UPDATE/DELETE no bucket: fotos de campo são registro imutável.

-- 2) tabela de metadados (só-inserção)
create table if not exists public.campo_fotos (
  id bigint generated always as identity primary key,
  idgeo text,
  mat text not null,
  data date not null,
  tipo text not null default 'execucao',   -- execucao | checkin | equipamento | rdo
  legenda text not null default '',
  lat double precision,
  lng double precision,
  storage_path text not null unique,
  criado_em timestamptz not null default now()
);

create index if not exists campo_fotos_idgeo_data on public.campo_fotos (idgeo, data);
create index if not exists campo_fotos_mat on public.campo_fotos (mat);

-- 3) RLS
alter table public.campo_fotos enable row level security;

drop policy if exists "campo_fotos insert autenticado" on public.campo_fotos;
create policy "campo_fotos insert autenticado"
  on public.campo_fotos for insert to authenticated
  with check (true);

drop policy if exists "campo_fotos select autenticado" on public.campo_fotos;
create policy "campo_fotos select autenticado"
  on public.campo_fotos for select to authenticated
  using (true);

-- sem políticas de UPDATE/DELETE: a trilha é imutável (mesma filosofia do rdo_log).

-- Verificação rápida (deve retornar o bucket e a tabela):
--   select id, public from storage.buckets where id = 'fotos-campo';
--   select count(*) from public.campo_fotos;
