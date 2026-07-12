/* Função serverless do Vercel — EXCLUI a conta de login (Supabase Auth) de um usuário.
 *
 * Complementa o Excluir do ⚙️ Administrador: remover o perfil do grid não apaga a conta
 * de e-mail/senha no Supabase (por isso o convite respondia "já possui login"). Este
 * endpoint apaga a conta de verdade, liberando o e-mail para um novo convite.
 *
 * Segurança (server-side, não confia no cliente):
 *   · exige o token de uma sessão real;
 *   · SOMENTE Diretoria (metadata tipo=master) pode excluir contas;
 *   · ninguém exclui a própria conta.
 *
 * Corpo (POST): { email, token }
 */
import { createClient } from "@supabase/supabase-js";

export const config = { maxDuration: 30 };

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Método não permitido", detalhe: "Use POST." }); return; }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    res.status(200).json({ error: "Não configurado", detalhe: "Defina SUPABASE_SERVICE_ROLE_KEY (e SUPABASE_URL) nas Environment Variables do projeto no Vercel." });
    return;
  }

  try {
    let body = req.body;
    if (!body || typeof body !== "object") { const raw = await lerCorpo(req); body = raw ? JSON.parse(raw) : {}; }
    const email = (body.email || "").trim().toLowerCase();
    const { token } = body;
    if (!email) { res.status(400).json({ error: "E-mail obrigatório." }); return; }
    if (!anonKey || !token) { res.status(401).json({ error: "Autenticação necessária." }); return; }

    const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: quem, error: erroAuth } = await authClient.auth.getUser(token);
    if (erroAuth || !quem || !quem.user) { res.status(401).json({ error: "Sessão inválida", detalhe: "Faça login novamente." }); return; }

    /* só a DIRETORIA (metadata master) exclui contas — checagem no servidor */
    const meta = { ...(quem.user.app_metadata || {}), ...(quem.user.user_metadata || {}) };
    if (meta.tipo !== "master") { res.status(403).json({ error: "Sem permissão", detalhe: "Somente a Diretoria pode excluir contas de login." }); return; }
    if ((quem.user.email || "").toLowerCase() === email) { res.status(400).json({ error: "Você não pode excluir a própria conta." }); return; }

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    /* localiza a conta pelo e-mail (pagina — base de usuários é pequena) */
    let alvo = null;
    for (let page = 1; page <= 10 && !alvo; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) { res.status(200).json({ error: "Falha ao listar contas", detalhe: error.message }); return; }
      alvo = (data.users || []).find((u) => (u.email || "").toLowerCase() === email);
      if (!data.users || data.users.length < 200) break;
    }
    if (!alvo) { res.status(200).json({ ok: true, jaNaoExistia: true }); return; }

    const del = await admin.auth.admin.deleteUser(alvo.id);
    if (del.error) { res.status(200).json({ error: "Falha ao excluir a conta", detalhe: del.error.message }); return; }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Falha na exclusão", detalhe: String((err && err.message) || err) });
  }
}
