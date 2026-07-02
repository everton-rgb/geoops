-- ============================================================================
-- GeoópS · Esquema do banco (Supabase / Postgres)
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase (uma vez) para criar as
-- tabelas. O módulo src/services/db.js sincroniza o app com estas tabelas.
--
-- POLÍTICA DE RETENÇÃO
-- ────────────────────────────────────────────────────────────────────────────
-- PERMANENTES (nunca apagados pelo app; só-inserção; trilha de auditoria):
--   • rdo_log         — todo RDO lançado (imutável, com autor e timestamp)
--   • pareceres_tap   — todo parecer técnico-jurídico gerado pela IA
--   • violacoes       — violações de diretrizes detectadas (auditoria interna)
--   • diretrizes      — políticas da empresa (memória fixa da IA)
--   • procedimentos   — POPs/rotinas (memória fixa da IA)
--   • logins          — histórico de acessos ao sistema
--   • usuarios        — perfis de permissão (grid do Admin)
--
-- TEMPORÁRIOS/MUTÁVEIS (estado operacional vivo; sobrescrito a cada gravação;
-- zerado quando a Diretoria usa "Base limpa"):
--   • estado_operacional — snapshot JSON completo do app (colaboradores,
--     clientes, contratos, TAPs, planos, programações, ordens, apontamentos,
--     travas, autorizações, disponibilidade, custos, produtividade, preços,
--     regras de equipe, pré-agendamentos, histórico de leituras da IA)
--
-- Observação: o app mantém uma cópia local (window.storage) como fallback
-- offline; o Supabase é a fonte compartilhada entre dispositivos.
-- ============================================================================

-- ===== TEMPORÁRIO/MUTÁVEL ====================================================

create table if not exists estado_operacional (
  id          text primary key default 'principal',  -- 1 linha por base
  dados       jsonb not null,                        -- estado completo do app
  versao      bigint not null default 0,             -- contador de gravações
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);

-- ===== PERMANENTES (só-inserção) ============================================

create table if not exists rdo_log (
  id          text primary key,          -- "rdo_..."
  idgeo       text not null,
  data_rdo    date,
  lancado_por text,
  lancado_em  timestamptz not null default now(),
  registro    jsonb not null             -- RDO completo (jornada, km, itens, ocorrências…)
);
create index if not exists rdo_log_idgeo_idx on rdo_log (idgeo, data_rdo);

create table if not exists pareceres_tap (
  id          text primary key,          -- "par_..."
  idgeo       text not null,
  projeto     text,
  cliente     text,
  gerado_por  text,
  gerado_em   timestamptz not null default now(),
  parecer     jsonb not null             -- parecer completo da IA
);
create index if not exists pareceres_tap_idgeo_idx on pareceres_tap (idgeo);

create table if not exists violacoes (
  id              text primary key,      -- "vio_..."
  diretriz_id     text,
  diretriz_titulo text,
  regra           text,
  idgeo           text,
  detalhe         text,
  severidade      text,                  -- grave | leve
  status          text,                  -- aberta | em_auditoria | justificada | resolvida
  registro        jsonb not null,
  criado_em       timestamptz not null default now()
);

create table if not exists diretrizes (
  id        text primary key,            -- "dir_..."
  titulo    text,
  categoria text,
  ativo     boolean default true,
  registro  jsonb not null,              -- diretriz completa (regras dura/suave)
  criado_em timestamptz not null default now()
);

create table if not exists procedimentos (
  id        text primary key,            -- "proc_..."
  titulo    text,
  categoria text,
  ativo     boolean default true,
  registro  jsonb not null,              -- POP completo (passos)
  criado_em timestamptz not null default now()
);

create table if not exists logins (
  id        bigint generated always as identity primary key,
  em        timestamptz not null default now(),
  aba       text,
  tipo      text,
  carteira  text,
  registro  jsonb
);

create table if not exists usuarios (
  id        text primary key,            -- "usr_..."
  email     text unique,
  nome      text,
  tipo      text,                        -- master | gerente | alimentador
  registro  jsonb not null,              -- perfil completo (permissões)
  criado_em timestamptz not null default now()
);

-- ===== SEGURANÇA (RLS) ======================================================
-- Habilita RLS e permite acesso apenas a usuários AUTENTICADOS (o app usa a
-- sessão do Supabase Auth). Ajuste as políticas conforme a matriz de papéis
-- evoluir (ex.: restringir escrita em diretrizes à diretoria).

alter table estado_operacional enable row level security;
alter table rdo_log            enable row level security;
alter table pareceres_tap      enable row level security;
alter table violacoes          enable row level security;
alter table diretrizes         enable row level security;
alter table procedimentos      enable row level security;
alter table logins             enable row level security;
alter table usuarios           enable row level security;

do $$
declare t text;
begin
  foreach t in array array['estado_operacional','rdo_log','pareceres_tap','violacoes','diretrizes','procedimentos','logins','usuarios'] loop
    execute format('drop policy if exists "autenticados podem ler" on %I', t);
    execute format('create policy "autenticados podem ler" on %I for select to authenticated using (true)', t);
    execute format('drop policy if exists "autenticados podem inserir" on %I', t);
    execute format('create policy "autenticados podem inserir" on %I for insert to authenticated with check (true)', t);
    execute format('drop policy if exists "autenticados podem atualizar" on %I', t);
    execute format('create policy "autenticados podem atualizar" on %I for update to authenticated using (true)', t);
  end loop;
end $$;

-- IMUTABILIDADE dos registros permanentes: bloqueia UPDATE/DELETE no rdo_log
-- e pareceres_tap mesmo para autenticados (trilha de auditoria de verdade).
drop policy if exists "autenticados podem atualizar" on rdo_log;
drop policy if exists "autenticados podem atualizar" on pareceres_tap;
-- (sem política de UPDATE/DELETE = operação negada pelo RLS)
