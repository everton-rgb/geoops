/* ============================================================================
   GeoópS — MÓDULO DE ORÇAMENTAÇÃO (aba 💰 Orçamentos)
   Módulo INDEPENDENTE: usa o motor próprio (services/orcamento.js) e lê a base
   do GeoópS (colaboradores, Eficiência, catálogo de serviços) apenas como
   default de calibragem. Cada orçamento grava a sua base calibrada por
   Cliente/Escopo/Projeto/Orçamento; emitido = imutável; revisão = clone REV+1.
   ============================================================================ */
import React, { useMemo, useState } from "react";
import {
  calcularOrcamento, analisarExequibilidade, BDI_PADRAO, ENCARGOS_PADRAO,
  MARGEM_PPU_PADRAO, CATEGORIAS_INSUMO, JORNADA_MENSAL_H,
} from "../services/orcamento.js";

/* primitivas visuais locais (módulo independente do App) */
const T = { green900: "#0E3B2E", green700: "#1F6F50", green100: "#E6F2EA", ink: "#1D2A24", inkSoft: "#5F6F66", line: "#D8E2DA", paper: "#F4F7F2", amber: "#B7791F", amberBg: "#FDF6E3", red: "#B3402A", redBg: "#F9E5E0", blue: "#1F5C8A", blueBg: "#E8F0F7", gray: "#6B7280", grayBg: "#EEF1EE" };
const inp = { width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, borderRadius: 6, padding: "7px 9px", fontSize: 13, fontFamily: "inherit", background: "#fff" };
const th = { textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: T.inkSoft, padding: "8px 10px", borderBottom: `2px solid ${T.line}`, background: T.paper };
const td = { padding: "7px 10px", borderBottom: `1px solid ${T.paper}`, fontSize: 12.5, verticalAlign: "top" };
const fmtBRL = (v) => (v == null || isNaN(+v) ? "—" : (+v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const fmtPct = (v) => (v == null || isNaN(+v) ? "—" : (v * 100).toFixed(2).replace(".", ",") + "%");
const uid = (p) => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const hojeISO = () => new Date().toISOString().slice(0, 10);
function Btn({ children, kind, small, disabled, title, onClick, style }) {
  const base = { border: `1px solid ${kind === "primary" ? T.green700 : kind === "danger" ? T.red : T.line}`, background: kind === "primary" ? T.green700 : kind === "danger" ? "#fff" : "#fff", color: kind === "primary" ? "#fff" : kind === "danger" ? T.red : T.ink, borderRadius: 7, padding: small ? "5px 10px" : "8px 14px", fontSize: small ? 12 : 13.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit" };
  return <button title={title} disabled={disabled} onClick={disabled ? undefined : onClick} style={{ ...base, ...style }}>{children}</button>;
}
const Sec = ({ titulo, children, right }) => (
  <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 14px", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.green900 }}>{titulo}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{right}</div>
    </div>
    <div style={{ padding: "12px 14px" }}>{children}</div>
  </div>
);
const BLOCO_LABEL = { beneficios: "1 · Benefícios do pessoal", subcontratados: "2 · Serviços subcontratados", operacionais: "3 · Custos operacionais da obra" };

/* carrega SheetJS sob demanda para a exportação Excel */
const garantirXLSX = () => new Promise((resolve, reject) => {
  if (window.XLSX) return resolve(window.XLSX);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  s.async = true; s.onload = () => resolve(window.XLSX); s.onerror = () => reject(new Error("Falha ao carregar o leitor de Excel."));
  document.body.appendChild(s);
});

export default function ModuloOrcamentos({ orcamentos, insumos, colaboradores, atividades, precosUnitarios, produtividade, salvarOrcamentos, salvarInsumos, podeEditar }) {
  const [sub, setSub] = useState("lista"); // lista | insumos
  const [abertoId, setAbertoId] = useState(null);
  const orcs = orcamentos || [];
  const cat = insumos || [];
  const aberto = orcs.find((o) => o.id === abertoId) || null;

  /* funções default a partir dos CARGOS reais da base GeoópS (salário médio por cargo) */
  const funcoesDaBase = () => {
    const porCargo = {};
    (colaboradores || []).filter((c) => c.ativo !== false && c.status !== "Desligado").forEach((c) => {
      const k = (c.cargo || "").trim(); if (!k) return;
      (porCargo[k] = porCargo[k] || []).push(+c.salarioBase > 0 ? +c.salarioBase : +c.custoTotal || 0);
    });
    return Object.entries(porCargo).map(([cargo, sals]) => ({
      id: uid("fn"), nome: cargo, tipo: "MOD", qtd: 1, periculosidade: 0.3,
      salario: Math.round(sals.reduce((s, v) => s + v, 0) / sals.length),
      cargoMatch: cargo,
    }));
  };

  const novoOrcamento = () => {
    const seq = orcs.length + 1;
    const novo = {
      id: uid("orc"), codigo: `ORC-${new Date().getFullYear()}-${String(seq).padStart(3, "0")}`, revisao: "REV00",
      cliente: "", escopo: "", projeto: "", oportunidade: "", responsavel: "", dataElaboracao: hojeISO(),
      status: "rascunho",
      calibragem: {
        jornadaMensalH: JORNADA_MENSAL_H, meses: 12,
        encargos: { ...ENCARGOS_PADRAO }, bdi: JSON.parse(JSON.stringify(BDI_PADRAO)),
        margensPPU: { ...MARGEM_PPU_PADRAO }, depreciacaoAmortizacao: 0,
        funcoes: funcoesDaBase(), metas: {},
      },
      servicos: [], itens: [], criadoEm: new Date().toISOString(),
    };
    salvarOrcamentos([novo, ...orcs]);
    setAbertoId(novo.id);
  };
  const upd = (id, patch) => salvarOrcamentos(orcs.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const updCal = (id, patch) => { const o = orcs.find((x) => x.id === id); upd(id, { calibragem: { ...o.calibragem, ...patch } }); };
  const clonarRevisao = (o) => {
    const rev = "REV" + String((+(o.revisao || "REV00").replace("REV", "") || 0) + 1).padStart(2, "0");
    const clone = { ...JSON.parse(JSON.stringify(o)), id: uid("orc"), revisao: rev, status: "rascunho", emitidoEm: null, criadoEm: new Date().toISOString() };
    salvarOrcamentos([clone, ...orcs]); setAbertoId(clone.id);
  };
  const emitir = (o, R) => {
    if (!o.cliente || !o.projeto || !(o.servicos || []).length) { alert("Para emitir: informe Cliente, Projeto/Escopo e ao menos 1 serviço."); return; }
    if (!confirm(`Emitir o orçamento ${o.codigo} ${o.revisao}? Depois de emitido ele fica IMUTÁVEL (revisões geram REV novo).`)) return;
    upd(o.id, { status: "emitido", emitidoEm: hojeISO(), saidas: { preco: R.bdi.preco, cd: R.custoDireto.total, ebitdaPct: R.dre.ebitdaPct, ebitPct: R.dre.ebitPct } });
  };

  /* ===== EXPORTAÇÃO EXCEL (layout GEOAMBIENTE: Resumo · Custo Direto · Metas · BDI · PPU · Insumos) ===== */
  const baixarExcel = async (o, R) => {
    try {
      const XLSX = await garantirXLSX();
      const wb = XLSX.utils.book_new();
      const num = (v) => Math.round((+v || 0) * 100) / 100;
      /* Comparativo | Resumo */
      const resumo = [
        ["ORÇAMENTO — " + (o.projeto || o.codigo)], [],
        ["CLIENTE / PROJETO:", o.cliente + " — " + o.projeto], ["ESCOPO:", o.escopo], ["Nº DA OPORTUNIDADE:", o.oportunidade], ["REVISÃO:", o.revisao], ["DATA:", o.dataElaboracao], ["RESPONSÁVEL:", o.responsavel], [],
        ["RESUMO — CUSTO DIRETO"], ["1 - Pessoal próprio + benefícios", num(R.custoDireto.bloco1)], ["2 - Serviços subcontratados", num(R.custoDireto.bloco2)], ["3 - Custos operacionais da obra", num(R.custoDireto.bloco3)], ["CUSTO DIRETO TOTAL", num(R.custoDireto.total)], [],
        ["RESUMO — BDI"], ["C1 - Custos indiretos (overhead)", num(R.bdi.c1)], ["C2 - Lucro", num(R.bdi.c2)], ["C3 - Despesas", num(R.bdi.c3)], ["C4 - Impostos e taxas", num(R.bdi.c4)], ["PREÇO DE VENDA DO PROJETO", num(R.bdi.preco)], ["K DE VENDA (PV/CD)", num(R.bdi.kVenda)], [],
        ["INDICADORES FINANCEIROS (DRE)"], ["(+) ROB", num(R.dre.rob)], ["(-) Tributos sobre ROB", -num(R.dre.tributos)], ["(=) ROL", num(R.dre.rol)], ["(-) Custos operacionais (COGS)", -num(R.dre.cogs)], ["(=) Margem de Contribuição", num(R.dre.mc)], ["MC %", num(R.dre.mcPct * 100) + "%"], ["(-) Custo interno (C1+C3)", -num(R.dre.custoInterno)], ["(=) EBITDA", num(R.dre.ebitda)], ["EBITDA %", num(R.dre.ebitdaPct * 100) + "%"], ["(-) Depreciações e amortizações", -num(R.dre.depreciacaoAmortizacao)], ["(=) EBIT", num(R.dre.ebit)], ["EBIT %", num(R.dre.ebitPct * 100) + "%"], ["COGS %", num(R.dre.cogsPct * 100) + "%"],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), "Comparativo Resumo");
      /* Custo Direto */
      const cd = [["CUSTO DIRETO"], [], ["1 - CUSTO DO PESSOAL PRÓPRIO"], ["Função", "Tipo", "Qtd", "Horas", "Salário mensal", "Salário período", "Peric.", "Salário total", "Encargos", "Custo total"]];
      R.pessoal.linhas.forEach((l) => cd.push([l.nome, l.tipo, l.qtd || 1, num(l.horas), num(l.salario), num(l.salarioPeriodo), l.periculosidade, num(l.salarioTotal), l.encargosPct, num(l.custoTotal)]));
      cd.push(["TOTAL PESSOAL", "", "", "", "", "", "", "", "", num(R.pessoal.total)]); cd.push([]);
      [["beneficios", R.beneficios], ["subcontratados", R.subcontratados], ["operacionais", R.operacionais]].forEach(([b, out]) => {
        cd.push([BLOCO_LABEL[b].toUpperCase()]); cd.push(["Seção", "Descrição", "Qtd", "Unid.", "Uso/Dedicação", "Custo unitário", "Custo total"]);
        out.linhas.forEach((l) => cd.push([l.secao || "", l.descricao || "", num(l.qtd), l.unidade || "", num(l.uso) || 1, num(l.custoUnit), num(l.total)]));
        cd.push(["TOTAL", "", "", "", "", "", num(out.total)]); cd.push([]);
      });
      cd.push(["CUSTO DIRETO TOTAL", "", "", "", "", "", num(R.custoDireto.total)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cd), "Custo Direto");
      /* Metas */
      const fns = (o.calibragem.funcoes || []);
      const metasAoa = [["Serviço", "Unid.", "Qtd", ...fns.map((f) => f.nome + " (meta/dia)"), "Dias resultantes por função abaixo"]];
      (o.servicos || []).forEach((s) => metasAoa.push([s.descricao, s.unidade, num(s.qtd), ...fns.map((f) => num(((o.calibragem.metas || {})[s.id] || {})[f.id]) || "")]));
      metasAoa.push([]); metasAoa.push(["DIAS POR FUNÇÃO", "", "", ...fns.map((f) => num(R.dias[f.id]) || 0)]);
      metasAoa.push(["HORAS POR FUNÇÃO", "", "", ...fns.map((f) => num(R.horas[f.id]) || 0)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metasAoa), "Metas");
      /* BDI */
      const bdiC = o.calibragem.bdi || BDI_PADRAO;
      const bdiAoa = [["BDI"], ["CUSTO DIRETO", num(R.custoDireto.total)], [], ["C1 - Custos indiretos (overhead)", bdiC.overheadPct, num(R.bdi.c1)], ["C2 - Lucro", bdiC.lucroPct, num(R.bdi.c2)], ["C3.1 - Contingência", bdiC.contingenciaPct], ["C3.2 - Despesas comerciais", bdiC.comerciaisPct], ["C3.3 - Custo financeiro", bdiC.financeiroPct], ["C3 - Total despesas", "", num(R.bdi.c3)], []];
      Object.entries(bdiC.impostos || {}).forEach(([k, v]) => bdiAoa.push(["C4 - " + k.toUpperCase(), v, num((R.bdi.impostosDet || {})[k])]));
      bdiAoa.push(["C4 - Total impostos", R.bdi.somaImpostosPct, num(R.bdi.c4)]); bdiAoa.push([]);
      bdiAoa.push(["PREÇO FINAL", "", num(R.bdi.preco)]); bdiAoa.push(["RESULTADO ESTIMADO", "", num(R.bdi.resultadoPct * 100) + "%"]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bdiAoa), "BDI");
      /* PPU */
      const ppuAoa = [["Item", "Descrição", "Unid.", "Qtd", "Custo unitário", "Fator", "Preço de venda unitário", "Custo parcial", "Preço de venda parcial", "Representatividade"]];
      R.ppu.linhas.forEach((l, i) => ppuAoa.push([l.item || i + 1, l.descricao, l.unidade, num(l.qtd), num(l.custoUnit), num(l.fator), num(l.precoUnit), num(l.custoParcial), num(l.precoParcial), num(l.representatividade * 100) + "%"]));
      ppuAoa.push([]); ppuAoa.push(["TOTAIS", "", "", "", "", "", "", num(R.ppu.totalCusto), num(R.ppu.totalVenda)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ppuAoa), "PPU");
      /* Insumos usados */
      const usados = (o.itens || []).filter((x) => x.insumoId);
      const insAoa = [["Categoria", "Descrição", "Unid.", "Custo unitário", "Fornecedor", "Cotação"]];
      cat.filter((x) => usados.some((u) => u.insumoId === x.id) || !usados.length).forEach((x) => insAoa.push([(CATEGORIAS_INSUMO.find(([id]) => id === x.categoria) || [])[1] || x.categoria, x.descricao, x.unidade, num(x.custoUnit), x.fornecedor || "", x.dataCotacao || ""]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(insAoa), "Insumos");
      XLSX.writeFile(wb, `${o.codigo}_${o.revisao}_${(o.projeto || "orcamento").replace(/[^\w]+/g, "_").slice(0, 40)}.xlsx`);
    } catch (e) { alert("Exportação falhou: " + (e && e.message)); }
  };

  /* ============================ RENDER ============================ */
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0E3B2E, #1F6F50)", color: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>💰 Orçamentos (DFP · PPU · DRE)</div>
        <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 2, maxWidth: 900 }}>Módulo de orçamentação com motor independente: calibre metas, salários, encargos, BDI e impostos por Cliente/Escopo/Projeto; o sistema monta o Custo Direto, a DFP, a PPU e o DRE (EBITDA/EBIT/COGS), verifica a exequibilidade com o quadro real e exporta a planilha Excel no padrão GEOAMBIENTE. Orçamento emitido é imutável — revisões geram REV novo.</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[["lista", `📋 Orçamentos (${orcs.length})`], ["insumos", `🧪 Insumos (${cat.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => { setSub(id); setAbertoId(null); }} style={{ border: `1px solid ${sub === id ? T.green700 : T.line}`, background: sub === id ? T.green700 : "#fff", color: sub === id ? "#fff" : T.inkSoft, borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
        ))}
      </div>

      {sub === "insumos" && <CatalogoInsumos cat={cat} salvar={salvarInsumos} podeEditar={podeEditar} />}

      {sub === "lista" && !aberto && (
        <>
          {podeEditar && <div style={{ marginBottom: 12 }}><Btn kind="primary" onClick={novoOrcamento}>+ Novo orçamento</Btn></div>}
          {orcs.length === 0 ? (
            <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "42px 24px", textAlign: "center", color: T.inkSoft }}>Nenhum orçamento ainda. Crie o primeiro — as funções e salários já vêm pré-carregados dos cargos reais do GeoópS.</div>
          ) : (
            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Código</th><th style={th}>Cliente</th><th style={th}>Projeto / Escopo</th><th style={th}>Rev.</th><th style={th}>Status</th><th style={{ ...th, textAlign: "right" }}>Preço</th><th style={th}></th></tr></thead>
                <tbody>{orcs.map((o) => (
                  <tr key={o.id}>
                    <td style={{ ...td, fontFamily: "monospace", fontWeight: 700 }}>{o.codigo}</td>
                    <td style={td}>{o.cliente || "—"}</td>
                    <td style={td}>{o.projeto || "—"}<div style={{ fontSize: 10.5, color: T.inkSoft }}>{o.escopo}</div></td>
                    <td style={{ ...td, fontFamily: "monospace" }}>{o.revisao}</td>
                    <td style={td}><span style={{ fontSize: 11, fontWeight: 700, color: o.status === "emitido" ? "#fff" : T.amber, background: o.status === "emitido" ? T.green700 : T.amberBg, borderRadius: 99, padding: "2px 10px" }}>{o.status === "emitido" ? `emitido ${o.emitidoEm || ""}` : "rascunho"}</span></td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>{o.saidas ? fmtBRL(o.saidas.preco) : "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <Btn small onClick={() => setAbertoId(o.id)}>{o.status === "emitido" ? "Ver" : "Abrir"}</Btn>{" "}
                      <Btn small onClick={() => clonarRevisao(o)}>Nova revisão</Btn>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {sub === "lista" && aberto && (
        <EditorOrcamento o={aberto} upd={upd} updCal={updCal} cat={cat} colaboradores={colaboradores}
          atividades={atividades} precosUnitarios={precosUnitarios} produtividade={produtividade}
          podeEditar={podeEditar && aberto.status !== "emitido"}
          onVoltar={() => setAbertoId(null)} onEmitir={emitir} onExcel={baixarExcel} onRevisao={() => clonarRevisao(aberto)} />
      )}
    </div>
  );
}

/* ============================ CATÁLOGO DE INSUMOS ============================ */
function CatalogoInsumos({ cat, salvar, podeEditar }) {
  const add = () => salvar([{ id: uid("ins"), categoria: "amostragem", descricao: "", unidade: "unid", custoUnit: 0, fornecedor: "", dataCotacao: hojeISO(), ativo: true }, ...cat]);
  const set = (id, patch) => salvar(cat.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const inativar = (id) => salvar(cat.map((x) => (x.id === id ? { ...x, ativo: false } : x)));
  const vencida = (x) => x.dataCotacao && (Date.now() - new Date(x.dataCotacao).getTime()) > 180 * 864e5; // 6 meses
  return (
    <Sec titulo={`🧪 Catálogo de insumos — remediadores, amostragem, tubos geomecânicos, bentonita e toda a parafernália de execução`}
      right={podeEditar && <Btn small kind="primary" onClick={add}>+ Novo insumo</Btn>}>
      <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>Base permanente de preços que alimenta os itens do Custo Direto. Cotações com mais de 6 meses são sinalizadas ⚠ nos orçamentos. Insumos não são excluídos — só inativados (histórico preservado).</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Categoria</th><th style={th}>Descrição</th><th style={th}>Unid.</th><th style={{ ...th, textAlign: "right" }}>Custo unit. (R$)</th><th style={th}>Fornecedor</th><th style={th}>Cotação</th>{podeEditar && <th style={th}></th>}</tr></thead>
          <tbody>
            {cat.filter((x) => x.ativo !== false).map((x) => (
              <tr key={x.id} style={{ opacity: 1 }}>
                <td style={td}><select disabled={!podeEditar} value={x.categoria} onChange={(e) => set(x.id, { categoria: e.target.value })} style={{ ...inp, padding: "5px 7px" }}>{CATEGORIAS_INSUMO.map(([id, lb]) => <option key={id} value={id}>{lb}</option>)}</select></td>
                <td style={td}><input disabled={!podeEditar} value={x.descricao} onChange={(e) => set(x.id, { descricao: e.target.value })} style={{ ...inp, padding: "5px 7px", minWidth: 220 }} placeholder="ex.: Tubo geomecânico 2” ranhurado" /></td>
                <td style={td}><input disabled={!podeEditar} value={x.unidade} onChange={(e) => set(x.id, { unidade: e.target.value })} style={{ ...inp, padding: "5px 7px", width: 70 }} /></td>
                <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" step="0.01" disabled={!podeEditar} value={x.custoUnit} onChange={(e) => set(x.id, { custoUnit: +e.target.value || 0 })} style={{ ...inp, padding: "5px 7px", width: 100, textAlign: "right", fontFamily: "monospace" }} /></td>
                <td style={td}><input disabled={!podeEditar} value={x.fornecedor || ""} onChange={(e) => set(x.id, { fornecedor: e.target.value })} style={{ ...inp, padding: "5px 7px", width: 130 }} /></td>
                <td style={td}><input type="date" disabled={!podeEditar} value={x.dataCotacao || ""} onChange={(e) => set(x.id, { dataCotacao: e.target.value })} style={{ ...inp, padding: "5px 7px", width: 135 }} />{vencida(x) && <div style={{ fontSize: 10, color: T.amber, fontWeight: 700 }}>⚠ cotação antiga</div>}</td>
                {podeEditar && <td style={{ ...td, whiteSpace: "nowrap" }}><Btn small kind="danger" title="Inativa (histórico preservado)" onClick={() => inativar(x.id)}>Inativar</Btn></td>}
              </tr>
            ))}
            {cat.filter((x) => x.ativo !== false).length === 0 && <tr><td style={td} colSpan={7}><span style={{ color: T.inkSoft }}>Nenhum insumo ativo — cadastre remediadores, materiais de amostragem, tubos, bentonita etc.</span></td></tr>}
          </tbody>
        </table>
      </div>
    </Sec>
  );
}

/* ============================ EDITOR DE 1 ORÇAMENTO ============================ */
function EditorOrcamento({ o, upd, updCal, cat, colaboradores, atividades, precosUnitarios, produtividade, podeEditar, onVoltar, onEmitir, onExcel, onRevisao }) {
  const cal = o.calibragem || {};
  const R = useMemo(() => calcularOrcamento(o), [o]);
  const exeq = useMemo(() => analisarExequibilidade({ dias: R.dias, funcoes: cal.funcoes, colaboradores, janelaMeses: +cal.meses || 1 }), [R, cal, colaboradores]);
  const setServ = (id, patch) => upd(o.id, { servicos: o.servicos.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addServ = () => upd(o.id, { servicos: [...(o.servicos || []), { id: uid("sv"), item: String((o.servicos || []).length + 1), descricao: "", unidade: "UN.", qtd: 0, custoUnit: 0, categoria: "servicos" }] });
  const puxarServicosDaBase = () => {
    const novos = (atividades || []).map((a, i) => ({
      id: uid("sv") + i, item: String((o.servicos || []).length + i + 1), descricao: a.label, unidade: (a.unidProd || "unid").replace("/dia", ""), qtd: 0,
      custoUnit: +(((precosUnitarios || []).find((p) => (p.item || "").toLowerCase().includes((a.label || "").toLowerCase().split(" ")[0])) || {}).preco) || 0,
      categoria: "servicos", metaSugerida: (produtividade || {})[a.id] || 0,
    }));
    upd(o.id, { servicos: [...(o.servicos || []), ...novos] });
  };
  const rmServ = (id) => { const m = { ...(cal.metas || {}) }; delete m[id]; upd(o.id, { servicos: o.servicos.filter((s) => s.id !== id), calibragem: { ...cal, metas: m } }); };
  const setMeta = (sid, fid, v) => updCal(o.id, { metas: { ...(cal.metas || {}), [sid]: { ...((cal.metas || {})[sid] || {}), [fid]: v === "" ? "" : +v } } });
  const setFn = (fid, patch) => updCal(o.id, { funcoes: (cal.funcoes || []).map((f) => (f.id === fid ? { ...f, ...patch } : f)) });
  const addFn = () => updCal(o.id, { funcoes: [...(cal.funcoes || []), { id: uid("fn"), nome: "", tipo: "MOD", qtd: 1, salario: 0, periculosidade: 0.3 }] });
  const rmFn = (fid) => updCal(o.id, { funcoes: (cal.funcoes || []).filter((f) => f.id !== fid) });
  const setItem = (id, patch) => upd(o.id, { itens: o.itens.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const addItem = (bloco) => upd(o.id, { itens: [...(o.itens || []), { id: uid("it"), bloco, secao: "", descricao: "", qtd: 0, unidade: "unid", uso: 1, custoUnit: 0 }] });
  const rmItem = (id) => upd(o.id, { itens: o.itens.filter((x) => x.id !== id) });
  const usarInsumo = (id, insumoId) => {
    const x = cat.find((c) => c.id === insumoId); if (!x) return;
    setItem(id, { insumoId, descricao: x.descricao, unidade: x.unidade, custoUnit: +x.custoUnit || 0 });
  };
  const setBdi = (patch) => updCal(o.id, { bdi: { ...(cal.bdi || {}), ...patch } });
  const setImposto = (k, v) => setBdi({ impostos: { ...((cal.bdi || {}).impostos || {}), [k]: v === "" ? 0 : +v } });
  const cotacaoVelha = (insumoId) => { const x = cat.find((c) => c.id === insumoId); return x && x.dataCotacao && (Date.now() - new Date(x.dataCotacao).getTime()) > 180 * 864e5; };
  const fns = cal.funcoes || [];
  const pctInp = (v, on) => <input type="number" min="0" step="0.0001" disabled={!podeEditar} value={v ?? ""} onChange={on} style={{ ...inp, width: 90, textAlign: "right", fontFamily: "monospace", padding: "5px 7px" }} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Btn small onClick={onVoltar}>← Voltar à lista</Btn>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn small onClick={() => onExcel(o, R)}>⬇ Baixar planilha Excel (padrão GEOAMBIENTE)</Btn>
          {o.status !== "emitido" && podeEditar && <Btn small kind="primary" onClick={() => onEmitir(o, R)}>📤 Emitir orçamento</Btn>}
          {o.status === "emitido" && <Btn small onClick={onRevisao}>Nova revisão (REV+1)</Btn>}
        </div>
      </div>
      {o.status === "emitido" && <div style={{ background: T.green100, color: T.green900, borderRadius: 8, padding: "8px 14px", fontSize: 12.5, marginBottom: 12 }}>🔒 Orçamento EMITIDO em {o.emitidoEm} — imutável. Para alterar, gere uma nova revisão.</div>}

      {/* IDENTIFICAÇÃO — a base é ÚNICA por Cliente/Escopo/Projeto/Orçamento */}
      <Sec titulo={`🪪 Identificação — ${o.codigo} · ${o.revisao}`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {[["cliente", "Cliente"], ["projeto", "Projeto"], ["escopo", "Escopo"], ["oportunidade", "Nº da oportunidade"], ["responsavel", "Responsável"], ["dataElaboracao", "Data de elaboração"]].map(([k, lb]) => (
            <div key={k}><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft, textTransform: "uppercase" }}>{lb}</div>
              <input type={k === "dataElaboracao" ? "date" : "text"} disabled={!podeEditar} value={o[k] || ""} onChange={(e) => upd(o.id, { [k]: e.target.value })} style={inp} /></div>
          ))}
          <div><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft, textTransform: "uppercase" }}>Duração (meses)</div>
            <input type="number" min="1" disabled={!podeEditar} value={cal.meses ?? 12} onChange={(e) => updCal(o.id, { meses: +e.target.value || 1 })} style={inp} /></div>
        </div>
      </Sec>

      {/* SERVIÇOS + PPU */}
      <Sec titulo="🛠 Serviços orçados (linhas da PPU)" right={podeEditar && <>
        <Btn small onClick={puxarServicosDaBase}>⤵ Puxar catálogo do GeoópS</Btn>
        <Btn small kind="primary" onClick={addServ}>+ Serviço</Btn></>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Item</th><th style={th}>Descrição</th><th style={th}>Unid.</th><th style={{ ...th, textAlign: "right" }}>Qtd</th><th style={{ ...th, textAlign: "right" }}>Custo unit. (R$)</th><th style={th}>Categoria</th><th style={{ ...th, textAlign: "right" }}>Preço venda unit.</th>{podeEditar && <th style={th}></th>}</tr></thead>
            <tbody>
              {(o.servicos || []).map((s) => { const lp = R.ppu.linhas.find((l) => l.id === s.id) || {}; return (
                <tr key={s.id}>
                  <td style={td}><input disabled={!podeEditar} value={s.item || ""} onChange={(e) => setServ(s.id, { item: e.target.value })} style={{ ...inp, width: 55, padding: "5px 7px", fontFamily: "monospace" }} /></td>
                  <td style={td}><input disabled={!podeEditar} value={s.descricao} onChange={(e) => setServ(s.id, { descricao: e.target.value })} style={{ ...inp, minWidth: 240, padding: "5px 7px" }} /></td>
                  <td style={td}><input disabled={!podeEditar} value={s.unidade} onChange={(e) => setServ(s.id, { unidade: e.target.value })} style={{ ...inp, width: 60, padding: "5px 7px" }} /></td>
                  <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" disabled={!podeEditar} value={s.qtd} onChange={(e) => setServ(s.id, { qtd: +e.target.value || 0 })} style={{ ...inp, width: 85, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                  <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" step="0.01" disabled={!podeEditar} value={s.custoUnit} onChange={(e) => setServ(s.id, { custoUnit: +e.target.value || 0 })} style={{ ...inp, width: 100, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                  <td style={td}><select disabled={!podeEditar} value={s.categoria || "servicos"} onChange={(e) => setServ(s.id, { categoria: e.target.value })} style={{ ...inp, padding: "5px 7px" }}><option value="servicos">Serviço próprio</option><option value="repasse">Repasse (subcontratado)</option></select></td>
                  <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: T.green900 }}>{fmtBRL(lp.precoUnit)}</td>
                  {podeEditar && <td style={td}><button onClick={() => rmServ(s.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button></td>}
                </tr>
              ); })}
              {(o.servicos || []).length === 0 && <tr><td style={td} colSpan={8}><span style={{ color: T.inkSoft }}>Adicione os serviços do escopo (ou puxe o catálogo do GeoópS) e informe quantidades.</span></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 8 }}>PPU: custo {fmtBRL(R.ppu.totalCusto)} → venda <b style={{ color: T.green900 }}>{fmtBRL(R.ppu.totalVenda)}</b> · margem-alvo: serviços {fmtPct((cal.margensPPU || MARGEM_PPU_PADRAO).servicos)} / repasse {fmtPct((cal.margensPPU || MARGEM_PPU_PADRAO).repasse)}</div>
      </Sec>

      {/* CALIBRAGEM: METAS serviço × função */}
      <Sec titulo="🎯 Calibragem — metas de produtividade (unidades/dia por função; vazio = função não participa)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: 500 }}>
            <thead><tr><th style={th}>Serviço</th><th style={{ ...th, textAlign: "right" }}>Qtd</th>{fns.map((f) => <th key={f.id} style={{ ...th, textAlign: "right" }}>{f.nome || "?"}</th>)}</tr></thead>
            <tbody>
              {(o.servicos || []).map((s) => (
                <tr key={s.id}>
                  <td style={{ ...td, maxWidth: 220 }}>{s.descricao || "—"}</td>
                  <td style={{ ...td, textAlign: "right", fontFamily: "monospace" }}>{s.qtd}</td>
                  {fns.map((f) => (
                    <td key={f.id} style={{ ...td, textAlign: "right" }}>
                      <input type="number" min="0" step="0.01" disabled={!podeEditar} value={((cal.metas || {})[s.id] || {})[f.id] ?? ""} placeholder="—"
                        onChange={(e) => setMeta(s.id, f.id, e.target.value)} style={{ ...inp, width: 72, textAlign: "right", padding: "4px 6px", fontFamily: "monospace" }} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ background: T.paper }}>
                <td style={{ ...td, fontWeight: 700 }}>DIAS / HORAS por função</td><td style={td}></td>
                {fns.map((f) => <td key={f.id} style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{(R.dias[f.id] || 0).toFixed(1)}d<div style={{ fontWeight: 400, fontSize: 10.5, color: T.inkSoft }}>{(R.horas[f.id] || 0).toFixed(0)}h</div></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Sec>

      {/* PESSOAL */}
      <Sec titulo={`👷 Pessoal próprio (MOD/MOI/PJ) — ${fmtBRL(R.pessoal.total)}`} right={podeEditar && <Btn small kind="primary" onClick={addFn}>+ Função</Btn>}>
        <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>Funções e salários pré-carregados dos cargos reais do GeoópS (média por cargo) — calibre à vontade. Horas vêm da matriz de metas; use "horas manuais" para funções fora da matriz (MOI de escritório). Encargos: MOD {fmtPct((cal.encargos || ENCARGOS_PADRAO).MOD)} · MOI {fmtPct((cal.encargos || ENCARGOS_PADRAO).MOI)} · PJ 0%.</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Função</th><th style={th}>Tipo</th><th style={{ ...th, textAlign: "right" }}>Qtd</th><th style={{ ...th, textAlign: "right" }}>Salário mensal</th><th style={{ ...th, textAlign: "right" }}>Peric.</th><th style={{ ...th, textAlign: "right" }}>Horas (matriz)</th><th style={{ ...th, textAlign: "right" }}>Horas manuais</th><th style={{ ...th, textAlign: "right" }}>Custo total</th>{podeEditar && <th style={th}></th>}</tr></thead>
            <tbody>{fns.map((f) => { const l = R.pessoal.linhas.find((x) => x.id === f.id) || {}; return (
              <tr key={f.id}>
                <td style={td}><input disabled={!podeEditar} value={f.nome} onChange={(e) => setFn(f.id, { nome: e.target.value })} style={{ ...inp, minWidth: 170, padding: "5px 7px" }} /></td>
                <td style={td}><select disabled={!podeEditar} value={f.tipo} onChange={(e) => setFn(f.id, { tipo: e.target.value })} style={{ ...inp, padding: "5px 7px" }}><option>MOD</option><option>MOI</option><option>PJ</option></select></td>
                <td style={{ ...td, textAlign: "right" }}><input type="number" min="1" disabled={!podeEditar} value={f.qtd || 1} onChange={(e) => setFn(f.id, { qtd: +e.target.value || 1 })} style={{ ...inp, width: 55, textAlign: "right", padding: "5px 7px" }} /></td>
                <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" disabled={!podeEditar} value={f.salario} onChange={(e) => setFn(f.id, { salario: +e.target.value || 0 })} style={{ ...inp, width: 100, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" step="0.05" disabled={!podeEditar} value={f.periculosidade ?? 0} onChange={(e) => setFn(f.id, { periculosidade: +e.target.value || 0 })} style={{ ...inp, width: 65, textAlign: "right", padding: "5px 7px" }} /></td>
                <td style={{ ...td, textAlign: "right", fontFamily: "monospace", color: T.inkSoft }}>{(R.horas[f.id] || 0).toFixed(0)}h</td>
                <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" disabled={!podeEditar} value={f.horasManuais ?? ""} placeholder="—" onChange={(e) => setFn(f.id, { horasManuais: e.target.value === "" ? "" : +e.target.value })} style={{ ...inp, width: 85, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{fmtBRL(l.custoTotal)}</td>
                {podeEditar && <td style={td}><button onClick={() => rmFn(f.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button></td>}
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Sec>

      {/* ITENS: benefícios / subcontratados / operacionais */}
      {["beneficios", "subcontratados", "operacionais"].map((bloco) => { const out = R[bloco]; return (
        <Sec key={bloco} titulo={`${BLOCO_LABEL[bloco]} — ${fmtBRL(out.total)}`} right={podeEditar && <Btn small kind="primary" onClick={() => addItem(bloco)}>+ Item</Btn>}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Seção</th><th style={th}>Descrição</th><th style={th}>Insumo do catálogo</th><th style={{ ...th, textAlign: "right" }}>Qtd</th><th style={th}>Unid.</th><th style={{ ...th, textAlign: "right" }}>Uso/Dedicação</th><th style={{ ...th, textAlign: "right" }}>Custo unit.</th><th style={{ ...th, textAlign: "right" }}>Total</th>{podeEditar && <th style={th}></th>}</tr></thead>
              <tbody>
                {(o.itens || []).filter((x) => x.bloco === bloco).map((x) => { const l = out.linhas.find((y) => y.id === x.id) || {}; return (
                  <tr key={x.id}>
                    <td style={td}><input disabled={!podeEditar} value={x.secao || ""} onChange={(e) => setItem(x.id, { secao: e.target.value })} placeholder={bloco === "operacionais" ? "3.1 Veículos…" : bloco === "subcontratados" ? "2.1 Análises…" : "1.5 Refeições…"} style={{ ...inp, width: 130, padding: "5px 7px" }} /></td>
                    <td style={td}><input disabled={!podeEditar} value={x.descricao} onChange={(e) => setItem(x.id, { descricao: e.target.value })} style={{ ...inp, minWidth: 200, padding: "5px 7px" }} />{x.insumoId && cotacaoVelha(x.insumoId) && <div style={{ fontSize: 10, color: T.amber, fontWeight: 700 }}>⚠ cotação do insumo &gt;6 meses</div>}</td>
                    <td style={td}><select disabled={!podeEditar} value={x.insumoId || ""} onChange={(e) => usarInsumo(x.id, e.target.value)} style={{ ...inp, padding: "5px 7px", maxWidth: 180 }}><option value="">—</option>{cat.filter((c) => c.ativo !== false).map((c) => <option key={c.id} value={c.id}>{c.descricao}</option>)}</select></td>
                    <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" disabled={!podeEditar} value={x.qtd} onChange={(e) => setItem(x.id, { qtd: +e.target.value || 0 })} style={{ ...inp, width: 80, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                    <td style={td}><input disabled={!podeEditar} value={x.unidade || ""} onChange={(e) => setItem(x.id, { unidade: e.target.value })} style={{ ...inp, width: 80, padding: "5px 7px" }} /></td>
                    <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" step="0.01" disabled={!podeEditar} value={x.uso ?? 1} onChange={(e) => setItem(x.id, { uso: +e.target.value || 0 })} style={{ ...inp, width: 80, textAlign: "right", padding: "5px 7px" }} title="Dedicação % ou tempo de uso (Unid×Mês)" /></td>
                    <td style={{ ...td, textAlign: "right" }}><input type="number" min="0" step="0.01" disabled={!podeEditar} value={x.custoUnit} onChange={(e) => setItem(x.id, { custoUnit: +e.target.value || 0 })} style={{ ...inp, width: 95, textAlign: "right", padding: "5px 7px", fontFamily: "monospace" }} /></td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{fmtBRL(l.total)}</td>
                    {podeEditar && <td style={td}><button onClick={() => rmItem(x.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button></td>}
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
        </Sec>
      ); })}

      {/* BDI / IMPOSTOS */}
      <Sec titulo="🏦 BDI e impostos (calibráveis por orçamento)">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[["overheadPct", "C1 Overhead"], ["lucroPct", "C2 Lucro"], ["contingenciaPct", "C3 Contingência"], ["comerciaisPct", "C3 Comerciais"], ["financeiroPct", "C3 Financeiro"]].map(([k, lb]) => (
            <div key={k}><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft }}>{lb}</div>{pctInp((cal.bdi || BDI_PADRAO)[k], (e) => setBdi({ [k]: e.target.value === "" ? 0 : +e.target.value }))}</div>
          ))}
          {Object.entries((cal.bdi || BDI_PADRAO).impostos || {}).map(([k, v]) => (
            <div key={k}><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft }}>C4 {k.toUpperCase()}</div>{pctInp(v, (e) => setImposto(k, e.target.value))}</div>
          ))}
          <div><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft }}>D&A (R$)</div>
            <input type="number" min="0" disabled={!podeEditar} value={cal.depreciacaoAmortizacao ?? 0} onChange={(e) => updCal(o.id, { depreciacaoAmortizacao: +e.target.value || 0 })} style={{ ...inp, width: 130, textAlign: "right", fontFamily: "monospace" }} /></div>
          <div><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft }}>Margem PPU serviços</div>{pctInp((cal.margensPPU || MARGEM_PPU_PADRAO).servicos, (e) => updCal(o.id, { margensPPU: { ...(cal.margensPPU || MARGEM_PPU_PADRAO), servicos: +e.target.value || 0 } }))}</div>
          <div><div style={{ fontSize: 10.5, fontWeight: 700, color: T.inkSoft }}>Margem PPU repasse</div>{pctInp((cal.margensPPU || MARGEM_PPU_PADRAO).repasse, (e) => updCal(o.id, { margensPPU: { ...(cal.margensPPU || MARGEM_PPU_PADRAO), repasse: +e.target.value || 0 } }))}</div>
        </div>
        <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 8 }}>Percentuais em decimal (0,12 = 12%). Impostos "por dentro": preço = custos ÷ (1 − Σ impostos).</div>
      </Sec>

      {/* ===== RESULTADOS: DFP + DRE + EXEQUIBILIDADE ===== */}
      <Sec titulo="📊 Resultados — DFP · DRE · Exequibilidade">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.green900, marginBottom: 6 }}>DFP (formação do preço)</div>
            {[["Custo Direto (1+2+3)", R.custoDireto.total], ["C1 · Custos indiretos", R.bdi.c1], ["C2 · Lucro", R.bdi.c2], ["C3 · Despesas", R.bdi.c3], ["C4 · Impostos e taxas", R.bdi.c4]].map(([lb, v]) => (
              <div key={lb} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0", borderBottom: `1px solid ${T.paper}` }}><span>{lb}</span><b style={{ fontFamily: "monospace" }}>{fmtBRL(v)}</b></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, padding: "8px 0", color: T.green900 }}><b>PREÇO DE VENDA</b><b style={{ fontFamily: "monospace" }}>{fmtBRL(R.bdi.preco)}</b></div>
            <div style={{ fontSize: 11.5, color: T.inkSoft }}>K de venda (PV/CD): <b>{R.bdi.kVenda.toFixed(2)}</b></div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.green900, marginBottom: 6 }}>DRE (indicadores)</div>
            {[["(+) ROB", R.dre.rob, null], ["(−) Tributos", -R.dre.tributos, null], ["(=) ROL", R.dre.rol, null], ["(−) COGS", -R.dre.cogs, R.dre.cogsPct], ["(=) Margem de Contribuição", R.dre.mc, R.dre.mcPct], ["(−) Custo interno (C1+C3)", -R.dre.custoInterno, null], ["(=) EBITDA", R.dre.ebitda, R.dre.ebitdaPct], ["(−) D&A", -R.dre.depreciacaoAmortizacao, null], ["(=) EBIT", R.dre.ebit, R.dre.ebitPct]].map(([lb, v, p]) => (
              <div key={lb} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0", borderBottom: `1px solid ${T.paper}`, fontWeight: lb.startsWith("(=)") ? 700 : 400 }}>
                <span>{lb}</span><span style={{ fontFamily: "monospace" }}>{fmtBRL(v)}{p != null && <span style={{ color: T.blue }}> · {fmtPct(p)}</span>}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.green900, marginBottom: 6 }}>Exequibilidade (quadro real GeoópS × demanda)</div>
            {exeq.porFuncao.length === 0 && <div style={{ fontSize: 12, color: T.inkSoft }}>Preencha as metas para calcular a demanda de gente.</div>}
            {exeq.porFuncao.map((x) => (
              <div key={x.funcao} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${T.paper}` }}>
                <span>{x.nivel === "ok" ? "🟢" : x.nivel === "justo" ? "🟡" : "🔴"} {x.funcao}</span>
                <span style={{ fontFamily: "monospace", color: T.inkSoft }}>{x.demandaDias}d · precisa {x.headcountNecessario} · tem {x.disponiveis}</span>
              </div>
            ))}
            {exeq.temDeficit && <div style={{ fontSize: 11.5, color: T.red, fontWeight: 700, marginTop: 6 }}>🔴 Déficit de mão de obra — prever contratação, aluguel ou terceirização (inclua o custo no bloco 2).</div>}
            {!exeq.temDeficit && exeq.temAperto && <div style={{ fontSize: 11.5, color: T.amber, fontWeight: 700, marginTop: 6 }}>🟡 Capacidade justa — confira as travas/agenda antes de assumir o prazo.</div>}
            {!exeq.temDeficit && !exeq.temAperto && exeq.porFuncao.length > 0 && <div style={{ fontSize: 11.5, color: T.green700, fontWeight: 700, marginTop: 6 }}>🟢 Quadro atual comporta a demanda.</div>}
          </div>
        </div>
      </Sec>
    </div>
  );
}
