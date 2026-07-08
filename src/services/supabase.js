/* Camada de integração com o Supabase — Fase: AUTENTICAÇÃO.
 *
 * A persistência de dados (substituir o window.storage/localStorage) entra numa fase
 * posterior. Por enquanto este módulo cuida só do login real (Supabase Auth).
 *
 * A URL e a chave PUBLICÁVEL (anon) são valores públicos por natureza — podem ficar no
 * bundle do navegador; a segurança real vem das políticas RLS do banco. Ainda assim,
 * preferimos lê-las de variáveis de ambiente do Vercel quando existirem:
 *   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 */
import { createClient } from "@supabase/supabase-js";

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || "https://fpruaiydynktsrekxxvd.supabase.co";
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_5P08cO3xRDmKZGfMu-z1kg_x0o2Kdaf";

/* Captura o hash da URL ANTES de o client processá-lo (detectSessionInUrl limpa o hash):
 * quem chega por link de CONVITE (#type=invite) ou de RECUPERAÇÃO (#type=recovery) entra
 * autenticado mas ainda precisa DEFINIR a própria senha — o app mostra a tela de definição. */
const hashInicial = (typeof window !== "undefined" && window.location && window.location.hash) || "";
export const chegouParaDefinirSenha = /type=(invite|recovery|signup|magiclink)/.test(hashInicial);

export const supabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/* Converte a sessão do Supabase no objeto `user` que o app já entende
   (mesmo formato dos ACESSOS: { id, aba, responsavel, tipo, dom/doms, carteira }).
   O papel/área vem dos METADADOS do usuário (user_metadata), definidos no painel do Supabase:
     - tipo: "master" (Diretoria, edita tudo) | "alimentador" (edita seu domínio) | "gerente" (carteira)
     - dom:  domínio que pode editar (ex.: "sms", "planos", "ct"); ou doms: ["ct","cond","tap"]
     - carteira: "GC03" (para gerentes)
     - aba/responsavel: rótulo exibido
   Sem metadados, assume o papel mais restrito ("gerente" sem carteira: só visualiza). */
export function usuarioDeSessao(session) {
  if (!session || !session.user) return null;
  const u = session.user;
  const m = { ...(u.app_metadata || {}), ...(u.user_metadata || {}) };
  const tipo = ["master", "alimentador", "gerente"].includes(m.tipo) ? m.tipo : "gerente";
  const out = {
    id: m.id || ("sb_" + (u.email || u.id)),
    aba: m.aba || m.responsavel || u.email || "Usuário",
    responsavel: m.responsavel || m.aba || u.email || "",
    tipo,
    carteira: m.carteira || "",
    email: u.email || "",
    viaSupabase: true,
  };
  if (tipo === "master") out.dom = "*";
  else if (Array.isArray(m.doms)) out.doms = m.doms;
  else out.dom = m.dom || null;
  return out;
}

export async function entrarComSenha(email, senha) {
  if (!supabase) return { error: "Autenticação Supabase não configurada." };
  const { data, error } = await supabase.auth.signInWithPassword({
    email: (email || "").trim(),
    password: senha || "",
  });
  if (error) return { error: error.message || "Falha no login." };
  return { user: usuarioDeSessao(data.session), session: data.session };
}

/* "Esqueci minha senha": envia o link de redefinição; o link volta para o app,
 * que reconhece #type=recovery e abre a tela de definição de senha. */
export async function enviarRecuperacaoSenha(email) {
  if (!supabase) return { error: "Autenticação Supabase não configurada." };
  const redirectTo = (typeof window !== "undefined" && window.location && window.location.origin) || undefined;
  const { error } = await supabase.auth.resetPasswordForEmail((email || "").trim(), redirectTo ? { redirectTo } : {});
  if (error) return { error: error.message || "Falha ao enviar o e-mail de redefinição." };
  return { ok: true };
}

/* Define/troca a senha do usuário LOGADO (primeiro acesso via convite ou recuperação). */
export async function definirNovaSenha(senha) {
  if (!supabase) return { error: "Autenticação Supabase não configurada." };
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { error: error.message || "Falha ao salvar a nova senha." };
  return { ok: true };
}

export async function sairSupabase() {
  if (supabase) { try { await supabase.auth.signOut(); } catch (e) { /* ignora */ } }
}

export async function sessaoAtual() {
  if (!supabase) return null;
  try { const { data } = await supabase.auth.getSession(); return data.session || null; } catch (e) { return null; }
}

/* token de acesso da sessão atual — usado para autenticar chamadas ao endpoint de convite */
export async function tokenAtual() {
  if (!supabase) return null;
  try { const { data } = await supabase.auth.getSession(); return (data.session && data.session.access_token) || null; } catch (e) { return null; }
}

export function aoMudarAuth(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session, event));
  return () => { try { data.subscription.unsubscribe(); } catch (e) { /* ignora */ } };
}
