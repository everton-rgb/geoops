/* Função serverless do Vercel — ponte segura com a API da Anthropic (Claude).
 *
 * O front-end (src/App.jsx) faz POST para /api/analisar com o corpo:
 *   { model, max_tokens, messages, system? }
 * Esta função encaminha a chamada para a API da Anthropic usando a chave
 * guardada na variável de ambiente ANTHROPIC_API_KEY (configurada no Vercel),
 * de modo que a chave NUNCA é exposta no navegador.
 *
 * Sem a chave configurada, devolve um JSON de aviso amigável — o front-end
 * trata isso mostrando a análise como "pendente", sem perder os anexos.
 *
 * Configuração no Vercel: Settings → Environment Variables → ANTHROPIC_API_KEY
 */
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

    const { model = "claude-sonnet-4-6", max_tokens = 1500, messages = [], system } = body;
    const payload = { model, max_tokens, messages };
    if (system) payload.system = system;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({
      error: "Falha na análise por IA",
      detalhe: String((err && err.message) || err),
    });
  }
}
