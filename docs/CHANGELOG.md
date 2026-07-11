# GeoópS · Registro de versões (changelog)

> A cada merge na `main`, a versão visível no sistema é incrementada e esta página
> ganha o relatório do que mudou. GeoópS e GeofieldS versionam juntos no mesmo deploy.

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
