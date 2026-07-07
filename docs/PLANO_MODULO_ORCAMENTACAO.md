# GeoópS — Módulo de Orçamentação (DFP · PPU · DRE)

**Ambiente**: branch `modulo-orcamentacao` (cópia completa do sistema validado, desenvolvimento isolado — a `main`/produção não é tocada até a validação final).
**Referência de modelo**: planilha `ORÇAMENTO TP RJ_INVESTIGAÇÃO RITM0547926_2470.26_REV00` (Simulação Base RJ), decodificada abaixo.

---

## 1. O que a planilha de referência faz (modelo extraído)

A planilha é um DFP completo em 5 abas encadeadas:

### 1.1 `Custo Direto` — CD em 3 blocos
| Bloco | Seções | Como calcula |
|---|---|---|
| **1 — Pessoal próprio** | 1.1 MOD (equipe de campo) · 1.2 HE MOD · 1.3 MOI (gestão/produção técnica) · 1.4 HE MOI · 1.5 Refeições · 1.6 Transporte · 1.7 Outros benefícios | Horas por função (vindas da aba **Metas**) × salário/hora (jornada mensal 184,8 h) × (1 + periculosidade 30%) × (1 + **encargos**: 83% MOD · 79% MOI · 0% PJ) + benefícios por quantidade × dedicação % × custo unitário |
| **2 — Serviços subcontratados** | 2.1 Análises químicas (água/solo/vapores/PSG por laboratório) · 2.2 Logística de amostras · 2.3 Gestão de resíduos · 2.4 Rotopneumática · 2.5 Topografia · 2.6–2.10 livres | Quantidade × custo unitário (tabela de fornecedores) |
| **3 — Custos operacionais da obra** | 3.1 Veículos/Máquinas (Unid×Mês) · 3.2 Equipamentos · 3.3 Manutenção/Calibração · 3.4 Materiais de consumo · 3.5 EPIs · 3.6 SMS/Exames · 3.7 Combustível (km, L/consumo, R$/L) · 3.9 Hospedagem · 3.10 Base operacional · 3.8/3.11–3.16 livres | Quantidade × tempo de uso × custo unitário |

### 1.2 `Metas` — a CALIBRAGEM (o coração do rateio)
Matriz **serviço × função**: para cada linha de serviço (com quantidade), a meta de produtividade de cada função (Equipe de Sondagem, Técnico de Campo, Equipes de Amostragem, Gerente, Coordenadora, Analistas I/II, Assistente, Elaborador, Ger. Prod. Técnica, Revisor, Desenhista, Especialista).
`dias da função no serviço = quantidade ÷ meta` → soma por função = **horas de MOD/MOI** que alimentam o bloco 1 — e é o que o usuário "calibra" para cada caso.

### 1.3 `BDI` — do CD ao preço (DFP)
```
CD (3.821.640,98)
C1  Custos Indiretos  = 12%  × CD                      (overhead)
C2  Lucro             = 31,05% × (CD + C1)
C3  Despesas          = 2% contingência × (CD+C1) + comerciais + financeiro
C4  Impostos "por dentro" sobre o PREÇO: PIS 1,65% + COFINS 7,6% + ISS 5%
    (+ Petronect/IRPJ/IRRF/CSLL configuráveis) = 14,25%
PREÇO = (CD + C1 + C2 + C3) ÷ (1 − 14,25%) = 6.641.243,06
```

### 1.4 DRE embutido (indicadores)
ROB 6.641.243 → (−) tributos 946.377 → **ROL** 5.694.866 → (−) COGS (=CD) 3.821.641 → **MC** 1.873.225 (32,89%) → (−) custo Geoambiente (C1+C3) 544.202 → **EBITDA** 1.329.023 (23,34%) → (−) D&A 272.291 → **EBIT** 1.056.732 (18,56%). K de venda = PV/CD = **1,74**.

### 1.5 `PPU` — preço de venda por item
Cada linha de serviço: custo unitário (CD rateado pelo driver de metas) + **margem-alvo por linha** (19% serviços próprios · 9% repasse de análises subcontratadas — calibrável) → preço unitário de venda, subtotais e representatividade. É o documento comercial entregue ao cliente.

### 1.6 `Comparativo | Resumo` — capa executiva (Resumo CD + BDI + DRE)

**Golden test para validar o módulo** (o motor deve reproduzir estes números com os mesmos insumos): CD = 3.821.640,98 · Preço = 6.641.243,06 · Resultado = 20,01% · MC% = 32,89% · EBITDA% = 23,34% · EBIT% = 18,56% · K = 1,74.

---

## 2. Arquitetura do módulo no GeoópS

### 2.1 Nova aba `💰 Orçamentos` (grupo Comercial)
Sub-abas espelhando a planilha: **Custo Direto** · **Calibragem (Metas)** · **DFP/BDI** · **PPU** · **DRE/Resumo**.

### 2.2 Entidade `orcamento` (base orçamentária ÚNICA por Cliente/Escopo/Projeto/Orçamento)
```js
{
  id: "orc_...", codigo: "ORC-2026-001", revisao: "REV00",
  cliente, contratoId?, escopo, projeto, oportunidade, responsavel, dataElaboracao,
  status: "rascunho" | "emitido" | "aprovado" | "convertido" | "perdido",
  /* ===== BASE CALIBRADA — snapshot + overrides, GRAVADA e imutável após emissão ===== */
  calibragem: {
    jornadaMensalH: 184.8, meses, horasExtras,
    encargos: { mod: 0.83, moi: 0.79, pj: 0 }, periculosidade: 0.30,
    funcoes: [ { id, nome, salarioBase, tipo: "MOD"|"MOI"|"PJ", origem: "cargo GeoópS"|"manual" } ],
    metas:   [ { servicoId, funcaoId, meta } ],           // matriz serviço × função
    custosEspecificos: [ { descricao, secao, qtd, unid, uso, custoUnit } ], // blocos 2 e 3
    bdi: { overheadPct: 0.12, lucroPct: 0.3105, contingenciaPct: 0.02,
           comerciaisPct, financeiroPct,
           impostos: { pis: 0.0165, cofins: 0.076, iss: 0.05, petronect, irpj, irrf, csll } },
    margemPorCategoria: { servicos: 0.19, repasse: 0.09 },
  },
  servicos: [ { item: "1.1.1", descricao, unidade, qtd } ],  // escopo orçado
  /* ===== SAÍDAS derivadas (recalculadas do zero a cada edição, congeladas na emissão) ===== */
  saidas: { custoDireto: {...}, dfp: {...}, ppu: [...], dre: {...} },
}
```
Revisão = clonar orçamento (REV01…) mantendo o anterior gravado. Emitido/aprovado = **imutável** (mesma régua do RDO/pareceres).

### 2.3 De onde vêm os dados (base GeoópS existente)
| Insumo do orçamento | Fonte no GeoópS |
|---|---|
| Salários por função (MOD/MOI) | **Cadastros → Equipe**: média de `custoTotal`/`salarioBase` por cargo (com override manual na calibragem) |
| Metas de produtividade default | **Eficiência → Metas** (produtividade por serviço) |
| Custos unitários de serviços | **Eficiência → Custos Unitários** (PPU interna) |
| Diárias/depreciação/hospedagem/alimentação/km | **Eficiência → Parâmetros Complementares** (incl. customizados) |
| Composição de equipe por serviço | **Eficiência → Dimensionamento** (papéis × nível × quantidade) |
| Veículos/máquinas/equipamentos e custos mensais | **Frota / Máquinas / Equipamentos** |
| Distâncias p/ mobilização e combustível | matriz de cidades do Motor (`distEntreCidades`) |
| Catálogo de serviços | `ATIVIDADES` + serviços custom |

### 2.4 Motor de cálculo (`src/services/orcamento.js` — puro, testável)
1. `horasPorFuncao(servicos, metas)` → dias/horas por função (matriz Metas).
2. `custoPessoal(horas, funcoes, encargos, periculosidade, beneficios)` → bloco 1.
3. `custoSubcontratados(custosEspecificos)` → bloco 2. `custoOperacional(...)` → bloco 3.
4. `aplicarBDI(cd, bdi)` → C1..C4 + gross-up por dentro → preço final (DFP).
5. `montarPPU(servicos, rateio, margemPorCategoria)` → preço unitário por linha.
6. `montarDRE(preco, impostos, cd, c1, c3, depreciacao)` → ROB/ROL/MC/EBITDA/EBIT/COGS%.
Golden test automatizado com os números da planilha RITM0547926 (§1.6).

### 2.5 Saídas
- Tela DFP + PPU + DRE (mesmo padrão visual das abas atuais);
- **Exportação Excel** (SheetJS já usada no sistema) no layout das 5 abas e **PDF** (mesmo padrão do parecer da TAP);
- Ao **aprovar/converter**: cria/vincula o contrato no Comercial com `cogsTotal` = COGS do orçamento (vira o **orçado oficial** dos KPIs via `orcadoDoProjeto`), e a PPU do orçamento alimenta os Custos Unitários do projeto.

### 2.6 Persistência (Supabase)
Nova tabela **permanente** `orcamentos` (id, codigo, revisao, cliente, projeto, status, dados JSONB, criado_em/por) — só-inserção após emissão (imutável, como `pareceres_tap`); rascunhos podem ser atualizados. Réplica no `linhasPermanentes` do `db.js` + RLS no `schema.sql`.

---

## 3. Roteiro de desenvolvimento (neste sandbox)

| Fase | Entrega | Validação |
|---|---|---|
| **F1** | Motor de cálculo puro + golden test da planilha RITM0547926 | números batem com §1.6 |
| **F2** | Aba Orçamentos: CRUD + calibragem (metas/salários/BDI/impostos) puxando a base GeoópS | criar orçamento novo do zero em <30 min |
| **F3** | Saídas DFP/PPU/DRE em tela + exportação Excel/PDF | comparação lado a lado com a planilha |
| **F4** | Conversão orçamento→contrato (COGs/KPIs) + tabela `orcamentos` no Supabase | fluxo Comercial→TAP herda o orçamento |
| **F5** | Merge na `main` após validação do usuário no preview | deploy produção |

**Regra do ambiente**: todo o desenvolvimento acontece nesta branch (`modulo-orcamentacao`), que o Vercel publica como *preview* próprio — a produção continua espelhando a `main` validada. A integração ao Supabase só ocorre na F4/F5, quando a base estiver instalada e validada.
