# GeoópS — Resumo Executivo do Sistema

**Sistema de Gestão Operacional Inteligente · GEOAMBIENTE S/A · www.geoops.ia.br**

---

## O que é

O GeoópS é o sistema que conduz um projeto de engenharia ambiental **do contrato ao encerramento em um único trilho**, decidindo a composição dos times de campo pelo equilíbrio de **três pilares: PRAZO, CUSTO e LOGÍSTICA**. Ele combina:

- **Máquina de estados canônica** (14 estados) — cada projeto (IDGEO) tem sempre um estado válido e um próximo passo indicado (Esteira).
- **Motor de alocação** — monta o cenário ótimo de equipe/máquinas/veículos/equipamentos a partir de aptidões, disponibilidade, posições do dia, custos unitários e regras de composição; permite ajuste manual, múltiplos recursos e **terceirização** (parcial ou total, com custo obrigatório).
- **Inteligência (IA Claude)** — lê contratos/DFP, TAPs e planos (PDF/Excel), gera o **parecer técnico-jurídico obrigatório**, e opera três frentes sobre o snapshot completo do sistema: **Diagnóstico** executivo, **Ações sugeridas** (incluindo soluções "fora da caixa" com a conta demonstrada) e **Chat**. Respeita as **Diretrizes da empresa** (violações → auditoria + e-mail aos diretores) e segue os **Procedimentos** (POPs).
- **Execução governada** — dupla assinatura no LEIA, duplo aceite da OS, travas automáticas de recursos, **RDO diário imutável** (jornada 8h48 + 1h almoço, km e quantitativos obrigatórios, ocorrências com causa de atraso), autorizações com efeitos reais (trava de veículo + custo no IDGEO), aditivos com impacto recalculado.
- **KPIs em 3 níveis** — Dashboard (gestão × campo), aba KPIs por projeto (avanço real × esperado, **custo Orçado DFP × Realizado**, alarmes de atraso e performance, ocupação de recursos), Painel do gerente por carteira.

## Capacidades (o que o sistema entrega hoje)

1. **Fluxo ponta a ponta sem re-digitação**: contrato → TAP → LEIA → plano → alocação → OS → RDO → KPIs → conclusão, com aprovações concentradas numa caixa única.
2. **Decisão de alocação auditável**: cenário do Motor + edição de recursos + recálculo de custo em tela + terceirização gated ao Gerente Operacional.
3. **Verdade de campo**: RDO imutável com trilha própria (banco definitivo `rdo_log`), ocorrências estruturadas que explicam atrasos e alimentam a IA.
4. **Custos fechando o ciclo**: orçado (COGs do DFP lidos pela IA; fallback Motor) × realizado (recursos alocados × RDOs acumulados + custos extras de autorizações + km real).
5. **Governança**: diretrizes com regras duras/suaves, violações auditáveis com e-mail à diretoria, pareceres e RDOs preservados permanentemente, logins registrados, permissões por usuário aplicadas no login.
6. **IA com contexto total e custo controlado**: snapshot completo com prompt caching; endpoint com streaming (sem timeouts); ~US$ 8-12/mês no uso típico.
7. **Multi-dispositivo**: com Supabase conectado, o estado vive no Postgres (cópia local como fallback offline).

## Limitações conhecidas (transparência)

1. **Concorrência simples**: o estado operacional é um documento único — dois usuários editando simultaneamente prevalece o último a gravar (mitigado pelo debounce e pela divisão de domínios por papel). Evolução natural: gravação por tabela/linha.
2. **Autorizações em tempo real**: a solicitação criada num aparelho chega ao gestor quando o estado sincroniza (Supabase conectado); sem Supabase, fica local ao aparelho.
3. **Localização**: posições de pessoas/veículos são importadas (ponto/GPS) ou digitadas — não há rastreamento automático embarcado.
4. **IA lê PDF e Excel/CSV** — arquivos Word (.docx) precisam ser convertidos para PDF ou colados como texto.
5. **E-mail** depende do provedor configurado (Resend/SMTP); sem configuração, avisos ficam só no sistema.
6. **Distâncias logísticas** usam gazetteer/matriz rodoviária embutida — trechos muito fora das rotas mapeadas caem em estimativa.
7. **Hora extra aprovada** lança custo pela média HH × 1,5; o espelho fino (HE 100%/noturno) vem do RDO.

## Auditoria final — encadeamento de processos (síntese)

A auditoria varreu o trilho completo e a cobertura de KPIs por nível hierárquico. O fluxo canônico está íntegro (estados, gates de assinatura, travas, custos e IA conectados). Os pontos de atenção priorizados — já tratados ou listados como próximos ajustes — são:

**Cobertura por nível hierárquico**

| Nível | Já atende | Lacunas priorizadas |
|---|---|---|
| **Diretoria** | Dashboard executivo, KPIs orçado×realizado, ocupação/gargalos, violações, Admin | Falta recorte **por carteira** (comparativo GC01×GC08) e card de violações no Dashboard |
| **Gerência** | Caixa de aprovações, Painel da carteira, decisão de autorizações por carteira | KPIs/Esteira sem filtro de carteira; visão de gestão do Dashboard não inclui o gerente; Painel mostra só custo previsto (não o realizado) |
| **Coordenação/Campo** | RDO completo, aditivos, autorizações, metas sem cifras | Alguns painéis com R$ no Dashboard visíveis a perfis de campo (vazamento a corrigir com gate `podeGestao`); visão de campo poderia mostrar realizado×meta da própria frente |

**Top 5 ajustes recomendados (backlog imediato)**
1. Filtro/coluna de **carteira** nos KPIs e Dashboard (gerente entra com default na própria carteira).
2. **Gate de custos** nos painéis com R$ do Dashboard (fechar vazamento ao campo).
3. Incluir o **gerente na visão de gestão** e trazer orçado×realizado ao Painel do gerente.
4. **Filtrar LEIA e pré-agendamento por carteira** na Caixa de aprovações (como já ocorre com autorizações).
5. Card executivo **por carteira + violações abertas** no Dashboard da diretoria; realizado×meta (sem R$) na visão de campo.

## Operação e implantação

- **Código**: GitHub (`everton-rgb/geoops`), deploy automático no Vercel a cada merge na `main`.
- **Banco**: Supabase (schema em `supabase/schema.sql`; módulo `src/services/db.js`). Dados **permanentes**: RDOs, pareceres de TAP, violações, diretrizes, procedimentos, logins, usuários. Dados **temporários**: estado operacional vivo (sobrescrito; zerável pela Diretoria com preservação dos permanentes).
- **Conexões**: Anthropic (IA, streaming), Resend/SMTP (e-mail), domínio www.geoops.ia.br — passo a passo no `docs/MANUAL_DE_CONEXOES.md`.
- **Uso**: manual aba a aba no `docs/MANUAL_DO_USUARIO.md`.
