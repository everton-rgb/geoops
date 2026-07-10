/* ============================================================================
 * GeoópS · Camada de persistência no Supabase (Postgres)
 * ============================================================================
 * O app grava TODO o estado localmente (window.storage) — isso continua e é o
 * fallback offline. Este módulo adiciona a sincronização com o banco:
 *
 *   TEMPORÁRIO/MUTÁVEL → tabela estado_operacional (1 linha JSON, sobrescrita
 *     a cada gravação; é o estado vivo compartilhado entre dispositivos).
 *
 *   PERMANENTES (só-inserção, nunca apagados pelo app):
 *     rdo_log · pareceres_tap · violacoes · diretrizes · procedimentos ·
 *     logins · usuarios
 *
 * Ativação: rodar supabase/schema.sql no projeto Supabase e estar logado
 * (Supabase Auth). Sem sessão ou sem schema, tudo degrada silenciosamente
 * para o armazenamento local — o app nunca quebra por causa do banco.
 *
 * A sincronização é "write-through com debounce": o persist() do app chama
 * sincronizarEstado(); as gravações remotas são agrupadas (1,5 s) para não
 * inundar o banco durante edições rápidas.
 * ========================================================================== */
import { supabase } from "./supabase.js";

const DEBOUNCE_MS = 1500;
let timer = null;
let pendente = null;      // último estado aguardando envio
let versaoLocal = 0;      // contador de gravações desta sessão
let ultimoErro = null;

const logado = async () => {
  if (!supabase) return false;
  try { const { data } = await supabase.auth.getSession(); return !!(data.session && data.session.user); }
  catch { return false; }
};

/* ---- extração dos registros PERMANENTES do estado ---- */
const linhasPermanentes = (d) => ({
  rdo_log: (Array.isArray(d.rdoLog) ? d.rdoLog : []).map((r) => ({
    id: r.id, idgeo: r.idgeo || "", data_rdo: r.data || null,
    lancado_por: r.lancadoPor || "", registro: r,
  })),
  pareceres_tap: (Array.isArray(d.pareceresTap) ? d.pareceresTap : []).map((p) => ({
    id: p.id, idgeo: p.idgeo || "", projeto: p.projeto || "", cliente: p.cliente || "",
    gerado_por: p.por || "", registro: p,
  })),
  violacoes: (Array.isArray(d.violacoes) ? d.violacoes : []).map((v) => ({
    id: v.id, diretriz_id: v.diretrizId || null, diretriz_titulo: v.diretrizTitulo || "",
    regra: v.regraDescricao || "", idgeo: v.idgeo || "", detalhe: v.detalhe || "",
    severidade: v.severidade || "", status: v.status || "", registro: v,
  })),
  diretrizes: (Array.isArray(d.diretrizes) ? d.diretrizes : []).map((x) => ({
    id: x.id, titulo: x.titulo || "", categoria: x.categoria || "", ativo: x.ativo !== false, registro: x,
  })),
  procedimentos: (Array.isArray(d.procedimentos) ? d.procedimentos : []).map((x) => ({
    id: x.id, titulo: x.titulo || "", categoria: x.categoria || "", ativo: x.ativo !== false, registro: x,
  })),
  usuarios: (Array.isArray(d.usuarios) ? d.usuarios : []).map((u) => ({
    id: u.id, email: (u.email || "").toLowerCase(), nome: u.nome || "", tipo: u.tipo || "", registro: u,
  })),
});

/* envia o estado + réplicas permanentes; falhas são registradas, nunca lançadas */
async function enviar(d, quem) {
  try {
    if (!(await logado())) return;
    /* BLINDAGEM DE GOVERNANÇA: uma sessão desatualizada (aba antiga aberta) não pode
       APAGAR cadastros de governança feitos em outra sessão. Antes de sobrescrever o
       estado, mescla por união (com tombstones para exclusões intencionais). */
    try {
      const { data: atualRem } = await supabase.from("estado_operacional").select("dados").eq("id", "principal").maybeSingle();
      const rem = (atualRem && atualRem.dados) || {};
      const unir = (a, b, chave) => { const m = new Map(); [...(b || []), ...(a || [])].forEach((x) => { const k = x && chave(x); if (k != null && !m.has(k)) m.set(k, x); }); return [...m.values()]; };
      const removidos = new Set([...(d.usuariosRemovidos || []), ...(rem.usuariosRemovidos || [])]);
      d = { ...d,
        usuarios: unir(d.usuarios, rem.usuarios, (x) => x.id || x.email).filter((x) => !removidos.has(x.id)),
        usuariosRemovidos: [...removidos],
        diretoresNotificacao: [...new Set([...(d.diretoresNotificacao || []), ...(rem.diretoresNotificacao || [])])],
        noticias: unir(d.noticias, rem.noticias, (x) => x.id),
        treinamentosAgendados: unir(d.treinamentosAgendados, rem.treinamentosAgendados, (x) => x.id),
        senhasAcessos: { ...(rem.senhasAcessos || {}), ...(d.senhasAcessos || {}) },
      };
    } catch (e) { /* sem leitura remota, envia o local como está */ }
    versaoLocal += 1;
    /* estado vivo (TEMPORÁRIO — sobrescrito) */
    const { error: e1 } = await supabase.from("estado_operacional").upsert({
      id: "principal", dados: d, versao: versaoLocal,
      atualizado_em: new Date().toISOString(), atualizado_por: quem || "",
    });
    if (e1) throw e1;
    /* réplicas PERMANENTES (upsert por id — inserções novas entram; nada é apagado) */
    const linhas = linhasPermanentes(d);
    for (const [tabela, rows] of Object.entries(linhas)) {
      if (!rows.length) continue;
      const { error } = await supabase.from(tabela).upsert(rows, { onConflict: "id", ignoreDuplicates: tabela === "rdo_log" || tabela === "pareceres_tap" });
      if (error && !/duplicate|conflict/i.test(error.message || "")) throw error;
    }
    ultimoErro = null;
  } catch (e) {
    ultimoErro = (e && e.message) || String(e);
  }
}

/* ---- API pública ---- */

/* chamada pelo persist() do app a cada gravação (agrupada por debounce) */
export function sincronizarEstado(dados, quem) {
  pendente = { dados, quem };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const p = pendente; pendente = null; timer = null;
    if (p) enviar(p.dados, p.quem);
  }, DEBOUNCE_MS);
}

/* carga inicial: tenta o estado remoto (se logado); null → usa o local */
export async function carregarEstadoRemoto() {
  try {
    if (!(await logado())) return null;
    const { data, error } = await supabase.from("estado_operacional").select("dados, atualizado_em").eq("id", "principal").maybeSingle();
    if (error || !data || !data.dados) return null;
    return data.dados;
  } catch { return null; }
}

/* registro de login (permanente) — best-effort, direto na tabela */
export async function registrarLoginRemoto(reg) {
  try {
    if (!(await logado())) return;
    await supabase.from("logins").insert({ aba: reg.aba || "", tipo: reg.tipo || "", carteira: reg.carteira || "", registro: reg });
  } catch { /* silencioso */ }
}

/* estado da sincronização (para exibir no Admin, se desejado) */
export function statusSincronizacao() {
  return { configurado: !!supabase, ultimoErro, gravacoesSessao: versaoLocal };
}
