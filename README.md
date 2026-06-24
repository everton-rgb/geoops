# GeoópS — Guia de Publicação (Beta PWA no Vercel)

Este pacote contém o sistema **GeoópS** pronto para publicar na web como
**PWA** (aplicativo instalável no celular) usando o domínio **geoops.ia.br**.

> **O que é esta versão:** beta de demonstração. Os dados ficam salvos no
> navegador de cada usuário (localStorage). É ideal para o time navegar, testar
> os fluxos e dar feedback. Para dados compartilhados entre várias pessoas e
> login seguro, o próximo passo é conectar o Supabase (ver final deste guia).

> **Funcionalidades que ganham vida no deploy:** três recursos que não funcionam
> no preview (por falta de internet) passam a funcionar quando publicado no Vercel:
> - **🗺 Mapa de localização** (Leaflet/OpenStreetMap) — visualiza equipes e veículos
> - **📊 Importação de TAPs por upload de Excel** (.xlsx) — lê a planilha direto
> - **🤖 Análise de contratos por IA** — requer conectar a chave da API da Anthropic
>   (ver seção "Ativar a IA" no final). Sem a chave, o anexo é salvo e a análise
>   fica pendente para quando a API estiver conectada.

---

## Módulos do sistema (13 abas)

Dashboard (com cartões coloridos de projetos ativos) · Equipe (custo segmentado +
sócios) · Aptidões (com cobertura crítica) · SMS (NRs + documentos + ASOs) ·
Comercial (clientes + contratos + condicionantes, com anexo de contrato e IA) ·
TAPs (importação por colagem ou Excel) · Programação · Regras · Custos (preços
unitários + diárias + metas de produtividade) · **Inteligência** (Motor de
Alocação + Simulação de Cenários) · Máquinas · Frota · Equipamentos · Localização
(com painel de equipes em campo).


---

## Conteúdo do pacote

```
geoops/
├── index.html            # página base (fontes, PWA, meta tags)
├── package.json          # dependências e scripts (Node >= 18)
├── vite.config.js        # configuração do Vite + PWA
├── vercel.json           # configuração de deploy no Vercel
├── readme.txt            # guia rápido de execução e publicação
├── .gitignore
├── api/
│   └── analisar.js       # função serverless: ponte segura com a IA (Anthropic)
├── public/
│   ├── icon-192.png      # ícone do app (telas iniciais)
│   └── icon-512.png      # ícone do app (alta resolução)
└── src/
    ├── main.jsx          # ponto de entrada + persistência (localStorage)
    ├── App.jsx           # o sistema GeoópS completo
    └── constants/        # tabelas e parâmetros fixos (Fase 1 da migração)
        ├── base.js  equipe.js  atividades.js  sms.js  comercial.js
        ├── taps.js  frota.js  maquinas.js  equipamentos.js
        └── localizacao.js  acessos.js  motor.js  seed.js
```

---

## Opção A — Publicar pelo site do Vercel (mais simples, sem instalar nada)

### Passo 1 — Criar conta no Vercel
1. Acesse **https://vercel.com** e clique em **Sign Up**.
2. Pode entrar com sua conta Google ou GitHub. É gratuito.

### Passo 2 — Subir o projeto
1. No painel do Vercel, clique em **Add New… → Project**.
2. Escolha **Deploy** a partir de um arquivo/pasta. Se pedir um repositório,
   use a opção de importar pasta ou arraste a pasta `geoops-app` inteira
   (compacte em .zip se necessário).
3. O Vercel detecta automaticamente que é um projeto **Vite**. Não mude nada:
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy** e aguarde 1–2 minutos.

### Passo 3 — Receber o link
Ao terminar, o Vercel mostra um link tipo **https://geoops.vercel.app**.
Abra no navegador: o GeoópS já está no ar. 🎉

### Passo 4 — Conectar o domínio geoops.ia.br
1. No projeto, vá em **Settings → Domains**.
2. Digite **geoops.ia.br** e clique em **Add**.
3. O Vercel mostrará 1 ou 2 registros DNS (tipo **A** ou **CNAME**) para
   configurar. Anote-os.
4. Acesse o painel onde você registrou o domínio (registro.br ou seu provedor),
   vá em **Editar DNS / Zona DNS** e adicione os registros que o Vercel pediu:
   - Normalmente um registro **A** para `@` apontando para o IP do Vercel,
     **ou** um **CNAME** para `cname.vercel-dns.com`.
   - Para o `www`, um **CNAME** apontando para o Vercel.
5. Salve. A propagação leva de alguns minutos a algumas horas.
6. Quando o Vercel mostrar **Valid Configuration**, o sistema estará em
   **https://geoops.ia.br** com HTTPS automático.

---

## Opção B — Publicar pela linha de comando (para quem tem Node.js)

```bash
# 1. Entre na pasta do projeto
cd geoops-app

# 2. Instale as dependências
npm install

# 3. Teste localmente (abre em http://localhost:5173)
npm run dev

# 4. Gere a versão de produção (opcional, para conferir)
npm run build
npm run preview

# 5. Publique no Vercel
npm install -g vercel    # instala o CLI do Vercel (só na 1ª vez)
vercel login             # faça login
vercel --prod            # publica em produção
```

Depois, conecte o domínio geoops.ia.br como no **Passo 4** da Opção A.

---

## Instalar como aplicativo no celular (PWA)

Depois que o site estiver no ar (em geoops.ia.br):

**iPhone (Safari):**
1. Abra **geoops.ia.br** no Safari.
2. Toque no ícone de **compartilhar** (quadrado com seta para cima).
3. Escolha **Adicionar à Tela de Início**.
4. O ícone do GeoópS aparece na tela, abrindo em tela cheia como um app.

**Android (Chrome):**
1. Abra **geoops.ia.br** no Chrome.
2. Toque no menu (⋮) e escolha **Instalar aplicativo** (ou aparece um aviso
   automático "Adicionar à tela inicial").
3. Confirme. O app é instalado como um aplicativo nativo.

---

## Login da beta

O sistema entra pela tela de login, com acesso **por aba/matriz**.
As senhas iniciais (protótipo) são:

| Acesso | Senha |
|---|---|
| Diretoria (acesso total) | geoops |
| RH / Aptidões (Aline) | aline |
| SMS & NRs (Maíra) | maira |
| Condicionantes (Humberto) | humberto |
| Programação (André) | andre |
| Regras / Contratos (Jony) | jony |
| Frota / Máquinas (Franzine) | franzine |
| TAPs (Kassiane) | kassiane |
| Equipamentos | equip |
| Localização | loc |
| Carteiras GC01–GC08 | gc01 … gc08 |

> ⚠️ **Importante sobre segurança:** nesta beta, as senhas e os dados ficam
> apenas no navegador do usuário. **Não insira dados sensíveis reais** ainda.
> A segurança de verdade vem no próximo passo (Supabase).

---

## Ativar a IA (análise de contratos)

A análise de contratos por IA chama a API da Anthropic através da função
serverless `api/analisar.js` (já incluída neste repositório), que guarda a
chave no servidor e repassa a chamada — a chave **nunca** fica exposta no
navegador. Para ativar no deploy:

1. No Vercel: **Settings → Environment Variables → adicionar**
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: sua chave da Anthropic (começa com `sk-ant-...`)
2. Faça **Redeploy** para o projeto reler a variável.

Enquanto a IA não está conectada, o anexo do contrato é salvo normalmente e a
análise fica marcada como pendente — nenhum dado se perde.

## Próximo passo — De beta para produto real (Supabase)

Quando quiser dados **compartilhados entre o time** e **login seguro**:

1. **Banco em nuvem (Supabase):** substitui o `localStorage` por um banco
   PostgreSQL na nuvem. Todos passam a ver a mesma base de dados em tempo real.
2. **Autenticação real:** login e senha de cada pessoa, protegidos por
   criptografia, com recuperação de senha.
3. **Motor de IA por API:** conectar a API da Anthropic (com uma chave/assinatura)
   para o Motor refinar as decisões com inteligência real — algo que já funciona
   nesta arquitetura, basta a chave no ambiente.

Esse passo é desenvolvimento de software (um desenvolvedor ou agência faz),
usando **todo este sistema como especificação**. A parte mais cara — o design
das telas e a lógica de negócio — já está pronta aqui.

---

## Suporte

- Documentação do Vercel: https://vercel.com/docs
- Documentação do Vite: https://vitejs.dev
- PWA (vite-plugin-pwa): https://vite-pwa-org.netlify.app

*GeoópS · GEOAMBIENTE S/A · Inteligência Operacional para Gestão de Projetos Ambientais*
