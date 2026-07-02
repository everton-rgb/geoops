/* Função serverless do Vercel — envia AVISO aos diretores quando uma DIRETRIZ da empresa é violada.
 *
 * O GeoópS registra a violação na trilha de auditoria (no cliente) e chama este endpoint para
 * despachar o e-mail. Duas vias de envio, escolhidas pelas variáveis de ambiente:
 *
 *   VIA 1 — SMTP próprio (prioritária quando configurada):
 *     SMTP_HOST      ex.: smtp.seudominio.com.br (ou smtp.gmail.com, smtp.office365.com…)
 *     SMTP_PORT      ex.: 587 (STARTTLS) ou 465 (SSL)
 *     SMTP_USER      usuário/login da conta de envio
 *     SMTP_PASS      senha ou app-password
 *     SMTP_FROM      remetente, ex.: "GeoópS <alertas@geoops.ia.br>" (padrão: SMTP_USER)
 *
 *   VIA 2 — Resend (https://resend.com), usada quando não há SMTP_HOST:
 *     RESEND_API_KEY (secreta)
 *     RESEND_FROM    remetente verificado, ex.: "GeoópS <alertas@geoops.ia.br>"
 *
 * Sem nenhuma via configurada, o endpoint degrada com { ok:false } e a violação continua
 * registrada na auditoria interna do sistema. Nada quebra.
 *
 * Corpo (POST): { destinatarios: [email], violacoes: [{ diretriz, regra, idgeo, detalhe, severidade, em }] }
 */
export const config = { maxDuration: 30 };

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
}

function escapar(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function montarHtml(violacoes) {
  const linhas = violacoes.map((v) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600;color:${v.severidade === "grave" ? "#b3261e" : "#a06a00"}">${v.severidade === "grave" ? "GRAVE" : "leve"}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.diretriz || "—")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.regra || "—")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.idgeo || "—")}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.detalhe || "")}</td>
    </tr>`).join("");
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
      <h2 style="margin:0 0 4px">Violação de diretriz da empresa</h2>
      <p style="margin:0 0 14px;color:#555">A inteligência operacional do GeoópS detectou ${violacoes.length} violação(ões) de política. Este registro está disponível para auditoria interna no sistema.</p>
      <table style="border-collapse:collapse;width:100%;font-size:13px">
        <thead><tr style="background:#f4f4f4;text-align:left">
          <th style="padding:6px 10px">Severidade</th><th style="padding:6px 10px">Política</th><th style="padding:6px 10px">Regra</th><th style="padding:6px 10px">IDGEO</th><th style="padding:6px 10px">Detalhe</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>
      <p style="margin:16px 0 0;color:#888;font-size:12px">Mensagem automática do GeoópS — GEOAMBIENTE S/A · www.geoops.ia.br</p>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido", detalhe: "Use POST." });
    return;
  }

  try {
    let body = req.body;
    if (!body || typeof body !== "object") {
      const raw = await lerCorpo(req);
      body = raw ? JSON.parse(raw) : {};
    }
    const destinatarios = (Array.isArray(body.destinatarios) ? body.destinatarios : [])
      .map((e) => String(e || "").trim().toLowerCase())
      .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    const violacoes = Array.isArray(body.violacoes) ? body.violacoes : [];

    if (!destinatarios.length) { res.status(400).json({ ok: false, error: "Sem destinatários válidos." }); return; }
    if (!violacoes.length) { res.status(400).json({ ok: false, error: "Sem violações para notificar." }); return; }

    const graves = violacoes.filter((v) => v.severidade === "grave").length;
    const assunto = `⚠ GeoópS — ${violacoes.length} violação(ões) de diretriz${graves ? ` (${graves} grave)` : ""}`;
    const html = montarHtml(violacoes);

    /* ===== VIA 1: SMTP próprio ===== */
    if (process.env.SMTP_HOST) {
      try {
        const { default: nodemailer } = await import("nodemailer");
        const porta = +process.env.SMTP_PORT || 587;
        const transporte = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: porta,
          secure: porta === 465, // 465 = SSL; 587 = STARTTLS
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" } : undefined,
        });
        const info = await transporte.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: destinatarios.join(", "),
          subject: assunto,
          html,
        });
        res.status(200).json({ ok: true, via: "smtp", id: info.messageId || null });
        return;
      } catch (e) {
        res.status(200).json({ ok: false, via: "smtp", error: "Falha no envio SMTP", detalhe: String((e && e.message) || e) });
        return;
      }
    }

    /* ===== VIA 2: Resend ===== */
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.status(200).json({
        ok: false,
        error: "Envio de e-mail não configurado",
        detalhe: "Configure SMTP (SMTP_HOST/PORT/USER/PASS/FROM) ou o Resend (RESEND_API_KEY/RESEND_FROM) nas Environment Variables do Vercel. A violação já foi registrada na auditoria interna do sistema.",
      });
      return;
    }
    const from = process.env.RESEND_FROM || "GeoópS <onboarding@resend.dev>";
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: destinatarios, subject: assunto, html }),
    });
    const d = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      res.status(200).json({ ok: false, via: "resend", error: "Falha ao enviar e-mail", detalhe: (d && (d.message || d.error)) || `HTTP ${resp.status}` });
      return;
    }
    res.status(200).json({ ok: true, via: "resend", id: (d && d.id) || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Falha no envio", detalhe: String((err && err.message) || err) });
  }
}
