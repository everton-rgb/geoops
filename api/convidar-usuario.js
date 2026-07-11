/* Função serverless do Vercel — provisiona o LOGIN de um usuário no Supabase Auth.
 *
 * O painel Admin (gestão de usuários) chama este endpoint para CRIAR/CONVIDAR a conta de
 * acesso por e-mail. Usa a SERVICE-ROLE KEY do Supabase, que tem privilégio de admin e por
 * isso NUNCA pode ir para o navegador — fica só aqui, nas Environment Variables do Vercel:
 *   SUPABASE_URL                (ou VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY   (secreta — admin)
 *   SUPABASE_ANON_KEY           (ou VITE_SUPABASE_ANON_KEY) — para validar a sessão do solicitante
 *
 * Segurança: o solicitante precisa enviar o token da própria sessão (Authorization implícito no
 * corpo). O endpoint valida que é uma sessão real antes de provisionar. O painel só oferece o
 * botão à Diretoria (gate no cliente); esta checagem server-side impede chamadas anônimas.
 *
 * Corpo (POST): { email, nome?, tipo?, token, redirectTo? }
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
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido", detalhe: "Use POST." });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    res.status(200).json({
      error: "Provisionamento não configurado",
      detalhe: "Defina SUPABASE_SERVICE_ROLE_KEY (e SUPABASE_URL) nas Environment Variables do projeto no Vercel para ativar o convite de usuários.",
    });
    return;
  }

  try {
    let body = req.body;
    if (!body || typeof body !== "object") {
      const raw = await lerCorpo(req);
      body = raw ? JSON.parse(raw) : {};
    }
    const email = (body.email || "").trim().toLowerCase();
    const { nome, tipo, token, redirectTo } = body;
    if (!email) { res.status(400).json({ error: "E-mail obrigatório." }); return; }

    /* valida que o solicitante está autenticado (sessão real) */
    if (!anonKey || !token) { res.status(401).json({ error: "Autenticação necessária." }); return; }
    const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: quem, error: erroAuth } = await authClient.auth.getUser(token);
    if (erroAuth || !quem || !quem.user) {
      res.status(401).json({ error: "Sessão inválida", detalhe: "Faça login novamente e tente outra vez." });
      return;
    }

    /* provisiona via convite por e-mail (a pessoa define a própria senha ao aceitar) */
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome: nome || "", tipo: tipo || "alimentador" },
      ...(redirectTo ? { redirectTo } : {}),
    });
    if (error) {
      const jaExiste = /already|exist|registered/i.test(error.message || "");
      const msg = (error.message || "").trim();
      /* O GoTrue devolve corpo vazio ("{}") quando não consegue enviar o e-mail — quase sempre
       * SMTP personalizado do Supabase Auth mal configurado ou projeto pausado. Traduzimos. */
      const semResposta = !msg || msg === "{}" || /retryable/i.test(error.name || "");
      const falhaEnvio = /error sending|smtp|mail/i.test(msg);
      const detalhe = semResposta
        ? "O Supabase Auth não respondeu ao envio do convite (resposta vazia). Causa mais comum: SMTP personalizado do Supabase Auth com dado errado — em Authentication → Emails → SMTP Settings confira servidor (smtp.hostinger.com), porta (465), usuário (a caixa de e-mail completa), senha e remetente. Corrija lá, aguarde 1 minuto e tente de novo."
        : falhaEnvio
          ? `O Supabase Auth não conseguiu enviar o e-mail pelo SMTP configurado (${msg}). Confira usuário/senha/porta em Authentication → Emails → SMTP Settings do Supabase.`
          : msg + (error.status ? ` (HTTP ${error.status})` : "");
      res.status(200).json({ error: jaExiste ? "Usuário já existe" : "Falha ao convidar", detalhe, jaExiste });
      return;
    }
    res.status(200).json({ ok: true, userId: (data && data.user && data.user.id) || null });
  } catch (err) {
    res.status(500).json({ error: "Falha no provisionamento", detalhe: String((err && err.message) || err) });
  }
}
