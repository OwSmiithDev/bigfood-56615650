
# Plano: Botao de Imprimir Comanda nos Pedidos da Empresa

## O que sera feito
Adicionar um botao "Imprimir Comanda" em cada card de pedido no painel da empresa. Ao clicar, abre um dialog com a pre-visualizacao da comanda e a opcao de imprimir (usando o seletor de impressora nativo do navegador).

---

## Como funciona

```text
Card do pedido (CompanyOrders)
        |
        v
  [Botao de impressora]
        |
        v
  Abre Dialog com preview da comanda
        |
        v
  ┌──────────────────────────────────┐
  │       COMANDA - BigFood          │
  │  ================================│
  │  Pedido: #a1b2c3d4               │
  │  Data: 07/02/2026 14:30          │
  │  Cliente: Joao Silva             │
  │  Telefone: (11) 99999-0000       │
  │  Tipo: Entrega                   │
  │  ================================│
  │  ITENS:                          │
  │  2x Hamburguer Classico    29,90 │
  │  1x Refrigerante            8,00 │
  │  ================================│
  │  Subtotal:              R$ 67,80 │
  │  Taxa entrega:          R$  5,00 │
  │  Desconto:             -R$ 10,00 │
  │  TOTAL:                R$ 62,80  │
  │  ================================│
  │  Endereco:                       │
  │  Rua das Flores, 123 - Centro    │
  │  ================================│
  │  Obs: Sem cebola                 │
  │  Pgto: Dinheiro | Troco p/ 100   │
  └──────────────────────────────────┘
  
  [Imprimir]  [Fechar]
        |
        v
  Abre dialog nativo do navegador
  (usuario escolhe a impressora)
```

A impressao usa a API `window.print()` do navegador, que automaticamente abre o seletor de impressora do sistema operacional. Nao precisa de driver ou configuracao extra -- funciona em qualquer navegador (desktop e mobile).

---

## Arquivos a criar/modificar

### 1. Criar componente `OrderReceipt` (comanda)
**Arquivo:** `src/components/company/OrderReceipt.tsx`

Responsabilidades:
- Receber os dados do pedido como props
- Renderizar a comanda em formato otimizado para impressao (fonte monoespaco, largura fixa para impressoras termicas de 80mm)
- Layout limpo sem cores de fundo (economia de tinta)
- Informacoes incluidas:
  - Numero do pedido (primeiros 8 caracteres do ID)
  - Data e hora formatados em pt-BR
  - Nome e telefone do cliente
  - Tipo do pedido (entrega ou retirada)
  - Lista de itens com quantidade, nome, observacao e preco
  - Subtotal, taxa de entrega, desconto e total
  - Endereco completo (quando entrega)
  - Observacoes e forma de pagamento (extraida do campo `notes`)

### 2. Criar dialog `PrintOrderDialog`
**Arquivo:** `src/components/company/PrintOrderDialog.tsx`

Responsabilidades:
- Dialog (modal) que mostra o preview da comanda
- Botao "Imprimir" que chama `window.print()` com CSS especifico para impressao
- Usa `@media print` para esconder tudo exceto a comanda durante a impressao
- Botao "Fechar" para sair sem imprimir

### 3. Modificar `CompanyOrders.tsx`
- Adicionar botao de impressora (icone `Printer` do lucide-react) no card de cada pedido
- Ao clicar, abre o `PrintOrderDialog` passando os dados do pedido
- Posicionar o botao ao lado do seletor de status, na area inferior do card

---

## Detalhes tecnicos

### CSS de impressao
Sera adicionado um bloco `@media print` no `index.css` para:
- Esconder TUDO da pagina exceto o conteudo da comanda
- Remover margens e paddings do body
- Definir largura otimizada para impressoras termicas (80mm)
- Usar fonte monoespaco para alinhamento

### Dados disponiveis no pedido
Todos os dados necessarios ja estao disponiveis no objeto `order` retornado pela query:
- `id`, `created_at`, `customer_name`, `customer_phone`
- `order_type` (delivery/pickup)
- `order_items[]` com `quantity`, `product_name`, `price`, `observation`
- `subtotal`, `delivery_fee`, `discount_amount`, `total`
- `address_street`, `address_number`, `address_neighborhood`, `address_city`
- `notes` (contem forma de pagamento)

### Compatibilidade
- Desktop: `window.print()` abre o dialog do sistema com lista de impressoras
- Mobile/PWA: abre o menu de compartilhamento/impressao nativo do celular
- Impressoras termicas (80mm): o CSS sera otimizado para essa largura
- Impressoras comuns (A4): tambem funciona, a comanda fica centralizada

---

## Resumo dos arquivos

| Arquivo | Acao | Motivo |
|---------|------|--------|
| `src/components/company/OrderReceipt.tsx` | Criar | Componente visual da comanda |
| `src/components/company/PrintOrderDialog.tsx` | Criar | Dialog com preview e botao imprimir |
| `src/pages/company/CompanyOrders.tsx` | Modificar | Adicionar botao de impressora nos cards |
| `src/index.css` | Modificar | Adicionar regras `@media print` |
