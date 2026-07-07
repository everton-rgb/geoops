/* ============================================================================
   GeoópS — MOTOR DE ORÇAMENTAÇÃO (DFP · PPU · DRE)
   Motor NOVO e INDEPENDENTE do motor operacional: funções puras, testáveis,
   decodificadas da planilha de referência GEOAMBIENTE (RITM0547926 REV00).
   Fórmulas validadas contra o golden test (ver scripts de teste):
     · horas por função = Σ(qtd ÷ meta) dias × 8,8 h/dia
     · custo pessoal    = horas × (salário ÷ jornada mensal) × (1+peric.) × (1+encargos)
     · preço (BDI)      = (CD + C1 + C2 + C3) ÷ (1 − Σ impostos)   [impostos "por dentro"]
     · DRE              = ROB → ROL → MC → EBITDA → EBIT
   ============================================================================ */

export const JORNADA_MENSAL_H = 184.8; // 8,8 h × 21 dias úteis
export const JORNADA_DIA_H = 8.8;

export const ENCARGOS_PADRAO = { MOD: 0.83, MOI: 0.79, PJ: 0 };

export const BDI_PADRAO = {
  overheadPct: 0.12,       // C1 — administração (sobre o CD)
  lucroPct: 0.3105,        // C2 — sobre (CD + C1)
  contingenciaPct: 0.02,   // C3.1 — sobre (CD + C1)
  comerciaisPct: 0,        // C3.2
  financeiroPct: 0,        // C3.3
  impostos: { pis: 0.0165, cofins: 0.076, iss: 0.05, petronect: 0, irpj: 0, irrf: 0, csll: 0 },
};

/* margem-alvo por categoria de linha da PPU (calibrável por orçamento) */
export const MARGEM_PPU_PADRAO = { servicos: 0.19, repasse: 0.09 };

export const CATEGORIAS_INSUMO = [
  ["remediadores", "Produtos remediadores"],
  ["amostragem", "Materiais de amostragem"],
  ["tubos_geomecanicos", "Tubos geomecânicos"],
  ["bentonita_cimento", "Bentonita / cimento / calda"],
  ["acabamento_pocos", "Acabamento de poços"],
  ["epi", "EPIs"],
  ["consumiveis", "Consumíveis gerais"],
  ["outros", "Outros insumos"],
];

const n = (v) => (v == null || v === "" || isNaN(+v) ? 0 : +v);

/* ===== 1. CALIBRAGEM → HORAS POR FUNÇÃO =====
   servicos: [{ id, descricao, unidade, qtd }]
   metas:    { [servicoId]: { [funcaoId]: metaPorDia } }  (0/vazio = função não participa) */
export function horasPorFuncao(servicos, metas) {
  const dias = {};
  (servicos || []).forEach((s) => {
    const linha = (metas || {})[s.id] || {};
    Object.entries(linha).forEach(([funcaoId, meta]) => {
      if (n(meta) > 0 && n(s.qtd) > 0) dias[funcaoId] = (dias[funcaoId] || 0) + n(s.qtd) / n(meta);
    });
  });
  const horas = {};
  Object.entries(dias).forEach(([f, d]) => { horas[f] = d * JORNADA_DIA_H; });
  return { dias, horas };
}

/* ===== 2. BLOCO 1 — PESSOAL PRÓPRIO =====
   funcoes: [{ id, nome, tipo: "MOD"|"MOI"|"PJ", salario, qtd, periculosidade }]
   horas: { [funcaoId]: horasTotais } (da calibragem; pode ser sobrescrito por função via horasManuais) */
export function custoPessoal(funcoes, horas, { jornadaMensalH = JORNADA_MENSAL_H, encargos = ENCARGOS_PADRAO } = {}) {
  const linhas = (funcoes || []).map((f) => {
    const h = n(f.horasManuais) > 0 ? n(f.horasManuais) : n((horas || {})[f.id]);
    const salarioHora = n(f.salario) / jornadaMensalH;
    const salarioPeriodo = salarioHora * h * Math.max(1, n(f.qtd) || 1);
    const salarioTotal = salarioPeriodo * (1 + n(f.periculosidade));
    const enc = f.tipo === "PJ" ? 0 : (encargos[f.tipo] != null ? encargos[f.tipo] : 0);
    const custoTotal = salarioTotal * (1 + enc);
    return { ...f, horas: h, salarioPeriodo, salarioTotal, encargosPct: enc, custoTotal };
  });
  const soma = (tipo) => linhas.filter((l) => (tipo === "MOD" ? l.tipo === "MOD" : l.tipo !== "MOD")).reduce((s, l) => s + l.custoTotal, 0);
  return { linhas, totalMOD: soma("MOD"), totalMOI: soma("MOI"), total: linhas.reduce((s, l) => s + l.custoTotal, 0) };
}

/* ===== 3. BENEFÍCIOS / SUBCONTRATADOS / OPERACIONAIS (itens genéricos) =====
   itens: [{ secao, descricao, qtd, unidade, uso (dedicação/tempo, default 1), custoUnit }] */
export function custoItens(itens) {
  const linhas = (itens || []).map((x) => ({ ...x, total: n(x.qtd) * (n(x.uso) || 1) * n(x.custoUnit) }));
  const porSecao = {};
  linhas.forEach((l) => { const k = l.secao || "outros"; porSecao[k] = (porSecao[k] || 0) + l.total; });
  return { linhas, porSecao, total: linhas.reduce((s, l) => s + l.total, 0) };
}

/* ===== 4. CUSTO DIRETO CONSOLIDADO ===== */
export function montarCustoDireto({ pessoal, beneficios, subcontratados, operacionais }) {
  const bloco1 = n(pessoal?.total) + n(beneficios?.total);
  const bloco2 = n(subcontratados?.total);
  const bloco3 = n(operacionais?.total);
  return { bloco1, bloco2, bloco3, total: bloco1 + bloco2 + bloco3 };
}

/* ===== 5. BDI — do CD ao preço (impostos "por dentro", gross-up) ===== */
export function aplicarBDI(cd, bdi = BDI_PADRAO) {
  const c1 = cd * n(bdi.overheadPct);
  const baseCI = cd + c1;
  const c2 = baseCI * n(bdi.lucroPct);
  const c3conting = baseCI * n(bdi.contingenciaPct);
  const somaImp = Object.values(bdi.impostos || {}).reduce((s, v) => s + n(v), 0);
  /* comerciais/financeiro incidem sobre o preço (como os impostos) */
  const sobrePreco = somaImp + n(bdi.comerciaisPct) + n(bdi.financeiroPct);
  const preco = (cd + c1 + c2 + c3conting) / (1 - sobrePreco);
  const impostosDet = Object.fromEntries(Object.entries(bdi.impostos || {}).map(([k, v]) => [k, preco * n(v)]));
  const c3 = c3conting + preco * (n(bdi.comerciaisPct) + n(bdi.financeiroPct));
  const c4 = preco * somaImp;
  return {
    cd, c1, c2, c3, c4, preco,
    impostosDet, somaImpostosPct: somaImp,
    kVenda: cd > 0 ? preco / cd : 0,
    resultadoPct: preco > 0 ? c2 / preco : 0,
  };
}

/* ===== 6. DRE (padrão contábil) ===== */
export function montarDRE(bdiOut, { depreciacaoAmortizacao = 0 } = {}) {
  const rob = bdiOut.preco;
  const tributos = bdiOut.c4;
  const rol = rob - tributos;
  const cogs = bdiOut.cd;
  const mc = rol - cogs;
  const custoInterno = bdiOut.c1 + bdiOut.c3; // overhead + despesas ("custo Geoambiente")
  const ebitda = mc - custoInterno;
  const ebit = ebitda - n(depreciacaoAmortizacao);
  /* percentuais no padrão contábil da GEOAMBIENTE: MC%/EBITDA%/EBIT%/COGS% sobre a ROL */
  const pct = (v) => (rol > 0 ? v / rol : 0);
  return {
    rob, tributos, tributosPct: rob > 0 ? tributos / rob : 0, rol, cogs, mc, mcPct: pct(mc),
    custoInterno, ebitda, ebitdaPct: pct(ebitda),
    depreciacaoAmortizacao: n(depreciacaoAmortizacao), ebit, ebitPct: pct(ebit),
    cogsPct: pct(cogs),
  };
}

/* ===== 7. PPU — preço de venda por linha =====
   linhas: [{ id, item, descricao, unidade, qtd, custoUnit, categoria: "servicos"|"repasse" }]
   O fator de venda por categoria: preço tal que (ROL_linha − custo×(1+overhead)) / preço = margem-alvo. */
export function fatorVenda(categoria, bdi = BDI_PADRAO, margens = MARGEM_PPU_PADRAO) {
  const margem = n(margens[categoria] != null ? margens[categoria] : margens.servicos);
  const somaImp = Object.values(bdi.impostos || {}).reduce((s, v) => s + n(v), 0) + n(bdi.comerciaisPct) + n(bdi.financeiroPct);
  const overhead = categoria === "repasse" ? n(bdi.overheadPct) / 2 : n(bdi.overheadPct); // repasse carrega meia administração
  return (1 + overhead) / (1 - somaImp - margem);
}
export function montarPPU(linhas, bdi = BDI_PADRAO, margens = MARGEM_PPU_PADRAO) {
  const out = (linhas || []).map((l) => {
    const fator = n(l.fatorManual) > 0 ? n(l.fatorManual) : fatorVenda(l.categoria || "servicos", bdi, margens);
    const precoUnit = n(l.custoUnit) * fator;
    return { ...l, fator, precoUnit, custoParcial: n(l.custoUnit) * n(l.qtd), precoParcial: precoUnit * n(l.qtd) };
  });
  const totalCusto = out.reduce((s, l) => s + l.custoParcial, 0);
  const totalVenda = out.reduce((s, l) => s + l.precoParcial, 0);
  return { linhas: out.map((l) => ({ ...l, representatividade: totalVenda > 0 ? l.precoParcial / totalVenda : 0 })), totalCusto, totalVenda };
}

/* ===== 8. EXEQUIBILIDADE — temos gente e recursos? =====
   horasPorFuncaoOut: saída de horasPorFuncao(); mapaFuncaoCargo: { funcaoId: cargoRegex };
   quadro: colaboradores do GeoópS; janelaMeses: duração prevista. */
export function analisarExequibilidade({ dias, funcoes, colaboradores, janelaMeses = 1, diasUteisMes = 21 }) {
  const capacidadeDias = janelaMeses * diasUteisMes;
  const porFuncao = (funcoes || []).map((f) => {
    const demandaDias = n((dias || {})[f.id]);
    if (!demandaDias) return null;
    const headcountNecessario = demandaDias / capacidadeDias;
    const regex = new RegExp((f.cargoMatch || f.nome || "").split(/\s+/)[0] || ".", "i");
    const disponiveis = (colaboradores || []).filter((c) => c.ativo !== false && c.status !== "Desligado" && regex.test(c.cargo || "")).length;
    const nivel = disponiveis >= Math.ceil(headcountNecessario) ? (disponiveis >= Math.ceil(headcountNecessario * 1.3) ? "ok" : "justo") : "deficit";
    return { funcao: f.nome, demandaDias: Math.round(demandaDias * 10) / 10, headcountNecessario: Math.ceil(headcountNecessario * 10) / 10, disponiveis, nivel };
  }).filter(Boolean);
  return { porFuncao, temDeficit: porFuncao.some((x) => x.nivel === "deficit"), temAperto: porFuncao.some((x) => x.nivel === "justo") };
}

/* ===== 9. ORÇAMENTO COMPLETO (uma chamada) ===== */
export function calcularOrcamento(orc) {
  const cal = orc.calibragem || {};
  const { dias, horas } = horasPorFuncao(orc.servicos, cal.metas);
  const pessoal = custoPessoal(cal.funcoes, horas, { jornadaMensalH: n(cal.jornadaMensalH) || JORNADA_MENSAL_H, encargos: cal.encargos || ENCARGOS_PADRAO });
  const beneficios = custoItens((orc.itens || []).filter((x) => x.bloco === "beneficios"));
  const subcontratados = custoItens((orc.itens || []).filter((x) => x.bloco === "subcontratados"));
  const operacionais = custoItens((orc.itens || []).filter((x) => x.bloco === "operacionais"));
  const cdParts = montarCustoDireto({ pessoal, beneficios, subcontratados, operacionais });
  const bdi = aplicarBDI(cdParts.total, cal.bdi || BDI_PADRAO);
  const dre = montarDRE(bdi, { depreciacaoAmortizacao: n(cal.depreciacaoAmortizacao) });
  /* PPU: custo unitário informado por linha (rateio manual/calibrado) ou derivado do CD proporcional */
  const ppu = montarPPU((orc.servicos || []).map((s) => ({ ...s, categoria: s.categoria || "servicos" })), cal.bdi || BDI_PADRAO, cal.margensPPU || MARGEM_PPU_PADRAO);
  return { dias, horas, pessoal, beneficios, subcontratados, operacionais, custoDireto: cdParts, bdi, dre, ppu };
}
