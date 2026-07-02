# GeoópS — Manual do Usuário

**Sistema de Gestão Operacional Inteligente · GEOAMBIENTE S/A** · www.geoops.ia.br

Este manual descreve cada aba do sistema, o que ela faz e como interagir. As abas seguem 4 famílias de cor: **azul** = entrada de dados · **magenta** = acompanhamento · **amarelo ✨IA** = inteligência · **verde** = saídas/relatórios.

---

## Acesso e papéis

O login é por **e-mail e senha (Supabase)**. O que cada pessoa vê e edita vem do **grid de permissões** do Admin (Cadastros › Admin), casado pelo e-mail:

| Papel | O que faz |
|---|---|
| **Diretoria (master)** | Vê tudo (inclusive custos), edita tudo, gerencia usuários e diretrizes, zera a base. |
| **Gerente de Projetos (carteira)** | Sua carteira: aprova LEIA/pré-agendamento/autorizações, acompanha avanço e custos dos seus projetos, painel próprio. |
| **Alimentador / Coordenação** | Alimenta as áreas liberadas no grid (ex.: RDO, Frota, SMS) e vê as visões sem custo. |

---

## 💼 Comercial (azul)

Porta de entrada dos dados comerciais. Sub-abas:
- **Clientes** — cadastro (manual ou importado da planilha).
- **Contratos** — cadastre o contrato e **anexe o dossiê** (contrato, anexos, DFP em Excel). Clique em **Analisar com IA**: ela extrai resumo executivo, prazos, multas, obrigações, SMS, riscos, regras de faturamento e os **COGs do DFP** (que viram a base de custo orçado dos KPIs). Há também o **acompanhamento comercial** dos projetos (etapas e datas-marco para dar satisfação ao cliente).
- **TAPs** — atalho para a aba de TAPs.

> Tudo que a IA lê aqui alimenta a inteligência operacional do sistema.

## 📄 TAPs

Termo de Abertura de Projeto — nasce o **IDGEO** (identidade do projeto até o encerramento).
1. **+ Nova TAP**: preencha cliente, cidade/UF, carteira/gerente, serviços, datas (entrada em campo, entrega de relatório), valor.
2. Anexe **proposta + planilha de preços** e gere o **parecer técnico-jurídico da IA** — **etapa obrigatória**: sem parecer, as assinaturas ficam bloqueadas. Cada parecer é arquivado em banco definitivo.
3. Abra o **LEIA**: leitura obrigatória do parecer → marque "li integralmente" → **assinatura conjunta** (Gestor de Operações + Gerente de Projetos). Com as duas assinaturas o projeto avança para os quantitativos.

## 💵 Eficiência (azul)

Parâmetros econômicos: **custos unitários** (R$/km, hospedagem, alimentação, diárias de veículos, depreciação, materiais, dias úteis/mês), **produtividade padrão** por serviço (un/dia), **preços unitários** e **regras de composição de equipe** por atividade. É a base de cálculo do Motor e da IA — mantenha atualizada.

## 📇 Cadastros (azul)

Grupo com sub-abas:
- **👷 Equipe** — colaboradores (importe da planilha) e **Disponibilidade & Rotação**: férias, afastamentos, tempo em campo × máximo, localização atual. O Motor não escala quem está indisponível.
- **🎯 Aptidões** — matriz colaborador × serviço (básico → especialista).
- **🦺 SMS** — treinamentos/NRs com validades; pendências geram alertas.
- **⚙️ Máquinas · 🚗 Frota · 🔬 Equipamentos** — parque físico com status, posição e calibrações.
- **📋 Diretrizes** — políticas da empresa (regras **duras**/suaves extraídas por IA de texto/PDF) + **Procedimentos** (POPs condensados em passos) + **auditoria de violações** + e-mails dos diretores notificados. Tudo entra na memória fixa da IA.
- **⚙️ Admin** (só Diretoria) — usuários e permissões (convite por e-mail), registro de logins, manutenção da base (base limpa / exemplos).

## 🛠 Operações (azul)

- **📓 RDOs** — projetos em execução: dê o **2º aceite da OS** e lance o **RDO diário**: data, hora início/fim (padrão 08:00–17:48 = 8h48 trabalhadas + 1h de almoço descontada), **km rodados (obrigatório)**, **quantitativo de cada atividade (obrigatório; 0 se não executada)**, ocorrências do dia (equipamento com problema, ferramenta faltando, recusa de viagem, conflito de equipe, deslocamento, clima… cada uma com descrição e flag "gerou atraso"), não conformidades e observações. **Após salvar, o RDO é definitivo** (sem edição/exclusão; arquivado em banco próprio). Dá para lançar **serviço adicional (aditivo)** com prévia de impacto em custo/prazo.
- **📲 Autorizações** — solicite hora extra, veículo, hotel, Uber ou passagem aérea, vinculando colaborador + IDGEO + data. **Ao aprovar**, o sistema aplica os efeitos: veículo é **travado na Frota** para a data e os valores são **lançados como custo do IDGEO** (somam ao Realizado dos KPIs).

## ✅ Aprovações (magenta)

Caixa única de tudo que depende de você agora: **LEIA** pendente, **pré-agendamento** a confirmar (1º aceite), **2º aceite da OS**, **autorizações** e **aditivos**. Clique em **Abrir** para ir direto ao ponto de assinatura/decisão. Filtrada pelo seu papel/carteira.

## 🚜 Esteira (magenta)

Pipeline por IDGEO com os **6 marcos** do fluxo e o **estado canônico** (14 estados) de cada projeto, sempre com o **próximo passo** indicado. É o mapa de onde cada projeto está.

## 📝 Planejamento (amarelo ✨IA)

- **Planos** — receba o Plano de Trabalho (PDF), a IA lê atividades/quantitativos/riscos.
- **Decisão de alocação** — confirme os quantitativos e o Motor gera o cenário **"Melhor Otimização dos Recursos"** (equipe apta e disponível, máquina, veículos, equipamentos, janela, custo). Você pode **editar os recursos** (adicionar/remover/substituir pessoas, várias máquinas/veículos, equipamentos), **terceirizar** atividades ou o projeto inteiro (custo obrigatório; só Gerente Operacional) e **Recalcular** para ver o novo custo. Confirmar = **1º aceite** → OS pendente do 2º aceite.

## 🧠 Inteligência (amarelo ✨IA)

Três frentes (todas leem o snapshot completo do sistema + diretrizes + POPs):
- **⚡ Ações sugeridas** — fila priorizada de ações por projeto (urgência, faturamento, mobilização, custo logístico, tempo) incluindo sugestões **"fora da caixa"** com a conta demonstrada (ex.: avião + locação local vs. rodoviário). Cada ação é aplicada só com a sua confirmação.
- **💬 Chat** — pergunte qualquer coisa da operação ("quem está livre semana que vem?"); a IA cita as fontes.
- **🩺 Diagnóstico** — leitura executiva em 5 famílias (alerta vermelho, risco de faturamento, mobilização, logística regional, governança) + recomendação principal + **violações de diretrizes** (viram trilha de auditoria + e-mail aos diretores) + **recursos escassos × subutilizados**. Histórico versionado com PDF.

## 📈 Dashboard (verde)

Visão geral: resumo operacional, atualização das abas de entrada (semáforo), cronograma consolidado (Gantt), indicadores do mês, **visão de gestão** (saturação de recursos, custo × contrato — só para quem tem visão de custos) e **visão de campo** (metas de produção, sem cifras), projetos ativos com código de cores.

## 📊 KPIs (verde)

Tabela unificada por projeto: **Km rodados · Horas · Serviços (%) · Avanço geral (% real × esperado pelo prazo) · NC · Custo Orçado (DFP/Motor) × Realizado (recursos alocados × RDOs acumulados, com % do orçado) · Alarme de atraso · Alarme de performance**. Em andamento no topo; clique na linha para abrir a Esteira. Abaixo, painel de **ocupação de recursos** (30 dias) com gargalos e ociosos.

## 📍 Localização (verde)

Posição do dia de pessoas e veículos por cidade, com distância até a matriz — a base logística das sugestões da IA. Atualize posições pelas abas Equipe (ponto) e Frota (GPS).

## 📊 Painel (gerentes)

Painel da carteira do gerente: seus projetos, custos, atrasos e pendências.

---

## Fluxo resumido (o trilho do projeto)

**Cliente → Contrato (IA lê dossiê/DFP) → TAP (IA gera parecer — obrigatório) → LEIA (assinatura conjunta) → Plano de Trabalho (IA lê) → Quantitativos → Decisão de alocação (Motor + ajustes + terceirização) → 1º aceite → OS → 2º aceite → travas de recursos → Campo (RDO diário imutável + autorizações + aditivos) → KPIs/Diagnóstico → Conclusão (libera recursos).**

Em qualquer dúvida sobre "onde está o projeto", abra a **Esteira**; sobre "o que depende de mim", abra **Aprovações**.
