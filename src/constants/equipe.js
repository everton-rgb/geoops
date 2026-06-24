export const NIVEIS = [
  { id: "na", short: "0", label: "Insuficiente", desc: "não está apto a executar a atividade" },
  { id: "jr", short: "1", label: "Conhecimento básico", desc: "já fez uma vez ou viu como fazer e pode tentar repetir, mas não conhece a instrução e não recebeu treinamento" },
  { id: "pl", short: "2", label: "Conhecimento intermediário", desc: "já fez mais de uma vez, recebeu treinamento sobre a atividade, mas está defasado ou não faz parte de sua rotina" },
  { id: "sr", short: "3", label: "Conhecimento avançado", desc: "recebeu treinamento, faz rotineiramente a atividade e resolve a maioria das dificuldades em campo" },
  { id: "esp", short: "4", label: "Especialista", desc: "conhece a fundo o tema e é capaz de ser um multiplicador do conhecimento" },
];
export const NIVEL_BG = { na: "#EEF0ED", jr: "#E2EDF6", pl: "#7FA8CC", sr: "#1F5C8A", esp: "#0F2E4D" };
export const NIVEL_FG = { na: "#6B7470", jr: "#0F2E4D", pl: "#0F2E4D", sr: "#fff", esp: "#fff" };
export const NIVEL_ALIAS = {
  "nao apto": "na", "insuficiente": "na", "na": "na", "": "na", "0": "na",
  "junior": "jr", "jr": "jr", "1": "jr", "basico": "jr", "conhecimento basico": "jr",
  "pleno": "pl", "pl": "pl", "2": "pl", "intermediario": "pl", "conhecimento intermediario": "pl",
  "senior": "sr", "sr": "sr", "3": "sr", "avancado": "sr", "conhecimento avancado": "sr",
  "esp": "esp", "4": "esp", "especialista": "esp",
};
export const NIVEL_NUM = { na: 0, jr: 1, pl: 2, sr: 3, esp: 4 };
export const CARGOS_BASE = ["Auxiliar de Operações","Técnico de Operações","Técnico de Operações Sondagem","Operador de Sondagem","Encarregado de Operações","Supervisor de Operações","Supervisor de Campo","Coordenador de Operações de Campo","Gerente de Operações","Diretor de Operações","Auxiliar de Obras","Mestre de Obras","Motorista","Encarregado de Frotas","Técnico em Meio Ambiente","Técnico de Segurança do Trabalho","Auxiliar de Segurança do Trabalho","Coordenador de SMS","Monitor de Sistemas","Técnico de Planejamento","Assistente de Projetos","Analista de Projetos","Analista Técnico de Projetos","Coordenador de Projetos","Gerente de Projetos","Especialista Técnico Consultivo","Especialista Técnico de Operações","Gerente Técnico","Superintendente Técnico","Coordenador de Qualidade","Analista de Qualidade","Elaborador de Relatórios","Revisor Técnico","Analista de Modelagem Conceitual","Desenhista Projetista","Geólogo","Engenheiro","Químico","Consultor"];
export const STATUS_COLAB = ["Ativo","Férias","Afastado","Desligado"];
export const CNH_CATS = ["Não possui","A","B","AB","C","D","E"];
