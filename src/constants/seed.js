/* ============================================================================
   GeoópS — Bases de demonstração (dados FICTÍCIOS p/ testes)
   ----------------------------------------------------------------------------
   EXEMPLO       = base mínima (6 pessoas) — usada no botão "Carregar exemplo".
   EXEMPLO_BASE  = base de TESTES rica, gerada por código abaixo
                   (100 colaboradores, 15 máquinas, 40 veículos, 10 clientes,
                    20 contratos, 40 TAPs cobrindo todas as fases).
   Os formatos de cada entidade replicam EXATAMENTE os campos lidos por App.jsx
   e pelos formulários (ColabForm, MaqForm, VeicForm, EquipForm, NovaTapForm…).
   ============================================================================ */

/* Estado inicial ZERADO — remove todos os dados operacionais mas preserva a estrutura
   (usado pelo botão "🧹 Base limpa" para o usuário iniciar do zero). */
export const BASE_LIMPA = {
  colaboradores: [], clientes: [], contratos: [], taps: [], maquinas: [], frota: [], equipamentos: [],
  planos: {}, programacoes: {}, ordens: {}, preAgendamentos: {}, apontamentos: {}, autorizacoes: [],
  travas: { pessoa: {}, maquina: {}, frota: {}, equipamento: {} }, disponibilidade: {},
  aptidoes: {}, sms: {}, docsCnpj: {}, condicionantes: {}, regrasEquipe: {}, equipPorAtividade: {},
  servicosCustom: [], servicosOcultos: [], historicoInteligencia: [], atualizacoes: {},
  planosRemovidos: [], usuarios: [], logins: [],
};

export const EXEMPLO = {
  colaboradores: [
    { mat: "GEO-0001", nome: "Diretor Sócio (exemplo)", cargo: "Diretor de Operações", funcao: "Sócio-diretor", admissao: "2010-01-04", regiao: "Curitiba (Matriz)", custoTotal: 38000, salarioBase: 0, horasExtrasTri: 0, encargosAnual: 96000, retiradaSocio: 32000, ehSocio: true, refMes: "2026-05", status: "Ativo" },
    { mat: "GEO-0012", nome: "Carlos Andrade", cargo: "Operador de Sondagem", funcao: "Operador de sonda direct push e rotativa", admissao: "2018-03-12", regiao: "Curitiba (Matriz)", telefone: "(41) 99812-3344", custoTotal: 7420.6, salarioBase: 4200, horasExtrasTri: 2850, encargosAnual: 38760, ehSocio: false, refMes: "2026-05", status: "Ativo" },
    { mat: "GEO-0027", nome: "Juliana Prates", cargo: "Geólogo", funcao: "Geóloga de campo — alta resolução e amostragem", admissao: "2020-08-03", regiao: "Curitiba (Matriz)", telefone: "(41) 99765-2210", custoTotal: 14880, refMes: "2026-05", status: "Ativo" },
    { mat: "GEO-0034", nome: "Marcos Vinícius Lopes", cargo: "Auxiliar de Operações", funcao: "Auxiliar de sondagem e montagem de poços", admissao: "2022-01-17", regiao: "Interior PR", custoTotal: 4510.3, refMes: "2026-05", status: "Ativo" },
    { mat: "GEO-0041", nome: "Renata Cordeiro", cargo: "Técnico de Operações", funcao: "Técnica de coleta de água e medições", admissao: "2021-06-28", regiao: "Santa Catarina", custoTotal: 5620, refMes: "2026-04", status: "Férias" },
    { mat: "GEO-0048", nome: "Edson Tavares", cargo: "Motorista", funcao: "Motorista de caminhão com prancha (Munck)", admissao: "2019-11-04", regiao: "Curitiba (Matriz)", custoTotal: 6710.5, refMes: "2026-05", status: "Ativo" },
  ],
  aptidoes: {
    "GEO-0012": { cnhCat: "D", cnhVal: "2027-02-10", cursos: [{ nome: "Operação de sonda rotativa", inst: "SENAI-PR", ano: "2019" }], treinos: [{ nome: "Direct push — amostragem", nivel: "Avançado" }], matriz: { esteira_geoprobe: "esp", sond_caminhao: "sr", injecao: "pl", descricao_solo: "sr", tamponamento: "pl", esteira_biosonda: "pl" }, restricoes: ["Sem restrições — viaja para qualquer região"], obs: "" },
    "GEO-0027": { cnhCat: "B", cnhVal: "2026-07-02", cursos: [{ nome: "Hidrogeologia aplicada", inst: "UFPR", ano: "2021" }], treinos: [{ nome: "MIP/HPT — interpretação", nivel: "Avançado" }], matriz: { mip_hpt: "sr", oip_hpt: "sr", bx_vazao: "pl", poco_monit: "pl", descricao_solo: "esp", multiparam: "pl", raio_influencia: "sr" }, restricoes: ["Sem restrições — viaja para qualquer região"], obs: "" },
    "GEO-0048": { cnhCat: "E", cnhVal: "2026-06-25", cursos: [], treinos: [{ nome: "Operação de Munck", nivel: "Certificado" }], matriz: { nivel_dagua: "jr" }, restricoes: ["Viaja apenas dentro da região de contratação"], obs: "Preferência por retorno diário à base." },
  },
  sms: {
    "GEO-0012": { nr06: { val: "2027-01-10" }, nr33: { val: "2026-05-30" }, nr35: { val: "2026-07-05" }, dirdef: { val: "2026-12-01" }, nr10: { na: true }, fittest: { val: "2026-06-30" } },
    "GEO-0027": { nr35: { val: "2026-06-28" }, dirdef: { na: true }, fittest: { val: "2026-09-15" } },
    "GEO-0048": { nr06: { val: "2026-10-02" }, dirdef: { val: "2026-06-15" }, nr35: { val: "2026-04-12" } },
  },
  maquinas: [
    { cod: "GEO-0023", marca: "Geoprobe", modelo: "7822DT", horimetro: 251, ultRevisao: 250, proxRevisao: 1000, plataforma: "Esteira", tipos: ["dp", "dual"], altaRes: ["MIP", "HPT"], peso: 4300, comprimento: 4.3, largura: 1.8, altAberta: 4.75, altFechada: 2.53, retracao: 21772, downForce: 16329, guincho: 800, torqueHollow: 5423, profMaxDP: 67, consumo: 30, veiculo: "", status: "Em campo", local: "Cliente — Ponta Grossa/PR" },
    { cod: "GEO-0003", marca: "Sondeq", modelo: "Sonda", horimetro: 3000, ultRevisao: 2850, proxRevisao: 3850, plataforma: "Caminhão", tipos: ["rotativa"], altaRes: [], peso: 2500, comprimento: 12, largura: 2.5, altAberta: 3.5, altFechada: 2.6, retracao: 8000, downForce: 6000, guincho: "", torqueHollow: 4000, profMaxDP: 35, consumo: 15, veiculo: "QXP-4D21", status: "Disponível", local: "Sede" },
    { cod: "GEO-0031", marca: "SONDEQ", modelo: "SDH-200", horimetro: 4012, ultRevisao: 3500, proxRevisao: 4000, plataforma: "Caminhão", tipos: ["helicoidal", "hollow"], altaRes: [], peso: 7200, comprimento: 7.8, largura: 2.5, altAberta: 6.4, altFechada: 3.6, retracao: 10800, downForce: 8400, guincho: 2000, torqueHollow: 6100, profMaxDP: 25, consumo: 21, veiculo: "RTA-7F88", status: "Em manutenção", local: "Oficina — S. J. dos Pinhais/PR" }
  ],
  frota: [
    { veiculo: "VW 24.280 Constellation", tipo: "Caminhão médio", cnh: "E", placa: "QXP-4D21", anoFab: 2019, funcao: "Transporte de máquinas de sondagem", capCargaKg: 12000, capPessoas: 3, implemento: "Prancha", capImplemento: 9000, kmAtual: 182500, proxRevKm: 190000, status: "Disponível", localAtual: "Curitiba (Matriz)", dataLocal: "2026-06-10" },
    { veiculo: "MB Atego 2426", tipo: "Caminhão médio", cnh: "E", placa: "RTA-7F88", anoFab: 2017, funcao: "Movimentação de cargas e poços", capCargaKg: 10000, capPessoas: 3, implemento: "Munck", capImplemento: 6500, kmAtual: 243100, proxRevKm: 244000, status: "Em manutenção", localAtual: "S. J. dos Pinhais/PR", dataLocal: "2026-06-08" },
    { veiculo: "Toyota Hilux 4x4", tipo: "Camionete leve", cnh: "B", placa: "BCK-9A12", anoFab: 2022, funcao: "Apoio de equipe de campo", capCargaKg: 1000, capPessoas: 5, implemento: "", capImplemento: "", kmAtual: 96400, proxRevKm: 100000, status: "Em campo", localAtual: "Ponta Grossa/PR", dataLocal: "2026-06-10" },
  ],
  equipamentos: [
    { cod: "EQP-014", tipo: "Analisador multiparâmetros (pH/OD/cond/ORP)", modelo: "Horiba U-52", specs: "pH 0–14 · OD 0–50 mg/L · cond 0–100 mS/cm", local: "Em campo", comQuem: "GEO-0041", ultCalib: "2026-01-20", valCalib: "2026-07-20", periodoCalib: 6, estado: "Operacional" },
    { cod: "EQP-022", tipo: "Analisador de gases VOC — PID", modelo: "MiniRAE 3000", specs: "0–15.000 ppm · lâmpada 10,6 eV", local: "Almoxarifado", comQuem: "", ultCalib: "2025-12-15", valCalib: "2026-06-15", periodoCalib: 6, estado: "Operacional" },
  ],
  clientes: [
    { nome: "Petrobras — REPAR", cnpj: "33.000.167/0010-29", segmento: "Óleo & Gás", cidade: "Araucária/PR", contato: "Eng. Marcos Lima", foneEmail: "(41) 99876-2210 · marcos.lima@petrobras.com.br", exigencias: "Integração obrigatória 8h · Fit Test para áreas com H2S · APR diária", status: "Ativo" },
    { nome: "Ambev — Filial PR", cnpj: "07.526.557/0021-30", segmento: "Indústria geral", cidade: "Curitiba/PR", contato: "Ana Paula Souza", foneEmail: "(41) 3322-1180", exigencias: "NR-35 vigente · veículos com checklist de acesso", status: "Ativo" },
    { nome: "Rede Sol Combustíveis", cnpj: "81.444.219/0001-05", segmento: "Varejo de combustíveis", cidade: "Ponta Grossa/PR", contato: "Carlos Mendes", foneEmail: "carlos@redesol.com.br", exigencias: "", status: "Ativo" },
  ],
  contratos: [
    { cliente: "Petrobras — REPAR", contrato: "CT-2025-118", cnpj: "33.000.167/0010-29", localidade: "Araucária", estado: "PR", projeto: "Remediação Área de Tancagem", servico: "Alta resolução (MIP/HPT) + injeção de remediadores", valorIdgeo: 1480000, valorContrato: 1395000, statusCt: "Vigente", docs: {} },
    { cliente: "Ambev — Filial PR", contrato: "CT-2026-031", cnpj: "07.526.557/0021-30", localidade: "Curitiba", estado: "PR", projeto: "Investigação confirmatória", servico: "Sondagens e amostragem de solo e água", valorIdgeo: 312000, valorContrato: 298500, statusCt: "Vigente", docs: {} },
    { cliente: "Rede Sol Combustíveis", contrato: "CT-2026-044", cnpj: "81.444.219/0001-05", localidade: "Ponta Grossa", estado: "PR", projeto: "Posto BR-376 — Fase II", servico: "Monitoramento semestral + instalação de poços", valorIdgeo: 96000, valorContrato: 89000, statusCt: "Vigente", docs: {} },
  ],
  taps: [
    { idgeo: "PR26012", projeto: "REPAR — Remediação Área de Tancagem (Fase II)", carteira: "GC-05", gerente: "NICOLAS MOURA RODRIGUES", gerenteEmail: "", cliente: "Petrobras — REPAR", cnpj: "33.000.167/0010-29", cidade: "Araucária", uf: "PR", contato: "Eng. Marcos Lima / (41) 99876-2210", tipoServico: ["PROJETO DE ALOCAÇÃO DE SISTEMA DE REMEDIAÇÃO", "MONITORAMENTO"], valor: 1395000, margem: 28.4, dataCriacao: "2026-05-20", entradaCampo: "2026-06-22", mobilizacao: "2026-06-15", entregaRelatorio: "2026-10-30", prazoIntegracao: "2026-06-10", prazoDocsMob: "2026-06-08", prazoPlanoTrab: "2026-06-12", kickoff: "2026-05-28", urgente15: true, expectativa: "", riscos: "Janelas de parada da unidade", restricoes: "Trabalho noturno proibido · PT diária", premOper: "Equipe alocada full-time durante a campanha", premTec: "MIP/HPT com lab móvel", premNeg: "", premEstr: "", metas: "", multas: "", statusTap: "Aguardando Plano de Trabalho" },
    { idgeo: "PR26031", projeto: "Posto BR-376 — Monitoramento Semestral", carteira: "GC-03", gerente: "PHILLIPE VON BORRIES", gerenteEmail: "", cliente: "Rede Sol Combustíveis", cnpj: "81.444.219/0001-05", cidade: "Ponta Grossa", uf: "PR", contato: "Carlos Mendes / carlos@redesol.com.br", tipoServico: ["MONITORAMENTO", "RELATÓRIO"], valor: 89000, margem: 31.2, dataCriacao: "2026-06-01", entradaCampo: "2026-07-01", mobilizacao: "2026-06-25", entregaRelatorio: "2026-08-15", prazoIntegracao: "", prazoDocsMob: "2026-06-20", prazoPlanoTrab: "", kickoff: "", urgente15: false, expectativa: "", riscos: "Não se aplica", restricoes: "Execução sem interdição da pista", premOper: "", premTec: "Baixa vazão em 12 poços", premNeg: "", premEstr: "", metas: "", multas: "", statusTap: "Aguardando Plano de Trabalho" },
  ],
  programacoes: {
    "PR26031": { local: "Ponta Grossa", uf: "PR", inicioPrev: "2026-07-01", fimPrev: "2026-07-04", prioridade: "Média", equipes: 1, obs: "Campanha de monitoramento semestral — 12 poços.", status: "Programado", atividades: [
      { id: "nivel_dagua", qtd: 12, unid: "poços", obs: "" },
      { id: "bx_vazao", qtd: 12, unid: "amostras", obs: "Purga de baixa vazão" },
      { id: "multiparam", qtd: 12, unid: "pontos", obs: "" },
    ] },
  },
  docsCnpj: {
    "33000167001029": { pgr: { val: "2026-11-30" }, pcmso: { val: "2026-08-15" }, ppeob: { val: "2026-06-25" }, pca: { na: true }, ppr: { val: "2026-05-10" }, ltcat: { val: "2027-02-01" }, lip: { na: true }, aet: { val: "2026-09-09" } },
    "07526557002130": { pgr: { val: "2027-01-20" }, pcmso: { val: "2026-07-02" } },
  },
  condicionantes: {
    "CT-2025-118": { prazoIni: "2026-06-22", prazoFim: "2026-09-30", condicoes: "Trabalho noturno proibido · acesso mediante PT diária · janelas de parada da unidade definidas pelo fiscal", fiscal: "Eng. Marcos Lima", fiscalFone: "(41) 99876-2210", fiscalEmail: "marcos.lima@petrobras.com.br" },
    "CT-2026-044": { prazoIni: "2026-07-01", prazoFim: "2026-12-20", condicoes: "Execução sem interdição da pista de abastecimento", fiscal: "Carlos Mendes", fiscalFone: "", fiscalEmail: "carlos@redesol.com.br" },
  },
  disponibilidade: {
    "GEO-0012": { tempoMaxCampo: 15, emCampoDesde: "2026-05-28", localAtual: "Ponta Grossa/PR", fonteLocal: "Ponto eletrônico", dataLocal: "2026-06-10", ferias: [], afastamentos: [] },
    "GEO-0027": { tempoMaxCampo: 20, emCampoDesde: "", localAtual: "Curitiba (Matriz)", fonteLocal: "Ponto eletrônico", dataLocal: "2026-06-10", ferias: [{ ini: "2026-07-13", fim: "2026-08-01" }], afastamentos: [] },
    "GEO-0041": { tempoMaxCampo: 15, emCampoDesde: "", localAtual: "Florianópolis/SC", fonteLocal: "Manual", dataLocal: "2026-06-05", ferias: [{ ini: "2026-06-01", fim: "2026-06-20" }], afastamentos: [] },
    "GEO-0034": { tempoMaxCampo: 12, emCampoDesde: "", localAtual: "Guarapuava/PR", fonteLocal: "GPS veículo", dataLocal: "2026-06-09", ferias: [], afastamentos: [{ tipo: "Acidente", ini: "2026-04-02", fim: "2026-04-25" }] },
  },
};

/* ============================================================================
   GERADOR DA BASE DE TESTES (EXEMPLO_BASE)
   Tudo determinístico (PRNG com semente fixa) para builds reprodutíveis.
   ============================================================================ */

/* PRNG determinístico (mulberry32) — evita Math.random p/ reprodutibilidade */
function mkRand(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mkRand(20260624);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const randint = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pad3 = (n) => String(n).padStart(3, "0");
const round2 = (n) => Math.round(n * 100) / 100;
/* data ISO somando dias a uma base */
function isoAdd(baseISO, days) {
  const d = new Date(baseISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const HOJE = "2026-06-24";

/* ---- Listas de apoio ---- */
const PRIMEIROS = ["Carlos", "Rafael", "Bruno", "Anderson", "Diego", "Marcos", "Tiago", "Felipe", "Juliana", "Patrícia", "Fernanda", "Lucas", "Gabriel", "Rodrigo", "André", "Vinícius", "Mateus", "Eduardo", "Renata", "Camila", "Aline", "Larissa", "Henrique", "Gustavo", "Thiago", "Paulo", "Ricardo", "Sérgio", "Daniel", "Leonardo", "Mariana", "Bianca", "Vanessa", "Roberto", "Cláudio", "Júlio", "Otávio", "Davi", "Igor", "Caio"];
const SOBRENOMES = ["Nunes", "Lima", "Rocha", "Gomes", "Souza", "Alves", "Martins", "Costa", "Pereira", "Carvalho", "Ribeiro", "Moraes", "Andrade", "Ferreira", "Tavares", "Prates", "Cordeiro", "Lopes", "Mendes", "Barbosa", "Cardoso", "Teixeira", "Pinto", "Moreira", "Cunha", "Dias", "Freitas", "Araújo", "Vieira", "Monteiro"];
const REGIOES = ["Curitiba", "Ponta Grossa", "Londrina", "Maringá", "Joinville", "Florianópolis", "São Paulo", "Campinas", "Porto Alegre", "Rio de Janeiro"];
const STATUS_COLAB_W = ["Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Férias", "Afastado"];

/* cargos coerentes com PAPEL_PARA_CARGO / REGRAS_PADRAO do App */
const CARGOS_APTOS = [
  { cargo: "Operador de Sondagem", papel: "sondador" },
  { cargo: "Auxiliar de Operações", papel: "auxiliar" },
  { cargo: "Técnico de Operações", papel: "tecnico" },
  { cargo: "Especialista Técnico de Operações", papel: "tecnico_esp" },
  { cargo: "Técnico de Operações", papel: "amostrador" },
  { cargo: "Operador de Sondagem", papel: "operador" },
  { cargo: "Encarregado de Operações", papel: "encarregado" },
];
/* competências de cada papel (espelha PAPEL_COMPETENCIAS do App) */
const PAPEL_COMPS = {
  sondador: ["esteira_geoprobe", "esteira_biosonda", "sond_caminhao", "sond_liner", "sond_dualtube", "sond_hollow", "sond_injecao", "poco_monit", "tamponamento"],
  amostrador: ["bx_vazao", "bailer", "multiparam", "pid", "nivel_dagua", "amostr_vapor", "psg", "descricao_solo"],
  tecnico: ["descricao_solo", "remediacao_oper", "remediacao_inst", "injecao", "injecao_montagem", "colorimetro", "poco_vapor", "multiparam"],
  tecnico_esp: ["mip_hpt", "oip_hpt", "lab_cromato", "raio_influencia", "soil_mixing"],
  topografo: ["topo_rtk", "topo_estacao"],
  operador: ["escavacao", "soil_mixing", "sond_caminhao", "esteira_geoprobe"],
  encarregado: ["desmont_ind", "remediacao_inst", "remediacao_manut"],
  auxiliar: [],
};
const CNH_BY_CARGO = { "Operador de Sondagem": ["D", "E", "C"], "Encarregado de Operações": ["D", "E"], "Especialista Técnico de Operações": ["B", "AB"], "Técnico de Operações": ["B", "AB", "C"], "Auxiliar de Operações": ["B", "AB", "Não possui"] };
const NIVEIS_BONS = ["sr", "esp", "sr", "pl"];
const NIVEIS_BAIXOS = ["jr", "na", "jr"];
const SMS_IDS = ["nr06", "nr10", "nr33", "nr35", "dirdef", "fittest"];

/* ---- Clientes (10) ---- */
const CLIENTES_DEF = [
  { nome: "VIBRA Energia S.A", cnpj: "16.374.189/0007-44", seg: "Óleo & Gás", cidade: "Curitiba", uf: "PR" },
  { nome: "Raízen Combustíveis", cnpj: "58.649.675/0006-53", seg: "Varejo de combustíveis", cidade: "Santos", uf: "SP" },
  { nome: "Ipiranga Postos", cnpj: "33.337.122/0041-08", seg: "Varejo de combustíveis", cidade: "Ponta Grossa", uf: "PR" },
  { nome: "Petrobras — REPAR", cnpj: "33.000.167/0010-29", seg: "Óleo & Gás", cidade: "Araucária", uf: "PR" },
  { nome: "Klabin S.A", cnpj: "89.637.490/0012-77", seg: "Papel & Celulose", cidade: "Telêmaco Borba", uf: "PR" },
  { nome: "Renault do Brasil", cnpj: "00.913.443/0001-73", seg: "Indústria automotiva", cidade: "São José dos Pinhais", uf: "PR" },
  { nome: "Ambev — Filial SC", cnpj: "07.526.557/0033-18", seg: "Indústria geral", cidade: "Lages", uf: "SC" },
  { nome: "Braskem S.A", cnpj: "42.150.391/0025-09", seg: "Petroquímica", cidade: "Triunfo", uf: "RS" },
  { nome: "Shell Brasil", cnpj: "61.090.971/0066-12", seg: "Óleo & Gás", cidade: "Rio de Janeiro", uf: "RJ" },
  { nome: "BRF S.A", cnpj: "01.838.723/0019-55", seg: "Indústria alimentícia", cidade: "Chapecó", uf: "SC" },
];

/* carteiras dos gerentes (GC-01..GC-08) */
const CARTEIRAS = ["GC-01", "GC-02", "GC-03", "GC-04", "GC-05", "GC-06", "GC-07", "GC-08"];
const GERENTES = ["MARINA QUEIROZ", "PHILLIPE BORRIES", "NICOLAS RODRIGUES", "FERNANDO ALVES", "LUCIANE PINTO", "MATHEUS DIAS", "ANDRÉ MONTEIRO", "THATIANE COSTA"];

/* fases dos TAPs (statusTap reais do sistema) distribuídas pelos 40 projetos */
const FASES = [
  "Aguardando Plano de Trabalho",
  "Plano de Trabalho recebido",
  "Aguardando programação",
  "Programado",
  "Em campo",
  "Concluído",
  "Pré-agendado",
];

/* pacotes de serviço -> atividades coerentes (com unidade/quantidade) */
const PACOTES = [
  { tipo: ["SONDAGEM", "AMOSTRAGEM DE SOLO"], ativ: [["sond_hollow", 120, "metros"], ["descricao_solo", 120, "metros"], ["poco_monit", 8, "poços"]] },
  { tipo: ["MONITORAMENTO", "RELATÓRIO"], ativ: [["nivel_dagua", 18, "poços"], ["bx_vazao", 18, "amostras"], ["multiparam", 18, "pontos"], ["pid", 18, "pontos"]] },
  { tipo: ["ALTA RESOLUÇÃO (MIP/HPT)"], ativ: [["esteira_geoprobe", 90, "metros"], ["mip_hpt", 90, "metros"], ["descricao_solo", 90, "metros"]] },
  { tipo: ["PROJETO DE ALOCAÇÃO DE SISTEMA DE REMEDIAÇÃO", "INJEÇÃO"], ativ: [["remediacao_inst", 1, "sistema(s)"], ["injecao", 4000, "litros"], ["injecao_montagem", 20, "horas"]] },
  { tipo: ["SONDAGEM", "INSTALAÇÃO DE POÇOS"], ativ: [["sond_caminhao", 80, "metros"], ["poco_monit", 12, "poços"], ["acabamento_poco", 12, "poços"]] },
  { tipo: ["AMOSTRAGEM DE VAPOR (SUBSLAB)"], ativ: [["poco_vapor", 10, "poços"], ["amostr_vapor", 10, "amostras"], ["psg", 8, "amostradores"]] },
];

/* ---- Máquinas (15) — todas com peso preenchido e PESADO ---- */
function genMaquinas() {
  const defs = [
    { marca: "Geoprobe", modelo: "7822DT", plataforma: "Esteira", tipos: ["dp", "dual"], altaRes: ["MIP", "HPT"], peso: 4300, consumo: 30 },
    { marca: "Geoprobe", modelo: "8140LS", plataforma: "Esteira", tipos: ["dp", "dual", "hollow"], altaRes: ["MIP", "HPT", "OIP"], peso: 5200, consumo: 32 },
    { marca: "Geoprobe", modelo: "3230DT", plataforma: "Esteira", tipos: ["dp"], altaRes: [], peso: 2800, consumo: 22 },
    { marca: "Biosonda", modelo: "BS-2000", plataforma: "Esteira", tipos: ["dp", "liner"], altaRes: [], peso: 3600, consumo: 26 },
    { marca: "Sondeq", modelo: "SDH-200", plataforma: "Caminhão", tipos: ["helicoidal", "hollow"], altaRes: [], peso: 7200, consumo: 21 },
    { marca: "Sondeq", modelo: "ST-50", plataforma: "Caminhão", tipos: ["rotativa", "hollow"], altaRes: [], peso: 6500, consumo: 19 },
    { marca: "CME", modelo: "75", plataforma: "Caminhão", tipos: ["hollow", "rotativa"], altaRes: [], peso: 8000, consumo: 24 },
    { marca: "Maquesonda", modelo: "MS-1500", plataforma: "Caminhão", tipos: ["rotativa"], altaRes: [], peso: 5800, consumo: 18 },
    { marca: "Geoprobe", modelo: "6712DT", plataforma: "Esteira", tipos: ["dp", "dual", "injecao"], altaRes: ["MIP"], peso: 3900, consumo: 28 },
    { marca: "Biosonda", modelo: "BS-3500", plataforma: "Esteira", tipos: ["dp", "dual", "hollow"], altaRes: ["OIP"], peso: 4700, consumo: 31 },
    { marca: "Sondeq", modelo: "SDH-300", plataforma: "Caminhão", tipos: ["hollow", "rotativa"], altaRes: [], peso: 7600, consumo: 23 },
    { marca: "Geoprobe", modelo: "54LT", plataforma: "Esteira", tipos: ["dp", "injecao"], altaRes: [], peso: 2600, consumo: 20 },
    { marca: "CME", modelo: "85", plataforma: "Caminhão", tipos: ["hollow", "rotativa"], altaRes: [], peso: 7900, consumo: 25 },
    { marca: "Maquesonda", modelo: "MS-2200", plataforma: "Caminhão", tipos: ["rotativa", "hollow"], altaRes: [], peso: 6900, consumo: 22 },
    { marca: "Geoprobe", modelo: "9100", plataforma: "Esteira", tipos: ["dp", "dual", "hollow"], altaRes: ["MIP", "HPT"], peso: 5500, consumo: 33 },
  ];
  return defs.map((d, i) => {
    // a maioria Disponível; algumas Em campo / Em manutenção
    const status = i === 4 ? "Em manutenção" : (i % 6 === 5 ? "Em campo" : "Disponível");
    return {
      cod: "MAQ-" + pad3(i + 1), marca: d.marca, modelo: d.modelo,
      horimetro: randint(800, 4500), ultRevisao: 0, proxRevisao: 0,
      plataforma: d.plataforma, tipos: d.tipos, altaRes: d.altaRes,
      peso: d.peso, consumo: d.consumo, veiculo: "",
      status, local: pick(REGIOES),
    };
  });
}

/* ---- Frota (40): ~24 leves + ~16 pesados ---- */
function genFrota() {
  const frota = [];
  const placa = () => {
    const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return L[randint(0, 25)] + L[randint(0, 25)] + L[randint(0, 25)] + "-" + randint(0, 9) + L[randint(0, 25)] + randint(0, 9) + randint(0, 9);
  };
  const LEVES = [
    { veiculo: "Toyota Hilux 4x4", tipo: "Camionete leve" }, { veiculo: "VW Saveiro", tipo: "Utilitário leve" },
    { veiculo: "Fiat Toro", tipo: "Camionete leve" }, { veiculo: "Chevrolet S10", tipo: "Camionete leve" },
    { veiculo: "Renault Duster", tipo: "Carro leve" }, { veiculo: "Fiat Strada", tipo: "Utilitário leve" },
    { veiculo: "Ford Ranger", tipo: "Camionete leve" }, { veiculo: "Nissan Frontier", tipo: "Camionete leve" },
  ];
  const PESADOS = [
    { veiculo: "VW 24.280 Constellation", tipo: "Caminhão médio", implemento: "Prancha" },
    { veiculo: "MB Atego 2426", tipo: "Caminhão médio", implemento: "Munck" },
    { veiculo: "Volvo VM 270", tipo: "Caminhão pesado", implemento: "Prancha" },
    { veiculo: "Iveco Tector", tipo: "Caminhão médio", implemento: "Munck" },
    { veiculo: "Scania P310", tipo: "Caminhão pesado", implemento: "Prancha" },
    { veiculo: "MB Accelo 1016", tipo: "Caminhão pequeno", implemento: "Munck" },
  ];
  // 24 leves
  for (let i = 0; i < 24; i++) {
    const m = LEVES[i % LEVES.length];
    frota.push({
      veiculo: m.veiculo, tipo: m.tipo, cnh: "B", placa: placa(), anoFab: randint(2018, 2024),
      funcao: "Apoio de equipe de campo", capCargaKg: randint(600, 1200), capPessoas: randint(2, 5),
      implemento: "", capImplemento: "", kmAtual: randint(20000, 160000), proxRevKm: 0,
      status: i % 7 === 0 ? "Em campo" : (i % 11 === 5 ? "Em manutenção" : "Disponível"),
      localAtual: pick(REGIOES), dataLocal: isoAdd(HOJE, -randint(0, 9)), consumoKmL: randint(8, 12),
    });
  }
  // 16 pesados — capImplemento ALTO o suficiente p/ as máquinas (4000-10000 kg)
  for (let i = 0; i < 16; i++) {
    const m = PESADOS[i % PESADOS.length];
    frota.push({
      veiculo: m.veiculo, tipo: m.tipo, cnh: "E", placa: placa(), anoFab: randint(2014, 2023),
      funcao: "Transporte de máquinas de sondagem", capCargaKg: randint(8000, 14000), capPessoas: randint(2, 3),
      implemento: m.implemento, capImplemento: randint(4000, 10000),
      kmAtual: randint(120000, 320000), proxRevKm: 0,
      status: i % 8 === 3 ? "Em manutenção" : "Disponível",
      localAtual: pick(REGIOES), dataLocal: isoAdd(HOJE, -randint(0, 9)), consumoKmL: randint(2, 4),
    });
  }
  return frota;
}

/* ---- Equipamentos (12) ---- */
function genEquipamentos(matsAmostr) {
  const tipos = [
    ["Analisador multiparâmetros (pH/OD/cond/ORP)", "Horiba U-52"],
    ["Analisador multiparâmetros", "YSI ProDSS"],
    ["Analisador de gases VOC — PID", "MiniRAE 3000"],
    ["Medidor de nível d'água", "Solinst 102"],
    ["Bomba de baixa vazão", "Geotech GeoPump"],
    ["GPS RTK", "Trimble R10"],
    ["Estação total", "Leica TS07"],
    ["Interface óleo/água", "Solinst 122"],
    ["Colorímetro de campo", "Hach DR300"],
    ["Bomba peristáltica", "Masterflex E/S"],
    ["Detector de gases 4 em 1", "MSA Altair 4X"],
    ["Amostrador passivo PSG", "Beacon PSG"],
  ];
  return tipos.map((t, i) => {
    const ult = isoAdd("2026-01-01", randint(0, 120));
    const emCampo = i % 3 === 0;
    return {
      cod: "EQP-" + pad3(i + 1), tipo: t[0], modelo: t[1], specs: "",
      local: emCampo ? "Em campo" : "Almoxarifado",
      comQuem: emCampo && matsAmostr.length ? pick(matsAmostr) : "",
      ultCalib: ult, valCalib: isoAdd(ult, 365), periodoCalib: 6,
      estado: i === 6 ? "Em calibração" : "Operacional",
    };
  });
}

/* ---- Colaboradores + aptidões + SMS + disponibilidade + ASOs ---- */
function genPessoas(contratosIds) {
  const colaboradores = [], aptidoes = {}, sms = {}, disponibilidade = {}, asos = {};
  const matsAmostr = [];
  for (let i = 0; i < 100; i++) {
    const mat = "GEO-" + (2001 + i);
    const def = CARGOS_APTOS[i % CARGOS_APTOS.length];
    const cargo = def.cargo, papel = def.papel;
    const nome = pick(PRIMEIROS) + " " + pick(SOBRENOMES) + " " + pick(SOBRENOMES);
    const status = pick(STATUS_COLAB_W);
    const regiao = pick(REGIOES);
    colaboradores.push({
      mat, nome, cargo, funcao: cargo,
      admissao: `${randint(2013, 2024)}-${pad3(randint(1, 12)).slice(1)}-${pad3(randint(1, 28)).slice(1)}`,
      regiao, custoTotal: round2(randint(4200, 16000) + rnd()),
      refMes: "2026-05", status, dispViagem: rnd() < 0.7 ? "sim" : "indisponivel",
    });
    if (papel === "amostrador") matsAmostr.push(mat);

    /* EXATAMENTE 50% com aptidões boas (índices pares), 50% sem/baixa (ímpares) */
    const bomApt = (i % 2 === 0);
    const matriz = {};
    const comps = PAPEL_COMPS[papel] || [];
    if (bomApt) {
      comps.forEach((c) => { matriz[c] = pick(NIVEIS_BONS); });
      // alguns extras de outras famílias p/ enriquecer
      pick(Object.values(PAPEL_COMPS)).slice(0, 2).forEach((c) => { if (c && !matriz[c]) matriz[c] = pick(NIVEIS_BONS); });
    } else {
      // baixa/sem aptidão: poucas competências e níveis baixos
      comps.slice(0, 2).forEach((c) => { matriz[c] = pick(NIVEIS_BAIXOS); });
    }
    const cnhCat = bomApt ? pick(CNH_BY_CARGO[cargo] || ["B"]) : pick(["Não possui", "B"]);
    aptidoes[mat] = {
      cnhCat,
      cnhVal: cnhCat === "Não possui" ? "" : (bomApt ? isoAdd(HOJE, randint(120, 720)) : isoAdd(HOJE, -randint(10, 300))),
      cursos: [], treinos: [], matriz,
      restricoes: bomApt ? [] : (i % 4 === 1 ? ["Viaja apenas dentro da região de contratação"] : []),
      obs: "",
    };

    /* EXATAMENTE 50% com SMS válido (índices < 50), 50% vencido/faltando */
    const bomSms = (i < 50);
    const reg = {};
    SMS_IDS.forEach((id, k) => {
      if (bomSms) {
        reg[id] = { val: isoAdd(HOJE, randint(60, 540)) };
      } else {
        // vencidos ou faltando
        if (k % 3 === 0) reg[id] = { val: "" };               // faltando
        else if (k % 3 === 1) reg[id] = { val: isoAdd(HOJE, -randint(10, 400)) }; // vencido
        else reg[id] = { na: true };                          // não aplicável
      }
    });
    reg.aso = { val: bomSms ? isoAdd(HOJE, randint(60, 360)) : isoAdd(HOJE, -randint(5, 200)) };
    sms[mat] = reg;

    /* disponibilidade */
    const disp = { localAtual: regiao, dataLocal: isoAdd(HOJE, -randint(0, 9)), ferias: [], afastamentos: [] };
    if (status === "Férias") disp.ferias = [{ ini: isoAdd(HOJE, randint(2, 20)), fim: isoAdd(HOJE, randint(25, 45)) }];
    if (status === "Afastado") disp.afastamentos = [{ tipo: pick(["Atestado", "Acidente", "Licença"]), ini: isoAdd(HOJE, -randint(10, 40)), fim: isoAdd(HOJE, randint(5, 30)) }];
    disponibilidade[mat] = disp;

    /* ASOs por contrato (apenas para metade com SMS bom, p/ exercitar pendências) */
    if (bomSms) {
      const ctos = {};
      const n = randint(2, 5);
      for (let j = 0; j < n; j++) {
        const ct = pick(contratosIds);
        ctos[ct] = { val: isoAdd(HOJE, randint(30, 360)) };
      }
      asos[mat] = ctos;
    }
  }
  return { colaboradores, aptidoes, sms, disponibilidade, asos, matsAmostr };
}

/* ---- Clientes / Contratos ---- */
function genClientesContratos() {
  const clientes = CLIENTES_DEF.map((c) => ({
    nome: c.nome, cnpj: c.cnpj, segmento: c.seg, cidade: `${c.cidade}/${c.uf}`,
    contato: "Responsável Técnico", foneEmail: "contato@cliente.com.br",
    exigencias: "Integração obrigatória · NR-35 vigente", status: "Ativo",
  }));
  const contratos = [], condicionantes = {}, docsCnpj = {};
  const contratosIds = [];
  // 20 contratos: 2 por cliente
  let ctNum = 1;
  CLIENTES_DEF.forEach((c) => {
    for (let k = 0; k < 2; k++) {
      const contrato = "CT-2026-" + pad3(ctNum);
      contratosIds.push(contrato);
      contratos.push({
        cliente: c.nome, contrato, cnpj: c.cnpj, localidade: c.cidade, estado: c.uf,
        projeto: `Projeto ambiental — ${c.nome}${k ? " (II)" : ""}`,
        servico: "Investigação e/ou remediação",
        valorContrato: randint(90000, 1500000), statusCt: k === 0 ? "Vigente" : pick(["Vigente", "Vigente", "Vencido"]),
        docs: {},
      });
      condicionantes[contrato] = {
        prazoIni: isoAdd(HOJE, randint(1, 20)), prazoFim: isoAdd(HOJE, randint(120, 240)),
        condicoes: "Integração obrigatória · NR-35 vigente",
        fiscal: "Eng. Responsável do Cliente", fiscalFone: "(41) 9____-____",
        fiscalEmail: `fiscal@${c.nome.split(" ")[0].toLowerCase()}.com.br`,
      };
      const cnpjLimpo = c.cnpj.replace(/\D/g, "");
      if (!docsCnpj[cnpjLimpo]) {
        docsCnpj[cnpjLimpo] = { pgr: { val: isoAdd(HOJE, randint(60, 360)) }, pcmso: { val: isoAdd(HOJE, randint(30, 300)) } };
      }
      ctNum++;
    }
  });
  return { clientes, contratos, condicionantes, docsCnpj, contratosIds };
}

/* ---- TAPs (40) cobrindo todas as fases + apoio coerente ---- */
function genTaps() {
  const taps = [];
  const planos = {}, programacoes = {}, ordens = {}, apontamentos = {};
  let seqByUf = {};
  for (let i = 0; i < 40; i++) {
    const c = CLIENTES_DEF[i % CLIENTES_DEF.length];
    const uf = c.uf;
    seqByUf[uf] = (seqByUf[uf] || 0) + 1;
    const idgeo = `${uf}26${pad3(seqByUf[uf])}`;
    const pacote = PACOTES[i % PACOTES.length];
    const fase = FASES[i % FASES.length];
    const criacao = isoAdd("2026-01-15", randint(0, 140));
    const entradaCampo = isoAdd(criacao, randint(30, 90));
    const tap = {
      idgeo, projeto: `${c.nome.split(" ")[0]} — ${pacote.tipo[0].slice(0, 24)}`,
      carteira: CARTEIRAS[i % CARTEIRAS.length], gerente: GERENTES[i % GERENTES.length], gerenteEmail: "",
      cliente: c.nome, cnpj: c.cnpj, cidade: c.cidade, uf,
      contato: "Responsável Técnico", tipoServico: pacote.tipo,
      dataCriacao: criacao, entradaCampo, mobilizacao: isoAdd(entradaCampo, -7),
      entregaRelatorio: isoAdd(entradaCampo, randint(60, 120)),
      urgente15: rnd() < 0.4,
      premOper: "Equipe full-time durante a campanha", premTec: "Conforme escopo",
      riscos: "Acesso restrito", restricoes: "PT diária",
      premNeg: "", premEstr: "", metas: "", multas: "", statusTap: fase,
    };
    taps.push(tap);

    const ativProg = pacote.ativ.map(([id, qtd]) => ({ id, qtd }));

    /* Apoio coerente por fase */
    if (["Plano de Trabalho recebido", "Aguardando programação", "Programado", "Em campo", "Concluído"].includes(fase)) {
      planos[idgeo] = [{
        id: "PT-" + idgeo, nome: "Plano de Trabalho — " + tap.projeto,
        anexos: [{ nome: "plano_trabalho.pdf", tipo: "application/pdf" }],
        analiseIA: { atividades: [] }, em: isoAdd(criacao, randint(5, 20)),
      }];
    }
    if (["Programado", "Em campo", "Concluído"].includes(fase)) {
      programacoes[idgeo] = {
        local: c.cidade, uf, prioridade: pick(["Baixa", "Média", "Alta"]),
        inicioPrev: entradaCampo, fimPrev: isoAdd(entradaCampo, randint(8, 30)),
        atividades: ativProg,
        executivo: { anexos: [], notas: "", pesos: { qualidade: 9, custo: 7, rota: 6, tempo: 6, proximidade: 7, conformidade: 4 } },
        cronograma: { blocos: [] }, aceites: { gerente: null, rotas: null }, cenarioSel: null,
      };
    }
    if (["Em campo", "Concluído"].includes(fase)) {
      const inicio = fase === "Concluído" ? isoAdd(HOJE, -randint(20, 50)) : isoAdd(HOJE, -randint(2, 8));
      const fim = isoAdd(inicio, randint(8, 18));
      ordens[idgeo] = {
        idgeo, projeto: tap.projeto, cliente: c.nome, local: c.cidade,
        status: "Aprovada", aprovadaEm: isoAdd(inicio, -3),
        janelaIni: inicio, janelaFim: fim, inicio, fim,
        diasCampo: randint(8, 18), kmTotal: randint(120, 600), distMatriz: randint(20, 250),
        maxDistEquipe: randint(20, 250), custoTotal: randint(30000, 180000),
        atividades: ativProg,
        equipe: [
          { mat: "GEO-2001", nome: "Equipe Sondagem", papel: "Operador de Sondagem", vazio: false },
          { mat: "GEO-2002", nome: "Auxiliar", papel: "Auxiliar de Operações", vazio: false },
        ],
        maquina: null, veiculo: { placa: "" }, equipamentos: [],
        custoCategorias: {}, alertas: [],
      };
      if (fase === "Concluído") {
        const apts = [];
        const dias = 5;
        for (let d = 0; d < dias; d++) {
          const itens = {};
          ativProg.forEach((a) => { itens[a.id] = randint(1, 6); });
          apts.push({
            data: isoAdd(inicio, d), km: randint(15, 40), horasTecnico: randint(8, 11),
            itens, naoConforme: d === 2, descNC: d === 2 ? "Ocorrência registrada" : "",
            statusDia: d === 2 ? "parcial" : "ok", obs: "", lancadoEm: isoAdd(inicio, d),
          });
        }
        apontamentos[idgeo] = apts;
      }
    }
  }
  return { taps, planos, programacoes, ordens, apontamentos };
}

/* ---- Montagem final ---- */
function buildBase() {
  const cc = genClientesContratos();
  const pessoas = genPessoas(cc.contratosIds);
  const maquinas = genMaquinas();
  const frota = genFrota();
  const equipamentos = genEquipamentos(pessoas.matsAmostr);
  const tp = genTaps();

  return {
    colaboradores: pessoas.colaboradores,
    aptidoes: pessoas.aptidoes,
    sms: pessoas.sms,
    disponibilidade: pessoas.disponibilidade,
    maquinas,
    frota,
    equipamentos,
    clientes: cc.clientes,
    contratos: cc.contratos,
    condicionantes: cc.condicionantes,
    asos: pessoas.asos,
    taps: tp.taps,
    equipPorAtividade: {
      multiparam: ["multiparâmetro", "multiparametro"],
      pid: ["pid", "voc", "gases"],
    },
    travas: { pessoa: {}, maquina: {} },
    custos: { diasUteisMes: 22, kmDiarioCampo: 20 },
    produtividade: {},
    planos: tp.planos,
    programacoes: tp.programacoes,
    ordens: tp.ordens,
    apontamentos: tp.apontamentos,
    servicosCustom: [],
    servicosOcultos: [],
    docsCnpj: cc.docsCnpj,
    autorizacoes: [],
    atualizacoes: {},
    preAgendamentos: {},
    logins: [],
  };
}

export const EXEMPLO_BASE = buildBase();
