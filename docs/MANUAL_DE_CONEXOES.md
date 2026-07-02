# GeoópS — Manual de Conexões e Implantação

Guia passo a passo para conectar o GeoópS ao **Supabase**, **GitHub/Vercel**, **API da Anthropic (IA)**, **e-mail (Resend/SMTP)** e ao domínio **www.geoops.ia.br**.

---

## 1. Visão da arquitetura

```
Navegador (React/Vite — dist estático)
   ├── window.storage (cópia local / fallback offline)
   ├── Supabase Auth  ──────────────►  Login por e-mail/senha
   ├── src/services/db.js ──────────►  Supabase Postgres (estado + tabelas permanentes)
   └── /api (funções serverless no Vercel)
         ├── analisar.js            ►  API Anthropic (Claude) — com STREAMING
         ├── convidar-usuario.js    ►  Supabase Admin (convite de usuário)
         └── notificar-diretores.js ►  Resend (e-mail de violação de diretriz)
```

---

## 2. Supabase (banco + autenticação)

### 2.1 Criar/usar o projeto
1. Em https://supabase.com crie (ou use) o projeto do GeoópS.
2. Anote em **Settings → API**: `Project URL`, `anon public key` e `service_role key` (⚠️ a service_role é secreta — nunca vai para o navegador).

### 2.2 Criar as tabelas
No **SQL Editor**, cole e execute o arquivo **`supabase/schema.sql`** do repositório. Ele cria:
- **Permanentes** (só-inserção, RLS bloqueia update/delete nos históricos): `rdo_log`, `pareceres_tap`, `violacoes`, `diretrizes`, `procedimentos`, `logins`, `usuarios`.
- **Temporária**: `estado_operacional` (estado vivo do app, 1 linha JSON).

### 2.3 Autenticação
- **Authentication → Providers → Email**: habilitado.
- **Authentication → URL Configuration**: `Site URL = https://www.geoops.ia.br` e adicione a URL do Vercel em *Redirect URLs*.
- Usuários são convidados pelo próprio GeoópS (Cadastros › Admin › ✉ Convidar) — o endpoint `/api/convidar-usuario` usa a service_role no servidor.

### 2.4 Variáveis de ambiente (Vercel → Settings → Environment Variables)
| Variável | Onde é usada | Valor |
|---|---|---|
| `VITE_SUPABASE_URL` | navegador (login/banco) | Project URL |
| `VITE_SUPABASE_ANON_KEY` | navegador (login/banco) | anon public key |
| `SUPABASE_URL` | serverless (convite) | Project URL |
| `SUPABASE_ANON_KEY` | serverless (valida sessão) | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | serverless (convite) | ⚠️ service_role (secreta) |

### 2.5 Como o app usa o banco (src/services/db.js)
- **Gravação**: todo `persist()` grava localmente e sincroniza com debounce de 1,5 s: sobrescreve `estado_operacional` e replica os registros permanentes (upsert por id; RDO/pareceres com `ignoreDuplicates` — nunca alterados).
- **Leitura**: ao abrir o app logado, o estado remoto (se existir) prevalece sobre a cópia local; sem sessão/sem internet, o app roda 100% local.
- **Retenção**: ver §7.

---

## 3. GitHub + Vercel (código e deploy)

1. Repositório: `github.com/everton-rgb/geoops` (branch de produção: `main`).
2. O Vercel está conectado ao repositório: **todo merge na `main` dispara deploy automático** (dois projetos: `geoops` e `geoops-ia-v1.0.0`).
3. Fluxo recomendado de mudanças: branch → Pull Request → merge na `main` → conferir o deploy verde no painel do Vercel (ou no status do commit no GitHub).
4. Build local para conferir antes: `npm install && npm run build` (Vite).
5. Rollback: no Vercel, *Deployments* → escolha um deployment anterior → *Promote to Production*.

---

## 4. API da Anthropic (IA)

1. Crie a chave em https://console.anthropic.com → API Keys.
2. No Vercel: `ANTHROPIC_API_KEY = sk-ant-…` (Production/Preview).
3. O endpoint `api/analisar.js` faz o proxy seguro (a chave nunca vai ao navegador), com **streaming SSE** (`supportsResponseStreaming: true`, `maxDuration: 300`) — necessário para as leituras longas (Diagnóstico/Ações) não caírem em timeout.
4. Modelo padrão: `claude-sonnet-4-6` (definido no front, em cada chamada). O snapshot vai com **prompt caching** para reduzir custo (~US$ 8-12/mês no uso típico com ~20 projetos novos/mês).

---

## 5. E-mail (violação de diretrizes → diretores)

O endpoint `api/notificar-diretores.js` usa o **Resend** (https://resend.com — tem plano gratuito):
1. Crie a conta, **verifique o domínio** `geoops.ia.br` (DNS: registros DKIM/SPF que o Resend mostrar).
2. No Vercel: `RESEND_API_KEY = re_…` e `RESEND_FROM = "GeoópS <alertas@geoops.ia.br>"`.
3. Destinatários: Cadastros › Diretrizes › **Diretores notificados**.
4. **Sem as variáveis**, o envio degrada com aviso e a violação continua registrada na auditoria interna (nada quebra).

> **SMTP próprio em vez de Resend?** Troque o `fetch` do Resend em `api/notificar-diretores.js` por um envio via `nodemailer` com as variáveis `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS` — a estrutura do endpoint (corpo, tabela HTML, degradação) permanece a mesma.

---

## 6. Domínio www.geoops.ia.br

1. No Vercel → projeto de produção → **Settings → Domains** → *Add* `geoops.ia.br` e `www.geoops.ia.br`.
2. No provedor do domínio (registro .ia.br), crie os DNS que o Vercel indicar:
   - `A @ 76.76.21.21` (apex) e `CNAME www cname.vercel-dns.com` (ou os valores atuais mostrados pelo Vercel).
3. Aguarde a propagação; o certificado HTTPS é emitido automaticamente.
4. Atualize a **Site URL** no Supabase (§2.3) e o `redirectTo` dos convites se necessário.

---

## 7. Dados: o que é permanente × temporário

| Categoria | Onde vive | Retenção |
|---|---|---|
| **RDOs (`rdo_log`)** | tabela própria | **Permanente e imutável** — todo lançamento, com autor/timestamp; RLS bloqueia update/delete. |
| **Pareceres de TAP (`pareceres_tap`)** | tabela própria | **Permanente e imutável** — cada geração da IA arquivada. |
| **Violações de diretrizes (`violacoes`)** | tabela própria | **Permanente** — trilha de auditoria (status muda, registro não some). |
| **Diretrizes e Procedimentos** | tabelas próprias | **Permanentes** — memória fixa da IA; sobrevivem ao "zerar base". |
| **Logins e Usuários** | tabelas próprias | **Permanentes** — trilha de acesso e perfis de permissão. |
| **Estado operacional** (colaboradores, clientes, contratos, TAPs, planos, programações, OS, apontamentos, travas, autorizações, disponibilidade, parâmetros, pré-agendamentos, histórico de leituras da IA) | `estado_operacional` (JSON) + cópia local | **Temporário/mutável** — sobrescrito a cada gravação; zerado pela Diretoria em "Base limpa" (que preserva todos os permanentes). |

---

## 8. Checklist de implantação (ordem sugerida)

- [ ] Supabase: rodar `supabase/schema.sql`
- [ ] Supabase: habilitar Email auth + Site URL
- [ ] Vercel: variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`
- [ ] Redeploy no Vercel (variáveis só valem em build novo)
- [ ] Domínio: DNS + Domains no Vercel + Site URL no Supabase
- [ ] Resend: verificar o domínio de envio
- [ ] Criar o primeiro usuário master no Admin e convidar a equipe
- [ ] Testar: login → editar algo → conferir `estado_operacional` no Supabase → lançar 1 RDO → conferir `rdo_log`
