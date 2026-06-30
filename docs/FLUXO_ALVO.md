# Fluxo-alvo do GeoópS — mapa de processos, telas e aprovações

> Documento de **design para validação** (antes de codar). Objetivo: alinhar a sequência
> lógica do processo ponta a ponta, mostrar onde as telas estão soltas hoje e definir o
> encadeamento-alvo (estágio → tela → papel → ação → aprovação). Nenhum código foi alterado
> por este documento. Referências são `src/App.jsx:linha`.
>
> Data: 2026-06-25. Base: código já com as correções dos 6 bloqueadores pré-beta mergeadas.

---

## 0. Por que este documento existe

Inspeção do sistema (usuário + auditoria `docs/AUDITORIA_INTERCONEXOES.md`) apontou três
sintomas convergentes:

1. **Telas "soltas"** — áreas que não se conectam no processo (principalmente Planejamento e
   Inteligência).
2. **Sequência ilógica** — abas/telas/autorizações não seguem a ordem do processo real.
3. **Pontas soltas** — entradas de informação, aprovações e interconexões de dados sem trilho.

**Causa-raiz (confirmada no código):** existe uma máquina de estados canônica completa
(`ESTADOS_PROJETO` + `TRANSICOES_PROJETO`, `App.jsx:499-548`) — com papéis, dados exigidos e
efeitos por transição — que está **100% morta**. O fluxo real roda sobre um campo string
`statusTap` mutado à mão em cada handler, com ~7 valores ad-hoc. Sem um trilho único, cada
tela decide sozinha o "próximo passo", e a navegação entre elas é quase toda manual.

---

## 1. AS-IS — como o fluxo realmente funciona hoje

### 1.1 Os 7 estados reais (`statusTap`) e quem os grava

| `statusTap` real | Handler que grava | Tela/Aba | Linha |
|---|---|---|---|
| `Aguardando Plano de Trabalho` | `criarTapManual` / `importarTaps` | Comercial › TAPs | 6605 / 6569 |
| `Plano de Trabalho recebido` | `salvarPlano` | Planejamento › Planos | 6880 |
| `Aguardando programação` | `assinarTap` (após aceite duplo do LEIA) | Planejamento › Planos (LEIA) | 6674 |
| `Programado` | `salvarProg` / `confirmarPreAgendamento` (1º aceite, OS Pendente) | Operações / Decisão de alocação | 7122 |
| `Em campo` | `aceitarOS` (2º aceite completa) / `confirmarPreAgendamento` (master) | Operações | 7122 / 7586 |
| `Concluído` | `concluirProjeto` (avanço ≥ 100%) | Operações (RDO) | 7104 |
| `Cancelado` | — (sem caminho de UI fora do master) | — | — |

### 1.2 Onde as telas estão soltas (pontas confirmadas)

- **Navegação manual.** Só existem ~6 pontes entre telas: `setTab("comercial")` (8391/8466),
  `→ Inteligência` (9011), `Ir para Contratos/TAPs`, e `setSubPlanos("decisao")` após salvar o
  executivo (10917). **Não há, por projeto, um "próximo passo" guiado.** As abas são
  organizadas por **domínio/permissão**, não por **etapa do processo** — o usuário precisa
  "saber" para onde ir.
- **Aprovações espalhadas em 4 telas distintas, sem fila única:**
  1. Aceite duplo do **LEIA** (premissas da TAP) — Planejamento › Planos (`assinarTap`, 6674).
  2. **Confirmação do pré-agendamento** = 1º aceite da OS (Gerente de Projetos) — Decisão de
     alocação (`confirmarPreAgendamento`, 7121).
  3. **2º aceite da OS** (Gerente de Operações) — Operações (`aceitarOS`).
  4. **Autorizações** operacionais (campo) — aba Autorizações (`decidirAutorizacao`).
  Quem aprova não tem um lugar único que diga "o que depende de mim agora".
- **Inteligência ambígua.** É, de fato, um **painel de diagnóstico transversal** (lê todas as
  abas + a saída do Motor — `App.jsx:10234-10242`), mas o botão "→ Inteligência" saindo do
  Planejamento a faz *parecer* uma etapa sequencial do fluxo. Ela não grava estado nem
  transiciona projeto — é leitura/consultoria.
- **Granularidade perdida.** Os 7 estados reais **colapsam** 14 estados canônicos. Os saltos
  escondem etapas importantes: `Aguardando programação` mistura "em análise IA" + "escopo
  validado"; `Programado` mistura "pré-agendado" + "aguardando aprovação"; `Concluído` pula
  "campo concluído", "relatório" e "resultados". É por isso que filtros e cards do Dashboard
  às vezes "escondem" projetos (status fantasma `Pré-agendado`, card de contagem desalinhado).

---

## 2. TO-BE — o trilho único (máquina de estados canônica)

A proposta é **ressuscitar `ESTADOS_PROJETO`/`TRANSICOES_PROJETO` como fonte única de verdade**
e fazer cada tela apenas **disparar transições** (`podeTransicionar`), nunca mutar status à mão.
Cada transição já declara papel + dados exigidos + efeito (incluindo liberar travas) — ou seja,
a "sequência lógica" passa a ser **dado**, não código espalhado.

### 2.1 Tabela mestre — estágio → tela → papel → ação → aprovação

| # | Estado canônico | Tela/Aba onde acontece | Papel responsável | Ação que avança | Aprovação | Efeito |
|---|---|---|---|---|---|---|
| 0 | `rascunho` | Comercial › TAPs | Comercial / Gestor | criar TAP (cliente + contrato vinculados) | — | entra na fila de planejamento |
| 1 | `aguardando_plano` | Planejamento › Planos | Gestor de Planejamento | aguarda o Plano de Trabalho | — | — |
| 2 | `plano_recebido` | Planejamento › Planos | Gestor de Planejamento | anexar/registrar o Plano | — | habilita leitura por IA |
| 3 | `em_analise_ia` | Planejamento › Planos (IA) | Sistema (IA) + Gestor | IA lê contrato + plano e extrai escopo/quantitativos | — | gera quantitativos sugeridos |
| 4 | `escopo_validado` | Planejamento › Planos (**LEIA**) | Gestor de Operações **+** Gerente de Projetos | assinar o LEIA (premissas) | **Aceite duplo (LEIA)** | libera o Motor de Alocação |
| 5 | `pre_agendado` | Planejamento › **Decisão de alocação** | Gestor de Planejamento | rodar Motor, escolher cenário/janela, reservar recursos | — | **trava (reserva)** os recursos |
| 6 | `aguardando_aprovacao_gerente` | Decisão de alocação | Gerente de Projetos (carteira) | confirmar o pré-agendamento | **1º aceite da OS** | OS nasce **Pendente** |
| 7 | `aguardando_aprovacao_operacoes` | **Operações** | Gerente de Operações (dom prog) | assinar o 2º aceite | **2º aceite da OS** | OS **Aprovada**; bloqueia recursos |
| 8 | `os_aprovada` | Operações | Gerente de Operações | liberar para campo (data de início) | — | habilita o RDO diário |
| 9 | `em_campo` | Operações (**RDO**) | Gerente de Operações / equipe | apontamento diário (RDO) | — | avanço físico |
| 10 | `campo_concluido` | Operações | Gerente de Operações | encerrar campo (100% ou manual) | — | **libera os recursos** |
| 11 | `relatorio_em_elaboracao` | Planejamento / Inteligência | Gestor | consolidar prazos, metas e custos | — | — |
| 12 | `concluido` | — | Gestor | emitir relatório final | **Relatório** | fecha o projeto |
| 13 | `resultados_projeto` | Dashboard / Inteligência | Gestor | consolidar resultado (prazo/meta/custo por IDGEO) | — | alimenta KPIs |
| -1 | `cancelado` | qualquer estágio | Gestor (pré-campo) / **Diretoria** (em campo) | cancelar + motivo | Diretoria se em campo | **libera as travas** |

> Diferença-chave para o AS-IS: as etapas de **aprovação (4 → 6 → 7)** e de **encerramento
> (10 → 11 → 12 → 13)** deixam de ser saltos invisíveis e viram estágios explícitos, cada um
> com tela, papel e botão de "próxima ação".

### 2.2 Mapa de migração `statusTap` → `estado` canônico

A migração é **incremental e sem big-bang**: um campo `estado` canônico passa a **conviver**
com `statusTap` durante a transição; a UI lê `estado`, e um derivador mantém `statusTap` em
sincronia até que todas as telas estejam migradas.

| `statusTap` atual | → `estado` canônico | Observação na migração |
|---|---|---|
| `Aguardando Plano de Trabalho` | `aguardando_plano` | 1:1 |
| `Plano de Trabalho recebido` | `plano_recebido` | 1:1 |
| `Aguardando programação` | `em_analise_ia` → `escopo_validado` | separar "IA leu" de "LEIA assinado" |
| `Programado` (OS Pendente) | `pre_agendado` → `aguardando_aprovacao_gerente` | separar "reservado" de "aguardando 1º aceite" |
| `Programado` (OS Pendente, 1º aceite dado) | `aguardando_aprovacao_operacoes` | aguardando 2º aceite |
| `Em campo` | `os_aprovada` → `em_campo` | separar "OS emitida" de "campo iniciado" |
| `Concluído` | `campo_concluido` → … → `concluido` | restaurar etapas de encerramento |
| `Cancelado` | `cancelado` | + efeito de liberar travas |

---

## 3. Modelo de navegação orientado a processo

Dois artefatos de UI novos, ambos **derivados do estado canônico** (não duplicam dado):

### 3.1 "Esteira" do projeto (pipeline por IDGEO)
Uma faixa que mostra, para cada projeto, **o estágio atual** e **a única próxima ação**, com um
botão que leva **o papel certo à tela certa**. Substitui o "adivinhar para onde ir".

```
IDGEO 1234 · Cliente X
[✓ TAP] [✓ Plano] [✓ IA] [✓ LEIA] [● Decisão de alocação] [ Aprovações ] [ Campo ] [ Encerramento ]
                                     ▲ você está aqui
                            Próximo: "Confirmar pré-agendamento" → (Gerente de Projetos)
                                     [ Abrir Decisão de alocação → ]
```

### 3.2 Caixa de aprovações unificada (inbox)
Uma fila única — visível ao papel logado — que junta os 4 pontos de aprovação hoje espalhados:
LEIA, 1º aceite (pré-agendamento), 2º aceite (OS) e Autorizações. Cada item mostra projeto,
o que se pede, e abre direto a tela de assinatura. Resolve "o que depende de mim agora".

---

## 4. Reposicionamento Planejamento ↔ Inteligência

- **Planejamento** = a esteira de execução (estágios 1–5/6): Planos → IA → LEIA → Decisão de
  alocação. Fluxo **guiado** com progressão explícita entre as sub-etapas (hoje só há
  sub-abas "Planos" e "Decisão", sem condução).
- **Inteligência** = continua aba própria, **transversal** (não é etapa do fluxo), porém
  **reorganizada em 3 sub-abas** (decisão validada — ver 4.1).

### 4.1 Inteligência em 3 sub-abas (spec validada 2026-06-25)

| Sub-aba | Papel-foco | O que faz | Base no código atual |
|---|---|---|---|
| **1. Ações sugeridas pela IA** *(nova)* | Gerente de Operações | Atua **diretamente** sobre IDGEOs vigentes (em campo, agendados, aguardando agendamento). A IA oferta **sugestões de ação por projeto**, lendo a **posição atualizada do dia** de pessoas e veículos, com foco em: **redução de custo logístico**, **tempo de execução** e **reorganização de projetos agendados** em função das novas posições dos recursos. Cada sugestão tem botão de ação (confirmar → aplica/transiciona). | `importarPosP`/`importarPosV` (posições), Motor, `checkup.realocacao`/`oportunidades`, e o mecanismo `chatProposta`/`confirmarAcaoIA` (propor→confirmar→aplicar) já existentes |
| **2. Chat com GeoópS** *(realocada)* | Gerente de Operações | Diálogo livre com a IA para resolver questões dos projetos. Move o chat interativo que hoje fica no rodapé da Inteligência. | bloco "💬 Pergunte à Inteligência" (`enviarChat`, `chatMsgs`, `chatProposta`, `confirmarAcaoIA`, ~10370) |
| **3. Diagnóstico** *(realocada)* | Gestão | A leitura consolidada da IA sobre os projetos **como está hoje**, só que isolada nesta sub-aba: check-up (resumo, saúde dos projetos, logística, realocação, oportunidades, alertas) + histórico de leituras/PDF. | `rodarCheckup`/`checkup` (~10256) + histórico (~10334) |

**Princípios da sub-aba 1 (Ações sugeridas):**
- **Escopo:** apenas IDGEOs vigentes — estados `aguardando_aprovacao_*`/`pre_agendado`
  (agendados/aguardando) e `os_aprovada`/`em_campo` (em campo).
- **Entrada de dados:** posição **do dia** de pessoas (`localAtual/lat/lng`) e veículos (GPS),
  além da saída do Motor e do estado de cada projeto.
- **Objetivo da IA:** minimizar custo de logística e tempo de execução; **re-sequenciar/realocar**
  projetos agendados quando a nova posição dos recursos abrir uma janela melhor.
- **Ação:** cada sugestão é acionável — reaproveita o padrão "propor → confirmar → aplicar".
  Aplicar uma ação que mude estágio passa pelo trilho canônico (`podeTransicionar`).

---

## 5. Gaps (médios/baixos da auditoria) ancorados por estágio

| Gap | Estágio-alvo | Item auditoria |
|---|---|---|
| Cancelamento em campo libera travas | `em_campo → cancelado` | #14 |
| Decisão de autorização restrita à carteira | `em_campo` (Autorizações) | #15 |
| Auto-abrir quantitativos para o gerente após assinar | `escopo_validado → pre_agendado` | #16 |
| Conclusão manual (sem depender de 100%) | `em_campo → campo_concluido` | #17 |
| Travas órfãs ao excluir recurso com OS ativa | transversal (recursos) | #13 |
| Master assinando os dois aceites do LEIA sozinho | `escopo_validado` | #8 |
| Limpezas de código morto / cópia enganosa | transversal | #18–#23 |

A unificação da máquina de estados (Seção 2) **absorve naturalmente** #1, #2, #3, #7, #14, #15
e #16, porque centraliza "quem-pode-o-quê" e os efeitos colaterais (incl. liberação de travas).

---

## 6. Próximos passos (após validação deste mapa)

1. **Validar este documento** — ajustar a tabela mestre (Seção 2.1): nomes de papéis, telas,
   quais aprovações são obrigatórias e a granularidade de estados que você quer de fato expor.
2. **Protótipo navegável** (opcional) — uma tela de "esteira" + "inbox" estática para sentir o
   encadeamento antes do refactor.
3. **Fase A** — introduzir o campo `estado` convivendo com `statusTap`; derivador de sincronia;
   migrar handler a handler para `podeTransicionar` (começando pelos estágios de aprovação).
4. **Fase B** — esteira por projeto + caixa de aprovações unificada sobre o estado canônico.
5. **Fase C** — reposicionar Inteligência como camada transversal; guiar o fluxo do Planejamento.
6. **Fase D** — fechar os gaps médios/baixos absorvidos.

### 6.1 Decisões validadas (2026-06-25)

| Ponto | Decisão |
|---|---|
| **Granularidade dos estados** | **Expor os 14 estados** canônicos (sem colapsar) |
| **Esteira** | **Por IDGEO** (pipeline por projeto) |
| **Caixa de aprovações** | **Aba nova** dedicada |
| **Inteligência** | **Aba própria**, reorganizada em **3 sub-abas**: (1) Ações sugeridas pela IA, (2) Chat com GeoópS, (3) Diagnóstico — ver Seção 4.1 |

### 6.2 Sequência de execução acordada

1. ✅ Mapa do fluxo-alvo validado (este documento).
2. **Inteligência em 3 sub-abas** — primeiro build concreto (mais autocontido e de menor risco;
   "Diagnóstico" e "Chat" são realocações; "Ações sugeridas" é o novo motor de sugestões).
3. **Fase A** — campo `estado` canônico (14 estados) convivendo com `statusTap`; migração
   handler a handler para `podeTransicionar`.
4. **Fase B** — esteira por IDGEO + caixa de aprovações (aba nova), sobre o estado canônico.
5. **Fase C** — guiar o fluxo do Planejamento; conectar as Ações sugeridas às transições.
6. **Fase D** — fechar os gaps médios/baixos.
