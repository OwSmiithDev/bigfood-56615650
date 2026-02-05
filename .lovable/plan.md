
Objetivo
- Transformar o BigFood em um PWA (instalável no Android/iPhone) no site inteiro, sem “modo offline” (ou seja: se ficar sem internet, pode mostrar erro/sem conexão normalmente).
- Garantir boa responsividade (mobile/tablet/desktop) e evitar problemas comuns de PWA (cache quebrando páginas, rotas do React, logo/ícones errados).

O que já existe no projeto (confirmado)
- Stack: Vite + React + React Router + Tailwind.
- Ainda não há PWA configurado (nenhum manifest/service worker/vite-plugin-pwa).
- index.html já tem meta tags mobile importantes (viewport, theme-color, apple-mobile-web-app-capable).
- Pasta public/ ainda só tem favicon.ico, robots.txt etc.

Decisões confirmadas com você
- Nome do app: BigFood.
- Offline: não precisa (funciona somente com internet).
- Instalação: prompt automático do navegador (sem página /install).
- Ícone: você quer usar o arquivo que está nesse URL:
  https://cc7ba732-2da8-4d71-8270-a0ef154fe968.lovableproject.com/src/assets/logo-transparent.png
  Observação: para PWA, o ideal é um ícone quadrado; se esse arquivo não for quadrado, eu vou gerar os tamanhos exigidos com “melhor esforço” (pode ficar com padding).

Plano de implementação (PWA)
1) Adicionar a dependência de PWA do Vite
- Instalar: vite-plugin-pwa (devDependency).
- Motivo: é a forma padrão e mais estável de PWA no Vite.

2) Configurar o PWA no vite.config.ts
- Adicionar o plugin VitePWA junto do react().
- Configurações principais:
  - registerType: "autoUpdate" (para atualizar SW automaticamente quando publicar)
  - includeAssets: incluir favicon e assets necessários
  - manifest:
    - name: "BigFood"
    - short_name: "BigFood"
    - start_url: "/"
    - scope: "/"
    - display: "standalone"
    - background_color e theme_color alinhados ao seu laranja atual (já existe theme-color no HTML)
    - icons: lista de ícones (192x192, 512x512, e idealmente maskable)
- Cache/Workbox (como você não quer offline):
  - Usar uma estratégia minimalista para reduzir risco de “página branca” por cache:
    - Precache apenas os assets gerados do build.
    - Runtime caching bem conservador (ou nenhum) para páginas dinâmicas.
  - Resultado: app instalável, mas sem prometer navegação offline.

3) Registro do service worker no app (src/main.tsx)
- Importar e chamar o helper de registro do plugin (virtual:pwa-register).
- Configurar para atualizar sem atrapalhar o uso (autoUpdate).
- Opcional: log/console apenas em dev para depuração.

4) Criar/ajustar arquivos públicos do PWA
- Adicionar no public/:
  - pwa-192x192.png
  - pwa-512x512.png
  - pwa-512x512-maskable.png (se conseguirmos fazer uma versão “maskable” aceitável)
  - apple-touch-icon.png (180x180)
- Origem do ícone:
  - Baixar a imagem do URL que você passou e gerar as variações.
  - Se o formato/qualidade não estiver ideal (ex: não quadrado), eu vou centralizar com padding para evitar corte feio.

5) Ajustes finais no index.html (compatibilidade iOS/Android)
- Garantir tags recomendadas para instalação:
  - link rel="apple-touch-icon"
  - meta name="theme-color" (já existe)
  - Opcional: meta apple-mobile-web-app-title para iOS
- Observação: o iPhone (Safari) tem particularidades; essas tags ajudam.

Plano de implementação (Responsividade “bem responsivo”)
6) Auditoria rápida de responsividade nas páginas principais
- Rotas chave:
  - Landing (/)
  - Auth (/auth)
  - Customer (/home)
  - Empresa (/empresa/*)
  - Admin (/admin/*)
- O que vou revisar e ajustar quando necessário:
  - Containers com largura fixa / max-width indevido (ex: se alguma tela herda estilos antigos como App.css com padding/centralização)
  - Elementos que “estouram” horizontalmente no mobile (tabelas, cards, grids)
  - Touch targets (botões pequenos)
  - Overflows (overflow-x inadvertido)
  - Header/Footer em mobile (menus, quebras, alinhamentos)
- Critério: nenhuma tela pode ficar “cortada” ou exigir scroll horizontal.

7) Validar que o PWA não quebra o React Router
- Confirmar que navegação client-side continua ok.
- Garantir que o service worker não cacheie HTML antigo que cause “tela branca” após update.
- Em caso de rotas que precisam sempre da versão mais nova, manter comportamento “network-first” para HTML.

Testes que vou fazer (e que você deve validar também)
8) Testes técnicos (no preview e após publicar)
- Instalação:
  - Android/Chrome: verificar se aparece “Instalar app”.
  - Desktop/Chrome: verificar “Install app”.
  - iPhone/Safari: verificar “Adicionar à Tela de Início”.
- Navegação:
  - Trocar entre /, /auth, /home, /empresa e /admin (se possível) para garantir que nada fica em branco.
- Atualização:
  - Simular update (build novo) e garantir que não fica preso em versão antiga.
- Responsividade:
  - Validar em 390px (iPhone), ~768px (tablet) e desktop.

Riscos / observações
- Ícone via URL: se a imagem não for quadrada ou tiver muita transparência, o ícone instalado pode ficar com aparência “pequena” (por padding). Se isso acontecer, a melhor solução é você enviar um ícone quadrado (ex: 1024x1024 PNG) e eu regenero tudo perfeito.
- “Sem offline”: ainda existirá service worker (requisito prático do PWA), mas a experiência offline não será tratada como feature; sem internet, o navegador pode mostrar erro normal.

Entrega (o que vai mudar no código)
- package.json: adicionar vite-plugin-pwa
- vite.config.ts: configurar VitePWA
- src/main.tsx: registrar service worker
- index.html: complementar tags (se necessário)
- public/: adicionar ícones do PWA
- Pequenos ajustes pontuais de CSS/layout onde houver quebra de responsividade

Depois que você aprovar
- Eu implemento tudo em uma rodada, e em seguida a gente valida a instalação (Android/iOS) e a responsividade nas páginas principais.
