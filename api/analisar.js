/* Função serverless do Vercel — ponte segura com a API da Anthropic (Claude).
 *
 * O front-end (src/App.jsx) faz POST para /api/analisar com o corpo:
 *   { model, max_tokens, messages, system?, stream? }
 * A chave fica na variável de ambiente ANTHROPIC_API_KEY (Vercel), nunca no navegador.
 *
 * ===== STREAMING (correção do timeout/504) =====
 * As leituras grandes (Diagnóstico, Ações, Chat) enviam `stream: true`. Antes, o endpoint
 * bufferizava a geração inteira (`await resp.json()`) e só então respondia — sem enviar 1 byte
 * enquanto o Claude gerava. O gateway do Vercel encerra conexões ociosas e devolve uma página
 * HTML de 504 ANTES do maxDuration, que o cliente lia como "Unexpected token '<'". Ao repassar
 * o SSE da Anthropic em tempo real (primeiro byte em ~1-2s), a conexão fica viva e a geração
 * roda até o maxDuration. As chamadas sem `stream` (análise de documentos) seguem em JSON.
 *
 * maxDuration: com Fluid Compute (padrão desde abr/2025) o Hobby permite até 300s. Uma geração
 * de 4000-6000 tokens pode passar de 60s, então usamos 300.
 * Obs.: o Vercel limita o CORPO da requisição a ~4,5 MB — o front-end barra dossiês maiores.
 */
export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido", detalhe: "Use POST." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      error: "IA não configurada",
      detalhe:
        "A análise por IA roda quando a chave da Anthropic está conectada. " +
        "Defina ANTHROPIC_API_KEY nas Environment Variables do projeto no Vercel para ativar.",
    });
    return;
  }

  try {
    // Corpo: usa req.body se já veio parseado; senão lê o stream e faz JSON.parse.
    let body = req.body;
    if (!body || typeof body !== "object") {
      const raw = await new Promise((resolve, reject) => {
        let d = "";
        req.on("data", (c) => (d += c));
        req.on("end", () => resolve(d));
        req.on("error", reject);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const { model = "claude-sonnet-4-6", max_tokens = 1500, messages = [], system, stream } = body;
    const payload = { model, max_tokens, messages };
    if (system) payload.system = system;
    if (stream) payload.stream = true;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    /* ===== Caminho STREAMING: repassa o SSE da Anthropic byte a byte ===== */
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // evita buffering intermediário
      if (!resp.ok || !resp.body) {
        let detalhe = `HTTP ${resp.status}`;
        try { const e = await resp.json(); detalhe = (e && e.error && (e.error.message || e.error)) || detalhe; } catch { /* ignora */ }
        res.write(`event: error\ndata: ${JSON.stringify({ error: "Falha na análise por IA", detalhe })}\n\n`);
        res.end();
        return;
      }
      const reader = resp.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
        if (typeof res.flush === "function") res.flush();
      }
      res.end();
      return;
    }

    /* ===== Caminho JSON (análise de documentos, respostas curtas) ===== */
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    const detalhe = String((err && err.message) || err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Falha na análise por IA", detalhe });
    } else {
      try { res.write(`event: error\ndata: ${JSON.stringify({ error: "Falha na análise por IA", detalhe })}\n\n`); res.end(); } catch { /* ignora */ }
    }
  }
}
