# GeoópS V2.0.0 — App de Campo (Android)
### Check-in/checkout por GPS · Cerca eletrônica · RDO do líder · Produtividade em tempo real

> **Status**: projeto aprovado para planejamento — este documento é a especificação de referência.
> **Escopo**: conexão direta com os líderes de campo (encarregados, supervisores, líderes de sondagem, amostradores), substituindo a importação manual de posições (aba Localização) e o lançamento de RDO pelo escritório. A aba RDOs do GeoópS passa a ser **conferência e validação final** do Gestor de Operações.

---

## 1. Avaliação de viabilidade — como ter o app em todos os celulares

Existem três caminhos; a recomendação é fazê-los **em fases, na ordem, reaproveitando 100% do código**:

| Caminho | O que é | Esforço | Limitações |
|---|---|---|---|
| **A. PWA "Modo Campo"** (recomendado — Fase 1) | O GeoópS já é um PWA (Vite + service worker). Criamos o **Modo Campo** dentro dele: o líder instala pelo Chrome ("Adicionar à tela inicial") e o app abre direto na jornada do dia. | Baixo — mesma base de código, mesmo deploy Vercel | GPS e câmera funcionam perfeitamente **com o app aberto**; não rastreia em segundo plano |
| **B. TWA na Play Store** (Fase 3) | O mesmo PWA empacotado como app Android (Trusted Web Activity, via Bubblewrap). Aparece na **Play Store** com o ícone da GEOAMBIENTE — instalação corporativa padronizada. | Baixo (empacotamento + conta Play Console US$ 25) | Mesmas do PWA (é o mesmo código) |
| **C. App nativo/Capacitor** (Fase 4 — só se necessário) | O PWA embrulhado em Capacitor com plugin de **geolocalização em segundo plano**. | Médio | Necessário APENAS se a cerca eletrônica precisar rastrear com o app fechado |

**Ponto honesto sobre a "cerca eletrônica":** no PWA/TWA, a posição é capturada **nos eventos** (check-in, checkout, e pings periódicos enquanto o app está aberto). Isso cobre o controle proposto — chegada, almoço, retorno, saída, com coordenada e horário — e detecta check-in fora da cerca. **Rastreamento contínuo com o app fechado** só com o caminho C (e tem implicações trabalhistas/LGPD — ver §8). Recomendo lançar com A+B e decidir o C com dados reais de uso.

---

## 2. A jornada do líder de campo (Modo Campo)

Login por e-mail (Supabase) com o novo papel **"campo"**, vinculado à matrícula do colaborador. O app abre já mostrando **o projeto (IDGEO) do dia** (vem da OS aprovada em que o líder está escalado).

```
06:50  📍 CHECK-IN CHEGADA        → GPS + horário + SELFIE + FOTO DOS EQUIPAMENTOS
                                    valida a cerca eletrônica (raio do site do projeto)
12:00  🍽 CHECKOUT ALMOÇO          → GPS + horário
13:00  📍 CHECK-IN RETORNO         → GPS + horário (sem foto)
17:30  🏁 CHECKOUT SAÍDA + RDO     → GPS + horário + RDO completo do dia:
                                    quantitativos por atividade (mesma tela atual do RDO
                                    mobile), km, ocorrências, não conformidades, obs.
```

Regras da jornada:
- A sequência é **guiada e travada**: não há checkout de saída sem check-in de chegada; o RDO é obrigatório no checkout de saída.
- Cada evento grava: matrícula, IDGEO, tipo, timestamp do servidor, lat/lng, precisão do GPS, e flag **dentro/fora da cerca**.
- Horas do dia (jornada, HE, intervalo) são **calculadas automaticamente** dos eventos — alimentam o custo realizado e o ranking de produtividade sem digitação.
- **Offline-first**: sem sinal no site, os eventos e fotos entram numa fila local (IndexedDB) e sincronizam sozinhos quando a conexão volta — com o timestamp original preservado.

## 3. Cerca eletrônica (geofence)

- Cada projeto ganha **coordenada do site + raio** (padrão 500 m, configurável por IDGEO na TAP/programação; a coordenada pode vir do primeiro check-in validado pelo gestor).
- No check-in/checkout o app calcula a distância (Haversine) até o site:
  - **Dentro** → evento normal (verde).
  - **Fora** → o evento é aceito mas marcado **⚠ fora da cerca** com a distância; o líder informa o motivo (ex.: base de apoio, hotel, deslocamento entre frentes).
- Alertas em tempo real no GeoópS: Dashboard e Inteligência mostram check-ins fora da cerca, ausência de check-in até horário-limite, e checkout sem RDO. Violações entram no snapshot da IA.

## 4. O que muda no GeoópS web (visão do gestor)

| Aba | Antes | Depois (V2) |
|---|---|---|
| **Localização** | Importação manual de planilha do ponto/GPS | Alimentada **automaticamente** pelos check-ins, em tempo real (Supabase Realtime). Importação manual vira contingência. |
| **RDOs** | Lançamento manual pelo escritório | **Conferência e validação**: o RDO do líder chega como "🕓 Aguardando validação"; o Gestor de Operações **aprova** (vira apontamento definitivo + rdo_log imutável) ou **devolve com motivo** (o líder corrige no app). Lançamento manual permanece como contingência, marcado como tal. |
| **KPIs / Dashboard** | Produtividade consolidada ao validar | **Produtividade diária em tempo real**: realizado do dia aparece assim que o líder faz o checkout (marcado "não validado" até o aceite do gestor). |
| **Autorizações** | já existe | O líder solicita HE/hospedagem/veículo direto do app. |

## 5. Modelo de dados (Supabase)

```sql
-- eventos de jornada (só-inserção; RLS: líder insere apenas os próprios)
create table campo_eventos (
  id uuid primary key default gen_random_uuid(),
  mat text not null, idgeo text not null,
  tipo text not null check (tipo in ('checkin','checkout_almoco','checkin_retorno','checkout_saida')),
  ts timestamptz not null default now(), ts_dispositivo timestamptz,
  lat double precision, lng double precision, precisao_m real,
  dentro_cerca boolean, dist_cerca_m real, motivo_fora text,
  selfie_path text, foto_equip_path text,       -- Supabase Storage (bucket campo-fotos)
  criado_por uuid references auth.users(id)
);

-- RDO do líder (rascunho → validação)
create table campo_rdos (
  id uuid primary key default gen_random_uuid(),
  mat text not null, idgeo text not null, data_rdo date not null,
  payload jsonb not null,                        -- mesmo shape do apontamento atual
  status text not null default 'aguardando' check (status in ('aguardando','validado','devolvido')),
  validado_por text, validado_em timestamptz, motivo_devolucao text,
  unique (mat, idgeo, data_rdo)
);

-- cerca por projeto
create table cercas_projeto (
  idgeo text primary key, lat double precision, lng double precision,
  raio_m integer not null default 500, definido_por text, em timestamptz default now()
);
```
- **Fotos**: bucket privado `campo-fotos` (Storage), compressão no cliente (~200 KB), retenção 12 meses (política LGPD), URL assinada só para gestores.
- **RLS**: papel "campo" insere/lê apenas os próprios registros; gestores/diretoria leem tudo; `campo_eventos` é só-inserção (trilha de auditoria, como o rdo_log).
- **Realtime**: canal em `campo_eventos` → Localização/Dashboard atualizam ao vivo.

## 6. Fases e entregas

| Fase | Entrega | Critério de aceite |
|---|---|---|
| **F0 — Fundações** | Tabelas + Storage + RLS + papel "campo" no login/grid do Admin; cerca por IDGEO cadastrável | Líder de teste loga e só enxerga o Modo Campo |
| **F1 — Modo Campo (PWA)** | Jornada completa (4 eventos + fotos + GPS + RDO no checkout) com fila offline | Dia completo de campo registrado sem sinal, sincronizado depois; RDO chega "aguardando" |
| **F2 — Gestor + tempo real** | Validação/devolução de RDO na aba RDOs; Localização automática; produtividade do dia no Dashboard/KPIs; alertas de cerca | Gestor valida pelo desktop; posição aparece ao vivo; check-in fora da cerca gera alerta |
| **F3 — Play Store** | TWA publicado (ícone GEOAMBIENTE), push notification de devolução de RDO e lembrete de check-in | App instalado da Play Store nos celulares dos líderes |
| **F4 — (decisão futura)** | Capacitor + GPS em segundo plano, se o controle exigir | — |

Sequência de versões: F0+F1 = **V2.0.0-beta** (validação com 2–3 líderes reais) → F2 = **V2.0.0** na main → F3 = V2.1.0.

## 7. Desenvolvimento seguro

Como no módulo de Orçamentação: **desenvolvimento em branch/ambiente separado** (`app-campo`, preview próprio do Vercel), sem tocar a produção até a validação do beta. O Modo Campo é o mesmo bundle (renderização condicional pelo papel do usuário) — sem fork de código.

## 8. LGPD e relações de trabalho (obrigatório tratar antes do go-live)

- Coleta de localização **somente nos eventos de jornada** (política clara, sem rastreamento fora do expediente) — é também o argumento para adiar o caminho C.
- Termo de consentimento no primeiro login do app (registrado com data/versão do termo).
- Selfie usada só para comprovação de presença; retenção limitada; acesso restrito a gestores.
- Recomenda-se validação do texto do termo com o jurídico antes do beta.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| GPS impreciso em área industrial/mata | Gravar a precisão; cerca com tolerância (raio + precisão); motivo de fora da cerca |
| Sem sinal no site | Fila offline com timestamp do dispositivo + carimbo do servidor na sincronização |
| Líder sem familiaridade | Jornada guiada de 1 botão por vez; treinamento com o manual do usuário |
| Foto pesada / plano de dados | Compressão no cliente; upload adiado para Wi-Fi opcional |
| Fraude de posição (mock GPS) | Registro da precisão + horário do servidor + selfie; auditoria de padrões pela IA |
