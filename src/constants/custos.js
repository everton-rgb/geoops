/* ============================================================================
 * MOTOR DE CUSTOS PUROS — constantes (V1.1.25)
 * ============================================================================
 * O GeoópS trabalha com CUSTOS PUROS e a composição é feita pelo próprio motor:
 *   · MO = horas × custo/hora individual (Cadastros → Equipes);
 *   · ativos = (depreciação + manutenção) R$/h POR ATIVO (Eficiência → Depreciação);
 *   · mobilização = km × R$/km (Eficiência → Parâmetros Complementares);
 *   · consumo = itens R$/unidade (Eficiência → Itens de consumo) × quantidade,
 *     via COMPOSIÇÃO por atividade (Eficiência → Composições).
 * A antiga matriz de "custos unitários" compostos saiu do motor (os dados ficam
 * preservados em data.precosUnitarios para o futuro módulo de Orçamentação).
 * ========================================================================== */

export const JORNADA_DIA_H = 8.8; // jornada CLT: 44h/semana ÷ 5 dias

/* categorias dos parâmetros complementares customizados (custos ainda não listados,
   buscados pelo motor conforme a unidade) */
export const CATEGORIAS_PARAM = ["Serviços", "Transporte", "Aéreo", "Uber", "Licenças", "Outros"];

export const UNIDADES_CONSUMO = ["R$/unid", "R$/m", "R$/kg", "R$/L", "R$/saco", "R$/análise", "R$/hora", "R$/dia", "R$/m²"];

/* ===== ITENS DE CONSUMO (custos unitários PUROS, R$/unidade) — pré-carga editável ===== */
export const ITENS_CONSUMO_PADRAO = [
  { id: "ic_analise_voc", item: "Análise química — VOC", unidade: "R$/análise", preco: 95, categoria: "Análises" },
  { id: "ic_analise_svoc", item: "Análise química — SVOC", unidade: "R$/análise", preco: 110, categoria: "Análises" },
  { id: "ic_analise_tph", item: "Análise química — TPH fracionado", unidade: "R$/análise", preco: 130, categoria: "Análises" },
  { id: "ic_analise_metais", item: "Análise química — Metais", unidade: "R$/análise", preco: 85, categoria: "Análises" },
  { id: "ic_analise_pcb", item: "Análise química — PCB", unidade: "R$/análise", preco: 240, categoria: "Análises" },
  { id: "ic_bailer", item: "Bailer descartável", unidade: "R$/unid", preco: 18, categoria: "Consumíveis" },
  { id: "ic_frascaria", item: "Frascaria / kit de amostragem", unidade: "R$/unid", preco: 25, categoria: "Consumíveis" },
  { id: "ic_luvas_epi", item: "Luvas / EPI descartável (kit)", unidade: "R$/unid", preco: 12, categoria: "Consumíveis" },
  { id: "ic_bentonita", item: "Bentonita", unidade: "R$/saco", preco: 45, categoria: "Materiais de poço" },
  { id: "ic_calda_cimento", item: "Calda de cimento", unidade: "R$/saco", preco: 38, categoria: "Materiais de poço" },
  { id: "ic_pre_filtro", item: "Pré-filtro (areia selecionada)", unidade: "R$/saco", preco: 32, categoria: "Materiais de poço" },
  { id: "ic_tubo_geo_2", item: "Tubo geomecânico 2\"", unidade: "R$/m", preco: 42, categoria: "Materiais de poço" },
  { id: "ic_tubo_geo_4", item: "Tubo geomecânico 4\"", unidade: "R$/m", preco: 78, categoria: "Materiais de poço" },
  { id: "ic_tampa_poco", item: "Tampa de poço de monitoramento", unidade: "R$/unid", preco: 55, categoria: "Materiais de poço" },
  { id: "ic_camara_calcada", item: "Câmara de calçada", unidade: "R$/unid", preco: 120, categoria: "Materiais de poço" },
  { id: "ic_remediador", item: "Produto remediador", unidade: "R$/kg", preco: 28, categoria: "Remediação" },
  { id: "ic_agua", item: "Água (caminhão / abastecimento)", unidade: "R$/L", preco: 0.08, categoria: "Remediação" },
  { id: "ic_mangueira", item: "Mangueiras / conexões", unidade: "R$/m", preco: 9, categoria: "Consumíveis" },
  { id: "ic_bomba_pneumatica", item: "Bomba pneumática", unidade: "R$/unid", preco: 850, categoria: "Equipamentos de poço" },
  { id: "ic_bomba_hora", item: "Bomba — hora de uso/aluguel", unidade: "R$/hora", preco: 22, categoria: "Locações" },
  { id: "ic_compressor_hora", item: "Compressor — hora de uso/aluguel", unidade: "R$/hora", preco: 35, categoria: "Locações" },
  { id: "ic_maquina_hora", item: "Hora de máquina (locada)", unidade: "R$/hora", preco: 180, categoria: "Locações" },
  { id: "ic_aluguel_equip_hora", item: "Hora de aluguel de equipamento", unidade: "R$/hora", preco: 40, categoria: "Locações" },
  { id: "ic_combustivel", item: "Combustível (diesel/gasolina)", unidade: "R$/L", preco: 6.2, categoria: "Combustível" },
  { id: "ic_liner", item: "Liner de amostragem", unidade: "R$/unid", preco: 30, categoria: "Consumíveis" },
];

/* ===== COMPOSIÇÕES POR ATIVIDADE — consumíveis por UNIDADE de atividade =====
   Pré-carga SENSATA marcada "revisar: true" (a equipe ajusta itens e quantidades no grid).
   Pessoas vêm do Dimensionamento; máquinas/veículos, da alocação real da OS. */
export const COMPOSICOES_PADRAO = {
  sond_hollow: { consumo: [{ itemId: "ic_combustivel", qtdPorUnid: 1.2 }, { itemId: "ic_bentonita", qtdPorUnid: 0.15 }, { itemId: "ic_luvas_epi", qtdPorUnid: 0.1 }], revisar: true },
  sond_caminhao: { consumo: [{ itemId: "ic_combustivel", qtdPorUnid: 1.5 }, { itemId: "ic_bentonita", qtdPorUnid: 0.15 }], revisar: true },
  sond_liner: { consumo: [{ itemId: "ic_liner", qtdPorUnid: 1 }, { itemId: "ic_combustivel", qtdPorUnid: 1 }], revisar: true },
  sond_dualtube: { consumo: [{ itemId: "ic_liner", qtdPorUnid: 1 }, { itemId: "ic_combustivel", qtdPorUnid: 1.2 }], revisar: true },
  sond_injecao: { consumo: [{ itemId: "ic_combustivel", qtdPorUnid: 1.2 }, { itemId: "ic_mangueira", qtdPorUnid: 0.3 }], revisar: true },
  poco_monit: { consumo: [{ itemId: "ic_tubo_geo_2", qtdPorUnid: 1 }, { itemId: "ic_pre_filtro", qtdPorUnid: 0.4 }, { itemId: "ic_bentonita", qtdPorUnid: 0.3 }, { itemId: "ic_calda_cimento", qtdPorUnid: 0.2 }], revisar: true },
  acabamento_poco: { consumo: [{ itemId: "ic_tampa_poco", qtdPorUnid: 1 }, { itemId: "ic_camara_calcada", qtdPorUnid: 1 }, { itemId: "ic_calda_cimento", qtdPorUnid: 0.5 }], revisar: true },
  poco_vapor: { consumo: [{ itemId: "ic_tubo_geo_2", qtdPorUnid: 1 }, { itemId: "ic_pre_filtro", qtdPorUnid: 0.3 }], revisar: true },
  bailer: { consumo: [{ itemId: "ic_bailer", qtdPorUnid: 1 }, { itemId: "ic_frascaria", qtdPorUnid: 1 }, { itemId: "ic_luvas_epi", qtdPorUnid: 0.5 }], revisar: true },
  bx_vazao: { consumo: [{ itemId: "ic_frascaria", qtdPorUnid: 1 }, { itemId: "ic_mangueira", qtdPorUnid: 0.5 }, { itemId: "ic_luvas_epi", qtdPorUnid: 0.5 }], revisar: true },
  amostr_vapor: { consumo: [{ itemId: "ic_frascaria", qtdPorUnid: 1 }, { itemId: "ic_bomba_hora", qtdPorUnid: 1 }], revisar: true },
  injecao: { consumo: [{ itemId: "ic_remediador", qtdPorUnid: 20 }, { itemId: "ic_agua", qtdPorUnid: 150 }, { itemId: "ic_compressor_hora", qtdPorUnid: 1.5 }], revisar: true },
  injecao_montagem: { consumo: [{ itemId: "ic_mangueira", qtdPorUnid: 2 }, { itemId: "ic_luvas_epi", qtdPorUnid: 0.5 }], revisar: true },
  remediacao_inst: { consumo: [{ itemId: "ic_mangueira", qtdPorUnid: 3 }, { itemId: "ic_bomba_pneumatica", qtdPorUnid: 0.1 }], revisar: true },
  remediacao_manut: { consumo: [{ itemId: "ic_luvas_epi", qtdPorUnid: 1 }, { itemId: "ic_mangueira", qtdPorUnid: 0.5 }], revisar: true },
  remediacao_oper: { consumo: [{ itemId: "ic_combustivel", qtdPorUnid: 2 }], revisar: true },
  tamponamento: { consumo: [{ itemId: "ic_bentonita", qtdPorUnid: 0.5 }, { itemId: "ic_calda_cimento", qtdPorUnid: 0.3 }], revisar: true },
  lab_cromato: { consumo: [{ itemId: "ic_analise_voc", qtdPorUnid: 1 }], revisar: true },
  escavacao: { consumo: [{ itemId: "ic_combustivel", qtdPorUnid: 3 }], revisar: true },
  soil_mixing: { consumo: [{ itemId: "ic_remediador", qtdPorUnid: 15 }, { itemId: "ic_combustivel", qtdPorUnid: 2.5 }], revisar: true },
};
