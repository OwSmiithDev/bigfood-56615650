
# Plano: Prompt de Instalação do PWA com Lógica Inteligente

## Objetivo
Implementar um sistema que pergunta ao usuário se quer instalar o app BigFood:
1. **Ao acessar qualquer página** - mostra o prompt automaticamente
2. **Se recusar** - mostra novamente após fazer login ou cadastro

---

## Como funciona tecnicamente

O navegador dispara um evento `beforeinstallprompt` quando o PWA está pronto para instalação. Vamos capturar esse evento e controlar quando exibir o prompt.

### Fluxo do usuário

```text
Usuário acessa o site
        │
        ▼
┌─────────────────────────────────────┐
│  Aparece modal: "Instalar BigFood?" │
│  [Instalar]  [Agora não]            │
└─────────────────────────────────────┘
        │
        ├── Clicou "Instalar" ──► App instalado (fim)
        │
        └── Clicou "Agora não"
                │
                ▼
        Salva no localStorage que recusou
                │
                ▼
        Usuário faz login/cadastro
                │
                ▼
┌─────────────────────────────────────┐
│  Aparece modal novamente            │
│  [Instalar]  [Agora não]            │
└─────────────────────────────────────┘
        │
        └── Se recusar de novo ──► Não mostra mais nessa sessão
```

---

## Arquivos a criar/modificar

### 1. Criar hook `usePWAInstall`
**Arquivo:** `src/hooks/usePWAInstall.ts`

Responsabilidades:
- Capturar evento `beforeinstallprompt`
- Armazenar o prompt para uso posterior
- Controlar estado: se pode instalar, se já recusou, se já instalou
- Função para disparar a instalação
- Usar `localStorage` para lembrar se recusou

### 2. Criar contexto `PWAInstallContext`
**Arquivo:** `src/contexts/PWAInstallContext.tsx`

Responsabilidades:
- Prover estado global do PWA install
- Função `triggerInstallPrompt()` - mostra o prompt nativo
- Função `showInstallDialog()` - mostra nosso modal customizado
- Flag `hasDeclined` - se recusou na primeira vez
- Flag `canInstall` - se o navegador suporta instalação

### 3. Criar componente `PWAInstallDialog`
**Arquivo:** `src/components/PWAInstallDialog.tsx`

Responsabilidades:
- Modal bonito com logo do BigFood
- Texto explicativo: "Instale o BigFood para acesso rápido"
- Botão "Instalar" (chama o prompt nativo do navegador)
- Botão "Agora não" (fecha e marca como recusado)
- Animação suave com framer-motion

### 4. Modificar `App.tsx`
- Envolver app com `PWAInstallProvider`
- Incluir `<PWAInstallDialog />` globalmente

### 5. Modificar `AuthPage.tsx`
- Após login/cadastro bem-sucedido, verificar se usuário recusou antes
- Se recusou, mostrar o dialog novamente

---

## Detalhes da implementação

### Hook `usePWAInstall`

```text
Estados:
- deferredPrompt: guarda o evento do navegador
- canInstall: true se PWA pode ser instalado
- isInstalled: true se já está instalado

Funções:
- promptInstall(): dispara o prompt nativo
- resetDecline(): limpa o estado de "recusou"
```

### Lógica do Dialog

```text
Quando mostrar automaticamente:
- canInstall === true
- Não está instalado
- Não recusou ainda (localStorage)
- Delay de 2-3 segundos após carregar a página

Quando mostrar após auth:
- hasDeclined === true (recusou antes)
- Login/cadastro com sucesso
- canInstall ainda === true
```

### Persistência

```text
localStorage keys:
- "pwa-install-declined": "true" | não existe
- "pwa-install-declined-after-auth": "true" | não existe
```

---

## Visual do Dialog

```text
┌────────────────────────────────────────┐
│                                        │
│         [Logo BigFood grande]          │
│                                        │
│     Instale o app BigFood!             │
│                                        │
│   Tenha acesso rápido aos melhores     │
│   restaurantes direto da sua tela      │
│   inicial.                             │
│                                        │
│   ┌──────────────────────────────┐     │
│   │        Instalar agora        │     │
│   └──────────────────────────────┘     │
│                                        │
│         [Agora não, obrigado]          │
│                                        │
└────────────────────────────────────────┘
```

---

## Considerações importantes

1. **Compatibilidade iOS**: Safari no iPhone não suporta `beforeinstallprompt`. Para iOS, vamos mostrar instruções manuais ("Toque em Compartilhar > Adicionar à Tela de Início").

2. **Não ser intrusivo**: O dialog aparece apenas 1x automaticamente e 1x após auth. Depois disso, não incomoda mais.

3. **Persistência por sessão**: Se recusar as duas vezes, não mostra mais até limpar dados do navegador ou nova sessão (1 dia).

---

## Resumo das alterações

| Arquivo | Ação |
|---------|------|
| `src/hooks/usePWAInstall.ts` | Criar |
| `src/contexts/PWAInstallContext.tsx` | Criar |
| `src/components/PWAInstallDialog.tsx` | Criar |
| `src/App.tsx` | Modificar (adicionar provider e dialog) |
| `src/pages/AuthPage.tsx` | Modificar (trigger após auth) |
