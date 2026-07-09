/* Função serverless — envio de e-mails do sistema com REMETENTE POR FUNÇÃO.
 * Autentica o solicitante (sessão Supabase) e envia via SMTP (Hostinger):
 *   SMTP_HOST · SMTP_PORT · SMTP_USER · SMTP_PASS  (Environment Variables do Vercel)
 * O From usa o alias adequado (@geoops.ia.br) autenticado pela caixa principal.
 * Corpo (POST): { tipo, para: [emails], assunto, html, token }
 */
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const config = { maxDuration: 30 };

const REMETENTES = {
  noreply: "GeoópS <noreply@geoops.ia.br>",
  avisos: "GeoópS Avisos <avisos@geoops.ia.br>",
  aprovar_tap: "GeoópS Aprovações <aprovar_tap@geoops.ia.br>",
  aprovar_os: "GeoópS Aprovações <aprovar_os@geoops.ia.br>",
  nao_conformidades: "GeoópS NCs <nao_conformidades@geoops.ia.br>",
  estrategico: "GeoópS Estratégico <estrategico@geoops.ia.br>",
  dashboard: "GeoópS Dashboard <dashboard@geoops.ia.br>",
};

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Use POST." }); return; }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) { res.status(200).json({ error: "SMTP não configurado", detalhe: "Defina SMTP_HOST/PORT/USER/PASS no Vercel." }); return; }
  try {
    let body = req.body;
    if (!body || typeof body !== "object") { body = JSON.parse(await new Promise((ok, err) => { let d = ""; req.on("data", (c) => d += c); req.on("end", () => ok(d || "{}")); req.on("error", err); })); }
    const { tipo, para, assunto, html, token } = body;
    const dest = (Array.isArray(para) ? para : []).filter((e) => /@/.test(e)).slice(0, 30);
    if (!dest.length || !assunto) { res.status(400).json({ error: "Destinatários e assunto obrigatórios." }); return; }
    /* valida a sessão do solicitante (mesma checagem do convite) */
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url && anon) {
      if (!token) { res.status(401).json({ error: "Autenticação necessária." }); return; }
      const { data: quem, error } = await createClient(url, anon, { auth: { persistSession: false } }).auth.getUser(token);
      if (error || !quem?.user) { res.status(401).json({ error: "Sessão inválida." }); return; }
    }
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: +SMTP_PORT || 465, secure: (+SMTP_PORT || 465) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: REMETENTES[tipo] || REMETENTES.noreply,
      to: dest.join(", "),
      subject: assunto,
      html: html || assunto,
    });
    res.status(200).json({ ok: true, enviados: dest.length });
  } catch (err) {
    res.status(500).json({ error: "Falha no envio", detalhe: String(err?.message || err) });
  }
}
