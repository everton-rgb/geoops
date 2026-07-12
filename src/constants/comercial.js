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
/* Só 3 estados: o sistema (Inteligência, novas TAPs, contadores) "se preocupa" apenas com os VIGENTES.
   Vencidos e cancelados ficam no cadastro como histórico, fora das leituras. */
export const STATUS_CONTRATO = ["Vigente", "Vencido", "Cancelado"];
/* migração de status antigos → categorias atuais */
export const MIGRA_STATUS_CONTRATO = { "Em mobilização": "Vigente", "Suspenso": "Vencido", "Encerrado": "Vencido" };
/* contrato considerado EM LEITURA pelo sistema */
export const ctVigente = (ct) => !!ct && (ct.statusCt || "Vigente") === "Vigente" && ct.ativo !== false;
export const TIPOS_AUTORIZACAO = [
  { id: "hora_extra", label: "Liberação de hora extra", icone: "⏱", temValor: true, temData: true, unidadeValor: "horas" },
  { id: "veiculo", label: "Liberação de veículo", icone: "🚗", temValor: false, temData: true },
  { id: "hotel", label: "Liberação de hotel / hospedagem", icone: "🏨", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "uber", label: "Liberação de Uber / transporte por app", icone: "🚕", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "passagem", label: "Liberação de passagem aérea", icone: "✈️", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "ferramentas", label: "Ferramentas / material de campo", icone: "🧰", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "combustivel", label: "Combustível", icone: "⛽", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "carro_alugado", label: "Carro alugado", icone: "🚙", temValor: true, temData: true, unidadeValor: "R$" },
];
