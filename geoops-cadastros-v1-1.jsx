import React, { useState, useEffect, useMemo, useRef } from "react";

/* ================== GeoOps · Módulo Cadastros · Iteração 3.0 ==============
   Telas: Colaboradores · Aptidões · SMS & NRs · Máquinas · Frota · Equipamentos · Disponibilidade & Rotação
   Perfis: Master (tudo) · Administrativo (edita aptidões) · Gestão (só leitura)
   Persistência: window.storage (chave única, gravação em lote)
=============================================================================== */

const STORE_KEY = "geoops-cadastros-v1";

const T = {
  paper: "#F4F7FA", panel: "#FFFFFF", ink: "#16202B", inkSoft: "#566472",
  line: "#D8E2EC", green900: "#0F2E4D", green700: "#1F5C8A", green100: "#E2EDF6",
  amber: "#B97D10", amberBg: "#FBF3E2", red: "#B3402A", redBg: "#F9E9E5",
  blue: "#1F5C8A", blueBg: "#E2EDF6", gray: "#6B747E", grayBg: "#EDF0F3",
};

const PERFIS = [
  { id: "master", label: "Master" },
  { id: "adm", label: "Administrativo" },
  { id: "gestao", label: "Gestão" },
];

const CARGOS_BASE = ["Auxiliar de Operações","Técnico de Operações","Técnico de Operações Sondagem","Operador de Sondagem","Encarregado de Operações","Supervisor de Operações","Supervisor de Campo","Coordenador de Operações de Campo","Gerente de Operações","Diretor de Operações","Auxiliar de Obras","Mestre de Obras","Motorista","Encarregado de Frotas","Técnico em Meio Ambiente","Técnico de Segurança do Trabalho","Auxiliar de Segurança do Trabalho","Coordenador de SMS","Monitor de Sistemas","Técnico de Planejamento","Assistente de Projetos","Analista de Projetos","Analista Técnico de Projetos","Coordenador de Projetos","Gerente de Projetos","Especialista Técnico Consultivo","Especialista Técnico de Operações","Gerente Técnico","Superintendente Técnico","Coordenador de Qualidade","Analista de Qualidade","Elaborador de Relatórios","Revisor Técnico","Analista de Modelagem Conceitual","Desenhista Projetista","Geólogo","Engenheiro","Químico","Consultor"];
const REGIOES_BASE = ["Curitiba (Matriz)","Região Metropolitana de Curitiba","Interior PR","Santa Catarina","São Paulo","Outros estados"];
const STATUS_COLAB = ["Ativo","Férias","Afastado","Desligado"];
const CNH_CATS = ["Não possui","A","B","AB","C","D","E"];
const NIVEIS = [
  { id: "na", short: "0", label: "Insuficiente", desc: "não está apto a executar a atividade" },
  { id: "jr", short: "1", label: "Conhecimento básico", desc: "já fez uma vez ou viu como fazer e pode tentar repetir, mas não conhece a instrução e não recebeu treinamento" },
  { id: "pl", short: "2", label: "Conhecimento intermediário", desc: "já fez mais de uma vez, recebeu treinamento sobre a atividade, mas está defasado ou não faz parte de sua rotina" },
  { id: "sr", short: "3", label: "Conhecimento avançado", desc: "recebeu treinamento, faz rotineiramente a atividade e resolve a maioria das dificuldades em campo" },
  { id: "esp", short: "4", label: "Especialista", desc: "conhece a fundo o tema e é capaz de ser um multiplicador do conhecimento" },
];
const NIVEL_BG = { na: "#EEF0ED", jr: "#E2EDF6", pl: "#7FA8CC", sr: "#1F5C8A", esp: "#0F2E4D" };
const NIVEL_FG = { na: "#6B7470", jr: "#0F2E4D", pl: "#0F2E4D", sr: "#fff", esp: "#fff" };
const ATIVIDADES_BASE = [
  { id: "remediacao_inst", label: "Instalação de Sistemas de Remediação (MPE, P&T)", short: "Instalação remediação" },
  { id: "remediacao_manut", label: "Manutenção de Sistemas de Remediação (MPE, P&T)", short: "Manutenção remediação" },
  { id: "remediacao_oper", label: "Operação de Sistemas de Remediação (MPE, P&T)", short: "Operação remediação" },
  { id: "desmob_remediacao", label: "Desmobilização de sistemas de remediação", short: "Desmob. remediação" },
  { id: "bailer", label: "Amostragem Volume Determinado (Bailer)", short: "Amostr. bailer" },
  { id: "bx_vazao", label: "Amostragem Baixa Vazão", short: "Amostr. baixa vazão" },
  { id: "multiparam", label: "Leitura e Calibração em campo de Multiparâmetros", short: "Multiparâmetros" },
  { id: "pid", label: "Leitura e Calibração em campo de medidores de Voláteis PID", short: "PID voláteis" },
  { id: "esteira_biosonda", label: "Operação de máquinas de sondagem sobre esteira (Biosonda)", short: "Esteira Biosonda" },
  { id: "esteira_geoprobe", label: "Operação de máquinas de sondagem sobre esteira (Geoprobe)", short: "Esteira Geoprobe" },
  { id: "sond_caminhao", label: "Operação de máquinas de sondagem (caminhão)", short: "Sond. caminhão" },
  { id: "nivel_dagua", label: "Monitoramento de nível d'água em poços", short: "Nível d'água" },
  { id: "poco_monit", label: "Instalação de poços de monitoramento ou de observação", short: "Inst. poços monit." },
  { id: "acabamento_poco", label: "Acabamento de poços de monitoramento", short: "Acabamento de poços" },
  { id: "injecao", label: "Injeção de produtos remediadores (controle de pressão, vazão e parâmetros de injeção)", short: "Injeção remediadores" },
  { id: "injecao_montagem", label: "Montagem de sistema de injeção (bombas, tanques, mistura e controle de parâmetros de injeção como pressão e vazão)", short: "Montagem inj." },
  { id: "topo_rtk", label: "Topografia em campo usando RTK", short: "Topografia RTK" },
  { id: "topo_estacao", label: "Topografia em campo usando Estação Total", short: "Topo. Estação Total" },
  { id: "escavacao", label: "Escavação controlada", short: "Escavação controlada" },
  { id: "desmont_ind", label: "Desmontagem industrial controlada", short: "Desmont. industrial" },
  { id: "soil_mixing", label: "Execução de remediação por Soil Mixing", short: "Soil Mixing" },
  { id: "lab_cromato", label: "Operação de laboratório cromatográfico de campo", short: "Lab. cromatográfico" },
  { id: "colorimetro", label: "Condução de análises com colorímetro em ensaio piloto de oxidação", short: "Colorímetro (piloto)" },
  { id: "raio_influencia", label: "Execução de ensaio piloto para determinação de raio de influência", short: "Ensaio raio influência" },
  { id: "descricao_solo", label: "Amostragem e Descrição de solo durante sondagem conforme normas", short: "Descrição de solo" },
  { id: "tamponamento", label: "Tamponamento de poços", short: "Tamponamento poços" },
  { id: "oip_hpt", label: "Operação de sistema OIP/HPT", short: "OIP/HPT" },
  { id: "mip_hpt", label: "Operação de sistema MIP/HPT", short: "MIP/HPT" },
  { id: "poco_vapor", label: "Instalação de Poços de Vapor Subslab", short: "Poços vapor subslab" },
  { id: "psg", label: "Instalação e Coleta de Amostradores Passivos PSG", short: "Amostradores PSG" },
  { id: "amostr_vapor", label: "Amostragem de Poços de Vapor Subslab", short: "Amostr. vapor subslab" },
  { id: "sond_liner", label: "Sondagem Direct Push Liner Contínuo", short: "DP Liner Contínuo" },
  { id: "sond_dualtube", label: "Sondagem Dual Tube", short: "Dual Tube" },
  { id: "sond_hollow", label: "Sondagem Hollow Auger", short: "Hollow Auger" },
  { id: "sond_injecao", label: "Sondagem para injeção de produtos remediadores", short: "Sond. p/ injeção" },
];
/* ATIVIDADES = lista viva (base + serviços customizados − serviços ocultados).
   sincAtividades() é chamada quando o estado carrega para refletir extras e remoções. */
const ATIVIDADES = [...ATIVIDADES_BASE];
const sincAtividades = (extras, ocultos) => {
  const oc = ocultos || [];
  ATIVIDADES.length = 0;
  ATIVIDADES_BASE.forEach((a) => { if (!oc.includes(a.id)) ATIVIDADES.push(a); });
  (extras || []).forEach((a) => { if (a && a.id && !oc.includes(a.id) && !ATIVIDADES.some((x) => x.id === a.id)) ATIVIDADES.push(a); });
};
const RESTRICOES = [
  "Sem restrições — viaja para qualquer região",
  "Não pode viajar (apenas base local)",
  "Viaja apenas dentro da região de contratação",
  "Não contratado para campo, mas disponível para viagens",
  "Disponível apenas com aviso prévio",
  "Restrição médica temporária",
];
/* Tipos de autorização operacional solicitáveis pelo colaborador em campo */
const TIPOS_AUTORIZACAO = [
  { id: "hora_extra", label: "Liberação de hora extra", icone: "⏱", temValor: true, temData: true, unidadeValor: "horas" },
  { id: "veiculo", label: "Liberação de veículo", icone: "🚗", temValor: false, temData: true },
  { id: "hotel", label: "Liberação de hotel / hospedagem", icone: "🏨", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "uber", label: "Liberação de Uber / transporte por app", icone: "🚕", temValor: true, temData: true, unidadeValor: "R$" },
  { id: "passagem", label: "Liberação de passagem aérea", icone: "✈️", temValor: true, temData: true, unidadeValor: "R$" },
];

/* ---------- helpers ---------- */
const hojeISO = () => new Date().toISOString().slice(0, 10);
/* feriados nacionais fixos (MM-DD) + alguns móveis aproximados — base para cálculo de dias úteis */
const FERIADOS_FIXOS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "12-25"];
const ehFimDeSemana = (d) => { const dia = d.getDay(); return dia === 0 || dia === 6; };
const ehFeriado = (d) => FERIADOS_FIXOS.includes(String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
const ehDiaUtil = (d) => !ehFimDeSemana(d) && !ehFeriado(d);
/* soma N dias ÚTEIS a uma data ISO; retorna a data ISO do fim previsto (último dia útil de trabalho).
   diasUteis = nº de dias de campo efetivos a trabalhar. Pula fins de semana e feriados. */
const somarDiasCampo = (inicioISO, diasCampo) => {
  if (!inicioISO || !diasCampo || diasCampo < 1) return inicioISO || "";
  const d = new Date(inicioISO + "T12:00:00");
  let trabalhados = 0;
  /* o próprio dia de início conta como 1º dia útil se for útil; senão avança até o 1º útil */
  while (ehDiaUtil(d) === false) d.setDate(d.getDate() + 1);
  trabalhados = 1;
  while (trabalhados < diasCampo) {
    d.setDate(d.getDate() + 1);
    if (ehDiaUtil(d)) trabalhados++;
  }
  return d.toISOString().slice(0, 10);
};
/* Níveis de bloqueio de recursos no calendário de disponibilidade */
const NIVEIS_TRAVA = [
  { id: "total", label: "Totalmente bloqueado", curto: "Bloqueado", icone: "🔴", cor: "#C0392B", bg: "#FCE9E6", desc: "Indisponível para novos projetos" },
  { id: "parcial", label: "Parcialmente bloqueado", curto: "Parcial", icone: "🟡", cor: "#B7791F", bg: "#FDF6E3", desc: "Disponível mediante liberação de outra frente" },
  { id: "livre", label: "Liberado", curto: "Liberado", icone: "🟢", cor: "#1E7E45", bg: "#E7F5EC", desc: "Disponível a qualquer momento" },
];
const TRAVA_INFO = (id) => NIVEIS_TRAVA.find((n) => n.id === id) || NIVEIS_TRAVA[2];
/* Status de disponibilidade de um recurso numa janela [ini,fim], consultando suas travas.
   Retorna o nível mais restritivo que se sobrepõe à janela: total > parcial > livre. */
const statusNaJanela = (travasDoRecurso, ini, fim) => {
  const lista = travasDoRecurso || [];
  if (!ini || !fim || !lista.length) return { nivel: "livre", travas: [] };
  const sobrepoe = (a) => a.ini <= fim && ini <= a.fim;
  const sobre = lista.filter(sobrepoe);
  if (sobre.some((t) => t.nivel === "total")) return { nivel: "total", travas: sobre.filter((t) => t.nivel === "total") };
  if (sobre.some((t) => t.nivel === "parcial")) return { nivel: "parcial", travas: sobre.filter((t) => t.nivel === "parcial") };
  return { nivel: "livre", travas: sobre };
};
/* Gera o IDGEO no padrão UF(2) + ANO(2) + sequencial(3): ex. SC26001.
   O sequencial é por UF+ANO: o próximo projeto da mesma UF/ano recebe o número seguinte. */
const gerarIdgeo = (uf, taps, ano) => {
  const UF = (uf || "").toUpperCase().slice(0, 2) || "XX";
  const AA = String(ano || new Date().getFullYear()).slice(-2);
  const prefixo = UF + AA;
  /* maior sequencial já usado para este prefixo */
  let maxSeq = 0;
  (taps || []).forEach((t) => {
    const id = (t.idgeo || "").toUpperCase();
    if (id.startsWith(prefixo) && id.length >= 7) {
      const seq = parseInt(id.slice(4, 7), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });
  const prox = String(maxSeq + 1).padStart(3, "0");
  return prefixo + prox;
};
const fmtData = (iso) => { if (!iso) return "—"; const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const brToISO = (s) => {
  const m = (s || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
};
const fmtBRL = (v) => (v === "" || v == null || isNaN(+v)) ? "—" :
  (+v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const parseMoeda = (s) => {
  if (s == null) return "";
  const n = String(s).replace(/[R$\s.]/g, "").replace(",", ".");
  return n === "" || isNaN(+n) ? "" : +n;
};
const cnhStatus = (iso) => {
  if (!iso) return null;
  const dias = Math.floor((new Date(iso) - new Date(hojeISO())) / 864e5);
  if (dias < 0) return { tag: "Vencida", c: T.red, bg: T.redBg };
  if (dias <= 30) return { tag: `Vence em ${dias}d`, c: T.amber, bg: T.amberBg };
  return { tag: "Válida", c: T.green700, bg: T.green100 };
};
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const NIVEL_ALIAS = {
  "nao apto": "na", "insuficiente": "na", "na": "na", "": "na", "0": "na",
  "junior": "jr", "jr": "jr", "1": "jr", "basico": "jr", "conhecimento basico": "jr",
  "pleno": "pl", "pl": "pl", "2": "pl", "intermediario": "pl", "conhecimento intermediario": "pl",
  "senior": "sr", "sr": "sr", "3": "sr", "avancado": "sr", "conhecimento avancado": "sr",
  "esp": "esp", "4": "esp", "especialista": "esp",
};
const ATIV_SINONIMOS = {
  "monitoramento": "nivel_dagua", "nivel": "nivel_dagua", "baixa vazao": "bx_vazao", "low flow": "bx_vazao",
  "bailer": "bailer", "multiparametro": "multiparam", "pid": "pid", "geoprobe": "esteira_geoprobe", "biosonda": "esteira_biosonda",
  "sondagem caminhao": "sond_caminhao", "poco de monitoramento": "poco_monit", "instalacao de poco": "poco_monit",
  "injecao": "injecao", "rtk": "topo_rtk", "estacao total": "topo_estacao", "escavacao": "escavacao",
  "soil mixing": "soil_mixing", "cromatografo": "lab_cromato", "laboratorio": "lab_cromato", "colorimetro": "colorimetro",
  "raio de influencia": "raio_influencia", "teste piloto": "raio_influencia", "descricao de solo": "descricao_solo",
  "tamponamento": "tamponamento", "oip": "oip_hpt", "mip": "mip_hpt", "vapor subslab": "poco_vapor", "subslab": "poco_vapor",
  "psg": "psg", "passivo": "psg", "amostragem de vapor": "amostr_vapor", "remediacao": "remediacao_oper",
  "desmobilizacao": "desmob_remediacao", "desmontagem": "desmont_ind",
};
const matchAtividade = (texto) => {
  const q = norm(texto);
  if (!q) return null;
  const exato = ATIVIDADES.filter((a) => norm(a.label) === q || norm(a.short) === q || a.id === q);
  if (exato.length === 1) return exato[0];
  const parcial = ATIVIDADES.filter((a) => norm(a.label).includes(q) || q.includes(norm(a.label)) || norm(a.short).includes(q) || q.includes(norm(a.short)));
  if (parcial.length === 1) return parcial[0];
  for (const s in ATIV_SINONIMOS) { if (q.includes(s)) { const a = ATIVIDADES.find((x) => x.id === ATIV_SINONIMOS[s]); if (a) return a; } }
  return null;
};

const SMS_ITENS = [
  { id: "nr06", label: "NR-06", grupo: "NRs" },
  { id: "nr10", label: "NR-10", grupo: "NRs" },
  { id: "nr12", label: "NR-12", grupo: "NRs" },
  { id: "nr17", label: "NR-17", grupo: "NRs" },
  { id: "nr18", label: "NR-18", grupo: "NRs" },
  { id: "nr20", label: "NR-20", grupo: "NRs" },
  { id: "nr23", label: "NR-23", grupo: "NRs" },
  { id: "nr26", label: "NR-26", grupo: "NRs" },
  { id: "nr33", label: "NR-33", grupo: "NRs" },
  { id: "nr35", label: "NR-35", grupo: "NRs" },
  { id: "dirdef", label: "Dir. Defensiva", grupo: "Outros" },
  { id: "fittest", label: "Fit Test", grupo: "Outros" },
];
const DOCS_CLIENTE = [
  { id: "pgr", label: "PGR" },
  { id: "pcmso", label: "PCMSO" },
  { id: "ppeob", label: "PPEOB" },
  { id: "pca", label: "PCA" },
  { id: "ppr", label: "PPR" },
  { id: "ltcat", label: "LTCAT" },
  { id: "lip", label: "LIP" },
  { id: "aet", label: "AET" },
];
const matchDocCliente = (texto) => {
  const k = smsKey(texto);
  if (!k) return null;
  const hit = DOCS_CLIENTE.filter((d) => smsKey(d.label) === k);
  return hit.length === 1 ? hit[0] : null;
};
const smsKey = (s) => norm(s || "").replace(/[^a-z0-9]/g, "");
const matchSmsItem = (texto, itens) => {
  let k = smsKey(texto);
  if (!k) return null;
  if (/^nr\d$/.test(k)) k = "nr0" + k.slice(2);
  const exato = itens.filter((it) => smsKey(it.label) === k || (it.id === "dirdef" && k.includes("defensiva")));
  if (exato.length === 1) return exato[0];
  const parcial = itens.filter((it) => smsKey(it.label).includes(k) || k.includes(smsKey(it.label)));
  return parcial.length === 1 ? parcial[0] : null;
};
const smsStatus = (rec) => {
  if (!rec || (!rec.na && !rec.val)) return { key: "ni", short: "—", c: T.amber, bg: "#fff", tag: "Não informado" };
  if (rec.na) return { key: "na", short: "N/A", c: T.gray, bg: T.grayBg, tag: "Não se aplica" };
  const dias = Math.floor((new Date(rec.val) - new Date(hojeISO())) / 864e5);
  const [a, m] = rec.val.split("-");
  const short = `${m}/${a.slice(2)}`;
  if (dias < 0) return { key: "venc", short, c: "#fff", bg: T.red, tag: `Vencido em ${fmtData(rec.val)}` };
  if (dias <= 30) return { key: "v30", short, c: T.green900, bg: "#F0CC7E", tag: `Vence em ${dias} dia(s)` };
  return { key: "ok", short, c: "#fff", bg: T.green700, tag: `Válido até ${fmtData(rec.val)}` };
};
const SMS_BADGE = {
  ok: ["#1F5C8A", "#E2EDF6"], venc: ["#B3402A", "#F9E9E5"], v30: ["#B97D10", "#FBF3E2"],
  ni: ["#B97D10", "#FBF3E2"], na: ["#6B7470", "#EEF0ED"],
};
const parseSmsCell = (s) => {
  const t = (s ?? "").trim();
  if (!t) return undefined;
  const n = norm(t);
  if (t === "-" || ["na", "n a", "nao se aplica", "x"].includes(n)) return { na: true };
  const iso = brToISO(t) || (/^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null);
  if (iso) return { val: iso };
  return { erro: true };
};

const SEGMENTOS_BASE = ["Óleo & Gás", "Indústria química", "Varejo de combustíveis", "Indústria geral", "Imobiliário / Loteamentos", "Mineração", "Público / Governo"];
const STATUS_CONTRATO = ["Vigente", "Em mobilização", "Suspenso", "Encerrado"];
/* Gazetteer regional: cidade normalizada -> nome de exibição + [lat, lng] */
const GAZ = {
  "curitiba": { n: "Curitiba/PR", c: [-25.43, -49.27] },
  "sao jose dos pinhais": { n: "S. J. dos Pinhais/PR", c: [-25.53, -49.20] },
  "s j dos pinhais": { n: "S. J. dos Pinhais/PR", c: [-25.53, -49.20] },
  "araucaria": { n: "Araucária/PR", c: [-25.59, -49.41] },
  "ponta grossa": { n: "Ponta Grossa/PR", c: [-25.09, -50.16] },
  "londrina": { n: "Londrina/PR", c: [-23.31, -51.16] },
  "maringa": { n: "Maringá/PR", c: [-23.42, -51.93] },
  "cascavel": { n: "Cascavel/PR", c: [-24.95, -53.46] },
  "foz do iguacu": { n: "Foz do Iguaçu/PR", c: [-25.54, -54.58] },
  "guarapuava": { n: "Guarapuava/PR", c: [-25.39, -51.46] },
  "paranagua": { n: "Paranaguá/PR", c: [-25.52, -48.51] },
  "toledo": { n: "Toledo/PR", c: [-24.72, -53.74] },
  "campo mourao": { n: "Campo Mourão/PR", c: [-24.04, -52.38] },
  "pato branco": { n: "Pato Branco/PR", c: [-26.23, -52.67] },
  "francisco beltrao": { n: "Francisco Beltrão/PR", c: [-26.08, -53.05] },
  "telemaco borba": { n: "Telêmaco Borba/PR", c: [-24.32, -50.62] },
  "irati": { n: "Irati/PR", c: [-25.47, -50.65] },
  "uniao da vitoria": { n: "União da Vitória/PR", c: [-26.23, -51.09] },
  "umuarama": { n: "Umuarama/PR", c: [-23.77, -53.32] },
  "joinville": { n: "Joinville/SC", c: [-26.30, -48.85] },
  "florianopolis": { n: "Florianópolis/SC", c: [-27.59, -48.55] },
  "blumenau": { n: "Blumenau/SC", c: [-26.92, -49.07] },
  "itajai": { n: "Itajaí/SC", c: [-26.91, -48.66] },
  "chapeco": { n: "Chapecó/SC", c: [-27.10, -52.62] },
  "lages": { n: "Lages/SC", c: [-27.82, -50.33] },
  "criciuma": { n: "Criciúma/SC", c: [-28.68, -49.37] },
  "sao paulo": { n: "São Paulo/SP", c: [-23.55, -46.63] },
  "campinas": { n: "Campinas/SP", c: [-22.91, -47.06] },
  "sorocaba": { n: "Sorocaba/SP", c: [-23.50, -47.46] },
  "registro": { n: "Registro/SP", c: [-24.49, -47.84] },
  "porto alegre": { n: "Porto Alegre/RS", c: [-30.03, -51.22] },
  "rio de janeiro": { n: "Rio de Janeiro/RJ", c: [-22.91, -43.17] },
  "belo horizonte": { n: "Belo Horizonte/MG", c: [-19.92, -43.94] },
  "fazenda rio grande": { n: "Fazenda Rio Grande/PR", c: [-25.66, -49.31] },
  "colombo": { n: "Colombo/PR", c: [-25.29, -49.22] },
  "pinhais": { n: "Pinhais/PR", c: [-25.44, -49.19] },
  "ipatinga": { n: "Ipatinga/MG", c: [-19.47, -42.54] },
  "ipatinga mg": { n: "Ipatinga/MG", c: [-19.47, -42.54] },
  "sao bernardo do campo": { n: "S. Bernardo do Campo/SP", c: [-23.69, -46.56] },
  "sao caetano do sul": { n: "S. Caetano do Sul/SP", c: [-23.62, -46.55] },
  "santo andre": { n: "Santo André/SP", c: [-23.66, -46.53] },
  "cubatao": { n: "Cubatão/SP", c: [-23.89, -46.43] },
  "santos": { n: "Santos/SP", c: [-23.96, -46.33] },
  "bertioga": { n: "Bertioga/SP", c: [-23.85, -46.14] },
  "sao jose dos campos": { n: "S. José dos Campos/SP", c: [-23.18, -45.88] },
  "taubate": { n: "Taubaté/SP", c: [-23.03, -45.55] },
  "itapevi": { n: "Itapevi/SP", c: [-23.55, -46.93] },
  "paulinia": { n: "Paulínia/SP", c: [-22.76, -47.15] },
  "guarulhos": { n: "Guarulhos/SP", c: [-23.45, -46.53] },
  "osasco": { n: "Osasco/SP", c: [-23.53, -46.79] },
  "barra mansa": { n: "Barra Mansa/RJ", c: [-22.54, -44.17] },
  "volta redonda": { n: "Volta Redonda/RJ", c: [-22.52, -44.10] },
  "duque de caxias": { n: "Duque de Caxias/RJ", c: [-22.79, -43.31] },
  "rio grande": { n: "Rio Grande/RS", c: [-32.04, -52.10] },
  "canoas": { n: "Canoas/RS", c: [-29.92, -51.18] },
  "caxias do sul": { n: "Caxias do Sul/RS", c: [-29.17, -51.18] },
  "camacari": { n: "Camaçari/BA", c: [-12.70, -38.32] },
  "salvador": { n: "Salvador/BA", c: [-12.97, -38.50] },
  "betim": { n: "Betim/MG", c: [-19.97, -44.20] },
  "contagem": { n: "Contagem/MG", c: [-19.93, -44.05] },
};
const MATRIZ_GEO = { n: "Curitiba (Matriz)", c: [-25.43, -49.27] };
const normCity = (s) => norm((s || "").split("/")[0]).replace(/\(matriz\)/g, "").trim();
const havKm = (a, b) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const distRodKm = (c) => Math.round(havKm(MATRIZ_GEO.c, c) * 1.25); // fator rodoviário estimado
const fmtBytes = (n) => { if (!n) return "0 B"; const u = ["B", "KB", "MB", "GB"]; const i = Math.floor(Math.log(n) / Math.log(1024)); return (n / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i]; };
/* Limite seguro para envio de anexos à IA (a função serverless aceita ~25MB; base64 infla ~33%,
   então mantemos uma folga e barramos antes de tentar enviar algo que falharia com erro 413). */
const LIMITE_ANEXOS_IA = 18 * 1024 * 1024; // 18 MB de arquivos originais
/* Soma o tamanho dos anexos (lista de {tamanho} ou objeto único) e retorna { bytes, excede, msg }. */
const checarTamanhoAnexos = (anexos) => {
  const lista = Array.isArray(anexos) ? anexos : (anexos ? [anexos] : []);
  const bytes = lista.reduce((s, a) => s + (a && a.tamanho ? a.tamanho : 0), 0);
  const excede = bytes > LIMITE_ANEXOS_IA;
  return {
    bytes, excede,
    msg: excede
      ? `Os documentos somam ${fmtBytes(bytes)}, acima do limite de ${fmtBytes(LIMITE_ANEXOS_IA)} para análise por IA. Remova ou reduza algum anexo (PDFs escaneados em alta resolução costumam ser os mais pesados) e tente novamente.`
      : "",
  };
};
const ANEXO_INLINE_MAX = 600 * 1024; // arquivos até ~600KB são embutidos no preview
const lerArquivo = (file) => new Promise((resolve) => {
  const meta = { nome: file.name, tipo: file.type || "—", tamanho: file.size, data: hojeISO() };
  if (file.size > ANEXO_INLINE_MAX) { resolve({ ...meta, inline: false }); return; }
  const r = new FileReader();
  r.onload = () => resolve({ ...meta, inline: true, conteudo: r.result });
  r.onerror = () => resolve({ ...meta, inline: false });
  r.readAsDataURL(file);
});
const matchMat = (chave, colaboradores) => {
  const c = String(chave || "").trim();
  if (!c) return null;
  const direto = colaboradores.find((x) => x.mat.toLowerCase() === c.toLowerCase());
  if (direto) return direto;
  const num = c.replace(/\D/g, "").replace(/^0+/, "");
  if (!num) return null;
  return colaboradores.find((x) => {
    const xn = x.mat.replace(/\D/g, "").replace(/^0+/, "");
    return xn && xn === num;
  }) || null;
};
const coordsDeTexto = (s) => {
  const m = String(s || "").match(/(-?\d{1,3}[.,]\d{3,})[,;\s]+(-?\d{1,3}[.,]\d{3,})/);
  if (!m) return null;
  const la = parseFloat(m[1].replace(",", ".")), ln = parseFloat(m[2].replace(",", "."));
  return (isNaN(la) || isNaN(ln)) ? null : { lat: la, lng: ln };
};
const parseCoord = (s) => { const v = parseFloat((s || "").replace(",", ".")); return isNaN(v) ? null : v; };
const diasDesde = (iso) => iso ? Math.floor((new Date(hojeISO()) - new Date(iso)) / 864e5) : null;
const parseDataTap = (s) => {
  const t = (s || "").trim();
  if (!t) return "";
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  return "";
};
const parsePct = (s) => {
  const v = parseFloat((s || "").replace("%", "").replace(",", "."));
  return isNaN(v) ? "" : v;
};
const UNID_OPCOES = ["metros", "poços", "amostras", "pontos", "ensaios", "m³", "amostradores", "sistema(s)", "unidade(s)", "dias"];
/* unidade natural de cada atividade */
const UNID_ATV = {
  remediacao_inst: "sistema(s)", remediacao_manut: "sistema(s)", remediacao_oper: "sistema(s)", acabamento_poco: "poços", bailer: "amostras", bx_vazao: "amostras", multiparam: "pontos", pid: "pontos",
  esteira_biosonda: "metros", esteira_geoprobe: "metros", nivel_dagua: "poços", poco_monit: "poços", sond_caminhao: "metros",
  injecao: "litros", injecao_montagem: "horas", topo_rtk: "pontos", topo_estacao: "pontos", desmob_remediacao: "sistema(s)", escavacao: "m³",
  desmont_ind: "unidade(s)", soil_mixing: "m³", lab_cromato: "amostras", colorimetro: "amostras", raio_influencia: "ensaios",
  descricao_solo: "metros", tamponamento: "poços", oip_hpt: "metros", mip_hpt: "metros", poco_vapor: "poços",
  psg: "amostradores", amostr_vapor: "amostras",
  sond_liner: "metros", sond_dualtube: "metros", sond_hollow: "metros", sond_injecao: "metros",
};
/* produtividade de referência (unidades/dia/equipe) — fonte: normas do setor de sondagem BR */
const PROD_DIA = {
  esteira_biosonda: 20, esteira_geoprobe: 25, sond_caminhao: 20, descricao_solo: 20, oip_hpt: 18, mip_hpt: 18,
  bailer: 8, bx_vazao: 6, nivel_dagua: 20, poco_monit: 4, tamponamento: 5, topo_rtk: 30, topo_estacao: 18,
  multiparam: 12, pid: 12, psg: 10, poco_vapor: 4, amostr_vapor: 10,
  injecao: 2000, injecao_montagem: 8,
  sond_liner: 22, sond_dualtube: 20, sond_hollow: 15, sond_injecao: 18,
  remediacao_inst: 0.2, remediacao_manut: 1, desmob_remediacao: 0.2,
  colorimetro: 8, raio_influencia: 1,
};
/* Matriz atividade → palavras-chave do TIPO de equipamento.
   NÃO é mais constante fixa: vive no estado (d.equipPorAtividade), começa VAZIA e é alimentada
   pelo usuário do GeoópS na aba de cadastro. O Motor casa cada palavra-chave com o campo "tipo"
   do equipamento (case-insensitive). Formato de cada entrada: { ativId: ["palavra1","palavra2"] }.
   Ex. quando alimentada: { multiparam: ["multiparâmetro"], pid: ["pid","voc"], nivel_dagua: ["nível"] }. */
/* Unidade de medida da produtividade de cada atividade (para a tabela de metas) */
const UNID_PROD = {
  esteira_biosonda: "m/dia", esteira_geoprobe: "m/dia", sond_caminhao: "m/dia",
  oip_hpt: "m/dia", mip_hpt: "m/dia", bailer: "amostras/dia", bx_vazao: "amostras/dia",
  nivel_dagua: "poços/dia", poco_monit: "m/dia", tamponamento: "poços/dia", topo_rtk: "pontos/dia",
  topo_estacao: "pontos/dia", multiparam: "leituras/dia", pid: "leituras/dia", psg: "pontos/dia",
  poco_vapor: "poços/dia", amostr_vapor: "amostras/dia", injecao: "Litros/dia", injecao_montagem: "Horas", remediacao_inst: "Sistema/semana", remediacao_manut: "Sistema/dia", remediacao_oper: "—", acabamento_poco: "poços/dia",
  desmob_remediacao: "Sistema/semana", escavacao: "m³/dia", desmont_ind: "diárias", soil_mixing: "m³/dia",
  lab_cromato: "amostras/dia", colorimetro: "Análises/dia", raio_influencia: "Ensaios/dia",
  descricao_solo: "Amostras/dia",
  sond_liner: "m/dia", sond_dualtube: "m/dia", sond_hollow: "m/dia", sond_injecao: "m/dia",
};
/* Meta de produtividade real medida (unidades/dia por equipe). Editável na aba Custos.
   Hoje a produtividade independe do equipamento; a estrutura está pronta para evoluir para matriz por equipamento. */
const PROD_META_PADRAO = { ...PROD_DIA };
const PRIORIDADES = ["Alta", "Média", "Baixa"];
/* Escala de valores — pesos (0–10) que a IA usa para hierarquizar a decisão.
   Qualidade técnico-operacional alta por padrão; documentos não bloqueiam. */
const PESOS_PADRAO = { qualidade: 9, custo: 7, rota: 6, tempo: 6, proximidade: 7, conformidade: 4 };
const PESOS_CRITERIOS = [
  ["qualidade", "Qualidade técnico-operacional", "aptidão e experiência da equipe para o serviço"],
  ["custo", "Redução de custo", "minimizar o custo estimado da execução"],
  ["rota", "Otimização de rotas", "menor deslocamento e logística mais eficiente"],
  ["tempo", "Redução do tempo de execução", "concluir o campo no menor prazo"],
  ["proximidade", "Proximidade de pessoas/veículos", "priorizar quem está mais perto da obra"],
  ["conformidade", "Conformidade documental/legal", "NRs, ASO, docs — não bloqueia, apenas pondera"],
];
/* Parâmetros de custo que alimentam o cálculo da equipe em campo.
   diaria = R$/dia de uso · fixo = valor fechado por evento/mobilização */
const CUSTOS_PADRAO = {
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
/* Unidades reconhecidas para preços unitários */
const UNIDADES_CUSTO = ["R$/km", "R$/m", "R$/ponto", "R$/unid", "R$/poço", "R$/amostra", "R$/dia", "R$/hora", "R$/campanha", "R$/m²", "R$/L"];
/* Matriz de PREÇOS UNITÁRIOS — lista livre de itens com unidade própria.
   O Motor cruza a quantidade do serviço (lida do executivo) × preço unitário. */
const PRECOS_UNITARIOS_PADRAO = [
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
/* papéis possíveis numa equipe de campo */
const PAPEIS = [
  { id: "sondador", label: "Sondador" },
  { id: "auxiliar", label: "Auxiliar de campo" },
  { id: "tecnico", label: "Técnico de campo" },
  { id: "tecnico_esp", label: "Técnico especialista" },
  { id: "amostrador", label: "Amostrador / coletor" },
  { id: "topografo", label: "Topógrafo" },
  { id: "operador", label: "Operador de equipamento" },
  { id: "encarregado", label: "Encarregado de campo" },
];

/* ============ USUÁRIOS E CONTROLE DE ACESSO ============
   Tipos de ator: master (admin total), alimentador (dono de uma ou mais matrizes),
   gerente (carteira GCxx — só visualiza/aprova/solicita revisão), gestao (leitura geral).
   Cada matriz/aba é identificada por uma chave de "domínio de edição". */
const DOMINIOS_EDICAO = {
  colab: "RH / Colaboradores", apt: "Matriz de Aptidões", sms: "SMS & NRs / Docs Obrigatórios",
  ct: "Contratos", cond: "Condicionantes", tap: "TAPs (Holmes)", planos: "Planejamento", prog: "Operacional (campo)",
  regras: "Regras de Equipe", maq: "Máquinas", frota: "Frota", equip: "Equipamentos", loc: "Localização", custos: "Eficiência",
};
/* qual domínio de edição cada aba exige */
const ABA_DOMINIO = {
  colab: "colab", apt: "apt", sms: "sms", docs: "sms", cli: "ct", ct: "ct", cond: "cond", comercial: "ct",
  tap: "tap", prog: "prog", regras: "custos", maq: "maq", frota: "frota", equip: "equip",
  loc: "loc", disp: "colab", motor: "planos", dash: null, custos: "custos", gerente: null, simular: "planos", inteligencia: "planos", planos: "planos", autoriz: null,
};
/* ACESSOS por aba/matriz: cada acesso libera a EDIÇÃO de um domínio; o resto é visualização.
   "responsavel" é a(s) pessoa(s) designada(s). senha individual por acesso. */
const ACESSOS = [
  /* Acesso total — Diretoria (CEO, CFO, COO) */
  { id: "ceo", aba: "Diretor Presidente — CEO", dom: "*", senha: "emc", tipo: "master", responsavel: "CEO" },
  { id: "cfo", aba: "Diretor Financeiro — CFO", dom: "*", senha: "maio", tipo: "master", responsavel: "CFO" },
  { id: "coo", aba: "Diretora de Operações — COO", dom: "*", senha: "thati", tipo: "master", responsavel: "COO" },
  /* Grandes Áreas — matrizes de alimentação do sistema */
  { id: "equipe", aba: "Equipes", dom: "colab", senha: "aline", tipo: "alimentador", responsavel: "Aline" },
  { id: "qualidade", aba: "Qualidade", dom: "apt", senha: "luciane", tipo: "alimentador", responsavel: "Luciane" },
  { id: "sms", aba: "Saúde e Segurança", dom: "sms", senha: "maira", tipo: "alimentador", responsavel: "Maíra" },
  { id: "comercial", aba: "Comercial", doms: ["ct", "cond", "tap"], dom: "ct", senha: "matheus", tipo: "alimentador", responsavel: "Matheus" },
  { id: "gestaoop", aba: "Gestor de Operações", dom: "planos", senha: "andre", tipo: "alimentador", responsavel: "Gestor de Operações" },
  { id: "coordop", aba: "Coordenador de Operações", dom: "prog", senha: "coord", tipo: "alimentador", responsavel: "Coordenador de Operações" },
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
const podeEditarDominio = (user, dom) => {
  if (!user || !dom) return false;
  if (user.tipo === "master" || user.dom === "*") return true;
  if (user.tipo === "alimentador") return user.dom === dom || (Array.isArray(user.doms) && user.doms.includes(dom));
  return false; // gerente e gestao não editam
};
/* papel -> competências da matriz que o qualificam (para o Motor casar pessoa<->papel) */
const PAPEL_COMPETENCIAS = {
  sondador: ["esteira_geoprobe", "esteira_biosonda", "sond_caminhao", "sond_liner", "sond_dualtube", "sond_hollow", "sond_injecao", "poco_monit", "tamponamento"],
  amostrador: ["bx_vazao", "bailer", "multiparam", "pid", "nivel_dagua", "amostr_vapor", "psg", "descricao_solo"],
  tecnico: ["descricao_solo", "remediacao_oper", "remediacao_inst", "injecao", "injecao_montagem", "colorimetro", "poco_vapor", "multiparam"],
  tecnico_esp: ["mip_hpt", "oip_hpt", "lab_cromato", "raio_influencia", "soil_mixing"],
  topografo: ["topo_rtk", "topo_estacao"],
  operador: ["escavacao", "soil_mixing", "sond_caminhao", "esteira_geoprobe"],
  encarregado: ["desmont_ind", "remediacao_inst", "remediacao_manut"],
  auxiliar: [], // auxiliar não exige competência específica
};
/* mapeamento papel(antigo) -> cargo(novo) — usado para migrar as regras-padrão para a nova lógica de cargos */
const PAPEL_PARA_CARGO = {
  sondador: "Operador de Sondagem",
  auxiliar: "Auxiliar de Operações",
  tecnico: "Técnico de Operações",
  tecnico_esp: "Especialista Técnico de Operações",
  amostrador: "Técnico de Operações",
  topografo: "Técnico de Operações",
  operador: "Operador de Sondagem",
  encarregado: "Encarregado de Operações",
};
/* normaliza uma regra para o formato de CARGOS. Converte regras antigas (papeis) automaticamente. */
const normalizarRegra = (regra) => {
  if (!regra) return { cargos: [], exigeRespTec: false };
  if (Array.isArray(regra.cargos)) return regra; // já está no novo formato
  /* formato antigo (papeis) -> converte para cargos, agregando por cargo (mantém o maior nível/qtd) */
  const cargos = [];
  (regra.papeis || []).forEach((p) => {
    const cargo = PAPEL_PARA_CARGO[p.papel] || "Técnico de Operações";
    const ex = cargos.find((c) => c.cargo === cargo);
    if (ex) { ex.nivelMin = Math.max(ex.nivelMin, p.nivelMin); ex.qtd = Math.max(ex.qtd, p.qtd); }
    else cargos.push({ cargo, nivelMin: p.nivelMin, qtd: p.qtd });
  });
  return { cargos, exigeRespTec: !!regra.exigeRespTec };
};
const NIVEL_NUM = { na: 0, jr: 1, pl: 2, sr: 3, esp: 4 };
/* distância rodoviária estimada entre duas cidades (por nome), via GAZ; null se alguma não geocodificável */
const distEntreCidades = (cidadeA, cidadeB) => {
  const a = GAZ[normCity(cidadeA)], b = GAZ[normCity(cidadeB)];
  if (!a || !b) return null;
  return Math.round(havKm(a.c, b.c) * 1.25);
};
/* ---- RDO como fonte da verdade (Fase 3): cruza apontamentos × OS por IDGEO ----
   Devolve previsto×realizado por atividade, % de avanço, e custo realizado×orçado.
   Honesto sobre o que é medido (km, dias apontados, produção) vs. estimado. */
function calcularRealizado(os, apts, custos) {
  const lst = Array.isArray(apts) ? apts : [];
  const C = custos || {};
  /* previsto por atividade (da OS) × realizado (somatório do RDO) */
  const prev = {}; (os?.atividades || []).forEach((a) => { if (a.id) prev[a.id] = (prev[a.id] || 0) + (+a.qtd || 0); });
  const real = {}; lst.forEach((ap) => Object.entries(ap.itens || {}).forEach(([k, v]) => { real[k] = (real[k] || 0) + (+v || 0); }));
  const ativIds = Array.from(new Set([...Object.keys(prev), ...Object.keys(real)]));
  const porAtividade = ativIds.map((id) => {
    const p = prev[id] || 0, r = real[id] || 0;
    return { id, label: (ATIVIDADES.find((x) => x.id === id) || {}).short || id, unid: UNID_PROD[id] || "un", previsto: p, realizado: r, pct: p > 0 ? Math.round((r / p) * 100) : null };
  });
  /* avanço global: média das razões realizado/previsto, limitada a 100% por item */
  const comPrev = porAtividade.filter((a) => a.previsto > 0);
  const avancoPct = comPrev.length ? Math.round(comPrev.reduce((s, a) => s + Math.min(1, a.realizado / a.previsto), 0) / comPrev.length * 100) : null;
  /* custo realizado a partir do RDO: km rodado + dias apontados (materiais/diárias) — medido onde há dado */
  const kmReal = lst.reduce((s, ap) => s + (+ap.km || 0), 0);
  const horasReal = lst.reduce((s, ap) => s + (+ap.horasTecnico || 0), 0);
  const diasApontados = new Set(lst.map((ap) => ap.data).filter(Boolean)).size;
  const nEquipe = (os?.equipe || []).filter((e) => !e.vazio).length || 1;
  const custoKm = kmReal * (+C.kmRodado || 0);
  const custoMateriais = diasApontados * (+C.materiaisDiaEquipe || 0);
  const custoEstadia = diasApontados * nEquipe * ((+C.hospedagemPessoaDia || 0) + (+C.alimentacaoPessoaDia || 0));
  const custoRealizado = Math.round(custoKm + custoMateriais + custoEstadia);
  const custoOrcado = +os?.custoTotal || 0;
  const custoPct = custoOrcado > 0 ? Math.round((custoRealizado / custoOrcado) * 100) : null;
  /* não-conformidades registradas */
  const naoConformidades = lst.filter((ap) => ap && ap.naoConforme).length;
  return {
    temRDO: lst.length > 0, diasApontados, kmReal, horasReal,
    porAtividade, avancoPct,
    custoRealizado, custoOrcado, custoPct,
    naoConformidades,
  };
}
/* ---- Análise DIÁRIA do RDO (KPIs): para cada dia, decompõe o custo real e compara
   a produtividade realizada × esperada (da aba Eficiência). É o coração econômico:
   recursos × custos × produtividade real vs. projetada.
   Fórmulas (confirmadas com o usuário):
     - HH (hora-homem) = custo mensal ÷ diasUteis ÷ 8h
     - produtividade esperada = produtividade[atividade] da aba Eficiência (un/dia por pessoa)
     - dia de trânsito: km × R$/km + HH × horas dirigindo
     - dia de campo: HH × horas + depreciações + materiais + estadia */
function analisarDiasRDO(os, apts, custos, colaboradores, produtividade) {
  const lst = Array.isArray(apts) ? apts : [];
  const C = custos || {};
  const PROD = produtividade || {};
  const HORAS_DIA = 8;
  const DIAS_UTEIS = +C.diasUteisMes || 22;
  const kmRodado = +C.kmRodado || 2.8;
  const equipe = (os?.equipe || []).filter((e) => !e.vazio);
  const nEquipe = equipe.length || 1;
  /* custo HH médio da equipe (R$/hora): custo mensal ÷ dias úteis ÷ 8h */
  const custoColab = (mat) => {
    const c = (colaboradores || []).find((x) => x.mat === mat);
    return c ? (+c.custoTotal || 0) : 0;
  };
  const hhEquipe = equipe.length
    ? equipe.reduce((s, e) => s + custoColab(e.mat), 0) / equipe.length
    : 0;
  const hhHora = (hhEquipe / DIAS_UTEIS) / HORAS_DIA; // R$/hora por pessoa (média)
  /* depreciações diárias dos recursos efetivamente alocados na OS */
  const deprMaquinaDia = os?.maquina ? (+C.deprMaquinaDia || 0) : 0;
  const nEquip = (os?.equipamentos || []).length;
  const deprEquipDia = nEquip * (+C.deprEquipamentoDia || 0);
  const veicLeve = os?.veiculo && /leve|saveiro|utilit/i.test(os.veiculo.tipo || os.veiculo.veiculo || "");
  const veiculoDia = os?.veiculo ? (veicLeve ? (+C.veiculoLeveDia || 0) : (+C.veiculoPesadoDia || 0)) : 0;
  const materiaisDia = +C.materiaisDiaEquipe || 0;
  const estadiaDia = nEquipe * ((+C.hospedagemPessoaDia || 0) + (+C.alimentacaoPessoaDia || 0));

  const dias = lst.slice().sort((a, b) => (a.data < b.data ? -1 : 1)).map((ap) => {
    const horas = +ap.horasTecnico || HORAS_DIA;
    const km = +ap.km || 0;
    const itens = ap.itens || {};
    const totalProduzido = Object.values(itens).reduce((s, v) => s + (+v || 0), 0);
    /* heurística: dia de TRÂNSITO quando rodou muito e produziu pouco/nada */
    const ehTransito = km >= 150 && totalProduzido === 0;
    /* custo de mão de obra do dia: HH × horas × nº de pessoas */
    const custoMO = Math.round(hhHora * horas * nEquipe);
    const custoKmDia = Math.round(km * kmRodado);
    let custoTotal, categoria, decomposicao;
    if (ehTransito) {
      categoria = "transito";
      custoTotal = custoMO + custoKmDia;
      decomposicao = [
        { label: `Deslocamento (${km} km × ${fmtBRL(kmRodado)}/km)`, valor: custoKmDia },
        { label: `Mão de obra dirigindo (${horas}h × ${nEquipe} pessoa(s))`, valor: custoMO },
      ];
    } else {
      categoria = "campo";
      custoTotal = custoMO + custoKmDia + deprMaquinaDia + deprEquipDia + veiculoDia + materiaisDia + estadiaDia;
      decomposicao = [
        { label: `Mão de obra (${horas}h × ${nEquipe} pessoa(s))`, valor: custoMO },
        { label: `Deslocamento na frente (${km} km)`, valor: custoKmDia },
        ...(deprMaquinaDia ? [{ label: "Depreciação máquina", valor: deprMaquinaDia }] : []),
        ...(deprEquipDia ? [{ label: `Depreciação equipamentos (${nEquip})`, valor: deprEquipDia }] : []),
        ...(veiculoDia ? [{ label: "Veículo", valor: veiculoDia }] : []),
        { label: "Materiais", valor: materiaisDia },
        { label: `Estadia (${nEquipe} pessoa(s))`, valor: estadiaDia },
      ];
    }
    /* produtividade: realizado × esperado por atividade no dia */
    const ativs = Object.entries(itens).map(([id, qReal]) => {
      const espPorPessoa = +PROD[id] || 0;
      const esperadoDia = espPorPessoa * nEquipe; // meta do dia para a equipe
      const pct = esperadoDia > 0 ? Math.round((qReal / esperadoDia) * 100) : null;
      return { id, label: (ATIVIDADES.find((x) => x.id === id) || {}).short || id, realizado: +qReal || 0, esperado: esperadoDia, pct };
    });
    /* desvio de produtividade do dia: média dos pct das atividades com meta */
    const comMeta = ativs.filter((a) => a.esperado > 0);
    const prodPct = comMeta.length ? Math.round(comMeta.reduce((s, a) => s + (a.pct || 0), 0) / comMeta.length) : null;
    const abaixo = prodPct != null && prodPct < 80 && !ehTransito; // tolerância de 20%
    return {
      data: ap.data, categoria, horas, km, custoTotal, custoMO, custoKmDia, decomposicao,
      ativs, prodPct, abaixo, naoConforme: !!ap.naoConforme, descNC: ap.descNC || "", obs: ap.obs || "",
    };
  });

  /* estimativa de atraso: soma do déficit de produção convertido em dias.
     Para cada atividade, dias_extra = (produção que faltou no ritmo esperado) ÷ (esperado/dia). */
  const totalReal = {}; lst.forEach((ap) => Object.entries(ap.itens || {}).forEach(([k, v]) => { totalReal[k] = (totalReal[k] || 0) + (+v || 0); }));
  const diasComProducao = dias.filter((d) => d.categoria === "campo").length || 1;
  let diasAtrasoEstimado = 0;
  Object.entries(totalReal).forEach(([id, qReal]) => {
    const espDia = (+PROD[id] || 0) * nEquipe;
    if (espDia <= 0) return;
    const esperadoAteAgora = espDia * diasComProducao;
    if (qReal < esperadoAteAgora) {
      const deficit = esperadoAteAgora - qReal;
      diasAtrasoEstimado += deficit / espDia;
    }
  });
  diasAtrasoEstimado = Math.round(diasAtrasoEstimado * 10) / 10;

  const custoTotalReal = dias.reduce((s, d) => s + d.custoTotal, 0);
  const diasAbaixo = dias.filter((d) => d.abaixo).length;
  return {
    temDados: dias.length > 0,
    dias, custoTotalReal, hhHora: Math.round(hhHora * 100) / 100,
    diasAtrasoEstimado, diasAbaixo,
    custoOrcado: +os?.custoTotal || 0,
  };
}
/* ============================================================================
   MÁQUINA DE ESTADOS ÚNICA DO PROJETO (IDGEO)
   Fonte única da verdade do fluxo operacional. Cada projeto tem UM estado.
   Substitui os antigos status/statusTap/status misturados.
   Cada transição declara: papéis que podem fazer, dados obrigatórios e efeito.
   ============================================================================ */
const ESTADOS_PROJETO = {
  rascunho:                       { ordem: 0,  rotulo: "Rascunho",                       cor: "gray"  },
  aguardando_plano:               { ordem: 1,  rotulo: "Aguardando plano",               cor: "amber" },
  plano_recebido:                 { ordem: 2,  rotulo: "Plano recebido",                 cor: "blue"  },
  em_analise_ia:                  { ordem: 3,  rotulo: "Em análise (IA)",                cor: "blue"  },
  escopo_validado:                { ordem: 4,  rotulo: "Escopo validado",                cor: "blue"  },
  pre_agendado:                   { ordem: 5,  rotulo: "Pré-agendado",                   cor: "amber" },
  aguardando_aprovacao_gerente:   { ordem: 6,  rotulo: "Aguardando gerente",             cor: "amber" },
  aguardando_aprovacao_operacoes: { ordem: 7,  rotulo: "Aguardando operações",           cor: "amber" },
  os_aprovada:                    { ordem: 8,  rotulo: "OS aprovada",                    cor: "green" },
  em_campo:                       { ordem: 9,  rotulo: "Em campo",                       cor: "green" },
  campo_concluido:                { ordem: 10, rotulo: "Campo concluído",                cor: "green" },
  relatorio_em_elaboracao:        { ordem: 11, rotulo: "Relatório em elaboração",        cor: "blue"  },
  concluido:                      { ordem: 12, rotulo: "Concluído",                      cor: "green" },
  resultados_projeto:             { ordem: 13, rotulo: "Resultados do projeto",          cor: "green" },
  cancelado:                      { ordem: -1, rotulo: "Cancelado",                      cor: "red"   },
};

/* Papéis lógicos usados nas regras (resolvidos contra o login real):
   gestor = Gestor de Operações (dom planos) ou master
   gerente = Gerente de Projetos da carteira
   operacoes = Coordenador/Gestor de Operações (rota/logística)
   coordenador = Coordenador de Operações (dom prog)
   master = Diretoria (CEO/CFO/COO) */
const TRANSICOES_PROJETO = [
  { de: "rascunho",                       para: "aguardando_plano",               papeis: ["gestor", "master"],     exige: ["cliente", "contrato", "tap"],   efeito: "Projeto entra na fila de planejamento." },
  { de: "aguardando_plano",               para: "plano_recebido",                 papeis: ["gestor", "master"],     exige: ["plano"],                        efeito: "Habilita a leitura por IA." },
  { de: "plano_recebido",                 para: "em_analise_ia",                  papeis: ["gestor", "master"],     exige: ["plano"],                        efeito: "IA lê contrato e plano e extrai o escopo." },
  { de: "em_analise_ia",                  para: "escopo_validado",                papeis: ["gestor", "master"],     exige: ["quantitativos"],                efeito: "Libera o Motor para gerar cenários de alocação." },
  { de: "escopo_validado",                para: "pre_agendado",                   papeis: ["gestor", "master"],     exige: ["cenario", "janela", "recursos"], efeito: "Reserva (trava) os recursos na janela escolhida." },
  { de: "pre_agendado",                   para: "aguardando_aprovacao_gerente",   papeis: ["gestor", "master"],     exige: [],                               efeito: "Submete o pré-agendamento ao gerente da carteira." },
  { de: "aguardando_aprovacao_gerente",   para: "aguardando_aprovacao_operacoes", papeis: ["gerente", "master"],    exige: ["aprovacao"],                    efeito: "Aprovação do gerente; segue para operações/rotas." },
  { de: "aguardando_aprovacao_operacoes", para: "os_aprovada",                    papeis: ["operacoes", "master"],  exige: ["aprovacao"],                    efeito: "Emite a OS oficial e BLOQUEIA os recursos definitivamente." },
  { de: "os_aprovada",                    para: "em_campo",                       papeis: ["coordenador", "master"], exige: ["dataInicio"],                  efeito: "Projeto ativo em campo; habilita o RDO diário." },
  { de: "em_campo",                       para: "campo_concluido",                papeis: ["coordenador", "master"], exige: [],                              efeito: "Encerra apontamentos e libera os recursos." },
  { de: "campo_concluido",                para: "relatorio_em_elaboracao",        papeis: ["gestor", "master"],     exige: [],                               efeito: "Inicia a consolidação de prazos, metas e custos." },
  { de: "relatorio_em_elaboracao",        para: "concluido",                      papeis: ["gestor", "master"],     exige: ["relatorio"],                    efeito: "Relatório final emitido; projeto fechado." },
  { de: "concluido",                      para: "resultados_projeto",             papeis: ["gestor", "master"],     exige: [],                               efeito: "Consolida o resultado (prazo, meta, custo por IDGEO)." },
  /* cancelamento: livre até antes do campo; em campo exige master (diretoria) + motivo */
  { de: "rascunho",                       para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Projeto cancelado." },
  { de: "aguardando_plano",               para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Projeto cancelado." },
  { de: "plano_recebido",                 para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Projeto cancelado." },
  { de: "em_analise_ia",                  para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Projeto cancelado." },
  { de: "escopo_validado",                para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Projeto cancelado." },
  { de: "pre_agendado",                   para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Cancelado; libera os recursos reservados." },
  { de: "aguardando_aprovacao_gerente",   para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Cancelado; libera os recursos reservados." },
  { de: "aguardando_aprovacao_operacoes", para: "cancelado", papeis: ["gestor", "master"], exige: ["motivo"], efeito: "Cancelado; libera os recursos reservados." },
  { de: "os_aprovada",                    para: "cancelado", papeis: ["master"], exige: ["motivo"], efeito: "Cancelado; libera os recursos bloqueados." },
  { de: "em_campo",                       para: "cancelado", papeis: ["master"], exige: ["motivo", "justificativaDiretoria"], efeito: "Cancelamento em campo (exige justificativa da diretoria); libera recursos." },
];

/* mapa dos estados ANTIGOS (statusTap/status) para os novos, para migração sem órfãos */
const MAPA_ESTADO_ANTIGO = {
  "Aguardando Plano de Trabalho": "aguardando_plano",
  "Plano de Trabalho recebido": "plano_recebido",
  "Aguardando programação": "escopo_validado",
  "Programado": "pre_agendado",
  "Pré-agendado": "pre_agendado",
  "Pré-agendamento": "pre_agendado",
  "Aguardando validação": "aguardando_aprovacao_gerente",
  "Aguardando confirmação": "aguardando_aprovacao_gerente",
  "Aguardando aprovação": "aguardando_aprovacao_gerente",
  "Validado": "os_aprovada",
  "Aprovada": "os_aprovada",
  "Em campo": "em_campo",
  "Concluído": "concluido",
  "Concluída": "concluido",
  "Rejeitado": "cancelado",
  "Cancelado": "cancelado",
};

/* resolve os papéis lógicos de um usuário (para checar transições) */
function papeisDoUsuario(user, ctx) {
  const ehMaster = ctx && ctx.ehMaster;
  const pode = (dom) => ctx && ctx.podeEditarDominio && ctx.podeEditarDominio(user, dom);
  const ehGer = ctx && ctx.ehGerente;
  const lista = [];
  if (ehMaster) lista.push("master");
  if (ehMaster || pode("planos")) lista.push("gestor", "operacoes");
  if (ehMaster || pode("prog")) lista.push("coordenador", "operacoes");
  if (ehMaster || ehGer) lista.push("gerente");
  return [...new Set(lista)];
}

/* verifica se uma transição é permitida; retorna { ok, motivo, transicao } */
function podeTransicionar(estadoAtual, estadoDestino, user, ctx, dadosPresentes) {
  const t = TRANSICOES_PROJETO.find((x) => x.de === estadoAtual && x.para === estadoDestino);
  if (!t) return { ok: false, motivo: `Transição inválida: ${estadoAtual} → ${estadoDestino} não é permitida no fluxo.` };
  const meus = papeisDoUsuario(user, ctx);
  if (!t.papeis.some((p) => meus.includes(p))) {
    return { ok: false, motivo: `Você não tem permissão para esta transição. Apenas: ${t.papeis.join(", ")}.` };
  }
  const faltam = (t.exige || []).filter((d) => !(dadosPresentes || {})[d]);
  if (faltam.length) {
    return { ok: false, motivo: `Dados obrigatórios ausentes: ${faltam.join(", ")}.` };
  }
  return { ok: true, transicao: t };
}

/* lista as transições possíveis a partir de um estado, para um usuário */
function transicoesDisponiveis(estadoAtual, user, ctx) {
  const meus = papeisDoUsuario(user, ctx);
  return TRANSICOES_PROJETO.filter((t) => t.de === estadoAtual && t.papeis.some((p) => meus.includes(p)));
}

/* regra-padrão de composição por atividade (papéis, nível mínimo 0-4, quantidade) */
const REGRAS_PADRAO = {
  esteira_geoprobe: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  esteira_biosonda: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  sond_caminhao: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 2 }], exigeRespTec: false },
  sond_liner: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  sond_dualtube: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  sond_hollow: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  sond_injecao: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  mip_hpt: { papeis: [{ papel: "tecnico_esp", nivelMin: 4, qtd: 1 }, { papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: true },
  oip_hpt: { papeis: [{ papel: "tecnico_esp", nivelMin: 4, qtd: 1 }, { papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: true },
  lab_cromato: { papeis: [{ papel: "tecnico_esp", nivelMin: 3, qtd: 1 }], exigeRespTec: false },
  remediacao_inst: { papeis: [{ papel: "tecnico", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 2, qtd: 1 }], exigeRespTec: true },
  remediacao_manut: { papeis: [{ papel: "tecnico", nivelMin: 3, qtd: 1 }], exigeRespTec: false },
  remediacao_oper: { papeis: [{ papel: "tecnico", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  injecao: { papeis: [{ papel: "tecnico", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  injecao_montagem: { papeis: [{ papel: "tecnico", nivelMin: 2, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  soil_mixing: { papeis: [{ papel: "operador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: true },
  poco_monit: { papeis: [{ papel: "sondador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  bx_vazao: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  bailer: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  multiparam: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  nivel_dagua: { papeis: [{ papel: "amostrador", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  topo_rtk: { papeis: [{ papel: "topografo", nivelMin: 3, qtd: 1 }], exigeRespTec: false },
  topo_estacao: { papeis: [{ papel: "topografo", nivelMin: 3, qtd: 1 }], exigeRespTec: false },
  tamponamento: { papeis: [{ papel: "sondador", nivelMin: 2, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  descricao_solo: { papeis: [{ papel: "tecnico", nivelMin: 3, qtd: 1 }], exigeRespTec: false },
  poco_vapor: { papeis: [{ papel: "tecnico", nivelMin: 2, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  amostr_vapor: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  psg: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  raio_influencia: { papeis: [{ papel: "tecnico_esp", nivelMin: 4, qtd: 1 }, { papel: "tecnico", nivelMin: 2, qtd: 1 }], exigeRespTec: true },
  colorimetro: { papeis: [{ papel: "tecnico", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
  escavacao: { papeis: [{ papel: "operador", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  desmont_ind: { papeis: [{ papel: "encarregado", nivelMin: 3, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 2 }], exigeRespTec: true },
  desmob_remediacao: { papeis: [{ papel: "tecnico", nivelMin: 2, qtd: 1 }, { papel: "auxiliar", nivelMin: 1, qtd: 1 }], exigeRespTec: false },
  pid: { papeis: [{ papel: "amostrador", nivelMin: 2, qtd: 1 }], exigeRespTec: false },
};
/* heurística: trecho do Tipo de Serviço (Holmes) -> atividades prováveis */
const SUGEST_SERV = [
  ["monitoramento", ["nivel_dagua", "bx_vazao", "multiparam"]],
  ["analitico", ["bx_vazao", "multiparam"]],
  ["vapor", ["poco_vapor", "amostr_vapor", "psg"]],
  ["diagnostico", ["esteira_geoprobe", "descricao_solo", "poco_monit", "bx_vazao"]],
  ["investigacao", ["esteira_geoprobe", "descricao_solo", "poco_monit", "bx_vazao"]],
  ["alta resolucao", ["esteira_geoprobe", "mip_hpt", "descricao_solo"]],
  ["geoprobe", ["esteira_geoprobe", "descricao_solo"]],
  ["labmovel", ["lab_cromato", "oip_hpt", "mip_hpt"]],
  ["laboratorio", ["lab_cromato"]],
  ["alocacao de sistema", ["remediacao_inst", "remediacao_oper", "injecao"]],
  ["executivo de remediacao", ["remediacao_inst", "remediacao_oper", "injecao", "injecao_montagem", "soil_mixing"]],
  ["injecao", ["injecao", "injecao_montagem", "sond_injecao", "nivel_dagua"]],
  ["injeção", ["injecao", "injecao_montagem", "sond_injecao", "nivel_dagua"]],
  ["aplicacao de produtos", ["injecao"]],
  ["teste piloto", ["raio_influencia", "colorimetro", "injecao"]],
];
const sugerirAtividades = (tipoServico) => {
  const txt = norm((tipoServico || []).join(" "));
  const ids = [];
  SUGEST_SERV.forEach(([trecho, lista]) => { if (txt.includes(trecho)) lista.forEach((id) => { if (!ids.includes(id)) ids.push(id); }); });
  return ids;
};
const STATUS_TAP = ["Aguardando Plano de Trabalho", "Plano de Trabalho recebido", "Pré-agendado", "Em campo", "Concluído", "Cancelado"];
/* mapeamento por cabeçalho do Holmes: trecho normalizado -> campo */
const TAP_MAPA = [
  ["idgeo", "idgeo"],
  ["nome do projeto", "projeto"],
  ["carteira", "carteira"],
  ["e mail do gerente", "gerenteEmail"],
  ["gerente do projeto", "gerente"],
  ["nome do cliente", "cliente"],
  ["cnpj do cliente", "cnpj"],
  ["cidade", "cidade"],
  ["contato do cliente", "contato"],
  ["valor do contrato", "valor"],
  ["margem de lucro", "margem"],
  ["data criacao", "dataCriacao"],
  ["data de entrada em campo", "entradaCampo"],
  ["prazo de mobilizacao", "mobilizacao"],
  ["entrega de relatorio", "entregaRelatorio"],
  ["agendamento de integracao", "prazoIntegracao"],
  ["envio das documentacoes", "prazoDocsMob"],
  ["plano de trabalho", "prazoPlanoTrab"],
  ["data do kickoff", "kickoff"],
  ["menor que 15 dias", "urgente15"],
  ["expectativa de prazo", "expectativa"],
  ["riscos do projeto", "riscos"],
  ["restricoes do projeto", "restricoes"],
  ["premissas operacionais", "premOper"],
  ["premissas tecnicas", "premTec"],
  ["premissas estabelecidas", "premNeg"],
  ["premissas estrategicas", "premEstr"],
  ["expectativa de metas", "metas"],
  ["atendimentos urgentes", "urgencias"],
  ["riscos de multas", "multas"],
  ["autor", "autor"],
];
const tapCampoDoHeader = (h) => {
  const k = norm(h);
  if (!k) return null;
  if (k === "uf") return "uf";
  if (k === "tipo de servico") return "tipoServico"; // não casa com "tipo de servico - XXX"
  const hit = TAP_MAPA.find(([trecho]) => k.includes(trecho));
  return hit ? hit[1] : null;
};
const cnpjKey = (s) => (s || "").replace(/\D/g, "");
const prazoStatus = (iso) => {
  if (!iso) return { tag: "Não informado", c: T.amber, bg: "#fff", dash: true };
  const dias = Math.floor((new Date(iso) - new Date(hojeISO())) / 864e5);
  if (dias < 0) return { tag: `Vencido · ${fmtData(iso)}`, c: "#fff", bg: T.red };
  if (dias <= 15) return { tag: `Em ${dias}d · ${fmtData(iso)}`, c: T.green900, bg: "#F0CC7E" };
  return { tag: `${fmtData(iso)} (${dias}d)`, c: T.green700, bg: T.green100 };
};
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const CIDADES_POR_UF = {"AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"], "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo", "União dos Palmares"], "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"], "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tabatinga", "Tefé"], "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Ilhéus", "Lauro de Freitas", "Barreiras", "Porto Seguro", "Simões Filho", "Alagoinhas", "Teixeira de Freitas"], "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"], "DF": ["Brasília", "Ceilândia", "Taguatinga", "Gama", "Sobradinho", "Planaltina"], "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares", "Cachoeiro de Itapemirim", "Colatina", "Guarapari", "São Mateus", "Aracruz"], "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Catalão", "Itumbiara"], "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal", "Balsas"], "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde", "Primavera do Leste", "Barra do Garças"], "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina", "Aquidauana", "Sidrolândia", "Paranaíba"], "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Poços de Caldas", "Patos de Minas", "Pouso Alegre", "Teófilo Otoni", "Barbacena", "Sabará", "Varginha"], "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal", "Abaetetuba", "Cametá", "Marituba", "Bragança", "Altamira", "Tucuruí"], "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Cabedelo", "Guarabira", "Sapé"], "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá", "Araucária", "Toledo", "Apucarana", "Pinhais", "Campo Largo", "Almirante Tamandaré", "Umuarama", "Piraquara", "Cambé", "Fazenda Rio Grande"], "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão", "Igarassu", "São Lourenço da Mata"], "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Barras", "União", "Altos", "Pedro II"], "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Mesquita", "Nova Friburgo", "Barra Mansa", "Angra dos Reis", "Nilópolis", "Teresópolis", "Cabo Frio"], "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó", "Açu", "Currais Novos", "João Câmara"], "RS": ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana", "Santa Cruz do Sul", "Cachoeirinha", "Bagé", "Bento Gonçalves", "Erechim", "Guaíba"], "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura", "Jaru", "Guajará-Mirim", "Pimenta Bueno", "Ouro Preto do Oeste"], "RR": ["Boa Vista", "Rorainópolis", "Caracaraí", "Pacaraima", "Mucajaí", "Cantá", "Alto Alegre"], "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú", "Brusque", "Tubarão", "São Bento do Sul", "Caçador", "Camboriú", "Navegantes", "Concórdia", "Rio do Sul", "Araranguá"], "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Santos", "Mauá", "São José do Rio Preto", "Mogi das Cruzes", "Diadema", "Jundiaí", "Piracicaba", "Carapicuíba", "Bauru", "Itaquaquecetuba", "Franca", "São Vicente", "Praia Grande", "Guarujá", "Taubaté", "Limeira", "Suzano", "Sumaré", "Barueri", "Embu das Artes", "Marília", "Americana", "Indaiatuba", "Araraquara", "Cotia", "Jacareí", "Presidente Prudente", "Hortolândia", "Rio Claro", "Araçatuba", "Catanduva"], "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Estância", "Tobias Barreto", "Itabaianinha", "Simão Dias", "Nossa Senhora da Glória"], "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins", "Guaraí", "Tocantinópolis", "Dianópolis", "Formoso do Araguaia"]};
const TIPOS_VEIC = ["Veículo leve", "Camionete leve", "Caminhão pequeno", "Caminhão médio"];
const IMPLEMENTOS = ["Prancha", "Munck"];
const STATUS_VEIC = ["Disponível", "Em campo", "Em manutenção", "Inativo"];
const ESTADOS_EQUIP = ["Operacional", "Operacional c/ restrição", "Em manutenção", "Inativo"];
const TIPOS_EQUIP_BASE = ["Analisador multiparâmetros (pH/OD/cond/ORP)", "Analisador de gases VOC — PID", "Bomba de baixa vazão", "Medidor de nível d'água", "GPS topográfico"];
const AFAST_TIPOS = ["Doença", "Acidente", "Licença", "Outro"];
const FONTES_LOCAL = ["Ponto eletrônico", "GPS veículo", "Manual"];
const revKmStatus = (v) => {
  const km = +v.kmAtual, prox = +v.proxRevKm;
  if (v.proxRevKm === "" || v.proxRevKm == null || isNaN(prox)) return { tag: "Sem programação", c: T.amber, bg: T.amberBg };
  if (v.kmAtual === "" || v.kmAtual == null || isNaN(km)) return { tag: `Próx. ${fmtNum(prox)} km · km atual?`, c: T.amber, bg: T.amberBg };
  const falta = prox - km;
  if (falta <= 0) return { tag: `Revisão vencida · ${fmtNum(-falta)} km`, c: "#fff", bg: T.red };
  if (falta <= 1000) return { tag: `Revisão em ${fmtNum(falta)} km`, c: T.green900, bg: "#F0CC7E" };
  return { tag: `Próx. ${fmtNum(prox)} km · faltam ${fmtNum(falta)}`, c: T.green700, bg: T.green100 };
};
const situacaoVeic = (v) => {
  const loc = v.localAtual ? ` · ${v.localAtual}` : "";
  if (v.status === "Em manutenção") return { tag: `Em manutenção${loc}`, c: T.amber, bg: T.amberBg };
  if (v.status === "Inativo") return { tag: `Inativo${loc}`, c: T.gray, bg: T.grayBg };
  if (v.status === "Em campo") return { tag: `Em campo${loc}`, c: T.blue, bg: T.blueBg };
  return { tag: `Disponível · ${v.localAtual || "Matriz"}`, c: T.green700, bg: T.green100 };
};
const PLATAFORMAS = ["Caminhão", "Esteira"];
const TIPOS_SOND = [
  { id: "rotativa", label: "Rotativa" },
  { id: "dp", label: "Direct push" },
  { id: "helicoidal", label: "Helicoidal mecanizada" },
  { id: "hollow", label: "Hollow stem" },
  { id: "dual", label: "Dual tube" },
];
const ALTA_RES_OPCOES = ["MIP", "OIP", "HPT"];
const STATUS_MAQ = ["Disponível", "Em campo", "Em manutenção", "Inativa"];
const manutStatus = (iso) => {
  if (!iso) return { key: "ni", tag: "Sem programação", c: T.amber, bg: T.amberBg };
  const dias = Math.floor((new Date(iso) - new Date(hojeISO())) / 864e5);
  if (dias < 0) return { key: "atras", tag: `Atrasada · ${fmtData(iso)}`, c: "#fff", bg: T.red };
  if (dias <= 15) return { key: "v15", tag: `Em ${dias}d · ${fmtData(iso)}`, c: T.green900, bg: "#F0CC7E" };
  return { key: "ok", tag: fmtData(iso), c: T.green700, bg: T.green100 };
};
const fmtNum = (v) => (v === "" || v == null || isNaN(+v)) ? "—" : (+v).toLocaleString("pt-BR");
const situacaoMaq = (m) => {
  const loc = m.local ? ` · ${m.local}` : "";
  if (m.status === "Em manutenção") return { tag: `Em manutenção${loc}`, c: T.amber, bg: T.amberBg };
  if (m.status === "Inativa") return { tag: `Inativa${loc}`, c: T.gray, bg: T.grayBg };
  if (m.status === "Em campo") return { tag: `Em campo${loc}`, c: T.blue, bg: T.blueBg };
  return { tag: `Disponível · ${m.local || "Sede"}`, c: T.green700, bg: T.green100 };
};
const revisaoStatus = (m) => {
  const hor = +m.horimetro, prox = +m.proxRevisao;
  if (m.proxRevisao === "" || m.proxRevisao == null || isNaN(prox)) return { tag: "Sem programação", c: T.amber, bg: T.amberBg };
  if (m.horimetro === "" || m.horimetro == null || isNaN(hor)) return { tag: `Próx. ${fmtNum(prox)} h · horímetro?`, c: T.amber, bg: T.amberBg };
  const falta = prox - hor;
  if (falta <= 0) return { tag: `Revisão vencida · ${fmtNum(-falta)} h excedidas`, c: "#fff", bg: T.red };
  if (falta <= 50) return { tag: `Revisão em ${fmtNum(falta)} h`, c: T.green900, bg: "#F0CC7E" };
  return { tag: `Próx. ${fmtNum(prox)} h · faltam ${fmtNum(falta)}`, c: T.green700, bg: T.green100 };
};
const matchTipoSond = (texto) => {
  const q = norm(texto);
  if (!q) return null;
  if (q.includes("rotativ")) return "rotativa";
  if (q.includes("direct") || q === "dp") return "dp";
  if (q.includes("helicoidal")) return "helicoidal";
  if (q.includes("hollow")) return "hollow";
  if (q.includes("dual")) return "dual";
  return null;
};

const EXEMPLO = {
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
    { cliente: "Rede Sol Combustíveis", contrato: "CT-2026-044", cnpj: "81.444.219/0001-05", localidade: "Ponta Grossa", estado: "PR", projeto: "Posto BR-376 — Fase II", servico: "Monitoramento semestral + instalação de poços", valorIdgeo: 96000, valorContrato: 89000, statusCt: "Em mobilização", docs: {} },
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

/* ===== BASE DE TESTES REALISTA (39 colaboradores, frota, máquinas, equipamentos, clientes, TAPs em 7 UFs) ===== */
const EXEMPLO_BASE = {"colaboradores": [{"mat": "GEO-2001","nome": "Carlos Eduardo Nunes","cargo": "Operador de Sondagem","funcao": "Operador de Sondagem","admissao": "2015-06-17","regiao": "Curitiba","custoTotal": 8639.43,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2002","nome": "Rafael Moimentado Lima","cargo": "Operador de Sondagem","funcao": "Operador de Sondagem","admissao": "2019-06-26","regiao": "Ponta Grossa","custoTotal": 6741.94,"refMes": "2026-05","status": "Ativo","dispViagem": "indisponivel"},{"mat": "GEO-2003","nome": "Bruno Tavares Rocha","cargo": "Operador de Sondagem","funcao": "Operador de Sondagem","admissao": "2023-08-13","regiao": "Londrina","custoTotal": 8525.29,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2004","nome": "Anderson Prates Gomes","cargo": "Operador de Sondagem","funcao": "Operador de Sondagem","admissao": "2020-11-10","regiao": "Joinville","custoTotal": 7308.89,"refMes": "2026-05","status": "Ativo","dispViagem": "indisponivel"},{"mat": "GEO-2005","nome": "Diego Ferreira Souza","cargo": "Auxiliar de Operações","funcao": "Auxiliar de Operações","admissao": "2021-02-15","regiao": "Curitiba","custoTotal": 5454.4,"refMes": "2026-05","status": "Ativo","dispViagem": "indisponivel"},{"mat": "GEO-2006","nome": "Marcos Vinícius Alves","cargo": "Auxiliar de Operações","funcao": "Auxiliar de Operações","admissao": "2021-10-18","regiao": "Ponta Grossa","custoTotal": 6037.23,"refMes": "2026-05","status": "Férias","dispViagem": "sim"},{"mat": "GEO-2007","nome": "Tiago Ribeiro Martins","cargo": "Auxiliar de Operações","funcao": "Auxiliar de Operações","admissao": "2016-09-08","regiao": "São Paulo","custoTotal": 4935.16,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2008","nome": "Felipe Andrade Costa","cargo": "Auxiliar de Operações","funcao": "Auxiliar de Operações","admissao": "2015-01-27","regiao": "Campinas","custoTotal": 4632.84,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2009","nome": "Juliana Moraes Pereira","cargo": "Técnico de Operações","funcao": "Técnico de Operações","admissao": "2023-04-22","regiao": "Curitiba","custoTotal": 7830.27,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2010","nome": "Patrícia Lopes Carvalho","cargo": "Técnico de Operações","funcao": "Técnico de Operações","admissao": "2020-09-14","regiao": "Florianópolis","custoTotal": 8411.77,"refMes": "2026-05","status": "Ativo","dispViagem": "consulta"},{"mat": "GEO-2011","nome": "Renata Cordeiro Dias","cargo": "Técnico de Operações","funcao": "Técnico de Operações","admissao": "2024-03-01","regiao": "São Paulo","custoTotal": 6502.22,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2012","nome": "Gustavo Henrique Pinto","cargo": "Técnico de Operações","funcao": "Técnico de Operações","admissao": "2024-02-17","regiao": "Maringá","custoTotal": 6360.14,"refMes": "2026-05","status": "Afastado","dispViagem": "indisponivel"},{"mat": "GEO-2013","nome": "Luciana Barros Teixeira","cargo": "Especialista Técnico de Operações","funcao": "Especialista Técnico de Operações","admissao": "2024-11-23","regiao": "Curitiba","custoTotal": 11653.01,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2014","nome": "Eduardo Sampaio Reis","cargo": "Especialista Técnico de Operações","funcao": "Especialista Técnico de Operações","admissao": "2014-09-11","regiao": "Porto Alegre","custoTotal": 10191.07,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2015","nome": "Roberto Carlos Menezes","cargo": "Encarregado de Operações","funcao": "Encarregado de Operações","admissao": "2014-11-23","regiao": "Curitiba","custoTotal": 9369.33,"refMes": "2026-05","status": "Férias","dispViagem": "indisponivel"},{"mat": "GEO-2016","nome": "Sandro Oliveira Brito","cargo": "Encarregado de Operações","funcao": "Encarregado de Operações","admissao": "2014-04-22","regiao": "Belo Horizonte","custoTotal": 8517.24,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2017","nome": "Mariana Fontes Azevedo","cargo": "Geólogo","funcao": "Geólogo","admissao": "2021-01-12","regiao": "Curitiba","custoTotal": 15475.65,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2018","nome": "André Luiz Camargo","cargo": "Geólogo","funcao": "Geólogo","admissao": "2022-09-26","regiao": "Santos","custoTotal": 14542.26,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"},{"mat": "GEO-2019","nome": "Vanessa Quintino Rocha","cargo": "Engenheiro","funcao": "Engenheiro","admissao": "2024-01-28","regiao": "Curitiba","custoTotal": 16726.78,"refMes": "2026-05","status": "Ativo","dispViagem": "consulta"},{"mat": "GEO-2020","nome": "Paulo Sérgio Macedo","cargo": "Topógrafo","funcao": "Topógrafo","admissao": "2015-06-16","regiao": "Londrina","custoTotal": 6714.79,"refMes": "2026-05","status": "Ativo","dispViagem": "sim"}],"aptidoes": {"GEO-2001": {"cnhCat": "D","cnhVal": "2026-10-29","cursos": [],"treinos": [],"matriz": {"esteira_geoprobe": "sr","esteira_biosonda": "jr","sond_caminhao": "jr","sond_hollow": "sr","sond_dualtube": "sr","sond_liner": "sr","sond_injecao": "pl","descricao_solo": "sr","poco_monit": "sr","acabamento_poco": "sr","tamponamento": "pl","desmont_ind": "jr","pid": "jr","remediacao_inst": "pl","oip_hpt": "jr"},"restricoes": [],"obs": ""},"GEO-2002": {"cnhCat": "C","cnhVal": "2027-11-30","cursos": [],"treinos": [],"matriz": {"esteira_geoprobe": "sr","esteira_biosonda": "jr","sond_caminhao": "sr","sond_hollow": "pl","sond_dualtube": "jr","sond_liner": "sr","sond_injecao": "sr","descricao_solo": "pl","poco_monit": "pl","acabamento_poco": "pl","tamponamento": "jr","psg": "pl","raio_influencia": "pl","injecao": "pl","remediacao_inst": "pl"},"restricoes": [],"obs": ""},"GEO-2003": {"cnhCat": "C","cnhVal": "2027-02-19","cursos": [],"treinos": [],"matriz": {"esteira_geoprobe": "pl","esteira_biosonda": "sr","sond_caminhao": "pl","sond_hollow": "sr","sond_dualtube": "sr","sond_liner": "jr","sond_injecao": "sr","descricao_solo": "jr","poco_monit": "jr","acabamento_poco": "jr","tamponamento": "sr","poco_vapor": "pl","desmob_remediacao": "pl","psg": "jr","oip_hpt": "pl"},"restricoes": [],"obs": ""},"GEO-2004": {"cnhCat": "E","cnhVal": "2028-03-10","cursos": [],"treinos": [],"matriz": {"esteira_geoprobe": "sr","esteira_biosonda": "pl","sond_caminhao": "pl","sond_hollow": "pl","sond_dualtube": "jr","sond_liner": "pl","sond_injecao": "pl","descricao_solo": "jr","poco_monit": "jr","acabamento_poco": "jr","tamponamento": "sr","desmont_ind": "jr","lab_cromato": "pl","soil_mixing": "pl","topo_rtk": "pl"},"restricoes": [],"obs": ""},"GEO-2005": {"cnhCat": "B","cnhVal": "2028-11-21","cursos": [],"treinos": [],"matriz": {"descricao_solo": "pl","acabamento_poco": "pl","tamponamento": "jr","escavacao": "pl","nivel_dagua": "sr","remediacao_oper": "pl","raio_influencia": "pl","esteira_biosonda": "jr"},"restricoes": [],"obs": ""},"GEO-2006": {"cnhCat": "B","cnhVal": "2026-10-23","cursos": [],"treinos": [],"matriz": {"descricao_solo": "sr","acabamento_poco": "jr","tamponamento": "jr","escavacao": "jr","nivel_dagua": "sr","psg": "pl","soil_mixing": "pl"},"restricoes": [],"obs": ""},"GEO-2007": {"cnhCat": "C","cnhVal": "2027-03-19","cursos": [],"treinos": [],"matriz": {"descricao_solo": "sr","acabamento_poco": "sr","tamponamento": "sr","escavacao": "pl","nivel_dagua": "jr","oip_hpt": "jr","bx_vazao": "pl","sond_injecao": "pl"},"restricoes": [],"obs": ""},"GEO-2008": {"cnhCat": "B","cnhVal": "2028-06-14","cursos": [],"treinos": [],"matriz": {"descricao_solo": "jr","acabamento_poco": "jr","tamponamento": "sr","escavacao": "pl","nivel_dagua": "pl","esteira_geoprobe": "jr","topo_rtk": "pl","sond_caminhao": "pl","sond_injecao": "jr"},"restricoes": [],"obs": ""},"GEO-2009": {"cnhCat": "B","cnhVal": "2028-03-30","cursos": [],"treinos": [],"matriz": {"multiparam": "sr","pid": "pl","nivel_dagua": "jr","bx_vazao": "jr","bailer": "sr","colorimetro": "jr","amostr_vapor": "jr","psg": "sr","poco_vapor": "sr","descricao_solo": "jr","mip_hpt": "pl","oip_hpt": "sr","soil_mixing": "jr","sond_injecao": "jr"},"restricoes": [],"obs": ""},"GEO-2010": {"cnhCat": "B","cnhVal": "2027-01-21","cursos": [],"treinos": [],"matriz": {"multiparam": "pl","pid": "jr","nivel_dagua": "pl","bx_vazao": "jr","bailer": "pl","colorimetro": "pl","amostr_vapor": "pl","psg": "pl","poco_vapor": "pl","descricao_solo": "pl","mip_hpt": "jr","oip_hpt": "pl","soil_mixing": "pl","desmont_ind": "jr","desmob_remediacao": "jr","lab_cromato": "jr"},"restricoes": [],"obs": ""},"GEO-2011": {"cnhCat": "C","cnhVal": "2027-04-11","cursos": [],"treinos": [],"matriz": {"multiparam": "pl","pid": "sr","nivel_dagua": "sr","bx_vazao": "sr","bailer": "sr","colorimetro": "jr","amostr_vapor": "jr","psg": "sr","poco_vapor": "sr","descricao_solo": "pl","mip_hpt": "sr","oip_hpt": "sr","sond_caminhao": "jr","tamponamento": "jr","injecao": "pl","acabamento_poco": "jr"},"restricoes": [],"obs": ""},"GEO-2012": {"cnhCat": "B","cnhVal": "2027-01-22","cursos": [],"treinos": [],"matriz": {"multiparam": "jr","pid": "pl","nivel_dagua": "pl","bx_vazao": "jr","bailer": "pl","colorimetro": "pl","amostr_vapor": "jr","psg": "jr","poco_vapor": "pl","descricao_solo": "pl","mip_hpt": "pl","oip_hpt": "jr","desmob_remediacao": "jr","poco_monit": "pl"},"restricoes": [],"obs": ""},"GEO-2013": {"cnhCat": "C","cnhVal": "2028-09-28","cursos": [],"treinos": [],"matriz": {"mip_hpt": "esp","oip_hpt": "sr","lab_cromato": "sr","raio_influencia": "esp","multiparam": "esp","pid": "pl","descricao_solo": "sr","soil_mixing": "sr","nivel_dagua": "jr","sond_injecao": "pl","acabamento_poco": "jr"},"restricoes": [],"obs": ""},"GEO-2014": {"cnhCat": "C","cnhVal": "2027-11-15","cursos": [],"treinos": [],"matriz": {"mip_hpt": "pl","oip_hpt": "sr","lab_cromato": "pl","raio_influencia": "pl","multiparam": "pl","pid": "sr","descricao_solo": "sr","soil_mixing": "sr","injecao_montagem": "jr","colorimetro": "pl"},"restricoes": [],"obs": ""},"GEO-2015": {"cnhCat": "D","cnhVal": "2027-10-01","cursos": [],"treinos": [],"matriz": {"remediacao_inst": "pl","remediacao_manut": "pl","injecao": "jr","injecao_montagem": "jr","escavacao": "jr","soil_mixing": "jr","desmont_ind": "pl","colorimetro": "jr","topo_estacao": "jr","sond_caminhao": "jr","poco_monit": "jr"},"restricoes": [],"obs": ""},"GEO-2016": {"cnhCat": "D","cnhVal": "2028-09-06","cursos": [],"treinos": [],"matriz": {"remediacao_inst": "sr","remediacao_manut": "pl","injecao": "sr","injecao_montagem": "pl","escavacao": "jr","soil_mixing": "sr","desmont_ind": "pl","sond_injecao": "pl","esteira_biosonda": "pl","acabamento_poco": "pl"},"restricoes": [],"obs": ""},"GEO-2017": {"cnhCat": "B","cnhVal": "2028-09-29","cursos": [],"treinos": [],"matriz": {"descricao_solo": "esp","raio_influencia": "pl","poco_monit": "sr","mip_hpt": "pl","lab_cromato": "sr","nivel_dagua": "sr","multiparam": "sr","psg": "jr","amostr_vapor": "jr"},"restricoes": [],"obs": ""},"GEO-2018": {"cnhCat": "B","cnhVal": "2027-08-16","cursos": [],"treinos": [],"matriz": {"descricao_solo": "pl","raio_influencia": "pl","poco_monit": "sr","mip_hpt": "esp","lab_cromato": "sr","nivel_dagua": "sr","multiparam": "sr","amostr_vapor": "jr","colorimetro": "jr"},"restricoes": [],"obs": ""},"GEO-2019": {"cnhCat": "C","cnhVal": "2027-08-23","cursos": [],"treinos": [],"matriz": {"remediacao_inst": "esp","injecao": "sr","raio_influencia": "sr","escavacao": "pl","soil_mixing": "sr","remediacao_manut": "sr","multiparam": "jr","pid": "jr","remediacao_oper": "pl","sond_injecao": "jr"},"restricoes": [],"obs": ""},"GEO-2020": {"cnhCat": "B","cnhVal": "2028-06-08","cursos": [],"treinos": [],"matriz": {"topo_rtk": "pl","topo_estacao": "pl","lab_cromato": "pl","pid": "jr","descricao_solo": "jr","sond_dualtube": "pl"},"restricoes": [],"obs": ""}},"sms": {"GEO-2001": {"nr35": {"val": "2027-03-28"},"fittest": {"val": "2026-12-30"},"nr06": {"val": "2027-01-26"},"nr33": {"val": "2026-11-14"},"nr10": {"val": ""},"aso": {"val": "2027-01-24"}},"GEO-2002": {"nr35": {"val": "2027-05-15"},"fittest": {"val": "2026-11-28"},"nr06": {"val": "2027-05-01"},"nr33": {"val": "2026-09-27"},"nr10": {"val": ""},"aso": {"val": "2027-02-07"}},"GEO-2003": {"nr35": {"val": "2027-03-10"},"fittest": {"val": "2026-12-29"},"nr06": {"val": "2027-04-16"},"nr33": {"val": "2027-05-05"},"nr10": {"val": ""},"aso": {"val": "2026-11-10"}},"GEO-2004": {"nr35": {"val": "2027-02-27"},"fittest": {"val": "2026-11-29"},"nr06": {"val": "2027-07-24"},"nr33": {"val": "2026-08-16"},"nr10": {"val": ""},"aso": {"val": "2026-11-30"}},"GEO-2005": {"nr35": {"val": "2027-02-15"},"fittest": {"val": "2026-08-16"},"nr06": {"val": "2027-04-06"},"nr33": {"val": "2026-08-06"},"nr10": {"val": ""},"aso": {"val": "2026-08-21"}},"GEO-2006": {"nr35": {"val": "2026-12-27"},"fittest": {"val": "2026-12-27"},"nr06": {"val": "2027-06-13"},"nr33": {"val": "2027-05-20"},"nr10": {"val": ""},"aso": {"val": "2027-03-13"}},"GEO-2007": {"nr35": {"val": "2027-04-12"},"fittest": {"val": "2026-08-29"},"nr06": {"val": "2027-02-27"},"nr33": {"val": "2026-08-06"},"nr10": {"val": ""},"aso": {"val": "2026-08-28"}},"GEO-2008": {"nr35": {"val": "2027-04-12"},"fittest": {"val": "2026-08-31"},"nr06": {"val": "2027-03-29"},"nr33": {"val": "2027-06-14"},"nr10": {"val": ""},"aso": {"val": "2026-12-24"}},"GEO-2009": {"nr35": {"val": "2026-09-28"},"fittest": {"val": "2026-08-20"},"nr06": {"val": "2027-07-23"},"nr33": {"val": "2026-11-02"},"nr10": {"val": ""},"aso": {"val": "2027-01-20"}},"GEO-2010": {"nr35": {"val": "2027-03-09"},"fittest": {"val": "2026-12-22"},"nr06": {"val": "2027-02-04"},"nr33": {"val": "2027-02-23"},"nr10": {"val": ""},"aso": {"val": "2027-04-10"}},"GEO-2011": {"nr35": {"val": "2026-09-12"},"fittest": {"val": "2027-01-01"},"nr06": {"val": "2026-09-18"},"nr33": {"val": "2027-01-28"},"nr10": {"val": ""},"aso": {"val": "2026-10-07"}},"GEO-2012": {"nr35": {"val": "2027-05-03"},"fittest": {"val": "2026-12-04"},"nr06": {"val": "2027-02-14"},"nr33": {"val": "2027-01-07"},"nr10": {"val": ""},"aso": {"val": "2027-02-23"}},"GEO-2013": {"nr35": {"val": "2027-01-05"},"fittest": {"val": "2026-09-22"},"nr06": {"val": "2026-10-20"},"nr33": {"val": "2026-12-29"},"nr10": {"val": "2027-03-10"},"aso": {"val": "2026-12-15"}},"GEO-2014": {"nr35": {"val": "2027-01-29"},"fittest": {"val": "2026-09-09"},"nr06": {"val": "2027-03-22"},"nr33": {"val": "2026-11-19"},"nr10": {"val": "2026-10-12"},"aso": {"val": "2026-10-06"}},"GEO-2015": {"nr35": {"val": "2027-04-12"},"fittest": {"val": "2026-09-29"},"nr06": {"val": "2026-09-16"},"nr33": {"val": "2026-08-04"},"nr10": {"val": "2027-06-26"},"aso": {"val": "2026-11-06"}},"GEO-2016": {"nr35": {"val": "2027-05-13"},"fittest": {"val": "2026-09-27"},"nr06": {"val": "2026-11-23"},"nr33": {"val": "2026-10-19"},"nr10": {"val": "2027-06-26"},"aso": {"val": "2027-01-31"}},"GEO-2017": {"nr35": {"val": "2027-05-14"},"fittest": {"val": "2026-09-26"},"nr06": {"val": "2027-06-08"},"nr33": {"val": "2026-08-21"},"nr10": {"val": ""},"aso": {"val": "2027-01-22"}},"GEO-2018": {"nr35": {"val": "2027-04-23"},"fittest": {"val": "2026-09-21"},"nr06": {"val": "2027-02-17"},"nr33": {"val": "2026-10-06"},"nr10": {"val": ""},"aso": {"val": "2027-01-19"}},"GEO-2019": {"nr35": {"val": "2026-11-07"},"fittest": {"val": "2026-11-23"},"nr06": {"val": "2026-11-05"},"nr33": {"val": "2027-06-01"},"nr10": {"val": "2027-06-17"},"aso": {"val": "2026-11-09"}},"GEO-2020": {"nr35": {"val": "2027-01-12"},"fittest": {"val": "2026-07-31"},"nr06": {"val": "2026-09-23"},"nr33": {"val": "2026-09-12"},"nr10": {"val": ""},"aso": {"val": "2027-03-15"}}},"disponibilidade": {"GEO-2001": {"localAtual": "Curitiba","dataLocal": "2026-06-19","ferias": [],"afastamentos": []},"GEO-2002": {"localAtual": "Ponta Grossa","dataLocal": "2026-06-18","ferias": [],"afastamentos": []},"GEO-2003": {"localAtual": "Londrina","dataLocal": "2026-06-18","ferias": [],"afastamentos": []},"GEO-2004": {"localAtual": "Joinville","dataLocal": "2026-06-12","ferias": [],"afastamentos": []},"GEO-2005": {"localAtual": "Curitiba","dataLocal": "2026-06-17","ferias": [],"afastamentos": []},"GEO-2006": {"localAtual": "Ponta Grossa","dataLocal": "2026-06-18","ferias": [{"ini": "2026-06-15","fim": "2026-06-30"}],"afastamentos": []},"GEO-2007": {"localAtual": "São Paulo","dataLocal": "2026-06-19","ferias": [],"afastamentos": []},"GEO-2008": {"localAtual": "Campinas","dataLocal": "2026-06-19","ferias": [],"afastamentos": []},"GEO-2009": {"localAtual": "Curitiba","dataLocal": "2026-06-13","ferias": [],"afastamentos": []},"GEO-2010": {"localAtual": "Florianópolis","dataLocal": "2026-06-05","ferias": [],"afastamentos": []},"GEO-2011": {"localAtual": "São Paulo","dataLocal": "2026-06-18","ferias": [],"afastamentos": []},"GEO-2012": {"localAtual": "Maringá","dataLocal": "2026-06-18","ferias": [],"afastamentos": [{"ini": "2026-05-31","fim": "2026-07-15","motivo": "Licença médica"}]},"GEO-2013": {"localAtual": "Curitiba","dataLocal": "2026-06-18","ferias": [],"afastamentos": []},"GEO-2014": {"localAtual": "Porto Alegre","dataLocal": "2026-06-09","ferias": [],"afastamentos": []},"GEO-2015": {"localAtual": "Curitiba","dataLocal": "2026-06-10","ferias": [{"ini": "2026-06-12","fim": "2026-06-27"}],"afastamentos": []},"GEO-2016": {"localAtual": "Belo Horizonte","dataLocal": "2026-06-20","ferias": [],"afastamentos": []},"GEO-2017": {"localAtual": "Curitiba","dataLocal": "2026-06-19","ferias": [],"afastamentos": []},"GEO-2018": {"localAtual": "Santos","dataLocal": "2026-06-20","ferias": [],"afastamentos": []},"GEO-2019": {"localAtual": "Curitiba","dataLocal": "2026-06-15","ferias": [],"afastamentos": []},"GEO-2020": {"localAtual": "Londrina","dataLocal": "2026-06-05","ferias": [],"afastamentos": []}},"maquinas": [{"cod": "MAQ-001","marca": "Geoprobe","modelo": "7822DT","horimetro": 1968,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Esteira","tipos": ["dp","dual"],"altaRes": ["MIP","HPT"],"peso": 4300,"consumo": 30,"veiculo": "","status": "Disponível","local": "Curitiba"},{"cod": "MAQ-002","marca": "Geoprobe","modelo": "8140LS","horimetro": 1726,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Esteira","tipos": ["dp","dual","hollow"],"altaRes": ["MIP","HPT","OIP"],"peso": 5200,"consumo": 32,"veiculo": "","status": "Disponível","local": "Ponta Grossa"},{"cod": "MAQ-003","marca": "Sondeq","modelo": "SDH-200","horimetro": 445,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Caminhão","tipos": ["helicoidal","hollow"],"altaRes": [],"peso": 7200,"consumo": 21,"veiculo": "","status": "Disponível","local": "Londrina"},{"cod": "MAQ-004","marca": "Sondeq","modelo": "Rotativa RT","horimetro": 2500,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Caminhão","tipos": ["rotativa"],"altaRes": [],"peso": 2500,"consumo": 15,"veiculo": "","status": "Disponível","local": "Joinville"},{"cod": "MAQ-005","marca": "CMV","modelo": "MK600","horimetro": 1882,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Esteira","tipos": ["dp"],"altaRes": [],"peso": 3800,"consumo": 28,"veiculo": "","status": "Disponível","local": "Florianópolis"},{"cod": "MAQ-006","marca": "Maquesonda","modelo": "MS-1200","horimetro": 3273,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Caminhão","tipos": ["rotativa","hollow"],"altaRes": [],"peso": 6800,"consumo": 20,"veiculo": "","status": "Disponível","local": "São Paulo"},{"cod": "MAQ-007","marca": "Geoprobe","modelo": "6712DT","horimetro": 920,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Esteira","tipos": ["dp","dual"],"altaRes": ["HPT"],"peso": 3600,"consumo": 26,"veiculo": "","status": "Disponível","local": "Campinas"},{"cod": "MAQ-008","marca": "Acker","modelo": "ADII","horimetro": 4100,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Caminhão","tipos": ["helicoidal","hollow","rotativa"],"altaRes": [],"peso": 7800,"consumo": 22,"veiculo": "","status": "Disponível","local": "Porto Alegre"},{"cod": "MAQ-009","marca": "CMV","modelo": "MK420","horimetro": 1340,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Esteira","tipos": ["dp"],"altaRes": [],"peso": 3200,"consumo": 24,"veiculo": "","status": "Manutenção","local": "Curitiba"},{"cod": "MAQ-010","marca": "Sondeq","modelo": "SDH-350","horimetro": 210,"ultRevisao": 0,"proxRevisao": 0,"plataforma": "Caminhão","tipos": ["hollow","rotativa"],"altaRes": [],"peso": 8100,"consumo": 23,"veiculo": "","status": "Disponível","local": "Belo Horizonte"}],"frota": [{"veiculo": "VW Saveiro","tipo": "Utilitário leve","cnh": "B","placa": "UIG-2J70","anoFab": 2023,"funcao": "Apoio de equipe de campo","capCargaKg": 800,"capPessoas": 2,"implemento": "","capImplemento": "","kmAtual": 100128,"proxRevKm": 0,"status": "Disponível","localAtual": "Curitiba","dataLocal": "2026-06-18","consumoKmL": 12},{"veiculo": "VW Saveiro","tipo": "Utilitário leve","cnh": "B","placa": "QNW-1P32","anoFab": 2020,"funcao": "Apoio de equipe de campo","capCargaKg": 800,"capPessoas": 2,"implemento": "","capImplemento": "","kmAtual": 86494,"proxRevKm": 0,"status": "Em campo","localAtual": "Londrina","dataLocal": "2026-06-18","consumoKmL": 11},{"veiculo": "VW Saveiro","tipo": "Utilitário leve","cnh": "B","placa": "ICU-9P36","anoFab": 2020,"funcao": "Apoio de equipe de campo","capCargaKg": 800,"capPessoas": 2,"implemento": "","capImplemento": "","kmAtual": 45124,"proxRevKm": 0,"status": "Disponível","localAtual": "Cascavel","dataLocal": "2026-06-19","consumoKmL": 10},{"veiculo": "VW Saveiro","tipo": "Utilitário leve","cnh": "B","placa": "SXP-9C22","anoFab": 2024,"funcao": "Apoio de equipe de campo","capCargaKg": 800,"capPessoas": 2,"implemento": "","capImplemento": "","kmAtual": 116953,"proxRevKm": 0,"status": "Disponível","localAtual": "Florianópolis","dataLocal": "2026-06-15","consumoKmL": 10},{"veiculo": "VW Saveiro","tipo": "Utilitário leve","cnh": "B","placa": "CLC-9D44","anoFab": 2022,"funcao": "Apoio de equipe de campo","capCargaKg": 800,"capPessoas": 2,"implemento": "","capImplemento": "","kmAtual": 102191,"proxRevKm": 0,"status": "Disponível","localAtual": "Itajaí","dataLocal": "2026-06-15","consumoKmL": 12},{"veiculo": "MB Accelo 1016","tipo": "Caminhão semipesado","cnh": "C","placa": "BVZ-9H38","anoFab": 2022,"funcao": "Transporte de equipamentos e máquina","capCargaKg": 4200,"capPessoas": 3,"implemento": "Munck","capImplemento": 3500,"kmAtual": 273501,"proxRevKm": 0,"status": "Disponível","localAtual": "Ponta Grossa","dataLocal": "2026-06-14","consumoKmL": 6},{"veiculo": "MB Accelo 1016","tipo": "Caminhão semipesado","cnh": "C","placa": "YAM-1X55","anoFab": 2021,"funcao": "Transporte de equipamentos e máquina","capCargaKg": 4200,"capPessoas": 3,"implemento": "","capImplemento": 3500,"kmAtual": 212124,"proxRevKm": 0,"status": "Em campo","localAtual": "Maringá","dataLocal": "2026-06-13","consumoKmL": 6},{"veiculo": "MB Accelo 1016","tipo": "Caminhão semipesado","cnh": "C","placa": "QVR-3J77","anoFab": 2018,"funcao": "Transporte de equipamentos e máquina","capCargaKg": 4200,"capPessoas": 3,"implemento": "","capImplemento": 3500,"kmAtual": 172523,"proxRevKm": 0,"status": "Disponível","localAtual": "Joinville","dataLocal": "2026-06-20","consumoKmL": 6},{"veiculo": "MB Accelo 1016","tipo": "Caminhão semipesado","cnh": "C","placa": "UDV-1W11","anoFab": 2019,"funcao": "Transporte de equipamentos e máquina","capCargaKg": 4200,"capPessoas": 3,"implemento": "","capImplemento": 4000,"kmAtual": 202228,"proxRevKm": 0,"status": "Disponível","localAtual": "Blumenau","dataLocal": "2026-06-14","consumoKmL": 7},{"veiculo": "MB Accelo 1016","tipo": "Caminhão semipesado","cnh": "C","placa": "CWG-4Y21","anoFab": 2019,"funcao": "Transporte de equipamentos e máquina","capCargaKg": 4200,"capPessoas": 3,"implemento": "","capImplemento": "","kmAtual": 86578,"proxRevKm": 0,"status": "Disponível","localAtual": "Criciúma","dataLocal": "2026-06-17","consumoKmL": 8}],"equipamentos": [{"cod": "EQP-001","tipo": "Analisador multiparâmetros (pH/OD/cond/ORP)","modelo": "Horiba U-52","specs": "","local": "Em campo","comQuem": "GEO-2018","ultCalib": "2026-02-18","valCalib": "2027-01-24","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-002","tipo": "Analisador multiparâmetros","modelo": "YSI ProDSS","specs": "","local": "Em campo","comQuem": "GEO-2010","ultCalib": "2026-02-20","valCalib": "2027-01-25","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-003","tipo": "Analisador de gases VOC — PID","modelo": "MiniRAE 3000","specs": "","local": "Em campo","comQuem": "GEO-2014","ultCalib": "2026-03-16","valCalib": "2026-08-05","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-004","tipo": "Analisador de gases VOC — PID","modelo": "ppbRAE 3000","specs": "","local": "Almoxarifado","comQuem": "GEO-2009","ultCalib": "2026-02-05","valCalib": "2027-01-12","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-005","tipo": "Medidor de nível d'água","modelo": "Solinst 101","specs": "","local": "Almoxarifado","comQuem": "GEO-2009","ultCalib": "2026-04-19","valCalib": "2027-01-20","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-006","tipo": "Bomba de baixa vazão","modelo": "Geotech GeoControl","specs": "","local": "Almoxarifado","comQuem": "GEO-2009","ultCalib": "2026-04-10","valCalib": "2027-03-25","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-007","tipo": "Interface óleo/água","modelo": "Solinst 122","specs": "","local": "Almoxarifado","comQuem": "GEO-2013","ultCalib": "2026-01-25","valCalib": "2027-03-05","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-008","tipo": "Colorímetro de campo","modelo": "Hanna HI-96","specs": "","local": "Em campo","comQuem": "GEO-2011","ultCalib": "2026-04-08","valCalib": "2026-07-15","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-009","tipo": "GPS RTK","modelo": "Trimble R10","specs": "","local": "Em campo","comQuem": "GEO-2014","ultCalib": "2026-02-22","valCalib": "2027-03-07","periodoCalib": 6,"estado": "Operacional"},{"cod": "EQP-010","tipo": "Estação total","modelo": "Leica TS-07","specs": "","local": "Almoxarifado","comQuem": "GEO-2018","ultCalib": "2026-03-28","valCalib": "2027-01-21","periodoCalib": 6,"estado": "Operacional"}],"clientes": [{"nome": "VIBRA Energia S.A","cnpj": "16.374.189/0007-44","segmento": "Óleo & Gás","cidade": "Curitiba/PR","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "Integração obrigatória · NR-35 vigente","status": "Ativo"},{"nome": "Raízen Combustíveis","cnpj": "58.649.675/0006-53","segmento": "Varejo de combustíveis","cidade": "Santos/SP","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "Integração obrigatória · NR-35 vigente","status": "Ativo"},{"nome": "Ipiranga Postos","cnpj": "27.445.674/0006-99","segmento": "Óleo & Gás","cidade": "São Paulo/SP","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "APR diária · Fit Test","status": "Ativo"},{"nome": "CNH Industrial Brasil","cnpj": "10.546.892/0002-86","segmento": "Industrial","cidade": "Curitiba/PR","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "NR-33 espaço confinado","status": "Ativo"},{"nome": "Gerdau","cnpj": "10.423.849/0008-23","segmento": "Siderurgia","cidade": "Porto Alegre/RS","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "Integração obrigatória · NR-35 vigente","status": "Ativo"},{"nome": "Cocamar","cnpj": "95.245.229/0001-47","segmento": "Agroindústria","cidade": "Maringá/PR","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "NR-33 espaço confinado","status": "Ativo"},{"nome": "Ambev","cnpj": "71.371.580/0001-49","segmento": "Bebidas","cidade": "Joinville/SC","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "","status": "Ativo"},{"nome": "Klabin","cnpj": "71.311.940/0009-82","segmento": "Papel & Celulose","cidade": "Telêmaco Borba/PR","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "","status": "Ativo"},{"nome": "Renault do Brasil","cnpj": "60.887.761/0009-65","segmento": "Automotivo","cidade": "São José dos Pinhais/PR","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "NR-33 espaço confinado","status": "Ativo"},{"nome": "Petrobras Distribuidora","cnpj": "95.529.483/0009-14","segmento": "Óleo & Gás","cidade": "Rio de Janeiro/RJ","contato": "Responsável Técnico","foneEmail": "contato@cliente.com.br","exigencias": "APR diária · Fit Test","status": "Ativo"}],"contratos": [{"cliente": "VIBRA Energia S.A","contrato": "CT-2026-001","cnpj": "16.374.189/0007-44","localidade": "Curitiba","estado": "PR","projeto": "Projeto ambiental — VIBRA Energia S.A","servico": "Investigação e/ou remediação","valorContrato": 170014,"statusCt": "Vigente","docs": {}},{"cliente": "Raízen Combustíveis","contrato": "CT-2026-002","cnpj": "58.649.675/0006-53","localidade": "Santos","estado": "SP","projeto": "Projeto ambiental — Raízen Combustíveis","servico": "Investigação e/ou remediação","valorContrato": 424836,"statusCt": "Vigente","docs": {}},{"cliente": "Ipiranga Postos","contrato": "CT-2026-003","cnpj": "27.445.674/0006-99","localidade": "São Paulo","estado": "SP","projeto": "Projeto ambiental — Ipiranga Postos","servico": "Investigação e/ou remediação","valorContrato": 433464,"statusCt": "Vigente","docs": {}},{"cliente": "CNH Industrial Brasil","contrato": "CT-2026-004","cnpj": "10.546.892/0002-86","localidade": "Curitiba","estado": "PR","projeto": "Projeto ambiental — CNH Industrial Brasil","servico": "Investigação e/ou remediação","valorContrato": 236542,"statusCt": "Vigente","docs": {}},{"cliente": "Gerdau","contrato": "CT-2026-005","cnpj": "10.423.849/0008-23","localidade": "Porto Alegre","estado": "RS","projeto": "Projeto ambiental — Gerdau","servico": "Investigação e/ou remediação","valorContrato": 284541,"statusCt": "Vigente","docs": {}},{"cliente": "Cocamar","contrato": "CT-2026-006","cnpj": "95.245.229/0001-47","localidade": "Maringá","estado": "PR","projeto": "Projeto ambiental — Cocamar","servico": "Investigação e/ou remediação","valorContrato": 1292523,"statusCt": "Vigente","docs": {}},{"cliente": "Ambev","contrato": "CT-2026-007","cnpj": "71.371.580/0001-49","localidade": "Joinville","estado": "SC","projeto": "Projeto ambiental — Ambev","servico": "Investigação e/ou remediação","valorContrato": 1184021,"statusCt": "Vigente","docs": {}},{"cliente": "Klabin","contrato": "CT-2026-008","cnpj": "71.311.940/0009-82","localidade": "Telêmaco Borba","estado": "PR","projeto": "Projeto ambiental — Klabin","servico": "Investigação e/ou remediação","valorContrato": 116315,"statusCt": "Vigente","docs": {}},{"cliente": "Renault do Brasil","contrato": "CT-2026-009","cnpj": "60.887.761/0009-65","localidade": "São José dos Pinhais","estado": "PR","projeto": "Projeto ambiental — Renault do Brasil","servico": "Investigação e/ou remediação","valorContrato": 1181796,"statusCt": "Vigente","docs": {}},{"cliente": "Petrobras Distribuidora","contrato": "CT-2026-010","cnpj": "95.529.483/0009-14","localidade": "Rio de Janeiro","estado": "RJ","projeto": "Projeto ambiental — Petrobras Distribuidora","servico": "Investigação e/ou remediação","valorContrato": 263245,"statusCt": "Vigente","docs": {}}],"condicionantes": {"CT-2026-001": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "Integração obrigatória · NR-35 vigente","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@vibra.com.br"},"CT-2026-002": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "Integração obrigatória · NR-35 vigente","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@raízen.com.br"},"CT-2026-003": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "APR diária · Fit Test","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@ipiranga.com.br"},"CT-2026-004": {"prazoIni": "2026-07-10","prazoFim": "2026-08-14","condicoes": "NR-33 espaço confinado","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@cnh.com.br"},"CT-2026-005": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "Integração obrigatória · NR-35 vigente","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@gerdau.com.br"},"CT-2026-006": {"prazoIni": "2026-07-10","prazoFim": "2026-08-14","condicoes": "NR-33 espaço confinado","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@cocamar.com.br"},"CT-2026-007": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "PT diária obrigatória","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@ambev.com.br"},"CT-2026-008": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "PT diária obrigatória","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@klabin.com.br"},"CT-2026-009": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "NR-33 espaço confinado","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@renault.com.br"},"CT-2026-010": {"prazoIni": "2026-06-25","prazoFim": "2026-11-27","condicoes": "APR diária · Fit Test","fiscal": "Eng. Responsável do Cliente","fiscalFone": "(41) 9____-____","fiscalEmail": "fiscal@petrobras.com.br"}},"asos": {"GEO-2001": {"CT-2026-005": {"val": "2026-05-27"},"CT-2026-003": {"val": "2027-01-12"},"CT-2026-006": {"val": "2026-08-23"},"CT-2026-009": {"val": "2026-09-10"},"CT-2026-010": {"val": "2026-06-08"},"CT-2026-004": {"val": "2026-11-17"}},"GEO-2002": {"CT-2026-007": {"val": "2026-12-23"},"CT-2026-009": {"val": "2026-06-28"},"CT-2026-001": {"val": "2026-10-03"},"CT-2026-006": {"val": "2027-01-03"}},"GEO-2003": {"CT-2026-007": {"val": "2026-10-23"},"CT-2026-008": {"val": "2027-02-10"},"CT-2026-001": {"val": "2026-12-08"},"CT-2026-009": {"val": "2026-08-19"},"CT-2026-002": {"val": "2026-09-04"},"CT-2026-004": {"val": "2027-02-16"}},"GEO-2004": {"CT-2026-002": {"val": "2026-11-23"},"CT-2026-007": {"val": "2027-02-12"},"CT-2026-001": {"val": "2026-08-26"}},"GEO-2005": {"CT-2026-005": {"val": "2026-11-16"},"CT-2026-008": {"val": "2027-01-28"},"CT-2026-001": {"val": "2026-07-04"},"CT-2026-007": {"val": "2027-03-29"},"CT-2026-010": {"val": "2026-11-22"}},"GEO-2006": {"CT-2026-002": {"val": "2027-04-09"},"CT-2026-001": {"val": "2027-04-10"},"CT-2026-007": {"val": "2027-03-20"},"CT-2026-005": {"val": "2026-09-20"}},"GEO-2007": {"CT-2026-009": {"val": "2026-09-03"},"CT-2026-002": {"val": "2026-12-13"},"CT-2026-003": {"val": "2026-11-16"},"CT-2026-007": {"val": "2027-02-24"},"CT-2026-005": {"val": "2027-02-17"}},"GEO-2008": {"CT-2026-005": {"val": "2026-06-03"},"CT-2026-007": {"val": "2026-11-14"},"CT-2026-001": {"val": "2027-01-05"},"CT-2026-002": {"val": "2026-10-15"},"CT-2026-010": {"val": "2026-06-09"},"CT-2026-003": {"val": "2027-04-14"}},"GEO-2009": {"CT-2026-004": {"val": "2026-12-25"},"CT-2026-006": {"val": "2026-10-08"},"CT-2026-005": {"val": "2027-03-01"},"CT-2026-010": {"val": "2026-06-21"}},"GEO-2010": {"CT-2026-005": {"val": "2026-11-14"},"CT-2026-004": {"val": "2026-09-22"},"CT-2026-002": {"val": "2026-07-08"},"CT-2026-010": {"val": "2027-04-06"}},"GEO-2011": {"CT-2026-008": {"val": "2026-06-09"},"CT-2026-007": {"val": "2026-10-15"},"CT-2026-001": {"val": "2026-05-21"},"CT-2026-003": {"val": "2027-01-28"},"CT-2026-006": {"val": "2027-03-10"},"CT-2026-005": {"val": "2027-01-21"}},"GEO-2012": {"CT-2026-006": {"val": "2026-07-04"},"CT-2026-002": {"val": "2026-10-13"},"CT-2026-001": {"val": "2026-11-14"},"CT-2026-003": {"val": "2026-06-13"},"CT-2026-004": {"val": "2026-06-14"},"CT-2026-007": {"val": "2027-03-13"}},"GEO-2013": {"CT-2026-007": {"val": "2026-06-14"},"CT-2026-010": {"val": "2026-06-07"},"CT-2026-005": {"val": "2027-04-11"}},"GEO-2014": {"CT-2026-002": {"val": "2026-11-26"},"CT-2026-005": {"val": "2026-12-16"},"CT-2026-006": {"val": "2027-02-15"},"CT-2026-001": {"val": "2027-01-31"},"CT-2026-004": {"val": "2027-03-22"}},"GEO-2015": {"CT-2026-010": {"val": "2027-04-12"},"CT-2026-006": {"val": "2026-08-31"},"CT-2026-004": {"val": "2026-08-24"},"CT-2026-009": {"val": "2026-12-24"},"CT-2026-008": {"val": "2026-12-19"},"CT-2026-005": {"val": "2026-12-17"}},"GEO-2016": {"CT-2026-006": {"val": "2026-06-05"},"CT-2026-010": {"val": "2027-04-08"},"CT-2026-004": {"val": "2026-05-26"},"CT-2026-005": {"val": "2026-07-09"}},"GEO-2017": {"CT-2026-006": {"val": "2026-09-04"},"CT-2026-007": {"val": "2026-06-10"},"CT-2026-004": {"val": "2026-12-03"}},"GEO-2018": {"CT-2026-007": {"val": "2026-08-30"},"CT-2026-001": {"val": "2026-09-30"},"CT-2026-009": {"val": "2027-04-13"},"CT-2026-004": {"val": "2026-10-07"},"CT-2026-006": {"val": "2027-03-28"}},"GEO-2019": {"CT-2026-004": {"val": "2026-10-29"},"CT-2026-005": {"val": "2026-06-03"},"CT-2026-002": {"val": "2026-06-23"},"CT-2026-001": {"val": "2026-11-27"},"CT-2026-010": {"val": "2027-03-09"},"CT-2026-009": {"val": "2026-09-03"}},"GEO-2020": {"CT-2026-007": {"val": "2026-10-12"},"CT-2026-009": {"val": "2026-06-22"},"CT-2026-006": {"val": "2026-10-11"},"CT-2026-002": {"val": "2027-04-13"},"CT-2026-004": {"val": "2026-12-02"},"CT-2026-010": {"val": "2027-01-06"}}},"taps": [{"idgeo": "PR26001","projeto": "VIBRA — Investigacao","carteira": "GC-01","gerente": "MARINA QUEIROZ","gerenteEmail": "","cliente": "VIBRA Energia S.A","cnpj": "16.374.189/0007-44","cidade": "Curitiba","uf": "PR","contato": "Responsável Técnico","tipoServico": ["SONDAGEM","AMOSTRAGEM DE SOLO"],"dataCriacao": "2026-05-04","entradaCampo": "2026-07-22","mobilizacao": "2026-06-29","entregaRelatorio": "2026-10-17","urgente15": true,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Acesso restrito","restricoes": "PT diária","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Pré-agendado"},{"idgeo": "SP26002","projeto": "Raízen — Remediacao","carteira": "GC-04","gerente": "PHILLIPE BORRIES","gerenteEmail": "","cliente": "Raízen Combustíveis","cnpj": "58.649.675/0006-53","cidade": "Santos","uf": "SP","contato": "Responsável Técnico","tipoServico": ["PROJETO DE ALOCAÇÃO DE SISTEMA DE REMEDIAÇÃO","INJEÇÃO"],"dataCriacao": "2026-05-30","entradaCampo": "2026-07-23","mobilizacao": "2026-06-30","entregaRelatorio": "2026-10-08","urgente15": true,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Acesso restrito","restricoes": "PT diária","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Pré-agendado"},{"idgeo": "SP26003","projeto": "Ipiranga — Monitoramento","carteira": "GC-07","gerente": "CAROLINA ASSIS","gerenteEmail": "","cliente": "Ipiranga Postos","cnpj": "27.445.674/0006-99","cidade": "Ponta Grossa","uf": "PR","contato": "Responsável Técnico","tipoServico": ["MONITORAMENTO","RELATÓRIO"],"dataCriacao": "2026-04-26","entradaCampo": "2026-07-06","mobilizacao": "2026-07-01","entregaRelatorio": "2026-08-23","urgente15": false,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Janela de parada","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Em campo"},{"idgeo": "PR26004","projeto": "CNH — Remediacao","carteira": "GC-03","gerente": "CAROLINA ASSIS","gerenteEmail": "","cliente": "CNH Industrial Brasil","cnpj": "10.546.892/0002-86","cidade": "Curitiba","uf": "PR","contato": "Responsável Técnico","tipoServico": ["PROJETO DE ALOCAÇÃO DE SISTEMA DE REMEDIAÇÃO","INJEÇÃO"],"dataCriacao": "2026-05-25","entradaCampo": "2026-07-04","mobilizacao": "2026-06-26","entregaRelatorio": "2026-09-17","urgente15": false,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Janela de parada","restricoes": "Sem interdição de via","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Pré-agendado"},{"idgeo": "RS26005","projeto": "Gerdau — Investigacao","carteira": "GC-08","gerente": "PHILLIPE BORRIES","gerenteEmail": "","cliente": "Gerdau","cnpj": "10.423.849/0008-23","cidade": "Porto Alegre","uf": "RS","contato": "Responsável Técnico","tipoServico": ["SONDAGEM","AMOSTRAGEM DE SOLO"],"dataCriacao": "2026-05-09","entradaCampo": "2026-07-09","mobilizacao": "2026-06-30","entregaRelatorio": "2026-09-01","urgente15": false,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Acesso restrito","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Pré-agendado"},{"idgeo": "PR26006","projeto": "Cocamar — Investigacao","carteira": "GC-06","gerente": "NICOLAS MOURA","gerenteEmail": "","cliente": "Cocamar","cnpj": "95.245.229/0001-47","cidade": "Maringá","uf": "PR","contato": "Responsável Técnico","tipoServico": ["SONDAGEM","AMOSTRAGEM DE SOLO"],"dataCriacao": "2026-05-18","entradaCampo": "2026-07-30","mobilizacao": "2026-07-01","entregaRelatorio": "2026-08-30","urgente15": false,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Janela de parada","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Pré-agendado"},{"idgeo": "SC26007","projeto": "Ambev — Investigacao","carteira": "GC-03","gerente": "NICOLAS MOURA","gerenteEmail": "","cliente": "Ambev","cnpj": "71.371.580/0001-49","cidade": "Joinville","uf": "SC","contato": "Responsável Técnico","tipoServico": ["SONDAGEM","AMOSTRAGEM DE SOLO"],"dataCriacao": "2026-05-10","entradaCampo": "2026-07-01","mobilizacao": "2026-06-26","entregaRelatorio": "2026-08-28","urgente15": true,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Janela de parada","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Aguardando Plano de Trabalho"},{"idgeo": "PR26008","projeto": "Klabin — Pocos","carteira": "GC-01","gerente": "NICOLAS MOURA","gerenteEmail": "","cliente": "Klabin","cnpj": "71.311.940/0009-82","cidade": "Telêmaco Borba","uf": "PR","contato": "Responsável Técnico","tipoServico": ["INSTALAÇÃO DE POÇOS","SONDAGEM"],"dataCriacao": "2026-05-22","entradaCampo": "2026-07-03","mobilizacao": "2026-07-02","entregaRelatorio": "2026-10-02","urgente15": true,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Não se aplica","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Aguardando Plano de Trabalho"},{"idgeo": "PR26009","projeto": "Renault — Remediacao","carteira": "GC-08","gerente": "MARINA QUEIROZ","gerenteEmail": "","cliente": "Renault do Brasil","cnpj": "60.887.761/0009-65","cidade": "São José dos Pinhais","uf": "PR","contato": "Responsável Técnico","tipoServico": ["PROJETO DE ALOCAÇÃO DE SISTEMA DE REMEDIAÇÃO","INJEÇÃO"],"dataCriacao": "2026-05-16","entradaCampo": "2026-07-07","mobilizacao": "2026-07-01","entregaRelatorio": "2026-09-09","urgente15": false,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Acesso restrito","restricoes": "Sem interdição de via","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Aguardando Plano de Trabalho"},{"idgeo": "RJ26010","projeto": "Petrobras — Investigacao","carteira": "GC-05","gerente": "RAFAEL TONIN","gerenteEmail": "","cliente": "Petrobras Distribuidora","cnpj": "95.529.483/0009-14","cidade": "Rio de Janeiro","uf": "RJ","contato": "Responsável Técnico","tipoServico": ["SONDAGEM","AMOSTRAGEM DE SOLO"],"dataCriacao": "2026-05-06","entradaCampo": "2026-07-11","mobilizacao": "2026-06-28","entregaRelatorio": "2026-10-10","urgente15": true,"premOper": "Equipe full-time durante a campanha","premTec": "Conforme escopo","riscos": "Não se aplica","restricoes": "Trabalho noturno proibido","premNeg": "","premEstr": "","metas": "","multas": "","statusTap": "Aguardando Plano de Trabalho"}],"equipPorAtividade": {"multiparam": ["multiparâmetro","multiparametro"],"pid": ["pid","voc","gases"],"amostr_vapor": ["pid","voc","gases"],"poco_vapor": ["pid","voc","gases"],"nivel_dagua": ["nível","nivel"],"poco_monit": ["nível","nivel"],"bx_vazao": ["bomba","baixa vazão","baixa vazao"],"bailer": ["interface","bailer"],"colorimetro": ["colorímetro","colorimetro"],"topo_rtk": ["gps","rtk"],"topo_estacao": ["estação total","estacao total"]},"travas": {"pessoa": {"GEO-2001": [{"id": "tv43478","ini": "2026-06-19","fim": "2026-07-11","nivel": "total","idgeo": "SP26002","auto": true,"obs": ""},{"id": "tv26586","ini": "2026-07-23","fim": "2026-08-16","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""}],"GEO-2002": [{"id": "tv88084","ini": "2026-06-18","fim": "2026-06-25","nivel": "parcial","idgeo": "PR26006","auto": false,"obs": ""},{"id": "tv93144","ini": "2026-07-06","fim": "2026-07-21","nivel": "parcial","idgeo": "SP26003","auto": true,"obs": ""},{"id": "tv47743","ini": "2026-07-25","fim": "2026-08-16","nivel": "total","idgeo": "PR26004","auto": false,"obs": "Mobilização"},{"id": "tv86025","ini": "2026-08-28","fim": "2026-09-04","nivel": "total","idgeo": "PR26004","auto": true,"obs": ""}],"GEO-2003": [{"id": "tv79720","ini": "2026-06-18","fim": "2026-07-01","nivel": "total","idgeo": "RS26005","auto": true,"obs": "Projeto em andamento"},{"id": "tv10569","ini": "2026-07-20","fim": "2026-08-02","nivel": "total","idgeo": "SC26007","auto": true,"obs": ""}],"GEO-2004": [{"id": "tv46470","ini": "2026-07-02","fim": "2026-07-25","nivel": "total","idgeo": "PR26004","auto": false,"obs": ""},{"id": "tv38646","ini": "2026-07-29","fim": "2026-08-15","nivel": "total","idgeo": "SC26007","auto": false,"obs": "Campanha de campo"},{"id": "tv20555","ini": "2026-08-30","fim": "2026-09-23","nivel": "total","idgeo": "PR26004","auto": true,"obs": "Projeto em andamento"},{"id": "tv25334","ini": "2026-10-01","fim": "2026-10-21","nivel": "total","idgeo": "PR26001","auto": false,"obs": ""}],"GEO-2007": [{"id": "tv97038","ini": "2026-07-10","fim": "2026-07-15","nivel": "total","idgeo": "SP26003","auto": true,"obs": ""},{"id": "tv26862","ini": "2026-07-23","fim": "2026-08-12","nivel": "total","idgeo": "SP26003","auto": true,"obs": ""},{"id": "tv89380","ini": "2026-08-21","fim": "2026-08-28","nivel": "total","idgeo": "PR26006","auto": true,"obs": "Projeto em andamento"}],"GEO-2008": [{"id": "tv62689","ini": "2026-07-02","fim": "2026-07-13","nivel": "parcial","idgeo": "PR26008","auto": false,"obs": "Projeto em andamento"},{"id": "tv46265","ini": "2026-07-30","fim": "2026-08-16","nivel": "parcial","idgeo": "SP26003","auto": false,"obs": ""},{"id": "tv21915","ini": "2026-08-29","fim": "2026-09-21","nivel": "total","idgeo": "PR26001","auto": true,"obs": "Reserva confirmada"},{"id": "tv98752","ini": "2026-10-07","fim": "2026-10-25","nivel": "total","idgeo": "PR26009","auto": true,"obs": ""}],"GEO-2011": [{"id": "tv64088","ini": "2026-06-23","fim": "2026-07-17","nivel": "total","idgeo": "RJ26010","auto": true,"obs": ""},{"id": "tv51605","ini": "2026-07-20","fim": "2026-07-25","nivel": "parcial","idgeo": "PR26006","auto": true,"obs": ""}],"GEO-2013": [{"id": "tv95633","ini": "2026-06-19","fim": "2026-06-28","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": "Projeto em andamento"},{"id": "tv81260","ini": "2026-07-02","fim": "2026-07-22","nivel": "total","idgeo": "PR26009","auto": true,"obs": "Reserva confirmada"},{"id": "tv72426","ini": "2026-07-27","fim": "2026-08-20","nivel": "total","idgeo": "SC26007","auto": false,"obs": ""},{"id": "tv39093","ini": "2026-09-03","fim": "2026-09-23","nivel": "total","idgeo": "PR26001","auto": true,"obs": "Reserva confirmada"}],"GEO-2014": [{"id": "tv96487","ini": "2026-07-07","fim": "2026-07-20","nivel": "total","idgeo": "RJ26010","auto": true,"obs": ""},{"id": "tv47799","ini": "2026-07-30","fim": "2026-08-16","nivel": "parcial","idgeo": "RJ26010","auto": true,"obs": "Mobilização"},{"id": "tv56402","ini": "2026-08-31","fim": "2026-09-11","nivel": "parcial","idgeo": "SC26007","auto": true,"obs": ""}],"GEO-2015": [{"id": "tv10276","ini": "2026-07-03","fim": "2026-07-18","nivel": "parcial","idgeo": "PR26009","auto": true,"obs": "Remediação contínua"},{"id": "tv51307","ini": "2026-07-29","fim": "2026-08-04","nivel": "total","idgeo": "SP26003","auto": false,"obs": "Campanha de campo"},{"id": "tv48967","ini": "2026-08-18","fim": "2026-09-02","nivel": "total","idgeo": "RJ26010","auto": true,"obs": ""}],"GEO-2016": [{"id": "tv46846","ini": "2026-07-01","fim": "2026-07-26","nivel": "total","idgeo": "PR26006","auto": true,"obs": ""},{"id": "tv17930","ini": "2026-08-10","fim": "2026-08-15","nivel": "parcial","idgeo": "PR26008","auto": false,"obs": ""},{"id": "tv36978","ini": "2026-09-04","fim": "2026-09-16","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv31052","ini": "2026-09-23","fim": "2026-10-12","nivel": "parcial","idgeo": "PR26001","auto": true,"obs": "Campanha de campo"}],"GEO-2017": [{"id": "tv53679","ini": "2026-07-01","fim": "2026-07-06","nivel": "total","idgeo": "PR26008","auto": false,"obs": ""},{"id": "tv76576","ini": "2026-07-24","fim": "2026-08-08","nivel": "total","idgeo": "RJ26010","auto": false,"obs": ""},{"id": "tv27490","ini": "2026-08-11","fim": "2026-09-05","nivel": "total","idgeo": "PR26008","auto": false,"obs": ""}],"GEO-2019": [{"id": "tv37897","ini": "2026-06-30","fim": "2026-07-07","nivel": "total","idgeo": "PR26004","auto": true,"obs": ""},{"id": "tv36871","ini": "2026-07-20","fim": "2026-07-27","nivel": "parcial","idgeo": "PR26006","auto": false,"obs": ""},{"id": "tv73053","ini": "2026-08-06","fim": "2026-08-28","nivel": "total","idgeo": "SP26003","auto": true,"obs": "Campanha de campo"},{"id": "tv43619","ini": "2026-09-08","fim": "2026-09-15","nivel": "parcial","idgeo": "RJ26010","auto": false,"obs": "Campanha de campo"}],"GEO-2020": [{"id": "tv26260","ini": "2026-06-28","fim": "2026-07-22","nivel": "parcial","idgeo": "PR26009","auto": false,"obs": "Campanha de campo"},{"id": "tv91784","ini": "2026-07-31","fim": "2026-08-05","nivel": "total","idgeo": "RS26005","auto": false,"obs": "Remediação contínua"},{"id": "tv86284","ini": "2026-08-18","fim": "2026-09-02","nivel": "total","idgeo": "RJ26010","auto": true,"obs": "Reserva confirmada"},{"id": "tv31417","ini": "2026-09-21","fim": "2026-10-15","nivel": "parcial","idgeo": "PR26001","auto": true,"obs": ""}]},"maquina": {"MAQ-001": [{"id": "tv33162","ini": "2026-07-08","fim": "2026-07-18","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv32964","ini": "2026-07-26","fim": "2026-07-31","nivel": "total","idgeo": "PR26009","auto": true,"obs": "Reserva confirmada"},{"id": "tv81739","ini": "2026-08-12","fim": "2026-08-24","nivel": "total","idgeo": "PR26008","auto": false,"obs": "Campanha de campo"},{"id": "tv10055","ini": "2026-08-29","fim": "2026-09-15","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv20252","ini": "2026-09-30","fim": "2026-10-09","nivel": "total","idgeo": "PR26004","auto": true,"obs": ""}],"MAQ-002": [{"id": "tv33575","ini": "2026-07-01","fim": "2026-07-25","nivel": "parcial","idgeo": "SC26007","auto": true,"obs": ""},{"id": "tv81117","ini": "2026-07-28","fim": "2026-08-11","nivel": "total","idgeo": "RJ26010","auto": true,"obs": "Reserva confirmada"},{"id": "tv92883","ini": "2026-08-28","fim": "2026-09-13","nivel": "total","idgeo": "SP26002","auto": false,"obs": "Projeto em andamento"},{"id": "tv65143","ini": "2026-09-19","fim": "2026-10-08","nivel": "parcial","idgeo": "RS26005","auto": true,"obs": ""}],"MAQ-003": [{"id": "tv10463","ini": "2026-06-25","fim": "2026-07-01","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv58023","ini": "2026-07-08","fim": "2026-07-30","nivel": "parcial","idgeo": "RS26005","auto": false,"obs": "Mobilização"},{"id": "tv83555","ini": "2026-08-17","fim": "2026-08-28","nivel": "total","idgeo": "PR26004","auto": true,"obs": ""}],"MAQ-004": [{"id": "tv47687","ini": "2026-07-10","fim": "2026-07-26","nivel": "total","idgeo": "RS26005","auto": true,"obs": ""},{"id": "tv48674","ini": "2026-07-29","fim": "2026-08-14","nivel": "total","idgeo": "PR26009","auto": false,"obs": "Projeto em andamento"},{"id": "tv62988","ini": "2026-09-01","fim": "2026-09-08","nivel": "parcial","idgeo": "SC26007","auto": true,"obs": "Mobilização"},{"id": "tv27882","ini": "2026-09-24","fim": "2026-10-14","nivel": "total","idgeo": "PR26004","auto": true,"obs": "Campanha de campo"},{"id": "tv85964","ini": "2026-10-27","fim": "2026-11-10","nivel": "total","idgeo": "SP26002","auto": true,"obs": ""}],"MAQ-005": [{"id": "tv59518","ini": "2026-06-24","fim": "2026-07-02","nivel": "total","idgeo": "PR26001","auto": true,"obs": ""},{"id": "tv94296","ini": "2026-07-20","fim": "2026-08-07","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": "Projeto em andamento"},{"id": "tv19138","ini": "2026-08-12","fim": "2026-08-25","nivel": "parcial","idgeo": "SP26002","auto": false,"obs": ""},{"id": "tv64568","ini": "2026-09-09","fim": "2026-09-19","nivel": "parcial","idgeo": "SC26007","auto": true,"obs": "Remediação contínua"},{"id": "tv14838","ini": "2026-10-03","fim": "2026-10-10","nivel": "total","idgeo": "PR26006","auto": true,"obs": "Mobilização"}],"MAQ-006": [{"id": "tv39295","ini": "2026-06-30","fim": "2026-07-15","nivel": "total","idgeo": "RS26005","auto": true,"obs": ""},{"id": "tv36183","ini": "2026-08-02","fim": "2026-08-24","nivel": "total","idgeo": "SP26002","auto": true,"obs": "Remediação contínua"}],"MAQ-007": [{"id": "tv27680","ini": "2026-07-01","fim": "2026-07-09","nivel": "parcial","idgeo": "PR26001","auto": false,"obs": ""},{"id": "tv73606","ini": "2026-07-25","fim": "2026-08-04","nivel": "total","idgeo": "SP26003","auto": true,"obs": ""},{"id": "tv46166","ini": "2026-08-20","fim": "2026-09-05","nivel": "total","idgeo": "SP26003","auto": false,"obs": "Reserva confirmada"}],"MAQ-008": [{"id": "tv76320","ini": "2026-07-06","fim": "2026-07-30","nivel": "total","idgeo": "RJ26010","auto": true,"obs": ""},{"id": "tv22577","ini": "2026-08-04","fim": "2026-08-17","nivel": "parcial","idgeo": "PR26009","auto": false,"obs": "Reserva confirmada"},{"id": "tv11893","ini": "2026-09-03","fim": "2026-09-12","nivel": "total","idgeo": "PR26004","auto": true,"obs": ""},{"id": "tv85916","ini": "2026-09-22","fim": "2026-10-10","nivel": "parcial","idgeo": "SC26007","auto": false,"obs": ""}],"MAQ-010": [{"id": "tv56445","ini": "2026-06-29","fim": "2026-07-14","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": "Projeto em andamento"},{"id": "tv55002","ini": "2026-08-03","fim": "2026-08-18","nivel": "total","idgeo": "PR26001","auto": false,"obs": ""},{"id": "tv34233","ini": "2026-09-05","fim": "2026-09-11","nivel": "total","idgeo": "SC26007","auto": false,"obs": ""}]},"frota": {"UIG-2J70": [{"id": "tv73956","ini": "2026-06-26","fim": "2026-07-02","nivel": "total","idgeo": "RS26005","auto": true,"obs": ""},{"id": "tv28151","ini": "2026-07-08","fim": "2026-07-31","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv87621","ini": "2026-08-04","fim": "2026-08-26","nivel": "parcial","idgeo": "PR26008","auto": false,"obs": "Campanha de campo"},{"id": "tv63746","ini": "2026-09-01","fim": "2026-09-23","nivel": "parcial","idgeo": "PR26006","auto": false,"obs": "Reserva confirmada"}],"QNW-1P32": [{"id": "tv79122","ini": "2026-07-02","fim": "2026-07-25","nivel": "parcial","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv38196","ini": "2026-08-11","fim": "2026-09-04","nivel": "parcial","idgeo": "PR26001","auto": true,"obs": "Remediação contínua"}],"SXP-9C22": [{"id": "tv30537","ini": "2026-06-26","fim": "2026-07-01","nivel": "total","idgeo": "SP26002","auto": true,"obs": "Projeto em andamento"},{"id": "tv48837","ini": "2026-07-08","fim": "2026-07-14","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv71161","ini": "2026-07-27","fim": "2026-08-19","nivel": "parcial","idgeo": "PR26001","auto": true,"obs": ""},{"id": "tv93501","ini": "2026-09-04","fim": "2026-09-27","nivel": "parcial","idgeo": "PR26008","auto": false,"obs": ""}],"CLC-9D44": [{"id": "tv10514","ini": "2026-07-06","fim": "2026-07-13","nivel": "parcial","idgeo": "SC26007","auto": true,"obs": ""},{"id": "tv19128","ini": "2026-07-19","fim": "2026-07-24","nivel": "total","idgeo": "PR26006","auto": true,"obs": "Mobilização"},{"id": "tv23804","ini": "2026-08-03","fim": "2026-08-16","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv62161","ini": "2026-09-03","fim": "2026-09-17","nivel": "parcial","idgeo": "PR26006","auto": true,"obs": ""}],"BVZ-9H38": [{"id": "tv50102","ini": "2026-06-20","fim": "2026-06-27","nivel": "total","idgeo": "SP26003","auto": false,"obs": "Mobilização"},{"id": "tv44095","ini": "2026-07-14","fim": "2026-08-06","nivel": "total","idgeo": "RS26005","auto": true,"obs": "Reserva confirmada"},{"id": "tv75699","ini": "2026-08-17","fim": "2026-08-27","nivel": "total","idgeo": "SC26007","auto": true,"obs": "Reserva confirmada"},{"id": "tv22939","ini": "2026-09-04","fim": "2026-09-25","nivel": "total","idgeo": "PR26001","auto": true,"obs": "Campanha de campo"}],"YAM-1X55": [{"id": "tv62046","ini": "2026-06-24","fim": "2026-07-18","nivel": "total","idgeo": "PR26008","auto": false,"obs": "Remediação contínua"},{"id": "tv45200","ini": "2026-07-21","fim": "2026-08-10","nivel": "parcial","idgeo": "PR26008","auto": false,"obs": "Projeto em andamento"},{"id": "tv91150","ini": "2026-08-23","fim": "2026-09-12","nivel": "total","idgeo": "SP26003","auto": true,"obs": "Projeto em andamento"},{"id": "tv33078","ini": "2026-09-26","fim": "2026-10-08","nivel": "parcial","idgeo": "PR26006","auto": false,"obs": ""}],"QVR-3J77": [{"id": "tv98804","ini": "2026-07-01","fim": "2026-07-19","nivel": "total","idgeo": "SP26003","auto": true,"obs": "Remediação contínua"},{"id": "tv73843","ini": "2026-07-28","fim": "2026-08-15","nivel": "total","idgeo": "PR26006","auto": true,"obs": ""},{"id": "tv52292","ini": "2026-08-28","fim": "2026-09-06","nivel": "total","idgeo": "PR26006","auto": false,"obs": "Projeto em andamento"}],"UDV-1W11": [{"id": "tv50801","ini": "2026-06-30","fim": "2026-07-06","nivel": "total","idgeo": "RS26005","auto": true,"obs": "Campanha de campo"},{"id": "tv36807","ini": "2026-07-11","fim": "2026-07-17","nivel": "total","idgeo": "SP26003","auto": false,"obs": "Campanha de campo"}],"CWG-4Y21": [{"id": "tv45584","ini": "2026-06-22","fim": "2026-07-07","nivel": "parcial","idgeo": "PR26006","auto": true,"obs": ""},{"id": "tv86306","ini": "2026-07-16","fim": "2026-08-03","nivel": "total","idgeo": "SP26003","auto": true,"obs": ""},{"id": "tv57255","ini": "2026-08-21","fim": "2026-09-04","nivel": "parcial","idgeo": "PR26004","auto": false,"obs": ""},{"id": "tv98351","ini": "2026-09-21","fim": "2026-10-02","nivel": "parcial","idgeo": "SP26003","auto": true,"obs": "Reserva confirmada"}]},"equipamento": {"EQP-003": [{"id": "tv82899","ini": "2026-07-10","fim": "2026-07-27","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""},{"id": "tv35622","ini": "2026-08-14","fim": "2026-09-03","nivel": "total","idgeo": "RJ26010","auto": true,"obs": ""},{"id": "tv76775","ini": "2026-09-13","fim": "2026-09-30","nivel": "total","idgeo": "RS26005","auto": true,"obs": ""}],"EQP-005": [{"id": "tv87860","ini": "2026-06-27","fim": "2026-07-10","nivel": "parcial","idgeo": "SP26003","auto": true,"obs": "Campanha de campo"},{"id": "tv52288","ini": "2026-07-26","fim": "2026-08-04","nivel": "parcial","idgeo": "SP26003","auto": true,"obs": "Campanha de campo"}],"EQP-006": [{"id": "tv99220","ini": "2026-07-04","fim": "2026-07-19","nivel": "parcial","idgeo": "PR26006","auto": true,"obs": "Mobilização"},{"id": "tv32537","ini": "2026-08-08","fim": "2026-08-20","nivel": "total","idgeo": "SC26007","auto": false,"obs": "Remediação contínua"},{"id": "tv72835","ini": "2026-08-26","fim": "2026-09-14","nivel": "total","idgeo": "PR26008","auto": true,"obs": "Projeto em andamento"}],"EQP-008": [{"id": "tv60421","ini": "2026-07-06","fim": "2026-07-11","nivel": "total","idgeo": "PR26008","auto": true,"obs": ""}],"EQP-009": [{"id": "tv50535","ini": "2026-06-20","fim": "2026-06-27","nivel": "total","idgeo": "RS26005","auto": false,"obs": ""},{"id": "tv73875","ini": "2026-07-03","fim": "2026-07-19","nivel": "total","idgeo": "RS26005","auto": true,"obs": "Remediação contínua"}],"EQP-010": [{"id": "tv53189","ini": "2026-07-01","fim": "2026-07-24","nivel": "total","idgeo": "PR26001","auto": true,"obs": "Projeto em andamento"}]}},"custos": {"diasUteisMes": 22,"kmDiarioCampo": 20,"veiculoLeveDia": 180,"veiculoPesadoDia": 520,"deprMaquinaDia": 350,"deprEquipamentoDia": 80,"hospedagemPessoaDia": 160,"alimentacaoPessoaDia": 60,"materiaisDiaEquipe": 300,"kmRodado": 2.8},"produtividade": {"esteira_geoprobe": 40,"esteira_biosonda": 35,"sond_caminhao": 30,"sond_liner": 22,"sond_dualtube": 20,"sond_hollow": 15,"sond_injecao": 18,"injecao": 2000,"injecao_montagem": 8,"bailer": 12,"bx_vazao": 8,"multiparam": 10,"pid": 15,"nivel_dagua": 20,"poco_monit": 6,"acabamento_poco": 8,"descricao_solo": 20,"tamponamento": 10,"mip_hpt": 50,"oip_hpt": 50,"raio_influencia": 1,"colorimetro": 8,"topo_rtk": 15,"topo_estacao": 10,"escavacao": 30,"amostr_vapor": 8,"psg": 6,"poco_vapor": 4,"remediacao_inst": 0.2,"remediacao_manut": 1,"desmob_remediacao": 0.2,"soil_mixing": 50,"lab_cromato": 10,"desmont_ind": 1,"remediacao_oper": 1},"planos": {"PR26001": [{"id": "PT-PR26001","nome": "Plano de Trabalho — VIBRA — Investigacao","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-18"}],"SP26002": [{"id": "PT-SP26002","nome": "Plano de Trabalho — Raízen — Remediacao","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-12"}],"SP26003": [{"id": "PT-SP26003","nome": "Plano de Trabalho — Ipiranga — Monitoramento","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-14"}],"PR26004": [{"id": "PT-PR26004","nome": "Plano de Trabalho — CNH — Remediacao","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-16"}],"RS26005": [{"id": "PT-RS26005","nome": "Plano de Trabalho — Gerdau — Investigacao","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-15"}],"PR26006": [{"id": "PT-PR26006","nome": "Plano de Trabalho — Cocamar — Investigacao","anexos": [{"nome": "plano_trabalho.pdf","tipo": "application/pdf"}],"analiseIA": {"atividades": []},"em": "2026-06-15"}]},"programacoes": {"PR26001": {"local": "Curitiba","uf": "PR","prioridade": "Baixa","inicioPrev": "2026-07-22","fimPrev": "2026-10-17","atividades": [{"id": "sond_hollow","qtd": 120},{"id": "descricao_solo","qtd": 120},{"id": "amostr_vapor","qtd": 30}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null},"SP26002": {"local": "Santos","uf": "SP","prioridade": "Média","inicioPrev": "2026-07-23","fimPrev": "2026-10-08","atividades": [{"id": "remediacao_inst","qtd": 1},{"id": "injecao","qtd": 4000},{"id": "injecao_montagem","qtd": 20}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null},"SP26003": {"local": "São Paulo","uf": "SP","prioridade": "Alta","inicioPrev": "2026-07-06","fimPrev": "2026-08-23","atividades": [{"id": "nivel_dagua","qtd": 24},{"id": "bx_vazao","qtd": 24},{"id": "multiparam","qtd": 24},{"id": "pid","qtd": 24}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null},"PR26004": {"local": "Curitiba","uf": "PR","prioridade": "Média","inicioPrev": "2026-07-04","fimPrev": "2026-09-17","atividades": [{"id": "remediacao_inst","qtd": 1},{"id": "injecao","qtd": 4000},{"id": "injecao_montagem","qtd": 20}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null},"RS26005": {"local": "Porto Alegre","uf": "RS","prioridade": "Alta","inicioPrev": "2026-07-09","fimPrev": "2026-09-01","atividades": [{"id": "sond_hollow","qtd": 120},{"id": "descricao_solo","qtd": 120},{"id": "amostr_vapor","qtd": 30}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null},"PR26006": {"local": "Maringá","uf": "PR","prioridade": "Baixa","inicioPrev": "2026-07-30","fimPrev": "2026-08-30","atividades": [{"id": "sond_hollow","qtd": 120},{"id": "descricao_solo","qtd": 120},{"id": "amostr_vapor","qtd": 30}],"executivo": {"anexos": [],"notas": "","pesos": {"qualidade": 9,"custo": 7,"rota": 6,"tempo": 6,"proximidade": 7,"conformidade": 4}},"cronograma": {"blocos": []},"aceites": {"gerente": null,"rotas": null},"cenarioSel": null}},"ordens": {"SP26003": {"idgeo": "SP26003","projeto": "Ipiranga — Monitoramento","cliente": "Ipiranga Postos","local": "Ponta Grossa","status": "Aprovada","aprovadaEm": "2026-06-12","janelaIni": "2026-06-13","janelaFim": "2026-06-28","inicio": "2026-06-13","fim": "2026-06-28","diasCampo": 15,"kmTotal": 240,"distMatriz": 115,"maxDistEquipe": 115,"custoTotal": 52000,"atividades": [{"id": "nivel_dagua","qtd": 24},{"id": "bx_vazao","qtd": 24},{"id": "multiparam","qtd": 24},{"id": "pid","qtd": 24}],"equipe": [{"mat": "GEO-2009","nome": "Juliana Moraes Pereira","papel": "Técnico de Operações","vazio": false},{"mat": "GEO-2005","nome": "Diego Ferreira Souza","papel": "Auxiliar de Operações","vazio": false}],"maquina": null,"veiculo": {"placa": "UIG-2J70"},"equipamentos": [{"cod": "EQP-005"},{"cod": "EQP-006"}],"custoCategorias": {},"alertas": []}},"apontamentos": {"SP26003": [{"data": "2026-06-13","km": 22,"horasTecnico": 10,"itens": {"nivel_dagua": 3,"bx_vazao": 3,"multiparam": 3,"pid": 4},"naoConforme": false,"descNC": "","statusDia": "ok","obs": "","lancadoEm": "2026-06-13"},{"data": "2026-06-14","km": 21,"horasTecnico": 8,"itens": {"nivel_dagua": 5,"bx_vazao": 3,"multiparam": 3,"pid": 3},"naoConforme": false,"descNC": "","statusDia": "ok","obs": "","lancadoEm": "2026-06-14"},{"data": "2026-06-15","km": 29,"horasTecnico": 9,"itens": {"nivel_dagua": 3,"bx_vazao": 4,"multiparam": 5,"pid": 6},"naoConforme": true,"descNC": "Poço PM-07 obstruído","statusDia": "parcial","obs": "","lancadoEm": "2026-06-15"},{"data": "2026-06-16","km": 29,"horasTecnico": 8,"itens": {"nivel_dagua": 5,"bx_vazao": 2,"multiparam": 3,"pid": 3},"naoConforme": false,"descNC": "","statusDia": "ok","obs": "","lancadoEm": "2026-06-16"},{"data": "2026-06-17","km": 22,"horasTecnico": 10,"itens": {"nivel_dagua": 4,"bx_vazao": 4,"multiparam": 4,"pid": 3},"naoConforme": false,"descNC": "","statusDia": "ok","obs": "","lancadoEm": "2026-06-17"}]},"servicosCustom": [],"servicosOcultos": [],"docsCnpj": {},"autorizacoes": [],"atualizacoes": {},"preAgendamentos": {},"logins": []};

/* ---------- componentes básicos ---------- */
function Badge({ text, c, bg }) {
  return <span style={{ fontSize: 11, fontWeight: 600, color: c, background: bg, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>{text}</span>;
}
function StatusBadge({ s }) {
  const map = {
    Ativo: [T.green700, T.green100], Férias: [T.blue, T.blueBg], Afastado: [T.amber, T.amberBg], Desligado: [T.gray, T.grayBg],
    "Disponível": [T.green700, T.green100], "Em campo": [T.blue, T.blueBg], "Em manutenção": [T.amber, T.amberBg], "Inativa": [T.gray, T.grayBg],
    "Inativo": [T.gray, T.grayBg], "Operacional": [T.green700, T.green100], "Operacional c/ restrição": [T.amber, T.amberBg],
    "Vigente": [T.green700, T.green100], "Em mobilização": [T.blue, T.blueBg], "Suspenso": [T.amber, T.amberBg], "Encerrado": [T.gray, T.grayBg],
  };
  const [c, bg] = map[s] || [T.gray, T.grayBg];
  return <Badge text={s} c={c} bg={bg} />;
}
function Field({ label, children, req, span }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: span ? "1 / -1" : undefined }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", color: T.inkSoft }}>
        {label}{req && <span style={{ color: T.red }}> *</span>}
      </span>
      {children}
    </label>
  );
}
const inputStyle = {
  border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px", fontSize: 14,
  fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink, background: "#fff", outline: "none", width: "100%",
};
/* estilos de tabela — globais para uso em qualquer componente (OSView, etc.) */
const th = { textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.inkSoft, padding: "10px 12px", borderBottom: `2px solid ${T.green900}`, whiteSpace: "nowrap" };
const td = { padding: "10px 12px", fontSize: 13.5, borderBottom: `1px solid ${T.line}`, verticalAlign: "middle" };
function Btn({ children, kind = "ghost", onClick, small, disabled }) {
  const base = {
    border: "none", borderRadius: 6, cursor: disabled ? "default" : "pointer", fontWeight: 600,
    fontSize: small ? 12 : 13.5, padding: small ? "5px 10px" : "9px 16px",
    fontFamily: "'IBM Plex Sans', sans-serif", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
  };
  const kinds = {
    primary: { background: T.green700, color: "#fff" },
    ghost: { background: "transparent", color: T.green700, border: `1px solid ${T.line}` },
    danger: { background: "transparent", color: T.red, border: `1px solid ${T.line}` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...kinds[kind] }}>{children}</button>;
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,57,43,.35)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 16px", zIndex: 50, overflowY: "auto" }}>
      <div style={{ background: T.panel, borderRadius: 10, width: "100%", maxWidth: wide ? 860 : 640, boxShadow: "0 16px 48px rgba(0,0,0,.18)", marginBottom: "4vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.line}` }}>
          <h3 style={{ margin: 0, fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: T.inkSoft, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- Formulário de Colaborador (somente Master) ---------- */
function ColabForm({ inicial, existentes, dominios, podeVerSocio, onSave, onClose, onAddDominio }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial || { mat: "", nome: "", cargo: "", funcao: "", admissao: "", regiao: "", telefone: "", custoTotal: "", salarioBase: "", horasExtrasTri: "", encargosAnual: "", retiradaSocio: "", ehSocio: false, dispViagem: "sim", refMes: hojeISO().slice(0, 7), status: "Ativo" });
  const [erros, setErros] = useState([]);
  const [novoCargo, setNovoCargo] = useState(null);
  const [novaRegiao, setNovaRegiao] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setNum = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = () => {
    const errs = [];
    if (!f.mat.trim()) errs.push("Matrícula GEO é obrigatória.");
    if (!editando && existentes.some((c) => c.mat.toLowerCase() === f.mat.trim().toLowerCase())) errs.push(`Matrícula ${f.mat} já cadastrada.`);
    if (!f.nome.trim()) errs.push("Nome é obrigatório.");
    if (!f.cargo) errs.push("Cargo é obrigatório.");
    if (!f.funcao.trim()) errs.push("Função detalhada é obrigatória.");
    if (!f.admissao) errs.push("Data de admissão é obrigatória.");
    else if (f.admissao > hojeISO()) errs.push("Data de admissão não pode ser futura.");
    if (!f.regiao) errs.push("Região de atuação é obrigatória.");
    if (f.custoTotal === "") errs.push("Custo mensal total é obrigatório.");
    if (errs.length) { setErros(errs); return; }
    const num = (v) => v === "" || v == null ? "" : +v;
    onSave({ ...f, mat: f.mat.trim(), custoTotal: num(f.custoTotal), salarioBase: num(f.salarioBase), horasExtrasTri: num(f.horasExtrasTri), encargosAnual: num(f.encargosAnual), retiradaSocio: num(f.retiradaSocio), ehSocio: !!f.ehSocio, dispViagem: f.dispViagem || "sim" });
  };

  const SelectComOutro = ({ valor, lista, onChange, novo, setNovo, addLabel }) => (
    novo === null ? (
      <select style={inputStyle} value={valor} onChange={(e) => e.target.value === "__novo__" ? setNovo("") : onChange(e.target.value)}>
        <option value="">Selecione…</option>
        {lista.map((c) => <option key={c}>{c}</option>)}
        <option value="__novo__">+ Adicionar {addLabel}…</option>
      </select>
    ) : (
      <div style={{ display: "flex", gap: 6 }}>
        <input style={inputStyle} autoFocus value={novo} onChange={(e) => setNovo(e.target.value)} placeholder={`Novo ${addLabel}`} />
        <Btn small kind="primary" onClick={() => { if (novo.trim()) { onAddDominio(addLabel === "cargo" ? "cargos" : "regioes", novo.trim()); onChange(novo.trim()); } setNovo(null); }}>OK</Btn>
      </div>
    )
  );

  return (
    <Modal title={editando ? `Editar — ${inicial.nome}` : "Novo colaborador"} onClose={onClose}>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Matrícula GEO" req><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", background: editando ? T.grayBg : "#fff" }} value={f.mat} onChange={set("mat")} disabled={editando} placeholder="GEO-0000" /></Field>
        <Field label="Status" req>
          <select style={inputStyle} value={f.status} onChange={set("status")}>{STATUS_COLAB.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Nome completo" req span><input style={inputStyle} value={f.nome} onChange={set("nome")} /></Field>
        <Field label="Cargo" req>
          <SelectComOutro valor={f.cargo} lista={dominios.cargos} onChange={(v) => setF({ ...f, cargo: v })} novo={novoCargo} setNovo={setNovoCargo} addLabel="cargo" />
        </Field>
        <Field label="Região de atuação" req>
          <SelectComOutro valor={f.regiao} lista={dominios.regioes} onChange={(v) => setF({ ...f, regiao: v })} novo={novaRegiao} setNovo={setNovaRegiao} addLabel="região" />
        </Field>
        <Field label="Função detalhada" req span><input style={inputStyle} value={f.funcao} onChange={set("funcao")} placeholder="Descrição da função real exercida" /></Field>
        <Field label="Telefone / contato"><input style={inputStyle} value={f.telefone || ""} onChange={set("telefone")} placeholder="(00) 00000-0000" /></Field>
        <Field label="Data de admissão" req><input type="date" style={inputStyle} value={f.admissao} onChange={set("admissao")} max={hojeISO()} /></Field>
        <Field label="Mês de referência" req><input type="month" style={inputStyle} value={f.refMes} onChange={set("refMes")} /></Field>
      </div>

      {/* Custo de pessoal segmentado (lançado pelo RH mensalmente) */}
      <div style={{ marginTop: 16, padding: "12px 14px", background: T.green100, borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.green900, marginBottom: 10 }}>💰 Custo de pessoal — atualizado pelo RH 🔒</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Custo mensal total (R$)" req><input type="number" min="0" step="0.01" style={inputStyle} value={f.custoTotal} onChange={setNum("custoTotal")} placeholder="salário + encargos do mês" /></Field>
          <Field label="Salário base (R$/mês)"><input type="number" min="0" step="0.01" style={inputStyle} value={f.salarioBase} onChange={setNum("salarioBase")} /></Field>
          <Field label="Encargos totais anualizados (R$/mês)"><input type="number" min="0" step="0.01" style={inputStyle} value={f.encargosAnual} onChange={setNum("encargosAnual")} placeholder="encargos rateados por mês" /></Field>
          <Field label="Média mensal de horas extras (R$ — últ. 3 meses)"><input type="number" min="0" step="0.01" style={inputStyle} value={f.horasExtrasTri} onChange={setNum("horasExtrasTri")} placeholder="média dos últimos 3 meses" /></Field>
        </div>
      </div>

      {/* Disponibilidade para viagens */}
      <div style={{ marginTop: 12, padding: "12px 14px", background: T.blueBg, borderRadius: 8 }}>
        <Field label="✈️ Disponível para viagens fora do domicílio?">
          <select style={inputStyle} value={f.dispViagem || "sim"} onChange={set("dispViagem")}>
            <option value="sim">Sim — disponível para viagens</option>
            <option value="consulta">Sob consulta, com prazos determinados</option>
            <option value="indisponivel">Indisponível — não viaja</option>
          </select>
        </Field>
      </div>

      {/* Sócio / diretoria — só visível para Diretoria */}
      {podeVerSocio && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: T.blueBg, borderRadius: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.blue }}>
            <input type="checkbox" checked={!!f.ehSocio} onChange={(e) => setF({ ...f, ehSocio: e.target.checked })} style={{ width: 16, height: 16 }} />
            👑 É sócio / diretoria (salários e retiradas visíveis apenas pela Diretoria)
          </label>
          {f.ehSocio && (
            <div style={{ marginTop: 10 }}>
              <Field label="Retirada / pró-labore do sócio (R$/mês)"><input type="number" min="0" step="0.01" style={inputStyle} value={f.retiradaSocio} onChange={setNum("retiradaSocio")} /></Field>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Cadastrar colaborador"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Importação de colaboradores por colagem ---------- */
function ImportModal({ existentes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const [arquivoNome, setArquivoNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fileRef = useRef(null);

  /* carrega a SheetJS sob demanda para ler .xlsx */
  const garantirXLSX = () => new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.async = true;
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("falha ao carregar leitor de Excel"));
    document.body.appendChild(s);
  });
  const aoSubirArquivo = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setArquivoNome(file.name); setCarregando(true);
    try {
      const XLSX = await garantirXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
      const tsv = linhas.map((linha) => linha.map((c) => String(c == null ? "" : c).replace(/\t/g, " ").replace(/\n/g, " ")).join("\t")).join("\n");
      setTexto(tsv);
    } catch (err) {
      setArquivoNome("");
      alert("Não foi possível ler o arquivo. Verifique se é um Excel (.xlsx) válido, ou cole os dados manualmente. No protótipo offline, o leitor pode não carregar — neste caso, use a colagem.");
    } finally { setCarregando(false); }
  };

  /* cabeçalho esperado (igual aos campos do +Novo). Detecta e pula uma linha de cabeçalho, se houver. */
  const dispVgNorm = (v) => { const s = norm(v); if (["indisponivel","nao","n","0","false"].includes(s)) return "indisponivel"; if (s.includes("consulta") || ["restrita","restrito","caso a caso"].includes(s)) return "consulta"; return "sim"; };
  const linhas = useMemo(() => {
    const todas = texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim());
    if (todas.length === 0) return [];
    /* se a 1ª linha parece cabeçalho (contém "matr" ou "nome"), ignora */
    const primeira = norm(todas[0]);
    const temCabecalho = primeira.includes("matr") || (primeira.includes("nome") && primeira.includes("cargo"));
    const corpo = temCabecalho ? todas.slice(1) : todas;
    return corpo.map((l) => {
      const c = l.split("\t").map((x) => (x || "").trim());
      if (c.length < 6) return { erro: "Menos de 6 colunas — confira a planilha (colunas separadas por TAB).", bruto: l };
      const admissao = brToISO(c[4]);
      const dup = existentes.some((e) => e.mat.toLowerCase() === (c[0] || "").toLowerCase());
      const temViagem = (c[10] || "").trim() !== "";
      const erro = !c[0] ? "Sem matrícula" : dup ? "Matrícula já cadastrada" : !admissao ? "Data de admissão inválida (use DD/MM/AAAA)" : !temViagem ? "Falta informar a disponibilidade para viagens (coluna 11)" : null;
      return { erro, bruto: l, col: {
        mat: c[0], nome: c[1], cargo: c[2], funcao: c[3], admissao: admissao || "", regiao: c[5] || "",
        custoTotal: parseMoeda(c[6]), salarioBase: c[7] ? parseMoeda(c[7]) : "", encargosAnual: c[8] ? parseMoeda(c[8]) : "",
        horasExtrasTri: c[9] ? parseMoeda(c[9]) : "", dispViagem: dispVgNorm(c[10]),
        telefone: c[11] || "", refMes: hojeISO().slice(0, 7), status: "Ativo",
      } };
    });
  }, [texto, existentes]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar colaboradores da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Suba a planilha do Excel (.xlsx) ou cole as linhas copiadas. As colunas devem seguir a mesma ordem dos campos do cadastro:
      </p>
      <div style={{ background: T.green100, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: T.green900, marginBottom: 12 }}>
        <b>Ordem das colunas:</b> Matrícula · Nome · Cargo · Função · Admissão (DD/MM/AAAA) · Região · Custo mensal total · Salário base · Encargos anualizados (R$/mês) · Média mensal de HE (3 meses) · <b>Disponibilidade para viagens</b> · Telefone
        <div style={{ fontSize: 11.5, color: T.ink, marginTop: 6, background: T.amberBg, borderRadius: 6, padding: "6px 10px" }}>
          ⚠ <b>A coluna 11 (Disponibilidade para viagens fora do domicílio) é obrigatória.</b> Use um destes valores:
          <div style={{ marginTop: 3 }}>• <b>sim</b> — disponível para viagens · <b>consulta</b> — sob consulta, com prazos determinados · <b>indisponível</b> — não viaja</div>
        </div>
        <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 6 }}>As colunas 1 a 7 (até custo total) também são obrigatórias. Salário, encargos, HE e telefone são opcionais (deixe em branco se não tiver).</div>
      </div>

      {/* upload de arquivo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={aoSubirArquivo} />
        <Btn kind="primary" onClick={() => fileRef.current && fileRef.current.click()}>📤 Subir planilha (.xlsx)</Btn>
        {carregando && <span style={{ fontSize: 12, color: T.inkSoft }}>Lendo arquivo…</span>}
        {arquivoNome && !carregando && <span style={{ fontSize: 12, color: T.green700 }}>✓ {arquivoNome}</span>}
        <span style={{ fontSize: 12, color: T.inkSoft }}>ou cole abaixo ↓</span>
      </div>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"GEO-0099\tMaria Silva\tTécnico de Operações\tColeta e medições\t10/02/2023\tSul de Minas\t8320,80\t4500\t38000\t1200\tsim\t(35) 99000-0000"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 80 }}>{l.col?.mat || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.col?.nome || l.bruto}</span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} linha(s) prontas para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.col))}>Importar {ok.length} colaborador(es)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Importação da matriz de aptidões (tabela pronta, 2 orientações) ---------- */
function AptMatrizImportModal({ colaboradores, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const res = useMemo(() => {
    const lns = texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim());
    if (!lns.length) return { modo: null, linhas: [], avisos: [] };
    const cells = lns.map((l) => l.split("\t").map((x) => x.trim()));
    const header = cells[0];
    const headerAtvN = header.slice(1).map(matchAtividade).filter(Boolean).length;
    const col0AtvN = cells.slice(1).map((r) => matchAtividade(r[0])).filter(Boolean).length;
    const transposta = col0AtvN >= 2 && col0AtvN > headerAtvN;
    const avisos = [];

    if (transposta) {
      /* Atividades nas linhas × matrículas nas colunas */
      const matCols = header.slice(1).map((h) => colaboradores.find((x) => x.mat.toLowerCase() === (h || "").toLowerCase()) || null);
      const naoRec = header.slice(1).filter((h, i) => h && !matCols[i]);
      if (naoRec.length) avisos.push(`Matrícula(s) não cadastrada(s) ignorada(s): ${naoRec.join(", ")}`);
      const porMat = {}; const atvErr = []; let celInval = 0;
      cells.slice(1).forEach((row) => {
        const atv = matchAtividade(row[0]);
        if (!atv) { if (row[0]) atvErr.push(row[0]); return; }
        matCols.forEach((colab, i) => {
          if (!colab) return;
          const nv = NIVEL_ALIAS[norm(row[i + 1] ?? "")];
          if (nv === undefined) { celInval++; return; }
          (porMat[colab.mat] = porMat[colab.mat] || { mat: colab.mat, nome: colab.nome, niveis: [] }).niveis.push({ atvId: atv.id, nivel: nv });
        });
      });
      if (atvErr.length) avisos.push(`Atividade(s) não reconhecida(s) ignorada(s): ${atvErr.join("; ")}`);
      if (celInval) avisos.push(`${celInval} célula(s) com valor inválido ignorada(s) — use 0, 1, 2 ou 3.`);
      return { modo: "transposta", linhas: Object.values(porMat), avisos, colsRec: matCols.filter(Boolean).length, colsTot: matCols.length };
    }

    /* Colaboradores nas linhas × atividades nas colunas */
    const temHeader = norm(header[0]).includes("matric") || headerAtvN >= 3;
    const colMap = temHeader ? header.slice(1).map(matchAtividade) : ATIVIDADES.slice();
    if (temHeader && colMap.some((c) => !c)) avisos.push("Coluna(s) de atividade não reconhecida(s) serão ignoradas.");
    const dados = temHeader ? cells.slice(1) : cells;
    const linhas = dados.map((c) => {
      const colab = colaboradores.find((x) => x.mat.toLowerCase() === (c[0] || "").toLowerCase());
      if (!colab) return { erro: `Matrícula ${c[0] || "?"} não cadastrada`, bruto: c.join(" · ") };
      const niveis = []; const invalidos = [];
      colMap.forEach((atv, i) => {
        if (!atv) return;
        const bruto = c[i + 1] ?? "";
        const nv = NIVEL_ALIAS[norm(bruto)];
        if (nv === undefined) invalidos.push(`"${bruto}" em ${atv.short}`);
        else niveis.push({ atvId: atv.id, nivel: nv });
      });
      if (invalidos.length) return { erro: `Nível inválido: ${invalidos[0]}${invalidos.length > 1 ? ` (+${invalidos.length - 1})` : ""}`, bruto: c.join(" · "), mat: colab.mat };
      return { mat: colab.mat, nome: colab.nome, niveis };
    });
    return { modo: temHeader ? "colab" : "ordem", linhas, avisos, colsRec: colMap.filter(Boolean).length, colsTot: colMap.length };
  }, [texto, colaboradores]);
  const ok = res.linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar matriz de aptidões da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Selecione a matriz completa na sua planilha, copie (Ctrl+C) e cole abaixo. O sistema reconhece automaticamente as duas orientações:
        <b> colaboradores nas linhas</b> (1ª coluna = Matrícula, demais = atividades) ou
        <b> tipos de serviço nas linhas</b> (1ª coluna = atividade, demais colunas = matrículas no cabeçalho).
        Níveis: <b>0</b> insuficiente · <b>1</b> básico · <b>2</b> intermediário · <b>3</b> avançado · <b>4</b> especialista (célula vazia = 0). Colunas Nome e Cargo são ignoradas automaticamente.
      </p>
      <textarea rows={7} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Matrícula\tNome\tCargo\tAmostragem Baixa Vazão\tTopografia em campo usando RTK\nGEO-0012\tCarlos Andrade\tSondador\t2\t0\nGEO-0027\tJuliana Prates\tGeólogo\t3\t4"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {texto.trim() && res.modo && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: T.inkSoft }}>
          {res.modo === "transposta" && <>Orientação detectada: <b>tipos de serviço nas linhas</b> — {res.colsRec} de {res.colsTot} matrícula(s) reconhecida(s) no cabeçalho.</>}
          {res.modo === "colab" && <>Orientação detectada: <b>colaboradores nas linhas</b> — {res.colsRec} de {res.colsTot} coluna(s) de atividade reconhecida(s).</>}
          {res.modo === "ordem" && <>Sem cabeçalho — aplicando a ordem padrão das {ATIVIDADES.length} atividades do sistema.</>}
          {res.avisos.map((a, i) => <div key={i} style={{ color: T.amber, marginTop: 3 }}>⚠ {a}</div>)}
        </div>
      )}
      {res.linhas.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {res.linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 80 }}>{l.mat || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.nome} — {l.niveis.filter((n) => n.nivel !== "na").length} atividade(s) com nível 1–3</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {res.linhas.length} linha(s)/colaborador(es) prontos para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok)}>Importar matriz ({ok.length})</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Editor de Aptidões ---------- */
function AptEditor({ colab, apt, readonly, onSave, onClose }) {
  const [a, setA] = useState(apt || { cnhCat: "Não possui", cnhVal: "", cursos: [], treinos: [], matriz: {}, restricoes: [], obs: "" });
  const st = cnhStatus(a.cnhCat !== "Não possui" ? a.cnhVal : null);

  const setNivel = (atvId, nivel) => !readonly && setA({ ...a, matriz: { ...a.matriz, [atvId]: nivel } });
  const toggleRestr = (r) => !readonly && setA({ ...a, restricoes: a.restricoes.includes(r) ? a.restricoes.filter((x) => x !== r) : [...a.restricoes, r] });
  const addItem = (k, item) => setA({ ...a, [k]: [...a[k], item] });
  const rmItem = (k, i) => setA({ ...a, [k]: a[k].filter((_, j) => j !== i) });

  const secTitle = { fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "22px 0 10px", borderBottom: `1px solid ${T.line}`, paddingBottom: 6 };

  return (
    <Modal title={`Aptidões & Restrições — ${colab.nome}${readonly ? " (visualização)" : ""}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: T.ink }}>{colab.mat}</span> · {colab.cargo} · {colab.regiao}
      </div>

      <h4 style={secTitle}>Habilitação (CNH)</h4>
      <div style={{ display: "grid", gridTemplateColumns: "160px 200px auto", gap: 14, alignItems: "end" }}>
        <Field label="Categoria" req>
          <select style={inputStyle} value={a.cnhCat} disabled={readonly} onChange={(e) => setA({ ...a, cnhCat: e.target.value })}>{CNH_CATS.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        {a.cnhCat !== "Não possui" && (
          <>
            <Field label="Validade" req><input type="date" style={inputStyle} value={a.cnhVal} disabled={readonly} onChange={(e) => setA({ ...a, cnhVal: e.target.value })} /></Field>
            <div style={{ paddingBottom: 8 }}>{st && <Badge text={st.tag} c={st.c} bg={st.bg} />}</div>
          </>
        )}
      </div>

      <h4 style={secTitle}>Aptidão por atividade de campo</h4>
      <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden" }}>
        {ATIVIDADES.map((atv, i) => {
          const atual = a.matriz[atv.id] || "na";
          return (
            <div key={atv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 12px", background: i % 2 ? "#FAFBF8" : "#fff", borderBottom: i < ATIVIDADES.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ fontSize: 13, flex: 1 }}>{atv.label}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {NIVEIS.map((n) => (
                  <button key={n.id} onClick={() => setNivel(atv.id, n.id)} title={n.label} disabled={readonly}
                    style={{
                      width: 34, height: 26, borderRadius: 5, cursor: readonly ? "default" : "pointer", fontSize: 11.5, fontWeight: 700,
                      fontFamily: "'IBM Plex Mono', monospace",
                      border: `1px solid ${atual === n.id ? T.green700 : T.line}`,
                      background: atual === n.id ? NIVEL_BG[n.id] : "#fff",
                      color: atual === n.id ? NIVEL_FG[n.id] : T.inkSoft,
                      opacity: readonly && atual !== n.id ? 0.45 : 1,
                    }}>{n.short}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 6 }}>0 Insuficiente · 1 Básico · 2 Intermediário · 3 Avançado · 4 Especialista</div>

      <h4 style={secTitle}>Restrições de mobilidade</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {RESTRICOES.map((r) => (
          <label key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, padding: "7px 10px", border: `1px solid ${a.restricoes.includes(r) ? T.green700 : T.line}`, borderRadius: 6, cursor: readonly ? "default" : "pointer", background: a.restricoes.includes(r) ? T.green100 : "#fff" }}>
            <input type="checkbox" checked={a.restricoes.includes(r)} disabled={readonly} onChange={() => toggleRestr(r)} style={{ marginTop: 2 }} />
            <span>{r}</span>
          </label>
        ))}
      </div>

      <h4 style={secTitle}>Cursos e treinamentos</h4>
      {readonly ? (
        <div style={{ fontSize: 13 }}>
          {a.cursos.length + a.treinos.length === 0 && <span style={{ color: T.inkSoft }}>Nenhum curso ou treinamento registrado.</span>}
          {a.cursos.map((c, i) => <div key={`c${i}`}>📘 {[c.nome, c.inst, c.ano].filter(Boolean).join(" · ")}</div>)}
          {a.treinos.map((t, i) => <div key={`t${i}`}>🎓 {[t.nome, t.nivel].filter(Boolean).join(" · ")}</div>)}
        </div>
      ) : (
        <>
          <ListaDinamica titulo="Cursos" itens={a.cursos} campos={[["nome", "Nome do curso"], ["inst", "Instituição"], ["ano", "Ano"]]} onAdd={(it) => addItem("cursos", it)} onRm={(i) => rmItem("cursos", i)} />
          <div style={{ height: 10 }} />
          <ListaDinamica titulo="Treinamentos técnicos" itens={a.treinos} campos={[["nome", "Nome do treinamento"], ["nivel", "Nível"]]} onAdd={(it) => addItem("treinos", it)} onRm={(i) => rmItem("treinos", i)} />
        </>
      )}

      <h4 style={secTitle}>Observações</h4>
      <textarea rows={2} style={{ ...inputStyle, resize: "vertical", background: readonly ? T.grayBg : "#fff" }} value={a.obs} disabled={readonly} onChange={(e) => setA({ ...a, obs: e.target.value })} placeholder={readonly ? "" : "Complementos sobre limites e disponibilidade do colaborador"} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>{readonly ? "Fechar" : "Cancelar"}</Btn>
        {!readonly && <Btn kind="primary" onClick={() => onSave(a)}>Salvar aptidões</Btn>}
      </div>
    </Modal>
  );
}

/* Editor da matriz atividade → palavras-chave do tipo de equipamento.
   Começa vazia; o usuário adiciona linhas escolhendo a atividade e digitando as palavras-chave. */
function EquipMapaEditor({ atividades, mapa, onSalvar }) {
  const [novaAtiv, setNovaAtiv] = useState("");
  const [novasChaves, setNovasChaves] = useState("");
  const entradas = Object.entries(mapa || {});
  const jaMapeadas = new Set(entradas.map(([aid]) => aid));
  const disponiveis = (atividades || []).filter((a) => !jaMapeadas.has(a.id));
  const adicionar = () => {
    if (!novaAtiv) return;
    const ks = novasChaves.split(",").map((s) => s.trim()).filter(Boolean);
    if (!ks.length) return;
    onSalvar(novaAtiv, ks);
    setNovaAtiv(""); setNovasChaves("");
  };
  return (
    <div>
      {entradas.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
          <thead><tr>
            <th style={th}>Atividade</th><th style={th}>Palavras-chave do tipo de equipamento</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {entradas.map(([aid, ks]) => (
              <tr key={aid}>
                <td style={td}><b>{(atividades.find((x) => x.id === aid) || {}).short || aid}</b></td>
                <td style={td}>{(ks || []).join(", ")}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <Btn small kind="danger" onClick={() => onSalvar(aid, [])}>Remover</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select style={{ ...inputStyle, maxWidth: 240 }} value={novaAtiv} onChange={(e) => setNovaAtiv(e.target.value)}>
          <option value="">Escolher atividade…</option>
          {disponiveis.map((a) => <option key={a.id} value={a.id}>{a.short || a.id}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={novasChaves} onChange={(e) => setNovasChaves(e.target.value)} placeholder="palavras-chave separadas por vírgula (ex.: multiparâmetro, sonda)" />
        <Btn kind="primary" onClick={adicionar} disabled={!novaAtiv || !novasChaves.trim()}>+ Adicionar</Btn>
      </div>
      {entradas.length === 0 && <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 10 }}>Matriz vazia. Nenhum equipamento será alocado pelo Motor até que você cadastre ao menos uma atividade aqui.</div>}
    </div>
  );
}
function ListaDinamica({ titulo, itens, campos, onAdd, onRm }) {
  const vazio = Object.fromEntries(campos.map(([k]) => [k, ""]));
  const [novo, setNovo] = useState(vazio);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, marginBottom: 6 }}>{titulo}</div>
      {itens.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "5px 0" }}>
          <span style={{ flex: 1 }}>{campos.map(([k]) => it[k]).filter(Boolean).join(" · ")}</span>
          <button onClick={() => onRm(i)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6 }}>
        {campos.map(([k, ph]) => (
          <input key={k} style={{ ...inputStyle, fontSize: 13 }} placeholder={ph} value={novo[k]} onChange={(e) => setNovo({ ...novo, [k]: e.target.value })} />
        ))}
        <Btn small onClick={() => { if (novo[campos[0][0]].trim()) { onAdd(novo); setNovo(vazio); } }}>+ Add</Btn>
      </div>
    </div>
  );
}

/* ---------- SMS: editor de célula ---------- */
function SmsCellEditor({ colab, item, rec, onSave, onClose }) {
  const [na, setNa] = useState(!!rec?.na);
  const [realiz, setRealiz] = useState(rec?.realiz || "");
  const [val, setVal] = useState(rec?.val || "");
  return (
    <Modal title={`${item.label} — ${colab.nome}`} onClose={onClose}>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, marginBottom: 14 }}>
        <input type="checkbox" checked={na} onChange={(e) => setNa(e.target.checked)} />
        Não se aplica a este colaborador
      </label>
      {!na && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Data de realização"><input type="date" style={inputStyle} value={realiz} onChange={(e) => setRealiz(e.target.value)} /></Field>
          <Field label="Data de validade" req><input type="date" style={inputStyle} value={val} onChange={(e) => setVal(e.target.value)} /></Field>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Btn kind="danger" onClick={() => onSave(null)}>Limpar registro</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={!na && !val} onClick={() => onSave(na ? { na: true } : { val, ...(realiz ? { realiz } : {}) })}>Salvar</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- SMS: ficha completa do colaborador ---------- */
function SmsFicha({ colab, registro, itens, podeEditar, onSave, onClose }) {
  const [mapa, setMapa] = useState({ ...(registro || {}) });
  const setRec = (id, patch) => {
    const next = { ...mapa };
    if (patch === null) { delete next[id]; setMapa(next); return; }
    const novo = { ...(next[id] || {}), ...patch };
    if (!novo.na && !novo.val && !novo.realiz) delete next[id]; else next[id] = novo;
    setMapa(next);
  };
  const grade = { display: "grid", gridTemplateColumns: "1.3fr 56px 1fr 1fr 130px", alignItems: "center", gap: 8 };
  return (
    <Modal title={`Programas SMS & NRs — ${colab.nome}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 10 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: T.ink }}>{colab.mat}</span> · {colab.cargo} · {colab.regiao}
      </div>
      <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ ...grade, padding: "8px 12px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: T.inkSoft, borderBottom: `2px solid ${T.green900}` }}>
          <span>Item</span><span>N/A</span><span>Realização</span><span>Validade</span><span>Status</span>
        </div>
        {itens.map((it, i) => {
          const rec = mapa[it.id];
          const st = smsStatus(rec);
          const [bc, bbg] = SMS_BADGE[st.key];
          return (
            <div key={it.id} style={{ ...grade, padding: "6px 12px", background: i % 2 ? "#FAFBF8" : "#fff", borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 13 }}>{it.label}<span style={{ fontSize: 10.5, color: T.inkSoft }}> · {it.grupo}</span></span>
              <input type="checkbox" checked={!!rec?.na} disabled={!podeEditar} onChange={(e) => setRec(it.id, e.target.checked ? { na: true, val: "", realiz: "" } : null)} />
              <input type="date" style={{ ...inputStyle, padding: "4px 6px", fontSize: 12 }} disabled={!podeEditar || !!rec?.na} value={rec?.realiz || ""} onChange={(e) => setRec(it.id, { realiz: e.target.value, na: false })} />
              <input type="date" style={{ ...inputStyle, padding: "4px 6px", fontSize: 12 }} disabled={!podeEditar || !!rec?.na} value={rec?.val || ""} onChange={(e) => setRec(it.id, { val: e.target.value, na: false })} />
              <Badge text={st.key === "ok" || st.key === "venc" ? st.tag : st.key === "v30" ? st.tag : st.tag} c={bc} bg={bbg} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn onClick={onClose}>{podeEditar ? "Cancelar" : "Fechar"}</Btn>
        {podeEditar && <Btn kind="primary" onClick={() => onSave(mapa)}>Salvar ficha</Btn>}
      </div>
    </Modal>
  );
}

/* ---------- SMS: importação por colagem (2 orientações) ---------- */
function SmsImportModal({ colaboradores, itens, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const res = useMemo(() => {
    const lns = texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim());
    if (!lns.length) return { modo: null, linhas: [], avisos: [] };
    const cells = lns.map((l) => l.split("\t").map((x) => x.trim()));
    const header = cells[0];
    const headerItemN = header.slice(1).map((h) => matchSmsItem(h, itens)).filter(Boolean).length;
    const col0ItemN = cells.slice(1).map((r) => matchSmsItem(r[0], itens)).filter(Boolean).length;
    const transposta = col0ItemN >= 2 && col0ItemN > headerItemN;
    const avisos = []; const erros = []; const linhasMap = {}; let celInval = 0;
    const pushRec = (colab, item, rec) => {
      if (rec === undefined) return;
      if (rec.erro) { celInval++; return; }
      (linhasMap[colab.mat] = linhasMap[colab.mat] || { mat: colab.mat, nome: colab.nome, recs: [] }).recs.push({ itemId: item.id, rec });
    };
    if (transposta) {
      const matCols = header.slice(1).map((h) => colaboradores.find((x) => x.mat.toLowerCase() === (h || "").toLowerCase()) || null);
      const naoRec = header.slice(1).filter((h, i) => h && !matCols[i]);
      if (naoRec.length) avisos.push(`Matrícula(s) ignorada(s): ${naoRec.join(", ")}`);
      const itemErr = [];
      cells.slice(1).forEach((row) => {
        const item = matchSmsItem(row[0], itens);
        if (!item) { if (row[0]) itemErr.push(row[0]); return; }
        matCols.forEach((colab, i) => colab && pushRec(colab, item, parseSmsCell(row[i + 1])));
      });
      if (itemErr.length) avisos.push(`Item(ns) não reconhecido(s): ${itemErr.join("; ")}`);
    } else {
      const temHeader = norm(header[0]).includes("matric") || headerItemN >= 2;
      const colMap = temHeader ? header.slice(1).map((h) => matchSmsItem(h, itens)) : itens.slice();
      if (temHeader && colMap.some((c) => !c)) avisos.push("Coluna(s) não reconhecida(s) serão ignoradas.");
      const dados = temHeader ? cells.slice(1) : cells;
      dados.forEach((c) => {
        const colab = colaboradores.find((x) => x.mat.toLowerCase() === (c[0] || "").toLowerCase());
        if (!colab) { erros.push({ erro: `Matrícula ${c[0] || "?"} não cadastrada`, bruto: c.join(" · ") }); return; }
        colMap.forEach((item, i) => item && pushRec(colab, item, parseSmsCell(c[i + 1])));
      });
    }
    if (celInval) avisos.push(`${celInval} célula(s) com valor inválido ignorada(s) — use datas DD/MM/AAAA ou "NA".`);
    return { modo: transposta ? "transposta" : "colab", linhas: [...Object.values(linhasMap), ...erros], avisos };
  }, [texto, colaboradores, itens]);
  const ok = res.linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar matriz SMS & NRs da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Selecione a matriz na sua planilha, copie (Ctrl+C) e cole abaixo. Orientações reconhecidas automaticamente:
        <b> colaboradores nas linhas</b> (1ª coluna = Matrícula, demais = programas/NRs) ou
        <b> programas/NRs nas linhas</b> (matrículas no cabeçalho).
        Células = <b>data de validade</b> (DD/MM/AAAA) · <b>NA</b> = não se aplica · vazio = não informado.
      </p>
      <textarea rows={7} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Matrícula\tPCMSO\tNR-35\tDir. Defensiva\nGEO-0012\t20/06/2026\t05/07/2026\t01/12/2026\nGEO-0027\t02/03/2027\t28/06/2026\tNA"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {texto.trim() && res.modo && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: T.inkSoft }}>
          Orientação detectada: <b>{res.modo === "transposta" ? "programas/NRs nas linhas" : "colaboradores nas linhas"}</b>.
          {res.avisos.map((a, i) => <div key={i} style={{ color: T.amber, marginTop: 3 }}>⚠ {a}</div>)}
        </div>
      )}
      {res.linhas.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {res.linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 80 }}>{l.mat || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.nome} — {l.recs.length} registro(s)</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} colaborador(es) prontos para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok)}>Importar ({ok.length})</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- SMS: novo treinamento específico ---------- */
function SmsExtraModal({ onAdd, onClose }) {
  const [nome, setNome] = useState("");
  return (
    <Modal title="Novo treinamento específico" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Treinamento exigido pelo cliente ou pelo tipo de serviço. Vira uma coluna na matriz SMS de todos os colaboradores.
      </p>
      <Field label="Nome do treinamento" req>
        <input style={inputStyle} autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Brigada de emergência — Cliente X" />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" disabled={!nome.trim()} onClick={() => onAdd(nome.trim())}>Adicionar coluna</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Máquinas: formulário ---------- */
function MaqForm({ inicial, existentes, onSave, onClose }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial || {
    cod: "", marca: "", modelo: "", horimetro: "", ultRevisao: "", proxRevisao: "", plataforma: "", tipos: [], altaRes: [],
    peso: "", comprimento: "", largura: "", altAberta: "", altFechada: "",
    retracao: "", downForce: "", guincho: "", torqueHollow: "", profMaxDP: "", consumo: "",
    veiculo: "", status: "Disponível", local: "",
  });
  const [erros, setErros] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const num = (k, label, req) => (
    <Field label={label} req={req}><input type="number" min="0" step="any" style={inputStyle} value={f[k]} onChange={set(k)} /></Field>
  );
  const faltam = f.proxRevisao !== "" && f.horimetro !== "" ? +f.proxRevisao - +f.horimetro : null;

  const salvar = () => {
    const errs = [];
    if (!f.cod.trim()) errs.push("Código da máquina é obrigatório.");
    if (!editando && existentes.some((m) => m.cod.toLowerCase() === f.cod.trim().toLowerCase())) errs.push(`Código ${f.cod} já cadastrado.`);
    if (!f.marca.trim()) errs.push("Marca é obrigatória.");
    if (!f.modelo.trim()) errs.push("Modelo é obrigatório.");
    if (!f.plataforma) errs.push("Plataforma é obrigatória.");
    if (f.tipos.length === 0) errs.push("Selecione ao menos um tipo de sondagem.");
    if (f.peso === "" || +f.peso <= 0) errs.push("Peso conjunto é obrigatório (cruzamento com capacidade do veículo).");
    if (f.profMaxDP === "" || +f.profMaxDP <= 0) errs.push("Profundidade máx. DP é obrigatória.");
    if (f.horimetro === "") errs.push("Horímetro é obrigatório (controle de revisão).");
    if (f.proxRevisao === "") errs.push("Próxima revisão (horas) é obrigatória.");
    if (f.ultRevisao !== "" && f.proxRevisao !== "" && +f.proxRevisao <= +f.ultRevisao) errs.push("Próxima revisão deve ser maior que a última revisão.");
    if (errs.length) { setErros(errs); return; }
    const n = (v) => (v === "" ? "" : +v);
    onSave({ ...f, cod: f.cod.trim(), horimetro: n(f.horimetro), ultRevisao: n(f.ultRevisao), proxRevisao: n(f.proxRevisao), peso: n(f.peso), comprimento: n(f.comprimento), largura: n(f.largura), altAberta: n(f.altAberta), altFechada: n(f.altFechada), retracao: n(f.retracao), downForce: n(f.downForce), guincho: n(f.guincho), torqueHollow: n(f.torqueHollow), profMaxDP: n(f.profMaxDP), consumo: n(f.consumo) });
  };

  const chk = (sel) => ({ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "6px 10px", border: `1px solid ${sel ? T.green700 : T.line}`, borderRadius: 6, cursor: "pointer", background: sel ? T.green100 : "#fff" });
  const secTitle = { fontFamily: "'IBM Plex Serif', serif", fontSize: 14, color: T.green900, margin: "18px 0 10px", borderBottom: `1px solid ${T.line}`, paddingBottom: 5, gridColumn: "1 / -1" };

  return (
    <Modal title={editando ? `Editar — ${inicial.cod}` : "Nova máquina de sondagem"} onClose={onClose} wide>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <h4 style={{ ...secTitle, marginTop: 0 }}>Identificação</h4>
        <Field label="Código da máquina" req><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", background: editando ? T.grayBg : "#fff" }} value={f.cod} onChange={set("cod")} disabled={editando} placeholder="GEO-0000" /></Field>
        <Field label="Marca" req><input style={inputStyle} value={f.marca} onChange={set("marca")} placeholder="GEOPROBE" /></Field>
        <Field label="Modelo" req><input style={inputStyle} value={f.modelo} onChange={set("modelo")} placeholder="7822DT" /></Field>
        <Field label="Plataforma" req>
          <select style={inputStyle} value={f.plataforma} onChange={(e) => setF({ ...f, plataforma: e.target.value, altaRes: e.target.value === "Esteira" ? f.altaRes : [] })}>
            <option value="">Selecione…</option>
            {PLATAFORMAS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Status" req>
          <select style={inputStyle} value={f.status} onChange={set("status")}>{STATUS_MAQ.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Localização atual"><input style={inputStyle} value={f.local} onChange={set("local")} placeholder="Sede, oficina ou cliente" /></Field>
        <Field label="Veículo vinculado (placa)"><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={f.veiculo} onChange={set("veiculo")} placeholder="AAA-0X00" /></Field>
        <div />

        <h4 style={secTitle}>Revisões (controle por horímetro)</h4>
        {num("horimetro", "Horímetro (horas)", true)}
        {num("ultRevisao", "Última revisão (horas)")}
        {num("proxRevisao", "Próxima revisão (horas)", true)}
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
          {faltam !== null && !isNaN(faltam) && (
            faltam <= 0
              ? <Badge text={`Revisão vencida · ${fmtNum(-faltam)} h excedidas`} c="#fff" bg={T.red} />
              : faltam <= 50
                ? <Badge text={`Revisão em ${fmtNum(faltam)} h`} c={T.green900} bg="#F0CC7E" />
                : <Badge text={`Faltam ${fmtNum(faltam)} h`} c={T.green700} bg={T.green100} />
          )}
        </div>

        <h4 style={secTitle}>Tipos de sondagem e alta resolução</h4>
        <Field label="Tipos de sondagem" req span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TIPOS_SOND.map((t) => (
              <label key={t.id} style={chk(f.tipos.includes(t.id))}>
                <input type="checkbox" checked={f.tipos.includes(t.id)} onChange={() => toggle("tipos", t.id)} />{t.label}
              </label>
            ))}
          </div>
        </Field>
        {f.plataforma === "Esteira" && (
          <Field label="Capacidade alta resolução" span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ALTA_RES_OPCOES.map((a) => (
                <label key={a} style={chk(f.altaRes.includes(a))}>
                  <input type="checkbox" checked={f.altaRes.includes(a)} onChange={() => toggle("altaRes", a)} />{a}
                </label>
              ))}
            </div>
          </Field>
        )}

        <h4 style={secTitle}>Dimensões e peso</h4>
        {num("peso", "Peso conjunto (kg)", true)}
        {num("comprimento", "Comprimento (m)")}
        {num("largura", "Largura (m)")}
        <div />
        {num("altAberta", "Altura aberta (m)")}
        {num("altFechada", "Altura fechada (m)")}

        <h4 style={secTitle}>Capacidades</h4>
        {num("retracao", "Força de retração (kgf)")}
        {num("downForce", "Down force (kgf)")}
        {num("guincho", "Guincho (kgf)")}
        {num("torqueHollow", "Torque hollow (Nm)")}
        {num("profMaxDP", "Prof. máx. DP (m)", true)}
        {num("consumo", "Consumo (L/h)")}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Cadastrar máquina"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Máquinas: importação por colagem (layout da planilha GEO, 18 colunas) ---------- */
function MaqImportModal({ existentes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("codigo")) return null; // cabeçalho
      if (c.length < 18) return { erro: `${c.length} coluna(s) — são esperadas 18 (layout da planilha de máquinas)`, bruto: l };
      const cod = c[0];
      if (!cod) return { erro: "Sem código", bruto: l };
      if (existentes.some((m) => m.cod.toLowerCase() === cod.toLowerCase())) return { erro: "Código já cadastrado", bruto: l };
      const peso = parseMoeda(c[7]);
      if (peso === "" || +peso <= 0) return { erro: "Peso conjunto inválido", bruto: l };
      const profMaxDP = parseMoeda(c[16]);
      const maq = {
        cod, marca: c[1] || "", horimetro: parseMoeda(c[2]), ultRevisao: parseMoeda(c[3]), proxRevisao: parseMoeda(c[4]),
        modelo: c[5] || "",
        plataforma: norm(c[6]).includes("esteira") ? "Esteira" : "Caminhão",
        peso: +peso, comprimento: parseMoeda(c[8]), largura: parseMoeda(c[9]),
        altAberta: parseMoeda(c[10]), altFechada: parseMoeda(c[11]),
        retracao: parseMoeda(c[12]), downForce: parseMoeda(c[13]), guincho: parseMoeda(c[14]),
        torqueHollow: parseMoeda(c[15]), profMaxDP: profMaxDP === "" ? "" : +profMaxDP, consumo: parseMoeda(c[17]),
        tipos: [], altaRes: [], veiculo: "",
        status: STATUS_MAQ.find((s) => norm(s) === norm(c[18] || "")) || "Disponível",
        local: c[19] || "Sede",
      };
      return { maq };
    }).filter(Boolean);
  }, [texto, existentes]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar máquinas da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas da sua planilha de máquinas (cabeçalho é ignorado). Ordem das 18 colunas:
        <b> Código · Marca · Horímetro (h) · Última revisão (h) · Próxima revisão (h) · Modelo · Plataforma · Peso conjunto (kg) · Comprimento (m) · Largura (m) · Altura aberta (m) · Altura fechada (m) · Força de retração (kgf) · Down force (kgf) · Guincho (kgf) · Torque hollow (Nm) · Prof. máx. DP (m) · Consumo (L/h)</b>.
        Valores "NA" são lidos como não aplicável.
        Colunas 19 e 20 (opcionais): Status · Localização.
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"GEO-0023\tGeoprobe\t251\t250\t1000\t7822dt\tEsteira\t4300\t4,3\t1,8\t4,75\t2,53\t21.772\t16329\t800\t5423\t67\t30\nGEO-0003\tSondeq\t3000\t2850\t3850\tSonda\tCaminhão\t2500\t12\t2,5\t3,5\t2,6\t8000\t6000\tNA\t4000\t35\t15"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 80 }}>{l.maq?.cod || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.maq.marca} {l.maq.modelo} · {l.maq.plataforma} · ⏱ {fmtNum(l.maq.horimetro)}/{fmtNum(l.maq.proxRevisao)} h · DP {l.maq.profMaxDP || "—"} m</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      {ok.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.amber }}>⚠ Após importar, complete os <b>tipos de sondagem</b> de cada máquina (botão Editar).</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} linha(s) prontas para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.maq))}>Importar {ok.length} máquina(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Frota: formulário ---------- */
function VeicForm({ inicial, existentes, onSave, onClose }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial || { veiculo: "", tipo: "", cnh: "B", placa: "", anoFab: "", funcao: "", capCargaKg: "", capPessoas: "", implemento: "", capImplemento: "", kmAtual: "", proxRevKm: "", status: "Disponível", localAtual: "", dataLocal: hojeISO() });
  const [erros, setErros] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = () => {
    const errs = [];
    if (!f.veiculo.trim()) errs.push("Veículo (nome/modelo) é obrigatório.");
    if (!f.tipo) errs.push("Tipo é obrigatório.");
    if (!f.placa.trim()) errs.push("Placa é obrigatória.");
    if (!editando && existentes.some((v) => v.placa.toLowerCase() === f.placa.trim().toLowerCase())) errs.push(`Placa ${f.placa} já cadastrada.`);
    if (f.capCargaKg === "" || +f.capCargaKg < 0) errs.push("Capacidade de carga é obrigatória.");
    if (f.capPessoas === "" || +f.capPessoas <= 0) errs.push("Capacidade de pessoas é obrigatória.");
    if (f.implemento.trim() && f.capImplemento === "") errs.push("Informe a capacidade do implemento.");
    if (f.kmAtual === "") errs.push("Quilometragem atual é obrigatória.");
    if (f.proxRevKm === "") errs.push("Próxima revisão (km) é obrigatória.");
    if (errs.length) { setErros(errs); return; }
    const n = (v) => (v === "" ? "" : +v);
    onSave({ ...f, veiculo: f.veiculo.trim(), placa: f.placa.trim().toUpperCase(), implemento: f.implemento.trim(), anoFab: n(f.anoFab), capCargaKg: n(f.capCargaKg), capPessoas: n(f.capPessoas), capImplemento: f.implemento.trim() ? n(f.capImplemento) : "", kmAtual: n(f.kmAtual), proxRevKm: n(f.proxRevKm) });
  };

  return (
    <Modal title={editando ? `Editar — ${inicial.placa}` : "Novo veículo"} onClose={onClose} wide>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Veículo (nome/modelo)" req span><input style={inputStyle} value={f.veiculo} onChange={set("veiculo")} placeholder="VW 24.280 Constellation" /></Field>
        <Field label="Tipo" req>
          <select style={inputStyle} value={f.tipo} onChange={set("tipo")}>
            <option value="">Selecione…</option>
            {TIPOS_VEIC.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Habilitação requerida" req>
          <select style={inputStyle} value={f.cnh} onChange={set("cnh")}>{["B", "C", "D", "E"].map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="Placa" req><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", background: editando ? T.grayBg : "#fff" }} value={f.placa} onChange={set("placa")} disabled={editando} placeholder="AAA-0X00" /></Field>
        <Field label="Ano de fabricação"><input type="number" min="1980" max="2030" style={inputStyle} value={f.anoFab} onChange={set("anoFab")} /></Field>
        <Field label="Função do veículo" span><input style={inputStyle} value={f.funcao} onChange={set("funcao")} placeholder="Ex.: transporte de máquinas de sondagem, apoio de equipe" /></Field>
        <Field label="Capacidade de carga (kg)" req><input type="number" min="0" style={inputStyle} value={f.capCargaKg} onChange={set("capCargaKg")} /></Field>
        <Field label="Capacidade de pessoas" req><input type="number" min="1" style={inputStyle} value={f.capPessoas} onChange={set("capPessoas")} /></Field>
        <div />
        <Field label="Implemento"><input style={inputStyle} value={f.implemento} onChange={set("implemento")} placeholder="Prancha, Munck… (vazio = nenhum)" /></Field>
        <Field label="Capac. do implemento (kg)"><input type="number" min="0" style={inputStyle} value={f.capImplemento} onChange={set("capImplemento")} disabled={!f.implemento.trim()} /></Field>
        <div />
        <Field label="Quilometragem atual" req><input type="number" min="0" style={inputStyle} value={f.kmAtual} onChange={set("kmAtual")} /></Field>
        <Field label="Próxima revisão (km)" req><input type="number" min="0" style={inputStyle} value={f.proxRevKm} onChange={set("proxRevKm")} /></Field>
        <Field label="Status" req>
          <select style={inputStyle} value={f.status} onChange={set("status")}>{STATUS_VEIC.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Localização atual (GPS)"><input style={inputStyle} value={f.localAtual} onChange={set("localAtual")} placeholder="Cidade/UF" /></Field>
        <Field label="Data da última posição"><input type="date" style={inputStyle} value={f.dataLocal} onChange={set("dataLocal")} /></Field>
      </div>
      <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 10 }}>📡 Na fase backend, a localização será alimentada automaticamente pelo rastreador GPS do veículo (exportação diária).</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Cadastrar veículo"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Frota: importação (12 colunas) ---------- */
function VeicImportModal({ existentes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("veiculo")) return null; // cabeçalho
      if (c.length < 12) return { erro: `${c.length} coluna(s) — são esperadas 12`, bruto: l };
      const placa = (c[3] || "").toUpperCase();
      if (!placa) return { erro: "Sem placa", bruto: l };
      if (existentes.some((v) => v.placa.toLowerCase() === placa.toLowerCase())) return { erro: "Placa já cadastrada", bruto: l };
      const tipo = TIPOS_VEIC.find((t) => norm(t) === norm(c[1])) || (norm(c[1]).includes("camionete") ? "Camionete leve" : norm(c[1]).includes("caminhao") ? (norm(c[1]).includes("medio") ? "Caminhão médio" : "Caminhão pequeno") : "Veículo leve");
      const cnh = ["B", "C", "D", "E"].includes((c[2] || "").toUpperCase()) ? c[2].toUpperCase() : "B";
      const implemento = ["na", "nao", "nenhum", ""].includes(norm(c[8])) ? "" : c[8];
      const veic = {
        veiculo: c[0] || "", tipo, cnh, placa, anoFab: parseMoeda(c[4]), funcao: c[5] || "",
        capCargaKg: parseMoeda(c[6]), capPessoas: parseMoeda(c[7]),
        implemento, capImplemento: implemento ? parseMoeda(c[9]) : "",
        kmAtual: parseMoeda(c[10]), proxRevKm: parseMoeda(c[11]),
        status: STATUS_VEIC.find((s) => norm(s) === norm(c[12] || "")) || "Disponível",
        localAtual: c[13] || "", dataLocal: hojeISO(),
      };
      if (veic.capCargaKg === "") return { erro: "Capacidade de carga inválida", bruto: l };
      if (veic.kmAtual === "") return { erro: "Quilometragem atual inválida", bruto: l };
      return { veic };
    }).filter(Boolean);
  }, [texto, existentes]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar veículos da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas da sua planilha de frota (cabeçalho é ignorado). Ordem das 12 colunas:
        <b> Veículo · Tipo · Habilitação requerida · Placa · Ano fabricação · Função do veículo · Capacidade carga (kg) · Capacidade pessoas · Implemento · Capac. implemento (kg) · Quilometragem atual · Próxima revisão (km)</b>.
        Colunas 13 e 14 (opcionais): Status · Localização. Valores "NA" são lidos como não aplicável.
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"VW 24.280 Constellation\tCaminhão médio\tE\tQXP-4D21\t2019\tTransporte de máquinas\t12000\t3\tPrancha\t9000\t182500\t190000\nToyota Hilux 4x4\tCamionete leve\tB\tBCK-9A12\t2022\tApoio de equipe\t1000\t5\tNA\tNA\t96400\t100000"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 84 }}>{l.veic?.placa || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.veic.veiculo} · {l.veic.tipo} · CNH {l.veic.cnh} · {l.veic.capPessoas}p / {fmtNum(l.veic.capCargaKg)} kg{l.veic.implemento ? ` · ${l.veic.implemento} ${fmtNum(l.veic.capImplemento)} kg` : ""}</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} linha(s) prontas para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.veic))}>Importar {ok.length} veículo(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Equipamentos: formulário ---------- */
function EquipForm({ inicial, existentes, tipos, colaboradores, onSave, onClose, onAddTipo }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial || { cod: "", tipo: "", modelo: "", specs: "", local: "Almoxarifado", comQuem: "", ultCalib: "", valCalib: "", periodoCalib: 6, estado: "Operacional" });
  const [erros, setErros] = useState([]);
  const [novoTipo, setNovoTipo] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = () => {
    const errs = [];
    if (!f.cod.trim()) errs.push("Código patrimonial é obrigatório.");
    if (!editando && existentes.some((x) => x.cod.toLowerCase() === f.cod.trim().toLowerCase())) errs.push(`Código ${f.cod} já cadastrado.`);
    if (!f.tipo) errs.push("Tipo de equipamento é obrigatório.");
    if (!f.modelo.trim()) errs.push("Modelo/fabricante é obrigatório.");
    if (!f.valCalib) errs.push("Validade da calibração é obrigatória.");
    if (f.local === "Em campo" && !f.comQuem) errs.push("Informe com quem está o equipamento (em campo).");
    if (errs.length) { setErros(errs); return; }
    onSave({ ...f, cod: f.cod.trim(), comQuem: f.local === "Em campo" ? f.comQuem : "", periodoCalib: f.periodoCalib === "" ? "" : +f.periodoCalib });
  };

  return (
    <Modal title={editando ? `Editar — ${inicial.cod}` : "Novo equipamento"} onClose={onClose} wide>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Código patrimonial" req><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", background: editando ? T.grayBg : "#fff" }} value={f.cod} onChange={set("cod")} disabled={editando} placeholder="EQP-000" /></Field>
        <Field label="Tipo de equipamento" req>
          {novoTipo === null ? (
            <select style={inputStyle} value={f.tipo} onChange={(e) => e.target.value === "__novo__" ? setNovoTipo("") : setF({ ...f, tipo: e.target.value })}>
              <option value="">Selecione…</option>
              {tipos.map((t) => <option key={t}>{t}</option>)}
              <option value="__novo__">+ Adicionar tipo…</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input style={inputStyle} autoFocus value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} placeholder="Novo tipo" />
              <Btn small kind="primary" onClick={() => { if (novoTipo.trim()) { onAddTipo(novoTipo.trim()); setF({ ...f, tipo: novoTipo.trim() }); } setNovoTipo(null); }}>OK</Btn>
            </div>
          )}
        </Field>
        <Field label="Modelo / fabricante" req><input style={inputStyle} value={f.modelo} onChange={set("modelo")} placeholder="Horiba U-52" /></Field>
        <Field label="Especificações técnicas"><input style={inputStyle} value={f.specs} onChange={set("specs")} placeholder="Faixas de medição, precisão, parâmetros" /></Field>
        <Field label="Localização atual" req>
          <select style={inputStyle} value={f.local} onChange={set("local")}>
            <option>Almoxarifado</option>
            <option>Em campo</option>
          </select>
        </Field>
        {f.local === "Em campo" ? (
          <Field label="Com quem está" req>
            <select style={inputStyle} value={f.comQuem} onChange={set("comQuem")}>
              <option value="">Selecione o colaborador…</option>
              {colaboradores.filter((c) => c.status !== "Desligado").map((c) => <option key={c.mat} value={c.mat}>{c.mat} — {c.nome}</option>)}
            </select>
          </Field>
        ) : <div />}
        <Field label="Última calibração"><input type="date" style={inputStyle} value={f.ultCalib} onChange={set("ultCalib")} /></Field>
        <Field label="Validade da calibração" req><input type="date" style={inputStyle} value={f.valCalib} onChange={set("valCalib")} /></Field>
        <Field label="Período de calibração (meses)"><input type="number" min="1" style={inputStyle} value={f.periodoCalib} onChange={set("periodoCalib")} /></Field>
        <Field label="Estado geral" req>
          <select style={inputStyle} value={f.estado} onChange={set("estado")}>{ESTADOS_EQUIP.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Cadastrar equipamento"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Equipamentos: importação ---------- */
function EquipImportModal({ existentes, colaboradores, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("codigo")) return null;
      if (c.length < 8) return { erro: `${c.length} coluna(s) — são esperadas 8 a 10`, bruto: l };
      const cod = c[0];
      if (!cod) return { erro: "Sem código", bruto: l };
      if (existentes.some((x) => x.cod.toLowerCase() === cod.toLowerCase())) return { erro: "Código já cadastrado", bruto: l };
      const valCalib = brToISO(c[7] || "");
      if (!valCalib) return { erro: "Validade da calibração inválida (DD/MM/AAAA)", bruto: l };
      const emCampo = norm(c[4]).includes("campo");
      const comQuem = emCampo ? (colaboradores.find((x) => x.mat.toLowerCase() === norm(c[5]).toUpperCase().toLowerCase())?.mat || c[5] || "") : "";
      const eq = {
        cod, tipo: c[1] || "", modelo: c[2] || "", specs: c[3] || "",
        local: emCampo ? "Em campo" : "Almoxarifado", comQuem,
        ultCalib: brToISO(c[6] || "") || "", valCalib,
        periodoCalib: parseMoeda(c[8]),
        estado: ESTADOS_EQUIP.find((s) => norm(s) === norm(c[9] || "")) || "Operacional",
      };
      return { eq };
    }).filter(Boolean);
  }, [texto, existentes, colaboradores]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar equipamentos da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas (cabeçalho é ignorado). Ordem das colunas:
        <b> Código · Tipo · Modelo/fabricante · Especificações · Localização (Almoxarifado/Em campo) · Com quem (matrícula) · Última calibração · Validade calibração (DD/MM/AAAA) · Período (meses) · Estado</b>
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"EQP-014\tAnalisador multiparâmetros\tHoriba U-52\tpH 0–14\tEm campo\tGEO-0041\t20/01/2026\t20/07/2026\t6\tOperacional"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 80 }}>{l.eq?.cod || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.eq.tipo} · {l.eq.modelo} · {l.eq.local}{l.eq.comQuem ? ` (${l.eq.comQuem})` : ""}</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} linha(s) prontas para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.eq))}>Importar {ok.length} equipamento(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Disponibilidade & Rotação: editor ---------- */
function DispEditor({ colab, disp, readonly, onSave, onClose }) {
  const [d, setD] = useState(disp || { tempoMaxCampo: 15, emCampoDesde: "", localAtual: "", fonteLocal: "Ponto eletrônico", dataLocal: hojeISO(), ferias: [], afastamentos: [] });
  const [novaF, setNovaF] = useState({ ini: "", fim: "" });
  const [novoA, setNovoA] = useState({ tipo: "Doença", ini: "", fim: "" });
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const secTitle = { fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "20px 0 10px", borderBottom: `1px solid ${T.line}`, paddingBottom: 6 };
  const dias = d.emCampoDesde ? Math.floor((new Date(hojeISO()) - new Date(d.emCampoDesde)) / 864e5) : null;

  return (
    <Modal title={`Disponibilidade & Rotação — ${colab.nome}${readonly ? " (visualização)" : ""}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: T.ink }}>{colab.mat}</span> · {colab.cargo} · {colab.regiao}
      </div>

      <h4 style={secTitle}>Rotação de campo</h4>
      <div style={{ display: "grid", gridTemplateColumns: "200px 200px auto", gap: 14, alignItems: "end" }}>
        <Field label="Tempo máx. em campo (dias)" req><input type="number" min="1" style={inputStyle} value={d.tempoMaxCampo} disabled={readonly} onChange={set("tempoMaxCampo")} /></Field>
        <Field label="Em campo desde (vazio = na base)"><input type="date" style={inputStyle} value={d.emCampoDesde} disabled={readonly} onChange={set("emCampoDesde")} /></Field>
        <div style={{ paddingBottom: 8 }}>
          {dias !== null && (+d.tempoMaxCampo && dias >= +d.tempoMaxCampo
            ? <Badge text={`Rotacionar · ${dias} d em campo`} c="#fff" bg={T.red} />
            : <Badge text={`${dias} d em campo`} c={T.green700} bg={T.green100} />)}
        </div>
      </div>

      <h4 style={secTitle}>Localização atual</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 180px", gap: 14 }}>
        <Field label="Cidade/UF"><input style={inputStyle} value={d.localAtual} disabled={readonly} onChange={set("localAtual")} placeholder="Curitiba (Matriz)" /></Field>
        <Field label="Fonte do registro">
          <select style={inputStyle} value={d.fonteLocal} disabled={readonly} onChange={set("fonteLocal")}>{FONTES_LOCAL.map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <Field label="Data do registro"><input type="date" style={inputStyle} value={d.dataLocal} disabled={readonly} onChange={set("dataLocal")} /></Field>
      </div>
      <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6 }}>📡 Na fase backend, este campo será alimentado automaticamente pelo GPS do ponto eletrônico e dos veículos.</div>

      <h4 style={secTitle}>Férias programadas</h4>
      {(d.ferias || []).map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "4px 0" }}>
          <span style={{ flex: 1 }}>🏖 {fmtData(p.ini)} – {fmtData(p.fim)}</span>
          {!readonly && <button onClick={() => setD({ ...d, ferias: d.ferias.filter((_, j) => j !== i) })} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button>}
        </div>
      ))}
      {!readonly && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Field label="Início"><input type="date" style={inputStyle} value={novaF.ini} onChange={(e) => setNovaF({ ...novaF, ini: e.target.value })} /></Field>
          <Field label="Fim"><input type="date" style={inputStyle} value={novaF.fim} onChange={(e) => setNovaF({ ...novaF, fim: e.target.value })} /></Field>
          <Btn small onClick={() => { if (novaF.ini && novaF.fim && novaF.fim >= novaF.ini) { setD({ ...d, ferias: [...(d.ferias || []), novaF] }); setNovaF({ ini: "", fim: "" }); } }}>+ Add</Btn>
        </div>
      )}

      <h4 style={secTitle}>Afastamentos (doença, acidente, licença)</h4>
      {(d.afastamentos || []).map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "4px 0" }}>
          <span style={{ flex: 1 }}>🏥 {a.tipo} · {fmtData(a.ini)}{a.fim ? ` – ${fmtData(a.fim)}` : " (em aberto)"}</span>
          {!readonly && <button onClick={() => setD({ ...d, afastamentos: d.afastamentos.filter((_, j) => j !== i) })} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button>}
        </div>
      ))}
      {!readonly && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Field label="Tipo">
            <select style={inputStyle} value={novoA.tipo} onChange={(e) => setNovoA({ ...novoA, tipo: e.target.value })}>{AFAST_TIPOS.map((x) => <option key={x}>{x}</option>)}</select>
          </Field>
          <Field label="Início"><input type="date" style={inputStyle} value={novoA.ini} onChange={(e) => setNovoA({ ...novoA, ini: e.target.value })} /></Field>
          <Field label="Fim (vazio = em aberto)"><input type="date" style={inputStyle} value={novoA.fim} onChange={(e) => setNovoA({ ...novoA, fim: e.target.value })} /></Field>
          <Btn small onClick={() => { if (novoA.ini) { setD({ ...d, afastamentos: [...(d.afastamentos || []), novoA] }); setNovoA({ tipo: "Doença", ini: "", fim: "" }); } }}>+ Add</Btn>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>{readonly ? "Fechar" : "Cancelar"}</Btn>
        {!readonly && <Btn kind="primary" onClick={() => onSave(d)}>Salvar disponibilidade</Btn>}
      </div>
    </Modal>
  );
}

/* ---------- Contratos: formulário ---------- */
function ContratoForm({ inicial, existentes, clientes, podeCusto, onSave, onClose }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial ? { ...{ cliente: "", contrato: "", cnpj: "", localidade: "", estado: "", projeto: "", servico: "", valorIdgeo: "", valorContrato: "", statusCt: "Vigente", anexoContrato: null, analiseIA: null }, ...inicial } : { cliente: "", contrato: "", cnpj: "", localidade: "", estado: "", projeto: "", servico: "", valorIdgeo: "", valorContrato: "", statusCt: "Vigente", anexoContrato: null, analiseIA: null });
  const [erros, setErros] = useState([]);
  const [analisando, setAnalisando] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const clienteLegado = editando && f.cliente && !clientes.some((c) => c.nome === f.cliente);
  const aoEscolherCliente = (e) => {
    const nome = e.target.value;
    const cli = clientes.find((c) => c.nome === nome);
    setF({ ...f, cliente: nome, cnpj: f.cnpj || (cli?.cnpj || "") });
  };

  const aoAnexar = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setF((cur) => ({ ...cur, anexoContrato: { nome: file.name, tipo: file.type, tamanho: file.size, dataURL: reader.result, anexadoEm: hojeISO() }, analiseIA: null }));
    };
    reader.readAsDataURL(file);
  };

  /* Análise do contrato pela IA — funcional no deploy (API). No protótipo, registra o pedido. */
  const analisarComIA = async () => {
    if (!f.anexoContrato) return;
    const chk = checarTamanhoAnexos(f.anexoContrato);
    if (chk.excede) { setF((c) => ({ ...c, analiseIA: { erro: chk.msg } })); return; }
    setAnalisando(true);
    try {
      const base64 = (f.anexoContrato.dataURL || "").split(",")[1];
      const ehPDF = (f.anexoContrato.tipo || "").includes("pdf");
      const prompt = "Você é analista de contratos de engenharia ambiental. Leia o contrato anexado e extraia, em JSON, os campos: prazos (datas e marcos), regrasFaturamento, riscos (lista), premissas (lista), obrigacoesLegais (lista), obrigacoesSMS (lista), e resumoExecutivo (texto curto). Responda SOMENTE com o JSON, sem texto adicional.";
      const content = [];
      if (ehPDF) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
      else content.push({ type: "text", text: "(arquivo não-PDF anexado: " + f.anexoContrato.nome + ")" });
      content.push({ type: "text", text: prompt });

      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, messages: [{ role: "user", content }] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.detalhe || data.error);
      const txt = (data.content || []).map((b) => b.text || "").join("\n").replace(/```json|```/g, "").trim();
      let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { resumoExecutivo: txt }; }
      setF((cur) => ({ ...cur, analiseIA: { ...parsed, analisadoEm: hojeISO() } }));
    } catch (err) {
      const msg = (err && err.message) ? String(err.message) : "";
      const offline = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Unexpected token");
      setF((cur) => ({ ...cur, analiseIA: { erro: offline ? "A análise por IA roda no sistema publicado (com a API conectada). O arquivo já está anexado e será lido no deploy." : ("Erro na análise: " + msg), analisadoEm: hojeISO() } }));
    } finally {
      setAnalisando(false);
    }
  };

  const salvar = () => {
    const errs = [];
    if (!f.cliente.trim()) errs.push("Cliente é obrigatório.");
    if (!f.contrato.trim()) errs.push("Nº do contrato/proposta é obrigatório.");
    if (!editando && existentes.some((x) => x.contrato.toLowerCase() === f.contrato.trim().toLowerCase())) errs.push(`Contrato ${f.contrato} já cadastrado.`);
    if (!f.localidade.trim()) errs.push("Localidade é obrigatória.");
    if (!f.estado) errs.push("Estado é obrigatório.");
    if (!f.projeto.trim()) errs.push("Projeto é obrigatório.");
    if (!f.servico.trim()) errs.push("Serviço é obrigatório.");
    if (errs.length) { setErros(errs); return; }
    const n = (v) => (v === "" || v == null ? "" : +v);
    onSave({ cliente: f.cliente.trim(), contrato: f.contrato.trim(), cnpj: f.cnpj.trim(), localidade: f.localidade.trim(), estado: f.estado, projeto: f.projeto.trim(), servico: f.servico.trim(), valorIdgeo: n(f.valorIdgeo), valorContrato: n(f.valorContrato), statusCt: f.statusCt, anexoContrato: f.anexoContrato, analiseIA: f.analiseIA });
  };

  return (
    <Modal title={editando ? `Editar — ${inicial.contrato}` : "Novo contrato"} onClose={onClose} wide>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      {clientes.length === 0 && !editando && (
        <div style={{ background: T.amberBg, color: T.amber, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          Nenhum cliente cadastrado ainda — cadastre primeiro na aba 🏢 Clientes.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Cliente" req span>
          <select style={inputStyle} value={f.cliente} onChange={aoEscolherCliente}>
            <option value="">Selecione o cliente…</option>
            {clienteLegado && <option value={f.cliente}>{f.cliente} (não cadastrado)</option>}
            {clientes.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Contrato / Proposta" req><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", background: editando ? T.grayBg : "#fff" }} value={f.contrato} disabled={editando} onChange={set("contrato")} placeholder="CT-0000-000" /></Field>
        <Field label="CNPJ"><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={f.cnpj} onChange={set("cnpj")} placeholder="preenchido pelo cliente" /></Field>
        <Field label="Localidade" req><input style={inputStyle} value={f.localidade} onChange={set("localidade")} placeholder="Município" /></Field>
        <Field label="Estado" req>
          <select style={inputStyle} value={f.estado} onChange={set("estado")}>
            <option value="">UF…</option>
            {UFS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Projeto" req span><input style={inputStyle} value={f.projeto} onChange={set("projeto")} placeholder="Nome do projeto" /></Field>
        <Field label="Serviço" req span><input style={inputStyle} value={f.servico} onChange={set("servico")} placeholder="Descrição do serviço contratado" /></Field>
        {podeCusto && (
          <>
            <Field label="Valor IDGEO (R$) 🔒"><input type="number" min="0" step="0.01" style={inputStyle} value={f.valorIdgeo} onChange={set("valorIdgeo")} /></Field>
            <Field label="Valor Contrato (R$) 🔒"><input type="number" min="0" step="0.01" style={inputStyle} value={f.valorContrato} onChange={set("valorContrato")} /></Field>
          </>
        )}
        <Field label="Status" req>
          <select style={inputStyle} value={f.statusCt} onChange={set("statusCt")}>{STATUS_CONTRATO.map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
      </div>
      <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 12 }}>As validades dos documentos obrigatórios (PGR, PCMSO, PPEOB, PCA, PPR, LTCAT, LIP, AET) são registradas na aba 🦺 SMS.</p>

      {/* Anexo do contrato + análise por IA */}
      <div style={{ marginTop: 14, padding: "14px 16px", background: T.blueBg, borderRadius: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.blue, marginBottom: 4 }}>📎 Contrato fechado (para análise da IA)</div>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>Anexe o PDF do contrato assinado. A IA extrairá prazos, regras de faturamento, riscos, premissas e obrigações legais/SMS para conduzir o campo e o acompanhamento comercial.</div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" onChange={aoAnexar} style={{ display: "none" }} />
        {!f.anexoContrato ? (
          <Btn onClick={() => fileRef.current && fileRef.current.click()}>📎 Anexar contrato</Btn>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ fontSize: 13 }}>📄 <b>{f.anexoContrato.nome}</b></span>
              <span style={{ fontSize: 11, color: T.inkSoft }}>{(f.anexoContrato.tamanho / 1024).toFixed(0)} KB · anexado {fmtData(f.anexoContrato.anexadoEm)}</span>
              <div style={{ flex: 1 }} />
              <Btn small kind="ghost" onClick={() => fileRef.current && fileRef.current.click()}>Trocar</Btn>
              <Btn small kind="danger" onClick={() => setF({ ...f, anexoContrato: null, analiseIA: null })}>Remover</Btn>
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn kind="primary" small disabled={analisando} onClick={analisarComIA}>{analisando ? "Analisando…" : "🤖 Analisar com IA"}</Btn>
            </div>
            {f.analiseIA && (
              <div style={{ marginTop: 10, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px", fontSize: 12.5 }}>
                {f.analiseIA.erro ? (
                  <div style={{ color: T.amber }}>⏳ {f.analiseIA.erro}</div>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, color: T.green900, marginBottom: 6 }}>🤖 Análise da IA <span style={{ fontSize: 10.5, fontWeight: 400, color: T.inkSoft }}>· {fmtData(f.analiseIA.analisadoEm)}</span></div>
                    {f.analiseIA.resumoExecutivo && <p style={{ margin: "4px 0" }}>{f.analiseIA.resumoExecutivo}</p>}
                    {f.analiseIA.prazos && <div style={{ marginTop: 4 }}><b>📅 Prazos:</b> {typeof f.analiseIA.prazos === "string" ? f.analiseIA.prazos : JSON.stringify(f.analiseIA.prazos)}</div>}
                    {f.analiseIA.regrasFaturamento && <div style={{ marginTop: 4 }}><b>💰 Faturamento:</b> {typeof f.analiseIA.regrasFaturamento === "string" ? f.analiseIA.regrasFaturamento : JSON.stringify(f.analiseIA.regrasFaturamento)}</div>}
                    {Array.isArray(f.analiseIA.riscos) && f.analiseIA.riscos.length > 0 && <div style={{ marginTop: 4 }}><b>⚠ Riscos:</b> {f.analiseIA.riscos.join(" · ")}</div>}
                    {Array.isArray(f.analiseIA.premissas) && f.analiseIA.premissas.length > 0 && <div style={{ marginTop: 4 }}><b>📌 Premissas:</b> {f.analiseIA.premissas.join(" · ")}</div>}
                    {Array.isArray(f.analiseIA.obrigacoesLegais) && f.analiseIA.obrigacoesLegais.length > 0 && <div style={{ marginTop: 4 }}><b>⚖️ Obrigações legais:</b> {f.analiseIA.obrigacoesLegais.join(" · ")}</div>}
                    {Array.isArray(f.analiseIA.obrigacoesSMS) && f.analiseIA.obrigacoesSMS.length > 0 && <div style={{ marginTop: 4 }}><b>🦺 Obrigações SMS:</b> {f.analiseIA.obrigacoesSMS.join(" · ")}</div>}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Criar contrato"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Contratos: importação (10 colunas) ---------- */
function CtImportModal({ existentes, clientes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("cliente")) return null; // cabeçalho
      if (c.length < 10) return { erro: `${c.length} coluna(s) — são esperadas 10`, bruto: l };
      const cliente = c[0], contrato = c[1];
      if (!cliente || !contrato) return { erro: "Cliente e contrato/proposta são obrigatórios", bruto: l };
      if (existentes.some((x) => x.contrato.toLowerCase() === contrato.toLowerCase())) return { erro: "Contrato já cadastrado", bruto: l };
      const cliRec = clientes.find((x) => norm(x.nome) === norm(cliente));
      const estado = UFS.find((u) => u === (c[4] || "").toUpperCase()) || "";
      const ct = {
        cliente: cliRec ? cliRec.nome : cliente, contrato, cnpj: c[2] || (cliRec?.cnpj || ""),
        localidade: c[3] || "", estado, projeto: c[5] || "", servico: c[6] || "",
        valorIdgeo: parseMoeda(c[7]), valorContrato: parseMoeda(c[8]),
        statusCt: STATUS_CONTRATO.find((s) => norm(s) === norm(c[9] || "")) || "Vigente",
        docs: {},
      };
      return { ct, semCliente: !cliRec };
    }).filter(Boolean);
  }, [texto, existentes, clientes]);
  const ok = linhas.filter((l) => !l.erro);
  const semCli = ok.filter((l) => l.semCliente).length;

  return (
    <Modal title="Importar contratos da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas (cabeçalho é ignorado). Ordem das 10 colunas:
        <b> Cliente · Contrato/Proposta · CNPJ · Localidade · Estado (UF) · Projeto · Serviço · Valor IDGEO · Valor Contrato · Status</b>
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Rede Sol Combustíveis\tCT-2026-044\t81.444.219/0001-05\tPonta Grossa\tPR\tPosto BR-376 — Fase II\tMonitoramento semestral\t96.000\t89.000\tEm mobilização"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {semCli > 0 && <div style={{ marginTop: 8, fontSize: 12.5, color: T.amber }}>⚠ {semCli} contrato(s) com cliente ainda não cadastrado na aba 🏢 Clientes — serão importados mesmo assim; recomenda-se cadastrar o cliente depois.</div>}
      {linhas.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 100 }}>{l.ct?.contrato || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.ct.cliente} · {l.ct.projeto} · {l.ct.localidade}/{l.ct.estado}{l.semCliente ? " ⚠" : ""}</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} contrato(s) prontos para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.ct))}>Importar {ok.length} contrato(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Docs Obrigatórios: importação de validades (por CNPJ) ---------- */
function DocsImportModal({ rows, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("cliente") || norm(c[0]).includes("cnpj")) return null; // cabeçalho
      const comCliente = c.length >= 10;
      const cnpjBruto = comCliente ? c[1] : c[0];
      const offset = comCliente ? 2 : 1;
      if (c.length < offset + 8) return { erro: `${c.length} coluna(s) — use CNPJ + 8 documentos (com ou sem a coluna Cliente)`, bruto: l };
      const row = rows.find((r) => r.key === cnpjKey(cnpjBruto) || r.cnpj === cnpjBruto);
      if (!row) return { erro: `CNPJ ${cnpjBruto || "?"} sem contrato cadastrado — crie na aba 📄 Contratos`, bruto: l };
      const docs = {}; let invalidas = 0;
      DOCS_CLIENTE.forEach((dc, i) => {
        const rec = parseSmsCell(c[i + offset]);
        if (rec === undefined) return;
        if (rec.erro) { invalidas++; return; }
        docs[dc.id] = rec;
      });
      if (invalidas) return { erro: `${invalidas} célula(s) inválida(s) — use datas DD/MM/AAAA ou NA`, bruto: l };
      return { key: row.key, cnpj: row.cnpj, cliente: row.clientes.join(" · "), docs };
    }).filter(Boolean);
  }, [texto, rows]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar validades de documentos (por CNPJ)" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas (cabeçalho é ignorado). Formato: <b>[Cliente ·] CNPJ · PGR · PCMSO · PPEOB · PCA · PPR · LTCAT · LIP · AET</b> — a coluna Cliente é opcional.
        Células = <b>data de validade</b> (DD/MM/AAAA) · <b>NA</b> = não exigido · vazio = mantém como está.
        O CNPJ precisa pertencer a algum contrato cadastrado; as validades são mescladas.
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"33.000.167/0010-29\t30/11/2026\t15/08/2026\t25/06/2026\tNA\t10/05/2026\t01/02/2027\tNA\t09/09/2026"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 140 }}>{l.cnpj || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.cliente} — {Object.keys(l.docs).length} validade(s)</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} CNPJ(s) prontos</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok)}>Importar validades ({ok.length})</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Condicionantes do Projeto: formulário ---------- */
function CondForm({ ct, inicial, onSave, onClose }) {
  const [f, setF] = useState(inicial || { prazoIni: "", prazoFim: "", condicoes: "", fiscal: "", fiscalFone: "", fiscalEmail: "" });
  const [erros, setErros] = useState([]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const salvar = () => {
    const errs = [];
    if (!f.prazoIni) errs.push("Prazo para início das atividades é obrigatório.");
    if (!f.prazoFim) errs.push("Prazo para finalização das atividades de campo é obrigatório.");
    if (f.prazoIni && f.prazoFim && f.prazoFim < f.prazoIni) errs.push("O prazo de finalização deve ser posterior ao de início.");
    if (errs.length) { setErros(errs); return; }
    onSave(f);
  };
  return (
    <Modal title={`Condicionantes — ${ct.contrato}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 12 }}>{ct.cliente} · {ct.projeto}</div>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Prazo para início das atividades" req><input type="date" style={inputStyle} value={f.prazoIni} onChange={set("prazoIni")} /></Field>
        <Field label="Prazo para finalização do campo" req><input type="date" style={inputStyle} value={f.prazoFim} onChange={set("prazoFim")} /></Field>
        <div />
        <Field label="Fiscal responsável"><input style={inputStyle} value={f.fiscal} onChange={set("fiscal")} placeholder="Nome do fiscal do contrato" /></Field>
        <Field label="Telefone do fiscal"><input style={inputStyle} value={f.fiscalFone} onChange={set("fiscalFone")} placeholder="(00) 00000-0000" /></Field>
        <Field label="E-mail do fiscal"><input style={inputStyle} value={f.fiscalEmail} onChange={set("fiscalEmail")} placeholder="fiscal@cliente.com.br" /></Field>
        <Field label="Condicionantes específicas do serviço" span>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={f.condicoes} onChange={set("condicoes")} placeholder="Ex.: trabalho noturno proibido · acesso mediante PT diária · janelas de parada · restrições de área…" />
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>Salvar condicionantes</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Condicionantes: importação ---------- */
function CondImportModal({ contratos, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("contrato")) return null;
      if (c.length < 3) return { erro: `${c.length} coluna(s) — são esperadas ao menos 3`, bruto: l };
      const ct = contratos.find((x) => x.contrato.toLowerCase() === (c[0] || "").toLowerCase());
      if (!ct) return { erro: `Contrato ${c[0] || "?"} não cadastrado`, bruto: l };
      const prazoIni = brToISO(c[1] || "");
      const prazoFim = brToISO(c[2] || "");
      if (!prazoIni || !prazoFim) return { erro: "Prazos inválidos (use DD/MM/AAAA)", bruto: l };
      return { contrato: ct.contrato, cliente: ct.cliente, cond: { prazoIni, prazoFim, condicoes: c[3] || "", fiscal: c[4] || "", fiscalFone: c[5] || "", fiscalEmail: c[6] || "" } };
    }).filter(Boolean);
  }, [texto, contratos]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar condicionantes da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas (cabeçalho é ignorado). Ordem das colunas:
        <b> Nº Contrato · Prazo início (DD/MM/AAAA) · Prazo fim campo (DD/MM/AAAA) · Condicionantes · Fiscal · Telefone · E-mail</b> (4 últimas opcionais).
      </p>
      <textarea rows={5} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"CT-2025-118\t22/06/2026\t30/09/2026\tTrabalho noturno proibido\tEng. Marcos Lima\t(41) 99876-2210\tmarcos@cliente.com"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 100 }}>{l.contrato || "?"}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <>{l.cliente} · início {fmtData(l.cond.prazoIni)} · fim {fmtData(l.cond.prazoFim)}{l.cond.fiscal ? ` · fiscal ${l.cond.fiscal}` : ""}</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} contrato(s) prontos</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok)}>Importar ({ok.length})</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Clientes: formulário ---------- */
function ClienteForm({ inicial, existentes, segmentos, onSave, onClose, onAddSegmento, onNotificar }) {
  const editando = !!inicial;
  const [f, setF] = useState(inicial || { nome: "", cnpj: "", segmento: "", cidade: "", contato: "", foneEmail: "", emailCliente: "", exigencias: "", exigenciasDetalhadas: "", prazoEntradaCampo: "", prazoConclusaoCampo: "", prazoRelatorio: "", prazoEntregaFinal: "", prazoCartaOrgao: "", prazoOutros: "", carteira: "", status: "Ativo", notificadoEm: "" });
  const [erros, setErros] = useState([]);
  const [novoSeg, setNovoSeg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = () => {
    const errs = [];
    if (!f.nome.trim()) errs.push("Nome/razão social é obrigatório.");
    if (!editando && existentes.some((x) => x.nome.toLowerCase() === f.nome.trim().toLowerCase())) errs.push(`Cliente "${f.nome}" já cadastrado.`);
    if (!f.segmento) errs.push("Segmento é obrigatório.");
    if (!f.cidade.trim()) errs.push("Cidade/UF é obrigatória.");
    if (errs.length) { setErros(errs); return; }
    /* Se há carteira definida e ainda não foi notificado, dispara a notificação ao salvar */
    const precisaNotificar = f.carteira && !f.notificadoEm;
    const limpo = { ...f, nome: f.nome.trim() };
    if (precisaNotificar && onNotificar) {
      const ok = onNotificar(limpo);
      if (ok) limpo.notificadoEm = hojeISO();
    }
    onSave(limpo);
  };

  return (
    <Modal title={editando ? `Editar — ${inicial.nome}` : "Novo cliente"} onClose={onClose} wide>
      {erros.length > 0 && (
        <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 14 }}>
          {erros.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nome / razão social" req span><input style={{ ...inputStyle, background: editando ? T.grayBg : "#fff" }} value={f.nome} onChange={set("nome")} disabled={editando} placeholder="Nome do cliente / unidade" /></Field>
        <Field label="CNPJ"><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={f.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" /></Field>
        <Field label="Segmento" req>
          {novoSeg === null ? (
            <select style={inputStyle} value={f.segmento} onChange={(e) => e.target.value === "__novo__" ? setNovoSeg("") : setF({ ...f, segmento: e.target.value })}>
              <option value="">Selecione…</option>
              {segmentos.map((s) => <option key={s}>{s}</option>)}
              <option value="__novo__">+ Adicionar segmento…</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input style={inputStyle} autoFocus value={novoSeg} onChange={(e) => setNovoSeg(e.target.value)} placeholder="Novo segmento" />
              <Btn small kind="primary" onClick={() => { if (novoSeg.trim()) { onAddSegmento(novoSeg.trim()); setF({ ...f, segmento: novoSeg.trim() }); } setNovoSeg(null); }}>OK</Btn>
            </div>
          )}
        </Field>
        <Field label="Cidade / UF" req><input style={inputStyle} value={f.cidade} onChange={set("cidade")} placeholder="Curitiba/PR" /></Field>
        <Field label="Status" req>
          <select style={inputStyle} value={f.status} onChange={set("status")}>{["Ativo", "Inativo"].map((s) => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="Nome do fiscal de contrato"><input style={inputStyle} value={f.contato} onChange={set("contato")} placeholder="Responsável do cliente pelo contrato" /></Field>
        <Field label="Telefone"><input style={inputStyle} value={f.foneEmail} onChange={set("foneEmail")} placeholder="(00) 0000-0000" /></Field>
        <Field label="E-mail do cliente" span><input style={inputStyle} value={f.emailCliente} onChange={set("emailCliente")} placeholder="contato@cliente.com.br" /></Field>

        <Field label="Exigências gerais do cliente" span>
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.exigencias} onChange={set("exigencias")} placeholder="Ex.: integração obrigatória, Fit Test, APR diária, restrições de acesso e horário…" />
        </Field>
        <Field label="Exigências detalhadas do projeto" span>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={f.exigenciasDetalhadas} onChange={set("exigenciasDetalhadas")} placeholder="Detalhamento técnico/contratual: escopo, normas específicas, documentação, condições de execução, particularidades da obra…" />
        </Field>
      </div>

      {/* Expectativa de prazos / marcos importantes */}
      <div style={{ marginTop: 16, padding: "12px 14px", background: T.green100, borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.green900, marginBottom: 3 }}>📅 Expectativa de prazos — marcos importantes</div>
        <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 10 }}>Datas opcionais — preencha apenas os marcos com prazo definido. Clique no campo para abrir o calendário.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["prazoEntradaCampo", "Início das atividades de campo"], ["prazoConclusaoCampo", "Conclusão das atividades de campo"], ["prazoRelatorio", "Emissão do relatório técnico"], ["prazoEntregaFinal", "Entrega final do projeto"], ["prazoCartaOrgao", "Carta ao órgão ambiental"]].map(([k, lab]) => (
            <Field key={k} label={lab}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="date" style={{ ...inputStyle, background: "#fff" }} value={f[k] || ""} onChange={set(k)} />
                {f[k] && <button onClick={() => setF({ ...f, [k]: "" })} title="Limpar data" style={{ border: "none", background: "none", color: T.inkSoft, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>}
              </div>
            </Field>
          ))}
          <Field label="Outras demandas específicas"><input style={inputStyle} value={f.prazoOutros} onChange={set("prazoOutros")} placeholder="Ex.: protocolo SEMAD até 30/08" /></Field>
        </div>
      </div>

      {/* Definição do gerente/carteira responsável -> dispara notificação */}
      <div style={{ marginTop: 16, padding: "12px 14px", background: T.blueBg, borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.blue, marginBottom: 8 }}>👤 Gerente de projeto responsável</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
          <Field label="Carteira / gerente responsável">
            <select style={inputStyle} value={f.carteira} onChange={set("carteira")}>
              <option value="">Selecione a carteira…</option>
              {["GC01", "GC02", "GC03", "GC04", "GC05", "GC06", "GC07", "GC08"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div style={{ fontSize: 11.5, color: T.inkSoft }}>
            {f.notificadoEm
              ? `✓ Cliente e gerente notificados em ${fmtData(f.notificadoEm)}.`
              : f.carteira
                ? "Ao salvar, o sistema gerará o e-mail de notificação ao cliente e ao gerente."
                : "Defina a carteira para habilitar a notificação automática."}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>{editando ? "Salvar alterações" : "Cadastrar cliente"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Clientes: importação ---------- */
function ClienteImportModal({ existentes, segmentos, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => x.trim());
      if (norm(c[0]).includes("cliente") || norm(c[0]).includes("razao")) return null; // cabeçalho
      if (c.length < 4) return { erro: `${c.length} coluna(s) — são esperadas ao menos 4`, bruto: l };
      const nome = c[0];
      if (!nome) return { erro: "Sem nome", bruto: l };
      if (existentes.some((x) => x.nome.toLowerCase() === nome.toLowerCase())) return { erro: "Cliente já cadastrado", bruto: l };
      const segmento = segmentos.find((s) => norm(s) === norm(c[2])) || c[2] || "";
      const cli = { nome, cnpj: c[1] || "", segmento, cidade: c[3] || "", contato: c[4] || "", foneEmail: c[5] || "", exigencias: c[6] || "", status: norm(c[7] || "").includes("inativ") ? "Inativo" : "Ativo" };
      return { cli };
    }).filter(Boolean);
  }, [texto, existentes, segmentos]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar clientes da planilha" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas (cabeçalho é ignorado). Ordem das colunas:
        <b> Cliente · CNPJ · Segmento · Cidade/UF · Contato · Telefone/E-mail · Exigências · Status</b> (as 4 últimas opcionais).
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Petrobras — REPAR\t33.000.167/0010-29\tÓleo & Gás\tAraucária/PR\tEng. Marcos Lima\t(41) 99876-2210\tIntegração 8h, Fit Test"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <><b>{l.cli.nome}</b> · {l.cli.segmento || "—"} · {l.cli.cidade || "—"}</>}
              </span>
              {l.erro ? <Badge text={l.erro} c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} cliente(s) prontos para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.cli))}>Importar {ok.length} cliente(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Localização: importação de posições diárias ---------- */
function LocImportModal({ modo, colaboradores, frota, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const [dataRef, setDataRef] = useState(hojeISO());
  const pessoas = modo === "pessoas";

  const proc = useMemo(() => {
    const lns = texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim());
    if (!lns.length) return { itens: [], naoEnc: 0, ord: [] };
    /* detecta e remove cabeçalho */
    const prim = lns[0].split("\t").map((x) => norm(x));
    const temHeader = prim.some((h) => h.includes("matric") || h.includes("placa") || h.includes("latitude") || h.includes("cidade") || h.includes("localizacao"));
    /* mapeia colunas por nome quando houver cabeçalho; senão usa ordem padrão */
    let idx = { chave: 0, data: -1, cidade: -1, loc: -1, lat: -1, lng: -1 };
    if (temHeader) {
      prim.forEach((h, i) => {
        if (h.includes("matric") || h.includes("placa")) idx.chave = i;
        else if (h.includes("data")) idx.data = i;
        else if (h.includes("cidade")) idx.cidade = i;
        else if (h === "localizacao" || h.includes("maps") || h.includes("link")) idx.loc = i;
        else if (h.includes("latitude")) idx.lat = i;
        else if (h.includes("longitude")) idx.lng = i;
      });
    } else {
      idx = { chave: 0, data: 1, cidade: 2, loc: -1, lat: 3, lng: 4 };
    }

    const linhasDados = temHeader ? lns.slice(1) : lns;
    const porChave = {}; /* última marcação vence (ordem do arquivo) */
    const ord = [];
    let naoEnc = 0;
    linhasDados.forEach((l) => {
      const c = l.split("\t").map((x) => (x || "").trim());
      const chaveBruta = c[idx.chave] || "";
      if (!chaveBruta) return;
      const alvo = pessoas ? matchMat(chaveBruta, colaboradores) : frota.find((x) => x.placa.toLowerCase() === chaveBruta.toLowerCase());
      /* coordenadas: colunas lat/lng, ou extraídas do link/Localizacao, ou de qualquer célula */
      let lat = idx.lat >= 0 ? parseCoord(c[idx.lat]) : null;
      let lng = idx.lng >= 0 ? parseCoord(c[idx.lng]) : null;
      if (lat == null || lng == null) {
        const fonte = (idx.loc >= 0 ? c[idx.loc] : "") || l;
        const co = coordsDeTexto(fonte);
        if (co) { lat = co.lat; lng = co.lng; }
      }
      const cidade = idx.cidade >= 0 ? (c[idx.cidade] || "").replace(/\s*\/\s*/g, "/") : "";
      const dataLinha = idx.data >= 0 ? (brToISO(c[idx.data]) || (/^\d{4}-\d{2}-\d{2}/.test(c[idx.data] || "") ? c[idx.data].slice(0, 10) : "")) : "";
      const key = pessoas ? (alvo ? alvo.mat : "?" + chaveBruta) : chaveBruta.toUpperCase();
      if (!alvo) { if (!porChave[key]) { naoEnc++; porChave[key] = { erro: true, chaveBruta }; ord.push(key); } return; }
      if (!porChave[key]) ord.push(key);
      porChave[key] = { alvo, nome: pessoas ? alvo.nome : alvo.veiculo, chave: pessoas ? alvo.mat : alvo.placa, cidade, lat, lng, data: dataLinha || dataRef, nMarc: (porChave[key]?.nMarc || 0) + 1 };
    });
    const itens = ord.map((k) => porChave[k]).filter((x) => !x.erro);
    return { itens, naoEnc, total: ord.length };
  }, [texto, colaboradores, frota, pessoas, dataRef]);

  const semGeo = proc.itens.filter((it) => it.lat == null || it.lng == null).filter((it) => !GAZ[normCity(it.cidade)]).length;
  const semCidade = proc.itens.filter((it) => !it.cidade && (it.lat == null || it.lng == null)).length;
  const prontos = proc.itens.filter((it) => it.cidade || (it.lat != null && it.lng != null));

  return (
    <Modal title={pessoas ? "Importar posições — Pessoas (ponto eletrônico)" : "Importar posições — Veículos (GPS)"} onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole a exportação {pessoas ? "do ponto eletrônico" : "do rastreador"} <b>com o cabeçalho</b>. As colunas são reconhecidas pelo nome
        ({pessoas ? "Matricula" : "Placa"} · Cidade / UF · Latitude · Longitude — ou um link do Google Maps na coluna <i>Localizacao</i>).
        Se houver <b>várias marcações por {pessoas ? "matrícula" : "placa"}</b>, vale a <b>última</b> do arquivo. {pessoas && "A matrícula casa com o cadastro mesmo com zeros à esquerda ou prefixo."}
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, color: T.inkSoft }}>Data de referência (quando o arquivo não traz data por linha):</span>
        <input type="date" style={{ ...inputStyle, maxWidth: 170, padding: "5px 8px" }} value={dataRef} onChange={(e) => setDataRef(e.target.value)} />
      </div>
      <textarea rows={7} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, resize: "vertical" }}
        placeholder={pessoas
          ? "Matricula\tNome\tCidade / UF\tLocalizacao\tLatitude\tLongitude\n591\tAlef Cassiano\tSao Bernardo do Campo / SP\thttps://maps.google.com/...\t-23.7044606\t-46.5646508"
          : "Placa\tCidade / UF\tLatitude\tLongitude\nBCK-9A12\tPonta Grossa / PR\t-25.0945\t-50.1633"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {proc.naoEnc > 0 && <div style={{ marginTop: 8, fontSize: 12.5, color: T.amber }}>⚠ {proc.naoEnc} {pessoas ? "matrícula(s)" : "placa(s)"} não encontrada(s) no cadastro — ignorada(s).</div>}
      {semGeo > 0 && <div style={{ marginTop: 6, fontSize: 12.5, color: T.amber }}>⚠ {semGeo} posição(ões) com cidade fora do mapa e sem coordenadas — entram no quadro, mas sem ponto no mapa.</div>}
      {prontos.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {prontos.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, minWidth: 76 }}>{it.chave}</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.nome} · {it.cidade || (it.lat != null ? `${it.lat.toFixed(4)}, ${it.lng.toFixed(4)}` : "—")}
                {it.nMarc > 1 ? <span style={{ color: T.inkSoft }}> · {it.nMarc} marcações (última)</span> : null}
              </span>
              <Badge text="Pronto" c={T.green700} bg={T.green100} />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{prontos.length} {pessoas ? "colaborador(es)" : "veículo(s)"} com posição{proc.total ? ` · ${proc.total} chave(s) no arquivo` : ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={prontos.length === 0} onClick={() => onImport(prontos.map((it) => ({ [pessoas ? "mat" : "placa"]: it.chave, cidade: it.cidade, data: it.data, lat: it.lat ?? "", lng: it.lng ?? "" })))}>Atualizar {prontos.length} posição(ões)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Modal de comparação de cenários ---------- */
function CenariosModal({ cenarios, onEscolher, onClose }) {
  const validos = cenarios.filter((c) => c.os);
  /* destaca o melhor de cada métrica */
  const minCusto = Math.min(...validos.map((c) => c.os.custoTotal || Infinity));
  const minDias = Math.min(...validos.map((c) => c.os.diasCampo || Infinity));
  const minKm = Math.min(...validos.map((c) => c.os.kmTotal || Infinity));
  /* diagnóstico: todos sem equipe? cenários idênticos? */
  const todosSemEquipe = validos.length > 0 && validos.every((c) => !(c.os.equipe || []).some((e) => !e.vazio));
  const alertasComuns = validos.length ? (validos[0].os.alertas || []).map((a) => (typeof a === "string" ? a : a.txt)) : [];
  const equipesIguais = validos.length > 1 && new Set(validos.map((c) => (c.os.equipe || []).filter((e) => !e.vazio).map((e) => e.mat).sort().join("|"))).size === 1;
  return (
    <Modal title="Simulação de cenários — escolha a melhor opção" onClose={onClose} wide>
      <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>Cada cenário usa uma estratégia diferente de priorização. Compare e escolha o que considerar melhor — sua escolha irá ao gerente para validação.</p>
      {todosSemEquipe && (
        <div style={{ background: T.amberBg, border: `1px solid ${T.amber}`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#8a5d13", fontSize: 13.5, marginBottom: 4 }}>⚠ O Motor não conseguiu montar a equipe — por isso os três cenários ficam iguais.</div>
          <div style={{ fontSize: 12.5, color: "#8a5d13" }}>As estratégias só diferem quando há equipe e recursos a otimizar. Sem equipe alocada, não há trade-off entre custo, logística e tempo. Causa provável, lida do Motor:</div>
          {alertasComuns.length > 0 && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12, color: "#8a5d13" }}>
              {alertasComuns.slice(0, 4).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>
      )}
      {!todosSemEquipe && equipesIguais && (
        <div style={{ background: T.blueBg, border: `1px solid ${T.blue}`, borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 12.5, color: T.green900 }}>
          As três estratégias chegaram à <b>mesma equipe</b> — para este projeto, a melhor escolha de custo, logística e tempo coincide. Qualquer cenário leva ao mesmo resultado.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {cenarios.map((c) => {
          const os = c.os;
          const semEquipe = !os || (os.equipe || []).some((e) => e.vazio);
          return (
            <div key={c.id} style={{ border: `2px solid ${T.line}`, borderRadius: 12, padding: "14px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22 }}>{c.icone}</div>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, fontWeight: 600 }}>{c.nome}</div>
              <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 10, minHeight: 30 }}>{c.desc}</div>
              {os ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>💰 Custo</span><b style={{ color: os.custoTotal === minCusto ? T.green700 : T.green900 }}>{fmtBRL(os.custoTotal)}{os.custoTotal === minCusto ? " ★" : ""}</b></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>⏱ Dias</span><b style={{ color: os.diasCampo === minDias ? T.green700 : T.green900 }}>{os.diasCampo}{os.diasCampo === minDias ? " ★" : ""}</b></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>🛣 Km</span><b style={{ color: os.kmTotal === minKm ? T.green700 : T.green900 }}>{os.kmTotal}{os.kmTotal === minKm ? " ★" : ""}</b></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>👥 Equipe</span><b>{(os.equipe || []).filter((e) => !e.vazio).length}</b></div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: T.inkSoft, borderTop: `1px solid ${T.line}`, paddingTop: 6 }}>
                    {(os.equipe || []).filter((e) => !e.vazio).map((e) => e.nome.split(" ")[0]).join(", ") || "—"}
                    {os.maquina ? ` · ${os.maquina.cod}` : ""}{os.veiculo ? ` · ${os.veiculo.placa}` : ""}
                  </div>
                  {os.alertas && os.alertas.length > 0 && (
                    <details style={{ marginTop: 4 }}>
                      <summary style={{ fontSize: 10.5, color: T.amber, cursor: "pointer" }}>⚠ {os.alertas.length} alerta(s)</summary>
                      <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, color: T.inkSoft }}>
                        {os.alertas.slice(0, 6).map((a, i) => <li key={i}>{typeof a === "string" ? a : a.txt}</li>)}
                      </ul>
                    </details>
                  )}
                  <div style={{ flex: 1 }} />
                  <Btn kind="primary" small disabled={semEquipe} onClick={() => onEscolher(c)} style={{ marginTop: 10 }}>{semEquipe ? "Equipe incompleta" : "Escolher este"}</Btn>
                </>
              ) : <div style={{ fontSize: 12, color: T.red }}>Não foi possível montar este cenário.</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ---------- Programação manual (sem vir do Holmes) ---------- */
function ProgManualForm({ clientes, onCriar, onClose }) {
  const [f, setF] = useState({ idgeo: "", projeto: "", cliente: "", cidade: "", uf: "", carteira: "", prioridade: "Média", inicioPrev: "", fimPrev: "", notas: "" });
  const [atvs, setAtvs] = useState([]); // {id, qtd}
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleAtv = (id) => setAtvs((cur) => cur.some((a) => a.id === id) ? cur.filter((a) => a.id !== id) : [...cur, { id, qtd: 0 }]);
  const setQtd = (id, q) => setAtvs((cur) => cur.map((a) => a.id === id ? { ...a, qtd: q } : a));
  const criar = () => {
    if (!f.projeto.trim()) { setErro("Informe o nome do projeto."); return; }
    const ok = onCriar({ ...f, atividades: atvs });
    if (ok === false) setErro("Já existe um projeto com este IDGEO.");
  };
  return (
    <Modal title="Nova programação manual" onClose={onClose} wide>
      <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>Crie uma programação sem precisar de um TAP do Holmes. Útil para serviços avulsos, emergenciais ou de outras origens. O IDGEO é gerado automaticamente se você deixar em branco.</p>
      {erro && <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{erro}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="IDGEO (opcional)"><input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={f.idgeo} onChange={set("idgeo")} placeholder="auto (MAN-xxxxx)" /></Field>
        <Field label="Projeto" req><input style={inputStyle} value={f.projeto} onChange={set("projeto")} placeholder="Nome do projeto/serviço" /></Field>
        <Field label="Cliente">
          <select style={inputStyle} value={f.cliente} onChange={set("cliente")}>
            <option value="">Selecione…</option>
            {clientes.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Carteira / gerente">
          <select style={inputStyle} value={f.carteira} onChange={set("carteira")}>
            <option value="">Selecione…</option>
            {["GC01", "GC02", "GC03", "GC04", "GC05", "GC06", "GC07", "GC08"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Cidade"><input style={inputStyle} value={f.cidade} onChange={set("cidade")} placeholder="Cidade da obra" /></Field>
        <Field label="UF"><input style={inputStyle} value={f.uf} onChange={set("uf")} maxLength={2} placeholder="PR" /></Field>
        <Field label="Início previsto"><input type="date" style={inputStyle} value={f.inicioPrev} onChange={set("inicioPrev")} /></Field>
        <Field label="Fim previsto"><input type="date" style={inputStyle} value={f.fimPrev} onChange={set("fimPrev")} /></Field>
        <Field label="Prioridade">
          <select style={inputStyle} value={f.prioridade} onChange={set("prioridade")}>{["Alta", "Média", "Baixa"].map((p) => <option key={p}>{p}</option>)}</select>
        </Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.green900, marginBottom: 6 }}>Atividades do projeto (selecione e informe a quantidade)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {ATIVIDADES.map((a) => {
            const on = atvs.some((x) => x.id === a.id);
            return <button key={a.id} onClick={() => toggleAtv(a.id)} title={a.label}
              style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, cursor: "pointer", border: `1px solid ${on ? T.green700 : T.line}`, background: on ? T.green700 : "#fff", color: on ? "#fff" : T.inkSoft }}>
              {on ? "✓ " : ""}{a.short}</button>;
          })}
        </div>
        {atvs.length > 0 && (
          <div style={{ display: "grid", gap: 6 }}>
            {atvs.map((a) => { const atv = ATIVIDADES.find((x) => x.id === a.id); return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                <span style={{ flex: 1 }}>{atv ? atv.short : a.id}</span>
                <input type="number" min="0" style={{ ...inputStyle, width: 110, padding: "5px 8px" }} value={a.qtd} onChange={(e) => setQtd(a.id, +e.target.value)} placeholder="qtd" />
                <span style={{ fontSize: 11, color: T.inkSoft, width: 50 }}>{UNID_ATV[a.id] || ""}</span>
              </div>
            ); })}
          </div>
        )}
      </div>
      <Field label="Notas" style={{ marginTop: 12 }}>
        <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.notas} onChange={set("notas")} placeholder="Observações sobre o serviço…" />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={criar}>Criar programação</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Programação manual: fim ---------- */

/* ---------- Planejamento EXECUTIVO: anexos técnicos + notas ---------- */
function PlanoExecutivo({ tap, prog, podeEditar, onSalvar, onClose }) {
  const [exec, setExec] = useState(prog.executivo || { anexos: [], notas: "", pesos: { ...PESOS_PADRAO } });
  const pesos = exec.pesos || { ...PESOS_PADRAO };
  const setPeso = (k, v) => setExec((e) => ({ ...e, pesos: { ...(e.pesos || PESOS_PADRAO), [k]: v } }));
  const salvar = () => { onSalvar(tap.idgeo, exec); onClose(); };

  return (
    <Modal title={`Planejamento Executivo — ${tap.idgeo}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>{tap.projeto} · {tap.cliente}</div>
      <div style={{ background: T.green100, color: T.green900, borderRadius: 8, padding: "10px 14px", fontSize: 12.5, margin: "10px 0 16px" }}>
        📐 Nível <b>Executivo</b>: ajuste fino da decisão do Motor para este projeto. Os documentos técnicos (planilhas de pontos, laudos, mapas, plantas) são anexados no <b>Plano de Trabalho</b> (botão + Plano, na aba Planejamento); aqui você define os pesos que orientam a alocação e registra notas técnicas da campanha.
      </div>

      {/* Escala de valores — pesos da decisão do Motor */}
      <div style={{ background: T.blueBg, borderRadius: 10, padding: "14px 16px", margin: "4px 0 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.blue, marginBottom: 2 }}>⚖️ Escala de valores — critérios de decisão da IA</div>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 12 }}>Defina o peso (0 a 10) de cada critério. O Motor usa esta hierarquia para priorizar suas sugestões de equipe, rota, prazo e custo. Quanto maior o peso, mais o critério influencia a decisão.</div>
        {PESOS_CRITERIOS.map(([k, label, ajuda]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 200, flexShrink: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.green900 }}>{label}</div>
              <div style={{ fontSize: 10.5, color: T.inkSoft }}>{ajuda}</div>
            </div>
            <input type="range" min="0" max="10" step="1" disabled={!podeEditar} value={pesos[k] ?? 5}
              onChange={(e) => setPeso(k, +e.target.value)} style={{ flex: 1, accentColor: T.blue }} />
            <div style={{ width: 38, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 16, color: (pesos[k] ?? 5) >= 8 ? T.green700 : (pesos[k] ?? 5) <= 3 ? T.inkSoft : T.green900 }}>{pesos[k] ?? 5}</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 6, paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
          💡 Pendências de documentos/obrigações legais <b>não impedem</b> a programação de campo — entram como alertas. A qualidade técnico-operacional tem peso alto por padrão.
        </div>
      </div>

      <Field label="Notas técnicas do executivo">
        <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={exec.notas} disabled={!podeEditar}
          onChange={(e) => setExec({ ...exec, notas: e.target.value })}
          placeholder="Pontos de amostragem, análises químicas requeridas (ex.: BTEX, PAH, metais), profundidades-alvo, malha de sondagem, requisitos do laboratório, ARTs, particularidades de acesso…" />
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn onClick={onClose}>Fechar</Btn>
        {podeEditar && <Btn kind="primary" onClick={salvar}>Salvar executivo</Btn>}
      </div>
    </Modal>
  );
}

/* ---------- Custos: importação da matriz de preços unitários (Excel/colagem) ---------- */
function PrecosImportModal({ existentes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => (x || "").trim());
      const n0 = norm(c[0]);
      if (n0.includes("item") || n0.includes("servic") || n0.includes("descri")) return null; // cabeçalho
      if (!c[0]) return null;
      const preco = parseMoeda(c[2]);
      if (c.length < 2) return { erro: `Linha incompleta: "${l}"`, bruto: l };
      let unidade = (c[1] || "").trim();
      if (unidade && !/^R\$\//i.test(unidade)) unidade = "R$/" + unidade.replace(/^\//, "");
      return { ativo: { id: "pu_" + Math.random().toString(36).slice(2, 8), item: c[0], unidade: unidade || "R$/unid", preco: preco === "" ? 0 : preco } };
    }).filter(Boolean);
  }, [texto]);
  const ok = linhas.filter((l) => !l.erro);
  return (
    <Modal title="Importar matriz de preços unitários" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas da planilha (cabeçalho é ignorado). Ordem das 3 colunas:
        <b> Item de custo · Unidade (R$/m, R$/ponto, R$/unid…) · Preço unitário</b>. A importação <b>substitui</b> a matriz atual.
      </p>
      <textarea rows={7} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Item de custo\tUnidade\tPreço\nMobilização e transporte\tR$/km\t4,50\nSondagem\tR$/m\t145\nInstalação de poços\tR$/m\t210\nPSG instalação/desinstalação\tR$/ponto\t380\nAnálise VOC\tR$/unid\t95"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 240, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ flex: 1 }}>{l.erro ? l.bruto : <><b>{l.ativo.item}</b> · {l.ativo.unidade} · {fmtBRL(l.ativo.preco)}</>}</span>
              {l.erro ? <Badge text="Erro" c={T.red} bg="#fff" /> : <Badge text="OK" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} item(ns) válido(s)</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.ativo))}>Importar {ok.length} item(ns)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Cronograma: importação do resumo (Excel/colagem) ---------- */
function ResumoImportModal({ prog, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const linhas = useMemo(() => {
    return texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim()).map((l) => {
      const c = l.split("\t").map((x) => (x || "").trim());
      if (norm(c[0]).includes("tipo") && norm(c[0]).includes("servic")) return null; // cabeçalho
      if (norm(c[0]) === "atividade" || norm(c[0]).includes("tipo do servico")) return null;
      if (c.length < 1 || !c[0]) return null;
      const atv = matchAtividade(c[0]);
      if (!atv) return { erro: `Serviço não reconhecido: "${c[0]}"`, bruto: l };
      const integTxt = norm(c[4] || "");
      const integracao = ["sim", "s", "x", "true", "1", "necessaria", "requer"].includes(integTxt) || integTxt.includes("sim");
      return { ativo: {
        atividadeId: atv.id, atvLabel: atv.short,
        qtd: c[1] ? parseMoeda(c[1]) : "", unid: UNID_ATV[atv.id] || "",
        equipeMin: c[2] || "", local: c[3] || prog.local || "",
        integracao, obs: c[5] || "",
      } };
    }).filter(Boolean);
  }, [texto, prog]);
  const ok = linhas.filter((l) => !l.erro);

  return (
    <Modal title="Importar resumo de atividades (base do cronograma)" onClose={onClose} wide>
      <p style={{ fontSize: 13.5, color: T.inkSoft, marginTop: 0 }}>
        Cole as linhas da planilha (cabeçalho é ignorado). Ordem das 6 colunas:
        <b> Tipo do serviço · Quantidade · Equipe mínima (qualificação) · Localização · Integração prévia (Sim/Não) · Observações</b>.
        O <b>tipo do serviço</b> é casado com a lista de atividades cadastrada; se a <b>equipe mínima</b> ficar em branco, o sistema preenche pela Regra de Equipe da atividade.
      </p>
      <textarea rows={6} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, resize: "vertical" }}
        placeholder={"Tipo do serviço\tQuantidade\tEquipe mínima\tLocalização\tIntegração\tObservações\nAmostragem Baixa Vazão\t12\t1 amostrador nível ≥2\tPonta Grossa/PR\tNão\tPurga de baixa vazão em 12 poços\nInstalação de poços de monitoramento\t4\t1 sondador + 1 auxiliar\tPonta Grossa/PR\tSim\tProfundidade alvo 8m"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />
      {linhas.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 240, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <><b>{l.ativo.atvLabel}</b>{l.ativo.qtd !== "" ? ` · ${fmtNum(l.ativo.qtd)} ${l.ativo.unid}` : ""}{l.ativo.equipeMin ? ` · 👥 ${l.ativo.equipeMin}` : ""}{l.ativo.integracao ? " · ⚠ integração" : ""}</>}
              </span>
              {l.erro ? <Badge text="Não reconhecido" c={T.red} bg="#fff" /> : <Badge text="Pronto" c={T.green700} bg={T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} de {linhas.length} linha(s) prontas — cada uma vira uma frente de trabalho</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.ativo))}>Criar {ok.length} frente(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Detalhes da TAP (visão completa do projeto) ---------- */
function TapDetalhes({ tap, podeCusto, papelAssinatura, onAssinar, onBaixarPDF, onClose }) {
  if (!tap) return null;
  const linha = (rotulo, valor) => valor ? (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.line}`, fontSize: 12.5 }}>
      <span style={{ minWidth: 200, color: T.inkSoft, fontWeight: 600 }}>{rotulo}</span>
      <span style={{ flex: 1 }}>{valor}</span>
    </div>
  ) : null;
  const servicos = Array.isArray(tap.tipoServico) ? tap.tipoServico.join(" · ") : tap.tipoServico;
  const ia = tap.analiseJuridicaIA || tap.analiseIA;
  const aceites = tap.aceitesTap || {};
  const bloco = (titulo, conteudo) => conteudo ? (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900, marginBottom: 3 }}>{titulo}</div>
      <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>{conteudo}</div>
    </div>
  ) : null;
  const listaBloco = (titulo, arr, cor) => Array.isArray(arr) && arr.length > 0 ? (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: cor || T.green900, marginBottom: 3 }}>{titulo}</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: T.ink, lineHeight: 1.5 }}>
        {arr.map((x, i) => <li key={i}>{typeof x === "object" ? `${x.item || ""}: ${x.quantidade || ""} ${x.unidade || ""}`.trim() : x}</li>)}
      </ul>
    </div>
  ) : null;

  return (
    <Modal title={`📖 LEIA! — ${tap.idgeo} · ${tap.projeto || "Projeto"}`} onClose={onClose} wide>
      <div style={{ background: T.amberBg, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: T.ink }}>
        ⚠ <b>Leitura obrigatória.</b> Este documento reúne o resumo da TAP e o parecer técnico-jurídico gerado pela Inteligência. O <b>Gestor de Operações</b> e o <b>Gerente de Projetos</b> devem ler e assinar o aceite das premissas abaixo.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <StatusBadge s={tap.statusTap || "Aguardando Plano de Trabalho"} />
        {tap.carteira && <Badge text={`Carteira ${tap.carteira}`} c={T.blue} bg={T.blueBg} />}
        {tap.urgente15 && <Badge text="⚡ Urgente (≤15 dias)" c={T.amber} bg={T.amberBg} />}
      </div>

      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, marginBottom: 4 }}>Resumo da TAP</div>
      {linha("Cliente", tap.cliente)}
      {linha("CNPJ", tap.cnpj)}
      {linha("Contato do cliente", tap.contato)}
      {linha("Cidade / UF", [tap.cidade, tap.uf].filter(Boolean).join("/"))}
      {linha("Carteira / Gerente", tap.carteira || tap.gerente)}
      {linha("Premissas", tap.premissas || tap.premOper)}
      {linha("Expectativas", tap.expectativas || tap.metas)}
      {linha("Entrada em campo", tap.entradaCampo && fmtData(tap.entradaCampo))}
      {linha("Entrega de relatório", tap.entregaRelatorio && fmtData(tap.entregaRelatorio))}
      {linha("Prazo máximo", tap.prazoMaximo && fmtData(tap.prazoMaximo))}
      {linha("Riscos técnicos", tap.riscosTecnicos || tap.riscos)}
      {linha("Desafios operacionais", tap.desafiosOper)}

      {/* PARECER DA IA */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "16px 0 8px", borderTop: `2px solid ${T.green700}`, paddingTop: 12 }}>🧠 Parecer técnico-jurídico (Inteligência)</div>
      {!ia ? (
        <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic", background: T.paper, borderRadius: 8, padding: "12px 14px" }}>
          O parecer da IA ainda não foi gerado para esta TAP (ele é produzido na criação da TAP, ao analisar o dossiê contratual, quando a API está conectada).
        </div>
      ) : ia.erro ? (
        <div style={{ fontSize: 12.5, color: T.amber, background: T.amberBg, borderRadius: 8, padding: "12px 14px" }}>{ia.erro}</div>
      ) : (
        <div style={{ background: T.paper, borderRadius: 10, padding: "14px 16px" }}>
          {bloco("📋 Escopo resumido", ia.escopoResumo || ia.observacoes)}
          {listaBloco("📐 Quantitativos do trabalho", ia.quantitativos)}
          {bloco("⚖️ Análise jurídica", ia.analiseJuridica)}
          {listaBloco("💰 Multas e penalidades", ia.multasPenalidades, T.red)}
          {listaBloco("📌 Obrigações críticas", ia.obrigacoesCriticas)}
          {bloco("👥 Avaliação da estrutura de pessoas", ia.estruturaPessoas)}
          {listaBloco("⚠ Alertas de fragilidade de pessoal", ia.alertasPessoas, T.amber)}
          {bloco("⚙️ Avaliação de máquinas e equipamentos", ia.estruturaRecursos)}
          {listaBloco("💼 Necessidade de investimento", ia.necessidadeInvestimento, T.amber)}
          {listaBloco("📋 Normas exigidas", ia.normas)}
          {listaBloco("🔎 Alertas para a gestão", ia.alertasGestao, T.amber)}
        </div>
      )}

      {/* download PDF */}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={() => onBaixarPDF && onBaixarPDF(tap)}>⬇ Baixar parecer em PDF</Btn>
      </div>

      {/* ASSINATURAS */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "18px 0 8px", borderTop: `2px solid ${T.green700}`, paddingTop: 12 }}>✍️ Aceite das premissas (assinatura conjunta)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["gestorOp", "Gestor de Operações"], ["gerenteProj", "Gerente de Projetos"]].map(([papel, nome]) => {
          const ja = aceites[papel];
          const podeAssinar = papelAssinatura === papel || papelAssinatura === "ambos";
          return (
            <div key={papel} style={{ border: `1.5px solid ${ja ? T.green700 : T.line}`, background: ja ? T.green100 : "#fff", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900 }}>{nome}</div>
              {ja ? (
                <div style={{ fontSize: 11.5, color: T.green700, marginTop: 4 }}>✓ Assinado por {ja.por || nome}<br />{fmtData(ja.em)}</div>
              ) : podeAssinar ? (
                <button onClick={() => onAssinar && onAssinar(tap, papel)} style={{ marginTop: 8, width: "100%", background: T.amber, color: "#3A2E08", border: "none", borderRadius: 8, padding: "9px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>✍️ Li, entendi e assino o aceite</button>
              ) : (
                <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 6 }}>Aguardando assinatura do {nome.toLowerCase()}.</div>
              )}
            </div>
          );
        })}
      </div>
      {aceites.gestorOp && aceites.gerenteProj && (
        <div style={{ background: T.green100, borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: 12.5, color: T.green700, fontWeight: 600, textAlign: "center" }}>✓ Aceite conjunto completo — premissas validadas pelos dois responsáveis.</div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <Btn kind="primary" onClick={onClose}>Fechar</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Editor de Programação (atividades, quantidades, equipes, datas) ---------- */
function ProgEditor({ tap, inicial, estimaDias, onSalvar, onExcluir, onClose }) {
  const base = inicial || {};
  /* atividades: usa as existentes, ou sugere pelo tipo de serviço da TAP */
  const ativIniciais = (base.atividades && base.atividades.length)
    ? base.atividades
    : sugerirAtividades(tap.tipoServico).map((id) => ({ id, qtd: 0 }));
  const [ativs, setAtivs] = useState(ativIniciais);
  const [equipes, setEquipes] = useState(base.equipes || 1);
  const [inicioPrev, setInicioPrev] = useState(base.inicioPrev || tap.entradaCampo || "");
  const [fimPrev, setFimPrev] = useState(base.fimPrev || tap.entregaRelatorio || "");
  const [prioridade, setPrioridade] = useState(base.prioridade || (tap.urgente15 ? "Alta" : "Média"));
  const [local, setLocal] = useState(base.local || tap.cidade || "");
  const [uf, setUf] = useState(base.uf || tap.uf || "");
  const [addId, setAddId] = useState("");

  const setQtd = (id, v) => setAtivs((cur) => cur.map((a) => a.id === id ? { ...a, qtd: v === "" ? "" : +v } : a));
  const removerAtiv = (id) => setAtivs((cur) => cur.filter((a) => a.id !== id));
  const addAtiv = () => { if (addId && !ativs.some((a) => a.id === addId)) { setAtivs([...ativs, { id: addId, qtd: 0 }]); setAddId(""); } };
  const labelDe = (id) => (ATIVIDADES.find((x) => x.id === id) || {}).label || id;
  const unidDe = (id) => { const a = ATIVIDADES.find((x) => x.id === id) || {}; return (UNID_PROD[id] || a.unidProd || "unid").replace("/dia", ""); };

  const progAtual = { atividades: ativs, equipes, inicioPrev, fimPrev, prioridade, local, uf };
  const est = estimaDias ? estimaDias(progAtual) : { dias: 0, parcial: false };
  /* fim previsto = início + dias de campo (pulando fins de semana e feriados) */
  const fimCalc = (inicioPrev && est.dias > 0) ? somarDiasCampo(inicioPrev, est.dias) : (fimPrev || "");

  const montar = () => ({ idgeo: tap.idgeo, local, uf, prioridade, inicioPrev, fimPrev: fimCalc, equipes: +equipes || 1,
    atividades: ativs.map((a) => ({ id: a.id, qtd: a.qtd === "" ? 0 : +a.qtd })),
    executivo: base.executivo || { anexos: [], notas: "", pesos: { ...PESOS_PADRAO } },
    cronograma: base.cronograma || { blocos: [] }, revisoes: base.revisoes || [],
    aceites: base.aceites || { gerente: null, rotas: null }, cenarioSel: base.cenarioSel || null });

  return (
    <Modal title={`Atividades — ${tap.idgeo} · ${tap.projeto || ""}`} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Field label="Início previsto"><input type="date" style={inputStyle} value={inicioPrev} onChange={(e) => setInicioPrev(e.target.value)} /></Field>
        <Field label="Fim previsto (calculado)">
          <input type="date" style={{ ...inputStyle, background: T.paper }} value={fimCalc} readOnly title="Calculado: início + dias de campo, pulando fins de semana e feriados" />
        </Field>
        <Field label="Nº de equipes"><input type="number" min="1" step="1" style={inputStyle} value={equipes} onChange={(e) => setEquipes(e.target.value)} /></Field>
        <Field label="Prioridade">
          <select style={inputStyle} value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
            <option>Alta</option><option>Média</option><option>Baixa</option>
          </select>
        </Field>
      </div>
      {inicioPrev && est.dias > 0 && (
        <div style={{ background: T.blueBg, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: T.ink, marginBottom: 8 }}>
          📅 <b>{est.dias} dia(s) de campo</b> a partir de {fmtData(inicioPrev)} → fim previsto <b>{fmtData(fimCalc)}</b> <span style={{ color: T.inkSoft }}>(considerando fins de semana e feriados como não úteis{est.parcial ? "; alguns serviços sem produtividade definida" : ""})</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <Field label="Localidade"><input style={inputStyle} value={local} onChange={(e) => setLocal(e.target.value)} /></Field>
        <Field label="UF"><input style={inputStyle} value={uf} maxLength={2} onChange={(e) => setUf(e.target.value.toUpperCase())} /></Field>
      </div>

      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, marginTop: 12, marginBottom: 6 }}>Atividades de campo e quantidades</div>
      {ativs.length === 0 ? (
        <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic", marginBottom: 8 }}>Nenhuma atividade. Adicione abaixo.</div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
          {ativs.map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i % 2 ? "#FAFBF8" : "#fff", borderBottom: i < ativs.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>{labelDe(a.id)}</span>
              <input type="number" min="0" step="0.1" style={{ ...inputStyle, width: 110, padding: "6px 8px", textAlign: "right" }} value={a.qtd} onChange={(e) => setQtd(a.id, e.target.value)} placeholder="0" />
              <span style={{ fontSize: 11.5, color: T.inkSoft, minWidth: 56 }}>{unidDe(a.id)}</span>
              <button onClick={() => removerAtiv(a.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <select style={{ ...inputStyle, width: "auto", minWidth: 240, padding: "6px 10px" }} value={addId} onChange={(e) => setAddId(e.target.value)}>
          <option value="">+ Adicionar atividade…</option>
          {ATIVIDADES.filter((x) => !ativs.some((a) => a.id === x.id)).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
        <Btn small onClick={addAtiv} disabled={!addId}>Adicionar</Btn>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: est.parcial ? T.amber : T.green700, fontWeight: 600 }}>
          {est.parcial ? "⚠ informe as quantidades para estimar" : `≈ ${est.dias} dia(s) de campo`}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
        <div>
          {inicial && <Btn kind="danger" onClick={() => onExcluir(tap.idgeo)}>Excluir programação</Btn>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={() => onSalvar(tap.idgeo, montar(), false)}>Salvar rascunho</Btn>
          <Btn kind="primary" onClick={() => onSalvar(tap.idgeo, montar(), true)}>Confirmar programação</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Card de Projeto Pré-agendado (4 opções de OS + ajuste fino) ---------- */
function PreAgendamentoCard({ idgeo, pre, tap, podeConfirmar, onRecalcular, onConfirmar, sugerirJanelas, onAddServico, onRemoverServico }) {
  const [editando, setEditando] = useState(!(pre.quantidades && Object.values(pre.quantidades).some((v) => +v > 0)));
  /* se o pré-agendamento veio sem serviços (TAP manual sem IA), abre com a lista completa para preencher */
  const quantInicial = (pre.quantidades && Object.keys(pre.quantidades).length > 0)
    ? pre.quantidades
    : ATIVIDADES.reduce((acc, a) => { acc[a.id] = 0; return acc; }, {});
  const [quant, setQuant] = useState(quantInicial);
  const [equipes, setEquipes] = useState(pre.equipes || 1);
  const [opSel, setOpSel] = useState(null);
  const [janelaSel, setJanelaSel] = useState({}); // janela escolhida por opção
  const [expandida, setExpandida] = useState("custo"); // tabela de contingência aberta por padrão na 1ª opção
  const [simIni, setSimIni] = useState("");
  const [simFim, setSimFim] = useState("");
  const labelDe = (id) => (ATIVIDADES.find((x) => x.id === id) || {}).label || id;
  const unidDe = (id) => { const a = ATIVIDADES.find((x) => x.id === id) || {}; return (UNID_PROD[id] || a.unidProd || "unid").replace("/dia", ""); };
  const fmtMoeda = (v) => v != null ? fmtBRL(v) : "—";
  const aplicarAjuste = () => { onRecalcular(quant, +equipes || 1, { ini: simIni, fim: simFim }); setEditando(false); };
  const simularData = () => { onRecalcular(pre.quantidades || quant, pre.equipes || +equipes || 1, { ini: simIni, fim: simFim }); };
  const temQtd = Object.values(pre.quantidades || {}).some((v) => +v > 0);
  /* badge de disponibilidade temporal do recurso (livre/parcial/bloqueado na janela) */
  const BadgeDisp = ({ disp }) => {
    if (!disp) return null;
    const ni = TRAVA_INFO(disp.nivel);
    return <span style={{ fontSize: 9.5, fontWeight: 700, color: ni.cor, background: ni.bg, borderRadius: 99, padding: "1px 6px", whiteSpace: "nowrap" }}>{ni.icone} {ni.curto}</span>;
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.green900 }}>{tap.projeto || idgeo} <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.inkSoft }}>· {idgeo}</span></div>
          <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 2 }}>{tap.cliente} · {tap.cidade}/{tap.uf} {tap.carteira ? `· carteira ${tap.carteira}` : ""}</div>
        </div>
        <Btn small kind="ghost" onClick={() => setEditando((v) => !v)}>{editando ? "Fechar ajuste" : "✏️ Ajustar serviços"}</Btn>
      </div>

      {/* ===== PAINEL DE DECISÃO: as 4 perguntas respondidas de forma direta ===== */}
      {pre.opcoes && pre.opcoes.length > 0 && (() => {
        const ops = pre.opcoes.filter((o) => o.os);
        if (ops.length === 0) return null;
        const byId = (id) => ops.find((o) => o.id === id) || null;
        const oCusto = byId("custo") || ops[0];
        const oRota = byId("rota") || byId("logistica") || ops[0];
        const oRapida = byId("rapida") || ops[0];
        const nEquipe = (o) => o && o.os && o.os.equipe ? o.os.equipe.filter((e) => !e.vazio).length : 0;
        const custoDe = (o) => o && o.os ? o.os.custoTotal : null;
        const kmDe = (o) => o && o.os && o.os.maxDistEquipe != null ? Math.round(o.os.maxDistEquipe) : null;
        const diasDe = (o) => o && o.os ? o.os.diasCampo : null;
        /* economia entre o mais caro e o mais barato */
        const custos = ops.map(custoDe).filter((v) => v != null);
        const maisBarato = custos.length ? Math.min(...custos) : null;
        const maisCaro = custos.length ? Math.max(...custos) : null;
        const economia = (maisBarato != null && maisCaro != null) ? maisCaro - maisBarato : 0;
        /* equipe sugerida pelo cenário equilibrado (rota, que pondera proximidade+custo) */
        const eqSugerida = oRota && oRota.os && oRota.os.equipe ? oRota.os.equipe.filter((e) => !e.vazio) : [];
        /* janelas futuras livres */
        const janelas = sugerirJanelas && oRota && oRota.os ? sugerirJanelas(oRota.os) : [];
        const Resp = ({ icone, titulo, children }) => (
          <div style={{ background: "#fff", borderRadius: 10, padding: "11px 13px", border: `1px solid ${T.line}`, flex: "1 1 200px", minWidth: 190 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 }}>{icone} {titulo}</div>
            {children}
          </div>
        );
        return (
          <div style={{ background: T.blueBg, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.green900, marginBottom: 10, fontFamily: "'IBM Plex Serif', serif" }}>⚡ Resposta rápida para a decisão</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {/* 1. Qual equipe */}
              <Resp icone="👥" titulo="Qual equipe alocar">
                {eqSugerida.length > 0 ? (
                  <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
                    {eqSugerida.slice(0, 3).map((e, i) => (
                      <div key={i}><b>{(e.nome || "").split(" ")[0]} {(e.nome || "").split(" ").slice(-1)[0]}</b> <span style={{ color: T.inkSoft }}>· {e.papel}</span></div>
                    ))}
                    {eqSugerida.length > 3 && <div style={{ color: T.inkSoft }}>+{eqSugerida.length - 3} pessoa(s)</div>}
                  </div>
                ) : <div style={{ fontSize: 11.5, color: T.inkSoft }}>Defina as quantidades para sugerir a equipe.</div>}
              </Resp>
              {/* 2. Melhor logística */}
              <Resp icone="🛣" titulo="Melhor logística">
                {kmDe(oRota) != null ? (
                  <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.green900 }}>{kmDe(oRota)} km</div>
                    <div style={{ color: T.inkSoft }}>distância máx. da equipe à obra</div>
                    {kmDe(oCusto) != null && kmDe(oCusto) !== kmDe(oRota) && <div style={{ color: T.green700, marginTop: 2 }}>economiza {kmDe(oCusto) - kmDe(oRota)} km vs. menor custo</div>}
                  </div>
                ) : <div style={{ fontSize: 11.5, color: T.inkSoft }}>—</div>}
              </Resp>
              {/* 3. Menor custo */}
              <Resp icone="💰" titulo="Menor custo">
                {custoDe(oCusto) != null ? (
                  <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.green900 }}>{fmtBRL(maisBarato)}</div>
                    {economia > 0 ? <div style={{ color: T.green700 }}>economiza {fmtBRL(economia)} vs. cenário mais caro</div> : <div style={{ color: T.inkSoft }}>custo da campanha</div>}
                  </div>
                ) : <div style={{ fontSize: 11.5, color: T.inkSoft }}>—</div>}
              </Resp>
              {/* 4. Opções futuras */}
              <Resp icone="📅" titulo="Opções no futuro">
                {janelas.length > 0 ? (
                  <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
                    {janelas.slice(0, 3).map((j, i) => (
                      <div key={i}>{["🥇", "🥈", "🥉"][i]} {fmtData(j.ini)} <span style={{ color: T.inkSoft }}>({j.livres}/{j.totalRec} livres)</span></div>
                    ))}
                  </div>
                ) : <div style={{ fontSize: 11.5, color: T.inkSoft }}>Defina as quantidades para ver as janelas.</div>}
              </Resp>
            </div>
            {/* linha de trade-off entre os 3 cenários */}
            {custos.length > 1 && (
              <div style={{ marginTop: 10, fontSize: 11.5, color: T.ink, background: "#fff", borderRadius: 8, padding: "9px 12px", lineHeight: 1.6 }}>
                <b style={{ color: T.green900 }}>Equilíbrio:</b> {oRapida && diasDe(oRapida) != null ? <>entrar antes custa <b>{fmtBRL(custoDe(oRapida))}</b> com {nEquipe(oRapida)} pessoa(s) e entrega em {diasDe(oRapida)} dia(s)</> : ""}; {oCusto && custoDe(oCusto) != null ? <>o menor custo ({fmtBRL(custoDe(oCusto))}) {kmDe(oCusto) != null && kmDe(oRota) != null && kmDe(oCusto) > kmDe(oRota) ? <>roda mais {kmDe(oCusto) - kmDe(oRota)} km</> : "mantém a logística"}</> : ""}. Escolha o cenário abaixo conforme a prioridade do projeto.
              </div>
            )}
          </div>
        );
      })()}

      {/* O que a Inteligência entendeu do projeto */}
      {(() => {
        const ia = (pre.analiseIA) || (tap && tap.analiseJuridicaIA) || null;
        const servicos = Object.keys(pre.quantidades || {});
        return (
          <div style={{ background: T.green100, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.green900, marginBottom: 6 }}>🧠 O que a Inteligência entendeu deste projeto</div>
            {servicos.length === 0
              ? <div style={{ fontSize: 12, color: T.inkSoft }}>Ainda não foram identificados serviços. Use "Ajustar serviços" para incluir o escopo.</div>
              : <div style={{ fontSize: 12, color: T.ink }}>Escopo previsto: {servicos.map((s) => labelDe(s)).join(" · ")}.</div>}
            <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>Confira e ajuste os serviços/quantidades abaixo — a IA pode não ter captado tudo, e você pode adicionar ou remover itens.</div>
          </div>
        );
      })()}

      {/* aviso se quantidades zeradas */}
      {!temQtd && !editando && (
        <div style={{ background: T.amberBg, color: T.ink, borderRadius: 8, padding: "10px 14px", fontSize: 12.5, marginBottom: 12 }}>
          ⚠ As quantidades ainda não foram informadas (a IA não as extraiu ou o plano não as continha). Clique em <b>Ajustar serviços</b> para informá-las e gerar as opções com dias, custo e equipe.
        </div>
      )}

      {/* painel de ajuste fino */}
      {editando && (
        <div style={{ background: T.paper, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green900, marginBottom: 8 }}>Ajuste de serviços e quantidades</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.keys(quant).length === 0 && <div style={{ fontSize: 12, color: T.inkSoft, fontStyle: "italic" }}>Nenhum serviço. Adicione abaixo o escopo do projeto.</div>}
            {Object.entries(quant).map(([id, v]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 6, padding: "6px 10px" }}>
                <span style={{ flex: 1, fontSize: 12.5 }}>{labelDe(id)}</span>
                <input type="number" min="0" step="0.1" style={{ ...inputStyle, width: 110, padding: "5px 8px", textAlign: "right" }} value={v} onChange={(e) => setQuant({ ...quant, [id]: e.target.value === "" ? 0 : +e.target.value })} />
                <span style={{ fontSize: 11, color: T.inkSoft, minWidth: 54 }}>{unidDe(id)}</span>
                <button onClick={() => { const nq = { ...quant }; delete nq[id]; setQuant(nq); }} title="Remover serviço" style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 15 }}>×</button>
              </div>
            ))}
          </div>
          {/* adicionar serviço que a IA não captou */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <select id={`addserv-${idgeo}`} style={{ ...inputStyle, flex: 1, padding: "6px 8px" }} defaultValue="">
              <option value="">+ Adicionar serviço ao escopo…</option>
              {ATIVIDADES.filter((a) => quant[a.id] == null).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <Btn small onClick={() => { const el = document.getElementById(`addserv-${idgeo}`); if (el && el.value) { setQuant({ ...quant, [el.value]: 0 }); el.value = ""; } }}>Adicionar</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 12.5 }}>Nº de equipes simultâneas:</span>
            <input type="number" min="1" step="1" style={{ ...inputStyle, width: 80, padding: "5px 8px" }} value={equipes} onChange={(e) => setEquipes(e.target.value)} />
            <div style={{ flex: 1 }} />
            <Btn small kind="primary" onClick={aplicarAjuste}>Recalcular opções</Btn>
          </div>
        </div>
      )}

      {/* simulação de janela de datas (tempo) */}
      {temQtd && (
        <div style={{ background: "#F0F4F8", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green900, marginBottom: 2 }}>🕐 Simular outra janela de datas</div>
            <div style={{ fontSize: 10.5, color: T.inkSoft }}>Padrão: janela do projeto ({tap.entradaCampo ? fmtData(tap.entradaCampo) : "—"} → {tap.entregaRelatorio ? fmtData(tap.entregaRelatorio) : "—"}). Informe datas para ver a disponibilidade dos recursos noutro período.</div>
          </div>
          <div style={{ flex: 1 }} />
          <div><div style={{ fontSize: 10, color: T.inkSoft }}>Início</div><input type="date" style={{ ...inputStyle, padding: "5px 8px", width: 150 }} value={simIni} onChange={(e) => setSimIni(e.target.value)} /></div>
          <div><div style={{ fontSize: 10, color: T.inkSoft }}>Fim</div><input type="date" style={{ ...inputStyle, padding: "5px 8px", width: 150 }} value={simFim} min={simIni} onChange={(e) => setSimFim(e.target.value)} /></div>
          <Btn small kind="primary" disabled={!simIni || !simFim} onClick={simularData}>Simular</Btn>
          {(simIni || simFim) && <Btn small onClick={() => { setSimIni(""); setSimFim(""); onRecalcular(pre.quantidades || quant, pre.equipes || 1, null); }}>Voltar ao padrão</Btn>}
        </div>
      )}

      {/* 4 opções de OS */}
      {pre.opcoes && pre.opcoes.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
          {pre.opcoes.map((op) => {
            const os = op.os || {};
            const sel = opSel === op.id;
            const checklist = os.alertas ? os.alertas.filter((a) => a.nivel === "alto").length : 0;
            return (
              <div key={op.id} onClick={() => setOpSel(op.id)} style={{
                border: `2px solid ${sel ? T.green700 : T.line}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                background: sel ? T.green100 : "#fff", transition: "all .15s",
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.green900 }}>{op.icone} {op.nome}</div>
                <div style={{ fontSize: 10.5, color: T.inkSoft, marginBottom: 8, minHeight: 28 }}>{op.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11.5 }}>
                  <div>📅 <b>{os.diasCampo || "—"}</b> dia(s){os.parcial ? " (parcial)" : ""}{os.janelaIni ? <span style={{ color: T.inkSoft }}> · {fmtData(os.janelaIni)}→{fmtData(os.janelaFim)}</span> : ""}</div>
                  <div>💰 {fmtMoeda(os.custoTotal)}</div>
                  <div>👥 {os.equipe ? os.equipe.filter((e) => !e.vazio).length : 0} pessoa(s){os.exigeRespTec ? " + resp. téc." : ""}</div>
                  <div>🚗 {os.veiculo ? (os.veiculo.veiculo || os.veiculo.placa || "definido") : "—"} {os.veiculo && os.veiculo.dispJanela ? <BadgeDisp disp={os.veiculo.dispJanela} /> : null}</div>
                  <div>⚙️ {os.maquina ? (os.maquina.cod || os.maquina.modelo || "definida") : "—"} {os.maquina && os.maquina.dispJanela ? <BadgeDisp disp={os.maquina.dispJanela} /> : null}</div>
                  <div>📏 {os.maxDistEquipe != null ? `${Math.round(os.maxDistEquipe)} km` : "—"}</div>
                  <div>{checklist > 0 ? <span style={{ color: T.red }}>⚠ {checklist} pendência(s)</span> : <span style={{ color: T.green700 }}>✓ sem pendências críticas</span>}</div>
                </div>
                {/* Tabela de contingência: equipe com status temporal, docs, distância */}
                {os.equipe && os.equipe.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                    <button onClick={(e) => { e.stopPropagation(); setExpandida(expandida === op.id ? null : op.id); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 10, fontWeight: 700, color: T.green700, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                      {expandida === op.id ? "▲ ocultar contingência" : "▼ tabela de contingência"}
                    </button>
                    {expandida === op.id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {/* EQUIPE */}
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: T.inkSoft, textTransform: "uppercase" }}>Equipe</div>
                        {os.equipe.map((p, pi) => (
                          <div key={pi} style={{ fontSize: 10.5, color: p.vazio ? T.red : T.ink, paddingBottom: 3, borderBottom: `1px solid ${T.paper}` }}>
                            {p.vazio
                              ? <span>⚠ {p.cargo || p.papel}: <i>sem ninguém apto</i></span>
                              : <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                                    <b>{p.nome}</b>
                                    <BadgeDisp disp={p.dispJanela} />
                                  </div>
                                  <div style={{ color: T.inkSoft }}>
                                    {p.cargo || p.papel}{p.apt != null ? ` · apt. ${["—","básico","pleno","avançado","especialista"][p.apt] || p.apt}` : ""}
                                    {p.dist != null ? ` · ${Math.round(p.dist)} km` : " · dist. —"}
                                  </div>
                                  {/* documentações (informativo) */}
                                  {p.pendencias && p.pendencias.length > 0
                                    ? <div style={{ color: T.amber, fontSize: 9.5 }}>📋 docs: {p.pendencias.join(", ")}</div>
                                    : <div style={{ color: T.green700, fontSize: 9.5 }}>📋 docs em dia</div>}
                                  {p.confirmarViagem && <div style={{ color: T.amber, fontSize: 9.5, fontWeight: 600 }}>⚠ confirmar viagem</div>}
                                  {p.posicaoVelha && <div style={{ color: T.amber, fontSize: 9.5, fontWeight: 600 }}>⚠ confirmar localização{p.diasPos != null ? ` (${p.diasPos}d)` : ""}</div>}
                                  {p.ncRecente > 0 && <div style={{ color: T.red, fontSize: 9.5, fontWeight: 600 }}>⚠ {p.ncRecente} NC recente(s)</div>}
                                </div>}
                          </div>
                        ))}
                        {/* RECURSOS */}
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: T.inkSoft, textTransform: "uppercase", marginTop: 4 }}>Recursos</div>
                        <div style={{ fontSize: 10.5 }}>🚗 {os.veiculo ? `${os.veiculo.veiculo || ""} (${os.veiculo.placa || "—"})` : "sem veículo"} {os.veiculo?.dispJanela && <BadgeDisp disp={os.veiculo.dispJanela} />}</div>
                        <div style={{ fontSize: 10.5 }}>⚙️ {os.maquina ? `${os.maquina.modelo || os.maquina.cod || ""}` : "sem máquina"} {os.maquina?.dispJanela && <BadgeDisp disp={os.maquina.dispJanela} />}</div>
                        {Array.isArray(os.equipamentos) && os.equipamentos.map((e) => (
                          <div key={e.cod} style={{ fontSize: 10.5 }}>🔬 {e.cod} <span style={{ color: T.inkSoft }}>{e.tipo || ""}</span> {e.dispJanela && <BadgeDisp disp={e.dispJanela} />} {e.calibVenceNaJanela && <span style={{ color: T.amber, fontWeight: 600 }}>⚠ calib. vence na janela</span>}</div>
                        ))}
                        {os.motorista && <div style={{ fontSize: 10.5 }}>🧑‍✈️ Motorista: {os.motorista.nome || os.motorista}</div>}
                      </div>
                    )}
                  </div>
                )}
                {sel && podeConfirmar && (() => {
                  const janelas = sugerirJanelas ? sugerirJanelas(os) : [];
                  return (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.green700}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.green900, textTransform: "uppercase", marginBottom: 6 }}>Escolha a janela de entrada em campo</div>
                      {janelas.length === 0 && <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 6 }}>Defina as quantidades para calcular a duração e sugerir janelas.</div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {janelas.map((j, ji) => {
                          const jsel = (janelaSel[op.id] || 0) === ji;
                          const corJ = j.bloqueados > 0 ? T.red : j.parciais > 0 ? T.amber : T.green700;
                          return (
                            <button key={ji} onClick={(e) => { e.stopPropagation(); setJanelaSel({ ...janelaSel, [op.id]: ji }); }} style={{
                              border: `1.5px solid ${jsel ? T.green700 : T.line}`, background: jsel ? T.green100 : "#fff", borderRadius: 8, padding: "7px 10px", cursor: "pointer", textAlign: "left",
                            }}>
                              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{ji === 0 ? "🥇 " : ji === 1 ? "🥈 " : "🥉 "}{fmtData(j.ini)} → {fmtData(j.fim)} <span style={{ color: T.inkSoft, fontWeight: 400 }}>({j.dur} dia/s)</span></div>
                              <div style={{ fontSize: 10, color: corJ }}>{j.livres}/{j.totalRec} recursos livres{j.parciais > 0 ? ` · ${j.parciais} parcial(is)` : ""}{j.bloqueados > 0 ? ` · ${j.bloqueados} bloqueado(s)` : ""}</div>
                            </button>
                          );
                        })}
                      </div>
                      <Btn small kind="primary" onClick={(e) => { e.stopPropagation(); const ji = janelaSel[op.id] || 0; onConfirmar(op.id, janelas[ji]); }} style={{ marginTop: 8, width: "100%" }}>✓ Confirmar e reservar recursos</Btn>
                      <div style={{ fontSize: 9.5, color: T.inkSoft, marginTop: 4 }}>Ao confirmar, os recursos ganham reserva automática (trava parcial) no período.</div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic" }}>Informe as quantidades para gerar as opções de OS.</div>
      )}
      {!podeConfirmar && pre.opcoes && pre.opcoes.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: T.inkSoft }}>Apenas o Gerente de Carteira (ou diretoria) pode confirmar a opção.</div>
      )}
    </div>
  );
}

/* ---------- Apontamento diário de campo (RDO) ---------- */
/* ===== PAINEL DE KPIs DO PROJETO EM CAMPO =====
   Abre ao clicar num projeto em campo. Mostra, dia a dia do RDO:
   o custo real decomposto e a produtividade realizada × esperada,
   com alerta quando a produtividade fica abaixo e estimativa de atraso. */
function PainelKPIsProjeto({ idgeo, os, apts, custos, colaboradores, produtividade, tap, onClose }) {
  const an = analisarDiasRDO(os, apts, custos, colaboradores, produtividade);
  const fmtD = (d) => { try { const x = new Date(d + "T00:00:00"); return x.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); } catch { return d; } };
  return (
    <Modal title={`📊 KPIs — ${tap?.projeto || idgeo}`} onClose={onClose} wide>
      {!an.temDados ? (
        <div style={{ padding: "30px 16px", textAlign: "center", color: T.inkSoft, fontSize: 13.5 }}>
          Este projeto ainda não tem apontamentos diários (RDO). Os KPIs aparecem conforme o Coordenador lança a produtividade em campo.
        </div>
      ) : (
        <>
          {/* resumo de topo */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: "1 1 150px", background: T.green100, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10.5, color: T.green700, fontWeight: 700, textTransform: "uppercase" }}>Custo real acumulado</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.green900 }}>{fmtBRL(an.custoTotalReal)}</div>
              {an.custoOrcado > 0 && <div style={{ fontSize: 11, color: T.inkSoft }}>de {fmtBRL(an.custoOrcado)} orçado ({Math.round(an.custoTotalReal / an.custoOrcado * 100)}%)</div>}
            </div>
            <div style={{ flex: "1 1 150px", background: T.blueBg, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10.5, color: T.blue, fontWeight: 700, textTransform: "uppercase" }}>Custo HH médio</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.green900 }}>{fmtBRL(an.hhHora)}/h</div>
              <div style={{ fontSize: 11, color: T.inkSoft }}>por pessoa (mensal ÷ 22 ÷ 8h)</div>
            </div>
            <div style={{ flex: "1 1 150px", background: an.diasAtrasoEstimado > 0 ? T.redBg : T.green100, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10.5, color: an.diasAtrasoEstimado > 0 ? T.red : T.green700, fontWeight: 700, textTransform: "uppercase" }}>Atraso estimado</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: an.diasAtrasoEstimado > 0 ? T.red : T.green900 }}>{an.diasAtrasoEstimado > 0 ? `${an.diasAtrasoEstimado} dia(s)` : "No ritmo"}</div>
              <div style={{ fontSize: 11, color: T.inkSoft }}>{an.diasAbaixo} dia(s) abaixo do esperado</div>
            </div>
          </div>

          {/* dia a dia */}
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900, marginBottom: 8 }}>Análise diária (RDO)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {an.dias.map((d, i) => (
              <div key={i} style={{ border: `1px solid ${d.abaixo ? T.red : T.line}`, borderRadius: 10, padding: "12px 14px", background: d.abaixo ? T.redBg : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: T.green900, fontSize: 13 }}>
                    {fmtD(d.data)} · {d.categoria === "transito" ? "🚚 Trânsito/mobilização" : "🔧 Campo"}
                    {d.naoConforme && <span style={{ marginLeft: 8, fontSize: 10.5, color: T.red, fontWeight: 700 }}>⚠ NC</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.green900 }}>{fmtBRL(d.custoTotal)}</div>
                </div>
                {/* decomposição do custo */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: d.ativs.length ? 8 : 0 }}>
                  {d.decomposicao.map((c, j) => (
                    <span key={j} style={{ fontSize: 10.5, color: T.inkSoft, background: T.paper, borderRadius: 6, padding: "3px 8px" }}>{c.label}: <b style={{ color: T.ink }}>{fmtBRL(c.valor)}</b></span>
                  ))}
                </div>
                {/* produtividade do dia */}
                {d.ativs.length > 0 && (
                  <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 8 }}>
                    {d.ativs.map((a, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, marginBottom: 3 }}>
                        <span style={{ minWidth: 110, color: T.ink }}>{a.label}</span>
                        <span style={{ color: T.inkSoft }}>{a.realizado}{a.esperado > 0 ? ` / ${a.esperado} esperado` : ""}</span>
                        {a.pct != null && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: a.pct >= 80 ? T.green700 : T.red, background: a.pct >= 80 ? T.green100 : T.redBg, borderRadius: 99, padding: "1px 7px" }}>{a.pct}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* alerta de desvio */}
                {d.abaixo && (
                  <div style={{ marginTop: 8, background: "#fff", border: `1px solid ${T.red}`, borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: T.red, fontWeight: 600 }}>
                    ⚠ Abaixo da produtividade esperada ({d.prodPct}%) — atraso possível no projeto.
                  </div>
                )}
                {d.naoConforme && d.descNC && (
                  <div style={{ marginTop: 6, fontSize: 11, color: T.inkSoft }}>NC: {d.descNC}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: T.inkSoft, lineHeight: 1.5 }}>
            Custos calculados a partir dos parâmetros da aba Eficiência (R$/km, depreciações, diárias) e do custo de cada colaborador. Produtividade esperada conforme metas cadastradas (un/dia por pessoa). O atraso estimado projeta o déficit acumulado de produção no ritmo esperado.
          </div>
        </>
      )}
    </Modal>
  );
}
function ApontamentoForm({ idgeo, os, inicial, dataMin, onSave, onClose }) {
  const ativs = (os?.atividades || []).filter((a) => a.id);
  const [dataAp, setDataAp] = useState(inicial?.data || hojeISO());
  const [km, setKm] = useState(inicial?.km != null ? String(inicial.km) : "");
  const [horas, setHoras] = useState(inicial?.horasTecnico != null ? String(inicial.horasTecnico) : "");
  const [itens, setItens] = useState(inicial?.itens || {});
  const [obs, setObs] = useState(inicial?.obs || "");
  const [statusDia, setStatusDia] = useState(inicial?.statusDia || "normal");
  const [naoConforme, setNaoConforme] = useState(!!inicial?.naoConforme);
  const [descNC, setDescNC] = useState(inicial?.descNC || "");
  const setItem = (id, v) => setItens((cur) => ({ ...cur, [id]: v }));
  const unidadeDe = (id) => { const a = ATIVIDADES.find((x) => x.id === id) || {}; return (UNID_PROD[id] || a.unidProd || "unid").replace("/dia", ""); };
  const labelDe = (id) => (ATIVIDADES.find((x) => x.id === id) || {}).label || id;
  const salvar = () => {
    const itensNum = {};
    Object.entries(itens).forEach(([k, v]) => { if (v !== "" && v != null) itensNum[k] = +v; });
    onSave({ data: dataAp, km: km === "" ? 0 : +km, horasTecnico: horas === "" ? 0 : +horas, itens: itensNum, obs: obs.trim(), statusDia, naoConforme, descNC: naoConforme ? descNC.trim() : "" });
  };
  const STATUS_DIA = [
    { id: "normal", label: "✅ Normal — trabalho fluiu", cor: T.green700 },
    { id: "parcial", label: "🟡 Parcial — produção abaixo do previsto", cor: T.amber },
    { id: "parado", label: "🔴 Parado — sem produção (clima, acidente, espera)", cor: T.red },
  ];
  return (
    <Modal title={`Apontamento diário — ${idgeo}`} onClose={onClose} wide>
      <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 0 }}>
        Lançamento da produtividade real do dia. Os campos de serviço vêm da Ordem de Serviço deste projeto. O deslocamento (km) e as horas do técnico aplicam-se a qualquer dia em campo.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Data" req>
          <input type="date" style={inputStyle} value={dataAp} min={dataMin || undefined} onChange={(e) => setDataAp(e.target.value)} />
        </Field>
        <Field label="Deslocamento (km no dia)">
          <input type="number" min="0" step="1" style={inputStyle} value={km} onChange={(e) => setKm(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Horas do técnico no dia">
          <input type="number" min="0" step="0.5" style={inputStyle} value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="0" />
        </Field>
      </div>

      <Field label="Como foi o dia?">
        <select style={inputStyle} value={statusDia} onChange={(e) => setStatusDia(e.target.value)}>
          {STATUS_DIA.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>

      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, marginTop: 10, marginBottom: 6 }}>Produtividade por serviço (realizado no dia)</div>
      {ativs.length === 0 ? (
        <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic" }}>A OS deste projeto não tem serviços definidos. Lance ao menos o deslocamento e as horas.</div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden" }}>
          {ativs.map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i % 2 ? "#FAFBF8" : "#fff", borderBottom: i < ativs.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>{labelDe(a.id)}</span>
              <input type="number" min="0" step="0.1" style={{ ...inputStyle, width: 110, padding: "6px 8px", textAlign: "right" }} value={itens[a.id] != null ? itens[a.id] : ""} onChange={(e) => setItem(a.id, e.target.value)} placeholder="0" />
              <span style={{ fontSize: 11.5, color: T.inkSoft, minWidth: 70 }}>{unidadeDe(a.id)}/dia</span>
            </div>
          ))}
        </div>
      )}

      {/* não conformidade */}
      <div style={{ marginTop: 12, padding: "10px 14px", background: naoConforme ? T.redBg : T.paper, borderRadius: 8, border: `1px solid ${naoConforme ? T.red : T.line}` }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: naoConforme ? T.red : T.ink, cursor: "pointer" }}>
          <input type="checkbox" checked={naoConforme} onChange={(e) => setNaoConforme(e.target.checked)} style={{ width: 16, height: 16 }} />
          ⚠ Houve não conformidade neste dia (desvio de procedimento, incidente, retrabalho)
        </label>
        {naoConforme && (
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical", marginTop: 8 }} value={descNC} onChange={(e) => setDescNC(e.target.value)} placeholder="Descreva a não conformidade: o que ocorreu, impacto, ação tomada" />
        )}
      </div>

      <Field label="Observações do dia" >
        <textarea rows={2} style={{ ...inputStyle, resize: "vertical", marginTop: 8 }} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Intercorrências, clima, paradas, etc." />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>Salvar apontamento</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Solicitação de autorização operacional (mobile) ---------- */
function AutorizacaoForm({ colaboradores, taps, user, onSave, onClose }) {
  const [tipo, setTipo] = useState("hora_extra");
  const [mat, setMat] = useState(user?.mat || "");
  const [idgeo, setIdgeo] = useState("");
  const [dataS, setDataS] = useState(hojeISO());
  const [valor, setValor] = useState("");
  const [justif, setJustif] = useState("");
  const ti = TIPOS_AUTORIZACAO.find((t) => t.id === tipo) || {};
  const ativos = (taps || []).filter((t) => !["Concluído", "Cancelado"].includes(t.statusTap));
  const colab = (colaboradores || []).find((c) => c.mat === mat);
  const salvar = () => {
    if (!justif.trim()) { return; }
    onSave({ tipo, mat, nome: colab?.nome || user?.aba || "", idgeo, data: dataS, valor: ti.temValor ? valor : "", justificativa: justif });
  };
  return (
    <Modal title="Nova solicitação de autorização" onClose={onClose}>
      <Field label="Tipo de autorização" req>
        <select style={inputStyle} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_AUTORIZACAO.map((t) => <option key={t.id} value={t.id}>{t.icone} {t.label}</option>)}
        </select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Colaborador">
          <select style={inputStyle} value={mat} onChange={(e) => setMat(e.target.value)}>
            <option value="">— eu mesmo —</option>
            {(colaboradores || []).filter((c) => c.status !== "Desligado").map((c) => <option key={c.mat} value={c.mat}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Projeto / contrato">
          <select style={inputStyle} value={idgeo} onChange={(e) => setIdgeo(e.target.value)}>
            <option value="">— selecione —</option>
            {ativos.map((t) => <option key={t.idgeo} value={t.idgeo}>{t.idgeo} · {t.projeto}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: ti.temValor ? "1fr 1fr" : "1fr", gap: 12 }}>
        {ti.temData && <Field label="Data"><input type="date" style={inputStyle} value={dataS} onChange={(e) => setDataS(e.target.value)} /></Field>}
        {ti.temValor && <Field label={`Valor estimado (${ti.unidadeValor || ""})`}><input type="number" min="0" step="0.01" style={inputStyle} value={valor} onChange={(e) => setValor(e.target.value)} placeholder={ti.unidadeValor === "R$" ? "0,00" : "0"} /></Field>}
      </div>
      <Field label="Justificativa" req>
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={justif} onChange={(e) => setJustif(e.target.value)} placeholder="Explique a necessidade — o gestor do contrato verá isto ao decidir." />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" disabled={!justif.trim()} onClick={salvar}>Enviar solicitação</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Novo serviço / aptidão (amplia a lista canônica) ---------- */
function ServicoForm({ existentes, onSave, onClose }) {
  const [label, setLabel] = useState("");
  const [short, setShort] = useState("");
  const [unidProd, setUnidProd] = useState("unid/dia");
  const [erro, setErro] = useState("");
  const salvar = () => {
    if (!label.trim()) { setErro("O nome completo do serviço é obrigatório."); return; }
    if ((existentes || []).some((a) => norm(a.label) === norm(label))) { setErro("Já existe um serviço com esse nome."); return; }
    onSave({ label: label.trim(), short: short.trim(), unidProd: unidProd.trim() || "unid/dia" });
  };
  return (
    <Modal title="Novo serviço / aptidão" onClose={onClose}>
      <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 0 }}>
        O novo serviço entra na lista canônica e passa a aparecer automaticamente na <b>Matriz de Aptidões</b>, nas <b>Metas de Produtividade</b>, na tabela de <b>Preços Unitários</b> e no <b>Motor de Alocação</b>.
      </p>
      {erro && <div style={{ background: T.redBg, color: T.red, borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{erro}</div>}
      <Field label="Nome completo do serviço" req>
        <input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex.: Amostragem de gás de solo (soil gas)" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
        <Field label="Abreviação (opcional)">
          <input style={inputStyle} value={short} onChange={(e) => setShort(e.target.value)} placeholder="ex.: Soil gas" />
        </Field>
        <Field label="Unidade de produtividade">
          <input style={inputStyle} value={unidProd} onChange={(e) => setUnidProd(e.target.value)} placeholder="ex.: pontos/dia, m/dia, amostras/dia" />
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" onClick={salvar}>Adicionar serviço</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Novo serviço / aptidão (amplia a lista canônica) — fim ---------- */
/* ---------- Plano de Trabalho: anexo + leitura por IA (equipe, materiais, prazos) ---------- */
/* Categorias de documentos do dossiê contratual do Plano de Trabalho (limitadas aos 3 essenciais) */
const CATEGORIAS_PLANO = [
  { id: "plano", label: "Plano de execução / trabalho", icone: "📋" },
  { id: "proposta", label: "Proposta técnica", icone: "📑" },
  { id: "precos", label: "Demonstrativo de formação de preços", icone: "💲" },
];
function PlanoTrabalhoForm({ tap, inicial, onSave, onClose }) {
  const [f, setF] = useState(inicial && inicial.anexos
    ? inicial
    : inicial && inicial.anexo /* migra plano antigo de anexo único */
      ? { ...inicial, anexos: [{ ...inicial.anexo, categoria: "plano" }], anexo: undefined }
      : { id: "pt_" + Date.now().toString(36), nome: "", anexos: [], analiseIA: null, criadoEm: hojeISO() });
  const [analisando, setAnalisando] = useState(false);
  const [catSel, setCatSel] = useState("plano");
  const fileRef = useRef(null);

  const [avisoAnexo, setAvisoAnexo] = useState("");
  const LIMITE_ARQUIVO = 7 * 1024 * 1024; // 7 MB por arquivo
  /* detecta PDF assinado eletronicamente / criptografado pela presença de marcadores no conteúdo */
  const pdfAssinadoOuCripto = (dataURL) => {
    try {
      const b64 = (dataURL || "").split(",")[1] || "";
      const bin = atob(b64.slice(0, 8000)); // examina o início do arquivo
      return /\/Encrypt|\/Sig\b|\/ByteRange|adbe\.pkcs7|ETSI\.CAdES|DocMDP/i.test(bin);
    } catch { return false; }
  };
  const aoAnexar = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const avisos = [];
    files.forEach((file) => {
      if (file.size > LIMITE_ARQUIVO) {
        avisos.push(`"${file.name}" tem ${(file.size / 1024 / 1024).toFixed(1)} MB e excede o limite de 7 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        /* bloqueia PDFs assinados/criptografados, que a IA não consegue ler */
        if (/pdf/i.test(file.type) && pdfAssinadoOuCripto(reader.result)) {
          setAvisoAnexo(`"${file.name}" parece estar assinado eletronicamente ou criptografado. Anexe a versão sem assinatura digital.`);
          return;
        }
        setF((c) => ({
          ...c,
          nome: c.nome && c.nome.trim() ? c.nome : file.name.replace(/\.[^.]+$/, ""),
          anexos: [...(c.anexos || []), { id: "ax_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), categoria: catSel, nome: file.name, tipo: file.type, tamanho: file.size, dataURL: reader.result, anexadoEm: hojeISO() }],
          analiseIA: null,
        }));
      };
      reader.readAsDataURL(file);
    });
    setAvisoAnexo(avisos.join(" "));
    if (fileRef.current) fileRef.current.value = "";
  };
  const removerAnexo = (id) => setF((c) => ({ ...c, anexos: (c.anexos || []).filter((a) => a.id !== id), analiseIA: null }));

  const analisarComIA = async () => {
    const anexos = f.anexos || [];
    if (!anexos.length) return;
    const chk = checarTamanhoAnexos(anexos);
    if (chk.excede) { setF((c) => ({ ...c, analiseIA: { erro: chk.msg } })); return; }
    setAnalisando(true);
    try {
      const prompt = "Você é planejador sênior de operações de campo em engenharia ambiental. Recebeu o DOSSIÊ CONTRATUAL de um projeto (plano de trabalho, proposta técnica, demonstrativo de formação de preços e outros anexos). Leia tudo em conjunto e extraia, em JSON, os campos: equipeTecnica (lista de funções/qualificações necessárias), materiais (lista), equipamentos (lista), atividades (lista de {servico, quantidade, unidade}), prazos (texto), precos (lista de {item, unidade, valorUnitario} extraídos do demonstrativo de formação de preços), margemAlvo (texto/número se houver), riscos (lista), recomendacaoAlocacao (texto: como combinar serviços, equipes e logística para o melhor resultado de custo e faturamento), e observacoes. Responda SOMENTE com o JSON.";
      const content = [];
      anexos.forEach((ax) => {
        const base64 = (ax.dataURL || "").split(",")[1];
        const ehPDF = (ax.tipo || "").includes("pdf");
        const catLabel = (CATEGORIAS_PLANO.find((c) => c.id === ax.categoria) || {}).label || "Anexo";
        content.push({ type: "text", text: `--- ${catLabel}: ${ax.nome} ---` });
        if (ehPDF && base64) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
      });
      content.push({ type: "text", text: prompt });
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content }] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.detalhe || data.error);
      const txt = (data.content || []).map((b) => b.text || "").join("\n").replace(/```json|```/g, "").trim();
      let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { observacoes: txt }; }
      setF((c) => ({ ...c, analiseIA: { ...parsed, analisadoEm: hojeISO(), nDocs: anexos.length } }));
    } catch {
      const msg = (err && err.message) ? String(err.message) : "";
      const offline = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Unexpected token");
      setF((c) => ({ ...c, analiseIA: { erro: offline ? "A leitura por IA roda no sistema publicado (com a API conectada). Os anexos já estão salvos e serão lidos no deploy." : ("Erro na análise: " + msg), analisadoEm: hojeISO() } }));
    } finally {
      setAnalisando(false);
    }
  };

  const anexos = f.anexos || [];
  const ia = f.analiseIA;

  return (
    <Modal title={`Plano de Trabalho — ${tap.idgeo} · ${tap.projeto || ""}`} onClose={onClose} wide>
      <Field label="Nome / identificação do plano" req>
        <input style={{ ...inputStyle, borderColor: !f.nome.trim() ? T.amber : inputStyle.borderColor }} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="ex.: Plano de Trabalho — Fase 1 (sondagem)" />
      </Field>

      <div style={{ marginTop: 14, padding: "14px 16px", background: T.blueBg, borderRadius: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.blue, marginBottom: 4 }}>📎 Dossiê contratual (para a IA conhecer o contrato a fundo)</div>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>Anexe quantos documentos forem necessários — plano de trabalho, proposta técnica, demonstrativo de formação de preços, contrato e outros. Quanto mais completo o dossiê, melhor a IA combina serviços, equipe, logística, menor custo e faturamento mais rápido.</div>

        {/* seletor de categoria + botão anexar */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <select style={{ ...inputStyle, width: "auto", padding: "6px 10px" }} value={catSel} onChange={(e) => setCatSel(e.target.value)}>
            {CATEGORIAS_PLANO.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.label}</option>)}
          </select>
          <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.xls,image/*" onChange={aoAnexar} style={{ display: "none" }} />
          <Btn small onClick={() => fileRef.current && fileRef.current.click()}>📎 Anexar documento(s)</Btn>
        </div>
        <div style={{ fontSize: 10.5, color: T.inkSoft, marginBottom: 10, lineHeight: 1.5 }}>
          Anexe arquivos de até <b>7 MB por arquivo</b>. Não anexe documentos assinados eletronicamente (criptografados) — eles não podem ser lidos pela IA.
        </div>
        {avisoAnexo && (
          <div style={{ background: T.redBg, color: T.red, fontSize: 11.5, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>⚠ {avisoAnexo}</div>
        )}

        {/* lista de anexos agrupados por categoria */}
        {anexos.length === 0 ? (
          <div style={{ fontSize: 12, color: T.inkSoft, fontStyle: "italic" }}>Nenhum documento anexado ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {anexos.map((ax) => {
              const cat = CATEGORIAS_PLANO.find((c) => c.id === ax.categoria) || CATEGORIAS_PLANO[0];
              return (
                <div key={ax.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 6, padding: "7px 12px" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.blue, background: T.blueBg, borderRadius: 99, padding: "2px 8px" }}>{cat.icone} {cat.label}</span>
                  <span style={{ fontSize: 12.5 }}>{ax.nome}</span>
                  <span style={{ fontSize: 10.5, color: T.inkSoft }}>{(ax.tamanho / 1024).toFixed(0)} KB</span>
                  <div style={{ flex: 1 }} />
                  <Btn small kind="danger" onClick={() => removerAnexo(ax.id)}>Remover</Btn>
                </div>
              );
            })}
          </div>
        )}

        {anexos.length > 0 && (() => {
          const chk = checarTamanhoAnexos(anexos);
          return (
            <div style={{ marginTop: 12 }}>
              <Btn kind="primary" small disabled={analisando || chk.excede} onClick={analisarComIA}>{analisando ? "Analisando dossiê…" : `🤖 Analisar dossiê com IA (${anexos.length} doc)`}</Btn>
              <span style={{ marginLeft: 10, fontSize: 11.5, color: chk.excede ? T.red : T.inkSoft }}>
                {fmtBytes(chk.bytes)}{chk.excede ? ` · acima do limite de ${fmtBytes(LIMITE_ANEXOS_IA)}` : ""}
              </span>
              {chk.excede && <div style={{ fontSize: 11.5, color: T.red, marginTop: 4 }}>{chk.msg}</div>}
            </div>
          );
        })()}

        {ia && (
          <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px", fontSize: 12.5 }}>
            {ia.erro ? <div style={{ color: T.amber }}>⏳ {ia.erro}</div> : (
              <>
                <div style={{ fontWeight: 700, color: T.green900, marginBottom: 6 }}>🤖 Análise do dossiê {ia.nDocs ? `(${ia.nDocs} documento[s])` : ""}</div>
                {Array.isArray(ia.equipeTecnica) && ia.equipeTecnica.length > 0 && <div style={{ marginTop: 4 }}><b>👷 Equipe:</b> {ia.equipeTecnica.join(" · ")}</div>}
                {Array.isArray(ia.materiais) && ia.materiais.length > 0 && <div style={{ marginTop: 4 }}><b>📦 Materiais:</b> {ia.materiais.join(" · ")}</div>}
                {Array.isArray(ia.equipamentos) && ia.equipamentos.length > 0 && <div style={{ marginTop: 4 }}><b>🔬 Equipamentos:</b> {ia.equipamentos.join(" · ")}</div>}
                {Array.isArray(ia.atividades) && ia.atividades.length > 0 && <div style={{ marginTop: 4 }}><b>🛠 Atividades:</b> {ia.atividades.map((a) => typeof a === "string" ? a : `${a.servico || ""} ${a.quantidade || ""}${a.unidade || ""}`).join(" · ")}</div>}
                {Array.isArray(ia.precos) && ia.precos.length > 0 && <div style={{ marginTop: 4 }}><b>💲 Preços:</b> {ia.precos.map((p) => typeof p === "string" ? p : `${p.item || ""} ${p.valorUnitario || ""}/${p.unidade || ""}`).join(" · ")}</div>}
                {ia.margemAlvo && <div style={{ marginTop: 4 }}><b>📊 Margem alvo:</b> {typeof ia.margemAlvo === "string" ? ia.margemAlvo : JSON.stringify(ia.margemAlvo)}</div>}
                {ia.prazos && <div style={{ marginTop: 4 }}><b>📅 Prazos:</b> {typeof ia.prazos === "string" ? ia.prazos : JSON.stringify(ia.prazos)}</div>}
                {Array.isArray(ia.riscos) && ia.riscos.length > 0 && <div style={{ marginTop: 4 }}><b>⚠ Riscos:</b> {ia.riscos.join(" · ")}</div>}
                {ia.recomendacaoAlocacao && <div style={{ marginTop: 6, padding: "8px 10px", background: T.green100, borderRadius: 6 }}><b>🎯 Recomendação de alocação:</b> {ia.recomendacaoAlocacao}</div>}
                {ia.observacoes && <p style={{ margin: "6px 0 0", color: T.inkSoft }}>{ia.observacoes}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {(!f.nome.trim() || anexos.length === 0) && (
          <span style={{ fontSize: 12, color: T.amber }}>
            ⚠ {!f.nome.trim() ? "Informe o nome do plano" : "Anexe ao menos um documento"} para salvar
          </span>
        )}
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" disabled={!f.nome.trim() || anexos.length === 0} onClick={() => onSave(f)}>Salvar plano</Btn>
      </div>
    </Modal>
  );
}

/* ---------- TAPs do Holmes: importação por colagem OU upload de Excel ---------- */
/* ---------- Barra visual de linha do tempo das alocações FUTURAS de um recurso ---------- */
function TimelineRecurso({ travas, motivosPessoa, ehPessoa, idgeosSistema }) {
  const hoje = hojeISO();
  /* só alocações futuras ou em curso (fim >= hoje) e que não sejam "livre" */
  const futuras = (travas || [])
    .filter((t) => t.fim >= hoje && t.nivel !== "livre")
    .sort((a, b) => (a.ini < b.ini ? -1 : a.ini > b.ini ? 1 : 0));
  if (futuras.length === 0) {
    return <div style={{ fontSize: 11.5, color: T.green700, background: T.green100, borderRadius: 6, padding: "8px 12px", marginBottom: 10 }}>🟢 Sem alocações futuras — recurso livre de hoje em diante.</div>;
  }
  /* janela da timeline: de hoje até o fim mais distante (mínimo 60 dias para dar escala) */
  const fimMax = futuras.reduce((mx, t) => (t.fim > mx ? t.fim : mx), hoje);
  const d0 = new Date(hoje + "T00:00:00");
  const d1 = new Date(fimMax + "T00:00:00");
  let totalDias = Math.max(60, Math.round((d1 - d0) / 86400000) + 7);
  const pct = (iso) => {
    const d = new Date(iso + "T00:00:00");
    const dias = Math.round((d - d0) / 86400000);
    return Math.max(0, Math.min(100, (dias / totalDias) * 100));
  };
  /* marcas de mês para a régua */
  const meses = [];
  const cursor = new Date(d0.getFullYear(), d0.getMonth(), 1);
  while (cursor <= d1) {
    meses.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const MES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const rotuloMotivo = (t) => {
    if (ehPessoa && t.motivo) return (motivosPessoa.find((m) => m.id === t.motivo) || {}).label || t.motivo;
    if (t.obs) return t.obs;
    return t.auto ? "Reserva automática" : "Bloqueio";
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.green900, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>📆 Linha do tempo — próximas alocações</div>
      {/* régua de meses */}
      <div style={{ position: "relative", height: 16, marginBottom: 2 }}>
        {meses.map((m, i) => {
          const iso = m.toISOString().slice(0, 10);
          const left = pct(iso);
          if (left >= 100) return null;
          return <div key={i} style={{ position: "absolute", left: `${left}%`, fontSize: 9.5, color: T.inkSoft, borderLeft: `1px solid ${T.line}`, paddingLeft: 3, height: 14 }}>{MES_ABREV[m.getMonth()]}/{String(m.getFullYear()).slice(2)}</div>;
        })}
      </div>
      {/* trilho + blocos */}
      <div style={{ position: "relative", background: T.paper, borderRadius: 6, minHeight: futuras.length * 26 + 8, padding: "4px 0" }}>
        {/* marca "hoje" */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderLeft: `2px solid ${T.green700}`, zIndex: 2 }} title="hoje" />
        {futuras.map((t, i) => {
          const ni = TRAVA_INFO(t.nivel);
          const left = pct(t.ini);
          const width = Math.max(2, pct(t.fim) - left);
          const noSistema = (idgeosSistema || []).includes(t.idgeo);
          return (
            <div key={t.id || i} style={{ position: "relative", height: 24, margin: "1px 0" }}>
              <div title={`${fmtData(t.ini)} → ${fmtData(t.fim)} · ${rotuloMotivo(t)}`} style={{
                position: "absolute", left: `${left}%`, width: `${width}%`, top: 2, height: 20,
                background: ni.cor, opacity: t.nivel === "parcial" ? 0.7 : 0.9, borderRadius: 4,
                display: "flex", alignItems: "center", paddingLeft: 6, overflow: "hidden",
                boxShadow: t.auto ? `inset 0 0 0 1.5px ${T.green900}` : "none",
              }}>
                <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t.auto && t.idgeo ? `🔗 ${t.idgeo}` : (ehPessoa && t.motivo ? rotuloMotivo(t) : (t.idgeo || rotuloMotivo(t)))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9.5, color: T.inkSoft, marginTop: 4 }}>
        Borda destacada = reserva automática do sistema (OS aprovada). Início "hoje" na linha verde à esquerda.
      </div>
    </div>
  );
}

/* ---------- Grade de cronograma consolidada (Gantt: recursos × tempo), inspirada no cronograma operacional ---------- */
function CronogramaGrade({ colaboradores, maquinas, frota, equipamentos, travas, taps, ordens }) {
  const [escala, setEscala] = useState("semana"); // "semana" | "dia"
  const [semanas, setSemanas] = useState(12); // horizonte
  const [fCliente, setFCliente] = useState("");
  const [fIdgeo, setFIdgeo] = useState("");
  const [fColab, setFColab] = useState("");
  const [fAtividade, setFAtividade] = useState("");
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const idgeosSistema = (taps || []).map((t) => t.idgeo);
  /* índice IDGEO -> { cliente, atividade } a partir da TAP e da OS ligadas */
  const infoIdgeo = (idgeo) => {
    const t = (taps || []).find((x) => x.idgeo === idgeo);
    const os = (ordens || {})[idgeo];
    let atividade = "";
    if (os && Array.isArray(os.atividades) && os.atividades.length) atividade = os.atividades.map((a) => a.label || a.id).filter(Boolean).join(", ");
    else if (t && Array.isArray(t.tipoServico) && t.tipoServico.length) atividade = t.tipoServico.join(", ");
    return { cliente: t ? (t.cliente || "") : "", projeto: t ? (t.projeto || "") : "", atividade };
  };
  const projDe = (idgeo) => { const i = infoIdgeo(idgeo); return i.cliente || i.projeto || idgeo; };

  /* monta as colunas (períodos) */
  const cols = [];
  if (escala === "semana") {
    const d0 = new Date(hoje); const dow = (d0.getDay() + 6) % 7; d0.setDate(d0.getDate() - dow); // segunda da semana atual
    for (let i = 0; i < semanas; i++) { const ini = new Date(d0); ini.setDate(ini.getDate() + i * 7); const fim = new Date(ini); fim.setDate(fim.getDate() + 6); cols.push({ ini, fim }); }
  } else {
    const dias = semanas * 7 > 56 ? 56 : semanas * 7; // limite diário
    for (let i = 0; i < dias; i++) { const ini = new Date(hoje); ini.setDate(ini.getDate() + i); const fim = new Date(ini); cols.push({ ini, fim }); }
  }
  const iso = (d) => d.toISOString().slice(0, 10);
  const fimGrade = iso(cols[cols.length - 1].fim);
  const iniGrade = iso(cols[0].ini);

  /* para um recurso, retorna a trava que cobre uma coluna (a mais restritiva) */
  const travaNaCol = (lista, col) => {
    const ci = iso(col.ini), cf = iso(col.fim);
    const sobre = (lista || []).filter((t) => t.ini <= cf && ci <= t.fim);
    if (!sobre.length) return null;
    return sobre.sort((a, b) => (a.nivel === "total" ? -1 : 1) - (b.nivel === "total" ? -1 : 1))[0];
  };

  /* uma trava do recurso intersecta a janela da grade? */
  const temAlocacaoNaGrade = (lista) => (lista || []).some((t) => t.ini <= fimGrade && iniGrade <= t.fim && t.nivel !== "livre");
  /* a trava casa com os filtros ativos? */
  const passaFiltros = (lista) => {
    if (!fCliente && !fIdgeo && !fAtividade) return true;
    return (lista || []).some((t) => {
      if (t.nivel === "livre" || t.fim < iniGrade || t.ini > fimGrade) return false;
      const info = t.idgeo ? infoIdgeo(t.idgeo) : { cliente: "", atividade: "" };
      if (fCliente && info.cliente !== fCliente) return false;
      if (fIdgeo && t.idgeo !== fIdgeo) return false;
      if (fAtividade && !(info.atividade || "").toLowerCase().includes(fAtividade.toLowerCase())) return false;
      return true;
    });
  };
  const filtrarItens = (tipo, itens, nomeKey) => itens.filter((it) => {
    const lista = ((travas || {})[tipo] || {})[it.id] || [];
    if (!temAlocacaoNaGrade(lista)) return false; // só alocados
    if (tipo === "pessoa" && fColab && it.id !== fColab) return false;
    return passaFiltros(lista);
  });

  const grupos = [
    { tipo: "pessoa", label: "👷 Equipe", cor: "#C0392B", itens: filtrarItens("pessoa", (colaboradores || []).map((c) => ({ id: c.mat, nome: c.nome }))) },
    { tipo: "maquina", label: "⚙️ Máquinas", cor: "#8E44AD", itens: filtrarItens("maquina", (maquinas || []).map((m) => ({ id: m.cod, nome: `${m.marca} ${m.modelo}` }))) },
    { tipo: "frota", label: "🚗 Frota", cor: "#2980B9", itens: filtrarItens("frota", (frota || []).map((v) => ({ id: v.placa, nome: `${v.veiculo} (${v.placa})` }))) },
    { tipo: "equipamento", label: "🔬 Equipamentos", cor: "#16A085", itens: filtrarItens("equipamento", (equipamentos || []).map((e) => ({ id: e.cod, nome: `${e.tipo} ${e.modelo}` }))) },
  ];
  const totalAlocados = grupos.reduce((s, g) => s + g.itens.length, 0);
  /* opções dos filtros (a partir das travas existentes) */
  const idgeosComTrava = [...new Set(Object.values(travas || {}).flatMap((porId) => Object.values(porId || {}).flat()).map((t) => t.idgeo).filter(Boolean))];
  const clientesComTrava = [...new Set(idgeosComTrava.map((id) => infoIdgeo(id).cliente).filter(Boolean))];
  const colabsAlocados = (colaboradores || []).filter((c) => temAlocacaoNaGrade(((travas || {}).pessoa || {})[c.mat]));
  const MES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const rotuloCol = (col) => escala === "semana"
    ? `${col.ini.getDate()}/${MES_ABREV[col.ini.getMonth()]}`
    : `${col.ini.getDate()}/${MES_ABREV[col.ini.getMonth()]}`;
  const larguraCol = escala === "semana" ? 64 : 30;

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 17, color: T.green900 }}>📅 Cronograma de Operações</div>
          <div style={{ fontSize: 11.5, color: T.inkSoft }}>Alocação de equipes, máquinas, frota e equipamentos no tempo. Os blocos vêm das travas (projetos via IDGEO, manutenções, férias).</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {[["semana", "Semanal"], ["dia", "Diário"]].map(([id, lb]) => (
            <button key={id} onClick={() => setEscala(id)} style={{ border: `1.5px solid ${escala === id ? T.green700 : T.line}`, background: escala === id ? T.green700 : "#fff", color: escala === id ? "#fff" : T.inkSoft, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{lb}</button>
          ))}
          <select value={semanas} onChange={(e) => setSemanas(+e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12 }}>
            <option value={8}>8 semanas</option><option value={12}>12 semanas</option><option value={26}>26 semanas</option>
          </select>
        </div>
      </div>

      {/* filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600 }}>Filtrar:</span>
        <select value={fCliente} onChange={(e) => setFCliente(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 11.5 }}>
          <option value="">Cliente: todos</option>
          {clientesComTrava.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fIdgeo} onChange={(e) => setFIdgeo(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 11.5 }}>
          <option value="">IDGEO: todos</option>
          {idgeosComTrava.map((id) => <option key={id} value={id}>{id}</option>)}
        </select>
        <select value={fColab} onChange={(e) => setFColab(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 11.5 }}>
          <option value="">Colaborador: todos</option>
          {colabsAlocados.map((c) => <option key={c.mat} value={c.mat}>{c.nome}</option>)}
        </select>
        <input value={fAtividade} onChange={(e) => setFAtividade(e.target.value)} placeholder="Atividade (ex: sondagem)" style={{ ...inputStyle, width: 170, padding: "5px 8px", fontSize: 11.5 }} />
        {(fCliente || fIdgeo || fColab || fAtividade) && <button onClick={() => { setFCliente(""); setFIdgeo(""); setFColab(""); setFAtividade(""); }} style={{ border: "none", background: "none", color: T.blue, cursor: "pointer", fontSize: 11.5 }}>limpar</button>}
        <span style={{ fontSize: 11, color: T.inkSoft, marginLeft: "auto" }}>{totalAlocados} recurso(s) alocado(s)</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "#fff", zIndex: 2, textAlign: "left", padding: "4px 8px", minWidth: 180, borderBottom: `2px solid ${T.green900}` }}>Recurso</th>
              {cols.map((col, i) => {
                const ehHoje = iso(col.ini) <= iso(hoje) && iso(hoje) <= iso(col.fim);
                return <th key={i} style={{ padding: "4px 2px", minWidth: larguraCol, width: larguraCol, textAlign: "center", fontSize: 9.5, color: ehHoje ? T.green700 : T.inkSoft, borderBottom: `2px solid ${T.green900}`, borderLeft: ehHoje ? `2px solid ${T.green700}` : "none", fontWeight: ehHoje ? 700 : 600 }}>{rotuloCol(col)}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {totalAlocados === 0 && (
              <tr><td colSpan={cols.length + 1} style={{ padding: "30px", textAlign: "center", color: T.inkSoft, fontStyle: "italic" }}>
                Nenhum recurso alocado no período {(fCliente || fIdgeo || fColab || fAtividade) ? "com os filtros aplicados" : "(aprove OS na aba Inteligência ou registre bloqueios para ver alocações aqui)"}.
              </td></tr>
            )}
            {grupos.filter((g) => g.itens.length > 0).map((g) => (
              <React.Fragment key={g.tipo}>
                <tr>
                  <td colSpan={cols.length + 1} style={{ background: T.paper, fontWeight: 700, color: T.green900, padding: "5px 8px", fontSize: 11.5, position: "sticky", left: 0 }}>{g.label} <span style={{ color: T.inkSoft, fontWeight: 400 }}>({g.itens.length})</span></td>
                </tr>
                {g.itens.map((it) => {
                  const lista = ((travas || {})[g.tipo] || {})[it.id] || [];
                  return (
                    <tr key={it.id}>
                      <td style={{ position: "sticky", left: 0, background: "#fff", zIndex: 1, padding: "3px 8px", borderBottom: `1px solid ${T.paper}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }} title={it.nome}>{it.nome}</td>
                      {cols.map((col, i) => {
                        const tv = travaNaCol(lista, col);
                        const ehHoje = iso(col.ini) <= iso(hoje) && iso(hoje) <= iso(col.fim);
                        let bg = "transparent", txt = "";
                        if (tv) {
                          const ni = TRAVA_INFO(tv.nivel);
                          bg = ni.cor;
                          if (tv.idgeo) txt = idgeosSistema.includes(tv.idgeo) ? projDe(tv.idgeo).slice(0, 8) : tv.idgeo.slice(0, 8);
                          else if (tv.motivo) txt = ({ ferias: "Férias", atestado: "Atest.", manutencao: "Manut.", calibracao: "Calib.", politica: "Polít." })[tv.motivo] || "Bloq.";
                          else txt = (tv.obs || "").slice(0, 8);
                        }
                        return <td key={i} title={tv ? (tv.idgeo ? `${infoIdgeo(tv.idgeo).cliente || ""} · ${tv.idgeo}${infoIdgeo(tv.idgeo).atividade ? " · " + infoIdgeo(tv.idgeo).atividade : ""}\n${fmtData(tv.ini)} → ${fmtData(tv.fim)}` : `${tv.obs || tv.motivo || "bloqueio"}\n${fmtData(tv.ini)} → ${fmtData(tv.fim)}`) : ""} style={{ borderLeft: ehHoje ? `2px solid ${T.green700}` : `1px solid ${T.paper}`, borderBottom: `1px solid ${T.paper}`, background: bg, height: 22, padding: 0, textAlign: "center" }}>
                          {txt && <span style={{ fontSize: 8, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>{txt}</span>}
                        </td>;
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, fontSize: 10.5, color: T.inkSoft }}>
        {NIVEIS_TRAVA.map((n) => <span key={n.id}>{n.icone} {n.label}</span>)}
        <span>· Coluna verde = hoje · Texto na célula = cliente/projeto (IDGEO) ou motivo</span>
      </div>
    </div>
  );
}

/* ---------- Grade de cronograma: fim ---------- */
function CalendarioRecurso({ tipo, idRec, nomeRec, travas, taps, podeEditar, ehGestorPlanejamento, onSalvar, onExcluir, accent }) {
  const [aberto, setAberto] = useState(false);
  const [edit, setEdit] = useState(null); // trava em edição (ou nova)
  const [conflito, setConflito] = useState(null); // mensagem de conflito de datas
  const lista = ((travas || {})[tipo] || {})[idRec] || [];
  const cor = accent || T.green700;
  const ehPessoa = tipo === "pessoa";
  /* motivos de bloqueio para pessoas (RH): férias, atestado, política, projeto, outro */
  const MOTIVOS_PESSOA = [
    { id: "ferias", label: "🏖 Férias" },
    { id: "atestado", label: "🩺 Atestado / afastamento médico" },
    { id: "politica", label: "📋 Política interna / treinamento" },
    { id: "projeto", label: "🛠 Alocado em projeto" },
    { id: "outro", label: "Outro motivo" },
  ];
  /* níveis que o usuário pode aplicar: bloqueio TOTAL só para o Gestor de Planejamento */
  const niveisDisponiveis = ehGestorPlanejamento ? NIVEIS_TRAVA : NIVEIS_TRAVA.filter((n) => n.id !== "total");

  const novaTrava = () => { setConflito(null); setEdit({ ini: hojeISO(), fim: hojeISO(), nivel: ehGestorPlanejamento ? "total" : "parcial", idgeo: "", obs: "", motivo: ehPessoa ? "ferias" : "" }); };
  /* duas faixas se sobrepõem se ini1<=fim2 e ini2<=fim1 */
  const sobrepoe = (a, b) => a.ini <= b.fim && b.ini <= a.fim;
  const salvar = () => {
    if (!edit.ini || !edit.fim) return;
    if (edit.fim < edit.ini) { setConflito("A data de fim não pode ser anterior à de início."); return; }
    if (edit.nivel === "total" && !ehGestorPlanejamento) { setConflito("Apenas o Gestor de Planejamento pode aplicar bloqueio total."); return; }
    /* conflito = sobreposição com trava de NÍVEL DIFERENTE (não se pode liberar o que está bloqueado, nem vice-versa) */
    const conf = lista.find((t) => t.id !== edit.id && t.nivel !== edit.nivel && sobrepoe(edit, t));
    if (conf) {
      const ni = TRAVA_INFO(conf.nivel); const meu = TRAVA_INFO(edit.nivel);
      setConflito(`Conflito de datas: já existe uma trava "${ni.label}" de ${fmtData(conf.ini)} a ${fmtData(conf.fim)}${conf.idgeo ? ` (${conf.idgeo})` : ""}. Não é possível sobrepor um período "${meu.label}" a ele. Ajuste as datas ou remova a trava conflitante.`);
      return;
    }
    setConflito(null);
    onSalvar(tipo, idRec, edit);
    setEdit(null);
  };
  const idgeosSistema = (taps || []).map((t) => t.idgeo);

  /* status atual (hoje) do recurso conforme as travas */
  const hoje = hojeISO();
  const travaHoje = lista.find((t) => t.ini <= hoje && t.fim >= hoje && t.nivel !== "livre");
  const statusAtual = travaHoje ? TRAVA_INFO(travaHoje.nivel) : TRAVA_INFO("livre");

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setAberto((v) => !v)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
        background: statusAtual.bg, border: `1px solid ${statusAtual.cor}33`, borderRadius: 8, padding: "7px 12px", cursor: "pointer",
      }}>
        <span style={{ fontSize: 13 }}>{statusAtual.icone}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: statusAtual.cor }}>{statusAtual.curto} hoje</span>
        <span style={{ fontSize: 11.5, color: T.inkSoft }}>· {lista.length} trava(s) no calendário</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: cor }}>{aberto ? "▲ fechar" : "▼ calendário"}</span>
      </button>

      {aberto && (
        <div style={{ border: `1px solid ${T.line}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px 14px", background: "#fff" }}>
          {/* legenda */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            {NIVEIS_TRAVA.map((n) => (
              <span key={n.id} style={{ fontSize: 10.5, color: T.inkSoft }}>{n.icone} {n.label}</span>
            ))}
          </div>

          {/* barra visual de linha do tempo (alocações futuras) */}
          <TimelineRecurso travas={lista} motivosPessoa={MOTIVOS_PESSOA} ehPessoa={ehPessoa} idgeosSistema={idgeosSistema} />

          {/* lista de travas */}
          {lista.length === 0 ? (
            <div style={{ fontSize: 12, color: T.inkSoft, fontStyle: "italic", marginBottom: 10 }}>Nenhuma trava cadastrada. O recurso é considerado <b>liberado</b> por padrão.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {lista.map((tv) => {
                const ni = TRAVA_INFO(tv.nivel);
                const noSistema = idgeosSistema.includes(tv.idgeo);
                return (
                  <div key={tv.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: ni.bg, borderRadius: 6, padding: "6px 10px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ni.cor }}>{ni.icone} {ni.curto}</span>
                    <span style={{ fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtData(tv.ini)} → {fmtData(tv.fim)}</span>
                    {ehPessoa && tv.motivo && <span style={{ fontSize: 10.5, background: "#fff", borderRadius: 99, padding: "2px 8px", color: T.inkSoft }}>{(MOTIVOS_PESSOA.find((m) => m.id === tv.motivo) || {}).label || tv.motivo}</span>}
                    {tv.idgeo && <span style={{ fontSize: 10.5, background: "#fff", borderRadius: 99, padding: "2px 8px", color: noSistema ? T.green700 : T.inkSoft }} title={noSistema ? "IDGEO do sistema" : "IDGEO externo"}>{noSistema ? "🔗" : "📌"} {tv.idgeo}</span>}
                    {tv.obs && <span style={{ fontSize: 11, color: T.inkSoft }}>· {tv.obs}</span>}
                    <div style={{ flex: 1 }} />
                    {podeEditar && ehGestorPlanejamento && <>
                      <button onClick={() => setEdit(tv)} style={{ border: "none", background: "none", color: T.blue, cursor: "pointer", fontSize: 11 }}>editar</button>
                      <button onClick={() => onExcluir(tipo, idRec, tv.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 11 }}>excluir</button>
                    </>}
                    {podeEditar && !ehGestorPlanejamento && tv.nivel !== "total" && (
                      <button onClick={() => setEdit(tv)} style={{ border: "none", background: "none", color: T.blue, cursor: "pointer", fontSize: 11 }}>editar</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* formulário de trava */}
          {podeEditar && (edit ? (
            <div style={{ background: T.paper, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900, marginBottom: 8 }}>{edit.id ? "Editar trava" : "Nova trava de disponibilidade"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <Field label="Início"><input type="date" style={inputStyle} value={edit.ini} onChange={(e) => { setConflito(null); setEdit({ ...edit, ini: e.target.value }); }} /></Field>
                <Field label="Fim"><input type="date" style={inputStyle} value={edit.fim} min={edit.ini} onChange={(e) => { setConflito(null); setEdit({ ...edit, fim: e.target.value }); }} /></Field>
              </div>
              <Field label="Nível de bloqueio">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {niveisDisponiveis.map((n) => (
                    <button key={n.id} onClick={() => { setConflito(null); setEdit({ ...edit, nivel: n.id }); }} style={{
                      border: `1.5px solid ${edit.nivel === n.id ? n.cor : T.line}`, background: edit.nivel === n.id ? n.bg : "#fff",
                      color: edit.nivel === n.id ? n.cor : T.inkSoft, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>{n.icone} {n.label}</button>
                  ))}
                </div>
                {!ehGestorPlanejamento && <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 4 }}>🔒 O bloqueio <b>total</b> só pode ser definido pelo Gestor de Planejamento.</div>}
              </Field>
              <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 2, marginBottom: 8 }}>{TRAVA_INFO(edit.nivel).desc}</div>
              {ehPessoa ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Motivo do bloqueio">
                    <select style={inputStyle} value={edit.motivo || "ferias"} onChange={(e) => setEdit({ ...edit, motivo: e.target.value })}>
                      {MOTIVOS_PESSOA.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </Field>
                  {edit.motivo === "projeto" ? (
                    <Field label="IDGEO do projeto (opcional)">
                      <input style={inputStyle} value={edit.idgeo} onChange={(e) => setEdit({ ...edit, idgeo: e.target.value.toUpperCase() })} list={`idgeos-${tipo}-${idRec}`} placeholder="ex.: SC26001" />
                      <datalist id={`idgeos-${tipo}-${idRec}`}>{idgeosSistema.map((id) => <option key={id} value={id} />)}</datalist>
                    </Field>
                  ) : (
                    <Field label="Observação"><input style={inputStyle} value={edit.obs} onChange={(e) => setEdit({ ...edit, obs: e.target.value })} placeholder="ex.: férias programadas, atestado nº..." /></Field>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="IDGEO atrelado (do sistema ou externo)">
                    <input style={inputStyle} value={edit.idgeo} onChange={(e) => setEdit({ ...edit, idgeo: e.target.value.toUpperCase() })} list={`idgeos-${tipo}-${idRec}`} placeholder="ex.: SC26001 ou IDGEO externo" />
                    <datalist id={`idgeos-${tipo}-${idRec}`}>{idgeosSistema.map((id) => <option key={id} value={id} />)}</datalist>
                  </Field>
                  <Field label="Observação"><input style={inputStyle} value={edit.obs} onChange={(e) => setEdit({ ...edit, obs: e.target.value })} placeholder="opcional" /></Field>
                </div>
              )}
              {conflito && (
                <div style={{ background: T.redBg, color: T.red, borderRadius: 8, padding: "10px 12px", fontSize: 12, marginTop: 10, border: `1px solid ${T.red}33` }}>
                  ⚠ {conflito}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <Btn small onClick={() => { setConflito(null); setEdit(null); }}>Cancelar</Btn>
                <Btn small kind="primary" disabled={!edit.ini || !edit.fim} onClick={salvar}>Salvar trava</Btn>
              </div>
            </div>
          ) : (
            <Btn small onClick={novaTrava} style={{ borderColor: cor, color: cor }}>+ Adicionar trava ao calendário</Btn>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Nova TAP manual — gera IDGEO automático (UF+ANO+sequencial) ---------- */
function NovaTapForm({ taps, clientes, contratos, estruturaEmpresa, onCriar, onClose }) {
  const [f, setF] = useState({
    clienteId: "", cliente: "", cnpj: "", contratoId: "", contrato: "",
    projeto: "", cidade: "", uf: "", carteira: "", contato: "",
    premissas: "", expectativas: "", entradaCampo: "", entregaRelatorio: "", prazoMaximo: "",
    margem: "", riscosTecnicos: "", desafiosOper: "", riscosJuridicos: "",
    anexos: [], analiseIA: null,
  });
  const [analisando, setAnalisando] = useState(false);
  const [catAnexo, setCatAnexo] = useState("contrato");
  const fileRef = useRef(null);
  const set = (k) => (e) => setF((c) => ({ ...c, [k]: e.target.value }));
  const anoAtual = new Date().getFullYear();
  const previa = f.uf ? gerarIdgeo(f.uf, taps, anoAtual) : "—";
  const carteiras = ["GC01", "GC02", "GC03", "GC04", "GC05", "GC06", "GC07", "GC08"];

  /* categorias de anexo do dossiê contratual */
  const CATS = [
    { id: "contrato", label: "Contrato", icone: "📜" },
    { id: "proposta", label: "Proposta técnica", icone: "📑" },
    { id: "anexo_ct", label: "Anexo do contrato", icone: "📎" },
    { id: "dfp", label: "Demonstrativo de formação de preços (DFP)", icone: "💲" },
    { id: "outro", label: "Outro documento", icone: "🗂" },
  ];

  /* ao escolher o cliente, puxa CNPJ e contratos do Comercial (clientes/contratos são identificados por nome) */
  const escolherCliente = (e) => {
    const nome = e.target.value;
    const cli = (clientes || []).find((c) => c.nome === nome);
    const ctsDoCliente = (contratos || []).filter((ct) => ct.cliente === nome);
    const primeiroCt = ctsDoCliente[0];
    setF((c) => ({
      ...c, clienteId: nome, cliente: nome,
      cnpj: cli?.cnpj || primeiroCt?.cnpj || "",
      cidade: c.cidade || primeiroCt?.localidade || "",
      uf: c.uf || primeiroCt?.estado || "",
      contratoId: primeiroCt?.contrato || "", contrato: primeiroCt?.contrato || "",
    }));
  };
  const ctsDoCliente = (contratos || []).filter((ct) => ct.cliente === f.cliente);

  const aoAnexar = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setF((c) => ({ ...c, anexos: [...(c.anexos || []), { id: "ax_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), categoria: catAnexo, nome: file.name, tipo: file.type, tamanho: file.size, dataURL: reader.result }], analiseIA: null }));
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };
  const removerAnexo = (id) => setF((c) => ({ ...c, anexos: (c.anexos || []).filter((a) => a.id !== id) }));

  const analisarContrato = async () => {
    const anexos = f.anexos || [];
    if (!anexos.length) return;
    const chk = checarTamanhoAnexos(anexos);
    if (chk.excede) { setF((c) => ({ ...c, analiseIA: { erro: chk.msg } })); return; }
    setAnalisando(true);
    try {
      /* resumo da estrutura da GEOAMBIENTE para a IA comparar (pessoas/cargos/aptidões, máquinas, equipamentos) */
      const estrutura = estruturaEmpresa || {};
      const prompt = `Você é advogado e engenheiro especialista em contratos de serviços ambientais, atuando como assessor da GEOAMBIENTE S/A. Analise o DOSSIÊ CONTRATUAL anexado (contrato, proposta, anexos, demonstrativo de preços) e produza um PARECER TÉCNICO-JURÍDICO estruturado em JSON.

Estrutura atual da GEOAMBIENTE (para comparar): ${JSON.stringify(estrutura).slice(0, 3500)}

Produza o JSON com EXATAMENTE estes campos:
- "escopoResumo": texto com o escopo resumido do trabalho contratado, COM QUANTITATIVOS (metros de sondagem, volumes de injeção, nº de poços, etc.) sempre que o documento informar.
- "quantitativos": lista de objetos { "item": string, "quantidade": string, "unidade": string } com os serviços e quantidades identificados.
- "analiseJuridica": texto com análise jurídica detalhada dos principais aspectos que o contrato exige para garantir pleno atendimento.
- "multasPenalidades": lista de strings destacando multas, penalidades e obrigações que podem implicar prejuízo financeiro ou de imagem para a GEOAMBIENTE.
- "obrigacoesCriticas": lista de obrigações legais e contratuais críticas.
- "estruturaPessoas": texto avaliando se a estrutura de colaboradores, aptidões e documentos obrigatórios da GEOAMBIENTE atende ao escopo; aponte cargos/competências que podem faltar.
- "alertasPessoas": lista de strings com pontos de fragilidade de pessoal (competências/documentos que não temos e seriam necessários).
- "estruturaRecursos": texto avaliando se máquinas, equipamentos e veículos são suficientes para o atendimento pleno.
- "necessidadeInvestimento": lista de strings indicando se haverá necessidade de investimento (equipamentos, máquinas, contratações, terceirização) e qual.
- "normas": lista de NRs e normas técnicas exigidas.
- "alertasGestao": lista de pontos que os gestores devem vigiar.
Responda SOMENTE com o JSON, sem texto adicional.`;
      const content = [];
      anexos.forEach((ax) => {
        const base64 = (ax.dataURL || "").split(",")[1];
        const cat = (CATS.find((c) => c.id === ax.categoria) || {}).label || "Anexo";
        content.push({ type: "text", text: `--- ${cat}: ${ax.nome} ---` });
        if ((ax.tipo || "").includes("pdf") && base64) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
      });
      content.push({ type: "text", text: prompt });
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3500, messages: [{ role: "user", content }] }),
      });
      const dd = await resp.json();
      if (dd.error) throw new Error(dd.detalhe || dd.error);
      const txt = (dd.content || []).map((b) => b.text || "").join("\n").replace(/```json|```/g, "").trim();
      let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { observacoes: txt }; }
      setF((c) => ({ ...c, analiseIA: { ...parsed, analisadoEm: hojeISO() } }));
    } catch {
      const msg = (err && err.message) ? String(err.message) : "";
      const offline = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Unexpected token");
      setF((c) => ({ ...c, analiseIA: { erro: offline ? "A análise por IA roda no sistema publicado (com a API conectada). Os documentos já estão anexados e serão lidos no deploy." : ("Erro na análise: " + msg) } }));
    } finally {
      setAnalisando(false);
    }
  };

  const obrig = (k) => f[k] && f[k].trim();
  /* documentos exigidos no dossiê contratual (Bloco 4: obrigatório enviar todos) */
  const DOCS_OBRIGATORIOS = ["contrato", "proposta", "dfp"];
  const catsAnexadas = new Set((f.anexos || []).map((a) => a.categoria));
  const docsFaltando = DOCS_OBRIGATORIOS.filter((d) => !catsAnexadas.has(d));
  const dossieCompleto = docsFaltando.length === 0;
  const faltantes = [];
  if (!obrig("projeto")) faltantes.push("Nome do projeto");
  if (!obrig("cliente")) faltantes.push("Cliente");
  if (!f.uf) faltantes.push("UF");
  if (!obrig("cidade")) faltantes.push("Cidade da execução");
  if (!obrig("premissas")) faltantes.push("Premissas");
  if (!obrig("expectativas")) faltantes.push("Expectativas");
  if (!obrig("entradaCampo")) faltantes.push("Entrada em campo");
  if (!obrig("entregaRelatorio")) faltantes.push("Entrega do relatório");
  if (!obrig("prazoMaximo")) faltantes.push("Prazo máximo");
  if (!obrig("riscosTecnicos")) faltantes.push("Riscos técnicos");
  if (!obrig("desafiosOper")) faltantes.push("Desafios operacionais");
  if (!dossieCompleto) faltantes.push("Dossiê: " + docsFaltando.map((d) => (CATS.find((c) => c.id === d) || {}).label || d).join(", "));
  const valido = faltantes.length === 0;

  const lbl = (txt, ok) => <span>{txt} {!ok && <span style={{ color: T.red }}>*</span>}</span>;
  const ia = f.analiseIA;
  const listaIA = (titulo, arr) => Array.isArray(arr) && arr.length > 0 ? (
    <div style={{ marginTop: 6 }}><b style={{ fontSize: 12 }}>{titulo}:</b> <span style={{ fontSize: 12 }}>{arr.join(" · ")}</span></div>
  ) : null;

  return (
    <Modal title="Nova TAP / abertura de projeto" onClose={onClose} wide>
      <div style={{ background: T.blueBg, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, color: T.ink }}>O <b>IDGEO</b> é gerado automaticamente (UF + ano + sequencial):</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: T.green700 }}>{previa}</span>
      </div>

      {/* IDENTIFICAÇÃO */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, marginBottom: 6 }}>Identificação</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label={lbl("Cliente (do Comercial)", obrig("cliente"))} req>
          <select style={inputStyle} value={f.clienteId} onChange={escolherCliente}>
            <option value="">— selecione um cliente cadastrado —</option>
            {(clientes || []).map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Contrato vinculado">
          <select style={inputStyle} value={f.contratoId} onChange={(e) => { const ct = ctsDoCliente.find((x) => x.contrato === e.target.value); setF((c) => ({ ...c, contratoId: e.target.value, contrato: ct?.contrato || "", cnpj: ct?.cnpj || c.cnpj, cidade: c.cidade || ct?.localidade || "", uf: c.uf || ct?.estado || "" })); }}>
            <option value="">— selecione o contrato —</option>
            {ctsDoCliente.map((ct) => <option key={ct.contrato} value={ct.contrato}>{ct.contrato} · {ct.projeto || ""}</option>)}
          </select>
        </Field>
        <Field label="CNPJ (puxado do cliente/contrato)"><input style={{ ...inputStyle, background: T.paper }} value={f.cnpj} onChange={set("cnpj")} placeholder="—" /></Field>
        <Field label="Contato"><input style={inputStyle} value={f.contato} onChange={set("contato")} placeholder="Nome / telefone / e-mail" /></Field>
        <Field label={lbl("Nome do projeto", obrig("projeto"))} req><input style={inputStyle} value={f.projeto} onChange={set("projeto")} placeholder="ex.: Posto BR-101 — Monitoramento" /></Field>
        <Field label={lbl("UF do serviço (define o IDGEO)", f.uf)} req>
          <select style={inputStyle} value={f.uf} onChange={(e) => setF((c) => ({ ...c, uf: e.target.value, cidade: "" }))}>
            <option value="">— selecione o estado —</option>
            {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
        <Field label={lbl("Cidade da execução", f.cidade)} req>
          <select style={inputStyle} value={f.cidade} onChange={set("cidade")} disabled={!f.uf}>
            <option value="">{f.uf ? "— selecione a cidade —" : "— escolha a UF primeiro —"}</option>
            {(CIDADES_POR_UF[f.uf] || []).map((cid) => <option key={cid} value={cid}>{cid}</option>)}
            {f.cidade && !(CIDADES_POR_UF[f.uf] || []).includes(f.cidade) && <option value={f.cidade}>{f.cidade}</option>}
          </select>
        </Field>
        <Field label="Carteira / Gerente de Projeto">
          <select style={inputStyle} value={f.carteira} onChange={set("carteira")}>
            <option value="">— selecione —</option>
            {carteiras.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* GESTÃO DO PROJETO */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "16px 0 6px" }}>Premissas e expectativas</div>
      <Field label={lbl("Premissas do projeto (escopo, objeto do contrato)", obrig("premissas"))} req>
        <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.premissas} onChange={set("premissas")} placeholder="O que será executado, escopo técnico, objeto contratual" />
      </Field>
      <Field label={lbl("Alinhamento de expectativas do cliente (metas do serviço)", obrig("expectativas"))} req>
        <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.expectativas} onChange={set("expectativas")} placeholder="Metas e expectativas do cliente quanto ao serviço" />
      </Field>

      {/* MARCOS */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "16px 0 6px" }}>Datas dos principais marcos</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label={lbl("Entrada em campo", obrig("entradaCampo"))} req><input type="date" style={inputStyle} value={f.entradaCampo} onChange={set("entradaCampo")} /></Field>
        <Field label={lbl("Entrega de relatórios", obrig("entregaRelatorio"))} req><input type="date" style={inputStyle} value={f.entregaRelatorio} onChange={set("entregaRelatorio")} /></Field>
        <Field label={lbl("Prazo máximo de execução", obrig("prazoMaximo"))} req><input type="date" style={inputStyle} value={f.prazoMaximo} onChange={set("prazoMaximo")} /></Field>
      </div>

      {/* RISCOS E MARGEM */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "16px 0 6px" }}>Margem e riscos</div>
      <Field label={lbl("Margem de lucro esperada (%)", obrig("margem"))} req>
        <input type="number" min="0" step="0.1" style={{ ...inputStyle, maxWidth: 200 }} value={f.margem} onChange={set("margem")} placeholder="ex.: 28" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label={lbl("Riscos técnicos", obrig("riscosTecnicos"))} req><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.riscosTecnicos} onChange={set("riscosTecnicos")} /></Field>
        <Field label={lbl("Desafios operacionais", obrig("desafiosOper"))} req><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.desafiosOper} onChange={set("desafiosOper")} /></Field>
        <Field label={lbl("Riscos jurídicos", obrig("riscosJuridicos"))} req><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.riscosJuridicos} onChange={set("riscosJuridicos")} /></Field>
      </div>

      {/* DOSSIÊ CONTRATUAL + IA */}
      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "16px 0 6px" }}>Dossiê contratual</div>
      <div style={{ background: T.blueBg, borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>Anexe contrato, proposta, anexos e o demonstrativo de formação de preços (com os custos detalhados). A IA lê o conjunto e prepara o dossiê de riscos jurídicos e obrigações legais.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
          <select style={{ ...inputStyle, width: "auto", padding: "6px 10px" }} value={catAnexo} onChange={(e) => setCatAnexo(e.target.value)}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.label}</option>)}
          </select>
          <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.xls,image/*" onChange={aoAnexar} style={{ display: "none" }} />
          <Btn small onClick={() => fileRef.current && fileRef.current.click()}>📎 Anexar documento(s)</Btn>
        </div>
        {(f.anexos || []).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {f.anexos.map((ax) => {
              const cat = CATS.find((c) => c.id === ax.categoria) || CATS[4];
              return (
                <div key={ax.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 6, padding: "6px 12px" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.blue, background: T.blueBg, borderRadius: 99, padding: "2px 8px" }}>{cat.icone} {cat.label}</span>
                  <span style={{ fontSize: 12.5 }}>{ax.nome}</span>
                  <div style={{ flex: 1 }} />
                  <Btn small kind="danger" onClick={() => removerAnexo(ax.id)}>Remover</Btn>
                </div>
              );
            })}
            {(() => {
              const chk = checarTamanhoAnexos(f.anexos || []);
              return (
                <div style={{ marginTop: 8 }}>
                  <Btn kind="primary" small disabled={analisando || chk.excede} onClick={analisarContrato}>{analisando ? "Analisando contrato…" : `⚖️ Analisar contrato com IA (${f.anexos.length} doc)`}</Btn>
                  <span style={{ marginLeft: 10, fontSize: 11.5, color: chk.excede ? T.red : T.inkSoft }}>
                    {fmtBytes(chk.bytes)}{chk.excede ? ` · acima do limite de ${fmtBytes(LIMITE_ANEXOS_IA)}` : ""}
                  </span>
                  {chk.excede && <div style={{ fontSize: 11.5, color: T.red, marginTop: 4 }}>{chk.msg}</div>}
                </div>
              );
            })()}
          </div>
        )}
        {ia && (
          <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px" }}>
            {ia.erro ? <div style={{ color: T.amber, fontSize: 12.5 }}>⏳ {ia.erro}</div> : (
              <>
                <div style={{ fontWeight: 700, color: T.green900, marginBottom: 6 }}>⚖️ Dossiê jurídico-operacional (IA)</div>
                {listaIA("Riscos jurídicos", ia.riscosJuridicos)}
                {listaIA("Obrigações legais", ia.obrigacoesLegais)}
                {listaIA("Planos de segurança", ia.planosSeguranca)}
                {listaIA("Normas exigidas", ia.normas)}
                {listaIA("Premissas técnicas", ia.premissasTecnicas)}
                {listaIA("Multas e penalidades", ia.multasPenalidades)}
                {listaIA("Garantias e seguros", ia.garantias)}
                {listaIA("⚠ Alertas para os gestores", ia.alertasGestao)}
                {ia.observacoes && <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 6 }}>{ia.observacoes}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {!valido && <span style={{ fontSize: 12, color: T.amber, textAlign: "right" }}>⚠ Falta preencher: {faltantes.slice(0, 4).join(", ")}{faltantes.length > 4 ? ` e mais ${faltantes.length - 4}` : ""}</span>}
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn kind="primary" disabled={!valido} onClick={() => onCriar(f)}>Criar TAP ({previa})</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Importação de TAPs do Holmes ---------- */
function TapImportModal({ existentes, onImport, onClose }) {
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [arquivoNome, setArquivoNome] = useState("");
  const fileRef = useRef(null);

  /* carrega a SheetJS sob demanda (mesmo padrão do mapa) */
  const garantirXLSX = () => new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.async = true;
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("falha ao carregar leitor de Excel"));
    document.body.appendChild(s);
  });

  const aoSubirArquivo = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setArquivoNome(file.name);
    setCarregando(true);
    try {
      const XLSX = await garantirXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      /* converte a 1ª planilha em linhas TAB-separadas, reaproveitando o parser de colagem */
      const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
      const tsv = linhas.map((linha) => linha.map((c) => String(c == null ? "" : c).replace(/\t/g, " ").replace(/\n/g, " ")).join("\t")).join("\n");
      setTexto(tsv);
    } catch (err) {
      setArquivoNome("");
      alert("Não foi possível ler o arquivo. Verifique se é um Excel (.xlsx) válido, ou cole os dados manualmente. No protótipo sem internet, o leitor de Excel pode não carregar — neste caso, use a colagem.");
    } finally {
      setCarregando(false);
    }
  };

  const resultado = useMemo(() => {
    const lns = texto.split("\n").map((l) => l.replace(/\r/g, "")).filter((l) => l.trim());
    if (lns.length === 0) return { header: null, linhas: [] };
    /* primeira linha = cabeçalho; mapeia cada coluna para um campo */
    const headerCells = lns[0].split("\t").map((x) => x.trim());
    const mapa = headerCells.map((h) => tapCampoDoHeader(h));
    const temIdgeo = mapa.includes("idgeo");
    const linhas = lns.slice(1).map((l) => {
      const cells = l.split("\t").map((x) => (x || "").trim());
      const obj = {};
      mapa.forEach((campo, i) => {
        if (!campo) return;
        const v = cells[i] || "";
        if (campo === "tipoServico") {
          obj.tipoServico = v ? v.split(/[;,/]| - |·/).map((s) => s.trim()).filter(Boolean) : [];
        } else if (campo === "valor" || campo === "margem") {
          obj[campo] = v ? parseMoeda(v) : "";
        } else if (campo === "urgente15") {
          obj.urgente15 = ["sim", "s", "x", "true", "1"].includes(norm(v));
        } else {
          obj[campo] = v;
        }
      });
      if (!obj.idgeo) return { erro: "Sem IDGEO — linha ignorada", bruto: l.slice(0, 60) };
      obj.tipoServico = obj.tipoServico || [];
      const dup = existentes.some((t) => t.idgeo === obj.idgeo);
      return { tap: obj, atualiza: dup };
    });
    return { header: headerCells, mapa, temIdgeo, linhas };
  }, [texto, existentes]);

  const { header, mapa, temIdgeo, linhas } = resultado;
  const ok = linhas.filter((l) => l.tap);
  const reconhecidas = mapa ? mapa.filter(Boolean).length : 0;

  return (
    <Modal title="Importar TAPs do Holmes" onClose={onClose} wide>
      <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>
        Faça o <b>upload da planilha Excel</b> ou <b>cole</b> a exportação do Holmes (com a linha de cabeçalho). As colunas são reconhecidas pelo nome (em qualquer ordem). Cada TAP precisa de um <b>IDGEO</b>. TAPs já existentes são <b>atualizados</b>.
      </p>

      {/* Upload de Excel */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12, padding: "12px 14px", background: T.blueBg, borderRadius: 8 }}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={aoSubirArquivo} style={{ display: "none" }} />
        <Btn kind="primary" small disabled={carregando} onClick={() => fileRef.current && fileRef.current.click()}>{carregando ? "Lendo…" : "📊 Subir planilha Excel"}</Btn>
        <span style={{ fontSize: 12, color: T.inkSoft }}>{arquivoNome ? `📄 ${arquivoNome}` : "Aceita .xlsx, .xls ou .csv — a 1ª planilha é lida"}</span>
      </div>

      <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 4 }}>ou cole os dados aqui (Ctrl+V de uma seleção do Excel):</div>
      <textarea rows={5} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, resize: "vertical" }}
        placeholder={"Autor\tData criação\tContato do cliente\t…\tIDGEO\t…\tNome do Projeto\tCarteira\t…\nFulano\t2026-06-01\tJoão / (41)999…\t…\tPR26050\t…\tMonitoramento Posto X\tGC03\t…"}
        value={texto} onChange={(e) => setTexto(e.target.value)} />

      {header && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: T.inkSoft }}>
          {reconhecidas} de {header.length} coluna(s) reconhecidas{!temIdgeo && <span style={{ color: T.red, fontWeight: 600 }}> · ⚠ coluna IDGEO não encontrada no cabeçalho</span>}
        </div>
      )}
      {linhas.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 6 }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.line}`, background: l.erro ? T.redBg : "transparent" }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {l.erro ? l.bruto : <><b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.tap.idgeo}</b> · {l.tap.projeto || "(sem nome de projeto)"} · {l.tap.cliente || ""}{l.tap.tipoServico && l.tap.tipoServico.length ? ` · ${l.tap.tipoServico.length} serviço(s)` : ""}</>}
              </span>
              {l.erro ? <Badge text="Erro" c={T.red} bg="#fff" /> : <Badge text={l.atualiza ? "Atualiza" : "Novo"} c={l.atualiza ? T.amber : T.green700} bg={l.atualiza ? "#FBF3E2" : T.green100} />}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: T.inkSoft }}>{ok.length} TAP(s) prontos para importar</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" disabled={ok.length === 0} onClick={() => onImport(ok.map((l) => l.tap))}>Importar {ok.length} TAP(s)</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- CRONOGRAMA de próximas atividades: pré-alocação de recursos ---------- */
function CronogramaEditor({ tap, prog, taps, colaboradores, aptidoes, maquinas, frota, equipamentos, regrasEquipe, dispDe, podeEditar, onSalvar, onClose }) {
  const [importar, setImportar] = useState(false);
  const [crono, setCrono] = useState(() => {
    const base = prog.cronograma && prog.cronograma.blocos ? JSON.parse(JSON.stringify(prog.cronograma)) : { blocos: [] };
    base.blocos = base.blocos.map((b) => { const { atividadeId, ...rest } = b; return { idgeo: tap.idgeo, ...rest, atividadeIds: b.atividadeIds || (atividadeId ? [atividadeId] : []) }; });
    return base;
  });
  const [sugFrente, setSugFrente] = useState(null);

  const novoBloco = (extra = {}) => ({
    id: "bl_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    idgeo: tap.idgeo,
    atividadeIds: prog.atividades.filter((a) => +a.qtd > 0).slice(0, 1).map((a) => a.id),
    inicio: prog.inicioPrev || "", fim: prog.fimPrev || "",
    qtd: "", unid: "", equipeMin: "", local: prog.local || "", integracao: false,
    pessoas: [], maquinas: [], veiculos: [], equipamentos: [], obs: "", ...extra,
  });
  const addBloco = () => setCrono({ ...crono, blocos: [...crono.blocos, novoBloco()] });
  /* monta a descrição da equipe mínima a partir das regras cadastradas */
  const equipeMinDe = (atvId) => {
    const r = regrasEquipe && regrasEquipe[atvId];
    const rn = normalizarRegra(r);
    if (!rn || !rn.cargos || !rn.cargos.length) return "";
    const partes = rn.cargos.map((p) => `${p.qtd}× ${p.cargo} (nível ≥${p.nivelMin})`);
    if (r.exigeRespTec) partes.push("+ resp. técnico");
    return partes.join(", ");
  };
  const importarResumo = (rows) => {
    const novos = rows.map((r) => novoBloco({
      atividadeIds: [r.atividadeId], qtd: r.qtd, unid: r.unid, local: r.local || prog.local || "",
      equipeMin: r.equipeMin || equipeMinDe(r.atividadeId), integracao: r.integracao, obs: r.obs,
    }));
    setCrono({ ...crono, blocos: [...crono.blocos, ...novos] });
    setImportar(false);
  };
  /* equipe mínima combinada de várias atividades */
  const equipeMinMulti = (ids) => {
    const linhas = [];
    (ids || []).forEach((id) => { const e = equipeMinDe(id); if (e) linhas.push(`${(ATIVIDADES.find((x) => x.id === id) || {}).short}: ${e}`); });
    return linhas.join(" · ");
  };
  /* pessoas já alocadas em OUTRAS frentes deste cronograma (para sinalização de cor) */
  const alocadasOutrasFrentes = (idxAtual) => {
    const set = new Set();
    crono.blocos.forEach((b, j) => { if (j !== idxAtual) (b.pessoas || []).forEach((m) => set.add(m)); });
    return set;
  };
  /* sugestão do Motor: colaboradores aptos para as atividades da frente, disponíveis, ordenados por proximidade */
  const sugerirEquipe = (bloco) => {
    const ids = bloco.atividadeIds || [];
    const comps = new Set();
    ids.forEach((id) => { comps.add(id); }); // aptidão exigida = a da própria atividade
    const localObra = bloco.local || prog.local || "";
    const lista = colaboradores.filter((c) => c.status !== "Desligado").map((c) => {
      const apt = Math.max(0, ...[...comps].map((cp) => NIVEL_NUM[(aptidoes[c.mat]?.matriz || {})[cp]] || 0));
      const d = dispDe(c.mat);
      const di = d.localAtual ? distEntreCidades(d.localAtual, localObra) : null;
      const ferias = (d.ferias || []).some((f) => f.ini && f.fim && bloco.inicio && bloco.fim && f.ini <= bloco.fim && f.fim >= bloco.inicio);
      return { mat: c.mat, nome: c.nome, cargo: c.cargo, apt, dist: di, local: d.localAtual || "—", indisp: ferias };
    }).filter((x) => x.apt > 0 && !x.indisp)
      .sort((a, b) => { const da = a.dist == null ? 9e9 : a.dist, db = b.dist == null ? 9e9 : b.dist; if (da !== db) return da - db; return b.apt - a.apt; })
      .slice(0, 6);
    return lista;
  };
  const setBloco = (i, k, v) => setCrono({ ...crono, blocos: crono.blocos.map((b, j) => j === i ? { ...b, [k]: v } : b) });
  const rmBloco = (i) => setCrono({ ...crono, blocos: crono.blocos.filter((_, j) => j !== i) });
  const toggle = (i, campo, val) => setBloco(i, campo, crono.blocos[i][campo].includes(val) ? crono.blocos[i][campo].filter((x) => x !== val) : [...crono.blocos[i][campo], val]);

  const atvsDoProjeto = prog.atividades.filter((a) => +a.qtd > 0).map((a) => ATIVIDADES.find((x) => x.id === a.id)).filter(Boolean);
  const ativos = colaboradores.filter((c) => c.status !== "Desligado");
  const salvar = () => { onSalvar(tap.idgeo, crono); onClose(); };

  /* detecção simples de conflito: mesmo recurso em blocos com datas sobrepostas */
  const sobrepoe = (a, b) => a.inicio && a.fim && b.inicio && b.fim && a.inicio <= b.fim && b.inicio <= a.fim;
  const conflitos = [];
  crono.blocos.forEach((b1, i) => crono.blocos.forEach((b2, j) => {
    if (j <= i || !sobrepoe(b1, b2)) return;
    ["pessoas", "maquinas", "veiculos", "equipamentos"].forEach((campo) => {
      b1[campo].filter((x) => b2[campo].includes(x)).forEach((x) => conflitos.push({ campo, val: x }));
    });
  }));

  const Chips = ({ titulo, lista, selec, onTog, jaAlocadas }) => (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600, marginBottom: 3 }}>{titulo}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {lista.length === 0 && <span style={{ fontSize: 11.5, color: T.inkSoft }}>nenhum cadastrado</span>}
        {lista.map((it) => {
          const v = it.key; const on = selec.includes(v);
          const ocupada = jaAlocadas && jaAlocadas.has(v) && !on; // alocada em outra frente, não nesta
          const estilo = on
            ? { border: `1px solid ${T.green700}`, background: T.green700, color: "#fff" }
            : ocupada
              ? { border: `1px dashed ${T.amber}`, background: T.amberBg, color: T.amber } // já alocada noutra frente
              : { border: `1px solid ${T.line}`, background: "#fff", color: T.ink };
          return <button key={v} disabled={!podeEditar} onClick={() => onTog(v)} title={(it.title || "") + (ocupada ? " · já alocada em outra frente (pode reselecionar)" : "")}
            style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, cursor: podeEditar ? "pointer" : "default", ...estilo }}>
            {ocupada ? "↺ " : ""}{it.label}{on ? " ✓" : ""}
          </button>;
        })}
      </div>
    </div>
  );

  return (
    <Modal title={`Cronograma de Próximas Atividades — ${tap.idgeo}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>{tap.projeto} · 📍 {prog.local}{prog.uf ? `/${prog.uf}` : ""}</div>
      <div style={{ background: T.blueBg, color: T.blue, borderRadius: 8, padding: "10px 14px", fontSize: 12.5, margin: "10px 0 14px" }}>
        🗓 Nível <b>Cronograma</b>: pré-alocação de agenda — quais <b>pessoas, máquinas, veículos e equipamentos</b> vão a campo, em quais <b>datas</b>, para cada frente de trabalho. É a antessala do Motor: você pode pré-alocar manualmente, e o Motor depois otimiza e preenche o que faltar.
      </div>
      {podeEditar && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <Btn small onClick={() => setImportar(true)}>📋 Importar resumo (Excel/colagem)</Btn>
        </div>
      )}
      {importar && <ResumoImportModal prog={prog} onImport={importarResumo} onClose={() => setImportar(false)} />}

      {conflitos.length > 0 && (
        <div style={{ background: T.amberBg, color: T.amber, borderRadius: 6, padding: "8px 12px", fontSize: 12.5, marginBottom: 12 }}>
          ⚠ {conflitos.length} possível(is) conflito(s) de alocação: recurso(s) reservado(s) em frentes com datas sobrepostas.
        </div>
      )}

      {crono.blocos.length === 0 && (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 8, padding: 20, textAlign: "center", fontSize: 13, color: T.inkSoft, marginBottom: 10 }}>
          Nenhuma frente de trabalho ainda. Adicione um bloco para pré-alocar recursos a uma atividade e janela de datas.
        </div>
      )}

      {crono.blocos.map((b, i) => {
        const alocadas = alocadasOutrasFrentes(i);
        const sugestoes = sugFrente === i ? sugerirEquipe(b) : null;
        const equipeMinTxt = equipeMinMulti(b.atividadeIds);
        return (
        <div key={b.id} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, marginBottom: 12, background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Projeto (IDGEO)">
              <select style={inputStyle} value={b.idgeo || tap.idgeo} disabled={!podeEditar} onChange={(e) => setBloco(i, "idgeo", e.target.value)}>
                {taps.filter((t) => !["Concluído", "Cancelado"].includes(t.statusTap)).map((t) => <option key={t.idgeo} value={t.idgeo}>{t.idgeo} — {(t.projeto || "").slice(0, 26)}</option>)}
              </select>
            </Field>
            <Field label="Início"><input type="date" style={inputStyle} value={b.inicio} disabled={!podeEditar} onChange={(e) => setBloco(i, "inicio", e.target.value)} /></Field>
            <Field label="Fim"><input type="date" style={inputStyle} value={b.fim} disabled={!podeEditar} onChange={(e) => setBloco(i, "fim", e.target.value)} /></Field>
            {podeEditar && <Btn small kind="danger" onClick={() => rmBloco(i)}>Remover</Btn>}
          </div>

          {/* Atividades múltiplas (seleção simultânea) */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600, marginBottom: 4 }}>Atividades da frente (uma ou mais)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {ATIVIDADES.map((a) => {
                const on = (b.atividadeIds || []).includes(a.id);
                const doProjeto = atvsDoProjeto.some((x) => x.id === a.id);
                return <button key={a.id} disabled={!podeEditar} title={a.label}
                  onClick={() => setBloco(i, "atividadeIds", on ? b.atividadeIds.filter((x) => x !== a.id) : [...(b.atividadeIds || []), a.id])}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, cursor: podeEditar ? "pointer" : "default",
                    border: `1px solid ${on ? T.green700 : doProjeto ? T.green100 : T.line}`, background: on ? T.green700 : "#fff", color: on ? "#fff" : doProjeto ? T.green700 : T.inkSoft, fontWeight: doProjeto ? 600 : 400 }}>
                  {on ? "✓ " : ""}{a.short}
                </button>;
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 3 }}>Atividades em verde estão na programação deste projeto · clique para incluir/remover</div>
          </div>

          {(b.qtd !== "" || equipeMinTxt || b.integracao) && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginTop: 8, padding: "8px 10px", background: "#FAFBF8", borderRadius: 6, fontSize: 12 }}>
              {b.qtd !== "" && <span>📦 <b>{fmtNum(b.qtd)}</b> {b.unid}</span>}
              {equipeMinTxt && <span title="qualificação mínima combinada (sem nomes)">👥 {equipeMinTxt}</span>}
              {b.integracao && <span style={{ color: T.amber, fontWeight: 600 }}>⚠ Exige integração prévia</span>}
            </div>
          )}

          {/* Sugestão do Motor: aptos disponíveis na região */}
          {podeEditar && (
            <div style={{ marginTop: 10 }}>
              <Btn small onClick={() => setSugFrente(sugFrente === i ? null : i)} disabled={(b.atividadeIds || []).length === 0}>
                🤖 {sugFrente === i ? "Ocultar sugestões" : "Sugerir colaboradores na região"}
              </Btn>
              {sugFrente === i && (
                <div style={{ marginTop: 8, border: `1px solid ${T.green700}`, borderRadius: 8, padding: "10px 12px", background: "linear-gradient(135deg,#F2F8F3,#FAFBF8)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.green900, marginBottom: 6 }}>🤖 Motor sugere — aptos e disponíveis, mais próximos de {b.local || prog.local || "obra"}:</div>
                  {(!sugestoes || sugestoes.length === 0) ? (
                    <div style={{ fontSize: 12, color: T.inkSoft }}>Nenhum colaborador apto e disponível encontrado para estas atividades. Verifique a matriz de aptidões e as posições do ponto eletrônico.</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {sugestoes.map((s) => {
                        const on = b.pessoas.includes(s.mat);
                        return (
                          <button key={s.mat} onClick={() => toggle(i, "pessoas", s.mat)}
                            style={{ textAlign: "left", border: `1px solid ${on ? T.green700 : T.line}`, background: on ? T.green700 : "#fff", color: on ? "#fff" : T.ink, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11.5 }}>
                            <div style={{ fontWeight: 600 }}>{on ? "✓ " : "+ "}{s.nome}</div>
                            <div style={{ fontSize: 10, opacity: 0.85 }}>{s.cargo} · nível {s.apt} · {s.dist != null ? `~${s.dist} km` : "sem geo"}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 6 }}>Ordenado por proximidade da obra · clique para alocar nesta frente</div>
                </div>
              )}
            </div>
          )}

          <Chips titulo="👷 Pessoas" selec={b.pessoas} onTog={(v) => toggle(i, "pessoas", v)} jaAlocadas={alocadas}
            lista={ativos.map((c) => { const dd = dispDe(c.mat); return { key: c.mat, label: c.nome.split(" ")[0] + " " + (c.nome.split(" ")[1] || ""), title: `${c.mat} · ${c.cargo}${dd.localAtual ? " · " + dd.localAtual : ""}` }; })} />
          <Chips titulo="⚙️ Máquinas" selec={b.maquinas} onTog={(v) => toggle(i, "maquinas", v)}
            lista={maquinas.map((m) => ({ key: m.cod, label: m.cod, title: `${m.marca || ""} ${m.modelo || ""}` }))} />
          <Chips titulo="🚗 Veículos" selec={b.veiculos} onTog={(v) => toggle(i, "veiculos", v)}
            lista={frota.map((v) => ({ key: v.placa, label: v.placa, title: v.veiculo || "" }))} />
          <Chips titulo="🔬 Equipamentos" selec={b.equipamentos} onTog={(v) => toggle(i, "equipamentos", v)}
            lista={equipamentos.map((e) => ({ key: e.cod, label: e.cod, title: `${e.tipo || ""} ${e.modelo || ""}` }))} />

          <Field label="Observações da frente" style={{ marginTop: 8 }}>
            <input style={inputStyle} value={b.obs} disabled={!podeEditar} onChange={(e) => setBloco(i, "obs", e.target.value)} placeholder="Sequência, acessos, pernoite, hospedagem…" />
          </Field>
        </div>
        );
      })}

      {podeEditar && <Btn onClick={addBloco}>+ Adicionar frente de trabalho</Btn>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn onClick={onClose}>Fechar</Btn>
        {podeEditar && <Btn kind="primary" onClick={salvar}>Salvar cronograma</Btn>}
      </div>
    </Modal>
  );
}

/* ---------- Ordem de Serviço: visualização + impressão/exportação ---------- */
function imprimirOS(os, podeCusto) {
  const linhasEquipe = os.equipe.map((d) => d.vazio
    ? `<tr><td>${d.cargo || d.papel}</td><td colspan="3" style="color:#b3402a">⚠ Sem pessoa designada (nível ≥${d.nivelMin})</td></tr>`
    : `<tr><td>${d.cargo || d.papel}</td><td><b>${d.nome}</b> (${d.mat})</td><td>${d.cargo}</td><td>${d.local}${d.dist != null ? ` · ~${d.dist} km` : ""}</td></tr>`).join("");
  const linhasAtv = os.atividades.map((a) => `<tr><td>${a.label}</td><td>${a.qtd} ${a.unid}</td></tr>`).join("");
  const alertas = os.alertas.length ? os.alertas.map((a) => `<li style="color:${a.nivel === "alto" ? "#b3402a" : "#b97d10"}">${a.txt}</li>`).join("") : "<li>Sem alertas.</li>";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>OS ${os.idgeo}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:800px;margin:24px auto;padding:0 20px;font-size:13px}
  h1{font-size:20px;color:#0f2e4d;border-bottom:3px solid #1f5c8a;padding-bottom:8px}h2{font-size:14px;color:#1f5c8a;margin-top:22px;border-bottom:1px solid #ccc;padding-bottom:4px}
  table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:12px}th{background:#e3efe6}
  .badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:bold}
  .ass{margin-top:50px;display:flex;justify-content:space-between}.ass div{border-top:1px solid #333;width:45%;text-align:center;padding-top:6px;font-size:11px}
  .meta{color:#555;font-size:11px}</style></head><body>
  <h1>Ordem de Serviço Interna — ${os.idgeo}</h1>
  <div class="meta">Gerada em ${fmtData(os.geradoEm)} · <b>GeoópS</b> — Motor de Alocação · Status: <b>${os.status}</b></div>
  <h2>Projeto</h2>
  <table><tr><td><b>Projeto</b></td><td>${os.projeto || "—"}</td><td><b>Cliente</b></td><td>${os.cliente || "—"}</td></tr>
  <tr><td><b>Local</b></td><td>${os.local || "—"}</td><td><b>Prioridade</b></td><td>${os.prioridade}</td></tr>
  <tr><td><b>Início</b></td><td>${os.inicio ? fmtData(os.inicio) : "—"}</td><td><b>Fim previsto</b></td><td>${os.fim ? fmtData(os.fim) : "—"}</td></tr></table>
  <h2>Atividades</h2><table><tr><th>Atividade</th><th>Quantidade</th></tr>${linhasAtv}</table>
  <h2>Equipe designada</h2><table><tr><th>Papel</th><th>Colaborador</th><th>Cargo</th><th>Localização · distância</th></tr>${linhasEquipe}</table>
  <h2>Logística</h2><table>
  ${os.maquina ? `<tr><td><b>Máquina</b></td><td>${os.maquina.cod} — ${os.maquina.marca || ""} ${os.maquina.modelo || ""} (${os.maquina.peso || "?"} kg)</td></tr>` : ""}
  ${os.veiculo ? `<tr><td><b>Veículo</b></td><td>${os.veiculo.placa} — ${os.veiculo.veiculo || ""}${os.veiculo.implemento ? " · impl. " + os.veiculo.implemento : ""}</td></tr>` : ""}
  ${os.motorista ? `<tr><td><b>Motorista</b></td><td>${os.motorista.nome}</td></tr>` : ""}
  <tr><td><b>Deslocamento</b></td><td>${os.maxDistEquipe != null ? `equipe a ~${os.maxDistEquipe} km da obra` : ""}${os.distMatriz != null ? ` · matriz a ~${os.distMatriz} km` : ""} · ~${os.kmTotal} km ida/volta</td></tr></table>
  ${podeCusto ? `<h2>Esforço e custo (uso interno)</h2><table>
  <tr><td><b>Dias de campo estimados</b></td><td>≈ ${os.diasCampo} dia(s)${os.parcial ? " (parcial)" : ""}</td></tr>
  <tr><td><b>Custo de pessoal</b></td><td>${fmtBRL(os.custoPessoal)}</td></tr>
  <tr><td><b>Custo de deslocamento/diárias</b></td><td>${fmtBRL(os.custoDeslocamento)}</td></tr>
  <tr><td><b>Custo total estimado</b></td><td><b>${fmtBRL(os.custoTotal)}</b></td></tr></table>` : ""}
  <h2>Alertas de conformidade</h2><ul>${alertas}</ul>
  <div class="ass"><div>Gestor responsável</div><div>Coordenador operacional</div></div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400); }
}

function OSView({ os, podeCusto, jaAprovada, aceites, papelAceite, onAceitar, onClose }) {
  const corAlerta = (n) => n === "alto" ? T.red : T.amber;
  const sec = { fontFamily: "'IBM Plex Serif', serif", fontSize: 14, color: T.green900, margin: "16px 0 6px", borderBottom: `1px solid ${T.line}`, paddingBottom: 4 };
  /* blindagem: garante arrays/objetos mesmo que o Motor não os tenha preenchido */
  const equipe = Array.isArray(os.equipe) ? os.equipe : [];
  const itensServico = Array.isArray(os.itensServico) ? os.itensServico : [];
  const alertas = Array.isArray(os.alertas) ? os.alertas : [];
  const trilha = Array.isArray(os.trilha) ? os.trilha : [];
  const vazios = equipe.filter((d) => d.vazio).length;
  return (
    <Modal title={`Ordem de Serviço — ${os.idgeo}`} onClose={onClose} wide>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: T.inkSoft }}>{os.projeto} · {os.cliente} · 📍 {os.local}</div>
        <Badge text={os.status} c={os.status === "Pendente" ? T.red : os.status === "Aprovada" ? "#fff" : T.green700} bg={os.status === "Aprovada" ? T.green700 : os.status === "Pendente" ? "#fff" : T.green100} />
      </div>

      <h4 style={sec}>👥 Equipe designada</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead><tr><th style={th}>Cargo</th><th style={th}>Colaborador</th><th style={th}>Aptidão</th><th style={th}>Localização · distância</th></tr></thead>
        <tbody>
          {equipe.map((d, i) => d.vazio ? (
            <tr key={i} style={{ background: T.redBg }}><td style={td}>{d.cargo || d.papel}</td><td style={{ ...td, color: T.red }} colSpan={3}>⚠ Sem pessoa apta (nível ≥{d.nivelMin})</td></tr>
          ) : (
            <tr key={i}>
              <td style={td}>{d.cargo || d.papel}</td>
              <td style={td}><b>{d.nome}</b> <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft, fontSize: 11 }}>{d.mat}</span><div style={{ fontSize: 11, color: T.inkSoft }}>{d.cargo}</div></td>
              <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", textAlign: "center" }}>nível {d.apt}</td>
              <td style={td}>{d.local}{d.dist != null ? <span style={{ color: T.green700 }}> · ~{Math.round(d.dist)} km</span> : <span style={{ color: T.amber }}> · sem geo</span>}</td>
            </tr>
          ))}
          {equipe.length === 0 && <tr><td style={{ ...td, color: T.inkSoft }} colSpan={4}>Nenhuma equipe designada (verifique cargos exigidos e colaboradores cadastrados).</td></tr>}
        </tbody>
      </table>

      <h4 style={sec}>🚚 Logística</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, fontSize: 12.5 }}>
        {os.maquina && <div style={{ border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px" }}>⚙️ <b>Máquina</b><div>{os.maquina.cod} — {os.maquina.marca || ""} {os.maquina.modelo || ""}</div><div style={{ fontSize: 11, color: T.inkSoft }}>{os.maquina.peso ? `${os.maquina.peso} kg` : ""}{os.maquina.plataforma ? ` · ${os.maquina.plataforma}` : ""}</div></div>}
        {os.veiculo && <div style={{ border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px" }}>🚗 <b>Veículo</b><div>{os.veiculo.placa} — {os.veiculo.veiculo || ""}</div><div style={{ fontSize: 11, color: T.inkSoft }}>{os.veiculo.implemento ? `impl. ${os.veiculo.implemento}` : (os.veiculo.tipo || "")} · CNH {os.veiculo.cnh || "—"}</div></div>}
        {os.motorista && <div style={{ border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px" }}>🪪 <b>Motorista</b><div>{os.motorista.nome}</div>{os.motorista.externo && <div style={{ fontSize: 11, color: T.amber }}>adicionado p/ conduzir</div>}</div>}
        {Array.isArray(os.equipamentos) && os.equipamentos.map((e) => (
          <div key={e.cod} style={{ border: `1px solid ${e.calibVenceNaJanela ? T.amber : T.line}`, borderRadius: 6, padding: "8px 10px", background: e.calibVenceNaJanela ? T.amberBg : "#fff" }}>
            🔬 <b>Equipamento</b><div>{e.cod} — {e.tipo || ""}</div>
            <div style={{ fontSize: 11, color: T.inkSoft }}>{e.modelo || ""}{e.paraAtividade ? ` · ${e.paraAtividade}` : ""}</div>
            {e.calibVenceNaJanela
              ? <div style={{ fontSize: 10.5, color: T.amber, fontWeight: 600 }}>⚠ calibração vence na janela{e.valCalib ? ` (val. ${fmtData(e.valCalib)})` : ""}</div>
              : <div style={{ fontSize: 10.5, color: T.green700 }}>✓ calibração válida{e.valCalib ? ` até ${fmtData(e.valCalib)}` : ""}</div>}
          </div>
        ))}
        <div style={{ border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px" }}>🛣 <b>Deslocamento</b><div>{os.maxDistEquipe != null ? `equipe ~${Math.round(os.maxDistEquipe)} km` : "—"}</div><div style={{ fontSize: 11, color: T.inkSoft }}>{os.distMatriz != null ? `matriz ~${Math.round(os.distMatriz)} km · ` : ""}~{Math.round(os.kmTotal || 0)} km i/v</div></div>
      </div>

      {podeCusto && (
        <>
          <h4 style={sec}>💰 Esforço e custo estimado do projeto</h4>
          {itensServico.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 10 }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Serviço (preço unitário)</th>
                <th style={{ ...th, textAlign: "right" }}>Qtd</th>
                <th style={{ ...th, textAlign: "right" }}>Unitário</th>
                <th style={{ ...th, textAlign: "right" }}>Subtotal</th>
              </tr></thead>
              <tbody>
                {itensServico.map((it, i) => (
                  <tr key={i}>
                    <td style={td}>{it.item}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtNum(it.qtd)} {(it.unidade || "").replace("R$/", "")}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(it.preco)}</td>
                    <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{fmtBRL(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 13, background: T.green100, color: T.green900, borderRadius: 8, padding: "12px 16px" }}>
            <span>📐 <b>≈ {os.diasCampo}</b> dia(s){os.parcial ? "*" : ""}</span>
            <span>👥 Pessoal: <b>{fmtBRL(os.custoPessoal)}</b></span>
            <span>🛣 Deslocamento: <b>{fmtBRL(os.custoDeslocamento)}</b></span>
            <span style={{ marginLeft: "auto", fontSize: 16 }}>Custo total estimado: <b style={{ fontSize: 22, color: T.green900 }}>{fmtBRL(os.custoTotal)}</b></span>
          </div>
          <div style={{ fontSize: 11.5, color: os.status === "Aprovada" ? T.green700 : T.amber, marginTop: 6, fontWeight: 600 }}>
            {os.status === "Aprovada" ? `✓ Custo aprovado pela carteira em ${os.aprovadaEm ? fmtData(os.aprovadaEm) : "—"}` : "⚠ Custo estimado pendente de aprovação da carteira (GC) responsável pelo projeto."}
          </div>
        </>
      )}

      <h4 style={sec}>⚠ Alertas de conformidade</h4>
      {alertas.length === 0 ? <div style={{ fontSize: 13, color: T.green700 }}>✓ Nenhum alerta — equipe apta e conforme.</div> : (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
          {alertas.map((a, i) => <li key={i} style={{ color: corAlerta(a.nivel), marginBottom: 3 }}>{a.txt}</li>)}
        </ul>
      )}

      <details style={{ marginTop: 12, fontSize: 12, color: T.inkSoft }}>
        <summary style={{ cursor: "pointer", color: T.green700, fontWeight: 600 }}>Trilha de decisão do Motor</summary>
        <ul style={{ marginTop: 6 }}>{trilha.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </details>

      {/* Duplo aceite: gerente de projetos + responsável pela simulação de rotas */}
      <div style={{ marginTop: 16, padding: "12px 14px", background: T.blueBg, borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, marginBottom: 8 }}>✍️ Aceite da programação sugerida pela IA</div>
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>A programação só é travada após o aceite conjunto (não necessariamente simultâneo) do gerente de projetos e do responsável pela simulação de rotas.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["gerente", "Gerente de projetos", aceites?.gerente], ["rotas", "Responsável por rotas", aceites?.rotas]].map(([k, label, ac]) => (
            <div key={k} style={{ border: `1px solid ${ac ? T.green700 : T.line}`, borderRadius: 8, padding: "10px 12px", background: ac ? T.green100 : "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.green900 }}>{label}</div>
              {ac ? (
                <div style={{ fontSize: 11.5, color: T.green700, marginTop: 4 }}>✓ Assinado por {ac.por}<div style={{ color: T.inkSoft }}>{fmtData(ac.em)}</div></div>
              ) : (papelAceite === k || papelAceite === "ambos") ? (
                <Btn small kind="primary" onClick={() => onAceitar(k)} disabled={os.status === "Pendente"} style={{ marginTop: 6 }}>Assinar aceite</Btn>
              ) : (
                <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 4 }}>Aguardando assinatura</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11.5, color: T.inkSoft }}>{vazios > 0 ? `${vazios} papel(éis) sem pessoa — resolva antes de aprovar` : jaAprovada ? "✓ Programação travada (duplo aceite completo)" : "Aguardando os dois aceites"}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => imprimirOS(os, podeCusto)}>🖨 Imprimir / PDF</Btn>
          <Btn onClick={onClose}>Fechar</Btn>
          {jaAprovada && <Badge text="✓ Aprovada — equipe travada" c="#fff" bg={T.green700} />}
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   MOTOR DE ALOCAÇÃO — núcleo de raciocínio determinístico
   Aplica as regras: aptidão -> conformidade (NR/ASO) -> proximidade -> logística -> custo
   Retorna uma proposta de Ordem de Serviço (estruturada) + alertas + trilha de decisão.
   ============================================================ */
function motorAlocar({ tap, prog, ctx }) {
  const { colaboradores, aptidoes, sms, maquinas, frota, equipamentos, equipPorAtividade, apontamentos, asos, contratos, dispDe, afastAtivo, emFerias, regrasEquipe, travas } = ctx;
  const hoje = hojeISO();
  const localObra = (prog && prog.local) || tap.cidade || "";
  const inicio = (prog && prog.inicioPrev) || tap.entradaCampo || "";
  const fim = (prog && prog.fimPrev) || tap.entregaRelatorio || "";
  /* contrato da obra: cruza CNPJ/cliente da TAP com a lista de contratos (para checar ASO por contrato) */
  const contratoObra = (contratos || []).find((c) => (tap.cnpj && c.cnpj === tap.cnpj) || (tap.cliente && c.cliente === tap.cliente)) || null;
  const condObra = (contratoObra && ctx.condicionantes && ctx.condicionantes[contratoObra.contrato]) || null;
  const trilha = [];
  const alertas = [];

  /* 1. Demanda: cargos exigidos pelas regras das atividades programadas.
     Cada exigência guarda o cargo, o nível mínimo e EM QUAL atividade (aptidão) esse nível é medido. */
  const atividades = (prog && prog.atividades || []).filter((a) => +a.qtd > 0);
  const exigencias = {}; // chave cargo -> { cargo, qtd, nivelMin, comps:Set(aptidões das atividades) }
  let exigeRespTec = false;
  const ativSemRegra = [];
  atividades.forEach((a) => {
    const r = normalizarRegra(regrasEquipe[a.id]);
    if (!r || !r.cargos || r.cargos.length === 0) {
      ativSemRegra.push((ATIVIDADES.find((x) => x.id === a.id) || {}).short || a.id);
      return;
    }
    if (r.exigeRespTec) exigeRespTec = true;
    r.cargos.forEach((cg) => {
      if (!cg.cargo || +cg.qtd <= 0) return;
      const cur = exigencias[cg.cargo] || { cargo: cg.cargo, qtd: 0, nivelMin: 0, comps: new Set() };
      cur.qtd = Math.max(cur.qtd, cg.qtd);            // cargo compartilhável entre atividades
      cur.nivelMin = Math.max(cur.nivelMin, cg.nivelMin);
      cur.comps.add(a.id);                            // nível medido na aptidão DESTA atividade
      exigencias[cg.cargo] = cur;
    });
  });
  if (ativSemRegra.length) alertas.push({ nivel: "alto", txt: `Sem regra de equipe para: ${ativSemRegra.join(", ")}. Cadastre os cargos exigidos por estas atividades em Planejamento → Regras de equipe para o Motor montar a equipe.` });
  const cargosExigidos = Object.values(exigencias);
  trilha.push(`Demanda: ${atividades.length} atividade(s) → ${cargosExigidos.length} cargo(s) exigido(s)${exigeRespTec ? " + responsável técnico" : ""}.`);

  /* 2. Pool de candidatos: ativos, não desligados, sem férias/afastamento na janela */
  const naJanela = (mat) => {
    const d = dispDe(mat);
    const ferias = (d.ferias || []).some((f) => f.ini && f.fim && !(fim && f.ini > fim) && !(inicio && f.fim < inicio));
    const afast = (d.afastamentos || []).some((f) => f.ini && !(fim && f.ini > fim) && !(inicio && f.fim && f.fim < inicio));
    return !ferias && !afast;
  };
  const nivelEm = (mat, comp) => NIVEL_NUM[(aptidoes[mat]?.matriz || {})[comp]] || 0;
  /* melhor nível da pessoa entre as aptidões das atividades exigidas para aquele cargo */
  const aptidaoNasAtividades = (mat, comps) => {
    const arr = [...comps];
    if (arr.length === 0) return 0;
    return arr.reduce((mx, c) => Math.max(mx, nivelEm(mat, c)), 0);
  };
  /* SMS: NR-35 e ASO/Fit como travas; retorna lista de pendências */
  const pendenciasSms = (mat) => {
    const s = sms[mat] || {};
    const pend = [];
    const checa = (id, label) => {
      const rec = s[id];
      if (!rec || rec.na) return; // não exigido aqui
      if (!rec.val) { pend.push(`${label} sem validade`); return; }
      if (rec.val < hoje) pend.push(`${label} vencida (${fmtData(rec.val)})`);
      else if (inicio && rec.val < inicio) pend.push(`${label} vence antes do campo (${fmtData(rec.val)})`);
    };
    checa("nr35", "NR-35");
    checa("fittest", "Fit Test");
    /* ASO específico do contrato da obra (ponta #2): se há contrato identificado, valida o ASO da pessoa para ele */
    if (contratoObra) {
      const aso = ((asos || {})[mat] || {})[contratoObra.contrato];
      if (!aso || !aso.val) pend.push(`ASO do contrato ${contratoObra.contrato} não registrado`);
      else if (aso.val < hoje) pend.push(`ASO do contrato vencido (${fmtData(aso.val)})`);
      else if (inicio && aso.val < inicio) pend.push(`ASO do contrato vence antes do campo (${fmtData(aso.val)})`);
    }
    return pend;
  };

  /* Não-conformidades recentes por pessoa (sinal do RDO, ponta 04):
     conta NCs dos últimos 90 dias nos projetos em que a pessoa esteve alocada. */
  const ncPorPessoa = (() => {
    const idx = {};
    const limite = (() => { const d = new Date(hoje); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10); })();
    const ords = (ctx.ordens) || {};
    Object.entries(apontamentos || {}).forEach(([idgeo, lst]) => {
      const ncs = (lst || []).filter((ap) => ap && ap.naoConforme && (ap.data || "") >= limite).length;
      if (!ncs) return;
      const os = ords[idgeo];
      (os?.equipe || []).forEach((p) => { if (!p.vazio && p.mat) idx[p.mat] = (idx[p.mat] || 0) + ncs; });
    });
    return idx;
  })();

  /* 3. Designação por papel: escolhe melhores aptos + mais próximos */
  const designados = [];
  const usados = new Set();
  /* 3. Designação por papel: score ponderado pela escala de valores (pesos do executivo) */
  const W = (prog.executivo && prog.executivo.pesos) || PESOS_PADRAO;
  const maxDistRef = 500; // normalizador de distância (km)
  /* score 0..1 ponderado: qualidade(aptidão), proximidade, conformidade — quanto maior, melhor */
  const scoreCand = (x) => {
    const sQualidade = (x.apt || 0) / 4;                              // 0..1
    let sProx = x.dist == null ? 0.3 : Math.max(0, 1 - x.dist / maxDistRef); // perto=1
    if (x.posicaoVelha) sProx = sProx * 0.6 + 0.3 * 0.4;             // posição desatualizada: confia menos na proximidade (puxa para o neutro)
    const sConf = (() => {
      let base = x.pend.length === 0 ? 1 : Math.max(0, 1 - x.pend.length * 0.34); // pendências SMS reduzem, não zeram
      if (x.ncRecente) base = base * Math.max(0.5, 1 - x.ncRecente * 0.1);          // não-conformidade recente (RDO) reduz levemente, piso 0.5
      return base;
    })();
    const sDisp = x.disp ? 1 : 0.15;                                  // indisponível na janela penaliza forte mas não elimina
    const sViagem = x.dispViagem === "consulta" ? 0.6 : 1;            // "sob consulta" entra penalizado; "sim" pleno ("indisponível" já foi excluído no filtro)
    const wQ = +W.qualidade || 0, wP = +W.proximidade || 0, wR = +W.rota || 0, wC = +W.conformidade || 0;
    const somaW = wQ + wP + wR + wC || 1;
    return (sQualidade * wQ + sProx * (wP + wR) / 2 * 2 + sConf * wC) / somaW * sDisp * sViagem;
  };
  const ehAuxiliar = (cargo) => /auxiliar/i.test(cargo || ""); // auxiliares: aptos só por ter o cargo
  /* Casamento ROBUSTO de cargo: ignora acentos, maiúsculas, espaços e plurais, e reconhece o núcleo
     do cargo (ex.: "Operador de Sondagem", "OPERADOR SONDAGEM", "Sondador" → casam). Evita equipe vazia
     por divergência de grafia entre a regra e o cadastro importado. */
  const normCargo = (s) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const NUCLEO_CARGO = [
    { chave: "sondador", termos: ["sondador", "operador de sondagem", "operador sondagem", "sondagem"] },
    { chave: "auxiliar", termos: ["auxiliar"] },
    { chave: "tecnico esp", termos: ["especialista", "tecnico especialista", "especialista tecnico"] },
    { chave: "tecnico", termos: ["tecnico de operacoes", "tecnico operacoes", "tecnico", "amostrador", "topografo", "tecnico em meio ambiente"] },
    { chave: "encarregado", termos: ["encarregado"] },
    { chave: "operador", termos: ["operador"] },
    { chave: "geologo", termos: ["geologo"] },
    { chave: "engenheiro", termos: ["engenheiro"] },
  ];
  const nucleoDe = (cargo) => {
    const n = normCargo(cargo);
    // especialista antes de técnico genérico para não confundir
    if (/especialista/.test(n)) return "tecnico esp";
    for (const g of NUCLEO_CARGO) if (g.termos.some((t) => n.includes(t))) return g.chave;
    return n; // fallback: o próprio nome normalizado
  };
  const cargoCasa = (cargoColab, cargoReq) => {
    if (!cargoColab || !cargoReq) return false;
    if (normCargo(cargoColab) === normCargo(cargoReq)) return true; // exato (normalizado)
    return nucleoDe(cargoColab) === nucleoDe(cargoReq);             // mesmo núcleo
  };
  cargosExigidos.forEach((req) => {
    const auxExcecao = ehAuxiliar(req.cargo);
    for (let n = 0; n < req.qtd; n++) {
      const candidatos = colaboradores
        .filter((c) => c.status !== "Desligado" && !usados.has(c.mat) && cargoCasa(c.cargo, req.cargo))
        .filter((c) => (c.dispViagem || "sim") !== "indisponivel") // toda obra exige viagem: "indisponível" nunca é sugerido
        .map((c) => {
          const apt = auxExcecao ? Math.max(1, aptidaoNasAtividades(c.mat, req.comps)) : aptidaoNasAtividades(c.mat, req.comps);
          const d = dispDe(c.mat);
          const dist = d.localAtual ? distEntreCidades(d.localAtual, localObra) : null;
          const diasPos = diasDesde(d.dataLocal);                         // idade da posição em dias (null se sem data)
          const posicaoVelha = dist != null && diasPos != null && diasPos > 2; // >2 dias = mesma régua da aba Localização
          const cand = { c, apt, dist, diasPos, posicaoVelha, disp: naJanela(c.mat), pend: pendenciasSms(c.mat), ncRecente: ncPorPessoa[c.mat] || 0, local: d.localAtual || "—", dispViagem: c.dispViagem || "sim" };
          cand.score = scoreCand(cand);
          return cand;
        })
        .filter((x) => auxExcecao || x.apt >= req.nivelMin) // auxiliar: basta o cargo; demais: nível na aptidão
        .sort((a, b) => b.score - a.score); // maior score ponderado vence
      const esc = candidatos[0];
      if (!esc) {
        alertas.push({ nivel: "alto", txt: `Sem candidato para ${req.qtd}× ${req.cargo} (nível ≥${req.nivelMin} na aptidão da atividade). Pode faltar quem esteja disponível para viagem — verifique a aba Equipe.` });
        designados.push({ papel: req.cargo, cargo: req.cargo, nivelMin: req.nivelMin, vazio: true });
        continue;
      }
      usados.add(esc.c.mat);
      /* pendências e indisponibilidade viram ALERTAS, não travas — não impedem a programação */
      if (!esc.disp) alertas.push({ nivel: "medio", txt: `${esc.c.nome}: indisponível na janela (férias/afastamento) — escolhido por ser a melhor opção ponderada. Validar substituição.` });
      if (esc.dispViagem === "consulta") alertas.push({ nivel: "medio", txt: `${esc.c.nome}: disponibilidade de viagem sob consulta — confirmar viagem antes de mobilizar.` });
      if (esc.posicaoVelha) alertas.push({ nivel: "baixo", txt: `${esc.c.nome}: posição "${esc.local}" registrada há ${esc.diasPos} dias — confirmar localização antes de calcular deslocamento.` });
      if (esc.ncRecente) alertas.push({ nivel: "baixo", txt: `${esc.c.nome}: ${esc.ncRecente} não conformidade(s) registrada(s) no campo nos últimos 90 dias — atenção redobrada na supervisão.` });
      esc.pend.forEach((p) => alertas.push({ nivel: "medio", txt: `${esc.c.nome}: ${p} — regularizar antes do campo (não bloqueia a programação).` }));
      if (esc.dist == null) alertas.push({ nivel: "baixo", txt: `${esc.c.nome}: localização "${esc.local}" não geocodificada — distância não calculada.` });
      designados.push({ papel: req.cargo, cargo: esc.c.cargo, nivelMin: req.nivelMin, mat: esc.c.mat, nome: esc.c.nome, apt: esc.apt, dist: esc.dist, local: esc.local, custo: esc.c.custoTotal, pendencias: esc.pend || [], dispViagem: esc.dispViagem, confirmarViagem: esc.dispViagem === "consulta", posicaoVelha: !!esc.posicaoVelha, diasPos: esc.diasPos, ncRecente: esc.ncRecente || 0, score: +esc.score.toFixed(2) });
    }
  });
  trilha.push(`Escala de valores aplicada — qualidade:${W.qualidade} · custo:${W.custo} · rota:${W.rota} · tempo:${W.tempo} · proximidade:${W.proximidade} · conformidade:${W.conformidade}.`);
  if (exigeRespTec) {
    const rt = designados.find((d) => !d.vazio && (aptidoes[d.mat]?.matriz?.descricao_solo || colaboradores.find((c) => c.mat === d.mat)?.cargo?.match(/ge[oó]logo|engenheiro/i)));
    if (!rt) alertas.push({ nivel: "alto", txt: "Atividade exige responsável técnico de campo (geólogo/engenheiro) — confirme que há um na equipe." });
    else trilha.push(`Responsável técnico: ${rt.nome}.`);
  }

  /* 4. Logística: máquina -> implemento -> veículo -> motorista */
  const precisaSonda = atividades.some((a) => ["esteira_geoprobe", "esteira_biosonda", "sond_caminhao", "poco_monit", "descricao_solo", "tamponamento", "mip_hpt", "oip_hpt"].includes(a.id));
  let maquinaSel = null, veiculoSel = null, motoristaSel = null;
  const logAlertas = [];
  if (precisaSonda) {
    const maqAptas = maquinas.filter((m) => /dispon/i.test(m.status || "") || !m.status);
    maquinaSel = maqAptas[0] || maquinas[0] || null;
    if (maquinaSel && !/dispon/i.test(maquinaSel.status || "")) logAlertas.push(`Máquina ${maquinaSel.cod} está "${maquinaSel.status}" — verificar disponibilidade.`);
    /* veículo: capacidade de implemento >= peso da máquina, status disponível */
    const peso = +maquinaSel?.peso || 0;
    const veicApto = frota.find((v) => /dispon/i.test(v.status || "") && (+v.capImplemento || +v.capCargaKg || 0) >= peso);
    veiculoSel = veicApto || frota.find((v) => /dispon/i.test(v.status || "")) || frota[0] || null;
    if (veiculoSel && peso && (+veiculoSel.capImplemento || +veiculoSel.capCargaKg || 0) < peso) logAlertas.push(`Veículo ${veiculoSel.placa} pode não comportar ${maquinaSel.cod} (${peso} kg).`);
    /* motorista: alguém da equipe com CNH compatível, ou Edson/motorista */
    const cnhNec = veiculoSel?.cnh || "B";
    const motNaEquipe = designados.find((d) => !d.vazio && ["D", "E"].includes((aptidoes[d.mat]?.cnhCat || "")));
    motoristaSel = motNaEquipe || null;
    if (!motoristaSel) {
      const motExterno = colaboradores.find((c) => /motorista/i.test(c.cargo || "") && c.status !== "Desligado");
      if (motExterno) { motoristaSel = { mat: motExterno.mat, nome: motExterno.nome, externo: true }; logAlertas.push(`Motorista ${motExterno.nome} adicionado para conduzir ${veiculoSel?.placa} (CNH ${cnhNec}).`); }
      else logAlertas.push(`Nenhum motorista com CNH ${cnhNec} disponível para o veículo.`);
    }
  } else {
    veiculoSel = frota.find((v) => /dispon/i.test(v.status || "") && /camionete|leve|carro/i.test(v.tipo || "")) || frota.find((v) => /dispon/i.test(v.status || "")) || null;
    trilha.push("Sem sondagem no escopo → veículo leve de apoio, sem máquina pesada.");
  }
  logAlertas.forEach((t) => alertas.push({ nivel: "medio", txt: t }));

  /* 4b. Equipamentos: para cada atividade do escopo, seleciona um item do TIPO necessário.
     Prefere calibração válida em toda a janela (valCalib >= fim); senão, pega o melhor e alerta. */
  const equipamentosSel = [];
  const tiposJaAlocados = new Set();
  const mapaEquip = equipPorAtividade || {}; // matriz cadastrável atividade→[palavras-chave]; vazia até o usuário alimentar
  const fimJanela = (ctx.janelaSimulada && ctx.janelaSimulada.fim) || fim || inicio;
  atividades.forEach((a) => {
    const chaves = mapaEquip[a.id];
    if (!chaves || !chaves.length) return;
    const chaveTipo = chaves.join("|");
    if (tiposJaAlocados.has(chaveTipo)) return; // não duplica o mesmo tipo de equipamento
    const candidatos = (equipamentos || []).filter((e) => {
      const tipo = (e.tipo || "").toLowerCase();
      const estadoOk = !/inativ|manuten/i.test(e.estado || "");
      return estadoOk && chaves.some((k) => tipo.includes(k.toLowerCase()));
    });
    if (!candidatos.length) return; // sem equipamento desse tipo cadastrado — segue sem travar
    const calibValida = (e) => e.valCalib && fimJanela && e.valCalib >= fimJanela;
    const comCalib = candidatos.filter(calibValida);
    const escolhido = comCalib[0] || candidatos[0];
    const calibVenceNaJanela = !calibValida(escolhido);
    equipamentosSel.push({
      cod: escolhido.cod, tipo: escolhido.tipo, modelo: escolhido.modelo,
      valCalib: escolhido.valCalib, calibVenceNaJanela, paraAtividade: (ATIVIDADES.find((x) => x.id === a.id) || {}).short || a.id,
    });
    tiposJaAlocados.add(chaveTipo);
    if (calibVenceNaJanela) alertas.push({ nivel: "medio", txt: `Equipamento ${escolhido.cod} (${escolhido.tipo}): calibração vence dentro da janela do projeto — providenciar recalibração antes do campo.` });
  });

  /* 5. Rota / deslocamento: distância da matriz e da equipe até a obra */
  const distMatriz = distEntreCidades(MATRIZ_GEO.n, localObra);
  const distEquipe = designados.filter((d) => !d.vazio && d.dist != null).map((d) => d.dist);
  const maxDistEquipe = distEquipe.length ? Math.max(...distEquipe) : null;

  /* 6. Esforço e custo — preços unitários (matriz) + diárias de apoio */
  const P = ctx.custos || {};
  const precos = ctx.precosUnitarios || [];
  let diasCampo = 0, parcial = false;
  const PD = ctx.produtividade || PROD_DIA;
  const SEM_META = ["remediacao_oper"]; // atividades recorrentes — não entram no cálculo de dias de campo
  atividades.forEach((a) => {
    if (SEM_META.includes(a.id)) return; // recorrente: ignorada na estimativa de dias
    const p = PD[a.id] || PROD_DIA[a.id];
    if (p) diasCampo += Math.ceil(+a.qtd / (p * Math.max(1, +prog.equipes || 1))); else parcial = true;
  });
  const pessoasValidas = designados.filter((d) => !d.vazio);
  const nPess = pessoasValidas.length;
  const kmTotal = (maxDistEquipe != null ? maxDistEquipe : distMatriz || 0) * 2;
  /* 6a. Custo direto por preços unitários: cruza qtd da atividade × preço do item de custo correspondente */
  const itensServico = [];
  let cServicos = 0;
  atividades.forEach((a) => {
    const atv = ATIVIDADES.find((x) => x.id === a.id);
    const nomeAtv = norm(atv ? atv.label : a.id);
    /* encontra o preço unitário cujo nome do item mais se aproxima da atividade */
    const pu = precos.find((p) => { const ni = norm(p.item); return ni && (nomeAtv.includes(ni) || ni.includes(nomeAtv.split(" ")[0])); });
    if (pu && +pu.preco > 0 && +a.qtd > 0) {
      const subtotal = +pu.preco * +a.qtd;
      cServicos += subtotal;
      itensServico.push({ item: pu.item, unidade: pu.unidade, qtd: +a.qtd, preco: +pu.preco, subtotal });
    }
  });
  /* mobilização por km (preço unitário R$/km, se existir na matriz) */
  const puKm = precos.find((p) => /mobiliza|transporte/i.test(p.item) && /km/i.test(p.unidade));
  const cMobilizacao = (puKm ? +puKm.preco : (P.kmRodado || 0)) * kmTotal;
  if (puKm && kmTotal > 0) itensServico.push({ item: puKm.item, unidade: puKm.unidade, qtd: kmTotal, preco: +puKm.preco, subtotal: cMobilizacao });
  /* 6b. Custo de PESSOAL por HH no período: custo mensal ÷ dias úteis do mês × dias de campo */
  const DIAS_UTEIS_MES = P.diasUteisMes || 22;
  const cPessoas = pessoasValidas.reduce((s, d) => s + ((+d.custo || 0) / DIAS_UTEIS_MES) * diasCampo, 0);
  /* 6c. Custo de DESLOCAMENTO unificado (simplificação): um único R$/km rodado (kmRodado),
     cobrindo combustível + desgaste rateado. km total = ida/volta da base (Curitiba) + deslocamentos diários na frente.
     Mesma régua usada no custo REALIZADO do RDO, para orçado e realizado falarem a mesma língua. */
  const BASE = MATRIZ_GEO.n; // Curitiba (matriz)
  const distBaseObra = distEntreCidades(BASE, localObra) || 0;
  const kmRodadoR = P.kmRodado || 2.8; // R$/km canônico
  const kmCampo = diasCampo * (P.kmDiarioCampo || 20); // deslocamentos diários na frente
  const kmDeslocTotal = distBaseObra * 2 + kmCampo; // ida/volta da base + rodagem em campo
  const cRodagem = kmDeslocTotal * kmRodadoR;
  const cVeiculos = (precisaSonda ? (P.veiculoPesadoDia || 0) : (P.veiculoLeveDia || 0)) * diasCampo;
  const cDepreciacao = (maquinaSel ? (P.deprMaquinaDia || 0) : 0) * diasCampo + (P.deprEquipamentoDia || 0) * diasCampo;
  const cHospedagem = (distBaseObra > 80 ? (P.hospedagemPessoaDia || 0) : 0) * nPess * diasCampo;
  const cAlimentacao = (P.alimentacaoPessoaDia || 0) * nPess * diasCampo;
  const cMateriais = (P.materiaisDiaEquipe || 0) * diasCampo;
  const custoCategorias = { servicos: cServicos, pessoas: cPessoas, deslocamento: cRodagem, veiculos: cVeiculos + cMobilizacao, materiais: cMateriais, depreciacao: cDepreciacao, hospedagem: cHospedagem, alimentacao: cAlimentacao };
  const custoTotal = Object.values(custoCategorias).reduce((s, v) => s + v, 0);
  if (cServicos === 0 && atividades.length > 0) alertas.push({ nivel: "medio", txt: "Nenhuma atividade casou com a matriz de preços unitários — verifique os itens de custo na aba 💵 Custos & Parâmetros." });
  /* compat. com campos antigos usados na OS */
  const custoPessoal = cPessoas;
  const custoDeslocamento = cRodagem + cVeiculos + cMobilizacao + cHospedagem + cAlimentacao;

  /* 7. Conformidade contratual (docs do CNPJ) - aviso se houver vencidos seria cruzado fora; aqui um lembrete */
  if (tap.urgente15) alertas.push({ nivel: "medio", txt: "TAP marcado como entrada em campo < 15 dias — priorizar mobilização." });

  const vazios = designados.filter((d) => d.vazio).length;
  const status = vazios > 0 ? "Pendente" : "Pronta para aprovação"; // conformidade não bloqueia; só falta de equipe

  /* ---- Status temporal: consulta os calendários de trava na janela do projeto (ou simulada) ---- */
  const tv = travas || {};
  const janIni = (ctx.janelaSimulada && ctx.janelaSimulada.ini) || inicio;
  const janFim = (ctx.janelaSimulada && ctx.janelaSimulada.fim) || fim;
  /* Condicionantes do contrato (ponta #1): prazos contratuais e restrições do serviço */
  if (condObra) {
    if (condObra.prazoIni && janIni && janIni < condObra.prazoIni) alertas.push({ nivel: "alto", txt: `Janela inicia ${fmtData(janIni)}, antes do prazo contratual de início (${fmtData(condObra.prazoIni)}). Ajustar a entrada em campo.` });
    if (condObra.prazoFim && janFim && janFim > condObra.prazoFim) alertas.push({ nivel: "alto", txt: `Janela termina ${fmtData(janFim)}, depois do prazo contratual de finalização (${fmtData(condObra.prazoFim)}). Risco de descumprimento de prazo.` });
    if (condObra.condicoes && condObra.condicoes.trim()) alertas.push({ nivel: "medio", txt: `Restrições do contrato a observar: ${condObra.condicoes.trim()}` });
  }
  const statusRec = (tipo, idRec) => statusNaJanela(((tv[tipo] || {})[idRec]) || [], janIni, janFim);
  /* anexa status a cada pessoa da equipe */
  const equipeComStatus = designados.map((d) => d.vazio ? d : { ...d, dispJanela: statusRec("pessoa", d.mat) });
  const maqComStatus = maquinaSel ? { ...maquinaSel, dispJanela: statusRec("maquina", maquinaSel.cod) } : maquinaSel;
  const veicComStatus = veiculoSel ? { ...veiculoSel, dispJanela: statusRec("frota", veiculoSel.placa) } : veiculoSel;
  const equipComStatus = equipamentosSel.map((e) => ({ ...e, dispJanela: statusRec("equipamento", e.cod) }));

  return {
    idgeo: tap.idgeo, projeto: tap.projeto, cliente: tap.cliente, local: localObra, inicio, fim, prioridade: prog?.prioridade || "Média",
    janelaIni: janIni, janelaFim: janFim,
    atividades: atividades.map((a) => ({ ...a, label: (ATIVIDADES.find((x) => x.id === a.id) || {}).short })),
    equipe: equipeComStatus, exigeRespTec,
    maquina: maqComStatus, veiculo: veicComStatus, motorista: motoristaSel, precisaSonda, equipamentos: equipComStatus,
    distMatriz, maxDistEquipe, kmTotal,
    diasCampo, parcial, custoPessoal, custoDeslocamento, custoTotal, custoCategorias, itensServico,
    alertas, trilha, status, geradoEm: hoje,
  };
}

/* ---------- Mapa logístico com Leaflet + OpenStreetMap (gratuito, sem API key) ---------- */
function LeafletMapa({ grupos, matriz }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [estado, setEstado] = useState("carregando"); // carregando | pronto | offline

  /* carrega o Leaflet (CSS+JS) sob demanda, uma vez */
  useEffect(() => {
    let cancelado = false;
    const garantir = () => new Promise((resolve, reject) => {
      if (window.L) return resolve(window.L);
      if (!document.querySelector('link[data-leaflet]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        css.setAttribute("data-leaflet", "1");
        document.head.appendChild(css);
      }
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.async = true;
      s.onload = () => resolve(window.L);
      s.onerror = () => reject(new Error("falha ao carregar Leaflet"));
      document.body.appendChild(s);
    });
    const timeout = setTimeout(() => { if (!cancelado && !window.L) setEstado("offline"); }, 6000);
    garantir().then((L) => {
      if (cancelado || !ref.current) return;
      clearTimeout(timeout);
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18, attribution: '© OpenStreetMap',
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      setEstado("pronto");
    }).catch(() => { if (!cancelado) setEstado("offline"); });
    return () => { cancelado = true; clearTimeout(timeout); };
  }, []);

  /* (re)desenha marcadores quando os dados mudam */
  useEffect(() => {
    const L = window.L;
    if (estado !== "pronto" || !L || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    const comCoords = grupos.filter((g) => g.coords);
    const bounds = [matriz.c];

    /* matriz */
    const estrela = L.divIcon({ className: "", html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">★</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker(matriz.c, { icon: estrela, zIndexOffset: 1000 }).addTo(layerRef.current).bindPopup(`<b>${matriz.n}</b><br/>Sede / ponto de partida logístico`);

    comCoords.forEach((g) => {
      bounds.push(g.coords);
      const np = g.pessoas.length, nv = g.veics.length;
      const cor = np > 0 ? "#1F5C8A" : "#2B5D8A";
      const raio = 12 + Math.min(14, (np + nv) * 1.8);
      const html = `<div style="position:relative;width:${raio * 2}px;height:${raio * 2}px">
        <div style="position:absolute;inset:0;border-radius:50%;background:${cor};opacity:.88;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font:700 ${np > 0 ? 13 : 11}px 'IBM Plex Mono',monospace">${np > 0 ? np : "🚛"}</div>
        ${nv > 0 && np > 0 ? `<div style="position:absolute;right:-4px;top:-4px;width:16px;height:16px;border-radius:3px;background:#2B5D8A;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font:700 9px monospace">${nv}</div>` : ""}
      </div>`;
      const icon = L.divIcon({ className: "", html, iconSize: [raio * 2, raio * 2], iconAnchor: [raio, raio] });
      const linhas = [
        `<b>${g.cidade}</b>`,
        g.dist != null ? `≈ ${g.dist} km da matriz` : "",
        np > 0 ? `<b>${np}</b> pessoa(s): ${g.pessoas.map((p) => p.nome).join(", ")}` : "",
        nv > 0 ? `<b>${nv}</b> veículo(s): ${g.veics.map((v) => v.placa).join(", ")}` : "",
      ].filter(Boolean).join("<br/>");
      L.marker(g.coords, { icon }).addTo(layerRef.current).bindPopup(linhas);
      /* linha tracejada matriz -> cidade */
      if (g.key !== normCity(matriz.n)) {
        L.polyline([matriz.c, g.coords], { color: "#9BB0A6", weight: 1.5, dashArray: "5 6", opacity: 0.8 }).addTo(layerRef.current);
      }
    });

    if (bounds.length > 1) mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    else mapRef.current.setView(matriz.c, 6);
    setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 100);
  }, [grupos, matriz, estado]);

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, marginBottom: 14, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900 }}>Mapa logístico — equipes e frota em campo</span>
        <span style={{ fontSize: 11.5, color: T.inkSoft }}>★ Matriz Curitiba · ● pessoas · ■ veículos · OpenStreetMap</span>
      </div>
      <div style={{ position: "relative" }}>
        <div ref={ref} style={{ height: 440, width: "100%", background: "#EAEFEA" }} />
        {estado !== "pronto" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: "#EAEFEA", textAlign: "center", padding: 24 }}>
            {estado === "carregando" ? (
              <>
                <div style={{ fontSize: 13.5, color: T.green900, fontWeight: 600 }}>Carregando mapa…</div>
                <div style={{ fontSize: 12, color: T.inkSoft }}>OpenStreetMap via Leaflet</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28 }}>🗺</div>
                <div style={{ fontSize: 13.5, color: T.green900, fontWeight: 600 }}>Mapa indisponível no preview</div>
                <div style={{ fontSize: 12, color: T.inkSoft, maxWidth: 460 }}>
                  O mapa OpenStreetMap precisa de acesso à internet, que é bloqueado no ambiente de pré-visualização.
                  Ele funcionará normalmente quando o GeoópS estiver publicado (Vercel). Enquanto isso, use o quadro abaixo, que mostra as mesmas posições e distâncias.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Regras de Composição de Equipe: editor por atividade ---------- */
function RegraEditor({ atv, inicial, cargosLista, onSalvar, onReset, onClose }) {
  const cargos = (cargosLista && cargosLista.length) ? cargosLista : CARGOS_BASE;
  const [r, setR] = useState(() => {
    const base = normalizarRegra(inicial);
    return { cargos: base.cargos || [], exigeRespTec: !!base.exigeRespTec };
  });
  const setCargo = (i, k, v) => setR({ ...r, cargos: r.cargos.map((p, j) => j === i ? { ...p, [k]: v } : p) });
  const addCargo = () => {
    const usados = r.cargos.map((c) => c.cargo);
    const disp = cargos.find((c) => !usados.includes(c)) || cargos[0];
    setR({ ...r, cargos: [...r.cargos, { cargo: disp, nivelMin: 1, qtd: 1 }] });
  };
  const rmCargo = (i) => setR({ ...r, cargos: r.cargos.filter((_, j) => j !== i) });
  const total = r.cargos.reduce((s, p) => s + (+p.qtd || 0), 0);

  return (
    <Modal title={`Regra de equipe — ${atv.short}`} onClose={onClose} wide>
      <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 4 }}>{atv.label}</div>
      <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14, background: T.blueBg, borderRadius: 8, padding: "10px 12px" }}>
        Defina quais <b>cargos</b> compõem a equipe desta atividade e, para cada um, o <b>nível mínimo de experiência</b> exigido na aptidão desta atividade (medido na Matriz de Aptidões) e a <b>quantidade</b> de pessoas.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 0.8fr auto", gap: 8, alignItems: "center", fontSize: 11.5, color: T.inkSoft, fontWeight: 600, padding: "0 2px 4px" }}>
        <span>Cargo</span><span>Nível mínimo (na aptidão da atividade)</span><span>Qtd.</span><span></span>
      </div>
      {r.cargos.length === 0 && (
        <div style={{ border: `1px dashed ${T.line}`, borderRadius: 8, padding: 16, textAlign: "center", fontSize: 13, color: T.inkSoft }}>
          Nenhum cargo definido. Adicione os cargos que compõem a equipe desta atividade.
        </div>
      )}
      {r.cargos.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 0.8fr auto", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.line}` }}>
          <select style={{ ...inputStyle, padding: "6px 8px" }} value={p.cargo} onChange={(e) => setCargo(i, "cargo", e.target.value)}>
            {cargos.map((cg) => <option key={cg} value={cg}>{cg}</option>)}
          </select>
          <select style={{ ...inputStyle, padding: "6px 8px" }} value={p.nivelMin} onChange={(e) => setCargo(i, "nivelMin", +e.target.value)}>
            {NIVEIS.map((n) => <option key={n.id} value={n.short}>{n.short} — {n.label}</option>)}
          </select>
          <input type="number" min="1" max="9" style={{ ...inputStyle, padding: "6px 8px" }} value={p.qtd} onChange={(e) => setCargo(i, "qtd", +e.target.value)} />
          <button onClick={() => rmCargo(i)} title="Remover" style={{ border: "none", background: "transparent", color: T.red, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
      <div style={{ marginTop: 10 }}><Btn small onClick={addCargo}>+ Adicionar cargo</Btn></div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13, cursor: "pointer" }}>
        <input type="checkbox" checked={!!r.exigeRespTec} onChange={(e) => setR({ ...r, exigeRespTec: e.target.checked })} />
        Exige <b>responsável técnico de campo</b> (geólogo ou engenheiro) acompanhando a atividade
      </label>

      <div style={{ background: T.green100, color: T.green900, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginTop: 14 }}>
        👥 Equipe mínima para esta atividade: <b>{total} pessoa(s)</b>{r.exigeRespTec ? " + responsável técnico" : ""}.
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 4 }}>O Motor alocará, para cada cargo, colaboradores com aquele cargo que atinjam o nível mínimo na aptidão desta atividade, além de NRs e ASO válidos.</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <Btn onClick={() => { onReset(atv.id); onClose(); }}>↺ Restaurar padrão</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn kind="primary" onClick={() => { onSalvar(atv.id, { cargos: r.cargos, exigeRespTec: r.exigeRespTec }); onClose(); }}>Salvar regra</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Painel do gerente: caixa de solicitação de revisão ---------- */
function RevisaoBox({ idgeo, revisoes, onSolicitar }) {
  const [txt, setTxt] = useState("");
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      {revisoes.length > 0 && (
        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 6 }}>
          {revisoes.map((r, i) => <div key={i}>📝 <b>{r.por}</b> ({fmtData(r.em)}): {r.texto} <Badge text={r.status} c={T.amber} bg={T.amberBg} /></div>)}
        </div>
      )}
      {!aberto ? (
        <Btn small onClick={() => setAberto(true)}>✍ Solicitar revisão / alteração</Btn>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical", fontSize: 12.5 }} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Descreva a revisão solicitada: prazo, equipe, custo, escopo…" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Btn small kind="primary" onClick={() => { onSolicitar(idgeo, txt); setTxt(""); setAberto(false); }}>Enviar</Btn>
            <Btn small onClick={() => { setTxt(""); setAberto(false); }}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Cartão de login (por aba/matriz) ---------- */
function LoginCard({ erro, onEntrar }) {
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const grupos = [
    ["Acesso total", ACESSOS.filter((a) => a.tipo === "master")],
    ["Matrizes do sistema (alimentação)", ACESSOS.filter((a) => a.tipo === "alimentador")],
    ["Gerentes de carteira", ACESSOS.filter((a) => a.tipo === "gerente")],
  ];
  const sel = ACESSOS.find((a) => a.id === id);
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "32px 34px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 33, color: T.green900, fontWeight: 800, letterSpacing: -0.5, margin: "0 0 2px" }}>GeoópS</h1>
        <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 13, color: T.green700, marginBottom: 4 }}>Sistema de Gestão Operacional Inteligente</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: 1.5, color: T.green700 }}>www.geoops.ia.br · GEOAMBIENTE S/A</div>
      </div>
      <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, margin: "10px 0 2px", fontWeight: 600 }}>Acesso ao sistema</h2>
      <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 0 }}>Selecione a <b>área de acesso</b>. Você poderá editar apenas a área escolhida; as demais ficam em visualização.</p>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.green900 }}>Aba / área de acesso</label>
      <select value={id} onChange={(e) => setId(e.target.value)} style={{ ...inputStyle, marginTop: 4, marginBottom: 4 }}>
        <option value="" disabled>Selecione a aba…</option>
        {grupos.map(([titulo, items]) => (
          <optgroup key={titulo} label={titulo}>
            {items.map((a) => <option key={a.id} value={a.id}>{a.aba}</option>)}
          </optgroup>
        ))}
      </select>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.green900 }}>Senha</label>
      <input type="password" autoComplete="off" value={senha} onChange={(e) => setSenha(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEntrar(id, senha); }}
        style={{ ...inputStyle, marginTop: 4 }} placeholder="••••••" />
      {erro && <div style={{ color: T.red, fontSize: 12.5, marginTop: 8 }}>{erro}</div>}
      <button onClick={() => onEntrar(id, senha)} style={{ width: "100%", marginTop: 16, background: T.green700, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Entrar</button>
      <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 16, borderTop: `1px solid ${T.line}`, paddingTop: 12, lineHeight: 1.5 }}>
        🔒 Protótipo: senhas ficam neste navegador — <b>não é segurança real</b>. No deploy (Supabase), autenticação com hash e tokens. Mais de uma pessoa pode usar o mesmo acesso; cada login fica registrado.
      </div>
      <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 10, textAlign: "center" }}>Desenvolvido por <b>Everton Maurício Carvalho</b></div>
    </div>
  );
}

/* ---------- App ---------- *//* ---------- App ---------- */
/* Error Boundary: captura erros de renderização e mostra mensagem em vez de tela branca */
class ErroBoundary extends React.Component {
  constructor(props) { super(props); this.state = { erro: null }; }
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro, info) { console.error("Erro de renderização:", erro, info); }
  render() {
    if (this.state.erro) {
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 28px", maxWidth: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#C0392B", marginBottom: 8 }}>⚠ Ocorreu um erro ao exibir esta tela</div>
            <div style={{ fontSize: 13, color: "#3A4A3A", marginBottom: 12 }}>O sistema evitou travar. Detalhe técnico (útil para corrigir):</div>
            <pre style={{ background: "#FCE9E6", color: "#922", borderRadius: 8, padding: "10px 12px", fontSize: 11.5, whiteSpace: "pre-wrap", maxHeight: 220, overflow: "auto" }}>{String(this.state.erro && this.state.erro.stack || this.state.erro)}</pre>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button onClick={() => this.setState({ erro: null })} style={{ background: "#1F5C8A", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Fechar e voltar</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GeoOpsCadastros() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("colab");
  const [subComercial, setSubComercial] = useState("cli"); // sub-aba da aba Comercial
  const [subPlanos, setSubPlanos] = useState("planos"); // sub-aba da aba Planejamento (planos | decisao)
  const [checkup, setCheckup] = useState(null); // resultado do check-up consolidado (IA)
  const [checkupCarregando, setCheckupCarregando] = useState(false);
  const [checkupEm, setCheckupEm] = useState(null); // timestamp da última leitura
  /* Chat interativo da Inteligência (Fase 3) */
  const [chatMsgs, setChatMsgs] = useState([]); // [{ role: "user"|"assistant", content }]
  const [chatInput, setChatInput] = useState("");
  const [chatCarregando, setChatCarregando] = useState(false);
  const [chatProposta, setChatProposta] = useState(null); // ação proposta pela IA aguardando confirmação
  const checkupAtualRef = useRef(null); // espelha o checkup atual (para a função PDF sem closure stale)
  checkupAtualRef.current = checkup;
  const [buscaApt, setBuscaApt] = useState([]); // aptidões selecionadas no buscador de perfis
  const [subCustos, setSubCustos] = useState("custos"); // sub-aba da aba Custos
  const [user, setUser] = useState(null); // usuário logado (null = tela de login)
  const [loginErro, setLoginErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroMaq, setFiltroMaq] = useState("");
  const [filtroFrota, setFiltroFrota] = useState("");
  const [filtroEquip, setFiltroEquip] = useState("");
  const [modal, setModal] = useState(null);
  const [confirma, setConfirma] = useState(null);
  const [salvoEm, setSalvoEm] = useState(null);
  const [erroStore, setErroStore] = useState(false);

  /* Ao logar, posiciona o usuário na aba inicial adequada ao seu papel */
  useEffect(() => {
    if (!user) return;
    if (user.tipo === "gerente") setTab("dash");
    else if (user.tipo === "master") setTab("colab");
    else { const destino = { colab: "colab", apt: "apt", sms: "sms", cond: "comercial", prog: "prog", regras: "custos", ct: "comercial", frota: "frota", maq: "maq", equip: "equip", tap: "tap", loc: "loc" }[user.dom] || "colab"; setTab(destino); }
  }, [user]);

  /* Permissões derivadas do usuário logado */
  const ehMaster = user?.tipo === "master";
  const ehGerente = user?.tipo === "gerente";
  const perfil = ehMaster ? "master" : user?.tipo === "alimentador" ? "adm" : "gestao"; // compat. com código existente
  const podeCusto = ehMaster || ehGerente;               // estimativa de custo do projeto: master e gerentes (aprovação)
  const podeVerSalario = ehMaster || podeEditarDominio(user, "colab");  // salário (superint. p/ baixo): RH e diretoria
  const podeVerSocio = ehMaster;  // salários/retiradas de sócios: SOMENTE diretoria
  const podeVerValorContrato = ehMaster || podeEditarDominio(user, "ct"); // valores de contrato: só Contratos e diretoria
  const podeEditarCli = ehMaster || podeEditarDominio(user, "ct"); // cadastro de clientes: acesso Contratos/Clientes
  /* papel de aceite no duplo aceite da programação: gerente OU responsável por rotas (acesso Localização) */
  const papelAceiteUser = ehMaster ? "ambos" : ehGerente ? "gerente" : (podeEditarDominio(user, "loc") ? "rotas" : null);
  const podeEditarColab = podeEditarDominio(user, "colab");
  const podeEditarApt = podeEditarDominio(user, "apt");
  /* Gestor de Operações (Planejamento): define bloqueio TOTAL, roda Motor, simula, confirma pré-agendamento.
     (diretoria/master ou domínio de planejamento "planos") */
  const ehGestorPlanejamento = ehMaster || podeEditarDominio(user, "planos");
  /* Coordenador de Operações (campo): mantém o Operacional atualizado com a produtividade diária (RDO). */
  const ehCoordenadorOperacional = ehMaster || podeEditarDominio(user, "prog");
  const podeEditarSms = podeEditarDominio(user, "sms");
  const podeEditarMaq = podeEditarDominio(user, "maq") || podeEditarDominio(user, "frota") || podeEditarDominio(user, "equip") || ehMaster;
  const somenteLeitura = !ehMaster && user?.tipo !== "alimentador";
  /* edição genérica por aba corrente */
  const podeEditarAba = (t) => ehMaster || podeEditarDominio(user, ABA_DOMINIO[t]);

  /* ---- Vigilância de atualização das abas (Fase 2) ----
     Cada domínio editável carrega um carimbo { em, por }. O semáforo compara com o relógio. */
  const ABAS_VIGIADAS = [
    { dom: "colab", label: "Equipe" }, { dom: "apt", label: "Aptidões" }, { dom: "sms", label: "SMS" },
    { dom: "ct", label: "Comercial" }, { dom: "frota", label: "Frota" }, { dom: "maq", label: "Máquinas" },
    { dom: "equip", label: "Equipamentos" }, { dom: "custos", label: "Eficiência" }, { dom: "prog", label: "Planejamento" },
    { dom: "loc", label: "Localização" },
  ];
  const horasDesdeAtualizacao = (dom) => {
    const c = (data?.atualizacoes || {})[dom];
    if (!c || !c.em) return null;
    return (Date.now() - new Date(c.em).getTime()) / 36e5;
  };
  const semaforoAtualizacao = (dom) => {
    const h = horasDesdeAtualizacao(dom);
    if (h == null) return { nivel: "sem", cor: T.gray, bg: T.grayBg, txt: "Nunca atualizada" };
    if (h > 72) return { nivel: "critico", cor: T.red, bg: T.redBg, txt: `Há ${Math.floor(h / 24)} dias` };
    if (h > 24) return { nivel: "atencao", cor: T.amber, bg: T.amberBg, txt: `Há ${Math.floor(h)} h` };
    return { nivel: "ok", cor: T.green700, bg: T.green100, txt: h < 1 ? "Agora há pouco" : `Há ${Math.floor(h)} h` };
  };

  useEffect(() => {
    (async () => {
      let d;
      try {
        const r = await window.storage.get(STORE_KEY);
        d = r ? JSON.parse(r.value) : null;
      } catch { d = null; }
      if (!d) d = { colaboradores: [], aptidoes: {}, dominios: { cargos: CARGOS_BASE, regioes: REGIOES_BASE } };
      if (!d.regrasEquipe) { d.regrasEquipe = {}; Object.entries(REGRAS_PADRAO).forEach(([k, v]) => { d.regrasEquipe[k] = JSON.parse(JSON.stringify(v)); }); }
      /* migração para o formato de CARGOS: converte regras antigas (papeis) automaticamente */
      Object.keys(d.regrasEquipe || {}).forEach((k) => { d.regrasEquipe[k] = normalizarRegra(d.regrasEquipe[k]); });
      /* migração: salario + he → custoTotal */
      d.colaboradores = d.colaboradores.map((c) => c.custoTotal !== undefined ? c
        : { ...c, custoTotal: (typeof c.salario === "number" ? c.salario : 0) + (typeof c.he === "number" ? c.he : 0) || "", salario: undefined, he: undefined });
      if (!d.dominios) d.dominios = { cargos: CARGOS_BASE, regioes: REGIOES_BASE };
      d.dominios.smsExtras = d.dominios.smsExtras || [];
      d.sms = d.sms || {};
      d.maquinas = (d.maquinas || []).map((m) => {
        let x = m.profMaxDP !== undefined ? m : {
          marca: "", modelo: "", horimetro: "", comprimento: "", largura: "", altAberta: "", altFechada: "",
          retracao: "", downForce: "", guincho: "", torqueHollow: "", consumo: "", ...m,
          plataforma: m.plataforma === "Sobre esteira" ? "Esteira" : m.plataforma === "Sobre caminhão" ? "Caminhão" : (m.plataforma || ""),
          profMaxDP: m.profMax ?? "",
        };
        if (x.proxRevisao === undefined) x = { ultRevisao: "", proxRevisao: "", ...x };
        return x;
      });
      d.frota = (d.frota || []).map((v) => v.veiculo !== undefined ? v : {
        veiculo: v.modelo || "", anoFab: "", funcao: "",
        implemento: (v.implementos || []).join(" + "), capImplemento: "", ...v,
      });
      d.equipamentos = d.equipamentos || [];
      d.disponibilidade = d.disponibilidade || {};
      d.contratos = (d.contratos || []).map((ct) => ({ cnpj: "", localidade: "", estado: "", projeto: "", servico: "", valorIdgeo: "", valorContrato: "", statusCt: "Vigente", ...ct }));
      d.clientes = d.clientes || [];
      d.docsCnpj = d.docsCnpj || {};
      d.asos = d.asos || {};
      (d.contratos || []).forEach((ct) => {
        if (ct.docs && Object.keys(ct.docs).length) {
          const k = cnpjKey(ct.cnpj) || "ct:" + ct.contrato;
          d.docsCnpj[k] = { ...(d.docsCnpj[k] || {}), ...ct.docs };
          ct.docs = {};
        }
      });
      d.condicionantes = d.condicionantes || {};
      d.taps = d.taps || [];
      d.programacoes = d.programacoes || {};
      d.planos = d.planos || {}; // planos[idgeo] = [ { id, nome, anexo, analiseIA, criadoEm } ]
      d.autorizacoes = d.autorizacoes || [];
      d.apontamentos = d.apontamentos || {}; // RDO diário: apontamentos[idgeo] = [ { data, km, itens:{ativId:qtd}, horasTecnico, obs, lancadoEm } ]
      d.preAgendamentos = d.preAgendamentos || {}; // preAgendamentos[idgeo] = { quantidades:{ativId:qtd}, equipes, opcoes:[4], escolha, status, criadoEm } // fluxo de aprovações: [{ id, mat, nome, idgeo, carteira, tipo, data, valor, justificativa, status, decididoPor, decididoEm, motivo, criadoEm }]
      d.travas = d.travas || { maquina: {}, equipamento: {}, frota: {}, pessoa: {} }; // calendário: travas[tipo][idRec] = [{ id, ini, fim, nivel, idgeo, obs }]
      ["maquina", "equipamento", "frota", "pessoa"].forEach((t) => { if (!d.travas[t]) d.travas[t] = {}; });
      d.servicosCustom = d.servicosCustom || []; // serviços/aptidões adicionados pelo usuário (além dos 27 base)
      d.servicosOcultos = d.servicosOcultos || []; // ids de serviços removidos (inclui base ocultados)
      d.equipPorAtividade = d.equipPorAtividade || {}; // matriz atividade→[palavras-chave do tipo de equipamento]; começa vazia, alimentada pelo usuário
      d.atualizacoes = d.atualizacoes || {}; // carimbo por domínio de aba: atualizacoes[dom] = { em: ISO, por: nome }
      sincAtividades(d.servicosCustom, d.servicosOcultos); // injeta extras e remove ocultos da lista viva
      Object.values(d.programacoes).forEach((p) => { p.executivo = p.executivo || { anexos: [], notas: "" }; p.executivo.pesos = p.executivo.pesos || { ...PESOS_PADRAO }; p.cronograma = p.cronograma || { blocos: [] }; p.aceites = p.aceites || { gerente: null, rotas: null }; p.cenarioSel = p.cenarioSel || null; });
      d.ordens = d.ordens || {};
      d.logins = d.logins || [];
      d.custos = { ...CUSTOS_PADRAO, ...(d.custos || {}) };
      d.precosUnitarios = (d.precosUnitarios && d.precosUnitarios.length) ? d.precosUnitarios : PRECOS_UNITARIOS_PADRAO;
      d.produtividade = { ...PROD_META_PADRAO, ...(d.produtividade || {}) };
      if (!d.regrasEquipe) {
        d.regrasEquipe = {};
        Object.entries(REGRAS_PADRAO).forEach(([k, v]) => { d.regrasEquipe[k] = JSON.parse(JSON.stringify(v)); });
      }
      d.dominios.segmentos = d.dominios.segmentos || SEGMENTOS_BASE;
      d.dominios.tiposEquip = d.dominios.tiposEquip || TIPOS_EQUIP_BASE;
      setData(d);
    })();
  }, []);

  const persist = async (next, opts) => {
    /* carimbo automático de atualização: marca o domínio da aba ativa (ou um domínio explícito) com data/hora + quem editou.
       opts.semCarimbo evita carimbar em gravações que não são edição de conteúdo (ex.: login). */
    let carimbado = next;
    if (!(opts && opts.semCarimbo)) {
      const dom = (opts && opts.dom) || ABA_DOMINIO[tab];
      if (dom) {
        const quem = user?.responsavel || user?.aba || user?.carteira || "—";
        carimbado = { ...next, atualizacoes: { ...(next.atualizacoes || {}), [dom]: { em: new Date().toISOString(), por: quem } } };
      }
    }
    setData(carimbado);
    try {
      await window.storage.set(STORE_KEY, JSON.stringify(carimbado));
      setSalvoEm(new Date()); setErroStore(false);
    } catch { setErroStore(true); }
  };

  /* A aba Inteligência roda uma leitura ao ser aberta (se ainda não houver).
     A atualização periódica automática foi removida — agora só manual (botão "Atualizar agora"). */
  const checkupRef = useRef(null);
  useEffect(() => {
    if (tab !== "inteligencia") return;
    if (checkupRef.current) checkupRef.current();
  }, [tab]);

  /* recálculo automático dos pré-agendamentos ao abrir a sub-aba "pré-agendados":
     reflete mudanças recentes em viagem, equipamentos, posição e não-conformidade sem o usuário clicar. */
  const recalcPreRef = useRef(null);
  useEffect(() => {
    if (tab === "planos" && subPlanos === "decisao" && recalcPreRef.current) recalcPreRef.current();
  }, [tab, subPlanos]);

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.paper, fontFamily: "'IBM Plex Sans', sans-serif", color: T.inkSoft }}>
      Carregando cadastros…
    </div>
  );

  /* ---- Tela de login ---- */
  if (!user) {
    const tentarLogin = (id, senha) => {
      const a = ACESSOS.find((x) => x.id === id);
      if (!a) { setLoginErro("Selecione a aba/área de acesso."); return; }
      if (senha !== a.senha) { setLoginErro("Senha incorreta."); return; }
      setLoginErro("");
      /* registra o login (quem, qual acesso, data/hora) */
      const reg = { acessoId: a.id, aba: a.aba, tipo: a.tipo, carteira: a.carteira || "", em: new Date().toISOString() };
      try {
        const atual = (data && data.logins) || [];
        persist({ ...data, logins: [reg, ...atual].slice(0, 500) }, { semCarimbo: true });
      } catch (e) {}
      setUser(a);
    };
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${T.green900}, ${T.green700})`, fontFamily: "'IBM Plex Sans', sans-serif", padding: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@600&family=IBM+Plex+Mono&display=swap');`}</style>
        <LoginCard erro={loginErro} onEntrar={tentarLogin} />
      </div>
    );
  }

  const { colaboradores, aptidoes, dominios, sms, maquinas, frota, equipamentos, disponibilidade, contratos, clientes, docsCnpj, condicionantes, taps, programacoes, regrasEquipe, ordens, logins, custos, precosUnitarios, produtividade, asos, planos, servicosCustom, servicosOcultos, equipPorAtividade, autorizacoes, apontamentos, preAgendamentos, travas } = data;
  const itensSms = [...SMS_ITENS, ...(dominios.smsExtras || []).map((e) => ({ ...e, grupo: "Específicos" }))];
  const lista = colaboradores
    .filter((c) => !filtroStatus || c.status === filtroStatus)
    .filter((c) => {
      const q = busca.toLowerCase();
      return !q || c.nome.toLowerCase().includes(q) || c.mat.toLowerCase().includes(q) || c.cargo.toLowerCase().includes(q) || c.regiao.toLowerCase().includes(q);
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const listaMaq = maquinas
    .filter((m) => !filtroMaq || m.status === filtroMaq)
    .filter((m) => {
      const q = busca.toLowerCase();
      return !q || m.cod.toLowerCase().includes(q) || (m.marca || "").toLowerCase().includes(q) || (m.modelo || "").toLowerCase().includes(q)
        || (m.plataforma || "").toLowerCase().includes(q) || (m.local || "").toLowerCase().includes(q)
        || (m.tipos || []).some((t) => (TIPOS_SOND.find((x) => x.id === t)?.label || "").toLowerCase().includes(q));
    })
    .sort((a, b) => a.cod.localeCompare(b.cod));

  const listaFrota = frota
    .filter((v) => !filtroFrota || v.status === filtroFrota)
    .filter((v) => {
      const q = busca.toLowerCase();
      return !q || v.placa.toLowerCase().includes(q) || (v.veiculo || "").toLowerCase().includes(q) || (v.tipo || "").toLowerCase().includes(q) || (v.funcao || "").toLowerCase().includes(q) || (v.localAtual || "").toLowerCase().includes(q);
    })
    .sort((a, b) => a.placa.localeCompare(b.placa));
  const listaEquip = equipamentos
    .filter((e) => !filtroEquip || e.estado === filtroEquip)
    .filter((e) => {
      const q = busca.toLowerCase();
      return !q || e.cod.toLowerCase().includes(q) || (e.tipo || "").toLowerCase().includes(q) || (e.modelo || "").toLowerCase().includes(q) || (e.comQuem || "").toLowerCase().includes(q);
    })
    .sort((a, b) => a.cod.localeCompare(b.cod));

  const listaClientes = clientes
    .filter((c) => {
      const q = busca.toLowerCase();
      return !q || c.nome.toLowerCase().includes(q) || (c.cnpj || "").toLowerCase().includes(q) || (c.segmento || "").toLowerCase().includes(q) || (c.cidade || "").toLowerCase().includes(q);
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const contratosDoCliente = (nome) => contratos.filter((ct) => ct.cliente === nome);

  const listaContratos = contratos
    .filter((ct) => {
      const q = busca.toLowerCase();
      return !q || ct.cliente.toLowerCase().includes(q) || ct.contrato.toLowerCase().includes(q) || (ct.projeto || "").toLowerCase().includes(q) || (ct.servico || "").toLowerCase().includes(q) || (ct.localidade || "").toLowerCase().includes(q);
    })
    .sort((a, b) => a.cliente.localeCompare(b.cliente));
  /* Projetos prontos para a Inteligência: SÓ TAPs que têm ao menos 1 Plano de Trabalho.
     Garante uma programação-base (das atividades do plano lido pela IA, ou sugeridas pelo tipoServico).
     (constante normal — não usar hook aqui, pois este ponto fica após returns condicionais) */
  const projetosInteligencia = taps
      .filter((t) => ((planos || {})[t.idgeo] || []).length > 0 && !["Concluído", "Cancelado"].includes(t.statusTap))
      .map((t) => {
        let p = programacoes[t.idgeo];
        if (!p) {
          /* monta programação-base a partir do(s) plano(s) */
          const ptList = (planos || {})[t.idgeo] || [];
          const ativDaIA = [];
          ptList.forEach((pt) => {
            const ats = (pt.analiseIA && Array.isArray(pt.analiseIA.atividades)) ? pt.analiseIA.atividades : [];
            ats.forEach((a) => {
              const nomeServ = typeof a === "string" ? a : (a.servico || "");
              const mid = nomeServ ? matchAtividade(nomeServ) : null;
              if (mid && mid.id) ativDaIA.push({ id: mid.id, qtd: typeof a === "object" && a.quantidade ? +a.quantidade || 0 : 0 });
            });
          });
          const ativIds = ativDaIA.length ? ativDaIA : sugerirAtividades(t.tipoServico).map((id) => ({ id, qtd: 0 }));
          /* agrega preços e recomendações que a IA extraiu do dossiê contratual */
          const precosPlano = [];
          let recomendacao = "";
          ptList.forEach((pt) => {
            const ia = pt.analiseIA || {};
            if (Array.isArray(ia.precos)) ia.precos.forEach((pr) => { if (pr && typeof pr === "object" && pr.item) precosPlano.push(pr); });
            if (ia.recomendacaoAlocacao) recomendacao = recomendacao ? recomendacao + " · " + ia.recomendacaoAlocacao : ia.recomendacaoAlocacao;
          });
          p = {
            idgeo: t.idgeo, local: t.cidade || "", uf: t.uf || "",
            prioridade: t.urgente15 ? "Alta" : "Média",
            inicioPrev: t.entradaCampo || "", fimPrev: t.entregaRelatorio || "",
            equipes: 1, atividades: ativIds, status: "Plano de Trabalho recebido",
            executivo: { anexos: [], notas: recomendacao, pesos: { ...PESOS_PADRAO } },
            precosPlano, recomendacaoIA: recomendacao,
            cronograma: { blocos: [] }, revisoes: [], aceites: { gerente: null, rotas: null }, cenarioSel: null,
            origemPlano: true,
          };
        }
        return { idgeo: t.idgeo, p, tap: t, planos: (planos || {})[t.idgeo] || [] };
      });
  /* Linhas da matriz de docs: um CNPJ por linha (agrupando contratos) */
  const docsRows = [];
  contratos.forEach((ct) => {
    const key = cnpjKey(ct.cnpj) || "ct:" + ct.contrato;
    let row = docsRows.find((r) => r.key === key);
    if (!row) { row = { key, cnpj: ct.cnpj || "(sem CNPJ)", clientes: [], cts: [] }; docsRows.push(row); }
    if (!row.clientes.includes(ct.cliente)) row.clientes.push(ct.cliente);
    row.cts.push(ct.contrato);
  });
  const docsRowsFiltradas = docsRows
    .filter((r) => {
      const q = busca.toLowerCase();
      return !q || r.cnpj.toLowerCase().includes(q) || r.clientes.join(" ").toLowerCase().includes(q) || r.cts.join(" ").toLowerCase().includes(q);
    })
    .sort((a, b) => a.clientes[0].localeCompare(b.clientes[0]));
  let docsVencidos = 0, docsV30 = 0;
  docsRows.forEach((r) => DOCS_CLIENTE.forEach((dc) => {
    const st = smsStatus((docsCnpj[r.key] || {})[dc.id]);
    if (st.key === "venc") docsVencidos++; else if (st.key === "v30") docsV30++;
  }));

  /* Disponibilidade & rotação */
  const dispDe = (mat) => disponibilidade[mat] || {};
  const afastAtivo = (mat) => (dispDe(mat).afastamentos || []).find((a) => a.ini && a.ini <= hojeISO() && (!a.fim || a.fim >= hojeISO()));
  const emFerias = (mat) => (dispDe(mat).ferias || []).find((p) => p.ini && p.fim && p.ini <= hojeISO() && p.fim >= hojeISO());
  const campoInfo = (mat) => {
    const dd = dispDe(mat);
    if (!dd.emCampoDesde) return { tag: "Na base", c: T.gray, bg: T.grayBg };
    const dias = Math.floor((new Date(hojeISO()) - new Date(dd.emCampoDesde)) / 864e5);
    const max = +dd.tempoMaxCampo || 0;
    if (max && dias >= max) return { tag: `Rotacionar · ${dias} d (máx ${max})`, c: "#fff", bg: T.red };
    if (max && dias >= Math.ceil(max * 0.8)) return { tag: `${dias} d em campo · máx ${max}`, c: T.green900, bg: "#F0CC7E" };
    return { tag: `${dias} d em campo${max ? ` · máx ${max}` : ""}`, c: T.green700, bg: T.green100 };
  };
  const feriasInfo = (mat) => {
    const atual = emFerias(mat);
    if (atual) return { tag: `Em férias até ${fmtData(atual.fim)}`, c: T.blue, bg: T.blueBg };
    const prox = (dispDe(mat).ferias || []).filter((p) => p.ini > hojeISO()).sort((a, b) => a.ini.localeCompare(b.ini))[0];
    if (prox) return { texto: `Próx.: ${fmtData(prox.ini)} – ${fmtData(prox.fim)}` };
    return null;
  };
  const cobertura = ATIVIDADES.map((atv) => {
    const naoDeslig = colaboradores.filter((c) => c.status !== "Desligado");
    const n4 = naoDeslig.filter((c) => aptidoes[c.mat]?.matriz?.[atv.id] === "esp").length;
    const n3 = naoDeslig.filter((c) => ["sr", "esp"].includes(aptidoes[c.mat]?.matriz?.[atv.id])).length;
    const n2 = naoDeslig.filter((c) => ["pl", "sr", "esp"].includes(aptidoes[c.mat]?.matriz?.[atv.id])).length;
    const nomes = naoDeslig.filter((c) => ["pl", "sr", "esp"].includes(aptidoes[c.mat]?.matriz?.[atv.id]) && c.status === "Ativo" && !afastAtivo(c.mat) && !emFerias(c.mat)).map((c) => c.nome);
    return { atv, n4, n3, n2, dispHoje: nomes.length, nomes };
  }).sort((a, b) => a.dispHoje - b.dispHoje);

  const listaTaps = taps
    .filter((t) => {
      const q = busca.toLowerCase();
      return !q || t.idgeo.toLowerCase().includes(q) || (t.projeto || "").toLowerCase().includes(q) || (t.cliente || "").toLowerCase().includes(q) || (t.cidade || "").toLowerCase().includes(q) || (t.gerente || "").toLowerCase().includes(q);
    })
    .sort((a, b) => (a.entradaCampo || "9999") < (b.entradaCampo || "9999") ? -1 : 1);
  /* dias estimados de campo de uma programação (a partir dos benchmarks) */
  const estimaDias = (prog) => {
    if (!prog || !prog.atividades) return { dias: 0, parcial: false };
    let dias = 0, parcial = false;
    prog.atividades.forEach((a) => {
      const p = (produtividade && produtividade[a.id]) || PROD_DIA[a.id];
      if (p && +a.qtd > 0) dias += Math.ceil(+a.qtd / (p * Math.max(1, +prog.equipes || 1)));
      else if (+a.qtd > 0) parcial = true;
    });
    return { dias, parcial };
  };
  const progList = Object.entries(programacoes).map(([idgeo, p]) => ({ idgeo, tap: taps.find((t) => t.idgeo === idgeo), ...p }))
    .filter((p) => p.tap)
    .filter((p) => {
      const q = busca.toLowerCase();
      return !q || p.idgeo.toLowerCase().includes(q) || (p.tap.projeto || "").toLowerCase().includes(q) || (p.local || "").toLowerCase().includes(q);
    })
    .sort((a, b) => (a.inicioPrev || "9999") < (b.inicioPrev || "9999") ? -1 : 1);
  const tapsAguardando = listaTaps.filter((t) => !programacoes[t.idgeo] && !["Concluído", "Cancelado"].includes(t.statusTap));
  const progStats = {
    programadas: Object.keys(programacoes).length,
    aguardando: tapsAguardando.length,
    diasTotais: progList.reduce((s, p) => s + estimaDias(p).dias, 0),
  };

  const tapsStats = {
    total: taps.length,
    aguardando: taps.filter((t) => ["Aguardando Plano de Trabalho", "Plano de Trabalho recebido", "Pré-agendado"].includes(t.statusTap)).length,
    quinzeDias: taps.filter((t) => { const d = diasDesde(t.entradaCampo); return t.entradaCampo && d != null && d >= -15 && d <= 0 && !["Concluído", "Cancelado"].includes(t.statusTap); }).length,
    atrasados: taps.filter((t) => t.entradaCampo && t.entradaCampo < hojeISO() && ["Aguardando Plano de Trabalho", "Plano de Trabalho recebido", "Pré-agendado"].includes(t.statusTap)).length,
  };

  /* Localização: pessoas + veículos agrupados por cidade */
  const locPessoas = colaboradores.filter((c) => c.status !== "Desligado").map((c) => {
    const dd = dispDe(c.mat);
    return dd.localAtual ? { tipo: "p", nome: c.nome, mat: c.mat, cargo: c.cargo, cidade: dd.localAtual, data: dd.dataLocal, fonte: dd.fonteLocal, lat: dd.lat, lng: dd.lng } : null;
  }).filter(Boolean);
  const locVeics = frota.filter((v) => v.status !== "Inativo" && v.localAtual).map((v) => ({ tipo: "v", placa: v.placa, nomeV: v.veiculo, cidade: v.localAtual, data: v.dataLocal, lat: v.lat, lng: v.lng }));
  const gruposLocMap = {};
  [...locPessoas, ...locVeics].forEach((it) => {
    const k = normCity(it.cidade);
    const g = gruposLocMap[k] = gruposLocMap[k] || { key: k, cidade: GAZ[k]?.n || it.cidade, coords: GAZ[k]?.c || null, pessoas: [], veics: [] };
    if (!g.coords && it.lat != null && it.lng != null && it.lat !== "" && it.lng !== "") g.coords = [+it.lat, +it.lng];
    (it.tipo === "p" ? g.pessoas : g.veics).push(it);
  });
  const gruposLoc = Object.values(gruposLocMap).map((g) => ({ ...g, dist: g.coords ? distRodKm(g.coords) : null }))
    .filter((g) => {
      const q = busca.toLowerCase();
      return !q || g.cidade.toLowerCase().includes(q) || g.pessoas.some((p) => p.nome.toLowerCase().includes(q)) || g.veics.some((v) => v.placa.toLowerCase().includes(q));
    })
    .sort((a, b) => (a.dist ?? 99999) - (b.dist ?? 99999));
  const locStats = {
    pComPos: locPessoas.length,
    pAtivos: colaboradores.filter((c) => c.status !== "Desligado").length,
    pStale: locPessoas.filter((p) => (diasDesde(p.data) ?? 99) > 2).length,
    vComPos: locVeics.length,
    vTotal: frota.filter((v) => v.status !== "Inativo").length,
    vStale: locVeics.filter((v) => (diasDesde(v.data) ?? 99) > 2).length,
    semGeo: Object.values(gruposLocMap).filter((g) => !g.coords).length,
  };

  let smsVencidos = 0, smsV30 = 0;
  colaboradores.filter((c) => c.status === "Ativo").forEach((c) => {
    itensSms.forEach((it) => {
      const st = smsStatus((sms[c.mat] || {})[it.id]);
      if (st.key === "venc") smsVencidos++; else if (st.key === "v30") smsV30++;
    });
  });

  const salvarColab = (c) => {
    const idx = colaboradores.findIndex((x) => x.mat === c.mat);
    const next = idx >= 0 ? colaboradores.map((x, i) => (i === idx ? c : x)) : [...colaboradores, c];
    persist({ ...data, colaboradores: next });
    setModal(null);
  };
  const excluir = (mat) => {
    const apt = { ...aptidoes }; delete apt[mat];
    persist({ ...data, colaboradores: colaboradores.filter((c) => c.mat !== mat), aptidoes: apt });
    setConfirma(null);
  };
  const APT_VAZIA = { cnhCat: "Não possui", cnhVal: "", cursos: [], treinos: [], matriz: {}, restricoes: [], obs: "" };
  const cicloNivel = { na: "jr", jr: "pl", pl: "sr", sr: "esp", esp: "na" };
  const setNivelMatriz = (mat, atvId) => {
    if (!podeEditarApt) return;
    const base = aptidoes[mat] || APT_VAZIA;
    const prox = cicloNivel[base.matriz[atvId] || "na"];
    persist({ ...data, aptidoes: { ...aptidoes, [mat]: { ...base, matriz: { ...base.matriz, [atvId]: prox } } } });
  };
  const importarMatriz = (rows) => {
    const next = { ...aptidoes };
    for (const r of rows) {
      const base = next[r.mat] || APT_VAZIA;
      const m = { ...base.matriz };
      r.niveis.forEach((n) => { m[n.atvId] = n.nivel; });
      next[r.mat] = { ...base, matriz: m };
    }
    persist({ ...data, aptidoes: next });
    setModal(null);
  };
  const salvarSmsCell = (mat, itemId, rec) => {
    const cur = { ...(sms[mat] || {}) };
    if (rec === null) delete cur[itemId]; else cur[itemId] = rec;
    persist({ ...data, sms: { ...sms, [mat]: cur } });
    setModal(null);
  };
  const salvarSmsFicha = (mat, mapa) => { persist({ ...data, sms: { ...sms, [mat]: mapa } }); setModal(null); };
  const importarSms = (rows) => {
    const next = { ...sms };
    rows.forEach((r) => { const cur = { ...(next[r.mat] || {}) }; r.recs.forEach((x) => { cur[x.itemId] = x.rec; }); next[r.mat] = cur; });
    persist({ ...data, sms: next });
    setModal(null);
  };
  const addSmsExtra = (label) => {
    persist({ ...data, dominios: { ...dominios, smsExtras: [...(dominios.smsExtras || []), { id: "ext_" + Date.now(), label }] } });
    setModal(null);
  };
  const salvarMaq = (m) => {
    const idx = maquinas.findIndex((x) => x.cod === m.cod);
    persist({ ...data, maquinas: idx >= 0 ? maquinas.map((x, i) => (i === idx ? m : x)) : [...maquinas, m] });
    setModal(null);
  };
  const excluirMaq = (cod) => {
    persist({ ...data, maquinas: maquinas.filter((m) => m.cod !== cod) });
    setConfirma(null);
  };
  const salvarVeic = (v) => {
    const idx = frota.findIndex((x) => x.placa === v.placa);
    persist({ ...data, frota: idx >= 0 ? frota.map((x, i) => (i === idx ? v : x)) : [...frota, v] });
    setModal(null);
  };
  const excluirVeic = (placa) => { persist({ ...data, frota: frota.filter((v) => v.placa !== placa) }); setConfirma(null); };
  const salvarEquip = (e) => {
    const idx = equipamentos.findIndex((x) => x.cod === e.cod);
    persist({ ...data, equipamentos: idx >= 0 ? equipamentos.map((x, i) => (i === idx ? e : x)) : [...equipamentos, e] });
    setModal(null);
  };
  const excluirEquip = (cod) => { persist({ ...data, equipamentos: equipamentos.filter((e) => e.cod !== cod) }); setConfirma(null); };
  /* matriz atividade→[palavras-chave do tipo de equipamento] — salva uma entrada (ou remove se chaves vazias) */
  const salvarEquipMapa = (ativId, chaves) => {
    const limpo = (chaves || []).map((s) => String(s).trim()).filter(Boolean);
    const novo = { ...(equipPorAtividade || {}) };
    if (limpo.length) novo[ativId] = limpo; else delete novo[ativId];
    persist({ ...data, equipPorAtividade: novo });
  };
  const addTipoEquip = (t) => persist({ ...data, dominios: { ...dominios, tiposEquip: [...(dominios.tiposEquip || []), t] } });
  const salvarContrato = (ct) => {
    const idx = contratos.findIndex((x) => x.contrato === ct.contrato);
    persist({ ...data, contratos: idx >= 0 ? contratos.map((x, i) => (i === idx ? { ...x, ...ct } : x)) : [...contratos, { ...ct, docs: {} }] });
    setModal(null);
  };
  /* eslint-disable-next-line */
  const excluirContrato = (contrato) => { persist({ ...data, contratos: contratos.filter((x) => x.contrato !== contrato) }); setConfirma(null); };
  const salvarDocCell = (key, itemId, rec) => {
    const cur = { ...(docsCnpj[key] || {}) };
    if (rec === null) delete cur[itemId]; else cur[itemId] = rec;
    persist({ ...data, docsCnpj: { ...docsCnpj, [key]: cur } });
    setModal(null);
  };
  const salvarAsoCell = (mat, contrato, rec) => {
    const cur = { ...((asos || {})[mat] || {}) };
    if (rec === null) delete cur[contrato]; else cur[contrato] = rec;
    persist({ ...data, asos: { ...(asos || {}), [mat]: cur } });
    setModal(null);
  };
  const salvarCond = (contrato, obj) => { persist({ ...data, condicionantes: { ...condicionantes, [contrato]: obj } }); setModal(null); };
  const importarPosP = (rows) => {
    const next = { ...disponibilidade };
    rows.forEach((r) => {
      const base = next[r.mat] || { tempoMaxCampo: 15, emCampoDesde: "", ferias: [], afastamentos: [] };
      next[r.mat] = { ...base, localAtual: r.cidade, fonteLocal: "Ponto eletrônico", dataLocal: r.data, lat: r.lat ?? base.lat ?? "", lng: r.lng ?? base.lng ?? "" };
    });
    persist({ ...data, disponibilidade: next });
    setModal(null);
  };
  const importarTaps = (rows) => {
    const next = [...taps];
    rows.forEach((r) => {
      const idx = next.findIndex((t) => t.idgeo === r.idgeo);
      if (idx >= 0) next[idx] = { ...next[idx], ...r };
      else next.push({ ...r, statusTap: "Aguardando Plano de Trabalho" }); // TAP aberta, aguarda Plano(s) de Trabalho
    });
    persist({ ...data, taps: next });
    setModal(null);
  };
  /* Cria uma TAP manualmente, gerando o IDGEO automático (UF+ANO+sequencial) */
  const criarTapManual = (dados) => {
    const anoAtual = new Date().getFullYear();
    const idgeo = gerarIdgeo(dados.uf, taps, anoAtual);
    const nova = {
      idgeo,
      projeto: dados.projeto || "", cliente: dados.cliente || "", cnpj: dados.cnpj || "",
      contrato: dados.contrato || "", contratoId: dados.contratoId || "",
      cidade: dados.cidade || "", uf: (dados.uf || "").toUpperCase(),
      carteira: dados.carteira || "", contato: dados.contato || "",
      premissas: dados.premissas || "", premOper: dados.premissas || "",
      expectativas: dados.expectativas || "", metas: dados.expectativas || "",
      dataCriacao: hojeISO(),
      entradaCampo: dados.entradaCampo || "", entregaRelatorio: dados.entregaRelatorio || "", prazoMaximo: dados.prazoMaximo || "",
      margem: dados.margem || "",
      riscosTecnicos: dados.riscosTecnicos || "", riscos: dados.riscosTecnicos || "",
      desafiosOper: dados.desafiosOper || "", riscosJuridicos: dados.riscosJuridicos || "",
      anexos: dados.anexos || [], analiseJuridicaIA: dados.analiseIA || null,
      tipoServico: [],
      urgente15: dados.entradaCampo ? (new Date(dados.entradaCampo) - new Date()) / 86400000 <= 15 : false,
      statusTap: "Aguardando Plano de Trabalho",
    };
    persist({ ...data, taps: [nova, ...taps] });
    setModal(null);
  };
  /* Assinatura conjunta do parecer da TAP (Gestor de Operações + Gerente de Projetos) */
  const assinarTap = (tap, papel) => {
    const novosTaps = taps.map((t) => t.idgeo === tap.idgeo
      ? { ...t, aceitesTap: { ...(t.aceitesTap || {}), [papel]: { por: user?.aba || papel, em: hojeISO() } } }
      : t);
    persist({ ...data, taps: novosTaps });
    setModal((m) => m && m.tap ? { ...m, tap: novosTaps.find((t) => t.idgeo === tap.idgeo) } : m);
  };
  /* Gera o parecer da TAP em PDF (imprime uma janela formatada → o usuário salva como PDF) */
  const baixarPDFParecer = (tap) => {
    const ia = tap.analiseJuridicaIA || tap.analiseIA || {};
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lst = (arr) => Array.isArray(arr) && arr.length ? "<ul>" + arr.map((x) => `<li>${esc(typeof x === "object" ? `${x.item || ""}: ${x.quantidade || ""} ${x.unidade || ""}` : x)}</li>`).join("") + "</ul>" : "<p style='color:#888'>—</p>";
    const aceites = tap.aceitesTap || {};
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Parecer ${esc(tap.idgeo)}</title>
      <style>body{font-family:Georgia,serif;max-width:780px;margin:30px auto;color:#1a2e1a;line-height:1.5}h1{font-size:22px;border-bottom:2px solid #1F5C8A;padding-bottom:6px}h2{font-size:15px;color:#0F2E4D;margin-top:22px;border-bottom:1px solid #ccc;padding-bottom:3px}.sub{color:#666;font-size:12px}ul{margin:4px 0}li{margin:2px 0;font-size:13px}p{font-size:13px}.assin{display:flex;gap:20px;margin-top:14px}.box{flex:1;border:1px solid #999;border-radius:8px;padding:10px}.ok{color:#1E7E45;font-weight:bold}</style></head><body>
      <h1>Parecer Técnico-Jurídico — ${esc(tap.idgeo)}</h1>
      <p class="sub">${esc(tap.projeto || "")} · ${esc(tap.cliente || "")} · ${esc(tap.cidade || "")}/${esc(tap.uf || "")} · GeoópS — GEOAMBIENTE S/A</p>
      <h2>Resumo da TAP</h2>
      <p><b>Premissas:</b> ${esc(tap.premissas || tap.premOper || "—")}<br><b>Expectativas:</b> ${esc(tap.expectativas || tap.metas || "—")}<br><b>Entrada em campo:</b> ${esc(tap.entradaCampo ? fmtData(tap.entradaCampo) : "—")} · <b>Entrega:</b> ${esc(tap.entregaRelatorio ? fmtData(tap.entregaRelatorio) : "—")}<br><b>Riscos técnicos:</b> ${esc(tap.riscosTecnicos || tap.riscos || "—")}<br><b>Desafios operacionais:</b> ${esc(tap.desafiosOper || "—")}</p>
      <h2>Escopo resumido</h2><p>${esc(ia.escopoResumo || ia.observacoes || "—")}</p>
      <h2>Quantitativos</h2>${lst(ia.quantitativos)}
      <h2>Análise jurídica</h2><p>${esc(ia.analiseJuridica || "—")}</p>
      <h2>Multas e penalidades</h2>${lst(ia.multasPenalidades)}
      <h2>Obrigações críticas</h2>${lst(ia.obrigacoesCriticas)}
      <h2>Avaliação da estrutura de pessoas</h2><p>${esc(ia.estruturaPessoas || "—")}</p>
      <h2>Alertas de fragilidade de pessoal</h2>${lst(ia.alertasPessoas)}
      <h2>Avaliação de máquinas e equipamentos</h2><p>${esc(ia.estruturaRecursos || "—")}</p>
      <h2>Necessidade de investimento</h2>${lst(ia.necessidadeInvestimento)}
      <h2>Normas exigidas</h2>${lst(ia.normas)}
      <h2>Alertas para a gestão</h2>${lst(ia.alertasGestao)}
      <h2>Aceite das premissas</h2>
      <div class="assin">
        <div class="box"><b>Gestor de Operações</b><br>${aceites.gestorOp ? `<span class="ok">✓ ${esc(aceites.gestorOp.por)} — ${esc(fmtData(aceites.gestorOp.em))}</span>` : "<span style='color:#999'>Pendente</span>"}</div>
        <div class="box"><b>Gerente de Projetos</b><br>${aceites.gerenteProj ? `<span class="ok">✓ ${esc(aceites.gerenteProj.por)} — ${esc(fmtData(aceites.gerenteProj.em))}</span>` : "<span style='color:#999'>Pendente</span>"}</div>
      </div>
      <p class="sub" style="margin-top:24px">Documento gerado pelo GeoópS · www.geoops.ia.br · Desenvolvido por Everton Maurício Carvalho</p>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400); }
    else alert("Permita pop-ups para gerar o PDF do parecer.");
  };
  /* ---- Planos de Trabalho: cada TAP pode ter 1+ planos; cada plano habilita OSs ---- */
  /* Extrai quantidades por serviço a partir da análise de IA dos planos (com fallback p/ ajuste manual) */
  const extrairQuantidades = (idgeo, listaPlanos) => {
    const quantidades = {};
    (listaPlanos || []).forEach((pt) => {
      const ats = (pt.analiseIA && Array.isArray(pt.analiseIA.atividades)) ? pt.analiseIA.atividades : [];
      ats.forEach((a) => {
        const nomeServ = typeof a === "string" ? a : (a.servico || "");
        const mid = nomeServ ? matchAtividade(nomeServ) : null;
        if (mid && mid.id) {
          const q = (typeof a === "object" && a.quantidade) ? +a.quantidade || 0 : 0;
          quantidades[mid.id] = (quantidades[mid.id] || 0) + q;
        }
      });
    });
    /* se a IA não extraiu nada, sugere pelo tipo de serviço; se ainda assim vazio, abre com TODOS os serviços (qtd 0) */
    if (Object.keys(quantidades).length === 0) {
      const tap = taps.find((t) => t.idgeo === idgeo);
      const sugeridos = sugerirAtividades(tap?.tipoServico);
      if (sugeridos.length > 0) {
        sugeridos.forEach((id) => { quantidades[id] = 0; });
      } else {
        /* sem pista nenhuma: lista completa para o gestor preencher as quantidades que precisar */
        ATIVIDADES.forEach((a) => { quantidades[a.id] = 0; });
      }
    }
    return quantidades;
  };
  /* Monta a programação a partir das quantidades e gera as 4 opções de OS (pré-agendamento) */
  const gerarPreAgendamento = (idgeo, listaPlanos, quantidadesManuais, equipesManual, janelaSim) => {
    const tap = taps.find((t) => t.idgeo === idgeo);
    if (!tap) return null;
    const quantidades = quantidadesManuais || extrairQuantidades(idgeo, listaPlanos);
    const equipes = equipesManual || 1;
    const atividades = Object.entries(quantidades).map(([id, qtd]) => ({ id, qtd: +qtd || 0 }));
    /* preços e recomendação extraídos do dossiê */
    const precosPlano = []; let recomendacao = "";
    (listaPlanos || []).forEach((pt) => {
      const ia = pt.analiseIA || {};
      if (Array.isArray(ia.precos)) ia.precos.forEach((pr) => { if (pr && typeof pr === "object" && pr.item) precosPlano.push(pr); });
      if (ia.recomendacaoAlocacao) recomendacao = recomendacao ? recomendacao + " · " + ia.recomendacaoAlocacao : ia.recomendacaoAlocacao;
    });
    const progBase = {
      idgeo, local: tap.cidade || "", uf: tap.uf || "",
      prioridade: tap.urgente15 ? "Alta" : "Média",
      inicioPrev: tap.entradaCampo || "", fimPrev: tap.entregaRelatorio || "",
      equipes, atividades, status: "Pré-agendamento",
      executivo: { anexos: [], notas: recomendacao, pesos: { ...PESOS_PADRAO } },
      precosPlano, recomendacaoIA: recomendacao,
      cronograma: { blocos: [] }, revisoes: [], aceites: { gerente: null, rotas: null }, cenarioSel: null,
      origemPlano: true,
    };
    /* 4 vieses → 4 opções de OS */
    const baseCtx = { colaboradores, aptidoes, sms, maquinas, frota, equipamentos, equipPorAtividade, apontamentos, ordens, asos, contratos, condicionantes, dispDe, afastAtivo, emFerias, regrasEquipe, custos, precosUnitarios, produtividade, travas, janelaSimulada: (janelaSim && janelaSim.ini && janelaSim.fim) ? janelaSim : null };
    const vieses = [
      { id: "custo", nome: "Menor Custo", icone: "💰", desc: "Minimiza o custo total: prioriza pessoas próximas e de menor custo, reduzindo deslocamento e HH", pesos: { qualidade: 5, custo: 10, rota: 7, tempo: 3, proximidade: 9, conformidade: 3 } },
      { id: "rota", nome: "Melhor Logística", icone: "🛣", desc: "Minimiza distância e deslocamento: prioriza equipe e recursos mais próximos da obra", pesos: { qualidade: 5, custo: 6, rota: 10, tempo: 5, proximidade: 10, conformidade: 3 } },
      { id: "rapida", nome: "Menor Tempo de Entrada", icone: "⏱", desc: "Prioriza começar e concluir o campo o quanto antes (melhor nível técnico, entrada mais cedo)", pesos: { qualidade: 9, custo: 4, rota: 6, tempo: 10, proximidade: 6, conformidade: 4 } },
    ];
    let opcoes = [];
    try {
      opcoes = vieses.map((v) => {
        const progV = { ...progBase, executivo: { ...progBase.executivo, pesos: v.pesos } };
        const os = motorAlocar({ tap, prog: progV, ctx: baseCtx });
        return { ...v, os };
      });
    } catch (err) { console.error("Erro ao gerar opções:", err); opcoes = []; }
    return { idgeo, quantidades, equipes, opcoes, escolha: null, status: "Aguardando confirmação", criadoEm: new Date().toISOString() };
  };
  const salvarPlano = (idgeo, plano) => {
    const lista = [...((planos || {})[idgeo] || [])];
    const idx = lista.findIndex((p) => p.id === plano.id);
    if (idx >= 0) lista[idx] = plano; else lista.push(plano);
    /* TAP que recebe plano e gera pré-agendamento passa a "Pré-agendado" */
    const novosTaps = taps.map((t) => (t.idgeo === idgeo ? { ...t, statusTap: "Pré-agendado" } : t));
    /* CONVERSÃO AUTOMÁTICA: ao salvar o plano, gera o pré-agendamento com as 4 opções de OS */
    const pre = gerarPreAgendamento(idgeo, lista);
    const novosPreAg = pre ? { ...(preAgendamentos || {}), [idgeo]: pre } : (preAgendamentos || {});
    persist({ ...data, planos: { ...(planos || {}), [idgeo]: lista }, taps: novosTaps, preAgendamentos: novosPreAg });
    setModal(null);
  };
  /* Adiciona/remove um serviço (aptidão) das quantidades do pré-agendamento e recalcula */
  const addServicoPreAg = (idgeo, servId) => {
    const pre = (preAgendamentos || {})[idgeo];
    if (!pre || !servId) return;
    const q = { ...(pre.quantidades || {}) };
    if (q[servId] == null) q[servId] = 0;
    recalcularPreAgendamento(idgeo, q, pre.equipes || 1);
  };
  const removerServicoPreAg = (idgeo, servId) => {
    const pre = (preAgendamentos || {})[idgeo];
    if (!pre) return;
    const q = { ...(pre.quantidades || {}) };
    delete q[servId];
    recalcularPreAgendamento(idgeo, q, pre.equipes || 1);
  };
  /* Recalcula as 4 opções após ajuste fino das quantidades/equipes na tela de pré-agendamento */
  const recalcularPreAgendamento = (idgeo, quantidades, equipes, janelaSim) => {
    const lista = (planos || {})[idgeo] || [];
    const pre = gerarPreAgendamento(idgeo, lista, quantidades, equipes, janelaSim);
    if (pre) persist({ ...data, preAgendamentos: { ...(preAgendamentos || {}), [idgeo]: pre } });
  };
  /* recalcula TODOS os pré-agendamentos existentes com os dados atuais (chamado ao abrir a sub-aba).
     Preserva as quantidades/equipes já ajustadas; só atualiza a alocação do Motor. */
  recalcPreRef.current = () => {
    /* projetos que têm plano + programação mas ainda não têm pré-agendamento (ex.: ao carregar uma base) */
    const comPlano = Object.keys(planos || {}).filter((idgeo) => {
      const tap = taps.find((t) => t.idgeo === idgeo);
      return tap && !["Concluído", "Cancelado", "Em campo"].includes(tap.statusTap) && !(preAgendamentos || {})[idgeo];
    });
    const ids = Array.from(new Set([...Object.keys(preAgendamentos || {}), ...comPlano]));
    if (!ids.length) return;
    let mudou = false;
    const novos = { ...preAgendamentos };
    ids.forEach((idgeo) => {
      const tap = taps.find((t) => t.idgeo === idgeo);
      if (!tap || ["Concluído", "Cancelado", "Em campo"].includes(tap.statusTap)) return; // não mexe em quem já saiu para campo
      const ant = (preAgendamentos || {})[idgeo];
      const novo = gerarPreAgendamento(idgeo, (planos || {})[idgeo] || [], ant?.quantidades, ant?.equipes || 1);
      if (novo) { novos[idgeo] = novo; mudou = true; }
    });
    if (mudou) persist({ ...data, preAgendamentos: novos }, { semCarimbo: true });
  };
  /* Sugere 2-3 janelas de entrada em campo, deslizando no tempo a partir da data da TAP,
     pontuando cada janela pela disponibilidade dos recursos da opção (livre=2, parcial=1, bloqueado=0). */
  const sugerirJanelas = (os) => {
    if (!os || !os.diasCampo) return [];
    const tap = taps.find((t) => t.idgeo === os.idgeo);
    const dur = Math.max(1, os.diasCampo);
    const baseDate = tap?.entradaCampo ? new Date(tap.entradaCampo) : new Date();
    const recursos = [];
    (os.equipe || []).forEach((p) => { if (!p.vazio && p.mat) recursos.push(["pessoa", p.mat]); });
    if (os.maquina && os.maquina.cod) recursos.push(["maquina", os.maquina.cod]);
    if (os.veiculo && os.veiculo.placa) recursos.push(["frota", os.veiculo.placa]);
    (os.equipamentos || []).forEach((e) => { const cod = e && (e.cod || e); if (cod) recursos.push(["equipamento", cod]); });
    const tv = travas || {};
    const addDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    const iso = (d) => d.toISOString().slice(0, 10);
    /* candidatos: a partir da data da TAP, desliza de 7 em 7 dias (entrada, +1 sem, +2 sem, +1 mês) */
    const offsets = [0, 7, 14, 30, 45];
    const candidatos = offsets.map((off) => {
      const ini = addDias(baseDate, off);
      const fim = addDias(ini, dur - 1);
      const iniISO = iso(ini), fimISO = iso(fim);
      let score = 0, bloqueados = 0, parciais = 0, livres = 0;
      recursos.forEach(([tipo, id]) => {
        const st = statusNaJanela(((tv[tipo] || {})[id]) || [], iniISO, fimISO).nivel;
        if (st === "livre") { score += 2; livres++; }
        else if (st === "parcial") { score += 1; parciais++; }
        else { bloqueados++; }
      });
      return { ini: iniISO, fim: fimISO, dur, score, bloqueados, parciais, livres, totalRec: recursos.length };
    });
    /* ordena por menos bloqueados, depois maior score, depois mais cedo */
    candidatos.sort((a, b) => a.bloqueados - b.bloqueados || b.score - a.score || (a.ini < b.ini ? -1 : 1));
    return candidatos.slice(0, 3);
  };
  /* Gerente de Carteira escolhe uma das 4 opções e confirma → vira OS oficial + cria travas PARCIAIS automáticas */
  const confirmarPreAgendamento = (idgeo, opcaoId, janelaEscolhida) => {
    const pre = (preAgendamentos || {})[idgeo];
    if (!pre) return;
    const opcao = pre.opcoes.find((o) => o.id === opcaoId);
    if (!opcao || !opcao.os) return;
    const os = opcao.os;
    const tap = taps.find((t) => t.idgeo === idgeo);
    /* janela da trava: a escolhida pelo gestor, ou a janela do projeto */
    const janIni = (janelaEscolhida && janelaEscolhida.ini) || os.janelaIni || os.inicio || tap?.entradaCampo || hojeISO();
    const janFim = (janelaEscolhida && janelaEscolhida.fim) || os.janelaFim || os.fim || tap?.entregaRelatorio || janIni;
    /* cria travas PARCIAIS automáticas para todos os recursos da OS, atreladas ao IDGEO */
    const t = travas || { maquina: {}, equipamento: {}, frota: {}, pessoa: {} };
    const novoTravas = { maquina: { ...(t.maquina || {}) }, equipamento: { ...(t.equipamento || {}) }, frota: { ...(t.frota || {}) }, pessoa: { ...(t.pessoa || {}) } };
    const addTrava = (tipo, idRec) => {
      if (!idRec) return;
      const lista = [...(novoTravas[tipo][idRec] || [])];
      /* evita duplicar trava automática do mesmo IDGEO */
      if (lista.some((x) => x.idgeo === idgeo && x.auto)) return;
      lista.push({ id: "tv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ini: janIni, fim: janFim, nivel: "parcial", idgeo, obs: "Reserva automática (OS aprovada)", auto: true });
      lista.sort((a, b) => (a.ini < b.ini ? -1 : 1));
      novoTravas[tipo][idRec] = lista;
    };
    (os.equipe || []).forEach((p) => { if (!p.vazio && p.mat) addTrava("pessoa", p.mat); });
    if (os.maquina && os.maquina.cod) addTrava("maquina", os.maquina.cod);
    if (os.veiculo && os.veiculo.placa) addTrava("frota", os.veiculo.placa);
    /* equipamentos: trava automática quando o Motor os tiver selecionado (lista de códigos) */
    (os.equipamentos || []).forEach((e) => { const cod = e && (e.cod || e); if (cod) addTrava("equipamento", cod); });
    const novasOrdens = { ...ordens, [idgeo]: { ...os, status: "Aprovada", opcaoEscolhida: opcao.nome, janelaTrava: { ini: janIni, fim: janFim }, confirmadaPor: user?.aba || user?.carteira || "Gerente", confirmadaEm: new Date().toISOString() } };
    const novosTaps = taps.map((t2) => t2.idgeo === idgeo ? { ...t2, statusTap: "Em campo" } : t2);
    const novoPre = { ...(preAgendamentos || {}) }; delete novoPre[idgeo];
    persist({ ...data, ordens: novasOrdens, taps: novosTaps, preAgendamentos: novoPre, travas: novoTravas });
  };
  /* ---- Fluxo de autorizações operacionais (mobile → gestor do contrato) ---- */
  const criarAutorizacao = (sol) => {
    const tap = taps.find((t) => t.idgeo === sol.idgeo);
    const nova = {
      id: "aut_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      mat: sol.mat || user?.mat || "", nome: sol.nome || user?.aba || "",
      idgeo: sol.idgeo || "", projeto: tap?.projeto || "", carteira: tap?.carteira || sol.carteira || "",
      tipo: sol.tipo, data: sol.data || "", valor: sol.valor || "", justificativa: (sol.justificativa || "").trim(),
      status: "Pendente", decididoPor: null, decididoEm: null, motivo: "",
      criadoEm: new Date().toISOString(),
    };
    persist({ ...data, autorizacoes: [nova, ...(autorizacoes || [])] });
    setModal(null);
  };
  const decidirAutorizacao = (id, aprovar, motivo) => {
    const next = (autorizacoes || []).map((a) => a.id === id ? {
      ...a, status: aprovar ? "Aprovada" : "Negada",
      decididoPor: user?.aba || user?.carteira || "Gestor", decididoEm: new Date().toISOString(),
      motivo: (motivo || "").trim(),
    } : a);
    persist({ ...data, autorizacoes: next });
  };
  const excluirAutorizacao = (id) => { persist({ ...data, autorizacoes: (autorizacoes || []).filter((a) => a.id !== id) }); setConfirma(null); };
  /* ---- Apontamento diário de campo (RDO): produtividade real por dia, por IDGEO ---- */
  const salvarApontamento = (idgeo, ap) => {
    const lista = [...((apontamentos || {})[idgeo] || [])];
    const idx = lista.findIndex((x) => x.data === ap.data);
    const reg = { ...ap, lancadoEm: new Date().toISOString(), lancadoPor: user?.aba || user?.carteira || "Operações" };
    if (idx >= 0) lista[idx] = reg; else lista.push(reg);
    lista.sort((a, b) => (a.data < b.data ? -1 : 1));
    /* RDO realimenta o banco: recalcula o avanço real e grava na OS, para Dashboard, Inteligência e IA lerem o mesmo número. */
    const os = (ordens || {})[idgeo];
    let ordensNext = ordens;
    if (os) {
      const r = calcularRealizado({ ...os }, lista, custos);
      ordensNext = { ...ordens, [idgeo]: { ...os, avancoReal: r.avancoPct, custoRealizado: r.custoRealizado, kmReal: r.kmReal, diasApontados: r.diasApontados, naoConformidades: r.naoConformidades, ultimoRDO: ap.data, realizadoPorAtividade: r.porAtividade } };
    }
    persist({ ...data, apontamentos: { ...(apontamentos || {}), [idgeo]: lista }, ordens: ordensNext });
    setModal(null);
    /* se o avanço atingiu 100%, oferece concluir o projeto (libera recursos para realocação) */
    const av = os ? calcularRealizado({ ...os }, lista, custos).avancoPct : null;
    if (av != null && av >= 100) {
      const tap = taps.find((t) => t.idgeo === idgeo);
      if (tap && tap.statusTap !== "Concluído") setConfirma("concluir:" + idgeo);
    }
  };
  /* Conclui o projeto: marca a TAP como Concluído e LIBERA as travas dos recursos (ficam disponíveis para realocação).
     É o que permite à IA de Oportunidades sugerir o reaproveitamento da equipe e dos equipamentos liberados. */
  const concluirProjeto = (idgeo) => {
    const tap = taps.find((t) => t.idgeo === idgeo);
    const os = (ordens || {})[idgeo];
    const travasNext = JSON.parse(JSON.stringify(travas || { pessoa: {}, maquina: {}, frota: {}, equipamento: {} }));
    /* remove as travas automáticas (auto:true) deste IDGEO de todos os tipos de recurso */
    ["pessoa", "maquina", "frota", "equipamento"].forEach((tipo) => {
      Object.keys(travasNext[tipo] || {}).forEach((idRec) => {
        travasNext[tipo][idRec] = (travasNext[tipo][idRec] || []).filter((tv) => !(tv.idgeo === idgeo && tv.auto));
        if (travasNext[tipo][idRec].length === 0) delete travasNext[tipo][idRec];
      });
    });
    const ordensNext = os ? { ...ordens, [idgeo]: { ...os, status: "Concluída", concluidaEm: hojeISO() } } : ordens;
    persist({ ...data, taps: taps.map((t) => t.idgeo === idgeo ? { ...t, statusTap: "Concluído" } : t), ordens: ordensNext, travas: travasNext });
    setConfirma(null);
  };
  /* ---- Calendário de disponibilidade: travas de recursos ---- */
  const salvarTrava = (tipo, idRec, trava) => {
    const t = travas || { maquina: {}, equipamento: {}, frota: {}, pessoa: {} };
    const lista = [...((t[tipo] || {})[idRec] || [])];
    const reg = trava.id ? trava : { ...trava, id: "tv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) };
    const idx = lista.findIndex((x) => x.id === reg.id);
    if (idx >= 0) lista[idx] = reg; else lista.push(reg);
    lista.sort((a, b) => (a.ini < b.ini ? -1 : 1));
    persist({ ...data, travas: { ...t, [tipo]: { ...(t[tipo] || {}), [idRec]: lista } } });
  };
  const excluirTrava = (tipo, idRec, travaId) => {
    const t = travas || {};
    const lista = ((t[tipo] || {})[idRec] || []).filter((x) => x.id !== travaId);
    const tipoObj = { ...(t[tipo] || {}) };
    if (lista.length) tipoObj[idRec] = lista; else delete tipoObj[idRec];
    persist({ ...data, travas: { ...t, [tipo]: tipoObj } });
  };
  const excluirApontamento = (idgeo, dataAp) => {
    const lista = ((apontamentos || {})[idgeo] || []).filter((x) => x.data !== dataAp);
    const next = { ...(apontamentos || {}) };
    if (lista.length) next[idgeo] = lista; else delete next[idgeo];
    persist({ ...data, apontamentos: next });
    setConfirma(null);
  };
  const excluirPlano = (idgeo, planoId) => {
    const lista = ((planos || {})[idgeo] || []).filter((p) => p.id !== planoId);
    const next = { ...(planos || {}) };
    if (lista.length) next[idgeo] = lista; else delete next[idgeo];
    /* se ficou sem planos, TAP volta a aguardar */
    const novosTaps = lista.length === 0 ? taps.map((t) => (t.idgeo === idgeo && t.statusTap === "Plano de Trabalho recebido" ? { ...t, statusTap: "Aguardando Plano de Trabalho" } : t)) : taps;
    persist({ ...data, planos: next, taps: novosTaps });
  };
  const solicitarRevisao = (idgeo, texto) => {
    if (!texto || !texto.trim()) return;
    const p = programacoes[idgeo]; if (!p) return;
    const pedido = { por: user?.carteira || user?.aba || "Gerente", carteira: user?.carteira || "", texto: texto.trim(), em: hojeISO(), status: "Aberta" };
    persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, revisoes: [...(p.revisoes || []), pedido] } } });
  };
  /* Gera 4 cenários com vieses distintos (pesos diferentes) para o planejador comparar */
  const rodarCenarios = (idgeo) => {
    const tap = taps.find((t) => t.idgeo === idgeo);
    const prog = programacoes[idgeo] || (projetosInteligencia.find((x) => x.idgeo === idgeo) || {}).p;
    if (!tap || !prog) return [];
    const baseCtx = { colaboradores, aptidoes, sms, maquinas, frota, equipamentos, equipPorAtividade, apontamentos, ordens, asos, contratos, condicionantes, dispDe, afastAtivo, emFerias, regrasEquipe, custos, precosUnitarios, produtividade, travas };
    const vieses = [
      { id: "custo", nome: "Menor custo", icone: "💰", desc: "Prioriza reduzir o custo total da execução", pesos: { qualidade: 6, custo: 10, rota: 5, tempo: 4, proximidade: 8, conformidade: 3 } },
      { id: "logistica", nome: "Melhor logística", icone: "🛣", desc: "Prioriza rotas curtas e equipe próxima da obra", pesos: { qualidade: 6, custo: 5, rota: 10, tempo: 6, proximidade: 10, conformidade: 3 } },
      { id: "tempo", nome: "Menor tempo", icone: "⏱", desc: "Prioriza concluir o campo e entregar no menor prazo", pesos: { qualidade: 8, custo: 4, rota: 6, tempo: 10, proximidade: 6, conformidade: 3 } },
    ];
    try {
      return vieses.map((v) => {
        const progV = { ...prog, executivo: { ...(prog.executivo || {}), pesos: v.pesos } };
        const os = motorAlocar({ tap, prog: progV, ctx: baseCtx });
        return { ...v, os };
      });
    } catch (err) {
      console.error("Erro na Simulação:", err);
      alert("Não foi possível gerar os cenários. Verifique colaboradores, regras de equipe e quantidades. Detalhe: " + (err && err.message ? err.message : err));
      return [];
    }
  };
  /* Planejador escolhe um cenário -> fica pendente de validação do gerente */
  const escolherCenario = (idgeo, cenario) => {
    const p = programacoes[idgeo]; if (!p) return;
    const sel = { vies: cenario.id, nome: cenario.nome, os: cenario.os, escolhidoPor: user?.aba || "Planejador", em: hojeISO(), status: "Aguardando validação", historico: [...((p.cenarioSel && p.cenarioSel.historico) || [])] };
    persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, cenarioSel: sel } } });
  };
  /* Gerente valida ou rejeita o cenário escolhido */
  /* ===== CENÁRIOS: check-up consolidado lendo todas as abas funcionais e enviando à IA ===== */
  const montarSnapshot = () => {
    const hoje = hojeISO();
    /* projetos com OS aprovada (em andamento) e seus custos/prazos */
    const projetosAtivos = Object.entries(ordens || {}).map(([idgeo, os]) => {
      const tap = taps.find((t) => t.idgeo === idgeo);
      const atrasado = os.janelaFim && os.janelaFim < hoje;
      /* avanço real do RDO: quanto já foi executado e quanto falta (a IA usa para prever liberação de recursos) */
      const r = calcularRealizado({ ...os }, (apontamentos || {})[idgeo], custos);
      const equipeAlocada = (os.equipe || []).filter((e) => !e.vazio).map((e) => ({ mat: e.mat, nome: e.nome, papel: e.papel }));
      return {
        idgeo, projeto: os.projeto, cliente: os.cliente, local: os.local, uf: tap?.uf || "",
        custoTotal: os.custoTotal, diasCampo: os.diasCampo, inicio: os.janelaIni || os.inicio, fim: os.janelaFim || os.fim,
        status: tap?.statusTap || os.status, atrasado,
        avancoReal: r.avancoPct, percentualFalta: r.avancoPct == null ? null : Math.max(0, 100 - r.avancoPct),
        diasApontados: r.diasApontados, naoConformidades: r.naoConformidades,
        recursosEmUso: { equipe: equipeAlocada, maquina: os.maquina?.cod || null, veiculo: os.veiculo?.placa || null, equipamentos: (os.equipamentos || []).map((e) => e.cod) },
        previsaoLiberacao: os.janelaFim || os.fim,
      };
    });
    /* projetos aguardando plano (oportunidades de antecipação) */
    const aguardandoPlano = taps.filter((t) => ["Aguardando Plano de Trabalho", "Plano de Trabalho recebido", "Pré-agendado"].includes(t.statusTap))
      .map((t) => ({ idgeo: t.idgeo, projeto: t.projeto, cliente: t.cliente, cidade: t.cidade, uf: t.uf, entradaCampo: t.entradaCampo, status: t.statusTap }));
    /* SAÍDA DO MOTOR DE ALOCAÇÃO: para cada projeto pré-agendado, a melhor opção real
       (equipe sugerida, distâncias, custo, conflitos e alertas) — para a IA recomendar logística de verdade. */
    const alocacoesMotor = [];
    Object.keys(preAgendamentos || {}).forEach((idgeo) => {
      const pre = preAgendamentos[idgeo];
      const tap = taps.find((t) => t.idgeo === idgeo);
      if (!tap || !pre) return;
      const opcao = (pre.opcoes || []).find((o) => o.vies === (pre.escolha || "custo")) || (pre.opcoes || [])[0];
      if (!opcao || !opcao.os) return;
      const os = opcao.os;
      alocacoesMotor.push({
        idgeo, projeto: tap.projeto, cliente: tap.cliente, local: os.local,
        equipe: (os.equipe || []).filter((e) => !e.vazio).map((e) => ({ nome: e.nome, papel: e.papel, distanciaKm: e.dist, viagem: e.dispViagem, confirmarViagem: !!e.confirmarViagem, posicaoDesatualizada: !!e.posicaoVelha, naoConformidadesRecentes: e.ncRecente || 0 })),
        vagasNaoPreenchidas: (os.equipe || []).filter((e) => e.vazio).length,
        maquina: os.maquina ? os.maquina.cod : null,
        veiculo: os.veiculo ? os.veiculo.placa : null,
        equipamentos: (os.equipamentos || []).map((e) => ({ cod: e.cod, calibracaoVenceNaJanela: !!e.calibVenceNaJanela })),
        distanciaMatrizKm: os.distMatriz, kmTotal: os.kmTotal, diasCampo: os.diasCampo,
        custoTotal: os.custoTotal, janela: { inicio: os.janelaIni, fim: os.janelaFim },
        alertas: (os.alertas || []).map((a) => (typeof a === "string" ? a : a.txt)),
      });
    });
    /* não conformidades e atrasos a partir dos apontamentos diários */
    const apts = Object.values(apontamentos || {}).flat();
    const naoConformidades = apts.filter((a) => a && (a.naoConforme || a.ocorrencia)).length;
    return {
      dataLeitura: new Date().toISOString(),
      estrutura: {
        colaboradores: colaboradores.length,
        ativos: colaboradores.filter((c) => c.status === "Ativo").length,
        ferias: colaboradores.filter((c) => c.status === "Férias").length,
        cargos: [...new Set(colaboradores.map((c) => c.cargo))],
        maquinas: maquinas.length, maquinasDisponiveis: maquinas.filter((m) => m.status === "Disponível").length,
        veiculos: frota.length, equipamentos: equipamentos.length,
      },
      comercial: { clientes: clientes.length, contratos: contratos.length, taps: taps.length },
      projetosAtivos,
      aguardandoPlano,
      alocacoesMotor,
      indicadores: {
        projetosEmCampo: projetosAtivos.filter((p) => p.status === "Aprovada").length,
        projetosAtrasados: projetosAtivos.filter((p) => p.atrasado).length,
        custoTotalCarteira: projetosAtivos.reduce((s, p) => s + (p.custoTotal || 0), 0),
        naoConformidades,
        oportunidadesAntecipacao: aguardandoPlano.length,
      },
    };
  };
  const rodarCheckup = async () => {
    if (checkupCarregando) return;
    setCheckupCarregando(true);
    const snap = montarSnapshot();
    setCheckupEm(snap.dataLeitura);
    try {
      const prompt = `Você é o motor de inteligência operacional da GEOAMBIENTE S/A (engenharia ambiental, base em Curitiba). Recebe um SNAPSHOT consolidado da operação, lido das abas funcionais do sistema, incluindo a SAÍDA DO MOTOR DE ALOCAÇÃO ("alocacoesMotor") e o AVANÇO REAL de cada projeto em campo ("projetosAtivos", com avancoReal, percentualFalta, recursosEmUso e previsaoLiberacao, alimentados pelo RDO diário). Use esses dados concretos para raciocinar sobre LOGÍSTICA REAL e sobre a LIBERAÇÃO PROGRESSIVA DE RECURSOS conforme os projetos avançam. Produza um diagnóstico e recomendações em JSON com EXATAMENTE estes campos:
- "resumoExecutivo": texto curto com a leitura geral da operação agora.
- "saudeProjetos": lista de objetos { "idgeo": string, "status": string, "alerta": string } para projetos ativos com risco (atraso, custo, não conformidade, avanço lento).
- "indicadoresChave": lista de strings com os números mais relevantes (custo total da carteira, avanço médio, atrasos, não conformidades).
- "logistica": lista de objetos { "idgeo": string, "diagnostico": string, "acao": string } — analise "alocacoesMotor": equipes distantes da obra, vagas não preenchidas, viagens a confirmar, calibração vencendo.
- "realocacao": lista de objetos { "recurso": string, "idgeoOrigem": string, "idgeoDestino": string, "quando": string, "beneficio": string } — com base no AVANÇO REAL ("projetosAtivos"): identifique projetos próximos de concluir (avancoReal alto, percentualFalta baixo) cujos recursos (equipe/máquina/equipamento em "recursosEmUso") serão liberados em "previsaoLiberacao", e proponha realocá-los para projetos "aguardandoPlano" ou em campo que precisem deles, reduzindo custo logístico ou acelerando entregas.
- "oportunidades": lista de objetos { "titulo": string, "descricao": string, "tipo": "reducao_custo"|"ampliacao_faturamento", "idgeosEnvolvidos": [string] } — relocações e antecipações por proximidade geográfica e temporal.
- "alertas": lista de strings com pontos de atenção imediata.
SNAPSHOT: ${JSON.stringify(snap)}
Responda SOMENTE com o JSON.`;
      const resp = await fetch("/api/analisar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
      });
      const dd = await resp.json();
      if (dd.error) throw new Error(dd.detalhe || dd.error);
      const txt = (dd.content || []).map((b) => b.text || "").join("\n").replace(/```json|```/g, "").trim();
      let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { resumoExecutivo: txt }; }
      const resultado = { ...parsed, snap };
      setCheckup(resultado);
      /* Persiste esta leitura no histórico versionado (cache permanente).
         Cada leitura vira um registro com data/hora, autor e conteúdo completo,
         de onde o PDF daquela versão pode ser gerado a qualquer momento. */
      const registro = {
        id: "leitura-" + Date.now(),
        em: snap.dataLeitura || new Date().toISOString(),
        por: (user && (user.responsavel || user.aba || user.id)) || "—",
        checkup: resultado,
      };
      const histAtual = Array.isArray(data.historicoInteligencia) ? data.historicoInteligencia : [];
      const novoHist = [registro, ...histAtual].slice(0, 60); // mantém as 60 leituras mais recentes
      persist({ ...data, historicoInteligencia: novoHist }, { semCarimbo: true });
    } catch (err) {
      /* sem API: mostra ao menos os indicadores calculados offline */
      const msgC = (err && err.message) ? String(err.message) : "";
      const offlineC = msgC.includes("Failed to fetch") || msgC.includes("NetworkError") || msgC.includes("Unexpected token");
      setCheckup({ erro: offlineC ? "A leitura por IA roda no sistema publicado (com a API conectada). Abaixo, os indicadores calculados localmente." : ("Erro na análise por IA: " + msgC), snap, offline: true });
    } finally {
      setCheckupCarregando(false);
    }
  };
  /* leitura inicial ao abrir a aba Inteligência — hook declarado no topo do componente (sem repetição automática).
     Carrega a ÚLTIMA leitura salva (cache) se houver; só chama a IA se não houver nenhuma. */
  checkupRef.current = () => {
    if (checkup) return;
    const hist = Array.isArray(data.historicoInteligencia) ? data.historicoInteligencia : [];
    if (hist.length > 0 && hist[0].checkup) {
      setCheckup(hist[0].checkup);
      setCheckupEm(hist[0].em);
    } else {
      rodarCheckup();
    }
  };

  /* ===== CHAT INTERATIVO DA INTELIGÊNCIA (Fase 3) =====
     O gestor conversa com a IA sobre a operação. A IA tem o snapshot completo e pode:
     - responder/aconselhar sobre equipes, prazos, equipamentos, logística, custos;
     - PROPOR uma ação concreta (ex: priorizar um projeto), que o usuário confirma antes de aplicar.
     Toda proposta de alteração passa por confirmação — a IA nunca altera o sistema sozinha. */
  const ACOES_IA = {
    priorizar: (args) => {
      const idgeo = args.idgeo;
      const p = programacoes[idgeo];
      if (!p) return { ok: false, msg: `Projeto ${idgeo} não tem programação.` };
      const prog2 = { ...programacoes, [idgeo]: { ...p, prioridade: "Alta" } };
      persist({ ...data, programacoes: prog2 });
      return { ok: true, msg: `Prioridade de ${idgeo} elevada para Alta.` };
    },
    ajustar_pesos: (args) => {
      const idgeo = args.idgeo;
      const p = programacoes[idgeo];
      if (!p) return { ok: false, msg: `Projeto ${idgeo} não tem programação.` };
      const pesos = { ...(p.executivo?.pesos || PESOS_PADRAO), ...(args.pesos || {}) };
      const prog2 = { ...programacoes, [idgeo]: { ...p, executivo: { ...(p.executivo || {}), pesos } } };
      persist({ ...data, programacoes: prog2 });
      return { ok: true, msg: `Pesos do Motor ajustados em ${idgeo}.` };
    },
  };

  const enviarChat = async (texto) => {
    const msg = (texto || "").trim();
    if (!msg) return;
    const novasMsgs = [...chatMsgs, { role: "user", content: msg }];
    setChatMsgs(novasMsgs);
    setChatInput("");
    setChatCarregando(true);
    const snap = montarSnapshot();
    const podeExecutar = ehMaster || podeEditarDominio(user, "ia_chat");
    const sistema = `Você é o estrategista de operações da GEOAMBIENTE S/A, conversando com um gestor sobre a operação real. Você tem o SNAPSHOT completo da operação (projetos, equipes, recursos, custos, conflitos). Responda em português, de forma objetiva e prática, focada em: equipes, prazos, equipamentos, logística e custos. Use os dados do snapshot — cite IDGEOs, nomes, números reais.

${podeExecutar ? `Você PODE propor UMA ação concreta quando o gestor pedir uma mudança. Ações disponíveis:
- priorizar: eleva a prioridade de um projeto. args: { "idgeo": "XX26000" }
- ajustar_pesos: ajusta os pesos do Motor de um projeto. args: { "idgeo": "XX26000", "pesos": { "custo": 10, "rota": 8 } }
Quando propuser uma ação, responda em JSON: { "resposta": "texto explicando", "acao": { "tipo": "priorizar", "args": {...}, "descricao": "o que vai mudar" } }. NUNCA execute sozinho — o gestor confirma.` : "Você responde e aconselha, mas NÃO executa alterações (este usuário não tem permissão de execução)."}

Quando for só conversa/conselho (sem ação), responda em JSON: { "resposta": "texto" }.
Responda SEMPRE em JSON válido, sem markdown.
SNAPSHOT: ${JSON.stringify(snap)}`;

    try {
      const resp = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: sistema,
          messages: novasMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const dataResp = await resp.json();
      if (dataResp.error) throw new Error(dataResp.detalhe || dataResp.error);
      const txt = (dataResp.content || []).map((c) => c.text || "").join("\n").trim();
      let parsed; try { parsed = JSON.parse(txt.replace(/```json|```/g, "").trim()); } catch { parsed = { resposta: txt }; }
      setChatMsgs((cur) => [...cur, { role: "assistant", content: parsed.resposta || "(sem resposta)" }]);
      if (parsed.acao && podeExecutar && ACOES_IA[parsed.acao.tipo]) {
        setChatProposta(parsed.acao);
      }
    } catch (err) {
      const m = (err && err.message) ? String(err.message) : "";
      const offline = m.includes("Failed to fetch") || m.includes("NetworkError") || m.includes("Unexpected token");
      setChatMsgs((cur) => [...cur, { role: "assistant", content: offline ? "O chat com IA roda no sistema publicado (com a API conectada)." : ("Erro: " + m) }]);
    } finally {
      setChatCarregando(false);
    }
  };

  const confirmarAcaoIA = () => {
    if (!chatProposta) return;
    const fn = ACOES_IA[chatProposta.tipo];
    const res = fn ? fn(chatProposta.args || {}) : { ok: false, msg: "Ação desconhecida." };
    setChatMsgs((cur) => [...cur, { role: "assistant", content: (res.ok ? "✓ " : "⚠ ") + res.msg }]);
    setChatProposta(null);
  };

  /* ===== RELATÓRIO PDF DA INTELIGÊNCIA =====
     Gera um documento estruturado por temas a partir da análise da IA (checkup),
     usando a mesma técnica leve do parecer (janela + window.print → salvar como PDF). */
  const baixarRelatorioInteligencia = (checkupArg, emArg) => {
    const checkup = (checkupArg && checkupArg.resumoExecutivo !== undefined) ? checkupArg : checkupAtualRef.current;
    if (!checkup || checkup.erro) { alert("Rode a análise da Inteligência antes de gerar o relatório."); return; }
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const dt = emArg ? new Date(emArg) : (checkupEm ? new Date(checkupEm) : new Date());
    const dataStr = dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const snap = checkup.snap || {};
    /* seção: indicadores-chave */
    const indicadores = Array.isArray(checkup.indicadoresChave) && checkup.indicadoresChave.length
      ? "<ul>" + checkup.indicadoresChave.map((x) => `<li>${esc(x)}</li>`).join("") + "</ul>" : "<p class='vazio'>—</p>";
    /* seção: saúde dos projetos (cada projeto com status e alerta) */
    const saude = Array.isArray(checkup.saudeProjetos) && checkup.saudeProjetos.length
      ? checkup.saudeProjetos.map((p) => `<div class="proj"><div class="proj-h">${esc(p.idgeo)} <span class="tag">${esc(p.status)}</span></div><p>${esc(p.alerta)}</p></div>`).join("")
      : "<p class='vazio'>Sem projetos em risco no momento.</p>";
    /* seção: logística por projeto */
    const logistica = Array.isArray(checkup.logistica) && checkup.logistica.length
      ? checkup.logistica.map((l) => `<div class="item"><div class="item-h">${esc(l.idgeo)}</div><p><b>Diagnóstico:</b> ${esc(l.diagnostico)}</p><p><b>Ação:</b> ${esc(l.acao)}</p></div>`).join("")
      : "<p class='vazio'>—</p>";
    /* seção: realocação de recursos */
    const realocacao = Array.isArray(checkup.realocacao) && checkup.realocacao.length
      ? "<table><thead><tr><th>Recurso</th><th>De → Para</th><th>Quando</th><th>Benefício</th></tr></thead><tbody>" +
        checkup.realocacao.map((r) => `<tr><td>${esc(r.recurso)}</td><td>${esc(r.idgeoOrigem)} → ${esc(r.idgeoDestino)}</td><td>${esc(r.quando)}</td><td>${esc(r.beneficio)}</td></tr>`).join("") +
        "</tbody></table>"
      : "<p class='vazio'>Nenhuma realocação sugerida.</p>";
    /* seção: oportunidades */
    const oportunidades = Array.isArray(checkup.oportunidades) && checkup.oportunidades.length
      ? checkup.oportunidades.map((o) => `<div class="item"><div class="item-h">${esc(o.titulo)} <span class="tag ${o.tipo === "reducao_custo" ? "tag-verde" : "tag-azul"}">${o.tipo === "reducao_custo" ? "Redução de custo" : "Ampliação de faturamento"}</span></div><p>${esc(o.descricao)}</p>${Array.isArray(o.idgeosEnvolvidos) && o.idgeosEnvolvidos.length ? `<p class="sub">Projetos: ${o.idgeosEnvolvidos.map(esc).join(", ")}</p>` : ""}</div>`).join("")
      : "<p class='vazio'>—</p>";
    /* seção: alertas */
    const alertas = Array.isArray(checkup.alertas) && checkup.alertas.length
      ? "<ul>" + checkup.alertas.map((x) => `<li>${esc(x)}</li>`).join("") + "</ul>" : "<p class='vazio'>Sem alertas imediatos.</p>";
    /* resumo numérico da operação (do snapshot) */
    const r = snap.resumo || {};
    const resumoNum = `<div class="kpis">
      <div class="kpi"><div class="kpi-n">${r.projetosEmCampo != null ? r.projetosEmCampo : "—"}</div><div class="kpi-l">Em campo</div></div>
      <div class="kpi"><div class="kpi-n">${(snap.aguardandoPlano || []).length}</div><div class="kpi-l">Aguardando plano</div></div>
      <div class="kpi"><div class="kpi-n">${r.projetosAtrasados != null ? r.projetosAtrasados : "—"}</div><div class="kpi-l">Atrasados</div></div>
      <div class="kpi"><div class="kpi-n">${r.naoConformidades != null ? r.naoConformidades : "—"}</div><div class="kpi-l">Não conformidades</div></div>
    </div>`;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Inteligência Operacional — GeoópS</title>
      <style>
        body{font-family:Georgia,'Times New Roman',serif;max-width:820px;margin:30px auto;color:#1a2426;line-height:1.5;padding:0 16px}
        .cap{border-bottom:3px solid #0F2E4D;padding-bottom:14px;margin-bottom:8px}
        h1{font-size:23px;color:#0F2E4D;margin:0 0 4px}
        .sub{color:#5a6b6e;font-size:12px;margin:2px 0}
        h2{font-size:15px;color:#1F5C8A;margin:26px 0 8px;border-bottom:1px solid #d0dae0;padding-bottom:4px}
        ul{margin:6px 0;padding-left:20px}li{margin:3px 0;font-size:12.5px}p{font-size:12.5px;margin:5px 0}
        .vazio{color:#999;font-style:italic}
        .proj{border-left:3px solid #1F5C8A;padding:4px 0 4px 12px;margin:8px 0;background:#f6f9fb}
        .proj-h{font-weight:bold;color:#0F2E4D;font-size:13px}
        .item{margin:10px 0;padding:8px 12px;border:1px solid #e2e8ec;border-radius:8px}
        .item-h{font-weight:bold;color:#0F2E4D;font-size:13px;margin-bottom:3px}
        .tag{display:inline-block;font-size:10px;font-weight:normal;color:#fff;background:#7a8a8e;border-radius:10px;padding:1px 8px;margin-left:6px;vertical-align:middle}
        .tag-verde{background:#1E7E45}.tag-azul{background:#1F5C8A}
        table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11.5px}
        th{background:#0F2E4D;color:#fff;text-align:left;padding:6px 8px}td{border:1px solid #d0dae0;padding:5px 8px;vertical-align:top}
        .kpis{display:flex;gap:10px;margin:10px 0}
        .kpi{flex:1;border:1px solid #d0dae0;border-radius:8px;padding:10px;text-align:center}
        .kpi-n{font-size:22px;font-weight:bold;color:#0F2E4D}.kpi-l{font-size:10px;color:#5a6b6e;text-transform:uppercase}
        .foot{margin-top:30px;border-top:1px solid #d0dae0;padding-top:8px;color:#7a8a8e;font-size:11px}
        @media print{body{margin:0}h2{page-break-after:avoid}.item,.proj{page-break-inside:avoid}}
      </style></head><body>
      <div class="cap">
        <h1>Relatório de Inteligência Operacional</h1>
        <p class="sub">GeoópS · GEOAMBIENTE S/A · Análise gerada em ${esc(dataStr)}</p>
      </div>
      ${resumoNum}
      <h2>1. Resumo Executivo</h2>
      <p>${esc(checkup.resumoExecutivo || "—")}</p>
      <h2>2. Indicadores-Chave</h2>
      ${indicadores}
      <h2>3. Saúde dos Projetos</h2>
      ${saude}
      <h2>4. Logística e Alocação</h2>
      ${logistica}
      <h2>5. Realocação de Recursos</h2>
      ${realocacao}
      <h2>6. Oportunidades</h2>
      ${oportunidades}
      <h2>7. Alertas Imediatos</h2>
      ${alertas}
      <div class="foot">Documento gerado automaticamente pelo GeoópS a partir da análise por IA da operação · www.geoops.ia.br · Desenvolvido por Everton Maurício Carvalho · GEOAMBIENTE S/A</div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    else alert("Permita pop-ups para gerar o relatório em PDF.");
  };



  const validarCenario = (idgeo, aprovado, motivo) => {
    const p = programacoes[idgeo]; if (!p || !p.cenarioSel) return;
    const cs = p.cenarioSel;
    if (aprovado) {
      const os = { ...cs.os, status: "Aprovada", aprovadaEm: hojeISO(), aceites: { gerente: { por: user?.carteira || "Gerente", em: hojeISO() }, rotas: cs.os.aceites?.rotas || null } };
      persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, cenarioSel: { ...cs, status: "Validado", validadoPor: user?.carteira || "Gerente", validadoEm: hojeISO() } } },
        ordens: { ...ordens, [idgeo]: os }, taps: taps.map((t) => t.idgeo === idgeo ? { ...t, statusTap: "Em campo" } : t) });
    } else {
      const hist = [...(cs.historico || []), { vies: cs.vies, nome: cs.nome, rejeitadoPor: user?.carteira || "Gerente", motivo: motivo || "", em: hojeISO() }];
      persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, cenarioSel: { ...cs, status: "Rejeitado", motivoRejeicao: motivo || "", historico: hist } } } });
    }
  };
  /* Aceite da programação: registra a assinatura do papel; trava (Aprovada) só quando ambos assinarem */
  const aceitarOS = (os, papel) => {
    const assinatura = { por: user?.carteira || user?.aba || "—", em: hojeISO() };
    const aceitesAtuais = { ...(os.aceites || { gerente: null, rotas: null }), [papel]: assinatura };
    const completo = aceitesAtuais.gerente && aceitesAtuais.rotas;
    const osNova = { ...os, aceites: aceitesAtuais, status: completo ? "Aprovada" : os.status, aprovadaEm: completo ? hojeISO() : os.aprovadaEm };
    persist({
      ...data,
      ordens: { ...ordens, [os.idgeo]: osNova },
      taps: completo ? taps.map((t) => t.idgeo === os.idgeo ? { ...t, statusTap: "Em campo" } : t) : taps,
    });
    setModal({ tipo: "os", os: osNova });
  };
  const salvarOS = (os) => persist({ ...data, ordens: { ...ordens, [os.idgeo]: os } });
  const salvarCustos = (novos) => persist({ ...data, custos: { ...custos, ...novos } });
  const salvarPrecos = (lista) => persist({ ...data, precosUnitarios: lista });
  const salvarProdutividade = (novos) => persist({ ...data, produtividade: { ...produtividade, ...novos } });
  /* adiciona um novo serviço/aptidão à lista canônica (reflete em aptidões, produtividade, preços, Motor) */
  const adicionarServico = (servico) => {
    const id = (servico.id || "").trim() || ("serv_" + Date.now().toString(36));
    if (ATIVIDADES.some((a) => a.id === id) || !servico.label || !servico.label.trim()) return false;
    const novo = { id, label: servico.label.trim(), short: (servico.short || "").trim() || servico.label.trim().slice(0, 24), unidProd: servico.unidProd || "unid/dia" };
    const novosCustom = [...(servicosCustom || []), novo];
    /* se o id estava na lista de ocultos (re-adição), retira de lá */
    const novosOcultos = (servicosOcultos || []).filter((x) => x !== id);
    sincAtividades(novosCustom, novosOcultos);
    const novaProd = { ...produtividade, [id]: produtividade[id] != null ? produtividade[id] : 0 };
    persist({ ...data, servicosCustom: novosCustom, servicosOcultos: novosOcultos, produtividade: novaProd });
    return true;
  };
  /* remove um serviço — se for customizado, exclui de vez; se for base, oculta da lista */
  const removerServico = (id) => {
    const ehBase = ATIVIDADES_BASE.some((a) => a.id === id);
    const novosCustom = (servicosCustom || []).filter((s) => s.id !== id);
    const novosOcultos = ehBase && !(servicosOcultos || []).includes(id) ? [...(servicosOcultos || []), id] : (servicosOcultos || []);
    sincAtividades(novosCustom, novosOcultos);
    persist({ ...data, servicosCustom: novosCustom, servicosOcultos: novosOcultos });
    setConfirma(null);
  };
  const salvarRegra = (atvId, regra) => persist({ ...data, regrasEquipe: { ...regrasEquipe, [atvId]: regra } });
  const resetRegra = (atvId) => persist({ ...data, regrasEquipe: { ...regrasEquipe, [atvId]: REGRAS_PADRAO[atvId] ? normalizarRegra(REGRAS_PADRAO[atvId]) : { cargos: [], exigeRespTec: false } } });
  /* Cria um projeto + programação manualmente (sem vir do Holmes) */
  const criarProgManual = (dados) => {
    const idgeo = dados.idgeo && dados.idgeo.trim() ? dados.idgeo.trim() : "MAN-" + Date.now().toString(36).toUpperCase().slice(-5);
    if (taps.some((t) => t.idgeo === idgeo)) { return false; } // evita duplicar
    const novoTap = {
      idgeo, projeto: dados.projeto || "Projeto manual", cliente: dados.cliente || "", cidade: dados.cidade || "", uf: dados.uf || "",
      carteira: dados.carteira || "", statusTap: "Programado", origem: "Manual",
      entradaCampo: dados.inicioPrev || "", entregaRelatorio: dados.fimPrev || "",
    };
    const novaProg = {
      idgeo, local: dados.cidade || "", uf: dados.uf || "", prioridade: dados.prioridade || "Média",
      inicioPrev: dados.inicioPrev || "", fimPrev: dados.fimPrev || "", equipes: 1,
      atividades: (dados.atividades || []).map((a) => ({ id: a.id, qtd: a.qtd || 0 })),
      status: "Programado",
      executivo: { anexos: [], notas: dados.notas || "", pesos: { ...PESOS_PADRAO } },
      cronograma: { blocos: [] }, revisoes: [], aceites: { gerente: null, rotas: null },
    };
    /* cria também um Plano de Trabalho mínimo, para o projeto manual fluir à Inteligência/Motor
       como qualquer outro (antes, programação manual virava um beco sem saída sem plano). */
    const planoManual = [{
      id: "PT-" + idgeo,
      nome: "Plano de Trabalho (programação manual)",
      anexos: [],
      analiseIA: { atividades: (dados.atividades || []).map((a) => ({ servico: (ATIVIDADES.find((x) => x.id === a.id) || {}).short || a.id, quantidade: a.qtd || 0 })) },
      em: hojeISO(),
    }];
    persist({ ...data, taps: [novoTap, ...taps], programacoes: { ...programacoes, [idgeo]: novaProg }, planos: { ...(planos || {}), [idgeo]: planoManual } });
    setModal(null);
    return true;
  };
  const salvarExecutivo = (idgeo, exec) => { const p = programacoes[idgeo]; if (!p) return; persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, executivo: exec } } }); };
  const salvarCronograma = (idgeo, crono) => { const p = programacoes[idgeo]; if (!p) return; persist({ ...data, programacoes: { ...programacoes, [idgeo]: { ...p, cronograma: crono } } }); };
  const salvarProg = (idgeo, prog, confirmar) => {
    const next = { ...programacoes, [idgeo]: { ...prog, status: confirmar ? "Programado" : "Rascunho" } };
    const taps2 = confirmar ? taps.map((t) => t.idgeo === idgeo && t.statusTap === "Aguardando programação" ? { ...t, statusTap: "Programado" } : t) : taps;
    persist({ ...data, programacoes: next, taps: taps2 });
    setModal(null);
  };
  const excluirProg = (idgeo) => {
    const next = { ...programacoes }; delete next[idgeo];
    persist({ ...data, programacoes: next, taps: taps.map((t) => t.idgeo === idgeo && t.statusTap === "Programado" ? { ...t, statusTap: "Aguardando programação" } : t) });
    setConfirma(null); setModal(null);
  };
  const setStatusTap = (idgeo, st) => persist({ ...data, taps: taps.map((t) => t.idgeo === idgeo ? { ...t, statusTap: st } : t) });
  const excluirTap = (idgeo) => { persist({ ...data, taps: taps.filter((t) => t.idgeo !== idgeo) }); setConfirma(null); };

    const importarPosV = (rows) => {
    persist({ ...data, frota: frota.map((v) => {
      const r = rows.find((x) => x.placa === v.placa);
      return r ? { ...v, localAtual: r.cidade, dataLocal: r.data, lat: r.lat ?? v.lat ?? "", lng: r.lng ?? v.lng ?? "" } : v;
    }) });
    setModal(null);
  };
  const importarDocs = (rows) => {
    const next = { ...docsCnpj };
    rows.forEach((r) => { next[r.key] = { ...(next[r.key] || {}), ...r.docs }; });
    persist({ ...data, docsCnpj: next });
    setModal(null);
  };
  const importarCt = (novos) => { persist({ ...data, contratos: [...contratos, ...novos] }); setModal(null); };
  const salvarCliente = (c) => {
    const idx = clientes.findIndex((x) => x.nome === c.nome);
    persist({ ...data, clientes: idx >= 0 ? clientes.map((x, i) => (i === idx ? c : x)) : [...clientes, c] });
    setModal(null);
  };
  /* Monta o e-mail formatado de cadastro do projeto e abre o cliente de e-mail (cliente + gerente em cópia) */
  const notificarProjeto = (c) => {
    const gerenteEmail = `gerente.${(c.carteira || "").toLowerCase()}@geoambiente.eng.br`; // padrão até cadastro dos gerentes reais
    const gerenteNome = c.carteira ? `Gerente da Carteira ${c.carteira}` : "[NOME DO GERENTE DE PROJETO]";
    const para = [c.emailCliente].filter(Boolean).join(",");
    const cc = gerenteEmail;
    const assunto = `GeoópS.ia · Projeto registrado e em programação — ${c.nome}`;
    const linkPortal = `https://www.geoops.ia.br/acompanhamento/${encodeURIComponent((c.nome || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}`;
    const d = (x) => x ? fmtData(x) : "a definir";
    const corpo =
`Prezados(as),

Temos a satisfação de informar que seu projeto foi devidamente registrado em nossa plataforma inteligente de gestão operacional, GeoópS.ia, e encontra-se em fase de programação para execução das atividades contratadas.

A condução técnica e operacional do projeto será realizada pelo(a) ${gerenteNome}, que atuará como responsável pela coordenação dos trabalhos, acompanhamento das entregas e interlocução técnica ao longo de todo o desenvolvimento do projeto.

Para proporcionar maior transparência e rastreabilidade das atividades, disponibilizamos abaixo o acesso ao portal de acompanhamento do projeto, onde poderão ser consultados os principais marcos, cronograma, status de execução, documentos emitidos e previsões de entrega:

Portal GeoópS.ia
🔗 ${linkPortal}

Principais Marcos Planejados
• Início das atividades de campo: ${d(c.prazoEntradaCampo)}
• Conclusão das atividades de campo: ${d(c.prazoConclusaoCampo)}
• Emissão do relatório técnico: ${d(c.prazoRelatorio)}
• Entrega final do projeto: ${d(c.prazoEntregaFinal)}${c.prazoCartaOrgao ? `\n• Envio de carta ao órgão ambiental: ${d(c.prazoCartaOrgao)}` : ""}

Nosso compromisso é proporcionar uma gestão transparente, eficiente e baseada em dados, permitindo que nossos clientes acompanhem a evolução dos trabalhos em tempo real e com total visibilidade sobre cada etapa do projeto.

Agradecemos a confiança depositada na GEOAMBIENTE e permanecemos à disposição para quaisquer esclarecimentos.

Atenciosamente,

GEOAMBIENTE S/A
GeoópS.ia | Inteligência Operacional para Gestão de Projetos Ambientais`;
    const mailto = `mailto:${encodeURIComponent(para)}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    try {
      window.open(mailto, "_blank");
      const reg = { tipo: "notificacao_projeto", cliente: c.nome, carteira: c.carteira, para, cc, em: new Date().toISOString() };
      persist({ ...data, logins: [reg, ...((data && data.logins) || [])].slice(0, 500) }, { semCarimbo: true });
      return true;
    } catch (e) { return false; }
  };
  const excluirCliente = (nome) => { persist({ ...data, clientes: clientes.filter((c) => c.nome !== nome) }); setConfirma(null); };
  const addSegmento = (s) => persist({ ...data, dominios: { ...dominios, segmentos: [...(dominios.segmentos || []), s] } });

  return (
    <div style={{ minHeight: "100vh", background: T.paper, fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid ${T.green700}; outline-offset: 1px; }
        input:focus, select:focus, textarea:focus { border-color: ${T.green700}; }`}</style>

      {/* Cabeçalho */}
      <header style={{ background: T.green900, color: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>GeoópS</h1>
          <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 11.5, opacity: 0.9 }}>Sistema de Gestão Operacional Inteligente</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, opacity: 0.7 }}>www.geoops.ia.br · GEOAMBIENTE S/A</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 11.5, opacity: 0.85, textAlign: "right" }}>
            {erroStore ? <span style={{ color: "#FFC9B8" }}>⚠ Falha ao salvar — tente novamente</span>
              : salvoEm ? `Salvo automaticamente · ${salvoEm.toLocaleTimeString("pt-BR")}` : "Dados persistentes neste dispositivo"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", padding: "6px 12px", borderRadius: 99, fontSize: 12.5 }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{(user?.aba || "?").charAt(0)}</span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>{user?.tipo === "gerente" ? user?.carteira : user?.aba}</div>
              <div style={{ fontSize: 10.5, opacity: 0.75 }}>{user?.tipo === "master" ? "Acesso total" : user?.tipo === "gerente" ? `Gerente · ${user.carteira}` : user?.aba}</div>
            </div>
            <button onClick={() => { setUser(null); setLoginErro(""); }} style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", marginLeft: 4 }}>Sair</button>
          </div>
        </div>
      </header>

      {/* Faixa de permissão ativa */}
      <div style={{ background: ehMaster ? T.green100 : ehGerente ? T.blueBg : user?.tipo === "alimentador" ? T.amberBg : T.grayBg, color: ehMaster ? T.green700 : ehGerente ? T.blue : user?.tipo === "alimentador" ? T.amber : T.inkSoft, fontSize: 12, padding: "6px 24px", fontWeight: 600 }}>
        {ehMaster && "Diretoria — acesso total: custos visíveis, edição liberada em todo o sistema."}
        {user?.tipo === "alimentador" && `Acesso "${user.aba}" — você EDITA esta matriz; todas as demais ficam em visualização.`}
        {ehGerente && `Gerente da carteira ${user.carteira} — conferência de cronograma, prazos e custos dos seus projetos; pode solicitar revisão. Edição de cadastros bloqueada.`}
        {user?.tipo === "gestao" && "Gestão — somente visualização; custos ocultos."}
      </div>

      {/* Abas */}
      <nav style={{ display: "flex", flexWrap: "nowrap", gap: 2, padding: "0 16px", background: "#fff", borderBottom: `1px solid ${T.line}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {(() => {
          /* abas agrupadas por função, com cor de fundo por grupo:
             azul claro = entrada/alimentação · amarelo claro = processamento · verde claro = saída · neutro = administração */
          const GRUPO_COR = {
            input: { bg: "#E8F1FB", ativo: "#CFE2F6", borda: "#2980B9" },
            proc: { bg: "#FCF6E3", ativo: "#F6EAC0", borda: "#B7791F" },
            saida: { bg: "#E7F5EC", ativo: "#CDEBD6", borda: "#1E7E45" },
            admin: { bg: "transparent", ativo: T.green100, borda: T.green700 },
          };
          const abaGrupo = {
            comercial: "input", colab: "input", apt: "input", sms: "input", frota: "input", maq: "input", equip: "input", custos: "input", prog: "input",
            inteligencia: "proc", planos: "proc",
            loc: "saida", dash: "saida",
            autoriz: "admin", logins: "admin", gerente: "admin",
          };
          const todas = [
            /* INPUT (azul claro) — fontes de dados que alimentam o sistema, incl. o RDO de campo (Operações) */
            ["comercial", "💼", "Comercial"], ["colab", "👷", "Equipe"], ["apt", "🎯", "Aptidões"], ["sms", "🦺", "SMS"], ["frota", "🚗", "Frota"], ["maq", "⚙️", "Máquinas"], ["equip", "🔬", "Equipamentos"], ["custos", "💵", "Eficiência"], ["prog", "🛠", "Operações"],
            /* PROCESSAMENTO (amarelo claro) — planejar → decidir */
            ["planos", "📝", "Planejamento"], ["inteligencia", "🧠", "Inteligência"],
            /* SAÍDA (verde claro) */
            ["loc", "📍", "Localização"], ["dash", "📈", "Dashboard"],
            /* ADMINISTRAÇÃO (neutro) */
            ["autoriz", "📲", "Autorizações"],
          ];
          const abas = ehGerente
            ? [["dash", "📈", "Dashboard"], ["gerente", "📊", "Painel"], ["comercial", "💼", "Comercial"], ["planos", "📝", "Planejamento"], ["inteligencia", "🧠", "Inteligência"], ["prog", "🛠", "Operações"], ["loc", "📍", "Localização"], ["autoriz", "📲", "Autorizações"]]
            : ehMaster ? [...todas, ["logins", "📝", "Logins"]] : todas;
          return abas.map(([id, icone, label]) => {
            const dom = ABA_DOMINIO[id];
            const editavel = !ehGerente && dom && podeEditarDominio(user, dom);
            const ativo = tab === id;
            const gc = GRUPO_COR[abaGrupo[id] || "admin"];
            return (
              <button key={id} onClick={() => setTab(id)} title={label} style={{
                border: "none", background: ativo ? gc.ativo : gc.bg, cursor: "pointer", padding: "11px 14px", fontSize: 13.5, fontWeight: 600,
                fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "6px 6px 0 0",
                color: ativo ? T.green900 : T.ink, borderBottom: `3px solid ${ativo ? gc.borda : "transparent"}`,
              }}><span style={{ marginRight: 5 }}>{icone}</span>{label}{editavel ? <span title="Você edita esta matriz" style={{ marginLeft: 4, fontSize: 9, color: gc.borda }}>✎</span> : null}</button>
            );
          });
        })()}
      </nav>

      <main style={{ padding: "20px 24px", maxWidth: 1180, margin: "0 auto" }}>
        {/* Aviso de aba desatualizada (Fase 2) — aparece na própria aba quando passa de 24h */}
        {(() => {
          const dom = ABA_DOMINIO[tab];
          if (!dom || !ABAS_VIGIADAS.some((a) => a.dom === dom) || !podeEditarAba(tab)) return null;
          const sf = semaforoAtualizacao(dom);
          if (sf.nivel === "ok") return null;
          const c = (data?.atualizacoes || {})[dom];
          return (
            <div style={{ background: sf.bg, border: `1px solid ${sf.cor}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: sf.cor, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>{sf.nivel === "critico" ? "🔴" : sf.nivel === "atencao" ? "🟡" : "⚪"} Esta aba {sf.nivel === "sem" ? "ainda não foi atualizada" : `está sem atualização ${sf.txt.toLowerCase()}`}.</span>
              <span style={{ color: T.inkSoft }}>{c?.em ? `Última edição por ${c.por} em ${fmtData(c.em.slice(0, 10))}.` : "Mantenha os dados em dia para o Motor decidir sobre informação confiável."}</span>
            </div>
          );
        })()}
        {/* Barra de ações */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, maxWidth: 320 }} placeholder="Buscar por nome, matrícula, cargo ou região…" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {tab === "maq" ? (
            <select style={{ ...inputStyle, maxWidth: 170 }} value={filtroMaq} onChange={(e) => setFiltroMaq(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_MAQ.map((s) => <option key={s}>{s}</option>)}
            </select>
          ) : tab === "frota" ? (
            <select style={{ ...inputStyle, maxWidth: 170 }} value={filtroFrota} onChange={(e) => setFiltroFrota(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_VEIC.map((s) => <option key={s}>{s}</option>)}
            </select>
          ) : tab === "equip" ? (
            <select style={{ ...inputStyle, maxWidth: 190 }} value={filtroEquip} onChange={(e) => setFiltroEquip(e.target.value)}>
              <option value="">Todos os estados</option>
              {ESTADOS_EQUIP.map((s) => <option key={s}>{s}</option>)}
            </select>
          ) : ["comercial", "loc", "tap", "prog", "regras", "inteligencia", "dash", "custos", "gerente", "logins"].includes(tab) ? null : (
            <select style={{ ...inputStyle, maxWidth: 160 }} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_COLAB.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
          <div style={{ flex: 1 }} />
          {tab === "colab" && podeEditarColab && (
            <>
              <Btn kind="primary" onClick={() => setModal({ tipo: "import" })}>📋 Importar / atualizar da planilha</Btn>
            </>
          )}
          {tab === "apt" && perfil === "master" && colaboradores.length > 0 && (
            <>
              <Btn onClick={() => setModal({ tipo: "novoServico" })}>+ Novo serviço/aptidão</Btn>
              <Btn onClick={() => setModal({ tipo: "importMatriz" })}>📋 Importar matriz da planilha</Btn>
            </>
          )}
          {tab === "sms" && colaboradores.length > 0 && (
            <>
              {podeEditarSms && <Btn onClick={() => setModal({ tipo: "smsExtra" })}>+ Treinamento específico</Btn>}
              {perfil === "master" && <Btn onClick={() => setModal({ tipo: "importSms" })}>📋 Importar da planilha</Btn>}
            </>
          )}
          {tab === "comercial" && subComercial === "cli" && podeEditarCli && (
            <>
              {perfil === "master" && clientes.length > 0 && <Btn onClick={() => setModal({ tipo: "importCli" })}>📋 Importar da planilha</Btn>}
              <Btn kind="primary" onClick={() => setModal({ tipo: "novoCli" })}>+ Novo cliente</Btn>
            </>
          )}
                    {tab === "comercial" && subComercial === "ct" && perfil === "master" && (
            <>
              {contratos.length > 0 && <Btn onClick={() => setModal({ tipo: "importCt" })}>📋 Importar da planilha</Btn>}
              <Btn kind="primary" onClick={() => setModal({ tipo: "novoContrato" })}>+ Novo contrato</Btn>
            </>
          )}
          {tab === "sms" && perfil === "master" && contratos.length > 0 && (
            <Btn onClick={() => setModal({ tipo: "importDocs" })}>📑 Importar validades de documentos</Btn>
          )}
          {tab === "comercial" && subComercial === "cond" && perfil === "master" && contratos.length > 0 && (
            <Btn onClick={() => setModal({ tipo: "importCond" })}>⚖️ Importar condicionantes</Btn>
          )}
          {tab === "tap" && perfil === "master" && (
            <Btn kind="primary" onClick={() => setModal({ tipo: "novaTap" })}>+ Nova TAP</Btn>
          )}
          {tab === "colab" && podeEditarColab && (
            <Btn onClick={() => setModal({ tipo: "importPosP" })}>📍 Posições — Pessoas (ponto)</Btn>
          )}
                    {tab === "maq" && podeEditarMaq && (
            <>
              {perfil === "master" && <Btn onClick={() => setModal({ tipo: "importMaq" })}>📋 Importar da planilha</Btn>}
              <Btn kind="primary" onClick={() => setModal({ tipo: "novaMaq" })}>+ Nova máquina</Btn>
            </>
          )}
          {tab === "frota" && podeEditarMaq && (
            <>
              {perfil === "master" && <Btn onClick={() => setModal({ tipo: "importVeic" })}>📋 Importar da planilha</Btn>}
              <Btn onClick={() => setModal({ tipo: "importPosV" })}>📍 Posições — Veículos (GPS)</Btn>
              <Btn kind="primary" onClick={() => setModal({ tipo: "novoVeic" })}>+ Novo veículo</Btn>
            </>
          )}
          {tab === "equip" && podeEditarMaq && (
            <>
              {perfil === "master" && <Btn onClick={() => setModal({ tipo: "importEquip" })}>📋 Importar da planilha</Btn>}
              <Btn kind="primary" onClick={() => setModal({ tipo: "novoEquip" })}>+ Novo equipamento</Btn>
            </>
          )}
        </div>

        {/* Vazio */}
        {["colab", "apt", "sms"].includes(tab) && colaboradores.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum colaborador cadastrado</div>
            {podeEditarColab ? (
              <>
                <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 460, margin: "0 auto 18px" }}>
                  Importe a sua planilha atual (suba o Excel ou cole as linhas do Google Sheets), ou carregue dados de exemplo para testar o fluxo.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <Btn kind="primary" onClick={() => setModal({ tipo: "import" })}>📋 Importar da planilha</Btn>
                  <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo (6 pessoas)</Btn>
                  <Btn kind="primary" onClick={() => { if (confirm("Carregar a base de testes completa? Isso substitui os cadastros atuais por 39 colaboradores, frota, máquinas, equipamentos, clientes e 10 TAPs em vários estados — ideal para testar o Motor.")) persist({ ...data, ...EXEMPLO_BASE }); }}>🧪 Carregar base de testes (39 pessoas)</Btn>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: T.inkSoft }}>O cadastro de colaboradores é realizado pelo perfil Master.</p>
            )}
          </div>
        )}

        {/* Tabela Colaboradores */}
        {tab === "colab" && colaboradores.length > 0 && (() => {
          /* esconde sócios de quem não é Diretoria */
          const listaVisivel = lista.filter((c) => podeVerSocio || !c.ehSocio);
          const socios = colaboradores.filter((c) => c.ehSocio);
          return (
          <>
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Matrícula</th><th style={th}>Nome</th><th style={th}>Cargo</th><th style={th}>Região</th><th style={th}>Admissão</th>
                {podeVerSalario && <>
                  <th style={{ ...th, textAlign: "right" }}>Salário base 🔒</th>
                  <th style={{ ...th, textAlign: "right" }}>HE trimestre 🔒</th>
                  <th style={{ ...th, textAlign: "right" }}>Encargos anual. 🔒</th>
                  <th style={{ ...th, textAlign: "right" }}>Custo mês 🔒</th>
                </>}
                <th style={th}>Status</th>
                {podeEditarColab && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaVisivel.map((c) => (
                  <React.Fragment key={c.mat}>
                  <tr style={c.ehSocio ? { background: T.blueBg } : null}>
                    <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{c.mat}</td>
                    <td style={td}><div style={{ fontWeight: 600 }}>{c.ehSocio ? "👑 " : ""}{c.nome}</div><div style={{ fontSize: 11.5, color: T.inkSoft }}>{c.funcao}</div></td>
                    <td style={td}>{c.cargo}</td>
                    <td style={td}>{c.regiao}</td>
                    <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{fmtData(c.admissao)}</td>
                    {podeVerSalario && <>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtBRL(c.salarioBase)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtBRL(c.horasExtrasTri)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtBRL(c.encargosAnual)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 600 }}>{fmtBRL(c.custoTotal)}</td>
                    </>}
                    <td style={td}><StatusBadge s={c.status} /></td>
                    {podeEditarColab && (
                      <td style={{ ...td, whiteSpace: "nowrap" }}>
                        <Btn small onClick={() => setModal({ tipo: "editar", colab: c })}>Editar</Btn>{" "}
                        {confirma === c.mat
                          ? <Btn small kind="danger" onClick={() => excluir(c.mat)}>Confirmar?</Btn>
                          : <Btn small kind="danger" onClick={() => setConfirma(c.mat)}>Excluir</Btn>}
                      </td>
                    )}
                  </tr>
                  <tr style={c.ehSocio ? { background: T.blueBg } : null}>
                    <td colSpan={6 + (podeVerSalario ? 4 : 0) + (podeEditarColab ? 1 : 0)} style={{ padding: "0 12px 10px", borderBottom: `2px solid ${T.paper}` }}>
                      <CalendarioRecurso tipo="pessoa" idRec={c.mat} nomeRec={`${c.nome} (${c.mat})`} travas={travas} taps={taps} podeEditar={podeEditarColab || ehGestorPlanejamento} ehGestorPlanejamento={ehGestorPlanejamento} onSalvar={salvarTrava} onExcluir={excluirTrava} accent="#C0392B" />
                    </td>
                  </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft }}>{listaVisivel.length} colaborador(es) exibido(s){!podeVerSocio && socios.length > 0 ? ` · ${socios.length} sócio(s) oculto(s)` : ""} · {colaboradores.length} no total</div>
          </div>

          {/* Seção exclusiva da Diretoria: sócios, salários e retiradas */}
          {podeVerSocio && socios.length > 0 && (
            <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: `2px solid ${T.blue}`, overflow: "hidden" }}>
              <div style={{ background: T.blueBg, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, color: T.blue }}>👑 Sócios / Diretoria — confidencial (visível apenas para a Diretoria)</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Nome</th><th style={th}>Cargo</th>
                  <th style={{ ...th, textAlign: "right" }}>Pró-labore / retirada (mês)</th>
                  <th style={{ ...th, textAlign: "right" }}>Custo mês total</th>
                  <th style={{ ...th, textAlign: "right" }}>Encargos anualizados</th>
                </tr></thead>
                <tbody>
                  {socios.map((c) => (
                    <tr key={c.mat}>
                      <td style={td}><b>{c.nome}</b></td>
                      <td style={td}>{c.cargo}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{fmtBRL(c.retiradaSocio)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(c.custoTotal)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(c.encargosAnual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "8px 16px", fontSize: 11.5, color: T.inkSoft }}>🔒 Estes dados não são visíveis para o RH nem para nenhum outro acesso — apenas Diretoria.</div>
            </div>
          )}
          </>
          );
        })()}

        {/* Matriz de Aptidões — grade colaboradores × atividades */}
        {tab === "apt" && colaboradores.length > 0 && (
          <>
            {/* ===== BUSCADOR DE PERFIS POR APTIDÃO ===== */}
            {(() => {
              const niveisOrdem = { esp: 4, sr: 3, pl: 2, jr: 1, na: 0 };
              const nivelDe = (mat, aptId) => (aptidoes[mat]?.matriz || {})[aptId] || "na";
              /* colaboradores que possuem TODAS as aptidões selecionadas (nível > na), com o nível de cada */
              const resultado = buscaApt.length === 0 ? [] : lista.filter((c) =>
                buscaApt.every((aptId) => nivelDe(c.mat, aptId) !== "na")
              ).map((c) => ({
                colab: c,
                niveis: buscaApt.map((aptId) => ({ aptId, nivel: nivelDe(c.mat, aptId) })),
                score: buscaApt.reduce((s, aptId) => s + (niveisOrdem[nivelDe(c.mat, aptId)] || 0), 0),
              })).sort((a, b) => b.score - a.score);
              const nivelInfo = (nv) => NIVEIS.find((n) => n.id === nv) || { label: nv, short: nv };
              return (
                <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 4 }}>🔎 Localizar perfis por aptidão</div>
                  <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 10 }}>Selecione uma ou mais aptidões para encontrar os colaboradores que as possuem, com o nível de cada um. Quando seleciona várias, mostra quem tem <b>todas</b>.</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                    <select style={{ ...inputStyle, width: "auto", minWidth: 280, padding: "8px 10px" }} value="" onChange={(e) => { const v = e.target.value; if (v && !buscaApt.includes(v)) setBuscaApt([...buscaApt, v]); }}>
                      <option value="">+ Adicionar aptidão à busca…</option>
                      {ATIVIDADES.filter((a) => !buscaApt.includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                    {buscaApt.length > 0 && <Btn small kind="ghost" onClick={() => setBuscaApt([])}>Limpar</Btn>}
                  </div>
                  {/* chips das aptidões selecionadas */}
                  {buscaApt.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {buscaApt.map((aptId) => {
                        const a = ATIVIDADES.find((x) => x.id === aptId) || {};
                        return (
                          <span key={aptId} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.green100, color: T.green900, borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                            {a.label}
                            <button onClick={() => setBuscaApt(buscaApt.filter((x) => x !== aptId))} style={{ border: "none", background: "none", color: T.green700, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* resultados */}
                  {buscaApt.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic" }}>Selecione ao menos uma aptidão acima para buscar.</div>
                  ) : resultado.length === 0 ? (
                    <div style={{ background: T.amberBg, color: T.ink, borderRadius: 8, padding: "12px 14px", fontSize: 13 }}>⚠ Nenhum colaborador possui {buscaApt.length > 1 ? "todas as aptidões selecionadas" : "esta aptidão"}. Considere capacitação ou revise a seleção.</div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 12.5, color: T.green700, fontWeight: 600, marginBottom: 8 }}>{resultado.length} colaborador(es) encontrado(s)</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {resultado.map(({ colab, niveis }) => (
                          <div key={colab.mat} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: T.paper, borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ minWidth: 180 }}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{colab.nome}</div>
                              <div style={{ fontSize: 10.5, color: T.inkSoft }}>{colab.cargo} · {colab.mat}{colab.regiao ? ` · ${colab.regiao}` : ""}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                              {niveis.map(({ aptId, nivel }) => {
                                const ni = nivelInfo(nivel); const a = ATIVIDADES.find((x) => x.id === aptId) || {};
                                return (
                                  <span key={aptId} title={a.label} style={{ fontSize: 11, background: NIVEL_BG[nivel] || "#eee", color: NIVEL_FG[nivel] || T.ink, borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>
                                    {a.short}: {ni.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: T.inkSoft }}>
                {podeEditarApt ? "Clique na célula para alternar o nível:" : "Níveis de aptidão:"}
              </span>
              {NIVEIS.map((n) => (
                <span key={n.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                  <span style={{
                    width: 26, height: 20, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
                    background: NIVEL_BG[n.id],
                    color: NIVEL_FG[n.id],
                  }} title={n.desc}>{n.short}</span>
                  <span title={n.desc}>{n.label}</span>
                </span>
              ))}
            </div>
            <details style={{ marginBottom: 10, fontSize: 12.5, color: T.inkSoft }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, color: T.green700 }}>Ver definições completas dos níveis</summary>
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 14px", marginTop: 6, lineHeight: 1.7 }}>
                {NIVEIS.map((n) => <div key={n.id}><b>{n.short} — {n.label}:</b> {n.desc}.</div>)}
              </div>
            </details>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, position: "sticky", left: 0, background: "#fff", zIndex: 2, minWidth: 190 }}>Colaborador</th>
                    {ATIVIDADES.map((atv) => (
                      <th key={atv.id} title={atv.label} style={{ ...th, padding: "8px 6px", textAlign: "left", verticalAlign: "bottom", minWidth: 150, maxWidth: 190 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.25, whiteSpace: "normal", color: T.green900 }}>{atv.label}</div>
                        {perfil === "master" && (
                          confirma === "serv:" + atv.id
                            ? <div style={{ marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
                                <button onClick={() => removerServico(atv.id)} style={{ border: "none", background: T.red, color: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 9.5, fontWeight: 700, cursor: "pointer" }}>Confirmar exclusão</button>
                                <button onClick={() => setConfirma(null)} style={{ border: `1px solid ${T.line}`, background: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 9.5, cursor: "pointer" }}>Cancelar</button>
                              </div>
                            : <button onClick={() => setConfirma("serv:" + atv.id)} title="Remover este serviço/aptidão" style={{ marginTop: 4, border: "none", background: "none", color: T.inkSoft, cursor: "pointer", fontSize: 11, padding: 0 }}>✕ remover</button>
                        )}
                      </th>
                    ))}
                    <th style={{ ...th, textAlign: "center" }}>CNH</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((c, ri) => {
                    const a = aptidoes[c.mat];
                    const cnh = a && a.cnhCat !== "Não possui" ? cnhStatus(a.cnhVal) : null;
                    return (
                      <tr key={c.mat} style={{ background: ri % 2 ? "#FAFBF8" : "#fff" }}>
                        <td style={{ ...td, position: "sticky", left: 0, background: ri % 2 ? "#FAFBF8" : "#fff", zIndex: 1, borderRight: `1px solid ${T.line}` }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
                          <div style={{ fontSize: 11, color: T.inkSoft }}><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{c.mat}</span> · {c.cargo}</div>
                        </td>
                        {ATIVIDADES.map((atv) => {
                          const nivel = a?.matriz?.[atv.id] || "na";
                          const n = NIVEIS.find((x) => x.id === nivel);
                          return (
                            <td key={atv.id} style={{ ...td, padding: 3, textAlign: "center" }}>
                              <button
                                onClick={() => setNivelMatriz(c.mat, atv.id)}
                                disabled={!podeEditarApt}
                                title={`${c.nome} · ${atv.label} · ${n.label}${podeEditarApt ? " (clique para alterar)" : ""}`}
                                style={{
                                  width: "100%", minWidth: 40, height: 24, borderRadius: 4, border: `1px solid ${nivel === "na" ? T.line : T.green700}`,
                                  cursor: podeEditarApt ? "pointer" : "default",
                                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
                                  background: nivel === "na" ? "#fff" : NIVEL_BG[nivel],
                                  color: nivel === "na" ? T.gray : NIVEL_FG[nivel],
                                }}>{n.short}</button>
                            </td>
                          );
                        })}
                        <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>
                          {a && a.cnhCat !== "Não possui"
                            ? <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><b style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{a.cnhCat}</b>{cnh && <Badge text={cnh.tag} c={cnh.c} bg={cnh.bg} />}</span>
                            : <span style={{ color: T.inkSoft }}>—</span>}
                        </td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {podeEditarApt
                            ? <Btn small onClick={() => setModal({ tipo: "apt", colab: c })}>Detalhes</Btn>
                            : <Btn small onClick={() => setModal({ tipo: "apt", colab: c, readonly: true })}>Ver</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                {lista.length} colaborador(es) · "Detalhes" abre CNH, restrições de mobilidade, cursos e observações
              </div>
            </div>

            {/* Cobertura de funções críticas (unificada da antiga aba Cobertura) */}
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflow: "hidden", marginTop: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900 }}>🛡️ Cobertura de funções críticas (substitutos)</span>
                <span style={{ fontSize: 11.5, color: T.inkSoft }}>Números: especialistas (4) · nível ≥3 · disponíveis hoje (nível ≥2, ativos, sem férias/afastamento)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 0 }}>
                {cobertura.map((cb, i) => {
                  const risco = cb.dispHoje === 0 ? { t: "Sem cobertura", c: "#fff", bg: T.red }
                    : cb.dispHoje === 1 ? { t: "Pessoa única", c: T.red, bg: T.redBg }
                    : cb.dispHoje === 2 ? { t: "Cobertura mínima", c: T.amber, bg: T.amberBg }
                    : { t: "OK", c: T.green700, bg: T.green100 };
                  return (
                    <div key={cb.atv.id}
                      title={cb.nomes.length ? `Disponíveis hoje: ${cb.nomes.join(", ")}` : "Nenhum colaborador disponível hoje"}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: `1px solid ${T.line}`, borderRight: `1px solid ${T.line}`, fontSize: 13, background: i % 2 ? "#FAFBF8" : "#fff", cursor: "default" }}>
                      <span style={{ flex: 1 }}>{cb.atv.label}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.inkSoft, whiteSpace: "nowrap" }} title="especialistas (4) · nível ≥3 · disponíveis hoje (nível ≥2)">
                        {cb.n4} · {cb.n3} · <b style={{ color: T.ink }}>{cb.dispHoje}</b>
                      </span>
                      <Badge text={risco.t} c={risco.c} bg={risco.bg} />
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 18px", fontSize: 12, color: T.inkSoft }}>
                Leitura: <b>especialistas</b> (nível 4) · <b>nível ≥3</b> (avançado+) · <b>disponíveis hoje</b> (nível ≥2). Passe o mouse para ver quem está disponível. Atividades com pessoa única ou sem cobertura são prioridade para capacitação — o Motor protege esses colaboradores de mobilizações longas.
              </div>
            </div>
          </>
        )}

        {/* Matriz SMS & NRs — grade colaboradores × programas */}
        {tab === "sms" && colaboradores.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: T.inkSoft }}>{podeEditarSms ? "Clique na célula para registrar as datas:" : "Status de validade:"}</span>
              {[["Válido", "#fff", T.green700, "MM/AA", false], ["Vence ≤30d", T.green900, "#F0CC7E", "MM/AA", false], ["Vencido", "#fff", T.red, "MM/AA", false], ["Não se aplica", T.gray, T.grayBg, "N/A", false], ["Não informado", T.amber, "#fff", "—", true]].map(([lbl, c, bg, txt, dash]) => (
                <span key={lbl} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                  <span style={{ minWidth: 44, height: 20, padding: "0 4px", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, background: bg, color: c, border: dash ? `1px dashed ${T.amber}` : "none" }}>{txt}</span>
                  {lbl}
                </span>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                {smsVencidos > 0 && <span style={{ color: T.red }}>🔴 {smsVencidos} vencido(s)</span>}
                {smsVencidos > 0 && smsV30 > 0 && <span style={{ color: T.inkSoft }}> · </span>}
                {smsV30 > 0 && <span style={{ color: T.amber }}>⚠ {smsV30} vencem em ≤30d</span>}
                {smsVencidos === 0 && smsV30 === 0 && <span style={{ color: T.green700 }}>✓ Sem pendências entre ativos</span>}
              </span>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, position: "sticky", left: 0, background: "#fff", zIndex: 2, minWidth: 190 }}>Colaborador</th>
                    {itensSms.map((it) => (
                      <th key={it.id} title={`${it.label} · ${it.grupo}`} style={{ ...th, padding: "8px 3px", textAlign: "center", verticalAlign: "bottom" }}>
                        <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", display: "inline-block", maxHeight: 110, fontSize: 10.5, letterSpacing: 0.3 }}>{it.label}</span>
                      </th>
                    ))}
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((c, ri) => (
                    <tr key={c.mat} style={{ background: ri % 2 ? "#FAFBF8" : "#fff" }}>
                      <td style={{ ...td, position: "sticky", left: 0, background: ri % 2 ? "#FAFBF8" : "#fff", zIndex: 1, borderRight: `1px solid ${T.line}` }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
                        <div style={{ fontSize: 11, color: T.inkSoft }}><span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{c.mat}</span> · {c.cargo}</div>
                      </td>
                      {itensSms.map((it) => {
                        const st = smsStatus((sms[c.mat] || {})[it.id]);
                        return (
                          <td key={it.id} style={{ ...td, padding: 3, textAlign: "center" }}>
                            <button
                              onClick={() => podeEditarSms && setModal({ tipo: "smsCell", colab: c, item: it })}
                              disabled={!podeEditarSms}
                              title={`${c.nome} · ${it.label} · ${st.tag}${podeEditarSms ? " (clique para editar)" : ""}`}
                              style={{
                                minWidth: 48, height: 24, borderRadius: 4, padding: "0 3px",
                                border: st.key === "ni" ? `1px dashed ${T.amber}` : `1px solid ${st.key === "na" ? T.line : "transparent"}`,
                                cursor: podeEditarSms ? "pointer" : "default",
                                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
                                background: st.bg, color: st.c,
                              }}>{st.short}</button>
                          </td>
                        );
                      })}
                      <td style={{ ...td, whiteSpace: "nowrap" }}>
                        <Btn small onClick={() => setModal({ tipo: "smsFicha", colab: c, readonly: !podeEditarSms })}>{podeEditarSms ? "Ficha" : "Ver"}</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                {lista.length} colaborador(es) · célula = validade (MM/AA) · "Ficha" abre todos os itens com realização e validade
              </div>
            </div>

            {/* ===== Documentos obrigatórios por CNPJ (unificado da antiga aba Documentos) ===== */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: `2px solid ${T.green700}` }}>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 17, color: T.green900, marginBottom: 4 }}>📑 Documentos obrigatórios por CNPJ</div>
              <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 12 }}>Validade dos documentos legais exigidos por CNPJ (PGR, PCMSO, PPEOB, PCA, PPR, LTCAT, LIP, AET). Complementa a matriz de SMS/NRs acima, que é por colaborador.</div>
              {contratos.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "32px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 12px" }}>As validades são registradas por contrato/CNPJ — cadastre os contratos primeiro.</p>
                  <Btn kind="primary" onClick={() => setTab("comercial")}>Ir para Comercial</Btn>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, color: T.inkSoft }}>{podeEditarSms ? "Clique na célula para registrar a validade:" : "Status de validade:"}</span>
                    {[["Válido", "#fff", T.green700, "MM/AA", false], ["Vence ≤30d", T.green900, "#F0CC7E", "MM/AA", false], ["Vencido", "#fff", T.red, "MM/AA", false], ["Não exigido", T.gray, T.grayBg, "N/A", false], ["Não informado", T.amber, "#fff", "—", true]].map(([lbl, c, bg, txt, dash]) => (
                      <span key={lbl} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                        <span style={{ minWidth: 44, height: 20, padding: "0 4px", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, background: bg, color: c, border: dash ? `1px dashed ${T.amber}` : "none" }}>{txt}</span>
                        {lbl}
                      </span>
                    ))}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {docsVencidos > 0 && <span style={{ color: T.red }}>🔴 {docsVencidos} vencido(s)</span>}
                      {docsVencidos > 0 && docsV30 > 0 && <span style={{ color: T.inkSoft }}> · </span>}
                      {docsV30 > 0 && <span style={{ color: T.amber }}>⚠ {docsV30} vencem em ≤30d</span>}
                      {docsVencidos === 0 && docsV30 === 0 && <span style={{ color: T.green700 }}>✓ Sem pendências documentais</span>}
                    </span>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead>
                        <tr>
                          <th style={{ ...th, position: "sticky", left: 0, background: "#fff", zIndex: 2, minWidth: 230 }}>CNPJ / Cliente</th>
                          {DOCS_CLIENTE.map((dc) => (
                            <th key={dc.id} style={{ ...th, padding: "8px 4px", textAlign: "center" }}>{dc.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {docsRowsFiltradas.map((r, ri) => (
                          <tr key={r.key} style={{ background: ri % 2 ? "#FAFBF8" : "#fff" }}>
                            <td style={{ ...td, position: "sticky", left: 0, background: ri % 2 ? "#FAFBF8" : "#fff", zIndex: 1, borderRight: `1px solid ${T.line}` }}>
                              <div style={{ fontWeight: 600, fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace" }}>{r.cnpj}</div>
                              <div style={{ fontSize: 11.5 }}>{r.clientes.join(" · ")}</div>
                              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }} title={r.cts.join(", ")}>{r.cts.length} contrato(s): {r.cts.join(", ")}</div>
                            </td>
                            {DOCS_CLIENTE.map((dc) => {
                              const st = smsStatus((docsCnpj[r.key] || {})[dc.id]);
                              return (
                                <td key={dc.id} style={{ ...td, padding: 3, textAlign: "center" }}>
                                  <button
                                    onClick={() => podeEditarSms && setModal({ tipo: "docCell", row: r, item: dc })}
                                    disabled={!podeEditarSms}
                                    title={`${r.clientes.join(" · ")} · CNPJ ${r.cnpj} · ${dc.label} · ${st.tag}${podeEditarSms ? " (clique para editar)" : ""}`}
                                    style={{
                                      minWidth: 50, height: 24, borderRadius: 4, padding: "0 3px",
                                      border: st.key === "ni" ? `1px dashed ${T.amber}` : `1px solid ${st.key === "na" ? T.line : "transparent"}`,
                                      cursor: podeEditarSms ? "pointer" : "default",
                                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
                                      background: st.bg, color: st.c,
                                    }}>{st.short}</button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                      {docsRowsFiltradas.length} CNPJ(s) · cada documento (PGR…AET) é vinculado ao CNPJ — contratos do mesmo CNPJ compartilham as validades · o Motor bloqueia mobilizações em CNPJ com documento obrigatório vencido
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== Controle de ASOs por colaborador × contrato/cliente ===== */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: `2px solid ${T.green700}` }}>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 17, color: T.green900, marginBottom: 4 }}>🩺 Controle de ASOs (Atestados de Saúde Ocupacional)</div>
              <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 12 }}>Validade do ASO de cada colaborador para cada contrato/cliente. Muitos clientes exigem ASO específico e vigente para liberar o acesso à obra.</div>
              {contratos.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "32px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 12px" }}>Cadastre os contratos primeiro — as colunas de ASO são geradas a partir deles.</p>
                  <Btn kind="primary" onClick={() => setTab("comercial")}>Ir para Comercial</Btn>
                </div>
              ) : (() => {
                const asoVencidos = colaboradores.reduce((s, c) => s + contratos.filter((ct) => { const r = (asos[c.mat] || {})[ct.contrato]; return r && r.val && new Date(r.val) < new Date(hojeISO()); }).length, 0);
                const asoV30 = colaboradores.reduce((s, c) => s + contratos.filter((ct) => { const r = (asos[c.mat] || {})[ct.contrato]; if (!r || !r.val) return false; const d = Math.floor((new Date(r.val) - new Date(hojeISO())) / 864e5); return d >= 0 && d <= 30; }).length, 0);
                return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, color: T.inkSoft }}>{podeEditarSms ? "Clique na célula para registrar a validade do ASO:" : "Validade do ASO por contrato:"}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {asoVencidos > 0 && <span style={{ color: T.red }}>🔴 {asoVencidos} vencido(s)</span>}
                      {asoVencidos > 0 && asoV30 > 0 && <span style={{ color: T.inkSoft }}> · </span>}
                      {asoV30 > 0 && <span style={{ color: T.amber }}>⚠ {asoV30} vencem em ≤30d</span>}
                      {asoVencidos === 0 && asoV30 === 0 && <span style={{ color: T.green700 }}>✓ ASOs em dia</span>}
                    </span>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead>
                        <tr>
                          <th style={{ ...th, position: "sticky", left: 0, background: "#fff", zIndex: 2, minWidth: 200 }}>Colaborador</th>
                          {contratos.map((ct) => (
                            <th key={ct.contrato} style={{ ...th, padding: "8px 4px", textAlign: "center", minWidth: 70 }} title={`${ct.contrato} · ${ct.cliente} · ${ct.projeto}`}>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{ct.contrato}</div>
                              <div style={{ fontSize: 9.5, fontWeight: 400, color: T.inkSoft, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ct.cliente}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lista.map((c, ri) => (
                          <tr key={c.mat} style={{ background: ri % 2 ? "#FAFBF8" : "#fff" }}>
                            <td style={{ ...td, position: "sticky", left: 0, background: ri % 2 ? "#FAFBF8" : "#fff", zIndex: 1, borderRight: `1px solid ${T.line}` }}>
                              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{c.nome}</div>
                              <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }}>{c.mat}</div>
                            </td>
                            {contratos.map((ct) => {
                              const st = smsStatus((asos[c.mat] || {})[ct.contrato]);
                              return (
                                <td key={ct.contrato} style={{ ...td, padding: 3, textAlign: "center" }}>
                                  <button
                                    onClick={() => podeEditarSms && setModal({ tipo: "asoCell", colab: c, contrato: ct })}
                                    disabled={!podeEditarSms}
                                    title={`${c.nome} · ASO p/ ${ct.contrato} (${ct.cliente}) · ${st.tag}${podeEditarSms ? " (clique para editar)" : ""}`}
                                    style={{
                                      minWidth: 50, height: 24, borderRadius: 4, padding: "0 3px",
                                      border: st.key === "ni" ? `1px dashed ${T.amber}` : `1px solid ${st.key === "na" ? T.line : "transparent"}`,
                                      cursor: podeEditarSms ? "pointer" : "default",
                                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
                                      background: st.bg, color: st.c,
                                    }}>{st.short}</button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                      {lista.length} colaborador(es) × {contratos.length} contrato(s) · célula = validade do ASO (MM/AA) · o Motor sinaliza alocação de colaborador sem ASO vigente para o contrato (não bloqueia, apenas alerta)
                    </div>
                  </div>
                </>
                );
              })()}
            </div>
          </>
        )}

        {/* Clientes */}
        {/* Sub-navegação da aba Comercial */}
        {tab === "comercial" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[["cli", "🏢 Clientes", clientes.length], ["ct", "📄 Contratos", contratos.length], ["__tap", "📋 TAPs", taps.length]].map(([id, label, n]) => (
              <button key={id} onClick={() => { if (id === "__tap") { setTab("tap"); } else { setSubComercial(id); } }} style={{
                border: `1px solid ${subComercial === id ? T.green700 : T.line}`,
                background: subComercial === id ? T.green700 : "#fff",
                color: subComercial === id ? "#fff" : T.inkSoft,
                borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{label}{n > 0 ? <span style={{ opacity: 0.7, marginLeft: 5, fontSize: 11 }}>({n})</span> : ""}</button>
            ))}
          </div>
        )}

        {tab === "comercial" && subComercial === "cli" && clientes.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum cliente cadastrado</div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 16px" }}>
              Cadastre os clientes da empresa — os contratos e, em seguida, os projetos apontarão para eles, permitindo que o Motor planeje a logística por cliente.
            </p>
            {podeEditarMaq && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {perfil === "master" && <Btn kind="primary" onClick={() => setModal({ tipo: "importCli" })}>📋 Importar da planilha</Btn>}
                <Btn onClick={() => setModal({ tipo: "novoCli" })}>+ Novo cliente</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            )}
          </div>
        )}
        {tab === "comercial" && subComercial === "cli" && clientes.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Cliente</th><th style={th}>Segmento</th><th style={th}>Cidade/UF</th><th style={th}>Contato</th>
                <th style={{ ...th, textAlign: "center" }}>Contratos</th><th style={th}>Exigências</th><th style={th}>Status</th>
                {podeEditarMaq && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaClientes.map((c) => {
                  const cts = contratosDoCliente(c.nome);
                  const vigentes = cts.filter((ct) => ct.statusCt === "Vigente" || ct.statusCt === "Em mobilização").length;
                  return (
                    <tr key={c.nome}>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
                        {c.cnpj && <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }}>{c.cnpj}</div>}
                      </td>
                      <td style={{ ...td, fontSize: 12.5 }}>{c.segmento || "—"}</td>
                      <td style={{ ...td, fontSize: 12.5 }}>{c.cidade || "—"}</td>
                      <td style={td}>
                        {c.contato ? <><div style={{ fontSize: 12.5 }}>{c.contato}</div>{c.foneEmail && <div style={{ fontSize: 10.5, color: T.inkSoft }}>{c.foneEmail}</div>}</> : <span style={{ color: T.inkSoft }}>—</span>}
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        {cts.length
                          ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }} title={cts.map((x) => x.contrato).join(", ")}><b>{vigentes}</b> ativo(s) / {cts.length}</span>
                          : <span style={{ color: T.inkSoft }}>—</span>}
                      </td>
                      <td style={{ ...td, fontSize: 11.5, color: T.inkSoft, maxWidth: 220 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.exigencias}>{c.exigencias || "—"}</div>
                      </td>
                      <td style={td}><StatusBadge s={c.status} /></td>
                      {podeEditarMaq && (
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          <Btn small onClick={() => setModal({ tipo: "editarCli", cli: c })}>Editar</Btn>{" "}
                          {cts.length > 0
                            ? <span title="Cliente com contratos vinculados — exclua os contratos primeiro"><Btn small kind="danger" disabled>Excluir</Btn></span>
                            : confirma === "cli:" + c.nome
                              ? <Btn small kind="danger" onClick={() => excluirCliente(c.nome)}>Confirmar?</Btn>
                              : <Btn small kind="danger" onClick={() => setConfirma("cli:" + c.nome)}>Excluir</Btn>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaClientes.length} cliente(s) · exigências gerais do cliente entram como restrições do Motor · contratos vinculados na aba 📑 Contratos & Docs
            </div>
          </div>
        )}

        {/* Contratos */}
        {tab === "comercial" && subComercial === "ct" && contratos.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum contrato cadastrado</div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 16px" }}>
              Cadastre os contratos/propostas — os projetos e o planejamento do Motor apontarão para eles.
            </p>
            {perfil === "master" && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <Btn kind="primary" onClick={() => setModal({ tipo: "importCt" })}>📋 Importar da planilha</Btn>
                <Btn onClick={() => setModal({ tipo: "novoContrato" })}>+ Novo contrato</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            )}
          </div>
        )}
        {tab === "comercial" && subComercial === "ct" && contratos.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Contrato / Proposta</th><th style={th}>Cliente</th><th style={th}>Localidade</th><th style={th}>Projeto</th><th style={th}>Serviço</th>
                {podeVerValorContrato && <><th style={{ ...th, textAlign: "right" }}>Valor IDGEO 🔒</th><th style={{ ...th, textAlign: "right" }}>Valor Contrato 🔒</th></>}
                <th style={th}>Status</th>
                {perfil === "master" && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaContratos.map((ct) => (
                  <tr key={ct.contrato}>
                    <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{ct.contrato}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{ct.cliente}</div>
                      {ct.cnpj && <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }}>{ct.cnpj}</div>}
                    </td>
                    <td style={{ ...td, fontSize: 12.5 }}>{ct.localidade || "—"}{ct.estado ? `/${ct.estado}` : ""}</td>
                    <td style={{ ...td, fontSize: 12.5, maxWidth: 200 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ct.projeto}>{ct.projeto || "—"}</div></td>
                    <td style={{ ...td, fontSize: 11.5, color: T.inkSoft, maxWidth: 220 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ct.servico}>{ct.servico || "—"}</div></td>
                    {podeVerValorContrato && <>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{fmtBRL(ct.valorIdgeo)}</td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{fmtBRL(ct.valorContrato)}</td>
                    </>}
                    <td style={td}><StatusBadge s={ct.statusCt || "Vigente"} /></td>
                    {perfil === "master" && (
                      <td style={{ ...td, whiteSpace: "nowrap" }}>
                        <Btn small onClick={() => setModal({ tipo: "editarContrato", ct })}>Editar</Btn>{" "}
                        {confirma === "ct:" + ct.contrato
                          ? <Btn small kind="danger" onClick={() => excluirContrato(ct.contrato)}>Confirmar?</Btn>
                          : <Btn small kind="danger" onClick={() => setConfirma("ct:" + ct.contrato)}>Excluir</Btn>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaContratos.length} contrato(s) · valores visíveis apenas no perfil Master · documentos obrigatórios na aba 📑 Documentos
            </div>
          </div>
        )}

        {/* Dashboard de acompanhamento comercial (parte de baixo da sub-aba Contratos) */}
        {tab === "comercial" && subComercial === "ct" && contratos.length > 0 && (() => {
          /* monta o acompanhamento por contrato cruzando TAP/programação/condicionantes/cliente */
          const linhas = listaContratos.map((ct) => {
            const tap = taps.find((t) => t.projeto && ct.projeto && norm(t.projeto).includes(norm(ct.projeto).slice(0, 12))) || taps.find((t) => t.cliente && norm(t.cliente) === norm(ct.cliente));
            const prog = tap ? programacoes[tap.idgeo] : null;
            const cli = clientes.find((c) => c.nome === ct.cliente) || {};
            const cd = condicionantes[ct.contrato] || {};
            const os = tap ? ordens[tap.idgeo] : null;
            /* datas-marco */
            const campoProgramado = prog?.inicioPrev || cli.prazoEntradaCampo || cd.prazoIni || tap?.entradaCampo || "";
            const finalizacao = prog?.fimPrev || cli.prazoConclusaoCampo || cd.prazoFim || "";
            const entregaDoc = cli.prazoRelatorio || cli.prazoEntregaFinal || tap?.entregaRelatorio || "";
            /* status/etapa */
            const etapa = !tap ? "Sem programação" : tap.statusTap === "Concluído" ? "Concluído" : tap.statusTap === "Em campo" ? "Em campo" : os?.status === "Aprovada" ? "Programado" : "Aguardando programação";
            const corEtapa = etapa === "Concluído" ? T.green700 : etapa === "Em campo" ? T.blue : etapa === "Programado" ? T.green900 : T.amber;
            /* progresso temporal */
            const hoje = hojeISO();
            let progresso = null;
            if (campoProgramado && finalizacao) {
              const ini = new Date(campoProgramado), fim = new Date(finalizacao), ag = new Date(hoje);
              const tot = (fim - ini) / 86400000, dec = (ag - ini) / 86400000;
              progresso = tot > 0 ? Math.max(0, Math.min(100, Math.round((dec / tot) * 100))) : (tap?.statusTap === "Concluído" ? 100 : 0);
            }
            return { ct, tap, etapa, corEtapa, campoProgramado, finalizacao, entregaDoc, progresso, temNotif: !!cli.notificadoEm };
          });
          const fmtD = (x) => x ? fmtData(x) : "—";
          return (
            <div style={{ marginTop: 20 }}>
              <div style={{ background: `linear-gradient(135deg, ${T.green900}, ${T.green700})`, color: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 800, fontSize: 19 }}>📊 Acompanhamento comercial dos projetos</div>
                <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 2 }}>Visão de avanço para dar satisfação ao cliente em tempo real — datas-marco de campo, finalização e entrega.</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead><tr>
                    <th style={th}>Projeto / Contrato</th><th style={th}>Cliente</th><th style={th}>Etapa atual</th>
                    <th style={th}>📍 Campo programado</th><th style={th}>🏁 Finalização provável</th><th style={th}>📄 Entrega do documento</th>
                    <th style={{ ...th, minWidth: 120 }}>Avanço</th><th style={th}>Cliente notificado</th>
                  </tr></thead>
                  <tbody>
                    {linhas.map(({ ct, etapa, corEtapa, campoProgramado, finalizacao, entregaDoc, progresso, temNotif }) => (
                      <tr key={ct.contrato}>
                        <td style={td}><div style={{ fontWeight: 600 }}>{ct.projeto}</div><div style={{ fontSize: 10.5, color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{ct.contrato}</div></td>
                        <td style={td}>{ct.cliente}</td>
                        <td style={td}><Badge text={etapa} c={etapa === "Em campo" ? "#fff" : corEtapa} bg={etapa === "Em campo" ? T.blue : etapa === "Concluído" ? T.green100 : "#fff"} /></td>
                        <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtD(campoProgramado)}</td>
                        <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtD(finalizacao)}</td>
                        <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtD(entregaDoc)}</td>
                        <td style={td}>
                          {progresso != null ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ flex: 1, background: T.grayBg, borderRadius: 4, height: 8, overflow: "hidden", minWidth: 60 }}>
                                <div style={{ width: `${progresso}%`, background: progresso >= 100 ? T.green700 : T.blue, height: "100%" }} />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft }}>{progresso}%</span>
                            </div>
                          ) : <span style={{ color: T.inkSoft, fontSize: 11 }}>—</span>}
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>{temNotif ? <span style={{ color: T.green700 }} title="Cliente notificado">✓</span> : <span style={{ color: T.inkSoft }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "10px 14px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                  Datas extraídas das programações, condicionantes e marcos do cliente · o avanço é calculado sobre o período campo→finalização · "—" indica marco ainda não definido
                </div>
              </div>
            </div>
          );
        })()}

        {/* Condicionantes — sub-aba independente (preenchida por contrato) */}
        {tab === "comercial" && subComercial === "cond" && contratos.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum contrato cadastrado</div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 16px" }}>
              As condicionantes (prazos, exigências do serviço e fiscal) são registradas por contrato — cadastre os contratos primeiro.
            </p>
            <Btn kind="primary" onClick={() => setSubComercial("ct")}>Ir para Contratos</Btn>
          </div>
        )}
        {tab === "comercial" && subComercial === "cond" && contratos.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Contrato / Projeto</th><th style={th}>Início das atividades</th><th style={th}>Fim das atividades de campo</th>
                <th style={th}>Fiscal responsável</th><th style={th}>Condicionantes do serviço</th>
                {(ehMaster || podeEditarDominio(user, "cond") || podeEditarDominio(user, "ct")) && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaContratos.map((ct) => {
                  const cd = condicionantes[ct.contrato] || {};
                  const pi = prazoStatus(cd.prazoIni);
                  const pf = prazoStatus(cd.prazoFim);
                  const podeEdCond = ehMaster || podeEditarDominio(user, "cond") || podeEditarDominio(user, "ct");
                  return (
                    <tr key={ct.contrato}>
                      <td style={td}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12.5 }}>{ct.contrato}</div>
                        <div style={{ fontSize: 11.5 }}>{ct.cliente}</div>
                        <div style={{ fontSize: 10.5, color: T.inkSoft, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ct.projeto}>{ct.projeto}</div>
                      </td>
                      <td style={td}>
                        <span style={pi.dash ? { fontSize: 11.5, color: T.amber, border: `1px dashed ${T.amber}`, borderRadius: 99, padding: "2px 8px" } : undefined}>
                          {pi.dash ? pi.tag : <Badge text={pi.tag} c={pi.c} bg={pi.bg} />}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={pf.dash ? { fontSize: 11.5, color: T.amber, border: `1px dashed ${T.amber}`, borderRadius: 99, padding: "2px 8px" } : undefined}>
                          {pf.dash ? pf.tag : <Badge text={pf.tag} c={pf.c} bg={pf.bg} />}
                        </span>
                      </td>
                      <td style={td}>
                        {cd.fiscal
                          ? <><div style={{ fontSize: 12.5, fontWeight: 600 }}>{cd.fiscal}</div><div style={{ fontSize: 10.5, color: T.inkSoft }}>{[cd.fiscalFone, cd.fiscalEmail].filter(Boolean).join(" · ") || "—"}</div></>
                          : <span style={{ color: T.inkSoft }}>—</span>}
                      </td>
                      <td style={{ ...td, fontSize: 11.5, color: T.inkSoft, maxWidth: 260 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={cd.condicoes}>{cd.condicoes || "—"}</div>
                      </td>
                      {podeEdCond && (
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          <Btn small kind={condicionantes[ct.contrato] ? "ghost" : "primary"} onClick={() => setModal({ tipo: "cond", ct })}>{condicionantes[ct.contrato] ? "Editar" : "Preencher"}</Btn>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaContratos.length} contrato(s) · prazos de início e fim de campo com alerta ⚠ a 15 dias · entram como restrições e contatos do Motor de Alocação
            </div>
          </div>
        )}

        {/* TAPs do Holmes */}
        {tab === "tap" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[["cli", "🏢 Clientes"], ["ct", "📄 Contratos"], ["__tap", "📋 TAPs"]].map(([id, label]) => (
              <button key={id} onClick={() => { if (id !== "__tap") { setSubComercial(id); setTab("comercial"); } }} style={{
                border: `1px solid ${id === "__tap" ? T.green700 : T.line}`,
                background: id === "__tap" ? T.green700 : "#fff",
                color: id === "__tap" ? "#fff" : T.inkSoft,
                borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{label}</button>
            ))}
          </div>
        )}
        {tab === "tap" && taps.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhuma TAP cadastrada</div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 520, margin: "0 auto 16px" }}>
              Abra um novo projeto preenchendo a TAP (Termo de Abertura de Projeto) — com cliente, premissas, marcos, riscos e o dossiê contratual. O IDGEO é gerado automaticamente e o projeto entra na aba Planos.
            </p>
            {perfil === "master" && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <Btn kind="primary" onClick={() => setModal({ tipo: "novaTap" })}>+ Nova TAP</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            )}
          </div>
        )}
        {tab === "tap" && taps.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 }}>
              {[
                ["📋 TAPs no sistema", tapsStats.total, T.green900],
                ["⏳ Aguardando programação", tapsStats.aguardando, tapsStats.aguardando > 0 ? T.amber : T.green700],
                ["⚡ Entrada em campo ≤15d", tapsStats.quinzeDias, tapsStats.quinzeDias > 0 ? T.amber : T.green700],
                ["🔴 Entrada em campo vencida", tapsStats.atrasados, tapsStats.atrasados > 0 ? T.red : T.green700],
              ].map(([lbl, val, cor]) => (
                <div key={lbl} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: T.inkSoft }}>{lbl}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: cor }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>IDGEO</th><th style={th}>Projeto</th><th style={th}>Local</th><th style={th}>Serviços</th>
                  <th style={th}>Mobilização</th><th style={th}>Entrada em campo</th><th style={th}>Gerente</th>
                  {podeVerValorContrato && <th style={{ ...th, textAlign: "right" }}>Valor 🔒</th>}
                  <th style={th}>Status</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {listaTaps.map((t) => {
                    const mob = prazoStatus(t.mobilizacao);
                    const ent = prazoStatus(t.entradaCampo);
                    const cliOk = clientes.some((c) => cnpjKey(c.cnpj) === cnpjKey(t.cnpj) || c.nome === t.cliente);
                    const concluido = ["Concluído", "Cancelado"].includes(t.statusTap);
                    return (
                      <tr key={t.idgeo} style={{ opacity: concluido ? 0.55 : 1 }}>
                        <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                          {t.idgeo}
                          <div style={{ fontSize: 10, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, color: T.inkSoft }}>{t.carteira}{t.urgente15 ? " · ⚡<15d" : ""}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.projeto}>{t.projeto || "—"}</div>
                          <div style={{ fontSize: 11, color: T.inkSoft }}>{t.cliente}{!cliOk && <span style={{ color: T.amber }} title="Cliente não cadastrado na aba 🏢 Clientes"> ⚠</span>}</div>
                        </td>
                        <td style={{ ...td, fontSize: 12.5 }}>{t.cidade || "—"}{t.uf ? `/${t.uf}` : ""}</td>
                        <td style={td}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 190 }}>
                            {(t.tipoServico || []).slice(0, 3).map((s) => <span key={s} style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: T.green100, color: T.green700 }} title={s}>{s.length > 22 ? s.slice(0, 21) + "…" : s}</span>)}
                            {(t.tipoServico || []).length > 3 && <span style={{ fontSize: 9.5, color: T.inkSoft }} title={t.tipoServico.join(" · ")}>+{t.tipoServico.length - 3}</span>}
                          </div>
                        </td>
                        <td style={td}>{mob.dash ? <span style={{ color: T.amber, fontSize: 11 }}>—</span> : <Badge text={mob.tag} c={mob.c} bg={mob.bg} />}</td>
                        <td style={td}>{ent.dash ? <span style={{ color: T.amber, fontSize: 11 }}>—</span> : <Badge text={ent.tag} c={ent.c} bg={ent.bg} />}</td>
                        <td style={{ ...td, fontSize: 11.5 }}>{t.gerente || "—"}</td>
                        {podeVerValorContrato && <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtBRL(t.valor)}</td>}
                        <td style={td}>
                          {podeEditarMaq ? (
                            <select value={t.statusTap || "Aguardando programação"} onChange={(e) => setStatusTap(t.idgeo, e.target.value)}
                              style={{ ...inputStyle, padding: "4px 6px", fontSize: 11.5, width: 175 }}>
                              {STATUS_TAP.map((s) => <option key={s}>{s}</option>)}
                            </select>
                          ) : <span style={{ fontSize: 11.5 }}>{t.statusTap}</span>}
                        </td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {podeEditarMaq && !concluido && <><Btn small kind="ghost" onClick={() => setModal({ tipo: "prog", tap: t })}>✏️ Editar</Btn>{" "}</>}
                          <button onClick={() => setModal({ tipo: "tapDet", tap: t })} style={{ background: T.amber, color: "#3A2E08", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>📖 LEIA!</button>{" "}
                          {perfil === "master" && (confirma === "tap:" + t.idgeo
                            ? <Btn small kind="danger" onClick={() => excluirTap(t.idgeo)}>Confirmar?</Btn>
                            : <Btn small kind="danger" onClick={() => setConfirma("tap:" + t.idgeo)}>Excluir</Btn>)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                {listaTaps.length} TAP(s) · ordenados pela entrada em campo mais próxima · reimportar a exportação do Holmes atualiza os TAPs existentes pelo IDGEO preservando o status · cada TAP "Aguardando programação" será o gatilho da Programação de Atividades e do Motor de Alocação
              </div>
            </div>
          </>
        )}

        {/* Sub-navegação da aba Planejamento */}
        {tab === "planos" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[["planos", "📝 Planos de Trabalho"], ["decisao", "🎯 Decisão de alocação"]].map(([id, label]) => (
              <button key={id} onClick={() => setSubPlanos(id)} style={{
                border: `1px solid ${subPlanos === id ? T.green700 : T.line}`,
                background: subPlanos === id ? T.green700 : "#fff",
                color: subPlanos === id ? "#fff" : T.inkSoft,
                borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* ===== PLANOS DE TRABALHO: etapa entre a TAP e a Inteligência ===== */}
        {tab === "planos" && subPlanos === "planos" && (() => {
          const podeGerir = ehMaster || ehGerente || podeEditarDominio(user, "planos");
          /* TAPs abertas (todas que não estão concluídas/canceladas) — recebem planos */
          const q = (busca || "").toLowerCase().trim();
          const abertas = taps
            .filter((t) => !["Concluído", "Cancelado"].includes(t.statusTap))
            .filter((t) => !q || (t.projeto || "").toLowerCase().includes(q) || (t.cliente || "").toLowerCase().includes(q) || (t.idgeo || "").toLowerCase().includes(q) || (t.carteira || "").toLowerCase().includes(q) || (t.gerente || "").toLowerCase().includes(q));
          const semPlano = abertas.filter((t) => !((planos || {})[t.idgeo] || []).length);
          const comPlano = abertas.filter((t) => ((planos || {})[t.idgeo] || []).length);
          return (
            <>
              <div style={{ background: "linear-gradient(135deg, #0F2E4D, #1F5C8A)", color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, marginBottom: 4 }}>📝 Planejamento — Planos de Trabalho</div>
                <div style={{ fontSize: 13, opacity: 0.92, maxWidth: 760 }}>
                  Cada TAP aberta aguarda o(s) <b>Plano(s) de Trabalho</b> do Gerente de Projeto da carteira. O sistema lê cada plano (equipe, materiais, equipamentos, prazos) e só então a TAP entra na <b>Inteligência</b> para simular e gerar as Ordens de Serviço.
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 8 }}>Fluxo: Cliente → Contrato → <b>TAP</b> → <b>Plano(s) de Trabalho</b> → Ordens de Serviço</div>
              </div>

              {abertas.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "40px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 17, color: T.green900, marginBottom: 6 }}>Nenhuma TAP aberta</div>
                  <p style={{ fontSize: 13.5, color: T.inkSoft }}>Importe TAPs na aba 📋 TAPs para começar a anexar os planos de trabalho.</p>
                  <Btn kind="primary" onClick={() => setTab("tap")}>Ir para 📋 TAPs</Btn>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11.5, color: T.inkSoft }}>⏳ Aguardando plano</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 700, color: semPlano.length ? T.amber : T.green700 }}>{semPlano.length}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11.5, color: T.inkSoft }}>✓ Com plano (na Inteligência)</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 700, color: T.green700 }}>{comPlano.length}</div>
                    </div>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>
                        <th style={th}>TAP / Projeto</th><th style={th}>Carteira</th><th style={th}>Gerente</th>
                        <th style={th}>Planos de Trabalho</th><th style={th}>Status</th>
                        {podeGerir && <th style={th}></th>}
                      </tr></thead>
                      <tbody>
                        {abertas.map((t) => {
                          const lista = (planos || {})[t.idgeo] || [];
                          return (
                            <tr key={t.idgeo}>
                              <td style={td}>
                                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 12.5, color: T.green900 }}>{t.idgeo}</div>
                                <div style={{ fontSize: 12 }}>{t.projeto}</div>
                                <div style={{ fontSize: 10.5, color: T.inkSoft }}>{t.cliente}</div>
                              </td>
                              <td style={{ ...td, fontSize: 12 }}>{t.carteira || "—"}</td>
                              <td style={{ ...td, fontSize: 12 }}>{t.gerente || "—"}</td>
                              <td style={td}>
                                {lista.length === 0 ? <span style={{ fontSize: 12, color: T.inkSoft }}>—</span> : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {lista.map((p) => (
                                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                                        <span>📄 {p.nome}</span>
                                        <span style={{ fontSize: 10, color: T.inkSoft }}>({(p.anexos || (p.anexo ? [p.anexo] : [])).length} doc)</span>
                                        {p.analiseIA && !p.analiseIA.erro && <span title="Lido pela IA" style={{ color: T.green700 }}>🤖✓</span>}
                                        {podeGerir && <button onClick={() => excluirPlano(t.idgeo, p.id)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 11 }}>✕</button>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td style={td}>
                                {lista.length ? <Badge text="✓ Pronto p/ Inteligência" c="#fff" bg={T.green700} /> : <Badge text="⏳ Aguardando plano" c={T.amber} bg={T.amberBg} />}
                              </td>
                              {podeGerir && (
                                <td style={{ ...td, whiteSpace: "nowrap" }}>
                                  <Btn small kind="primary" onClick={() => setModal({ tipo: "novoPlano", tap: t })}>+ Plano</Btn>
                                  {lista.length > 0 && <>{" "}<Btn small onClick={() => setTab("inteligencia")}>→ Inteligência</Btn></>}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ padding: "10px 14px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                      {abertas.length} TAP(s) aberta(s) · só TAPs com ao menos 1 Plano de Trabalho entram na Inteligência para simulação e geração de OSs
                    </div>
                  </div>
                </>
              )}

            {/* ===== PROGRAMAÇÃO DE ATIVIDADES (movida do Operacional) ===== */}
            {ehGestorPlanejamento && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <Btn kind="primary" onClick={() => setModal({ tipo: "progManual" })}>+ Nova programação manual</Btn>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 }}>
              {[
                ["📅 Projetos programados", progStats.programadas, T.green700],
                ["⏳ TAPs aguardando programação", progStats.aguardando, progStats.aguardando > 0 ? T.amber : T.green700],
                ["📐 Dias de campo estimados", progStats.diasTotais, T.green900],
              ].map(([lbl, val, cor]) => (
                <div key={lbl} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: T.inkSoft }}>{lbl}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: cor }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Fila de TAPs aguardando */}
            {tapsAguardando.length > 0 && (
              <div style={{ background: T.amberBg, border: `1px solid #F0CC7E`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.amber, marginBottom: 8 }}>⏳ {tapsAguardando.length} TAP(s) aguardando programação</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tapsAguardando.map((t) => (
                    <button key={t.idgeo} onClick={() => ehGestorPlanejamento && setModal({ tipo: "prog", tap: t })} disabled={!ehGestorPlanejamento}
                      style={{ textAlign: "left", border: `1px solid ${T.line}`, background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: podeEditarMaq ? "pointer" : "default", maxWidth: 260 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12.5 }}>{t.idgeo}{t.urgente15 ? " ⚡" : ""}</div>
                      <div style={{ fontSize: 11.5, color: T.green900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.projeto}</div>
                      <div style={{ fontSize: 10.5, color: T.inkSoft }}>{t.cidade}{t.uf ? `/${t.uf}` : ""} · campo {t.entradaCampo ? fmtData(t.entradaCampo) : "—"}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projetos programados */}
            {progList.length === 0 ? (
              <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "32px 24px", textAlign: "center", fontSize: 13.5, color: T.inkSoft }}>
                Nenhum projeto programado ainda. Clique em um TAP da fila acima para definir as atividades de campo.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {progList.map((p) => {
                  const est = estimaDias(p);
                  const janela = p.inicioPrev && p.fimPrev ? Math.round((new Date(p.fimPrev) - new Date(p.inicioPrev)) / 864e5) + 1 : null;
                  const estouro = janela != null && est.dias > janela;
                  const ini = prazoStatus(p.inicioPrev);
                  const prCor = p.prioridade === "Alta" ? T.red : p.prioridade === "Baixa" ? T.gray : T.amber;
                  return (
                    <div key={p.idgeo} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${T.line}`, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: T.green900 }}>{p.idgeo}</span>
                            <Badge text={p.status} c={p.status === "Programado" ? T.blue : T.amber} bg={p.status === "Programado" ? T.blueBg : "#fff"} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: prCor, border: `1px solid ${prCor}`, borderRadius: 99, padding: "1px 8px" }}>{p.prioridade}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{p.tap.projeto}</div>
                          <div style={{ fontSize: 11.5, color: T.inkSoft }}>{p.tap.cliente} · 📍 {p.local}{p.uf ? `/${p.uf}` : ""}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: T.inkSoft }}>Início previsto</div>
                          {ini.dash ? <span style={{ color: T.amber, fontSize: 12 }}>—</span> : <Badge text={ini.tag} c={ini.c} bg={ini.bg} />}
                          {ehGestorPlanejamento && <div style={{ marginTop: 6, display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}><Btn small onClick={() => setModal({ tipo: "prog", tap: p.tap })}>Atividades</Btn></div>}
                        </div>
                      </div>
                      <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.atividades.filter((a) => +a.qtd > 0).map((a) => {
                          const atv = ATIVIDADES.find((x) => x.id === a.id);
                          return (
                            <span key={a.id} title={`${atv?.label}${a.obs ? " · " + a.obs : ""}`} style={{ fontSize: 12, background: T.green100, color: T.green900, borderRadius: 6, padding: "4px 10px" }}>
                              <b>{atv?.short || a.id}</b> · {fmtNum(a.qtd)} {a.unid}
                            </span>
                          );
                        })}
                        {p.atividades.filter((a) => +a.qtd > 0).length === 0 && <span style={{ fontSize: 12.5, color: T.inkSoft }}>Programação sem quantidades definidas (rascunho)</span>}
                      </div>
                      <div style={{ padding: "8px 16px", borderTop: `1px solid ${T.line}`, fontSize: 12, color: estouro ? T.amber : T.inkSoft, display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span>📐 ≈ {est.dias} dia(s) de campo{p.equipes > 1 ? ` · ${p.equipes} equipes` : ""}</span>
                        {janela != null && <span>🗓 janela {janela} dia(s){estouro ? " ⚠ esforço excede a janela" : ""}</span>}
                        {p.obs && <span style={{ color: T.inkSoft }}>📝 {p.obs}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderTop: `1px solid ${T.line}`, flexWrap: "wrap", alignItems: "center" }}>
                        {(() => {
                          const pz = p.executivo && p.executivo.pesos;
                          const custom = pz && Object.keys(PESOS_PADRAO).some((k) => (pz[k] ?? PESOS_PADRAO[k]) !== PESOS_PADRAO[k]);
                          return (
                            <Btn small kind={custom ? "ghost" : "primary"} onClick={() => setModal({ tipo: "exec", tap: p.tap })}>
                              📐 Executivo{custom ? " · pesos ajustados" : ""}
                            </Btn>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: T.inkSoft }}>
              A programação confirmada é o insumo direto do Motor de Alocação: o quê (atividades + quantidades) · quando (janela) · onde (local) · prioridade. O Motor cruzará com aptidões, SMS, máquinas, frota e localização das equipes para propor quem executa cada projeto.
            </div>
            </>
          );
        })()}

        {/* ===== DECISÃO DE ALOCAÇÃO (pré-agendamento + cenários) — movida da Inteligência para o Planejamento ===== */}
        {tab === "planos" && subPlanos === "decisao" && (() => {
          const lista = Object.entries(preAgendamentos || {})
            .map(([idgeo, pre]) => ({ idgeo, pre, tap: taps.find((t) => t.idgeo === idgeo) }))
            .filter((x) => x.tap);
          const podeConfirmar = ehMaster || ehGerente;
          const podeSimular = ehMaster || podeEditarDominio(user, "planos"); // Gestor de Operações (Planejamento)
          const podeValidar = ehMaster || ehGerente;                       // gerente valida
          const programados = projetosInteligencia; // TAPs com Plano de Trabalho (para a simulação de cenários por viés)
          return (
            <div>
              <div style={{ background: "linear-gradient(135deg, #6B3FA0, #1F5C8A)", color: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18 }}>🧠 Projetos pré-agendados</div>
                <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 2 }}>A partir do Plano de Trabalho, o sistema leu o escopo e montou as opções de alocação. Ajuste os serviços/quantidades que a IA entendeu, confira a tabela de contingência (equipe, recursos, disponibilidade) e confirme a janela — que vira a OS oficial e reserva os recursos.</div>
              </div>
              {lista.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "32px 24px", textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 6 }}>Nenhum projeto pré-agendado ainda</div>
                  <p style={{ fontSize: 13, color: T.inkSoft, maxWidth: 560, margin: "0 auto" }}>Quando um Plano de Trabalho é salvo na aba <b>Planejamento</b>, a Inteligência lê o dossiê e gera aqui as opções de alocação. Abaixo, você ainda pode simular cenários por viés (custo, logística, tempo) para os projetos com plano.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {lista.map(({ idgeo, pre, tap }) => (
                    <PreAgendamentoCard key={idgeo} idgeo={idgeo} pre={pre} tap={tap} podeConfirmar={podeConfirmar}
                      onRecalcular={(q, e, jan) => recalcularPreAgendamento(idgeo, q, e, jan)}
                      onConfirmar={(opId, janela) => confirmarPreAgendamento(idgeo, opId, janela)}
                      sugerirJanelas={sugerirJanelas}
                      onAddServico={(id, sid) => addServicoPreAg(id, sid)}
                      onRemoverServico={(id, sid) => removerServicoPreAg(id, sid)} />
                  ))}
                </div>
              )}
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, color: T.green900, margin: "8px 0 10px", borderTop: `2px solid ${T.line}`, paddingTop: 14 }}>🎲 Simulação por projeto</div>

              {programados.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "40px", textAlign: "center", color: T.inkSoft }}>
                  Nenhum projeto pronto para simular. Só TAPs com <b>Plano de Trabalho</b> anexado (aba 📝 Planejamento) entram aqui.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {programados.map(({ idgeo, p, tap }) => {
                    const cs = p.cenarioSel;
                    const corStatus = !cs ? T.inkSoft : cs.status === "Validado" ? T.green700 : cs.status === "Rejeitado" ? T.red : T.amber;
                    return (
                      <div key={idgeo} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: T.green900 }}>{idgeo}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{tap.projeto}</span>
                            <div style={{ fontSize: 11.5, color: T.inkSoft }}>{tap.cliente} · {p.local}{p.uf ? `/${p.uf}` : ""} · {p.atividades.filter((a) => +a.qtd > 0).length} atividade(s)</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {cs && <Badge text={cs.status} c={corStatus === T.amber ? T.amber : "#fff"} bg={cs.status === "Validado" ? T.green700 : cs.status === "Rejeitado" ? T.red : cs.status === "Aguardando validação" ? T.amber : "#fff"} />}
                            {podeSimular && <Btn small kind="primary" onClick={() => setModal({ tipo: "cenarios", cenariosIdgeo: idgeo })}>{cs ? "↻ Re-simular" : "🎲 Rodar simulação"}</Btn>}
                          </div>
                        </div>

                        {/* Cenário escolhido e estado do fluxo */}
                        {cs && (
                          <div style={{ marginTop: 10, padding: "10px 12px", background: cs.status === "Validado" ? T.green100 : cs.status === "Rejeitado" ? T.redBg : T.amberBg, borderRadius: 8, fontSize: 12.5 }}>
                            <div><b>Cenário escolhido:</b> {cs.nome} · custo {fmtBRL(cs.os?.custoTotal)} · {cs.os?.diasCampo} dia(s) · escolhido por {cs.escolhidoPor} em {fmtData(cs.em)}</div>
                            {cs.status === "Aguardando validação" && podeValidar && (
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <Btn small kind="primary" onClick={() => validarCenario(idgeo, true)}>✓ Validar</Btn>
                                <Btn small kind="danger" onClick={() => { const m = prompt("Motivo da rejeição (opcional):") || ""; validarCenario(idgeo, false, m); }}>✗ Rejeitar</Btn>
                              </div>
                            )}
                            {cs.status === "Aguardando validação" && !podeValidar && <div style={{ color: T.amber, marginTop: 4 }}>⏳ Aguardando validação do gerente de projetos.</div>}
                            {cs.status === "Validado" && <div style={{ color: T.green700, marginTop: 4 }}>✓ Validado por {cs.validadoPor} em {fmtData(cs.validadoEm)} — OS gerada e equipe em campo.</div>}
                            {cs.status === "Rejeitado" && (
                              <div style={{ color: T.red, marginTop: 4 }}>
                                ✗ Rejeitado{cs.motivoRejeicao ? `: "${cs.motivoRejeicao}"` : ""}. {podeSimular ? "Rode nova simulação e proponha outro cenário." : "Aguardando nova proposta do planejador."}
                              </div>
                            )}
                            {cs.historico && cs.historico.length > 0 && (
                              <details style={{ marginTop: 6, fontSize: 11.5, color: T.inkSoft }}>
                                <summary style={{ cursor: "pointer" }}>Histórico de rejeições ({cs.historico.length})</summary>
                                {cs.historico.map((h, i) => <div key={i}>• {h.nome} rejeitado por {h.rejeitadoPor} em {fmtData(h.em)}{h.motivo ? `: ${h.motivo}` : ""}</div>)}
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Programação de Atividades */}
        {tab === "prog" && taps.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Acompanhamento de campo</div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, maxWidth: 480, margin: "0 auto 16px" }}>
              Aqui o Coordenador de Operações registra a produtividade diária das equipes em campo (RDO). Os projetos aparecem quando viram OS aprovada e entram em campo, pelo fluxo Planejamento → Inteligência.
            </p>
          </div>
        )}
        {tab === "prog" && taps.length > 0 && (
          <>
            {/* ===== APONTAMENTO DIÁRIO DE CAMPO (projetos com OS em campo) ===== */}
            {(() => {
              /* projetos cuja OS está aprovada e a TAP está "Em campo" */
              const emCampo = Object.entries(ordens)
                .map(([idgeo, os]) => ({ idgeo, os, tap: taps.find((t) => t.idgeo === idgeo) }))
                .filter((x) => x.tap && (x.tap.statusTap === "Em campo" || x.os.status === "Aprovada"));
              if (emCampo.length === 0) return (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "40px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 6 }}>Nenhum projeto em campo no momento</div>
                  <p style={{ fontSize: 13, color: T.inkSoft, maxWidth: 520, margin: "0 auto" }}>Assim que uma OS for aprovada na Inteligência e o projeto entrar em campo, ele aparece aqui para o lançamento diário de produtividade (RDO): km percorridos, horas do técnico e avanço por serviço.</p>
                </div>
              );
              const podeLancar = ehMaster || podeEditarDominio(user, "prog") || ehGerente;
              const fmtD = (x) => x ? fmtData(x) : "—";
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ background: "linear-gradient(135deg, #0F2E4D, #1F5C8A)", color: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                    <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18 }}>🛠 Apontamento diário de campo</div>
                    <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 2 }}>Lançamento da produtividade real dos projetos em campo — km percorridos, horas do técnico e desempenho por serviço, a partir da data de mobilização.</div>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {emCampo.map(({ idgeo, os, tap }) => {
                      const lista = (apontamentos || {})[idgeo] || [];
                      const dataMob = os.inicio || tap.entradaCampo || "";
                      /* acumulados */
                      const kmAcum = lista.reduce((s, a) => s + (+a.km || 0), 0);
                      const horasAcum = lista.reduce((s, a) => s + (+a.horasTecnico || 0), 0);
                      /* % de avanço: soma do realizado por serviço vs. previsto na OS */
                      const previsto = {}; (os.atividades || []).forEach((a) => { if (a.id) previsto[a.id] = +a.qtd || 0; });
                      const realizado = {}; lista.forEach((ap) => Object.entries(ap.itens || {}).forEach(([k, v]) => { realizado[k] = (realizado[k] || 0) + (+v || 0); }));
                      const idsPrev = Object.keys(previsto).filter((k) => previsto[k] > 0);
                      const avancoPct = idsPrev.length === 0 ? null : Math.round(idsPrev.reduce((s, k) => s + Math.min(1, (realizado[k] || 0) / previsto[k]), 0) / idsPrev.length * 100);
                      /* não conformidades e dias parados */
                      const ncs = lista.filter((a) => a.naoConforme);
                      const diasParados = lista.filter((a) => a.statusDia === "parado").length;
                      return (
                        <div key={idgeo} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: T.green900 }}>{tap.projeto || idgeo} <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.inkSoft }}>· {idgeo}</span></div>
                              <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 2 }}>{tap.cliente} · mobilização {fmtD(dataMob)} · {lista.length} dia(s) lançado(s)</div>
                              {lista.length > 0 && <div style={{ fontSize: 11.5, color: T.blue, marginTop: 3 }}>Acumulado: {kmAcum} km · {horasAcum} h de técnico</div>}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {lista.length > 0 && <Btn kind="ghost" small onClick={() => setModal({ tipo: "kpis", idgeo, os, tap })}>📊 KPIs</Btn>}
                              {podeLancar && <Btn kind="primary" small onClick={() => setModal({ tipo: "apontamento", idgeo, os })}>+ Lançar dia</Btn>}
                            </div>
                          </div>

                          {/* barra de avanço + indicadores de saúde */}
                          {(avancoPct != null || ncs.length > 0 || diasParados > 0) && (
                            <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                              {avancoPct != null && (
                                <div style={{ flex: "1 1 240px", minWidth: 200 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.inkSoft, marginBottom: 3 }}><span>Avanço físico</span><span style={{ fontWeight: 700, color: avancoPct >= 100 ? T.green700 : T.green900 }}>{avancoPct}%</span></div>
                                  <div style={{ height: 8, background: T.paper, borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ width: `${avancoPct}%`, height: "100%", background: avancoPct >= 100 ? T.green700 : avancoPct >= 50 ? T.blue : T.amber, borderRadius: 99 }} />
                                  </div>
                                </div>
                              )}
                              {ncs.length > 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.red, background: T.redBg, padding: "4px 10px", borderRadius: 99 }}>⚠ {ncs.length} não conformidade(s)</span>}
                              {diasParados > 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.amber, background: T.amberBg, padding: "4px 10px", borderRadius: 99 }}>🔴 {diasParados} dia(s) parado(s)</span>}
                            </div>
                          )}
                          {lista.length > 0 && (
                            <div style={{ marginTop: 10, overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead><tr>
                                  <th style={{ ...th, padding: "6px 8px" }}>Data</th>
                                  <th style={{ ...th, padding: "6px 8px", textAlign: "right" }}>Km</th>
                                  <th style={{ ...th, padding: "6px 8px", textAlign: "right" }}>Horas téc.</th>
                                  <th style={{ ...th, padding: "6px 8px" }}>Produtividade</th>
                                  <th style={{ ...th, padding: "6px 8px" }}>Obs.</th>
                                  {podeLancar && <th style={{ ...th, padding: "6px 8px" }}></th>}
                                </tr></thead>
                                <tbody>
                                  {lista.map((a) => (
                                    <tr key={a.data}>
                                      <td style={{ ...td, padding: "6px 8px", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtData(a.data)}</td>
                                      <td style={{ ...td, padding: "6px 8px", textAlign: "right" }}>{a.km || "—"}</td>
                                      <td style={{ ...td, padding: "6px 8px", textAlign: "right" }}>{a.horasTecnico || "—"}</td>
                                      <td style={{ ...td, padding: "6px 8px", fontSize: 11 }}>
                                        {Object.entries(a.itens || {}).filter(([, v]) => v).map(([id, v]) => {
                                          const at = ATIVIDADES.find((x) => x.id === id) || {}; const u = (UNID_PROD[id] || at.unidProd || "unid").replace("/dia", "");
                                          return `${at.short || id}: ${v} ${u}`;
                                        }).join(" · ") || "—"}
                                      </td>
                                      <td style={{ ...td, padding: "6px 8px", fontSize: 11, color: T.inkSoft, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.obs}>{a.obs || "—"}</td>
                                      {podeLancar && (
                                        <td style={{ ...td, padding: "6px 8px", whiteSpace: "nowrap" }}>
                                          <button onClick={() => setModal({ tipo: "apontamento", idgeo, os, inicial: a })} style={{ border: "none", background: "none", color: T.blue, cursor: "pointer", fontSize: 11 }}>editar</button>
                                          {confirma === "ap:" + idgeo + a.data
                                            ? <button onClick={() => excluirApontamento(idgeo, a.data)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>confirmar?</button>
                                            : <button onClick={() => setConfirma("ap:" + idgeo + a.data)} style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 11 }}>excluir</button>}
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </>
        )}

        {/* Regras de Composição de Equipe */}
        {/* Sub-navegação da aba Custos (Parâmetros de Custo | Regras de Equipe) */}
        {tab === "custos" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[["custos", "💵 Parâmetros de Custo"], ["regras", "🧩 Regras de Equipe"]].map(([id, label]) => (
              <button key={id} onClick={() => setSubCustos(id)} style={{
                border: `1px solid ${subCustos === id ? T.green700 : T.line}`,
                background: subCustos === id ? T.green700 : "#fff",
                color: subCustos === id ? "#fff" : T.inkSoft,
                borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{label}</button>
            ))}
          </div>
        )}

        {tab === "custos" && subCustos === "regras" && (
          <>
            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: T.inkSoft }}>
              Defina, por atividade, <b>quais papéis</b> a equipe precisa ter, o <b>nível mínimo</b> exigido na Matriz de Aptidões (0–4) e <b>quantas pessoas</b> de cada papel.
              Estas regras são o que o <b>Motor de Alocação</b> seguirá ao montar as equipes — em vez de decidir por conta própria. As regras já vêm pré-preenchidas com um padrão; ajuste conforme a prática da GEOAMBIENTE.
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Atividade</th><th style={th}>Composição exigida</th><th style={{ ...th, textAlign: "center" }}>Equipe mín.</th><th style={{ ...th, textAlign: "center" }}>Resp. técnico</th>
                  {podeEditarApt && <th style={th}></th>}
                </tr></thead>
                <tbody>
                  {ATIVIDADES.map((atv) => {
                    const r = regrasEquipe[atv.id];
                    const papeis = (normalizarRegra(r).cargos) || [];
                    const total = papeis.reduce((s, p) => s + (+p.qtd || 0), 0);
                    return (
                      <tr key={atv.id}>
                        <td style={td}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: T.green900 }}>{atv.short}</div>
                          <div style={{ fontSize: 10.5, color: T.inkSoft, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={atv.label}>{atv.label}</div>
                        </td>
                        <td style={td}>
                          {papeis.length === 0 ? <span style={{ color: T.amber, fontSize: 12 }}>⚠ sem regra definida</span> : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {papeis.map((p, i) => (
                                <span key={i} style={{ fontSize: 11.5, background: T.green100, color: T.green900, borderRadius: 6, padding: "2px 8px" }}>
                                  {p.qtd}× {p.cargo} <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.green700 }}>≥{p.nivelMin}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ ...td, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{total || "—"}</td>
                        <td style={{ ...td, textAlign: "center" }}>{r && r.exigeRespTec ? <Badge text="Sim" c={T.amber} bg={T.amberBg} /> : <span style={{ color: T.inkSoft }}>—</span>}</td>
                        {podeEditarApt && (
                          <td style={{ ...td, whiteSpace: "nowrap" }}>
                            <Btn small onClick={() => setModal({ tipo: "regra", atv })}>Editar</Btn>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                {ATIVIDADES.length} atividades · "≥N" indica o nível mínimo na Matriz de Aptidões · o Motor combinará as regras de todas as atividades de um projeto para dimensionar a equipe completa, respeitando NR/ASO válidos e disponibilidade
              </div>
            </div>
          </>
        )}

        {/* Dashboard (visível a todos, inclusive gerentes) */}
        {tab === "dash" && (() => {
          const hoje = new Date();
          const ini = (dias) => { const d = new Date(); d.setDate(d.getDate() - dias); return d.toISOString().slice(0, 10); };
          const periodos = { mes: ini(30), tri: ini(90), sem: ini(180), ano: ini(365) };
          /* OS aprovadas = projetos com equipe em campo; usa aprovadaEm como data de referência */
          const osList = Object.values(ordens || {});
          const aprovadas = osList.filter((o) => o.status === "Aprovada");
          /* acumula custo por categoria dentro de cada período */
          const cats = ["servicos", "pessoas", "materiais", "veiculos", "depreciacao", "hospedagem", "alimentacao"];
          const catLabel = { servicos: "Serviços (unitários)", pessoas: "Pessoas", materiais: "Materiais", veiculos: "Veículos / mobilização", depreciacao: "Depreciação equip.", hospedagem: "Hospedagem", alimentacao: "Alimentação" };
          const acumula = (desde) => {
            const r = { total: 0 }; cats.forEach((c) => r[c] = 0);
            aprovadas.forEach((o) => {
              const ref = o.aprovadaEm || o.geradoEm;
              if (ref && ref >= desde) {
                const cc = o.custoCategorias || {};
                cats.forEach((c) => { r[c] += (+cc[c] || 0); });
                r.total += (+o.custoTotal || 0);
              }
            });
            return r;
          };
          const acMes = acumula(periodos.mes), acTri = acumula(periodos.tri), acSem = acumula(periodos.sem), acAno = acumula(periodos.ano);
          /* indicadores de contagem */
          const concluidosMes = taps.filter((t) => t.statusTap === "Concluído" && (t.entregaRelatorio || "") >= periodos.mes).length;
          const emCampo = taps.filter((t) => t.statusTap === "Em campo");
          const noPrazo = emCampo.filter((t) => !t.entregaRelatorio || t.entregaRelatorio >= hojeISO()).length;
          const atrasados = taps.filter((t) => ["Em campo", "Programado"].includes(t.statusTap) && t.entregaRelatorio && t.entregaRelatorio < hojeISO()).length;
          /* distância percorrida no mês: soma dos km das OS aprovadas no mês */
          const kmMes = aprovadas.filter((o) => (o.aprovadaEm || o.geradoEm || "") >= periodos.mes).reduce((s, o) => s + (+o.kmTotal || 0), 0);
          /* colaboradores em campo: pessoas designadas nas OS aprovadas em campo */
          const matsEmCampo = new Set();
          aprovadas.forEach((o) => { if (taps.find((t) => t.idgeo === o.idgeo && t.statusTap === "Em campo")) (o.equipe || []).forEach((e) => { if (!e.vazio && e.mat) matsEmCampo.add(e.mat); }); });
          const colabEmCampo = matsEmCampo.size;

          const Card = ({ icone, titulo, valor, cor, sub }) => (
            <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: T.inkSoft }}>{icone} {titulo}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 700, color: cor || T.green900, lineHeight: 1.1, marginTop: 4 }}>{valor}</div>
              {sub && <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 2 }}>{sub}</div>}
            </div>
          );
          const colP = { servicos: "#0F2E4D", pessoas: "#1F5C8A", materiais: "#2E8B97", veiculos: "#5B6FB0", depreciacao: "#8A6FB0", hospedagem: "#B97D10", alimentacao: "#3F8A5B" };
          const maxCat = Math.max(1, ...cats.map((c) => acAno[c]));
          /* indicadores de campo a partir dos apontamentos (RDO) */
          const todosApts = Object.values(apontamentos || {}).flat();
          const ncMes = todosApts.filter((a) => a && a.naoConforme && (a.data || "") >= periodos.mes).length;
          const avancos = Object.entries(ordens || {}).map(([idgeo, os]) => {
            const tp = taps.find((t) => t.idgeo === idgeo);
            if (!tp || tp.statusTap !== "Em campo") return null;
            const lst = (apontamentos || {})[idgeo] || [];
            const prev = {}; (os.atividades || []).forEach((a) => { if (a.id) prev[a.id] = +a.qtd || 0; });
            const real = {}; lst.forEach((ap) => Object.entries(ap.itens || {}).forEach(([k, v]) => { real[k] = (real[k] || 0) + (+v || 0); }));
            const ids = Object.keys(prev).filter((k) => prev[k] > 0);
            if (!ids.length) return null;
            return Math.round(ids.reduce((s, k) => s + Math.min(1, (real[k] || 0) / prev[k]), 0) / ids.length * 100);
          }).filter((x) => x != null);
          const avancoMedio = avancos.length ? Math.round(avancos.reduce((s, x) => s + x, 0) / avancos.length) : null;

          return (
            <>
              <div style={{ background: `linear-gradient(135deg, ${T.green900}, ${T.green700})`, color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>📈 Dashboard GeoópS</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Visão geral do andamento das operações de campo · {fmtData(hojeISO())}</div>
              </div>

              {/* Vigilância de atualização das abas (Fase 2) — painel consolidado */}
              {(() => {
                const linhas = ABAS_VIGIADAS.map((a) => ({ ...a, sf: semaforoAtualizacao(a.dom), c: (data?.atualizacoes || {})[a.dom] }));
                const atrasadas = linhas.filter((l) => l.sf.nivel === "atencao" || l.sf.nivel === "critico").length;
                return (
                  <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.green900 }}>🕒 Atualização das abas de entrada</div>
                      <div style={{ fontSize: 12, color: atrasadas > 0 ? T.amber : T.green700, fontWeight: 600 }}>
                        {atrasadas > 0 ? `${atrasadas} aba(s) precisando de atenção` : "todas em dia"}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                      {linhas.map((l) => (
                        <div key={l.dom} style={{ border: `1px solid ${l.sf.cor}`, background: l.sf.bg, borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, display: "flex", alignItems: "center", gap: 5 }}>
                            <span>{l.sf.nivel === "critico" ? "🔴" : l.sf.nivel === "atencao" ? "🟡" : l.sf.nivel === "sem" ? "⚪" : "🟢"}</span>{l.label}
                          </div>
                          <div style={{ fontSize: 10.5, color: l.sf.cor, fontWeight: 600, marginTop: 2 }}>{l.sf.txt}</div>
                          {l.c?.por && <div style={{ fontSize: 9.5, color: T.inkSoft }}>por {l.c.por}</div>}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 9 }}>🟢 em dia (&lt;24h) · 🟡 atenção (&gt;24h) · 🔴 crítico (&gt;72h) · ⚪ nunca atualizada</div>
                  </div>
                );
              })()}

              {/* Cronograma de Operações (grade Gantt consolidada) */}
              <CronogramaGrade colaboradores={colaboradores} maquinas={maquinas} frota={frota} equipamentos={equipamentos} travas={travas} taps={taps} ordens={ordens} />

              {/* Indicadores de contagem */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                <Card icone="✅" titulo="Projetos concluídos no mês" valor={concluidosMes} cor={T.green700} />
                <Card icone="🎯" titulo="Projetos no prazo" valor={noPrazo} cor={T.green700} sub="em campo, dentro do prazo" />
                <Card icone="🔴" titulo="Projetos atrasados" valor={atrasados} cor={atrasados ? T.red : T.green700} sub="prazo de relatório vencido" />
                <Card icone="🛣" titulo="Distância no mês" valor={`${kmMes.toLocaleString("pt-BR")} km`} cor={T.blue} sub="ida e volta às obras" />
                <Card icone="👷" titulo="Colaboradores em campo" valor={colabEmCampo} cor={T.green900} sub="alocados em OS ativas" />
                <Card icone="📊" titulo="Avanço médio em campo" valor={avancoMedio == null ? "—" : `${avancoMedio}%`} cor={avancoMedio == null ? T.inkSoft : avancoMedio >= 50 ? T.green700 : T.amber} sub="realizado vs. previsto (RDO)" />
                <Card icone="⚠" titulo="Não conformidades no mês" valor={ncMes} cor={ncMes > 0 ? T.red : T.green700} sub="lançadas no apontamento de campo" />
              </div>

              {/* Painel de indicadores por audiência (Fase 2) — campo e gestão nunca misturados */}
              {(() => {
                /* ---- Saturação de recursos: % de cada classe com trava ativa hoje ---- */
                const hojeI = hojeISO();
                const ativaHoje = (lista) => (lista || []).some((tv) => tv.ini && tv.fim && tv.ini <= hojeI && tv.fim >= hojeI);
                const satClasse = (tipo, universo) => {
                  const tt = (travas || {})[tipo] || {};
                  const total = universo.length || 0;
                  if (!total) return { pct: null, ocup: 0, total: 0 };
                  const ocup = universo.filter((id) => ativaHoje(tt[id])).length;
                  return { pct: Math.round((ocup / total) * 100), ocup, total };
                };
                const satPessoas = satClasse("pessoa", colaboradores.filter((c) => c.status !== "Desligado").map((c) => c.mat));
                const satMaq = satClasse("maquina", (maquinas || []).map((m) => m.cod));
                const satFrota = satClasse("frota", (frota || []).map((v) => v.placa));
                const satEquip = satClasse("equipamento", (equipamentos || []).map((e) => e.cod));
                const corSat = (p) => p == null ? T.gray : p >= 85 ? T.red : p >= 60 ? T.amber : T.green700;

                /* ---- Custo orçado por contrato: soma das OS do contrato vs. valor contratado ---- */
                const porContrato = (contratos || []).map((ct) => {
                  const osCt = aprovadas.filter((o) => {
                    const tp = taps.find((t) => t.idgeo === o.idgeo);
                    return tp && (tp.cnpj === ct.cnpj || tp.cliente === ct.cliente);
                  });
                  const custo = osCt.reduce((s, o) => s + (+o.custoTotal || 0), 0);
                  const valor = +ct.valorContrato || 0;
                  const pct = valor > 0 ? Math.round((custo / valor) * 100) : null;
                  return { cliente: ct.cliente, valor, custo, pct, n: osCt.length };
                }).filter((x) => x.n > 0).sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, 6);

                /* ---- Metas de campo: produtividade planejada por atividade nas OS em campo (sem cifras) ---- */
                const metasCampo = {};
                aprovadas.forEach((o) => {
                  const tp = taps.find((t) => t.idgeo === o.idgeo);
                  if (!tp || tp.statusTap !== "Em campo") return;
                  (o.atividades || []).forEach((a) => {
                    if (!a.id) return;
                    const meta = (produtividade || {})[a.id] || PROD_DIA[a.id];
                    if (!meta) return;
                    if (!metasCampo[a.id]) metasCampo[a.id] = { label: (ATIVIDADES.find((x) => x.id === a.id) || {}).short || a.id, meta, unid: UNID_PROD[a.id] || "un/dia", frentes: 0 };
                    metasCampo[a.id].frentes++;
                  });
                });
                const metasArr = Object.values(metasCampo).slice(0, 6);

                /* ---- Realizado em campo (RDO): por projeto em campo, cruza apontamentos × OS ---- */
                const realizadoProjetos = aprovadas.map((o) => {
                  const tp = taps.find((t) => t.idgeo === o.idgeo);
                  if (!tp || tp.statusTap !== "Em campo") return null;
                  const r = calcularRealizado(o, (apontamentos || {})[o.idgeo], custos);
                  if (!r.temRDO) return null;
                  return { idgeo: o.idgeo, projeto: tp.projeto || o.idgeo, cliente: tp.cliente, ...r };
                }).filter(Boolean);

                const Faixa = ({ cor, icone, titulo, subtitulo, children }) => (
                  <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderTop: `3px solid ${cor}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: T.green900 }}>{icone} {titulo}</span>
                      <span style={{ fontSize: 11, color: cor, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".06em" }}>{subtitulo}</span>
                    </div>
                    {children}
                  </div>
                );
                const podeGestao = ehMaster || podeEditarDominio(user, "custos") || podeEditarDominio(user, "prog");

                return (
                  <>
                    {/* GESTÃO — custo, margem, ROI (só quem tem visão de gestão) */}
                    {podeGestao && (
                      <Faixa cor={T.amber} icone="📊" titulo="Visão de gestão" subtitulo="custo · margem · saturação">
                        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 12 }}>Indicadores de decisão executiva. Não exibidos às equipes de campo.</div>
                        {/* Saturação */}
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.green900, marginBottom: 6 }}>Saturação de recursos hoje</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
                          {[["Equipe", satPessoas], ["Máquinas", satMaq], ["Frota", satFrota], ["Equipamentos", satEquip]].map(([lab, s]) => (
                            <div key={lab} style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px" }}>
                              <div style={{ fontSize: 11.5, color: T.inkSoft }}>{lab}</div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, color: corSat(s.pct) }}>{s.pct == null ? "—" : `${s.pct}%`}</div>
                              <div style={{ fontSize: 10.5, color: T.inkSoft }}>{s.ocup} de {s.total} em uso</div>
                              {s.pct != null && <div style={{ height: 5, background: T.grayBg, borderRadius: 99, marginTop: 5, overflow: "hidden" }}><div style={{ width: `${s.pct}%`, height: "100%", background: corSat(s.pct) }} /></div>}
                            </div>
                          ))}
                        </div>
                        {/* Custo × contrato */}
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.green900, marginBottom: 6 }}>Custo orçado vs. valor de contrato</div>
                        {porContrato.length === 0 ? (
                          <div style={{ fontSize: 12, color: T.inkSoft }}>Nenhuma OS aprovada vinculada a contrato ainda.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {porContrato.map((c) => {
                              const cor = c.pct == null ? T.gray : c.pct >= 90 ? T.red : c.pct >= 70 ? T.amber : T.green700;
                              return (
                                <div key={c.cliente} style={{ display: "grid", gridTemplateColumns: "1.4fr 2fr auto", gap: 10, alignItems: "center", fontSize: 12 }}>
                                  <div style={{ fontWeight: 600, color: T.green900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.cliente}</div>
                                  <div style={{ height: 16, background: T.grayBg, borderRadius: 99, overflow: "hidden", position: "relative" }}>
                                    <div style={{ width: `${Math.min(100, c.pct || 0)}%`, height: "100%", background: cor }} />
                                  </div>
                                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: cor, whiteSpace: "nowrap" }}>{c.pct == null ? "—" : `${c.pct}%`}</div>
                                </div>
                              );
                            })}
                            <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 2 }}>Custo orçado pelo Motor (não o realizado — esse virá do RDO). Verde &lt;70% · âmbar 70-90% · vermelho &gt;90% do valor contratado.</div>
                          </div>
                        )}
                      </Faixa>
                    )}

                    {/* REALIZADO (RDO) — o eixo da verdade: previsto×realizado, avanço e custo realizado */}
                    {podeGestao && (
                      <Faixa cor={T.blue} icone="📓" titulo="Realizado em campo" subtitulo="RDO · previsto × realizado">
                        <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 12 }}>Fonte: apontamento diário de campo. O que de fato aconteceu, por projeto em campo.</div>
                        {realizadoProjetos.length === 0 ? (
                          <div style={{ fontSize: 12, color: T.inkSoft }}>Nenhum apontamento de campo lançado ainda nos projetos em campo. Conforme o RDO for preenchido, o avanço e o custo realizado aparecem aqui.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {realizadoProjetos.map((p) => {
                              const corAv = p.avancoPct == null ? T.gray : p.avancoPct >= 80 ? T.green700 : p.avancoPct >= 40 ? T.amber : T.red;
                              const corCusto = p.custoPct == null ? T.gray : p.custoPct <= 80 ? T.green700 : p.custoPct <= 100 ? T.amber : T.red;
                              return (
                                <div key={p.idgeo} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: T.green900 }}>{p.projeto}</div>
                                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: T.inkSoft }}>{p.idgeo} · {p.diasApontados} dia(s) apontado(s)</div>
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                                    <div>
                                      <div style={{ fontSize: 10.5, color: T.inkSoft }}>Avanço (realizado ÷ previsto)</div>
                                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: corAv }}>{p.avancoPct == null ? "—" : `${p.avancoPct}%`}</div>
                                      <div style={{ height: 5, background: T.grayBg, borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${Math.min(100, p.avancoPct || 0)}%`, height: "100%", background: corAv }} /></div>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 10.5, color: T.inkSoft }}>Custo realizado ÷ orçado</div>
                                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: corCusto }}>{p.custoPct == null ? "—" : `${p.custoPct}%`}</div>
                                      <div style={{ fontSize: 10, color: T.inkSoft }}>{fmtBRL(p.custoRealizado)} de {fmtBRL(p.custoOrcado)}</div>
                                    </div>
                                  </div>
                                  {/* previsto×realizado por atividade */}
                                  {p.porAtividade.filter((a) => a.previsto > 0).length > 0 && (
                                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                      {p.porAtividade.filter((a) => a.previsto > 0).slice(0, 5).map((a) => (
                                        <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: 8, alignItems: "center", fontSize: 11 }}>
                                          <div style={{ color: T.ink }}>{a.label}</div>
                                          <div style={{ height: 12, background: T.grayBg, borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${Math.min(100, a.pct || 0)}%`, height: "100%", background: a.pct >= 100 ? T.green700 : T.blue }} /></div>
                                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: T.inkSoft, whiteSpace: "nowrap" }}>{a.realizado}/{a.previsto} {a.unid}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {p.naoConformidades > 0 && <div style={{ marginTop: 8, fontSize: 11, color: T.red, fontWeight: 600 }}>⚠ {p.naoConformidades} não conformidade(s) registrada(s)</div>}
                                </div>
                              );
                            })}
                            <div style={{ fontSize: 10.5, color: T.inkSoft }}>Custo realizado calculado do RDO (km rodado + dias apontados × materiais e estadia). Avanço: realizado ÷ previsto por atividade.</div>
                          </div>
                        )}
                      </Faixa>
                    )}

                    {/* CAMPO — produção em unidades, sem cifras */}
                    <Faixa cor={T.green700} icone="🦺" titulo="Visão de campo" subtitulo="produção · metas · sem custos">
                      <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 12 }}>Metas de produtividade das frentes ativas, na unidade de cada serviço. Sem informação de custo.</div>
                      {metasArr.length === 0 ? (
                        <div style={{ fontSize: 12, color: T.inkSoft }}>Nenhuma frente em campo com meta de produtividade definida.</div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                          {metasArr.map((m) => (
                            <div key={m.label} style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px" }}>
                              <div style={{ fontSize: 11.5, color: T.inkSoft }}>{m.label}</div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: T.green700 }}>{m.meta}</div>
                              <div style={{ fontSize: 10.5, color: T.inkSoft }}>{m.unid} · {m.frentes} frente(s)</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Faixa>
                  </>
                );
              })()}

              {/* Painel de projetos ativos — cartões em 2 colunas com código de cores */}
              {(() => {
                /* projetos ativos: programado, em campo, ou concluído há ≤7 dias */
                const seteDiasAtras = ini(7);
                const ativos = taps.filter((t) => {
                  if (["Programado", "Em campo"].includes(t.statusTap)) return true;
                  if (t.statusTap === "Concluído") return (t.entregaRelatorio || t.fimReal || "") >= seteDiasAtras;
                  return false;
                });
                /* classificação de cor por situação */
                const classificar = (t) => {
                  const prog = programacoes[t.idgeo] || {};
                  const os = ordens[t.idgeo] || {};
                  const prazoFim = t.entregaRelatorio || prog.fimPrev || "";
                  const atrasado = prazoFim && prazoFim < hojeISO() && t.statusTap !== "Concluído";
                  const custoEstourado = os.custoTotal && os.custoOrcado && +os.custoTotal > +os.custoOrcado;
                  /* tempo em campo passando do previsto */
                  let passandoPrazo = false;
                  if (t.statusTap === "Em campo" && prog.inicioPrev && prog.fimPrev) {
                    passandoPrazo = hojeISO() > prog.fimPrev;
                  }
                  /* risco de atraso: faltam ≤5 dias para o fim e ainda não concluído */
                  let risco = false;
                  if (prazoFim && t.statusTap !== "Concluído") {
                    const d = Math.floor((new Date(prazoFim) - new Date(hojeISO())) / 864e5);
                    risco = d >= 0 && d <= 5;
                  }
                  if (t.statusTap === "Concluído") return { cor: "#3F8A5B", bg: "#E6F2EA", label: "Concluído", icone: "✅" };
                  if (atrasado || custoEstourado) return { cor: "#B3402A", bg: "#F9E5E0", label: custoEstourado && !atrasado ? "Custo acima do orçado" : "Atrasado", icone: "🔴" };
                  if (risco) return { cor: "#C9711A", bg: "#FBEBDA", label: "Risco de atraso", icone: "🟠" };
                  if (passandoPrazo) return { cor: "#9A7B12", bg: "#FBF6E0", label: "Em campo — além do previsto", icone: "🟡" };
                  if (t.statusTap === "Programado") return { cor: "#B5568A", bg: "#FBE9F3", label: "Aguardando início", icone: "🩷" };
                  return { cor: "#1F5C8A", bg: "#E2EDF6", label: "Dentro do previsto", icone: "🔵" };
                };
                if (ativos.length === 0) return null;
                /* divide em 2 colunas */
                const col1 = [], col2 = [];
                ativos.forEach((t, i) => (i % 2 === 0 ? col1 : col2).push(t));
                const ProjetoCard = ({ t }) => {
                  const c = classificar(t);
                  const prog = programacoes[t.idgeo] || {};
                  const os = ordens[t.idgeo] || {};
                  const equipe = (os.equipe || []).filter((e) => !e.vazio);
                  return (
                    <div style={{ background: c.bg, border: `1px solid ${c.cor}33`, borderLeft: `5px solid ${c.cor}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: T.green900 }}>{t.projeto || t.idgeo}</div>
                          <div style={{ fontSize: 10.5, color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{t.idgeo} · {t.cliente || ""}</div>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: c.cor, borderRadius: 99, padding: "3px 9px", whiteSpace: "nowrap" }}>{c.icone} {c.label}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", marginTop: 8, fontSize: 11.5 }}>
                        <div>📍 {prog.local || t.cidade || "—"}</div>
                        <div>👷 {equipe.length ? `${equipe.length} pessoa(s)` : "sem equipe"}</div>
                        <div>⚙️ {os.maquina ? os.maquina.cod : "—"}</div>
                        <div>🚗 {os.veiculo ? os.veiculo.placa : "—"}</div>
                        <div>🔬 {(os.equipamentos && os.equipamentos.length) ? `${os.equipamentos.length} equip.` : "—"}</div>
                        <div>📅 {prog.fimPrev ? `fim ${fmtData(prog.fimPrev)}` : t.entregaRelatorio ? `entrega ${fmtData(t.entregaRelatorio)}` : "—"}</div>
                      </div>
                      {equipe.length > 0 && (
                        <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 6, borderTop: `1px solid ${c.cor}22`, paddingTop: 5 }}>
                          {equipe.map((e) => e.nome.split(" ")[0]).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                };
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900 }}>🗂 Projetos ativos ({ativos.length})</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 10.5, color: T.inkSoft }}>
                        {[["🔵", "no previsto"], ["🩷", "aguardando início"], ["🟡", "além do prazo em campo"], ["🟠", "risco de atraso"], ["🔴", "atrasado/custo"], ["✅", "concluído"]].map(([ic, lb]) => <span key={lb}>{ic} {lb}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>{col1.map((t) => <ProjetoCard key={t.idgeo} t={t} />)}</div>
                      <div>{col2.map((t) => <ProjetoCard key={t.idgeo} t={t} />)}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Custos por período e por tipo */}
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 4 }}>💰 Custos das equipes em campo</div>
                <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 12 }}>Acumulado por período, a partir das Ordens de Serviço aprovadas.</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead><tr>
                      <th style={{ ...th, textAlign: "left" }}>Tipo de custo</th>
                      <th style={{ ...th, textAlign: "right" }}>Mês</th>
                      <th style={{ ...th, textAlign: "right" }}>Trimestre</th>
                      <th style={{ ...th, textAlign: "right" }}>Semestre</th>
                      <th style={{ ...th, textAlign: "right" }}>Anual</th>
                    </tr></thead>
                    <tbody>
                      {cats.map((c) => (
                        <tr key={c}>
                          <td style={td}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: colP[c], marginRight: 6 }} />{catLabel[c]}</td>
                          <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(acMes[c])}</td>
                          <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(acTri[c])}</td>
                          <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(acSem[c])}</td>
                          <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmtBRL(acAno[c])}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: `2px solid ${T.line}` }}>
                        <td style={{ ...td, fontWeight: 700 }}>Σ Total</td>
                        <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{fmtBRL(acMes.total)}</td>
                        <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{fmtBRL(acTri.total)}</td>
                        <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{fmtBRL(acSem.total)}</td>
                        <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{fmtBRL(acAno.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* barra de composição anual */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 6 }}>Composição do custo anual por tipo</div>
                  {cats.map((c) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, width: 130, color: T.inkSoft }}>{catLabel[c]}</span>
                      <div style={{ flex: 1, background: T.grayBg, borderRadius: 4, height: 16, overflow: "hidden" }}>
                        <div style={{ width: `${(acAno[c] / maxCat) * 100}%`, background: colP[c], height: "100%" }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", width: 90, textAlign: "right" }}>{fmtBRL(acAno[c])}</span>
                    </div>
                  ))}
                </div>
              </div>

              {aprovadas.length === 0 && (
                <div style={{ background: T.amberBg, color: T.amber, borderRadius: 10, padding: "14px 16px", fontSize: 13 }}>
                  ⚠ Ainda não há Ordens de Serviço aprovadas. Os custos e indicadores se preencherão à medida que o Motor de Alocação gerar e as carteiras aprovarem as OS. Ajuste primeiro as taxas na aba 💵 Custos & Parâmetros.
                </div>
              )}
            </>
          );
        })()}

        {/* Custos & Parâmetros */}
        {tab === "custos" && (() => {
          const podeEd = ehMaster || podeEditarDominio(user, "custos");
          const campos = [
            ["kmDiarioCampo", "Rodagem diária em campo", "km rodados por dia na frente de trabalho (entra no custo de transporte)"],
            ["hospedagemPessoaDia", "Hospedagem", "R$ por pessoa / dia (aplicada quando a obra fica a mais de 80 km)"],
            ["alimentacaoPessoaDia", "Alimentação", "R$ por pessoa / dia"],
            ["veiculoLeveDia", "Veículo leve (diária)", "R$/dia — camionete/carro de apoio"],
            ["veiculoPesadoDia", "Veículo pesado (diária)", "R$/dia — caminhão / sonda sobre caminhão"],
            ["materiaisDiaEquipe", "Materiais / consumíveis", "R$ por dia de equipe (tubos, calda, frascaria, EPI...)"],
            ["deprMaquinaDia", "Depreciação — máquina", "R$/dia de uso de sonda/máquina pesada"],
            ["deprEquipamentoDia", "Depreciação — equipamento", "R$/dia de uso de equipamento de campo"],
          ];
          const lista = precosUnitarios || [];
          const setItem = (id, campo, valor) => salvarPrecos(lista.map((x) => x.id === id ? { ...x, [campo]: valor } : x));
          const addItem = () => salvarPrecos([...lista, { id: "pu_" + Date.now().toString(36), item: "", unidade: "R$/unid", preco: 0 }]);
          const rmItem = (id) => salvarPrecos(lista.filter((x) => x.id !== id));
          return (
            <>
              {subCustos === "custos" && (<>
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900 }}>💵 Eficiência — Custos & Parâmetros</div>
                <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 4 }}>A <b>matriz de preços unitários</b> é a base do cálculo: o Motor cruza a quantidade de cada serviço (lida do executivo) com o preço unitário. As <b>diárias</b> complementam custos de campo por dia/pessoa.</div>
              </div>

              {/* ============ MATRIZ DE PREÇOS UNITÁRIOS ============ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900 }}>📐 Matriz de preços unitários</div>
                {podeEd && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small onClick={() => setModal({ tipo: "importPrecos" })}>📋 Importar planilha (Excel)</Btn>
                    <Btn small kind="primary" onClick={addItem}>+ Adicionar item</Btn>
                  </div>
                )}
              </div>
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, overflowX: "auto", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr>
                    <th style={{ ...th, textAlign: "left" }}>Item de custo</th>
                    <th style={{ ...th, width: 130 }}>Unidade</th>
                    <th style={{ ...th, textAlign: "right", width: 150 }}>Preço unitário (R$)</th>
                    {podeEd && <th style={{ ...th, width: 50 }}></th>}
                  </tr></thead>
                  <tbody>
                    {lista.length === 0 && <tr><td style={td} colSpan={podeEd ? 4 : 3}><span style={{ color: T.inkSoft }}>Nenhum item. Adicione manualmente ou importe a planilha.</span></td></tr>}
                    {lista.map((it) => (
                      <tr key={it.id}>
                        <td style={td}>
                          <input disabled={!podeEd} value={it.item} onChange={(e) => setItem(it.id, "item", e.target.value)}
                            style={{ ...inputStyle, padding: "6px 8px" }} placeholder="Descrição do serviço" />
                        </td>
                        <td style={td}>
                          <select disabled={!podeEd} value={it.unidade} onChange={(e) => setItem(it.id, "unidade", e.target.value)} style={{ ...inputStyle, padding: "6px 8px" }}>
                            {UNIDADES_CUSTO.includes(it.unidade) ? null : <option value={it.unidade}>{it.unidade}</option>}
                            {UNIDADES_CUSTO.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <input type="number" min="0" step="0.01" disabled={!podeEd} value={it.preco} onChange={(e) => setItem(it.id, "preco", e.target.value === "" ? 0 : +e.target.value)}
                            style={{ ...inputStyle, padding: "6px 8px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }} />
                        </td>
                        {podeEd && <td style={{ ...td, textAlign: "center" }}><button onClick={() => rmItem(it.id)} title="Remover" style={{ border: "none", background: "none", color: T.red, cursor: "pointer", fontSize: 16 }}>×</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "8px 14px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                  {lista.length} item(ns) · ex.: Sondagem R$/m · PSG R$/ponto · Análise VOC R$/unid · Mobilização R$/km
                </div>
              </div>

              {/* ============ DIÁRIAS E PARÂMETROS COMPLEMENTARES ============ */}
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 4 }}>📆 Diárias e parâmetros complementares</div>
              <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 10 }}>Custos por dia/pessoa que complementam os preços unitários (mobilização por km, hospedagem, alimentação, depreciação...).</div>
              <div style={{ background: T.green100, color: T.green900, borderRadius: 8, padding: "10px 14px", fontSize: 12.5, marginBottom: 12 }}>
                <b>👥 Pessoas (rateio)</b> — o custo de pessoal vem do salário+encargos de cada colaborador (aba RH), rateado por dia de campo.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {[["kmRodado", "Mobilização e transporte", "R$ por km rodado (ida e volta)"], ...campos].map(([key, label, ajuda]) => (
                  <div key={key} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.green900 }}>{label}</div>
                    <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 8, minHeight: 28 }}>{ajuda}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: T.inkSoft }}>R$</span>
                      <input type="number" min="0" step="0.01" disabled={!podeEd}
                        value={custos[key] ?? ""} onChange={(e) => salvarCustos({ [key]: e.target.value === "" ? 0 : +e.target.value })}
                        style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }} />
                    </div>
                  </div>
                ))}
              </div>
              {!podeEd && <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 12 }}>🔒 Apenas o acesso "Custos & Parâmetros" e a Diretoria editam estes valores.</div>}
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 12 }}>Salvo automaticamente ao alterar. Ajuste conforme a realidade da GEOAMBIENTE para que as estimativas do Motor reflitam seus custos reais.</div>

              {/* ============ METAS DE PRODUTIVIDADE POR SERVIÇO ============ */}
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginTop: 28, marginBottom: 4 }}>📈 Metas de produtividade por serviço</div>
              <div style={{ fontSize: 11.5, color: T.inkSoft, marginBottom: 4 }}>Produtividade real medida das equipes (unidades por dia, por equipe). O Motor usa estas metas para estimar o tempo das equipes em campo: <i>dias = quantidade ÷ produtividade ÷ nº de equipes</i>.</div>
              <div style={{ fontSize: 11, color: T.blue, background: T.blueBg, borderRadius: 6, padding: "6px 10px", marginBottom: 10, display: "inline-block" }}>ℹ️ Hoje a produtividade independe do equipamento. No futuro, será possível detalhar a produtividade por equipamento utilizado.</div>
              <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr>
                    <th style={{ ...th, textAlign: "left" }}>Tipo de serviço</th>
                    <th style={{ ...th, textAlign: "right", width: 150 }}>Produtividade / dia</th>
                    <th style={{ ...th, width: 120 }}>Unidade</th>
                  </tr></thead>
                  <tbody>
                    {ATIVIDADES.map((a) => (
                      <tr key={a.id}>
                        <td style={td}><div style={{ fontWeight: 600 }}>{a.short}</div><div style={{ fontSize: 10.5, color: T.inkSoft, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.label}>{a.label}</div></td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <input type="number" min="0" step="0.1" disabled={!podeEd}
                            value={(produtividade && produtividade[a.id] != null) ? produtividade[a.id] : ""}
                            onChange={(e) => salvarProdutividade({ [a.id]: e.target.value === "" ? 0 : +e.target.value })}
                            placeholder="—"
                            style={{ ...inputStyle, padding: "6px 8px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, width: 120 }} />
                        </td>
                        <td style={{ ...td, fontSize: 12, color: T.inkSoft }}>{UNID_PROD[a.id] || a.unidProd || "unid/dia"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "8px 14px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                  {ATIVIDADES.length} serviços do escopo da GEOAMBIENTE · ex.: sondagem ~20 m/dia · amostragem baixa vazão ~6 amostras/dia · campos vazios fazem o Motor sinalizar estimativa parcial
                </div>
              </div>
              </>)}
            </>
          );
        })()}

        {/* ===== AUTORIZAÇÕES OPERACIONAIS (mobile → gestor do contrato) ===== */}
        {tab === "autoriz" && (() => {
          const ehGestor = ehMaster || ehGerente;
          const minhaCarteira = user?.carteira || "";
          /* gestor vê as da sua carteira (ou todas, se master); demais veem as que criaram */
          const visiveis = (autorizacoes || []).filter((a) => {
            if (ehMaster) return true;
            if (ehGerente) return !minhaCarteira || a.carteira === minhaCarteira;
            return a.mat === user?.mat || a.nome === user?.aba;
          });
          const pendentes = visiveis.filter((a) => a.status === "Pendente");
          const decididas = visiveis.filter((a) => a.status !== "Pendente");
          const tipoInfo = (id) => TIPOS_AUTORIZACAO.find((t) => t.id === id) || { label: id, icone: "📋" };
          const fmtQuando = (iso) => { try { return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };
          return (
            <>
              <div style={{ background: "linear-gradient(135deg, #0F2E4D, #1F5C8A)", color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20, marginBottom: 4 }}>📲 Autorizações operacionais</div>
                <div style={{ fontSize: 13, opacity: 0.92, maxWidth: 720 }}>
                  Solicitações de campo (hora extra, veículo, hotel, Uber, passagem) enviadas ao <b>gestor do contrato</b> para aprovação em tempo real. Pelo celular, o colaborador pede; o gestor da carteira autoriza ou nega.
                </div>
              </div>

              {/* botão de nova solicitação — disponível a todos os perfis */}
              <div style={{ marginBottom: 16 }}>
                <Btn kind="primary" onClick={() => setModal({ tipo: "novaAutorizacao" })}>+ Nova solicitação</Btn>
              </div>

              {/* PENDENTES */}
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 8 }}>
                ⏳ Pendentes {pendentes.length > 0 && <span style={{ fontSize: 12, color: T.amber }}>({pendentes.length})</span>}
              </div>
              {pendentes.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "24px", textAlign: "center", color: T.inkSoft, fontSize: 13, marginBottom: 20 }}>
                  Nenhuma solicitação pendente.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                  {pendentes.map((a) => {
                    const ti = tipoInfo(a.tipo);
                    return (
                      <div key={a.id} style={{ background: "#fff", border: `1px solid ${T.amber}`, borderLeft: `5px solid ${T.amber}`, borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: T.green900 }}>{ti.icone} {ti.label}</div>
                            <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>
                              👤 {a.nome} {a.mat ? `(${a.mat})` : ""} · 📍 {a.projeto || a.idgeo || "—"} {a.carteira ? `· ${a.carteira}` : ""}
                            </div>
                            <div style={{ fontSize: 12.5, marginTop: 6 }}>
                              {a.data && <span style={{ marginRight: 12 }}>📅 {fmtData(a.data)}</span>}
                              {a.valor && <span style={{ marginRight: 12 }}>💰 {ti.unidadeValor === "R$" ? fmtBRL(a.valor) : `${a.valor} ${ti.unidadeValor || ""}`}</span>}
                            </div>
                            {a.justificativa && <div style={{ fontSize: 12.5, marginTop: 6, color: T.ink, fontStyle: "italic" }}>"{a.justificativa}"</div>}
                            <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 6 }}>solicitado {fmtQuando(a.criadoEm)}</div>
                          </div>
                          {ehGestor ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 130 }}>
                              <Btn small kind="primary" onClick={() => decidirAutorizacao(a.id, true, "")}>✓ Aprovar</Btn>
                              <Btn small kind="danger" onClick={() => { const m = window.prompt("Motivo da recusa (opcional):", ""); if (m !== null) decidirAutorizacao(a.id, false, m); }}>✕ Negar</Btn>
                            </div>
                          ) : (
                            <Badge text="Aguardando gestor" c={T.amber} bg={T.amberBg} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DECIDIDAS */}
              {decididas.length > 0 && (
                <>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, color: T.green900, marginBottom: 8 }}>Histórico</div>
                  <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                      <thead><tr>
                        <th style={th}>Tipo</th><th style={th}>Colaborador</th><th style={th}>Projeto</th>
                        <th style={th}>Detalhe</th><th style={th}>Status</th><th style={th}>Decisão</th>
                        {ehMaster && <th style={th}></th>}
                      </tr></thead>
                      <tbody>
                        {decididas.map((a) => {
                          const ti = tipoInfo(a.tipo);
                          return (
                            <tr key={a.id}>
                              <td style={td}>{ti.icone} {ti.label}</td>
                              <td style={td}>{a.nome}</td>
                              <td style={{ ...td, fontSize: 11.5 }}>{a.projeto || a.idgeo || "—"}</td>
                              <td style={{ ...td, fontSize: 11.5 }}>{a.data ? fmtData(a.data) : ""}{a.valor ? ` · ${ti.unidadeValor === "R$" ? fmtBRL(a.valor) : a.valor + " " + (ti.unidadeValor || "")}` : ""}</td>
                              <td style={td}><Badge text={a.status} c={a.status === "Aprovada" ? "#fff" : T.red} bg={a.status === "Aprovada" ? T.green700 : "#fff"} /></td>
                              <td style={{ ...td, fontSize: 11 }}>{a.decididoPor || "—"}<div style={{ color: T.inkSoft }}>{a.decididoEm ? fmtQuando(a.decididoEm) : ""}{a.motivo ? ` · ${a.motivo}` : ""}</div></td>
                              {ehMaster && (
                                <td style={td}>{confirma === "aut:" + a.id ? <Btn small kind="danger" onClick={() => excluirAutorizacao(a.id)}>Confirmar?</Btn> : <Btn small kind="danger" onClick={() => setConfirma("aut:" + a.id)}>Excluir</Btn>}</td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div style={{ marginTop: 20, padding: "12px 14px", background: T.amberBg, borderRadius: 8, fontSize: 11.5, color: T.ink }}>
                ⚠️ <b>Beta:</b> nesta versão as solicitações ficam salvas neste aparelho. Para que cheguem ao gestor em outro dispositivo em tempo real, é necessário conectar o backend (Supabase). A estrutura já está pronta para essa conexão.
              </div>
            </>
          );
        })()}

        {/* Registro de Logins (auditoria) */}
        {tab === "logins" && ehMaster && (() => {
          const fmtDataHora = (iso) => { try { return new Date(iso).toLocaleString("pt-BR"); } catch { return iso; } };
          const exportarCSV = () => {
            const linhas = [["Data/Hora", "Aba/Acesso", "Tipo", "Carteira"]];
            (logins || []).forEach((l) => linhas.push([fmtDataHora(l.em), l.aba, l.tipo, l.carteira || ""]));
            const csv = linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
            const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `geoops_logins_${hojeISO()}.csv`; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          };
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900 }}>📝 Registro de Logins</div>
                  <div style={{ fontSize: 12.5, color: T.inkSoft }}>Histórico de acessos ao sistema — quem entrou, em qual aba e quando.</div>
                </div>
                <Btn kind="primary" onClick={exportarCSV} disabled={!(logins || []).length}>⬇ Exportar CSV</Btn>
              </div>
              {(!logins || logins.length === 0) ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "40px", textAlign: "center", color: T.inkSoft }}>
                  Nenhum login registrado ainda. Cada entrada no sistema é registrada automaticamente aqui.
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>
                      <th style={th}>Data / Hora</th><th style={th}>Aba / Acesso</th><th style={th}>Tipo</th><th style={th}>Carteira</th>
                    </tr></thead>
                    <tbody>
                      {logins.map((l, i) => (
                        <tr key={i}>
                          <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{fmtDataHora(l.em)}</td>
                          <td style={td}>{l.aba}</td>
                          <td style={td}><Badge text={l.tipo === "master" ? "Diretoria" : l.tipo === "gerente" ? "Gerente" : "Alimentação"} c={l.tipo === "master" ? T.green700 : l.tipo === "gerente" ? T.blue : T.amber} bg={l.tipo === "master" ? T.green100 : l.tipo === "gerente" ? T.blueBg : T.amberBg} /></td>
                          <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace" }}>{l.carteira || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                    {logins.length} login(s) registrado(s) · mais recentes no topo · exportável em CSV (abre no Excel)
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* Painel do Gerente (carteira) */}
        {tab === "gerente" && ehGerente && (() => {
          const carteira = user.carteira;
          const meusTaps = taps.filter((t) => (t.carteira || "").toUpperCase() === carteira && !["Cancelado"].includes(t.statusTap));
          const comProg = meusTaps.map((t) => ({ t, p: programacoes[t.idgeo], os: ordens[t.idgeo] }));
          const totalCusto = comProg.reduce((s, x) => s + (x.os?.custoTotal || 0), 0);
          const atrasados = meusTaps.filter((t) => t.entradaCampo && t.entradaCampo < hojeISO() && ["Aguardando programação", "Programado"].includes(t.statusTap)).length;
          const semProg = comProg.filter((x) => !x.p).length;
          return (
            <>
              <div style={{ background: `linear-gradient(135deg, ${T.blue}, #1d4e74)`, color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 20 }}>📊 Painel do Gerente — {carteira}</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Acompanhe os projetos da sua carteira: cronogramas, prazos com clientes e custos previstos. Você pode solicitar revisão das condições programadas.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
                {[["📋 Projetos na carteira", meusTaps.length, T.green900], ["⏳ Sem programação", semProg, semProg ? T.amber : T.green700], ["🔴 Entrada em campo vencida", atrasados, atrasados ? T.red : T.green700], ["💰 Custo previsto total", fmtBRL(totalCusto), T.green900]].map(([l, v, c]) => (
                  <div key={l} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: T.inkSoft }}>{l}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              {meusTaps.length === 0 ? (
                <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "40px", textAlign: "center", color: T.inkSoft }}>
                  Nenhum projeto vinculado à carteira {carteira}. Os TAPs precisam ter a carteira {carteira} para aparecerem aqui.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {comProg.map(({ t, p, os }) => {
                    const ent = prazoStatus(t.entradaCampo);
                    const rel = prazoStatus(t.entregaRelatorio);
                    return (
                      <div key={t.idgeo} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: T.green900 }}>{t.idgeo}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{t.projeto}</span>
                            <div style={{ fontSize: 11.5, color: T.inkSoft }}>{t.cliente} · {t.cidade}{t.uf ? `/${t.uf}` : ""}</div>
                          </div>
                          <div style={{ fontSize: 11.5 }}>{t.statusTap}</div>
                        </div>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 12 }}>
                          <span>Entrada em campo: {ent.dash ? "—" : <Badge text={ent.tag} c={ent.c} bg={ent.bg} />}</span>
                          <span>Entrega relatório: {rel.dash ? "—" : <Badge text={rel.tag} c={rel.c} bg={rel.bg} />}</span>
                          {p ? <span style={{ color: T.green700 }}>📅 programado ({p.atividades.filter((a)=>+a.qtd>0).length} atividades)</span> : <span style={{ color: T.amber }}>⏳ sem programação</span>}
                        </div>
                        {/* Checagem obrigatória de custos */}
                        <div style={{ marginTop: 10, padding: "10px 12px", background: os ? T.green100 : T.amberBg, borderRadius: 8, fontSize: 12.5 }}>
                          {os ? (
                            <>💰 Custo previsto do projeto: <b style={{ fontSize: 18 }}>{fmtBRL(os.custoTotal)}</b> <span style={{ color: T.inkSoft }}>— pessoal {fmtBRL(os.custoPessoal)} + deslocamento {fmtBRL(os.custoDeslocamento)} · {os.diasCampo} dia(s)</span>
                              <Btn small onClick={() => setModal({ tipo: "os", os })} >Ver OS</Btn></>
                          ) : <span style={{ color: T.amber }}>⚠ Custos ainda não calculados — o Motor de Alocação precisa rodar para este projeto antes da sua checagem.</span>}
                        </div>
                        {/* Solicitar revisão */}
                        <RevisaoBox idgeo={t.idgeo} revisoes={p?.revisoes || []} onSolicitar={solicitarRevisao} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}

        {/* Aba Inteligência — diagnóstico e oportunidades por IA */}
        {tab === "inteligencia" && (() => {
          return (
            <>
              <div style={{ background: `linear-gradient(135deg, ${T.green900}, ${T.green700})`, color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>💡 Oportunidades & diagnóstico (IA)</div>
                    <div style={{ fontSize: 13, opacity: 0.92, marginTop: 4, maxWidth: 720 }}>
                      A Inteligência lê continuamente todas as abas funcionais (equipe, aptidões, SMS, comercial, planos, eficiência, máquinas, frotas, equipamentos, localização) e a saída do Motor de Alocação, e aponta riscos logísticos, oportunidades de relocação e antecipação. Use "Atualizar agora" para gerar uma nova leitura.
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Btn small kind="primary" onClick={rodarCheckup} disabled={checkupCarregando}>{checkupCarregando ? "Lendo base…" : "↻ Atualizar agora"}</Btn>
                      {checkup && !checkup.erro && <Btn small kind="ghost" onClick={baixarRelatorioInteligencia}>📄 Baixar relatório PDF</Btn>}
                    </div>
                    {checkupEm && <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 4 }}>Leitura em cache: {new Date(checkupEm).toLocaleString("pt-BR")}</div>}
                  </div>
                </div>
              </div>

              {/* Painel de check-up consolidado */}
              {(() => {
                const snap = (checkup && checkup.snap) || montarSnapshot();
                const ind = snap.indicadores;
                const card = (label, valor, cor) => (
                  <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px", flex: "1 1 150px" }}>
                    <div style={{ fontSize: 11, color: T.inkSoft }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cor || T.green900, fontFamily: "'IBM Plex Mono', monospace" }}>{valor}</div>
                  </div>
                );
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      {card("Projetos em campo", ind.projetosEmCampo)}
                      {card("Projetos atrasados", ind.projetosAtrasados, ind.projetosAtrasados > 0 ? T.red : T.green700)}
                      {card("Custo total da carteira", fmtBRL(ind.custoTotalCarteira))}
                      {card("Não conformidades", ind.naoConformidades, ind.naoConformidades > 0 ? T.amber : T.green700)}
                      {card("Oportunidades (aguard. plano)", ind.oportunidadesAntecipacao, T.blue)}
                    </div>

                    {checkupCarregando && <div style={{ fontSize: 12.5, color: T.inkSoft, fontStyle: "italic", padding: "8px 0" }}>🧠 A Inteligência está lendo a base e avaliando cenários…</div>}

                    {checkup && checkup.erro && <div style={{ fontSize: 12.5, color: T.amber, background: T.amberBg, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>{checkup.erro}</div>}

                    {checkup && !checkup.erro && (
                      <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "14px 16px" }}>
                        {checkup.resumoExecutivo && <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5, marginBottom: 10 }}><b>📊 Leitura da operação:</b> {checkup.resumoExecutivo}</div>}
                        {Array.isArray(checkup.indicadoresChave) && checkup.indicadoresChave.length > 0 && (
                          <div style={{ marginBottom: 10 }}><b style={{ fontSize: 12.5 }}>Indicadores-chave:</b><ul style={{ margin: "4px 0", paddingLeft: 18, fontSize: 12 }}>{checkup.indicadoresChave.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                        )}
                        {Array.isArray(checkup.saudeProjetos) && checkup.saudeProjetos.length > 0 && (
                          <div style={{ marginBottom: 10 }}><b style={{ fontSize: 12.5 }}>Saúde dos projetos:</b>{checkup.saudeProjetos.map((p, i) => <div key={i} style={{ fontSize: 12, color: T.ink, padding: "2px 0" }}>• <b>{p.idgeo}</b> ({p.status}): {p.alerta}</div>)}</div>
                        )}
                        {Array.isArray(checkup.logistica) && checkup.logistica.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <b style={{ fontSize: 12.5, color: T.blue }}>🚚 Logística da alocação (lida do Motor):</b>
                            {checkup.logistica.map((l, i) => (
                              <div key={i} style={{ background: T.blueBg, borderRadius: 8, padding: "8px 12px", marginTop: 6, fontSize: 12 }}>
                                <div style={{ fontWeight: 700, color: T.green900 }}>{l.idgeo}</div>
                                <div style={{ color: T.ink, marginTop: 2 }}>{l.diagnostico}</div>
                                {l.acao && <div style={{ color: T.blue, marginTop: 3, fontWeight: 600 }}>→ {l.acao}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        {Array.isArray(checkup.realocacao) && checkup.realocacao.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <b style={{ fontSize: 12.5, color: T.green700 }}>♻️ Realocação de recursos liberados (avanço do RDO):</b>
                            {checkup.realocacao.map((r, i) => (
                              <div key={i} style={{ background: T.green100, borderRadius: 8, padding: "8px 12px", marginTop: 6, fontSize: 12 }}>
                                <div style={{ fontWeight: 700, color: T.green900 }}>{r.recurso} <span style={{ fontWeight: 400, color: T.inkSoft }}>· {r.idgeoOrigem} → {r.idgeoDestino}</span></div>
                                {r.quando && <div style={{ color: T.inkSoft, marginTop: 2 }}>quando: {r.quando}</div>}
                                {r.beneficio && <div style={{ color: T.green700, marginTop: 2, fontWeight: 600 }}>→ {r.beneficio}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        {Array.isArray(checkup.oportunidades) && checkup.oportunidades.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <b style={{ fontSize: 12.5, color: T.green700 }}>💡 Oportunidades (relocação / antecipação):</b>
                            {checkup.oportunidades.map((o, i) => (
                              <div key={i} style={{ background: o.tipo === "ampliacao_faturamento" ? T.blueBg : T.green100, borderRadius: 8, padding: "8px 12px", marginTop: 6, fontSize: 12 }}>
                                <div style={{ fontWeight: 700, color: T.green900 }}>{o.tipo === "ampliacao_faturamento" ? "📈" : "💰"} {o.titulo}</div>
                                <div style={{ color: T.ink, marginTop: 2 }}>{o.descricao}</div>
                                {Array.isArray(o.idgeosEnvolvidos) && o.idgeosEnvolvidos.length > 0 && <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 2 }}>IDGEOs: {o.idgeosEnvolvidos.join(", ")}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        {Array.isArray(checkup.alertas) && checkup.alertas.length > 0 && (
                          <div style={{ marginTop: 8 }}><b style={{ fontSize: 12.5, color: T.amber }}>⚠ Alertas:</b><ul style={{ margin: "4px 0", paddingLeft: 18, fontSize: 12, color: T.ink }}>{checkup.alertas.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ===== HISTÓRICO DE LEITURAS DA IA (versões + PDFs) ===== */}
              {(() => {
                const hist = Array.isArray(data.historicoInteligencia) ? data.historicoInteligencia : [];
                if (hist.length === 0) return null;
                return (
                  <div style={{ marginTop: 18, border: `1px solid ${T.line}`, borderRadius: 14, background: "#fff", overflow: "hidden" }}>
                    <div style={{ background: T.paper, padding: "12px 18px", borderBottom: `1px solid ${T.line}` }}>
                      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 15, fontWeight: 700, color: T.green900 }}>🗂 Histórico de leituras e decisões</div>
                      <div style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 2 }}>Cada análise da IA fica registrada com seu cenário e PDF. {hist.length} leitura(s) guardada(s).</div>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {hist.map((h, i) => {
                        const d = new Date(h.em);
                        const dataFmt = d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                        const atual = i === 0;
                        const resumoCurto = (h.checkup && h.checkup.resumoExecutivo) ? h.checkup.resumoExecutivo.slice(0, 120) + (h.checkup.resumoExecutivo.length > 120 ? "…" : "") : "—";
                        return (
                          <div key={h.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < hist.length - 1 ? `1px solid ${T.line}` : "none", background: atual ? T.green100 : "#fff" }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900 }}>
                                {dataFmt} {atual && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff", background: T.green700, borderRadius: 99, padding: "1px 7px", marginLeft: 6 }}>ATUAL</span>}
                              </div>
                              <div style={{ fontSize: 11, color: T.inkSoft, marginTop: 1 }}>por {h.por}</div>
                              <div style={{ fontSize: 11, color: T.ink, marginTop: 3, lineHeight: 1.4 }}>{resumoCurto}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              {!atual && <Btn small kind="ghost" onClick={() => { setCheckup(h.checkup); setCheckupEm(h.em); }}>Ver em tela</Btn>}
                              <Btn small kind="ghost" onClick={() => baixarRelatorioInteligencia(h.checkup, h.em)}>📄 PDF</Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ===== CHAT INTERATIVO: pergunte à IA sobre a operação ===== */}
              {(() => {
                const podeExecutar = ehMaster || podeEditarDominio(user, "ia_chat");
                const sugestoes = [
                  "Qual projeto tem o maior risco de atraso agora?",
                  "Onde há conflito de equipe ou veículo?",
                  "Que recursos serão liberados nas próximas semanas?",
                  "Como reduzir o custo logístico de Santos (SP26002)?",
                ];
                return (
                  <div style={{ marginTop: 18, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
                    <div style={{ background: T.green900, color: "#fff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 16, fontWeight: 700 }}>💬 Pergunte à Inteligência</div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>{podeExecutar ? "Você pode pedir alterações (confirmadas antes de aplicar)" : "Modo consulta (sem execução de comandos)"}</div>
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      {/* histórico */}
                      {chatMsgs.length === 0 ? (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12.5, color: T.inkSoft, marginBottom: 10 }}>Converse sobre equipes, prazos, equipamentos, logística e custos. Comece com uma pergunta:</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {sugestoes.map((s, i) => (
                              <button key={i} onClick={() => enviarChat(s)} style={{ border: `1px solid ${T.line}`, background: T.green100, color: T.green900, borderRadius: 99, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>{s}</button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, maxHeight: 420, overflowY: "auto" }}>
                          {chatMsgs.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                              <div style={{ maxWidth: "80%", background: m.role === "user" ? T.blueBg : T.paper, border: `1px solid ${T.line}`, borderRadius: 12, padding: "9px 13px", fontSize: 12.5, color: T.ink, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
                            </div>
                          ))}
                          {chatCarregando && <div style={{ fontSize: 12, color: T.inkSoft, fontStyle: "italic" }}>Pensando…</div>}
                        </div>
                      )}

                      {/* proposta de ação aguardando confirmação */}
                      {chatProposta && (
                        <div style={{ background: T.amberBg, border: `1px solid ${T.amber}`, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.green900, marginBottom: 4 }}>⚙ A IA propõe uma alteração</div>
                          <div style={{ fontSize: 12.5, color: T.ink, marginBottom: 10 }}>{chatProposta.descricao || chatProposta.tipo}</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn small kind="primary" onClick={confirmarAcaoIA}>✓ Confirmar e aplicar</Btn>
                            <Btn small kind="ghost" onClick={() => setChatProposta(null)}>Descartar</Btn>
                          </div>
                        </div>
                      )}

                      {/* entrada */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !chatCarregando) enviarChat(chatInput); }}
                          placeholder="Pergunte algo sobre a operação…"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <Btn kind="primary" disabled={chatCarregando || !chatInput.trim()} onClick={() => enviarChat(chatInput)}>Enviar</Btn>
                        {chatMsgs.length > 0 && <Btn kind="ghost" onClick={() => { setChatMsgs([]); setChatProposta(null); }}>Limpar</Btn>}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </>
          );
        })()}

        {/* Motor de Alocação */}
        {/* Documentos obrigatórios por cliente/contrato */}
        {/* Máquinas de Sondagem */}
        {tab === "maq" && maquinas.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhuma máquina cadastrada</div>
            {podeEditarMaq ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                {perfil === "master" && <Btn kind="primary" onClick={() => setModal({ tipo: "importMaq" })}>📋 Importar da planilha</Btn>}
                <Btn onClick={() => setModal({ tipo: "novaMaq" })}>+ Cadastrar manualmente</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            ) : (
              <p style={{ fontSize: 13.5, color: T.inkSoft }}>O cadastro de máquinas é realizado pelos perfis Master e Administrativo.</p>
            )}
          </div>
        )}
        {tab === "maq" && maquinas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Código</th><th style={th}>Máquina</th><th style={th}>Plataforma</th><th style={th}>Tipos & alta res.</th>
                <th style={{ ...th, textAlign: "right" }}>Prof. DP</th><th style={th}>Especificações</th>
                <th style={th}>Situação</th><th style={th}>Revisão (horímetro)</th>
                {podeEditarMaq && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaMaq.map((m) => {
                  const ms = revisaoStatus(m);
                  const sit = situacaoMaq(m);
                  return (
                    <React.Fragment key={m.cod}>
                    <tr>
                      <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {m.cod}
                        <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, color: T.inkSoft }}>⏱ {fmtNum(m.horimetro)} h{m.ultRevisao !== "" && m.ultRevisao != null ? ` · últ. rev. ${fmtNum(m.ultRevisao)} h` : ""}</div>
                        {m.veiculo && (
                          <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, color: frota.some((v) => v.placa === m.veiculo) ? T.inkSoft : T.amber }}
                            title={frota.some((v) => v.placa === m.veiculo) ? "Vinculado à frota" : "Placa não cadastrada na frota"}>
                            🚛 {m.veiculo} {frota.some((v) => v.placa === m.veiculo) ? "✓" : "⚠"}
                          </div>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.marca || "—"}</div>
                        <div style={{ fontSize: 11.5, color: T.inkSoft }}>{m.modelo}</div>
                      </td>
                      <td style={td}>{m.plataforma || "—"}</td>
                      <td style={td}>
                        {m.tipos?.length
                          ? <div style={{ fontSize: 12.5 }}>{m.tipos.map((t) => TIPOS_SOND.find((x) => x.id === t)?.label).join(" · ")}</div>
                          : <Badge text="Definir tipos" c={T.amber} bg={T.amberBg} />}
                        {m.altaRes?.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 700, color: T.green700 }}>{m.altaRes.join(" / ")}</div>}
                      </td>
                      <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{m.profMaxDP !== "" && m.profMaxDP != null ? `${m.profMaxDP} m` : "—"}</td>
                      <td style={{ ...td, fontSize: 10.5, color: T.inkSoft, lineHeight: 1.5 }}>
                        <div>⚖ {fmtNum(m.peso)} kg{m.comprimento ? ` · 📐 ${m.comprimento}×${m.largura}×${m.altAberta} m` : ""}</div>
                        <div>Retração {fmtNum(m.retracao)} · DF {fmtNum(m.downForce)} · Guincho {fmtNum(m.guincho)} kgf</div>
                        <div>Torque {fmtNum(m.torqueHollow)} Nm{m.consumo ? ` · ${fmtNum(m.consumo)} L/h` : ""}</div>
                      </td>
                      <td style={td}><Badge text={sit.tag} c={sit.c} bg={sit.bg} /></td>
                      <td style={td}><Badge text={ms.tag} c={ms.c} bg={ms.bg} /></td>
                      {podeEditarMaq && (
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          <Btn small onClick={() => setModal({ tipo: "editarMaq", maq: m })}>Editar</Btn>{" "}
                          {confirma === "maq:" + m.cod
                            ? <Btn small kind="danger" onClick={() => excluirMaq(m.cod)}>Confirmar?</Btn>
                            : <Btn small kind="danger" onClick={() => setConfirma("maq:" + m.cod)}>Excluir</Btn>}
                        </td>
                      )}
                    </tr>
                    <tr key={m.cod + "-cal"}>
                      <td colSpan={podeEditarMaq ? 9 : 8} style={{ padding: "0 12px 10px", borderBottom: `2px solid ${T.paper}` }}>
                        <CalendarioRecurso tipo="maquina" idRec={m.cod} nomeRec={`${m.cod} · ${m.marca} ${m.modelo}`} travas={travas} taps={taps} podeEditar={podeEditarMaq} ehGestorPlanejamento={ehGestorPlanejamento} onSalvar={salvarTrava} onExcluir={excluirTrava} accent="#8E44AD" />
                      </td>
                    </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaMaq.length} máquina(s) · Situação combina status + localização · revisão controlada por horímetro com alerta ⚠ a 50 h da próxima revisão · máquinas em manutenção/inativas ficam fora das alocações do Motor
            </div>
          </div>
        )}

        {/* Frota */}
        {tab === "frota" && frota.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum veículo cadastrado</div>
            {podeEditarMaq ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                {perfil === "master" && <Btn kind="primary" onClick={() => setModal({ tipo: "importVeic" })}>📋 Importar da planilha</Btn>}
                <Btn onClick={() => setModal({ tipo: "novoVeic" })}>+ Cadastrar manualmente</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            ) : <p style={{ fontSize: 13.5, color: T.inkSoft }}>O cadastro da frota é realizado pelos perfis Master e Administrativo.</p>}
          </div>
        )}
        {tab === "frota" && frota.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Placa</th><th style={th}>Veículo</th><th style={th}>Função</th><th style={th}>Capacidade</th><th style={th}>Implemento</th><th style={th}>CNH</th>
                <th style={th}>Revisão (km)</th><th style={th}>Situação (GPS)</th>
                {podeEditarMaq && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaFrota.map((v) => {
                  const rs = revKmStatus(v);
                  const sit = situacaoVeic(v);
                  return (
                    <React.Fragment key={v.placa}>
                    <tr>
                      <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {v.placa}
                        <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 400, color: T.inkSoft }}>🛣 {fmtNum(v.kmAtual)} km</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{v.veiculo || "—"}</div>
                        <div style={{ fontSize: 11, color: T.inkSoft }}>{v.tipo}{v.anoFab ? ` · ${v.anoFab}` : ""}</div>
                      </td>
                      <td style={{ ...td, fontSize: 12.5 }}>{v.funcao || <span style={{ color: T.inkSoft }}>—</span>}</td>
                      <td style={td}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{v.capPessoas}p · {fmtNum(v.capCargaKg)} kg</span></td>
                      <td style={td}>
                        {v.implemento
                          ? <><b style={{ fontSize: 12.5 }}>{v.implemento}</b>{v.capImplemento !== "" && v.capImplemento != null && <div style={{ fontSize: 10.5, color: T.inkSoft }}>{fmtNum(v.capImplemento)} kg</div>}</>
                          : <span style={{ color: T.inkSoft }}>—</span>}
                      </td>
                      <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{v.cnh}</td>
                      <td style={td}><Badge text={rs.tag} c={rs.c} bg={rs.bg} /></td>
                      <td style={td}>
                        <Badge text={sit.tag} c={sit.c} bg={sit.bg} />
                        {v.dataLocal && <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 3 }}>📡 GPS · {fmtData(v.dataLocal)}</div>}
                      </td>
                      {podeEditarMaq && (
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          <Btn small onClick={() => setModal({ tipo: "editarVeic", veic: v })}>Editar</Btn>{" "}
                          {confirma === "veic:" + v.placa
                            ? <Btn small kind="danger" onClick={() => excluirVeic(v.placa)}>Confirmar?</Btn>
                            : <Btn small kind="danger" onClick={() => setConfirma("veic:" + v.placa)}>Excluir</Btn>}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td colSpan={podeEditarMaq ? 9 : 8} style={{ padding: "0 12px 10px", borderBottom: `2px solid ${T.paper}` }}>
                        <CalendarioRecurso tipo="frota" idRec={v.placa} nomeRec={`${v.placa} · ${v.veiculo}`} travas={travas} taps={taps} podeEditar={podeEditarMaq} ehGestorPlanejamento={ehGestorPlanejamento} onSalvar={salvarTrava} onExcluir={excluirTrava} accent="#2980B9" />
                      </td>
                    </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaFrota.length} veículo(s) · localização via rastreador GPS (alimentação automática na fase backend) · função, capacidades, implemento e CNH entram nos critérios do Motor de Alocação
            </div>
          </div>
        )}

        {/* Equipamentos */}
        {tab === "equip" && equipamentos.length === 0 && (
          <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Nenhum equipamento cadastrado</div>
            {podeEditarMaq ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
                {perfil === "master" && <Btn kind="primary" onClick={() => setModal({ tipo: "importEquip" })}>📋 Importar da planilha</Btn>}
                <Btn onClick={() => setModal({ tipo: "novoEquip" })}>+ Cadastrar manualmente</Btn>
                {colaboradores.length === 0 && <Btn onClick={() => persist({ ...data, ...EXEMPLO })}>Carregar exemplo</Btn>}
              </div>
            ) : <p style={{ fontSize: 13.5, color: T.inkSoft }}>O cadastro de equipamentos é realizado pelos perfis Master e Administrativo.</p>}
          </div>
        )}
        {tab === "equip" && equipamentos.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Código</th><th style={th}>Equipamento</th><th style={th}>Localização</th><th style={th}>Calibração</th><th style={th}>Estado</th>
                {podeEditarMaq && <th style={th}></th>}
              </tr></thead>
              <tbody>
                {listaEquip.map((e) => {
                  const cs = cnhStatus(e.valCalib);
                  const quem = e.comQuem ? colaboradores.find((c) => c.mat === e.comQuem) : null;
                  return (
                    <React.Fragment key={e.cod}>
                    <tr>
                      <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{e.cod}</td>
                      <td style={td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.tipo}</div>
                        <div style={{ fontSize: 11, color: T.inkSoft }}>{e.modelo}{e.specs ? ` · ${e.specs}` : ""}</div>
                      </td>
                      <td style={td}>
                        {e.local === "Em campo"
                          ? <span style={{ fontSize: 12.5 }}>🧭 Em campo{quem ? <> · <b>{quem.nome}</b> <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>({e.comQuem})</span></> : e.comQuem ? ` · ${e.comQuem}` : ""}</span>
                          : <span style={{ fontSize: 12.5 }}>📦 Almoxarifado</span>}
                      </td>
                      <td style={td}>
                        {cs && <Badge text={cs.tag === "Válida" ? `Válida até ${fmtData(e.valCalib)}` : cs.tag} c={cs.c} bg={cs.bg} />}
                        <div style={{ fontSize: 10.5, color: T.inkSoft, marginTop: 3 }}>
                          {e.ultCalib ? `última ${fmtData(e.ultCalib)}` : "última —"}{e.periodoCalib ? ` · período ${e.periodoCalib} m` : ""}
                        </div>
                      </td>
                      <td style={td}><StatusBadge s={e.estado} /></td>
                      {podeEditarMaq && (
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          <Btn small onClick={() => setModal({ tipo: "editarEquip", eq: e })}>Editar</Btn>{" "}
                          {confirma === "eqp:" + e.cod
                            ? <Btn small kind="danger" onClick={() => excluirEquip(e.cod)}>Confirmar?</Btn>
                            : <Btn small kind="danger" onClick={() => setConfirma("eqp:" + e.cod)}>Excluir</Btn>}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td colSpan={podeEditarMaq ? 6 : 5} style={{ padding: "0 12px 10px", borderBottom: `2px solid ${T.paper}` }}>
                        <CalendarioRecurso tipo="equipamento" idRec={e.cod} nomeRec={`${e.cod} · ${e.tipo} ${e.modelo}`} travas={travas} taps={taps} podeEditar={podeEditarMaq} ehGestorPlanejamento={ehGestorPlanejamento} onSalvar={salvarTrava} onExcluir={excluirTrava} accent="#16A085" />
                      </td>
                    </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
              {listaEquip.length} equipamento(s) · o Motor só aloca equipamentos com calibração válida durante toda a janela da campanha
            </div>
          </div>
        )}

        {tab === "equip" && (
          <div style={{ marginTop: 18, background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.green900, marginBottom: 4 }}>🧩 Matriz atividade → equipamento</div>
            <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14, maxWidth: 720 }}>
              Define qual <b>tipo de equipamento</b> cada atividade exige. O Motor usa esta matriz para selecionar o item certo e travá-lo na agenda. Comece vazia: cadastre as atividades que precisam de equipamento, informando palavras-chave que casem com o campo "tipo" do equipamento (ex.: <i>multiparâmetro</i>, <i>pid</i>, <i>nível</i>). Atividades sem entrada aqui não recebem equipamento do Motor.
            </div>
            {podeEditarMaq ? (
              <EquipMapaEditor atividades={ATIVIDADES} mapa={equipPorAtividade || {}} onSalvar={salvarEquipMapa} />
            ) : (
              Object.keys(equipPorAtividade || {}).length === 0
                ? <p style={{ fontSize: 12.5, color: T.inkSoft, margin: 0 }}>Nenhuma atividade mapeada ainda. O cadastro é feito pelos perfis Master e Administrativo.</p>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(equipPorAtividade).map(([aid, ks]) => (
                      <div key={aid} style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                        <b>{(ATIVIDADES.find((x) => x.id === aid) || {}).short || aid}</b> → {(ks || []).join(", ")}
                      </div>
                    ))}
                  </div>
            )}
          </div>
        )}

        {/* Cobertura de Funções Críticas (substitutos) */}
        {/* Localização de pessoas e veículos */}
        {tab === "loc" && (
          <>
            <div style={{ background: T.green100, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: T.green900, marginBottom: 14 }}>
              📍 Esta é a visão de <b>saída</b> da localização (consolidação e mapa). O registro das posições é feito nas abas de origem: <b>👷 Equipe</b> (ponto eletrônico das pessoas) e <b>🚗 Frota</b> (GPS dos veículos).
            </div>
            {(colaboradores.length === 0 && frota.length === 0) ? (
              <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 18, color: T.green900, marginBottom: 6 }}>Cadastre colaboradores e frota primeiro</div>
                <p style={{ fontSize: 13.5, color: T.inkSoft }}>A localização é vinculada às matrículas e placas cadastradas.</p>
              </div>
            ) : (
              <>
                {/* Cartões-resumo */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 }}>
                  {[
                    ["👷 Pessoas com posição", `${locStats.pComPos} / ${locStats.pAtivos}`, locStats.pComPos < locStats.pAtivos ? T.amber : T.green700],
                    ["🚗 Veículos com posição", `${locStats.vComPos} / ${locStats.vTotal}`, locStats.vComPos < locStats.vTotal ? T.amber : T.green700],
                    ["⏳ Posições desatualizadas (>2d)", `${locStats.pStale + locStats.vStale}`, (locStats.pStale + locStats.vStale) > 0 ? T.red : T.green700],
                    ["🗺 Cidades sem geocodificação", `${locStats.semGeo}`, locStats.semGeo > 0 ? T.amber : T.green700],
                  ].map(([lbl, val, cor]) => (
                    <div key={lbl} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: T.inkSoft }}>{lbl}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: cor }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* ===== Equipes em campo (resumo operacional) ===== */}
                {(() => {
                  const osCampo = Object.values(ordens || {}).filter((o) => o.status === "Aprovada" && taps.find((t) => t.idgeo === o.idgeo && t.statusTap === "Em campo"));
                  if (osCampo.length === 0) return null;
                  const infoColab = (mat) => colaboradores.find((c) => c.mat === mat) || {};
                  const papelDe = (e) => (e.papel || "").toLowerCase();
                  const diasEntre = (ini, fim) => { if (!ini || !fim) return null; const a = new Date(ini), b = new Date(fim); return Math.max(0, Math.round((b - a) / 86400000)); };
                  const hoje = hojeISO();
                  return (
                    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto", marginBottom: 14 }}>
                      <div style={{ padding: "10px 16px", fontSize: 14, fontWeight: 700, color: T.green900, borderBottom: `1px solid ${T.line}`, fontFamily: "'IBM Plex Serif', serif" }}>🚧 Equipes em campo ({osCampo.length})</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead><tr>
                          <th style={th}>Projeto</th><th style={th}>Localização</th>
                          <th style={th}>Líder</th><th style={th}>Telefone</th><th style={th}>Sublíder</th><th style={th}>Téc. Seg.</th><th style={th}>Auxiliares</th>
                          <th style={th}>Decorrido</th><th style={th}>Restante</th>
                          <th style={th}>Máquinas</th><th style={th}>Veículo</th><th style={th}>Equip.</th>
                        </tr></thead>
                        <tbody>
                          {osCampo.map((o) => {
                            const tap = taps.find((t) => t.idgeo === o.idgeo) || {};
                            const equipe = (o.equipe || []).filter((e) => !e.vazio);
                            /* papéis */
                            const lider = equipe.find((e) => /encarregad|l[ií]der|respons/.test(papelDe(e))) || equipe.find((e) => /sondador|t[eé]cnic/.test(papelDe(e))) || equipe[0];
                            const sublider = equipe.find((e) => e !== lider && /sondador|operador|t[eé]cnic/.test(papelDe(e)));
                            const tecSeg = equipe.find((e) => /seguran|sms|t[eé]c.*seg/.test(papelDe(e)) || /seguran/.test((infoColab(e.mat).cargo || "").toLowerCase()));
                            const auxiliares = equipe.filter((e) => e !== lider && e !== sublider && e !== tecSeg);
                            /* tempos */
                            const total = diasEntre(o.inicio, o.fim);
                            const decorrido = o.inicio ? diasEntre(o.inicio, hoje > (o.fim || hoje) ? o.fim : hoje) : null;
                            const restante = (total != null && decorrido != null) ? Math.max(0, total - decorrido) : null;
                            const nome = (e) => e ? e.nome : "—";
                            const fone = (e) => e ? (infoColab(e.mat).telefone || infoColab(e.mat).fone || "—") : "—";
                            return (
                              <tr key={o.idgeo}>
                                <td style={td}><div style={{ fontWeight: 600 }}>{tap.projeto || o.idgeo}</div><div style={{ fontSize: 10.5, color: T.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{o.idgeo}</div></td>
                                <td style={td}>📍 {o.local || tap.cidade || "—"}</td>
                                <td style={{ ...td, fontWeight: 600 }}>{nome(lider)}</td>
                                <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{fone(lider)}</td>
                                <td style={td}>{nome(sublider)}</td>
                                <td style={td}>{nome(tecSeg)}</td>
                                <td style={td}>{auxiliares.length ? auxiliares.map((a) => a.nome.split(" ")[0]).join(", ") : "—"}</td>
                                <td style={{ ...td, textAlign: "center" }}>{decorrido != null ? `${decorrido}d` : "—"}</td>
                                <td style={{ ...td, textAlign: "center", color: restante === 0 ? T.red : T.green700, fontWeight: 600 }}>{restante != null ? `${restante}d` : "—"}</td>
                                <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{o.maquina ? o.maquina.cod : "—"}</td>
                                <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{o.veiculo ? o.veiculo.placa : "—"}</td>
                                <td style={{ ...td, fontSize: 11 }}>{(o.equipamentos && o.equipamentos.length) ? o.equipamentos.join(", ") : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{ padding: "8px 16px", fontSize: 11, color: T.inkSoft }}>Resumo gerado a partir das Ordens de Serviço aprovadas e em campo · tempos calculados sobre as datas de início/fim previstas</div>
                    </div>
                  );
                })()}

                {/* Mapa logístico (Leaflet + OpenStreetMap) */}
                {gruposLoc.filter((g) => g.coords).length === 0 ? (
                  <div style={{ background: "#fff", border: `1px dashed ${T.line}`, borderRadius: 10, padding: "32px 24px", textAlign: "center", marginBottom: 14, fontSize: 13.5, color: T.inkSoft }}>
                    Nenhuma posição geocodificável ainda — importe as posições diárias (botões acima) usando cidades conhecidas ou coordenadas.
                  </div>
                ) : (
                  <LeafletMapa grupos={gruposLoc} matriz={MATRIZ_GEO} />
                )}

                {/* Quadro: quem está onde */}
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.line}`, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>
                      <th style={th}>Cidade</th><th style={{ ...th, textAlign: "right" }}>Dist. matriz</th><th style={th}>Pessoas</th><th style={th}>Veículos</th><th style={th}>Atualização</th>
                    </tr></thead>
                    <tbody>
                      {gruposLoc.length === 0 && (
                        <tr><td style={{ ...td, color: T.inkSoft }} colSpan={5}>Nenhuma posição registrada ainda — importe a exportação diária do ponto eletrônico e do rastreador GPS.</td></tr>
                      )}
                      {gruposLoc.map((g) => {
                        const datas = [...g.pessoas, ...g.veics].map((x) => x.data).filter(Boolean).sort();
                        const ultima = datas[datas.length - 1];
                        const antiga = (diasDesde(ultima) ?? 99) > 2;
                        return (
                          <tr key={g.key}>
                            <td style={td}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>📍 {g.cidade}</div>
                              {!g.coords && <div style={{ fontSize: 10.5, color: T.amber }}>sem geocodificação — fora do mapa</div>}
                            </td>
                            <td style={{ ...td, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>{g.dist != null ? `~${fmtNum(g.dist)} km` : "—"}</td>
                            <td style={td}>
                              {g.pessoas.length === 0 ? <span style={{ color: T.inkSoft }}>—</span> : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {g.pessoas.map((p) => {
                                    const stale = (diasDesde(p.data) ?? 99) > 2;
                                    return <span key={p.mat} title={`${p.mat} · ${p.cargo} · ${p.fonte || "—"} · ${p.data ? fmtData(p.data) : "sem data"}`}
                                      style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 99, background: stale ? T.amberBg : T.green100, color: stale ? T.amber : T.green700, fontWeight: 600 }}>
                                      {p.nome}{stale ? " ⏳" : ""}
                                    </span>;
                                  })}
                                </div>
                              )}
                            </td>
                            <td style={td}>
                              {g.veics.length === 0 ? <span style={{ color: T.inkSoft }}>—</span> : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {g.veics.map((v) => {
                                    const stale = (diasDesde(v.data) ?? 99) > 2;
                                    return <span key={v.placa} title={`${v.nomeV || ""} · GPS · ${v.data ? fmtData(v.data) : "sem data"}`}
                                      style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 99, background: stale ? T.amberBg : T.blueBg, color: stale ? T.amber : T.blue, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                                      🚛 {v.placa}{stale ? " ⏳" : ""}
                                    </span>;
                                  })}
                                </div>
                              )}
                            </td>
                            <td style={{ ...td, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                              {ultima ? <span style={{ color: antiga ? T.amber : T.inkSoft }}>{fmtData(ultima)}{antiga ? " ⏳" : ""}</span> : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 14px", fontSize: 12, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>
                    ⏳ = posição com mais de 2 dias · distâncias rodoviárias estimadas a partir da matriz Curitiba · 📡 na fase backend, ingestão automática diária do ponto eletrônico e do rastreador · estas posições e distâncias são critérios de rota e hierarquização do Motor de Alocação
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Rodapé global */}
      <footer style={{ textAlign: "center", padding: "16px 24px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}`, background: T.paper }}>
        Desenvolvido por <b>Everton Maurício Carvalho</b> · GeoópS — Sistema de Gestão Operacional Inteligente · GEOAMBIENTE S/A
      </footer>

      {/* Modais */}
      {modal?.tipo === "editar" && podeEditarColab && <ColabForm inicial={modal.colab} existentes={colaboradores} dominios={dominios} podeVerSocio={podeVerSocio} onClose={() => setModal(null)} onSave={salvarColab} onAddDominio={(k, v) => persist({ ...data, dominios: { ...dominios, [k]: [...dominios[k], v] } })} />}
      {modal?.tipo === "import" && podeEditarColab && <ImportModal existentes={colaboradores} onClose={() => setModal(null)} onImport={(novos) => { persist({ ...data, colaboradores: [...colaboradores, ...novos] }); setModal(null); }} />}
      {modal?.tipo === "importMatriz" && perfil === "master" && <AptMatrizImportModal colaboradores={colaboradores} onClose={() => setModal(null)} onImport={importarMatriz} />}
      {modal?.tipo === "smsCell" && podeEditarSms && <SmsCellEditor colab={modal.colab} item={modal.item} rec={(sms[modal.colab.mat] || {})[modal.item.id]} onClose={() => setModal(null)} onSave={(rec) => salvarSmsCell(modal.colab.mat, modal.item.id, rec)} />}
      {modal?.tipo === "smsFicha" && <SmsFicha colab={modal.colab} registro={sms[modal.colab.mat]} itens={itensSms} podeEditar={podeEditarSms && !modal.readonly} onClose={() => setModal(null)} onSave={(m) => salvarSmsFicha(modal.colab.mat, m)} />}
      {modal?.tipo === "importSms" && perfil === "master" && <SmsImportModal colaboradores={colaboradores} itens={itensSms} onClose={() => setModal(null)} onImport={importarSms} />}
      {modal?.tipo === "smsExtra" && podeEditarSms && <SmsExtraModal onClose={() => setModal(null)} onAdd={addSmsExtra} />}
      {modal?.tipo === "novaMaq" && podeEditarMaq && <MaqForm existentes={maquinas} onClose={() => setModal(null)} onSave={salvarMaq} />}
      {modal?.tipo === "editarMaq" && podeEditarMaq && <MaqForm inicial={modal.maq} existentes={maquinas} onClose={() => setModal(null)} onSave={salvarMaq} />}
      {modal?.tipo === "importMaq" && perfil === "master" && <MaqImportModal existentes={maquinas} onClose={() => setModal(null)} onImport={(novas) => { persist({ ...data, maquinas: [...maquinas, ...novas] }); setModal(null); }} />}
      {modal?.tipo === "novoVeic" && podeEditarMaq && <VeicForm existentes={frota} onClose={() => setModal(null)} onSave={salvarVeic} />}
      {modal?.tipo === "editarVeic" && podeEditarMaq && <VeicForm inicial={modal.veic} existentes={frota} onClose={() => setModal(null)} onSave={salvarVeic} />}
      {modal?.tipo === "importVeic" && perfil === "master" && <VeicImportModal existentes={frota} onClose={() => setModal(null)} onImport={(novos) => { persist({ ...data, frota: [...frota, ...novos] }); setModal(null); }} />}
      {modal?.tipo === "novoEquip" && podeEditarMaq && <EquipForm existentes={equipamentos} tipos={dominios.tiposEquip || TIPOS_EQUIP_BASE} colaboradores={colaboradores} onClose={() => setModal(null)} onSave={salvarEquip} onAddTipo={addTipoEquip} />}
      {modal?.tipo === "editarEquip" && podeEditarMaq && <EquipForm inicial={modal.eq} existentes={equipamentos} tipos={dominios.tiposEquip || TIPOS_EQUIP_BASE} colaboradores={colaboradores} onClose={() => setModal(null)} onSave={salvarEquip} onAddTipo={addTipoEquip} />}
      {modal?.tipo === "importEquip" && perfil === "master" && <EquipImportModal existentes={equipamentos} colaboradores={colaboradores} onClose={() => setModal(null)} onImport={(novos) => { persist({ ...data, equipamentos: [...equipamentos, ...novos] }); setModal(null); }} />}
      {modal?.tipo === "cenarios" && <CenariosModal cenarios={rodarCenarios(modal.cenariosIdgeo)} onClose={() => setModal(null)} onEscolher={(c) => { escolherCenario(modal.cenariosIdgeo, c); setModal(null); }} />}
      {modal?.tipo === "progManual" && ehGestorPlanejamento && <ProgManualForm clientes={clientes} onClose={() => setModal(null)} onCriar={criarProgManual} />}
      {modal?.tipo === "importPrecos" && (ehMaster || podeEditarDominio(user, "custos")) && <PrecosImportModal existentes={precosUnitarios} onClose={() => setModal(null)} onImport={(itens) => { salvarPrecos(itens); setModal(null); }} />}
      {modal?.tipo === "novoCli" && podeEditarCli && <ClienteForm existentes={clientes} segmentos={dominios.segmentos || SEGMENTOS_BASE} onClose={() => setModal(null)} onSave={salvarCliente} onAddSegmento={addSegmento} onNotificar={notificarProjeto} />}
      {modal?.tipo === "editarCli" && podeEditarCli && <ClienteForm inicial={modal.cli} existentes={clientes} segmentos={dominios.segmentos || SEGMENTOS_BASE} onClose={() => setModal(null)} onSave={salvarCliente} onAddSegmento={addSegmento} onNotificar={notificarProjeto} />}
      {modal?.tipo === "importCli" && perfil === "master" && <ClienteImportModal existentes={clientes} segmentos={dominios.segmentos || SEGMENTOS_BASE} onClose={() => setModal(null)} onImport={(novos) => { persist({ ...data, clientes: [...clientes, ...novos] }); setModal(null); }} />}
            {modal?.tipo === "novoContrato" && perfil === "master" && <ContratoForm existentes={contratos} clientes={clientes.filter((c) => c.status === "Ativo")} podeCusto={podeVerValorContrato} onClose={() => setModal(null)} onSave={salvarContrato} />}
      {modal?.tipo === "editarContrato" && perfil === "master" && <ContratoForm inicial={modal.ct} existentes={contratos} clientes={clientes} podeCusto={podeVerValorContrato} onClose={() => setModal(null)} onSave={salvarContrato} />}
      {modal?.tipo === "importCt" && perfil === "master" && <CtImportModal existentes={contratos} clientes={clientes} onClose={() => setModal(null)} onImport={importarCt} />}
      {modal?.tipo === "importDocs" && perfil === "master" && <DocsImportModal rows={docsRows} onClose={() => setModal(null)} onImport={importarDocs} />}
      {modal?.tipo === "docCell" && podeEditarSms && <SmsCellEditor colab={{ nome: `${modal.row.clientes.join(" · ")} · CNPJ ${modal.row.cnpj}` }} item={modal.item} rec={(docsCnpj[modal.row.key] || {})[modal.item.id]} onClose={() => setModal(null)} onSave={(rec) => salvarDocCell(modal.row.key, modal.item.id, rec)} />}
      {modal?.tipo === "asoCell" && podeEditarSms && <SmsCellEditor colab={{ nome: `${modal.colab.nome} — ASO` }} item={{ label: `${modal.contrato.contrato} · ${modal.contrato.cliente}` }} rec={(asos[modal.colab.mat] || {})[modal.contrato.contrato]} onClose={() => setModal(null)} onSave={(rec) => salvarAsoCell(modal.colab.mat, modal.contrato.contrato, rec)} />}
      {modal?.tipo === "cond" && (ehMaster || podeEditarDominio(user, "cond") || podeEditarDominio(user, "ct")) && <CondForm ct={modal.ct} inicial={condicionantes[modal.ct.contrato]} onClose={() => setModal(null)} onSave={(obj) => salvarCond(modal.ct.contrato, obj)} />}
      {modal?.tipo === "importCond" && perfil === "master" && <CondImportModal contratos={contratos} onClose={() => setModal(null)} onImport={(rows) => { const next = { ...condicionantes }; rows.forEach((r) => { next[r.contrato] = { ...(next[r.contrato] || {}), ...r.cond }; }); persist({ ...data, condicionantes: next }); setModal(null); }} />}
      {modal?.tipo === "apontamento" && (ehMaster || podeEditarDominio(user, "prog") || ehGerente) && <ApontamentoForm idgeo={modal.idgeo} os={modal.os} inicial={modal.inicial} dataMin={modal.os?.inicio} onClose={() => setModal(null)} onSave={(ap) => salvarApontamento(modal.idgeo, ap)} />}
      {modal?.tipo === "kpis" && <PainelKPIsProjeto idgeo={modal.idgeo} os={modal.os} apts={(apontamentos || {})[modal.idgeo]} custos={custos} colaboradores={colaboradores} produtividade={produtividade} tap={modal.tap} onClose={() => setModal(null)} />}
      {typeof confirma === "string" && confirma.startsWith("concluir:") && (() => {
        const idgeo = confirma.slice(9);
        const tap = taps.find((t) => t.idgeo === idgeo);
        return (
          <Modal title="🏁 Projeto chegou a 100%" onClose={() => setConfirma(null)}>
            <p style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>
              O apontamento indica que <b>{tap?.projeto || idgeo}</b> atingiu 100% do previsto. Deseja concluir o projeto agora?
            </p>
            <p style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>
              Ao concluir, a equipe, máquinas, veículos e equipamentos reservados são <b>liberados</b> e voltam a ficar disponíveis — a Inteligência passa a considerá-los para realocação em outros projetos.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <Btn onClick={() => setConfirma(null)}>Ainda não</Btn>
              <Btn kind="primary" onClick={() => concluirProjeto(idgeo)}>🏁 Concluir e liberar recursos</Btn>
            </div>
          </Modal>
        );
      })()}
      {modal?.tipo === "novaAutorizacao" && <AutorizacaoForm colaboradores={colaboradores} taps={taps} user={user} onClose={() => setModal(null)} onSave={criarAutorizacao} />}
      {modal?.tipo === "novoServico" && perfil === "master" && <ServicoForm existentes={ATIVIDADES} onClose={() => setModal(null)} onSave={(s) => { if (adicionarServico(s)) setModal(null); }} />}
      {modal?.tipo === "novaTap" && (perfil === "master" || podeEditarDominio(user, "tap")) && <NovaTapForm taps={taps} clientes={clientes} contratos={contratos} estruturaEmpresa={{ totalColaboradores: colaboradores.length, cargos: [...new Set(colaboradores.map((c) => c.cargo))], aptidoesDisponiveis: [...new Set(Object.values(aptidoes || {}).flatMap((a) => Object.keys(a.matriz || {})))], totalMaquinas: maquinas.length, tiposMaquinas: [...new Set(maquinas.map((m) => `${m.marca} ${m.modelo}`))], totalEquipamentos: equipamentos.length, tiposEquipamentos: [...new Set(equipamentos.map((e) => e.tipo))], totalVeiculos: frota.length }} onClose={() => setModal(null)} onCriar={criarTapManual} />}
      {modal?.tipo === "novoPlano" && (ehMaster || ehGerente || podeEditarDominio(user, "prog")) && <PlanoTrabalhoForm tap={modal.tap} inicial={modal.plano} onClose={() => setModal(null)} onSave={(plano) => salvarPlano(modal.tap.idgeo, plano)} />}
      {modal?.tipo === "tapDet" && <TapDetalhes tap={modal.tap} podeCusto={podeVerValorContrato} papelAssinatura={ehMaster ? "ambos" : (ehGerente ? "gerenteProj" : (podeEditarDominio(user, "prog") ? "gestorOp" : null))} onAssinar={assinarTap} onBaixarPDF={baixarPDFParecer} onClose={() => setModal(null)} />}
      {modal?.tipo === "os" && <ErroBoundary><OSView os={modal.os} podeCusto={podeCusto} jaAprovada={modal.os.status === "Aprovada"} aceites={modal.os.aceites} papelAceite={papelAceiteUser} onAceitar={(p) => aceitarOS(modal.os, p)} onClose={() => setModal(null)} /></ErroBoundary>}
      {modal?.tipo === "regra" && podeEditarApt && <RegraEditor atv={modal.atv} inicial={regrasEquipe[modal.atv.id]} cargosLista={(dominios && dominios.cargos) || CARGOS_BASE} onSalvar={salvarRegra} onReset={resetRegra} onClose={() => setModal(null)} />}
      {modal?.tipo === "prog" && ehGestorPlanejamento && <ProgEditor tap={modal.tap} inicial={programacoes[modal.tap.idgeo]} estimaDias={estimaDias} onSalvar={salvarProg} onExcluir={excluirProg} onClose={() => setModal(null)} />}
      {modal?.tipo === "exec" && programacoes[modal.tap.idgeo] && <PlanoExecutivo tap={modal.tap} prog={programacoes[modal.tap.idgeo]} podeEditar={ehGestorPlanejamento} onSalvar={salvarExecutivo} onClose={() => setModal(null)} />}
            {modal?.tipo === "importPosP" && podeEditarColab && <LocImportModal modo="pessoas" colaboradores={colaboradores} frota={frota} onClose={() => setModal(null)} onImport={importarPosP} />}
      {modal?.tipo === "importPosV" && podeEditarMaq && <LocImportModal modo="veiculos" colaboradores={colaboradores} frota={frota} onClose={() => setModal(null)} onImport={importarPosV} />}
      {modal?.tipo === "apt" && <AptEditor colab={modal.colab} apt={aptidoes[modal.colab.mat]} readonly={modal.readonly || !podeEditarApt} onClose={() => setModal(null)} onSave={(a) => { persist({ ...data, aptidoes: { ...aptidoes, [modal.colab.mat]: a } }); setModal(null); }} />}
    </div>
  );
}
