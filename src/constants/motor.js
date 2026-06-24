export const PESOS_PADRAO = { qualidade: 9, custo: 7, rota: 6, tempo: 6, proximidade: 7, conformidade: 4 };
export const PESOS_CRITERIOS = [
  ["qualidade", "Qualidade técnico-operacional", "aptidão e experiência da equipe para o serviço"],
  ["custo", "Redução de custo", "minimizar o custo estimado da execução"],
  ["rota", "Otimização de rotas", "menor deslocamento e logística mais eficiente"],
  ["tempo", "Redução do tempo de execução", "concluir o campo no menor prazo"],
  ["proximidade", "Proximidade de pessoas/veículos", "priorizar quem está mais perto da obra"],
  ["conformidade", "Conformidade documental/legal", "NRs, ASO, docs — não bloqueia, apenas pondera"],
];
export const CUSTOS_PADRAO = {
  hospedagemPessoaDia: 180,      // R$/pessoa/dia
  alimentacaoPessoaDia: 90,      // R$/pessoa/dia
  kmRodado: 2.8,                 // R$/km
  veiculoLeveDia: 120,           // diária de veículo leve (combustível+manutenção rateada)
  veiculoPesadoDia: 320,         // diária de caminhão/máquina sobre caminhão
  materiaisDiaEquipe: 250,       // consumíveis por dia de equipe (tubos, calda, frascaria...)
  mobilizacaoFixo: 1500,         // custo fixo de mobilização/desmobilização por campanha
  /* depreciação de equipamentos: R$/dia de uso, por tipo (médias) */
  deprMaquinaDia: 850,           // sonda/máquina pesada
  deprEquipamentoDia: 60,        // equipamento de campo (PID, multiparâmetro...)
};
export const UNIDADES_CUSTO = ["R$/km", "R$/m", "R$/ponto", "R$/unid", "R$/poço", "R$/amostra", "R$/dia", "R$/hora", "R$/campanha", "R$/m²", "R$/L"];
export const PRECOS_UNITARIOS_PADRAO = [
  { id: "pu_mob", item: "Mobilização e transporte", unidade: "R$/km", preco: 4.5 },
  { id: "pu_sond", item: "Sondagem (perfuração)", unidade: "R$/m", preco: 145 },
  { id: "pu_poco", item: "Instalação de poços de monitoramento", unidade: "R$/m", preco: 210 },
  { id: "pu_psg", item: "PSG — instalação / desinstalação", unidade: "R$/ponto", preco: 380 },
  { id: "pu_tamp", item: "Tamponamento de pontos", unidade: "R$/m", preco: 65 },
  { id: "pu_voc", item: "Análise química — VOC", unidade: "R$/unid", preco: 95 },
  { id: "pu_svoc", item: "Análise química — SVOC", unidade: "R$/unid", preco: 110 },
  { id: "pu_tph", item: "Análise química — TPH fracionado", unidade: "R$/unid", preco: 130 },
  { id: "pu_metais", item: "Análise química — Metais", unidade: "R$/unid", preco: 85 },
  { id: "pu_pcb", item: "Análise química — PCB", unidade: "R$/unid", preco: 240 },
];
