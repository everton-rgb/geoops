export const DOCS_CLIENTE = [
  { id: "pgr", label: "PGR" },
  { id: "pcmso", label: "PCMSO" },
  { id: "ppeob", label: "PPEOB" },
  { id: "pca", label: "PCA" },
  { id: "ppr", label: "PPR" },
  { id: "ltcat", label: "LTCAT" },
  { id: "lip", label: "LIP" },
  { id: "aet", label: "AET" },
];
export const SEGMENTOS_BASE = ["Óleo & Gás", "Indústria química", "Varejo de combustíveis", "Indústria geral", "Imobiliário / Loteamentos", "Mineração", "Público / Governo"];
export const STATUS_CONTRATO = ["Vigente", "Em mobilização", "Suspenso", "Encerrado"];
export const TIPOS_AUTORIZACAO = [
  { id: "hora_extra", label: "Liberação de hora extra", icone: "⏱", temValor: true, temData: true, unidadeValor: "horas" },
  { id: "veiculo", label: "Liberação de veículo", icone: "🚗", temValor: false, temData: true },
  { id: "hotel", label: "Liberação de hotel / hospedagem", icone: "🏨", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "uber", label: "Liberação de Uber / transporte por app", icone: "🚕", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "passagem", label: "Liberação de passagem aérea", icone: "✈️", temValor: true, temData: true, unidadeValor: "R$" },
];
