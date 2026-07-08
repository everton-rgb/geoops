export const PERFIS = [
  { id: "master", label: "Master" },
  { id: "adm", label: "Administrativo" },
  { id: "gestao", label: "Gestão" },
];
export const PAPEIS = [
  { id: "sondador", label: "Sondador" },
  { id: "auxiliar", label: "Auxiliar de campo" },
  { id: "tecnico", label: "Técnico de campo" },
  { id: "tecnico_esp", label: "Técnico especialista" },
  { id: "amostrador", label: "Amostrador / coletor" },
  { id: "topografo", label: "Topógrafo" },
  { id: "operador", label: "Operador de equipamento" },
  { id: "encarregado", label: "Encarregado de campo" },
];
export const DOMINIOS_EDICAO = {
  colab: "RH / Colaboradores", apt: "Matriz de Aptidões", sms: "SMS & NRs / Docs Obrigatórios",
  ct: "Contratos", cond: "Condicionantes", tap: "TAPs (Holmes)", planos: "Planejamento", prog: "Operacional (campo)",
  regras: "Regras de Equipe", maq: "Máquinas", frota: "Frota", equip: "Equipamentos", loc: "Localização", custos: "Eficiência",
};
export const ABA_DOMINIO = {
  colab: "colab", apt: "apt", sms: "sms", docs: "sms", cli: "ct", ct: "ct", cond: "cond", comercial: "ct",
  tap: "tap", prog: "prog", regras: "custos", maq: "maq", frota: "frota", equip: "equip",
  loc: "loc", disp: "colab", motor: "planos", dash: null, custos: "custos", gerente: null, simular: "planos", inteligencia: "planos", planos: "planos", autoriz: null,
};
export const ACESSOS = [
  /* Acesso total — Diretoria (CEO, CFO, COO) */
  { id: "ceo", aba: "Diretor Presidente — CEO", dom: "*", senha: "147", tipo: "master", responsavel: "CEO" },
  { id: "cfo", aba: "Diretor Financeiro — CFO", dom: "*", senha: "maio", tipo: "master", responsavel: "CFO" },
  { id: "coo", aba: "Diretora de Operações — COO", dom: "*", senha: "thati", tipo: "master", responsavel: "COO" },
  /* Grandes Áreas — matrizes de alimentação do sistema */
  { id: "equipe", aba: "Equipes", dom: "colab", senha: "aline", tipo: "alimentador", responsavel: "Aline" },
  { id: "qualidade", aba: "Qualidade", dom: "apt", senha: "luciane", tipo: "alimentador", responsavel: "Luciane" },
  { id: "sms", aba: "Saúde e Segurança", dom: "sms", senha: "maira", tipo: "alimentador", responsavel: "Maíra" },
  { id: "comercial", aba: "Comercial", doms: ["ct", "cond", "tap"], dom: "ct", senha: "matheus", tipo: "alimentador", responsavel: "Matheus" },
  { id: "gestaoop", aba: "Gestor de Operações", dom: "planos", senha: "andre", tipo: "alimentador", responsavel: "Gestor de Operações" },
  { id: "coordop", aba: "Gerente de Operações", dom: "prog", senha: "coord", tipo: "alimentador", responsavel: "Gerente de Operações" },
  { id: "estrategista", aba: "Estrategista de Operações", dom: "ia_chat", senha: "estrategia", tipo: "alimentador", responsavel: "Estrategista (chat IA)" },
  { id: "eficiencia", aba: "Eficiência Corporativa", dom: "regras", senha: "jony", tipo: "alimentador", responsavel: "Jony" },
  { id: "frotas", aba: "Frotas", dom: "frota", senha: "fran", tipo: "alimentador", responsavel: "Fran" },
  { id: "maqsis", aba: "Máquinas & Sistemas", dom: "maq", senha: "fernando", tipo: "alimentador", responsavel: "Fernando" },
  { id: "equip", aba: "Equipamentos", dom: "equip", senha: "0", tipo: "alimentador", responsavel: "Equipamentos" },
  /* Gerentes de carteira — Gerentes de Projetos (visualização/aprovação/solicitação) */
  { id: "ger_gc01", aba: "Gerente de Projetos GC01", dom: null, senha: "gc01", tipo: "gerente", carteira: "GC01" },
  { id: "ger_gc02", aba: "Gerente de Projetos GC02", dom: null, senha: "gc02", tipo: "gerente", carteira: "GC02" },
  { id: "ger_gc03", aba: "Gerente de Projetos GC03", dom: null, senha: "gc03", tipo: "gerente", carteira: "GC03" },
  { id: "ger_gc04", aba: "Gerente de Projetos GC04", dom: null, senha: "gc04", tipo: "gerente", carteira: "GC04" },
  { id: "ger_gc05", aba: "Gerente de Projetos GC05", dom: null, senha: "gc05", tipo: "gerente", carteira: "GC05" },
  { id: "ger_gc06", aba: "Gerente de Projetos GC06", dom: null, senha: "gc06", tipo: "gerente", carteira: "GC06" },
  { id: "ger_gc07", aba: "Gerente de Projetos GC07", dom: null, senha: "gc07", tipo: "gerente", carteira: "GC07" },
  { id: "ger_gc08", aba: "Gerente de Projetos GC08", dom: null, senha: "gc08", tipo: "gerente", carteira: "GC08" },
];
export const PAPEL_COMPETENCIAS = {
  sondador: ["esteira_geoprobe", "esteira_biosonda", "sond_caminhao", "sond_liner", "sond_dualtube", "sond_hollow", "sond_injecao", "poco_monit", "tamponamento"],
  amostrador: ["bx_vazao", "bailer", "multiparam", "pid", "nivel_dagua", "amostr_vapor", "psg", "descricao_solo"],
  tecnico: ["descricao_solo", "remediacao_oper", "remediacao_inst", "injecao", "injecao_montagem", "colorimetro", "poco_vapor", "multiparam"],
  tecnico_esp: ["mip_hpt", "oip_hpt", "lab_cromato", "raio_influencia", "soil_mixing"],
  topografo: ["topo_rtk", "topo_estacao"],
  operador: ["escavacao", "soil_mixing", "sond_caminhao", "esteira_geoprobe"],
  encarregado: ["desmont_ind", "remediacao_inst", "remediacao_manut"],
  auxiliar: [], // auxiliar não exige competência específica
};
export const PAPEL_PARA_CARGO = {
  sondador: "Operador de Sondagem",
  auxiliar: "Auxiliar de Operações",
  tecnico: "Técnico de Operações",
  tecnico_esp: "Especialista Técnico de Operações",
  amostrador: "Técnico de Operações",
  topografo: "Técnico de Operações",
  operador: "Operador de Sondagem",
  encarregado: "Encarregado de Operações",
};
