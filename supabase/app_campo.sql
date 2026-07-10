-- GeoópS V2 · App de Campo — F0 (tabelas permanentes; rodar no SQL Editor quando
-- o beta for validado — durante o beta os dados vivem no estado_operacional).
create table if not exists campo_eventos (
  id uuid primary key default gen_random_uuid(),
  mat text not null, idgeo text not null,
  tipo text not null check (tipo in ('checkin','checkout_almoco','checkin_retorno','checkout_saida')),
  ts timestamptz not null default now(), ts_dispositivo timestamptz,
  lat double precision, lng double precision, precisao_m real,
  dentro_cerca boolean, dist_cerca_m real, motivo_fora text,
  selfie_path text, foto_equip_path text,
  registro jsonb
);
create table if not exists campo_rdos (
  id text primary key,
  mat text not null, idgeo text not null, data_rdo date not null,
  payload jsonb not null,
  status text not null default 'aguardando' check (status in ('aguardando','validado','devolvido')),
  validado_por text, validado_em timestamptz, motivo_devolucao text,
  unique (mat, idgeo, data_rdo)
);
create table if not exists cercas_projeto (
  idgeo text primary key,
  lat double precision, lng double precision,
  raio_m integer not null default 500,
  definido_por text, em timestamptz default now()
);
alter table campo_eventos enable row level security;
alter table campo_rdos enable row level security;
alter table cercas_projeto enable row level security;
create policy "autenticados leem eventos" on campo_eventos for select to authenticated using (true);
create policy "autenticados inserem eventos" on campo_eventos for insert to authenticated with check (true);
-- campo_eventos é SÓ-INSERÇÃO (trilha de auditoria): sem policies de update/delete.
create policy "autenticados leem rdos" on campo_rdos for select to authenticated using (true);
create policy "autenticados escrevem rdos" on campo_rdos for insert to authenticated with check (true);
create policy "autenticados atualizam rdos" on campo_rdos for update to authenticated using (true);
create policy "autenticados leem cercas" on cercas_projeto for select to authenticated using (true);
create policy "autenticados escrevem cercas" on cercas_projeto for insert to authenticated with check (true);
create policy "autenticados atualizam cercas" on cercas_projeto for update to authenticated using (true);
-- Storage: criar bucket privado "campo-fotos" no painel (Storage → New bucket → private).
