/* Função serverless do Vercel — envia AVISO aos diretores quando uma DIRETRIZ da empresa é violada.
 *
 * O GeoópS registra a violação na trilha de auditoria (no cliente) e chama este endpoint para
 * despachar o e-mail. O provedor é o Resend (https://resend.com) — a chave fica só aqui, nas
 * Environment Variables do Vercel, NUNCA no bundle do navegador:
 *   RESEND_API_KEY   (secreta)
 *   RESEND_FROM      (remetente verificado, ex.: "GeoópS <alertas@seu-dominio.com>")
 *
 * Sem RESEND_API_KEY o endpoint degrada com { ok:false } e a violação continua só na trilha de
 * auditoria do sistema (nenhum e-mail é enviado). Não quebra o fluxo.
 *
 * Corpo (POST): { destinatarios: [email], violacoes: [{ diretriz, regra, idgeo, detalhe, severidade, em }] }
 */
export const config = { maxDuration: 20 };

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido", detalhe: "Use POST." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "GeoópS <onboarding@resend.dev>";

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

    if (!apiKey) {
      res.status(200).json({
        ok: false,
        error: "Envio de e-mail não configurado",
        detalhe: "Defina RESEND_API_KEY (e RESEND_FROM) nas Environment Variables do Vercel para ativar o aviso por e-mail aos diretores. A violação já foi registrada na auditoria interna do sistema.",
      });
      return;
    }

    const graves = violacoes.filter((v) => v.severidade === "grave").length;
    const assunto = `⚠ GeoópS — ${violacoes.length} violação(ões) de diretriz${graves ? ` (${graves} grave)` : ""}`;
    const linhas = violacoes.map((v) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600;color:${v.severidade === "grave" ? "#b3261e" : "#a06a00"}">${v.severidade === "grave" ? "GRAVE" : "leve"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.diretriz || "—")}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.regra || "—")}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.idgeo || "—")}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapar(v.detalhe || "")}</td>
      </tr>`).join("");
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
        <h2 style="margin:0 0 4px">Violação de diretriz da empresa</h2>
        <p style="margin:0 0 14px;color:#555">A inteligência operacional do GeoópS detectou ${violacoes.length} violação(ões) de política. Este registro está disponível para auditoria interna no sistema.</p>
        <table style="border-collapse:collapse;width:100%;font-size:13px">
          <thead><tr style="background:#f4f4f4;text-align:left">
            <th style="padding:6px 10px">Severidade</th><th style="padding:6px 10px">Política</th><th style="padding:6px 10px">Regra</th><th style="padding:6px 10px">IDGEO</th><th style="padding:6px 10px">Detalhe</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
        <p style="margin:16px 0 0;color:#888;font-size:12px">Mensagem automática do GeoópS — GEOAMBIENTE S/A.</p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: destinatarios, subject: assunto, html }),
    });
    const d = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      res.status(200).json({ ok: false, error: "Falha ao enviar e-mail", detalhe: (d && (d.message || d.error)) || `HTTP ${resp.status}` });
      return;
    }
    res.status(200).json({ ok: true, id: (d && d.id) || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Falha no envio", detalhe: String((err && err.message) || err) });
  }
}
