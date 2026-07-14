# GeoópS · Registro de versões (changelog)

> A cada merge na `main`, a versão visível no sistema é incrementada e esta página
> ganha o relatório do que mudou. GeoópS e GeofieldS versionam juntos no mesmo deploy.
> O 📖 Guia do sistema (Esteira → Guia · arquivos em `public/guia/`) é o manual
> vivo — deve ser atualizado junto com o changelog sempre que fluxos/telas mudarem.

## GeoópS V1.1.25 · GeoópS Mobile V1.1 — 14/07/2026

**Motor de custos puros — Eficiência remodelada + Acompanhamento do custo Realizado em tempo real.**

- **Custos Unitários saiu do motor**: a matriz de preços compostos distorcia a análise (embutia HH,
  insumos e outros custos). O GeoópS agora trabalha só com **custos puros** e quem compõe é o
  próprio motor. Os dados ficam preservados para o futuro módulo de Orçamentação (preço de venda).
- **Eficiência com 6 sub-abas**: 📆 Parâmetros Complementares (R$/km, hospedagem, alimentação,
  dias úteis + custos por categoria: Serviços/Transporte/Aéreo/Uber/Licenças/Outros) ·
  **🧪 Itens de consumo** (novo — R$/unidade puros: análises, bentonita, tubos, combustível…) ·
  **🛠 Depreciação** (novo — depreciação + manutenção **R$/h POR ATIVO**, com R$/km próprio na
  frota) · **🧬 Composições** (novo — consumo por unidade de cada atividade, pré-carga 🟡 para
  revisão) · 📈 Metas · 🧩 Dimensionamento.
- **Estimativa (orçado)** recomposta de custos puros: MO individual × dias, ativos × 8,8h × dias,
  consumo = composição × quantidade do Plano de Trabalho, mobilização km × R$/km. Mesma
  fórmula no Motor, no Recalcular da Decisão e no aditivo (que agora também soma o consumo
  do serviço aditado). OSs novas levam `motorVersao: 2`.
- **🔴 Acompanhamento do custo Realizado (tempo real)** — régua ÚNICA (antes havia duas
  divergentes): MO = horas do RDO × Σ HH da equipe (mensal ÷ dias úteis ÷ 8,8h; HE ×1,5/×2,
  noturno +20%) + **MO de escritório** (horas do Mobile por IDGEO × HH individual, sem dupla
  contagem) + ativos × horas da frente + consumo real (produção × composição) + km × R$/km +
  estadia + autorizações + terceirização.
- Terceirização: atividades terceirizadas saem do consumo (é custo do terceiro); snapshot da IA
  atualizado para os parâmetros puros; pré-cargas de Depreciação e Composições marcadas 🟡
  "revisar" com contador na própria aba.

## GeoópS V1.1.24 · GeoópS Mobile V1.1 — 14/07/2026

**Check-ins sem fotos + ⏱ pomodoro de horas por IDGEO na intrajornada.**

- **Fotos removidas dos check-ins** (pedido da diretoria): sai a selfie e a foto de
  equipamentos/área de trabalho nos dois modos — fica o **registro de localização (GPS)** e as
  demais verificações (cerca eletrônica no campo). As **📷 fotos do trabalho** e as **📄 fichas de
  campo** do fechamento continuam como antes; selfies de registros antigos seguem visíveis na
  validação de RDO.
- **⏱ Pomodoro (modo escritório)**: entre o check-in e o checkout, o colaborador marca cada bloco
  de tempo escolhendo **IDGEO + serviço realizado (obrigatórios)** — ▶ iniciar / ⏹ encerrar, com
  cronômetro na tela e lista dos blocos do dia. O bloco em andamento é encerrado automaticamente
  no checkout do almoço e no fim do dia.
- **Fechamento automático**: as horas por IDGEO do controle_de_horas nascem dos blocos do pomodoro
  (agrupados por projeto); linhas manuais continuam disponíveis para o que não foi marcado e a
  sobra da jornada vai para o IDGEO principal. Dia sem blocos cai no preenchimento manual.
- Versão do app agora exibida a partir da constante (GeoópS Mobile V1.1).

## GeoópS V1.1.23 · GeoópS Mobile V1.0 — 14/07/2026

**O GeofieldS vira GeoópS Mobile — check-in diário de TODOS os colaboradores.**

- **Novo nome oficial**: “GeoópS Mobile versão 1.0 — Aplicativo integrado ao GeoópS - Sistema de
  Gestão Operacional Inteligente”, com a logo GEOAMBIENTE separada no topo do cabeçalho azul.
  Link oficial: **www.geoops.ia.br/mobile** (o antigo /geofields continua funcionando).
- **Tela inicial igual para todos**: boas-vindas com mensagem motivacional, **previsão do tempo do
  dia** (máx/mín e chance de chuva — pela cerca do projeto ou pelo GPS do aparelho) e o botão
  **“🚀 Inicie as suas atividades de hoje”**.
- **Segunda tela — resumo do dia**: quem está escalado em OS vê a programação e as metas do dia
  (Eficiência → Metas) e as **alocações dos próximos 30 dias**; quem não está escolhe o **IDGEO
  ativo** em que vai trabalhar e descreve as atividades.
- **Modo escritório / home office / atividades externas** (novo): check-in com selfie + **foto da
  área de trabalho** + IDGEO + plano do dia → checkout do almoço com relato da manhã → retorno com
  IDGEO/plano da tarde → **fechamento com horas dedicadas por IDGEO**, permitindo somar linhas de
  outros projetos (ex.: “1h — resolver problema do cliente do PR26021”). GPS obrigatório como no
  campo; sem cerca eletrônica (não se aplica).
- **controle_de_horas** (novo repositório): os fechamentos de escritório ficam separados dos RDOs
  de campo e alimentam o painel **🕒 Controle de horas** em Operações → RDOs — horas × custo do
  colaborador (custo mensal ÷ dias úteis ÷ 8,8h), com seletor de mês e **CSV mensal**. Gerente de
  Projetos vê e baixa a própria carteira; Diretoria/GerOp, toda a base; valores em R$ seguem a
  classe 🎯 Informações estratégicas.
- Fluxo de campo permanece o mesmo (RDO parcial no almoço, fichas obrigatórias, validação do
  gestor); jornada de referência exibida: 8h48 + 1h de almoço (saída ~17h48), sem bloqueio.
- Compatibilidade preservada: PWAs instalados, convites antigos e registros existentes seguem
  válidos (identificadores internos não mudaram).

## GeoópS V1.1.22 · GeofieldS V1.5 — 13/07/2026

**Correção urgente: sistema não carregava (erro fatal introduzido na V1.1.21).**

- O guarda de reentrância do recálculo de pré-agendamentos (`useRef`) havia sido declarado
  DEPOIS dos retornos antecipados do componente (tela de carregamento / login). Ao entrar no
  sistema, o React detectava um hook a mais que no render anterior e lançava erro fatal —
  a página congelava/ficava em branco.
- O hook foi movido para o topo do componente, junto dos demais. A correção da V1.1.21
  (recálculo assíncrono e só-faltantes na Decisão de alocação) permanece intacta.
- Validação: teste automatizado de carregamento + login + navegação até a Decisão.

## GeoópS V1.1.21 · GeofieldS V1.5 — 12/07/2026
- CAUSA-RAIZ do travamento na Decisão de alocação ENCONTRADA E CORRIGIDA:
  o recálculo automático regenerava TODOS os pré-agendamentos da base, de
  forma síncrona, a cada entrada na sub-aba — com dezenas de projetos, o
  Motor congelava o navegador e o iOS matava a página ("tela salta e não
  volta", sem erro visível). Agora: (1) na entrada só são calculados os
  projetos com plano que AINDA NÃO TÊM pré-agendamento (normalmente zero;
  o recálculo por projeto continua nos botões da Decisão); (2) o cálculo é
  FATIADO — o navegador respira entre um projeto e outro e a tela nunca
  congela; (3) proteção contra execução dupla e telemetria de tempo no
  console.

## GeoópS V1.1.20 · GeofieldS V1.5 — 12/07/2026
- EXCLUSÃO COMPLETA DE USUÁRIO: o Excluir do ⚙️ Administrador agora oferece
  apagar TAMBÉM a conta de login no servidor (novo endpoint seguro com
  service-role; somente Diretoria, validado no servidor; nunca a própria
  conta). Resolve o caso do e-mail excluído que continuava respondendo
  "já possui login" — o e-mail fica livre para um novo convite. A mensagem
  do convite para conta existente também explica o caminho.

## GeoópS V1.1.19 · GeofieldS V1.5 — 12/07/2026
- IDENTIDADE OFICIAL do app de campo: "GeofieldS — Aplicativo de Campo para
  o Colaborador Geoambiente", parte integrante do "GeoópS — Sistema de
  Gestão Operacional Inteligente". Novo cabeçalho em barra AZUL (mesma
  identidade do GeoópS) com a logomarca GEOAMBIENTE e as DUAS versões
  visíveis (GeofieldS + GeoópS) — resolve a impressão de versão desatualizada.
- Tela de login do GeofieldS com o subtítulo oficial.
- SEGURANÇA DE IDENTIDADE: fim do seletor "quem é você" — o nome do
  colaborador vem SEMPRE do login (matrícula vinculada pelo RH); conta sem
  vínculo recebe orientação para procurar o RH, sem escolher nome manualmente.

## GeoópS V1.1.18 · GeofieldS V1.4 — 12/07/2026
- AUDITORIA PROFUNDA do salto de tela no Planejamento → Decisão:
  1. o recálculo automático de pré-agendamentos (Motor) rodava sobre TODOS
     os projetos ao abrir a Decisão — um único projeto com dado inesperado
     derrubava a renderização inteira ("tela salta" e a aba some). Agora o
     recálculo é blindado: projeto com dado ruim é PULADO (registrado no
     console) e os demais seguem; o efeito inteiro também é isolado.
  2. REDE DE SEGURANÇA em todas as abas: qualquer erro de renderização
     passa a mostrar um cartão com a MENSAGEM REAL do erro (para enviar ao
     suporte) em vez de tela branca/salto — o resto do sistema continua
     navegável e "Tentar novamente" refaz a tela.

## GeoópS V1.1.17 · GeofieldS V1.4 — 12/07/2026
- AUDITORIA DO LOGIN POR E-MAIL (3 correções):
  1. o tipo "campo" não era reconhecido no metadata da sessão — contas do
     GeofieldS eram rebaixadas para "gerente" e caíam DENTRO do GeoópS em
     vez do app de campo. Corrigido: campo entra direto no GeofieldS.
  2. a base remota agora é recarregada APÓS o login: quem abria o site
     deslogado ficava sem o grid de permissões ("Dados persistentes neste
     dispositivo") e o papel caía no metadata — causa do evertonmc@me.com
     aparecer como "Gerente". O app recarrega uma única vez ao autenticar
     para puxar o grid (o papel do Admin volta a ser a palavra final).
  3. contas criadas manualmente no painel (sem metadata) continuam caindo
     em "gerente" apenas até o grid carregar — com a correção 2, o papel
     definido no ⚙️ Administrador passa a valer sempre.

## GeoópS V1.1.16 · GeofieldS V1.4 — 12/07/2026
- 🖼 CARIMBO INSTITUCIONAL nas fotos do GeofieldS (selfie, equipamentos,
  fotos do trabalho e fichas): logo GEOAMBIENTE no topo + nome do técnico,
  data, hora:minuto e coordenadas GPS no rodapé — gravados NA IMAGEM antes
  de subir ao servidor (vale também offline).
- 📄 FICHAS DE CAMPO OBRIGATÓRIAS: o fechamento do dia agora exige
  fotografar as fichas de processo preenchidas à mão (RP — aplicação,
  monitoramento…). Elas sobem carimbadas ao Storage (tipo "ficha") e a
  validação do gestor mostra a contagem por RDO.
- 📍 GPS OBRIGATÓRIO (modo política): check-ins, almoço, retorno, fechamento
  e TODAS as fotos só são registrados com posição válida (2 tentativas
  automáticas); sem permissão, o app mostra cartão vermelho com o passo a
  passo de reativação (iPhone/Android) — amparado na política de localização
  e LGPD assinada com os colaboradores. O caminho "registrar sem GPS" deixou
  de existir.
- ⏱ HORA EXTRA: solicitável somente a partir das 15h do dia em atividade;
  as demais solicitações (ferramentas, hotel, combustível, carro, Uber)
  continuam ativas o tempo todo.
- Guia 🚀 Primeiros passos: instruções de GPS (Permitir + reativação) e
  novas etapas do líder de campo.

## GeoópS V1.1.15 · GeofieldS V1.3 — 11/07/2026
- 📷 FOTOS DE CAMPO NO SERVIDOR: o GeofieldS ganhou o cartão "Fotos do
  trabalho" — o líder registra quantas fotos quiser durante o dia (com
  legenda), com FILA OFFLINE (sem sinal, ficam no aparelho e sobem sozinhas).
  As fotos vão para o Storage do Supabase (bucket PRIVADO fotos-campo) e os
  metadados para a tabela permanente campo_fotos (só-inserção — base firme).
- No GeoópS (Operações → RDOs): galeria "📷 Fotos de campo" com filtros por
  projeto e dia, visualização e download (individual ou em lote) por LINKS
  ASSINADOS de curta duração — Gerente de Operações vê tudo; Gerente de
  Projetos vê apenas a própria carteira.
- Requisito de servidor: rodar supabase/fotos_campo.sql (bucket + tabela +
  RLS) no SQL Editor — sem ele nada quebra: as fotos aguardam na fila.
- Fundação para os próximos módulos (relatórios com IA usando fotos + RDOs).

## GeoópS V1.1.14 · GeofieldS V1.2 — 11/07/2026
- 📖 GUIA DO SISTEMA: nova sub-aba dentro da Esteira com o manual vivo do
  GeoópS, aberto a todos os perfis e com opção de página inteira/impressão:
  · 🚜 Fluxo de processos — o trilho do contrato ao encerramento, atualizado
    para a estrutura atual (Equipes, Operações→Planejamento, GeofieldS V1.2,
    classes de permissão, e-mails por função);
  · 🧠 Como a Inteligência decide — fontes, snapshot, 3 frentes, salvaguardas;
  · 🚀 Primeiros passos por papel — o dia 1 de cada função (Diretoria, RH,
    Comercial, Planejamento, Operações, Gerente de carteira, Líder de campo,
    Eficiência) + as 4 classes de permissão e o movimento diário.
- REGRA PERMANENTE: os guias (public/guia/) acompanham as versões — toda
  mudança de fluxo/tela atualiza o manual junto com o changelog.

## GeoópS V1.1.13 · GeofieldS V1.2 — 11/07/2026
- GeofieldS: nova seção 🙋 SOLICITAÇÕES — o colaborador pede FERRAMENTAS,
  HOTEL, COMBUSTÍVEL, CARRO ALUGADO ou UBER a qualquer momento (tipo, data,
  valor estimado e justificativa), acompanha o status (aguardando/aprovada/
  negada com motivo) e o gestor com a classe ✅ em Autorizações recebe o
  aviso por e-mail e decide em Operações → Autorizações. Ao aprovar, o valor
  é lançado automaticamente como custo do IDGEO (Realizado dos KPIs).
- LINK DIRETO do GeofieldS: www.geoops.ia.br/geofields (caminho limpo, sem
  precisar do #) — o mesmo /#geofields continua valendo.
- ⚙️ ADMINISTRADOR (antigo Admin) mudou de Cadastros para a aba 👥 Equipes.
- 📲 ACESSOS GEOFIELDS: nova área em Equipes para o RH gerir a entrada e
  saída de colaboradores no app — cria o acesso a partir do colaborador já
  cadastrado (convite com link direto), acompanha situação e último
  check-in, desativa/reativa; colaborador marcado como DESLIGADO no
  cadastro tem o acesso desativado automaticamente (com trilha).
- Novo usuário tipo "Líder de campo": o formulário já mostra o acesso ao
  app GeofieldS marcado (única opção), sem o grid de abas do GeoópS.
- Planejamento reorganizado: um só cabeçalho (o banner interno duplicado
  virou cartão compacto), ordem lógica dos controles (alternância →
  localizador → indicadores → lista) — mais limpo no celular.

## GeoópS V1.1.12 · GeofieldS V1.1 — 11/07/2026
- Sub-abas SEMPRE NO TOPO: Comercial (Clientes · Contratos · TAPs) e
  Eficiência (Custos Unitários · Parâmetros · Metas · Dimensionamento)
  passaram para a mesma faixa branca do topo usada por Equipes, Cadastros
  e Operações — padrão único de navegação em todo o sistema.
- Esteira e Caixa de aprovações ganharam LOCALIZADOR: busca por IDGEO,
  cliente, nome do projeto ou descrição da pendência.

## GeoópS V1.1.11 · GeofieldS V1.1 — 11/07/2026
- SISTEMA GUIADO ("movimento diário"): todo cabeçalho de aba ganhou a linha
  "➡️ Próximo passo", instruindo a decisão e apontando a próxima página ou
  informação a inserir para a demanda avançar (Comercial → TAP → Planejamento
  → Esteira → RDOs, e assim por diante).
- Cabeçalhos profissionais revisados em todas as abas (função clara da página);
  Diretrizes ganhou cabeçalho no padrão do sistema.
- LOCALIZADORES (busca) revisados: placeholders adequados ao tema de cada
  página (Aptidões e SMS deixaram de pedir "região"); a Eficiência ganhou
  localizador de verdade — filtra Custos Unitários, Parâmetros e Metas.
- Chat com GeoópS: 12 perguntas prontas cobrindo as principais questões
  diárias do planejador (risco de atraso, ritmo, conflitos, disponibilidade,
  liberação de recursos, TAPs paradas, aceites pendentes, autorizações,
  custo acima do orçado, vencimentos SMS/ASO, NCs da semana, logística).
- Auditoria de regressão das mudanças V1.1.8–V1.1.10: verificação dos pontos
  de cálculo e permissões (detalhes no relatório da versão).

## GeoópS V1.1.10 · GeofieldS V1.1 — 11/07/2026
- NOVA ABA-MÃE "👥 Equipes" (prioridade da empresa): Cadastro de equipes,
  Aptidões, SMS e Diretrizes saem de Cadastros e ganham aba principal própria.
  Cadastros fica com o patrimônio: Máquinas, Frota, Equipamentos e Admin.
- Planejamento passou para DENTRO de Operações (sub-aba), mantendo as duas
  apresentações (Planos de Trabalho e Decisão de alocação); todos os atalhos
  internos continuam funcionando.
- CLASSES DE PERMISSÃO: além de 👁 Ver e ✏️ Editar, nasce ✅ Aprovar (só nas
  abas de fluxo — RDOs, Planejamento, Autorizações, Aprovações, Esteira; quem
  não a tem prepara mas não aprova) e a chave por usuário 🎯 Informações
  estratégicas (libera custos, margens e valores em todo o sistema). Os
  e-mails de pendência passam a mirar primeiro quem APROVA a aba.
- 📰 Publicar notícia (GeofieldS) mudou do Admin para a aba 👥 Equipes —
  quem cuida das pessoas publica as notícias.
- ADMIN PROFISSIONAL: situação por usuário (Pendente → Convidado → Ativo →
  Inativo) com último acesso; desativar/reativar contas (conta desativada não
  entra nem no GeofieldS); proteções clássicas (ninguém exclui/desativa a si
  mesmo nem o último Diretoria); e-mail duplicado bloqueado; busca e
  contadores; exportação de usuários em CSV; e Histórico de administração
  (trilha de auditoria de quem fez o quê com cada conta, exportável).

## GeoópS V1.1.9 · GeofieldS V1.1 — 11/07/2026
- Eficiência: "Rodagem diária em campo" (km/dia) saiu de Parâmetros
  Complementares e passou a viver na sub-aba METAS — é uma meta de
  deslocamento, não um custo. Mesmo campo, mesma cadeia de cálculo.
- Admin: novo botão "🔑 Redefinir senha" em cada usuário — reenvia o e-mail
  de redefinição ("esqueci minha senha") para qualquer conta já cadastrada,
  sem depender da tela de login.

## GeoópS V1.1.8 · GeofieldS V1.1 — 11/07/2026
- Convite de usuários: quando o Supabase Auth falha ao ENVIAR o e-mail do
  convite (resposta vazia "{}" ou erro de SMTP), a mensagem agora explica a
  causa provável e aponta exatamente onde corrigir (Authentication → Emails →
  SMTP Settings do Supabase), em vez de mostrar "{}".

## GeoópS V1.1.7 · GeofieldS V1.1 — 10/07/2026
- Cronograma: a FICHA DA FRENTE (IDGEO, líder + ajudantes, nome do líder,
  veículo, máquina, equipamentos) agora aparece DENTRO da barra colorida,
  como rótulo no início de cada faixa (fontes reduzidas, sombra p/ leitura);
  a coluna esquerda ficou enxuta (cliente + IDGEO) e o tooltip traz tudo.

## GeoópS V1.1.6 · GeofieldS V1.1 — 10/07/2026
- Cronograma (visão Clientes × IDGEO): cada caixinha agora traz a FICHA DA
  FRENTE — IDGEO, composição da equipe (líder + N ajudantes), nome do líder,
  veículo (placa), máquina (código) e nº de equipamentos; tooltip com a
  lista completa. Fonte: OS aprovada (fallback: reservas do calendário).

## GeoópS V1.1.5 · GeofieldS V1.1 — 10/07/2026
- BLINDAGEM DO GRID: uma aba/dispositivo com estado desatualizado não consegue
  mais apagar usuários, diretores notificados, notícias, treinamentos e senhas
  ao sincronizar — o envio mescla por união com o estado remoto (exclusões
  intencionais são respeitadas via tombstones). Corrige a causa raiz do
  papel "Diretoria" regredir para "Gerente" entre sessões.
- Infra unificada (operacional): projeto Vercel duplicado (geoops-ia-v1.0.0)
  descomissionado; domínio, variáveis e deploys concentrados no projeto único.

## GeoópS V1.1.4 · GeofieldS V1.1 — 10/07/2026
- Cronograma de Operações INVERTIDO por padrão: linhas = clientes × IDGEO
  (equipes agrupadas na célula, com contagem de pessoas por semana); a visão
  antiga "por recurso" continua disponível num botão de alternância.

## GeoópS V1.1.3 · GeofieldS V1.1 — 10/07/2026
- Dashboard mobile: "Projetos ativos" em grade responsiva (1 coluna no
  celular, 2+ no desktop) — elimina os cartões espremidos/truncados.

## GeoópS V1.1.2 · GeofieldS V1.1 — 10/07/2026
- Dashboard: o Cronograma de Operações passa a ser o PRIMEIRO bloco da aba;
  os indicadores (Resumo operacional e contagens) ficaram compactos no
  celular (2 por linha), corrigindo a tela desconfigurada no mobile.

## GeoópS V1.1.1 · GeofieldS V1.1 — 10/07/2026
- **Acesso de protótipo APOSENTADO**: o login é exclusivamente por e-mail e senha
  (Supabase). O modo legado permanece apenas como fallback automático quando o
  Supabase não está configurado (desenvolvimento/offline). A seção "Senhas de
  acesso (protótipo)" foi removida do Admin. As opções de manutenção da base
  (zerar/reiniciar/carregar testes) permanecem, exclusivas da Diretoria.
- **Correção de papel no login**: o casamento do e-mail com o grid de permissões
  agora ignora espaços acidentais no cadastro (evita Diretoria entrar como
  "gerente" por diferença de digitação).
- **Link de convite/recuperação expirado**: em vez de página em branco, a tela de
  login agora exibe a mensagem de erro do link ("Link inválido ou expirado —
  solicite um novo").
- **Convite GeofieldS pelo Admin**: usuários do tipo "Líder de campo" recebem o
  convite com link que abre direto a página de login do GeofieldS
  (www.geoops.ia.br/#geofields), com a marca do app — independente do login
  principal do GeoópS, mas sobre a mesma base de dados.
- **Versionamento**: GeoópS V1.1.1 e GeofieldS V1.1; próximas versões V1.1.2/V1.2 etc.,
  sempre com relatório aqui.

## GeoópS V1.1.0-beta · GeofieldS V1.0-beta — 10/07/2026
- Merge único GeoópS + GeofieldS na produção (fim da branch separada).
- Avisos de ação humana por avisos@ ao responsável de cada aba (grid do Admin):
  TAP aguardando Plano, LEIA pendente, OS aguardando aceite (todos os caminhos),
  autorizações, RDO de campo aguardando validação.
- Admin: botão "✉️ Testar envio de e-mail".
- GeofieldS: fix do teclado (foco), check-in alimenta a posição do colaborador
  (Localização/Motor), unidades à direita, parcial da manhã obrigatório,
  preenchimento final com NCs, logo 🌍.

## Versões anteriores (resumo)
- **V1.0.0 → V1.0.7**: versionamento visível; menu de senhas; login por e-mail com
  definição de senha no 1º acesso e "esqueci minha senha"; permissões ver/editar
  por aba; calendário de RDOs; NC clicável; cores por cliente no cronograma; POPs
  em todas as leituras de IA; upload de Excel em todas as importações; SMS em 3
  sub-abas; Localização GPS; gates do fluxo de aprovações (TAP fechada + bloqueio
  total inviolável); Aprovações dentro da Esteira; endpoint de e-mails com
  remetente por função (@geoops.ia.br).
- **V2.0.0-beta.1 → beta.6 (branch app-campo)**: nascimento do GeofieldS — jornada
  com GPS/fotos/cerca eletrônica, RDO validado pelo gestor, agenda do colaborador,
  hora extra, notícias, janelas por colaborador, e-mails do campo.
