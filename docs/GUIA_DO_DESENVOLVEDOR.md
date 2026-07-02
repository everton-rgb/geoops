# GeoópS — Guia do Desenvolvedor (implantação)

Instruções objetivas para colocar o GeoópS em produção: **Supabase** (banco + login), **conexões HTTP** (IA Anthropic, domínio) e **SMTP/e-mail**. Tempo estimado: 1–2 horas.

**Stack**: React 18 + Vite (PWA) · funções serverless em `/api` (Node, Vercel) · Supabase (Postgres + Auth) · Anthropic Claude (IA) · Nodemailer/Resend (e-mail).

---

## 0. Código e build

```bash
git clone https://github.com/everton-rgb/geoops   # branch de produção: main
cd geoops
npm install
npm run build        # precisa terminar verde (Vite)
```

O deploy é **automático no Vercel a cada merge na `main`** (2 projetos conectados). Rollback: Vercel → Deployments → *Promote to Production* num deployment anterior.

---

## 1. SUPABASE — banco de dados e autenticação

### 1.1 Criar as tabelas
1. Abra o projeto no https://supabase.com (ou crie um novo).
2. **SQL Editor → New query** → cole o conteúdo de **`supabase/schema.sql`** (na raiz do repositório) → **Run**.
3. Confirme em *Table Editor* que existem: `estado_operacional`, `rdo_log`, `pareceres_tap`, `violacoes`, `diretrizes`, `procedimentos`, `logins`, `usuarios`.

O schema já habilita **RLS** (acesso só a usuários autenticados) e **imutabilidade** de `rdo_log`/`pareceres_tap` (sem UPDATE/DELETE — trilha de auditoria).

### 1.2 Autenticação
- **Authentication → Sign In / Providers → Email**: habilitado.
- **Authentication → URL Configuration**:
  - `Site URL` = `https://www.geoops.ia.br`
  - `Redirect URLs`: adicionar a URL de produção do Vercel e `https://geoops.ia.br`.
- Os usuários são convidados **de dentro do GeoópS** (Cadastros → Admin → ✉ Convidar). O endpoint `/api/convidar-usuario` usa a service-role no servidor. O SMTP de autenticação do Supabase (Authentication → SMTP Settings) pode ser configurado com as mesmas credenciais do §3 para os e-mails de convite saírem do seu domínio.

### 1.3 Chaves (Settings → API)
Anote: `Project URL`, `anon public key`, `service_role key` (⚠️ secreta). Vão para o Vercel no §4.

### 1.4 Como o app usa o banco (já implementado — nada a codar)
- `src/services/supabase.js` — login/sessão.
- `src/services/db.js` — sincronização: todo salvamento grava local **e** faz upsert no `estado_operacional` + réplica dos registros permanentes (debounce 1,5 s). Na abertura, logado, o estado remoto prevalece; sem sessão o app roda 100% local (fallback offline).
- **Retenção**: permanentes = `rdo_log`, `pareceres_tap`, `violacoes`, `diretrizes`, `procedimentos`, `logins`, `usuarios` (só-inserção; sobrevivem ao "Base limpa"). Temporário = `estado_operacional` (JSON vivo, sobrescrito).

---

## 2. CONEXÃO HTTP — IA (Anthropic)

1. https://console.anthropic.com → **API Keys** → criar chave.
2. Variável `ANTHROPIC_API_KEY` no Vercel (§4).
3. O proxy é `api/analisar.js`: **streaming SSE** (`supportsResponseStreaming: true`, `maxDuration: 300`) — **não alterar** esses flags; sem eles as leituras longas caem em 504. A chave nunca chega ao navegador.
4. Modelo usado: `claude-sonnet-4-6` (definido nas chamadas do front). Custo típico: ~US$ 8–12/mês (prompt caching ativo).

Teste após deploy: aba **Inteligência → Diagnóstico** → gerar leitura nova. Deve renderizar as famílias coloridas (nunca JSON cru).

---

## 3. SMTP / E-MAIL — aviso de violação de diretrizes

O endpoint `api/notificar-diretores.js` suporta **duas vias** (SMTP tem prioridade se ambas existirem):

### Via A — SMTP próprio (recomendada se a empresa já tem e-mail corporativo)
Configurar no Vercel:
```
SMTP_HOST=smtp.seudominio.com.br     # ou smtp.gmail.com / smtp.office365.com
SMTP_PORT=587                        # 587 STARTTLS · 465 SSL
SMTP_USER=alertas@geoops.ia.br
SMTP_PASS=***                        # senha ou app-password (Gmail/365 exigem app-password)
SMTP_FROM="GeoópS <alertas@geoops.ia.br>"
```
A dependência `nodemailer` já está no `package.json`.

### Via B — Resend (sem servidor próprio)
1. Conta em https://resend.com → **verificar o domínio** `geoops.ia.br` (criar os registros DKIM/SPF que o painel indicar no DNS).
2. Vercel: `RESEND_API_KEY` e `RESEND_FROM="GeoópS <alertas@geoops.ia.br>"`.

**Destinatários**: são cadastrados dentro do app (Cadastros → Diretrizes → *Diretores notificados*). Sem via configurada o sistema degrada com aviso e a violação permanece registrada na auditoria interna (nada quebra).

Teste: cadastre uma diretriz dura obviamente violada, rode o Diagnóstico e confira a caixa de entrada do diretor.

---

## 4. VARIÁVEIS DE AMBIENTE (Vercel → Settings → Environment Variables)

Modelo completo em **`.env.example`** na raiz. Resumo:

| Variável | Uso | Secreta? |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | login/banco no navegador | não (RLS protege) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | funções `/api` | não |
| `SUPABASE_SERVICE_ROLE_KEY` | convite de usuários (`/api/convidar-usuario`) | ⚠️ **SIM — só servidor** |
| `ANTHROPIC_API_KEY` | IA (`/api/analisar`) | ⚠️ SIM |
| `SMTP_HOST/PORT/USER/PASS/FROM` | e-mail via SMTP | PASS sim |
| `RESEND_API_KEY` / `RESEND_FROM` | e-mail via Resend | KEY sim |

Aplicar em **Production** (e Preview, se desejado) e fazer **Redeploy** — variáveis só valem em build novo.

---

## 5. DOMÍNIO www.geoops.ia.br (HTTP)

1. Vercel → projeto de produção → **Settings → Domains** → adicionar `geoops.ia.br` e `www.geoops.ia.br`.
2. No provedor do domínio, criar os DNS que o Vercel indicar (tipicamente `A @ 76.76.21.21` e `CNAME www cname.vercel-dns.com` — use os valores exibidos no painel).
3. HTTPS é emitido automaticamente após a propagação.
4. Voltar ao §1.2 e confirmar a `Site URL` no Supabase.

---

## 6. CHECKLIST FINAL DE ACEITE

- [ ] `npm run build` verde local
- [ ] `schema.sql` executado; 8 tabelas criadas
- [ ] Todas as variáveis no Vercel + redeploy feito
- [ ] Login por e-mail funciona (convite chega e senha é definida)
- [ ] Editar qualquer cadastro → linha `estado_operacional` atualiza no Supabase
- [ ] Lançar 1 RDO → aparece em `rdo_log` (e não permite editar/excluir)
- [ ] Gerar parecer de TAP → aparece em `pareceres_tap`
- [ ] Inteligência → Diagnóstico gera leitura nova sem timeout
- [ ] Violação de diretriz dispara e-mail ao diretor (via escolhida)
- [ ] `www.geoops.ia.br` abre com HTTPS

**Documentos complementares** (na pasta `docs/`): `MANUAL_DE_CONEXOES.md` (versão detalhada), `MANUAL_DO_USUARIO.md`, `RESUMO_EXECUTIVO.md`.
