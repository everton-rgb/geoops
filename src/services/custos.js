/* ============================================================================
 * MOTOR DE CUSTOS PUROS — funções compartilhadas (V1.1.25)
 * ============================================================================
 * Régua única de MO (mesma da estimativa, do realizado, da HE e do controle de
 * horas): HH/hora = custo mensal do colaborador ÷ dias úteis do mês ÷ 8,8h.
 * A equipe soma (não faz média); multiplicadores do RDO: HE 50% ×1,5 ·
 * HE 100% ×2 · adicional noturno +20%.
 * Ativos: (depreciação + manutenção) R$/h POR ATIVO (data.deprecAtivos), com
 * fallback ÚNICO e centralizado nas taxas diárias antigas ÷ 8,8 — nenhuma
 * fórmula fora daqui deve ler deprMaquinaDia/veiculo*Dia/materiaisDiaEquipe.
 * Consumo: composição por atividade (data.composicoes) × quantidade ×
 * preço puro do item (data.itensConsumo).
 * ========================================================================== */
import { JORNADA_DIA_H } from "../constants/custos.js";

export { JORNADA_DIA_H };

/* HH/hora de um colaborador (R$/h): custo mensal ÷ dias úteis ÷ 8,8h */
export function hhHoraColab(colab, diasUteis) {
  const mensal = +((colab || {}).custoTotal) || 0;
  return mensal > 0 ? mensal / (diasUteis || 22) / JORNADA_DIA_H : 0;
}

/* HH/hora da EQUIPE de uma OS (SOMA): cadastro atual tem prioridade;
   o custo congelado na OS (e.custo) é fallback para colaborador excluído */
export function hhHoraEquipeOS(equipe, colaboradores, diasUteis) {
  const du = diasUteis || 22;
  return (equipe || []).filter((e) => e && !e.vazio).reduce((s, e) => {
    const c = (colaboradores || []).find((x) => x.mat === e.mat);
    const mensal = (c && +c.custoTotal > 0) ? +c.custoTotal : (+e.custo || 0);
    return s + mensal / du / JORNADA_DIA_H;
  }, 0);
}

/* horas ponderadas de um apontamento (multiplicadores do RDO); sem breakdown, horasTecnico */
export function horasPonderadas(ap) {
  const b = ap && ap.horasBreakdown;
  if (b) return (+b.normal || 0) + (+b.he50 || 0) * 1.5 + (+b.he100 || 0) * 2 + (+b.noturno || 0) * 0.2;
  return +((ap || {}).horasTecnico) || 0;
}

/* ===== (depreciação + manutenção) R$/h de UM ativo — fallback centralizado =====
   tipo: "maq" | "equip" | "frota" · ref: registro do cadastro (ou {cod}/{placa}) */
export function custoHoraAtivo(tipo, ref, ctx) {
  const C = (ctx && ctx.custos) || {};
  const dep = ((ctx && ctx.deprecAtivos) || {})[tipo] || {};
  const chave = tipo === "frota" ? (ref && ref.placa) : (ref && ref.cod);
  const reg = chave ? dep[chave] : null;
  if (reg && (+reg.deprHora > 0 || +reg.manutHora > 0)) return (+reg.deprHora || 0) + (+reg.manutHora || 0);
  /* fallback: taxas diárias antigas ÷ 8,8h (ativo ainda sem cadastro na aba Depreciação) */
  if (tipo === "maq") return (+C.deprMaquinaDia || 0) / JORNADA_DIA_H;
  if (tipo === "equip") return (+C.deprEquipamentoDia || 0) / JORNADA_DIA_H;
  const t = ((ref && (ref.tipo || ref.veiculo)) || "").toLowerCase();
  const pesado = /pesad|caminh|guincho|munck|prancha/.test(t) || (!/leve|saveiro|utilit|passeio/.test(t) && ctx && ctx.temMaquina);
  return (pesado ? (+C.veiculoPesadoDia || 0) : (+C.veiculoLeveDia || 0)) / JORNADA_DIA_H;
}

/* R$/h somado dos ativos de uma OS (máquinas + equipamentos + frota) */
export function custoHoraAtivosOS(os, ctx) {
  const maqs = Array.isArray(os && os.maquinas) ? os.maquinas : (os && os.maquina ? [os.maquina] : []);
  const veics = Array.isArray(os && os.veiculos) ? os.veiculos : (os && os.veiculo ? [os.veiculo] : []);
  const equips = (os && os.equipamentos) || [];
  const ctxV = { ...ctx, temMaquina: maqs.length > 0 };
  return {
    maqHora: maqs.reduce((s, m) => s + custoHoraAtivo("maq", m, ctx), 0),
    equipHora: equips.reduce((s, e) => s + custoHoraAtivo("equip", e, ctx), 0),
    frotaHora: veics.reduce((s, v) => s + custoHoraAtivo("frota", v, ctxV), 0),
    nMaq: maqs.length, nEquip: equips.length, nVeic: veics.length,
    kmCustoUnico: veics.length === 1 && veics[0] ? (+(((ctx && ctx.deprecAtivos) || {}).frota || {})[veics[0].placa]?.kmCusto || 0) : 0,
  };
}

/* ===== CONSUMO por composição: quantidades por atividade × itens R$/unidade =====
   quantidades: [{id, qtd}] · excluir: Set de atividades terceirizadas (consumo é do terceiro)
   Retorna { total, itens: [{item, unidade, qtd, preco, subtotal}], semComposicao: [ids] } */
export function custoConsumoAtividades(quantidades, composicoes, itensConsumo, excluir) {
  const comp = composicoes || {};
  const catalogo = Array.isArray(itensConsumo) ? itensConsumo : [];
  const porItem = {};
  const semComposicao = [];
  (quantidades || []).forEach((a) => {
    if (!a || !a.id || !(+a.qtd > 0)) return;
    if (excluir && excluir.has(a.id)) return;
    const c = comp[a.id];
    if (!c || !Array.isArray(c.consumo) || !c.consumo.length) { semComposicao.push(a.id); return; }
    c.consumo.forEach((x) => {
      const it = catalogo.find((i) => i.id === x.itemId);
      if (!it || !(+it.preco > 0) || !(+x.qtdPorUnid > 0)) return;
      const q = +x.qtdPorUnid * +a.qtd;
      const g = porItem[it.id] || { item: it.item, unidade: it.unidade, preco: +it.preco, qtd: 0, subtotal: 0 };
      g.qtd += q; g.subtotal += q * +it.preco;
      porItem[it.id] = g;
    });
  });
  const itens = Object.values(porItem).map((g) => ({ ...g, qtd: Math.round(g.qtd * 100) / 100, subtotal: Math.round(g.subtotal * 100) / 100 }));
  return { total: itens.reduce((s, g) => s + g.subtotal, 0), itens, semComposicao };
}

/* ===== MO do ESCRITÓRIO (GeoópS Mobile → controle_de_horas) por IDGEO =====
   Anti-dupla-contagem: matrícula que está na EQUIPE da OS em data que tem RDO
   fica fora (a hora dela já entrou pela jornada do RDO).
   Retorna { total, horas, registros } */
export function custoMOEscritorio(controleHoras, idgeo, os, apts, colaboradores, diasUteis) {
  if (!idgeo) return { total: 0, horas: 0, registros: 0 };
  const datasRDO = new Set((Array.isArray(apts) ? apts : []).map((ap) => ap.data).filter(Boolean));
  const matsEquipe = new Set(((os && os.equipe) || []).filter((e) => e && !e.vazio).map((e) => e.mat));
  let total = 0, horas = 0, registros = 0;
  (Array.isArray(controleHoras) ? controleHoras : []).forEach((r) => {
    if (matsEquipe.has(r.mat) && datasRDO.has(r.data)) return; // já contado no RDO do dia
    const doIdgeo = (r.itens || []).filter((i) => i.idgeo === idgeo && +i.horas > 0);
    if (!doIdgeo.length) return;
    const c = (colaboradores || []).find((x) => x.mat === r.mat);
    const hh = hhHoraColab(c, diasUteis);
    doIdgeo.forEach((i) => { horas += +i.horas; total += +i.horas * hh; registros += 1; });
  });
  return { total, horas: Math.round(horas * 10) / 10, registros };
}
