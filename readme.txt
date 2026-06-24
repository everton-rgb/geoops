========================================================================
 GeoópS — Versão de teste · Guia rápido de execução e publicação (Vercel)
 GEOAMBIENTE S/A · www.geoops.ia.br
========================================================================

O QUE É
-------
PWA (Progressive Web App) feito em Vite + React. Roda no navegador e pode
ser instalado como app no celular. Nesta versão de teste, os dados ficam
salvos no navegador de cada usuário (localStorage) — ideal para o time
navegar, testar os fluxos e dar feedback.


ESTRUTURA DO PROJETO
--------------------
  index.html              Página base (fontes, PWA, meta tags)
  package.json            Dependências e scripts (Node >= 18)
  vite.config.js          Configuração do Vite + PWA
  vercel.json             Configuração de deploy no Vercel
  api/
    analisar.js           Função serverless: ponte segura com a IA (Anthropic)
  public/
    icon-192.png          Ícone do app (PWA)
    icon-512.png          Ícone do app em alta resolução
  src/
    main.jsx              Ponto de entrada + persistência (localStorage)
    App.jsx               O sistema GeoópS completo
    constants/            Constantes (tabelas e parâmetros) — Fase 1 da migração
      base.js  equipe.js  atividades.js  sms.js  comercial.js  taps.js
      frota.js  maquinas.js  equipamentos.js  localizacao.js  acessos.js
      motor.js  seed.js


RODAR LOCALMENTE (precisa de Node.js 18 ou superior)
----------------------------------------------------
  npm install        # instala as dependências (1ª vez)
  npm run dev        # abre em http://localhost:5173
  npm run build      # gera a versão de produção em dist/ (opcional)
  npm run preview    # pré-visualiza o build de produção


PUBLICAR NO VERCEL (mais simples)
---------------------------------
  1. Acesse https://vercel.com e faça login (pode usar a conta do GitHub).
  2. Add New... -> Project -> importe o repositório everton-rgb/geoops.
  3. O Vercel detecta o Vite automaticamente. Não é preciso mudar nada:
        Build Command:     npm install && npm run build
        Output Directory:  dist
  4. Clique em Deploy e aguarde 1-2 minutos. O link sai pronto
     (ex.: https://geoops.vercel.app).
  5. (Opcional) Conectar o domínio geoops.ia.br em Settings -> Domains.


ATIVAR A IA (análise de contratos / inteligência operacional)
-------------------------------------------------------------
A análise por IA usa a API da Anthropic através da função api/analisar.js.
Para ativá-la no deploy:

  No Vercel: Settings -> Environment Variables -> adicionar
       Nome:  ANTHROPIC_API_KEY
       Valor: (sua chave da Anthropic, começa com sk-ant-...)
  Em seguida, refaça o deploy (Redeploy).

Sem a chave, o app funciona normalmente; apenas as funções de IA ficam
"pendentes" (os anexos são salvos e nada se perde).


INSTALAR COMO APP NO CELULAR (depois de publicado)
--------------------------------------------------
  iPhone (Safari):  Compartilhar -> Adicionar à Tela de Início.
  Android (Chrome): Menu (⋮) -> Instalar aplicativo.


LOGIN DA BETA (senhas de protótipo)
-----------------------------------
A tela de login lista as áreas de acesso. Senhas iniciais de exemplo:
  Diretor Presidente (CEO) ... emc        Equipes (RH) ............... aline
  Diretor Financeiro (CFO) ... maio       Qualidade .................. luciane
  Diretora de Operações ...... thati      Saúde e Segurança .......... maira
  Comercial .................. matheus    Gestor de Operações ........ andre
  Coordenador de Operações ... coord      Eficiência ................. jony
  Frotas ..................... fran       Máquinas & Sistemas ........ fernando
  Gerentes de carteira ....... gc01 ... gc08

  AVISO: nesta beta as senhas e os dados ficam só no navegador — NÃO é
  segurança real. Não insira dados sensíveis reais ainda.


NOTA SOBRE A ARQUITETURA (migração em andamento)
------------------------------------------------
Este repositório está sendo migrado do arquivo único (src/App.jsx) para uma
estrutura modular. A Fase 1 (constantes em src/constants/) já foi concluída.
Próximas fases: domain/ (regras puras + testes), services/ (Supabase, IA,
Excel), components/ e modules/. Ver "Mapa de Migração da Arquitetura".

------------------------------------------------------------------------
Desenvolvido por Everton Maurício Carvalho · GeoópS · GEOAMBIENTE S/A
------------------------------------------------------------------------
