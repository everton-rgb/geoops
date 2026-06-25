# Auditoria de Interconexões — GeoópS (pré-beta)

Auditoria estática de `src/App.jsx` (10.743 linhas) + `src/constants/*`, focada no encadeamento de processos (máquina de estados do projeto) e na integridade das interconexões entre telas, handlers e dados. Nenhum código foi alterado. Todas as citações são `src/App.jsx:linha` salvo indicação.

Data: 2026-06-24.

---

## 0. Sumário executivo (contagem)

- **Bloqueadores (alto):** 6
- **Médios:** 9
- **Baixos:** 7

O sistema tem uma máquina de estados **canônica completa e bem desenhada** (`ESTADOS_PROJETO` / `TRANSICOES_PROJETO`, linhas 499-548) que está **100% morta** — nenhuma função do fluxo a usa. O fluxo real roda sobre um campo string `statusTap` solto, com valores **fora** tanto de `STATUS_TAP` quanto de `ESTADOS_PROJETO`. Isso é a raiz da maior parte dos achados desta auditoria.

---

## 1. Cadeia de valor / máquina de estados ponta a ponta

### 1.1 As TRÊS definições de estado concorrentes

Existem três "verdades" de estado no código, e elas não se conversam:

| Fonte | Onde | Valores | Uso real |
|---|---|---|---|
| `STATUS_TAP` (constante) | `src/constants/taps.js:1` | `Aguardando Plano de Trabalho`, `Plano de Trabalho recebido`, `Pré-agendado`, `Em campo`, `Concluído`, `Cancelado` | Não é importado para validar `statusTap`; serve apenas de referência nominal. |
| `ESTADOS_PROJETO` + `TRANSICOES_PROJETO` | `App.jsx:499-548` | 14 estados canônicos (`rascunho`…`resultados_projeto`, `cancelado`) com transições, papéis e dados exigidos | **MORTO.** `podeTransicionar` (564), `transicoesDisponiveis` (579), `papeisDoUsuario` (551) nunca são chamados (grep confirma 0 chamadas externas). |
| `statusTap` (campo runtime) | espalhado nos handlers | valores **ad-hoc**: `Aguardando Plano de Trabalho`, `Plano de Trabalho recebido`, `Aguardando programação`, `Programado`, `Em campo`, `Concluído`, `Cancelado` | **Esta é a máquina real.** |

> **[ALTO] Máquina de estados canônica morta + statusTap divergente.** `App.jsx:499-582`. O fluxo real nunca usa `ESTADOS_PROJETO`/`TRANSICOES_PROJETO`/`podeTransicionar`. Os status efetivamente gravados (`Aguardando programação`, `Programado`) não existem em `STATUS_TAP` (`src/constants/taps.js:1`) nem em `ESTADOS_PROJETO`. **Correção:** decidir UMA fonte. Para o beta, o mínimo é alinhar `STATUS_TAP` aos valores realmente setados (adicionar `Aguardando programação` e `Programado`, e remover/realmente setar `Pré-agendado`); idealmente, migrar os handlers para usar `podeTransicionar` ou então remover o código morto para não confundir manutenção.

### 1.2 Transições reais de `statusTap` (o que cada handler faz)

| Handler | Linha | De → Para | Observações |
|---|---|---|---|
| `criarTapManual` / `importarTaps` | 6605 / 6569 | (nova) → `Aguardando Plano de Trabalho` | OK |
| `salvarPlano` | 6880 | `Aguardando Plano de Trabalho` → `Plano de Trabalho recebido` | Só transiciona se o status atual for exatamente `Aguardando Plano de Trabalho`. |
| `excluirPlano` | 7140 | `Plano de Trabalho recebido` → `Aguardando Plano de Trabalho` (se ficou sem planos) | OK |
| `assinarTap` | 6674 | `Plano de Trabalho recebido` → `Aguardando programação` | Só após **ambos** aceites (gestorOp + gerenteProj) e `iniciada` true. Status fora de `STATUS_TAP`. |
| `salvarProg` (confirmar) | 7591 | (qualquer ≠ Em campo/Concluído/Cancelado) → `Programado` | Status fora de `STATUS_TAP`. |
| `criarProgManual` | 7560 | idem → `Programado` | idem |
| `excluirProg` | 7600 | `Programado` → `Aguardando programação` | OK (volta) |
| `confirmarPreAgendamento` | 7040 | (qualquer) → `Em campo` + cria OS `Aprovada` + travas | Caminho PRIMÁRIO de ida a campo. |
| `validarCenario` (aprovar) | 7494 | (qualquer) → `Em campo` + cria OS `Aprovada` | Caminho SECUNDÁRIO (Cenários). |
| `aceitarOS` (completo) | 7509 | (qualquer) → `Em campo` | Caminho TERCIÁRIO — **morto na prática** (ver 3.3). |
| `concluirProjeto` | 7104 | (qualquer) → `Concluído` + OS `Concluída` + libera travas | Disparado em avanço ≥ 100%. |

> **[ALTO] `Pré-agendado` é filtrado mas nunca setado.** Aparece em filtros `6417`, `6419`, `7203` (e na constante `STATUS_TAP`), mas **nenhum handler grava** `statusTap = "Pré-agendado"`. Essas cláusulas de filtro são condições mortas — projetos em pré-agendamento na verdade ficam com `statusTap = "Aguardando programação"` ou `Programado`, não `Pré-agendado`. **Correção:** ou setar `Pré-agendado` no momento do pré-agendamento, ou trocar os filtros para os status reais.

> **[ALTO] Card "⏳ Aguardando programação" conta o conjunto errado.** O card em `8760` exibe `tapsStats.aguardando`, definido em `6417` como contagem de `["Aguardando Plano de Trabalho", "Plano de Trabalho recebido", "Pré-agendado"]` — ou seja **não** conta o status `"Aguardando programação"` que o rótulo nomeia. O número exibido descreve outra etapa. **Correção:** alinhar rótulo e conjunto contado.

> **[BAIXO] `setStatusTap` (7603) é código morto.** Definida, nunca chamada — não há controle manual de status na UI. **Correção:** remover, ou expor um controle de override para a Diretoria.

### 1.3 Becos e lacunas no encadeamento

- **`assinarTap` → `Aguardando programação`** (6674) abre o modal de quantitativos (`prog`) apenas para `ehMaster || ehGestorPlanejamento` (6681). Para um `gerente` puro que acabou de assinar, a tela de Atividades **não abre automaticamente** — ele precisa ir manualmente. Médio (UX/encadeamento).
- **Cancelamento em campo sem caminho de UI.** A transição `em_campo → cancelado` existe só no mapa morto (`547`). Não há botão/handler que cancele um projeto em campo e **libere as travas** dos recursos. Médio (ver 3.4).
- **Conclusão depende de RDO atingir 100%.** `concluirProjeto` só é oferecido quando `salvarApontamento` calcula avanço ≥ 100% (7085-7087). Não há botão para concluir manualmente um projeto cujo cálculo de avanço nunca chega a 100 (ex.: quantitativos imprecisos). Médio — projeto pode ficar preso em `Em campo` para sempre, segurando travas.

---

## 2. Abas de entrada de informação

`persist` (6157) é o único escritor de estado e carimba `ABA_DOMINIO[tab]`. `perfil` (6053) = `"master"` p/ diretoria, `"adm"` p/ **todo** alimentador, `"gestao"` p/ o resto. Logo, **qualquer gate `perfil === "master"` exclui os alimentadores de domínio** — esse é o erro recorrente abaixo.

### 2.1 Persistência — OK

Todos os handlers de gravação chamam `persist(...)`: `salvarColab` (6459), `salvarMaq` (6506), `salvarVeic` (6515), `salvarEquip` (6521), `salvarContrato` (6535), `salvarCliente` (6621), `salvarCond` (6554), `salvarCustos` (7514), `salvarPrecos` (7515), `salvarProdutividade` (7516), `salvarRegra` (7539), `salvarTrava` (7108), `salvarDocCell` (6542), `salvarAsoCell` (6548), `salvarSmsCell` (6489), edição da matriz de aptidões (6476 / modal 10740). Nenhum botão de salvar é no-op.

### 2.2 Gates de edição errados (domínio ≠ gate)

> **[ALTO] Contratos: o alimentador Comercial (`dom:"ct"`) não consegue criar/editar/importar/inativar contratos.** Tudo gated `perfil === "master"`: toolbar (~`7839`), empty-state (~`8540`), coluna de ação por linha, modais `novoContrato`/`editarContrato`/`importCt` (`10722-10724`). O helper correto **existe e já é calculado** (`podeEditarCli`/`podeVerValorContrato` em `6058`/`6079` = `podeEditarDominio(user,"ct")`) mas não é usado na escrita de contrato. Contraste: Condicionantes usa corretamente o helper de domínio (`10708`, `8632`). **Correção:** trocar `perfil === "master"` por `ehMaster || podeEditarDominio(user,"ct")`.

> **[ALTO] Regras de Equipe gated pelo domínio ERRADO (`apt` em vez de `custos`).** `ABA_DOMINIO.regras = "custos"`, mas a coluna Editar (`~9246`), o botão (`~9274`) e o modal `regra` (`10756`) usam `podeEditarApt` (= domínio `apt`). Efeito: o alimentador de Eficiência (`dom:"regras"`/`custos`) **não** edita regras de equipe, enquanto o alimentador de Qualidade (`dom:"apt"`) **erroneamente** edita. Inconsistente com a seção de Custos da mesma aba, que usa `podeEd = ehMaster || podeEditarDominio(user,"custos")` (`~9742`). **Correção:** usar `podeEditarDominio(user,"custos") || ehMaster`.

> **[MÉDIO] Aptidões: toolbar (adicionar serviço / importar matriz) gated `perfil === "master"` (`~7821`)** — o alimentador de Qualidade (`dom:"apt"`) não adiciona aptidão nem importa, embora a edição célula-a-célula da matriz (`6476`, gate `podeEditarApt`) seja liberada a ele. Gate internamente inconsistente.

> **[MÉDIO] Clientes empty-state gated em `podeEditarMaq` (domínio de máquinas!).** Em `8429`, quando `clientes.length === 0`, o "+ Novo cliente" só aparece se `podeEditarMaq` (= maq/frota/equip) — erro de copy/paste. A toolbar não-vazia usa corretamente `podeEditarCli` (`7833`). Efeito: Comercial com lista vazia não vê botão de criar; um usuário de Frotas veria.

> **[MÉDIO] Imports em massa todos gated `perfil === "master"`** (importSms, importMatriz, importMaq/Veic/Equip, importCli, importDocs, importCond, novoServico — `10680`-`10751`). Bloqueia os alimentadores donos do domínio de fazerem carga em lote, mesmo podendo editar manualmente. Decisão de política — mas inconsistente com os gates de edição manual.

Gates corretos (sem problema): colab (`podeEditarColab`), SMS (`podeEditarSms`), maq/frota/equip (`podeEditarMaq`), condicionantes, custos params (`podeEd`), localização (somente leitura por design).

### 2.3 Campos coletados e nunca usados / consumidores sem escritor

> **[ALTO] Lógica de rotação/férias/afastamento é consumida mas não tem escritor vivo.** `tempoMaxCampo`, `emCampoDesde`, `ferias`, `afastamentos` são lidos pelo Motor e helpers de status (`naJanela` `5371`-`5372`, sobreposição de cronograma `4964`, `statusRotacao`/`afastAtivo`/`emFerias` `~6378`-`6392`), mas o **único** escritor é o componente `DispEditor` (`1888`-`1962`), que é **código morto** (nunca renderizado; não há `tab === "disp"`, nem `setModal({tipo:"disp"})`, nem `salvarDisp`). O importador vivo `importarPosP` (6555) grava só localização (`localAtual/dataLocal/lat/lng`) e semeia os campos de rotação com defaults (`6558`-`6559`), nunca atualizando-os. **Efeito:** férias/afastamentos sempre vazios e `tempoMaxCampo` sempre 15 — a regra de rotação/férias **nunca dispara pela UI**, e o Motor sempre considera todos disponíveis. **Correção:** renderizar o `DispEditor` (criar a aba `disp`) ou um editor de disponibilidade equivalente, com handler `persist`.

> **[BAIXO] `refMes` (ColabForm)** coletado e persistido (`778`/`838`) mas lido em lugar nenhum. Orphan input.

---

## 3. Bugs de interconexão na cadeia de decisão

### 3.1 Motor / Decisão de alocação

- **3 opções, não 4.** `gerarPreAgendamento` (assinatura `~6828`) monta exatamente 3 viéses: `custo` ("Menor Custo"), `proximidade` ("Maior Proximidade"), `conformidade` ("Conformidade Legal") (`~6857`-`6860`); `opcoes = vieses.map(...)` → `length 3`. Vários comentários ("4 opções") em `6795`, `~6899`, `~6976`, `3447`, `3296` estão **obsoletos**. Baixo (documentação enganosa), mas o peso `W.rota` lido em `melhorPorEstrategia` (`~5459`) nunca existe nos viéses atuais → sempre 0 (latente).

> **[BAIXO] Comentários "4 opções" obsoletos** e leitura de `W.rota` morta. Não afeta runtime; limpar para evitar confusão.

- **Null-handling bom.** `gerarPreAgendamento` retorna `null` se `!tap` (`6830`) e todos os chamadores tratam (`6910`, `6934`, `7559`, `7574`, `7590`). `confirmarPreAgendamento` valida `if (!opcao || !opcao.os) return;` (`7015`-`7016`). `motorAlocar` sempre retorna objeto (`~5697`). Não há deref de `opcao.os` sem guarda. Sem crash conhecido aqui.

- **Pesos das Premissas alimentam o score corretamente:** `base = pesosBase || executivo.pesos || PESOS_PADRAO` (`~6842`); score em `~5446`-`5448`. `salvarExecutivo` (7565) e `salvarProg` (7579) remodelam as opções com `exec.pesos`. OK.

- **Gate de confirmação:** `podeConfirmar = ehMaster || ehGerente` (`~8988`), passado ao `PreAgendamentoCard`. Só Diretoria/Gerente confirma. OK.

### 3.2 LEIA / aceite conjunto

> **[MÉDIO] Master assina os DOIS aceites sozinho, anulando o "aceite conjunto".** Em `10733`, `papelAssinatura = ehMaster ? "ambos" : ...`. `assinarTap` (`6669`-`6675`) só verifica que as duas chaves (`gestorOp`, `gerenteProj`) existem — não que foram assinadas por **pessoas diferentes** — e carimba `por: user?.aba` igual nas duas. Um master conclui o LEIA sozinho. **Correção:** se a dupla-assinatura é requisito de governança, impedir que o mesmo usuário/`por` preencha os dois papéis. Para não-master o split está correto (`gerente` só `gerenteProj`; `dom planos` só `gestorOp`).

> **[MÉDIO] Comercial não consegue criar TAP pela UI, apesar de ter o domínio `tap`.** O gate do modal (`10731`) permite `perfil === "master" || podeEditarDominio(user,"tap")`, mas os **dois** botões "+ Nova TAP" (`~7830` toolbar e `~8682` empty-state) são `perfil === "master"`. Como Comercial tem `perfil === "gestao"`, nenhum botão aparece → `criarTapManual` é inalcançável para o perfil pretendido. **Correção:** liberar os botões com `perfil === "master" || podeEditarDominio(user,"tap")`.

### 3.3 OS / aceite duplo — caminho morto

> **[ALTO] O mecanismo de "aceite duplo" da OS (`gerente` + `rotas`) é morto, e a aprovação real é unilateral.** Três caminhos setam `Em campo` + criam OS `Aprovada`:
> - **(A)** `confirmarPreAgendamento` (`7040`/`7042`) — PRIMÁRIO, via aba Decisão de alocação, gate `ehMaster || ehGerente`.
> - **(B)** `validarCenario` (`7494`) — SECUNDÁRIO, via Cenários, gate `ehMaster || ehGerente`.
> - **(C)** `aceitarOS` (`7501`-`7510`) — exige `aceites.gerente && aceites.rotas`. **Inalcançável de verdade:** o `OSView` que tem os botões de aceite só é aberto a partir do Painel do Gerente (`~10107`) **quando a OS já existe em `ordens`** — e toda OS em `ordens` já nasce `Aprovada` por (A)/(B). Nenhum código insere OS com `status:"Pendente"`. Logo os botões de aceite nunca gatilham nada.
>
> Pior: **o aceite "rotas" é inassinável por design** — `papelAceiteUser` (`~6081`) só concede "rotas" a `podeEditarDominio(user,"loc")`, e **nenhum acesso em `ACESSOS` tem `dom:"loc"`** (`src/constants/acessos.js`). Só o master (que recebe `"ambos"`) consegue. **Efeito:** a governança documentada de dupla aprovação (gerente + rotas/operações) está desligada; quem confirma o pré-agendamento aprova a OS sozinho. **Correção:** decidir o modelo de aprovação — ou remover (A)/(B) e ativar o aceite duplo (atribuindo o domínio `loc` a um perfil de Rotas/Operações), ou remover o `aceitarOS`/`OSView`-aceite morto e documentar a aprovação unilateral.

### 3.4 Travas / recursos órfãos

> **[MÉDIO] Travas automáticas de recurso removido vazam até a conclusão.** `addTrava` (`7025`) cria trava por id de recurso; a limpeza (`concluirProjeto`, `7097`-`7102`) filtra por `idgeo + auto`. Se um colaborador/máquina/veículo for **excluído** enquanto uma OS o segura, a trava fica órfã sob um id inexistente até `concluirProjeto`. Não causa crash (limpeza é por idgeo), mas suja o calendário. **Correção:** ao excluir um recurso, varrer e remover suas travas (ou impedir exclusão de recurso com trava ativa).

> **[MÉDIO] Cancelamento em campo não libera travas (sem caminho de UI).** Como em 1.3: não há handler que execute `em_campo → cancelado`. Um projeto cancelado em campo manteria as travas. **Correção:** adicionar handler de cancelamento que libere as travas automáticas (espelhar `concluirProjeto`).

### 3.5 Autorizações

> **[MÉDIO] Gate de decisão de autorização frouxo para gerente sem carteira.** Botões Aprovar/Negar gated por `ehGestor = ehMaster || ehGerente` (`~9949`), sem rechecar a carteira do item. A restrição por carteira só vem do filtro `visiveis` (`~9901`: `!minhaCarteira || a.carteira === minhaCarteira`), que para um gerente com `user.carteira` vazio fica **true para tudo** → ele vê e decide autorizações de todas as carteiras. Seeds têm carteira, então risco prático baixo. **Correção:** exigir `a.carteira === user.carteira` no gate de decisão.

Criar autorização (`criarAutorizacao` 7045) é aberto a todos os perfis (incl. coordop/operador) — OK por design (`9919` sem gate). Decisão → `decidirAutorizacao` (7058). RDO/`salvarApontamento` acessível a `dom:"prog"` (coordop) — OK (gate `9165`/`10776`). `concluirProjeto` dialog `concluir:` corretamente renderizado e cabeado (`10778`-`10791`).

### 3.6 Outras referências frágeis

- **[BAIXO]** `nEquipe` definido e não usado em `PreAgendamentoCard` (`~3304`). Dead code.
- **[BAIXO]** TAP com cliente não cadastrado: a aba TAPs sinaliza `⚠` (`8792`), mas nada impede o fluxo seguir sem o cliente na base — consistência apenas visual.
- **[BAIXO]** Inconsistência de rótulo de status: OS usa `Concluída`/`Aprovada` e a TAP usa `Concluído`/`Em campo`. Escritas atômicas em um só `persist` mantêm coerência (`7103`-`7104`), mas a divergência de vocabulário é fonte fácil de bug futuro em filtros.
- **[BAIXO]** Aba `colab`: empty-state diz "cadastro realizado pelo perfil Master" (`~7894`), mas o gate real é `podeEditarColab` (domínio `colab`) — texto enganoso. Além disso não há botão "+ Novo colaborador" na toolbar (só Import/Posições); criação manual unitária só via empty-state/edição de linha.

---

## 4. Tabela consolidada de achados

| # | Sev | Linha(s) | Problema | Direção de correção |
|---|---|---|---|---|
| 1 | ALTO | 499-582 | Máquina de estados canônica (ESTADOS_PROJETO/TRANSICOES) morta; `statusTap` usa valores fora de `STATUS_TAP` | Alinhar `STATUS_TAP` aos status reais ou migrar handlers p/ `podeTransicionar`; remover código morto |
| 2 | ALTO | 6417/6419/7203 | `Pré-agendado` filtrado mas nunca setado | Setar o status no pré-agendamento ou trocar filtros |
| 3 | ALTO | 8760 + 6417 | Card "Aguardando programação" conta conjunto que exclui esse status | Alinhar rótulo e contagem |
| 4 | ALTO | ~7839, 8540, 10722-10724 | Comercial (dom `ct`) não cria/edita/importa contrato (gate `perfil==="master"`) | Usar `ehMaster \|\| podeEditarDominio(user,"ct")` |
| 5 | ALTO | ~9246/9274/10756 | Regras de Equipe gated por `apt` em vez de `custos` | Usar domínio `custos` |
| 6 | ALTO | 1888-1962 + 6555 | Editor de disponibilidade morto → férias/afastamento/rotação nunca gravados, mas consumidos pelo Motor | Renderizar `DispEditor` com `persist` |
| 7 | ALTO | 7501-7510, 6081, acessos.js | Aceite duplo da OS morto; `rotas` inassinável (sem dom `loc`); aprovação unilateral | Definir modelo: ativar aceite duplo (criar perfil Rotas) ou remover caminho morto |
| 8 | MÉDIO | 10733, 6669-6675 | Master assina os dois aceites do LEIA sozinho | Impedir mesmo `por` nos dois papéis |
| 9 | MÉDIO | ~7830, 8682, 10731 | Comercial não vê botão "+ Nova TAP" apesar do domínio `tap` | Liberar botões p/ `podeEditarDominio(user,"tap")` |
| 10 | MÉDIO | ~7821 | Aptidões toolbar (add/import) gated `perfil==="master"` | Usar `podeEditarApt` |
| 11 | MÉDIO | 8429 | Clientes empty-state gated `podeEditarMaq` (domínio errado) | Usar `podeEditarCli` |
| 12 | MÉDIO | 10680-10751 | Imports em massa todos `perfil==="master"` | Liberar p/ alimentador do domínio (se for a política) |
| 13 | MÉDIO | 7025/7097 | Travas órfãs ao excluir recurso com OS ativa | Limpar travas na exclusão / bloquear exclusão |
| 14 | MÉDIO | 547 (só mapa morto) | Cancelamento em campo sem UI → travas não liberadas | Handler de cancelamento que libera travas |
| 15 | MÉDIO | ~9901/9949 | Gerente sem carteira decide autorizações de todas | Exigir `a.carteira === user.carteira` no gate |
| 16 | MÉDIO | 6681 / 1.3 | Tela de quantitativos não auto-abre p/ gerente após assinar | Abrir `prog` também p/ gerente |
| 17 | MÉDIO | 7085-7087 | Projeto sem avanço 100% não tem botão de concluir manual | Botão de conclusão manual p/ gestor |
| 18 | BAIXO | 7603 | `setStatusTap` morto | Remover ou expor override |
| 19 | BAIXO | 721-729 | StatusBadge sem cor dedicada p/ status de TAP (só `Em campo`); demais caem em cinza | Mapear cores p/ status de projeto |
| 20 | BAIXO | 6795/3447/~5459 | Comentários "4 opções" obsoletos; `W.rota` morto | Limpar |
| 21 | BAIXO | 778/838 | `refMes` coletado e nunca lido | Remover ou consumir |
| 22 | BAIXO | ~3304 | `nEquipe` dead code | Remover |
| 23 | BAIXO | ~7894 | Texto empty-state colab enganoso | Corrigir cópia |

---

## 5. Plano de ajustes para o beta

### Bloqueadores (corrigir ANTES do beta)

1. **Gate de Contratos (#4)** — sem isso o perfil Comercial não opera contratos, quebrando a ponta Cliente→Contrato→TAP. Correção trivial e de alto impacto.
2. **Gate de Regras de Equipe (#5)** — domínio errado deixa as regras do Motor ineditáveis por quem deveria, e editáveis por quem não deveria.
3. **Disponibilidade morta (#6)** — o Motor sempre trata todos como disponíveis (férias/afastamento ignorados). Compromete a confiabilidade da Decisão de alocação, que é o coração do produto. Mínimo: expor um editor que grave esses campos.
4. **Comercial não cria TAP (#9)** — beco na ponta de entrada do fluxo; Comercial é o perfil que deveria abrir TAPs.
5. **Aprovação da OS (#7)** — decidir e documentar o modelo (unilateral vs. duplo). Hoje o desenho documentado (duplo aceite) está desligado e o `rotas` é inassinável; isso confunde governança e auditoria.
6. **Consistência de status (#1, #2, #3)** — pelo menos alinhar `STATUS_TAP` aos valores reais e corrigir o filtro/contagem do card "Aguardando programação" e o status fantasma `Pré-agendado`, para que filtros/Dashboard/Inteligência não escondam projetos.

### Melhorias (podem entrar logo após o beta)

- Master assinando os dois aceites do LEIA (#8) — governança.
- Gates de Aptidões/Clientes/Imports (#10, #11, #12) — consistência de permissão.
- Travas órfãs e cancelamento em campo (#13, #14) — higiene de recursos.
- Decisão de autorização por carteira (#15).
- Auto-abertura da tela de quantitativos p/ gerente (#16) e conclusão manual (#17) — fluidez.
- Limpezas de código morto e cópia (#18-#23) — manutenção.

### Recomendação arquitetural

A existência da máquina canônica `ESTADOS_PROJETO`/`TRANSICOES_PROJETO` (já com papéis e dados exigidos por transição) indica que o caminho certo é **fazer os handlers passarem por `podeTransicionar`** em vez de mutar `statusTap` à mão. Isso resolveria de uma vez #1, #2, #3, #7, #14, #15 e #16, porque centralizaria as regras de quem-pode-fazer-o-quê e os efeitos colaterais (incl. liberação de travas). Para o beta, porém, o caminho de menor risco é corrigir pontualmente os bloqueadores acima; a unificação fica como dívida técnica priorizada para a versão seguinte.
