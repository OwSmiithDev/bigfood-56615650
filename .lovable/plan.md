

# Plano: Responsividade Mobile + Correção Admin + Banco de Dados

## Resumo dos problemas encontrados

### 1. Responsividade
- O arquivo `App.css` contém regras do template Vite original (`#root { max-width: 1280px; padding: 2rem; text-align: center }`) que limitam a largura e adicionam padding indesejado em todas as telas
- O `index.css` define `font-size: 18px` no mobile, o que e excessivo para a maioria dos componentes
- Algumas paginas admin (Usuarios, Cupons) possuem grids de stats que nao escalam bem em telas pequenas (ex: `grid-cols-4` sem breakpoint intermediario)
- Pagina de auth tem padding que pode ser melhorado no mobile

### 2. Erro ao deletar cupom (banco de dados)
A tabela `orders` possui uma foreign key `orders_coupon_id_fkey` referenciando `coupons(id)` **sem regra de delete** (padrao RESTRICT). Isso significa que quando um admin tenta excluir um cupom que ja foi usado em pedidos, o banco retorna erro de constraint.

Detalhe das FKs encontradas:
- `coupon_usage.coupon_id` -> `coupons.id` com `ON DELETE CASCADE` (ok)
- `orders.coupon_id` -> `coupons.id` **sem ON DELETE** (problema!)

A edge function `delete-coupon` ja tenta fazer `SET NULL` nos pedidos antes de deletar, porem o hook `useDeleteCoupon` no frontend chama `supabase.from("coupons").delete()` diretamente (sem passar pela edge function), o que causa o erro.

### 3. Permissoes do admin
As politicas RLS ja concedem `ALL` para admins via `has_role(auth.uid(), 'admin')` em todas as tabelas. O unico bloqueio real e a constraint de FK na tabela de cupons (item 2 acima).

---

## Plano de implementacao

### Etapa 1: Corrigir o banco de dados (FK do cupom)
**Migração SQL:**
Alterar a foreign key `orders_coupon_id_fkey` para usar `ON DELETE SET NULL`, permitindo que ao excluir um cupom, os pedidos que o usaram simplesmente fiquem com `coupon_id = NULL` (mantendo o historico do pedido intacto).

```text
ALTER TABLE public.orders
  DROP CONSTRAINT orders_coupon_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_coupon_id_fkey
  FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
  ON DELETE SET NULL;
```

### Etapa 2: Corrigir o hook `useDeleteCoupon`
Atualizar `src/hooks/useCoupons.ts` para usar a edge function `delete-coupon` em vez de chamar `supabase.from("coupons").delete()` diretamente. A edge function ja tem a logica de limpar as referencias antes de deletar, e usa service role key para bypass de RLS.

**Arquivo:** `src/hooks/useCoupons.ts`
- Trocar `supabase.from("coupons").delete()` por `supabase.functions.invoke("delete-coupon", { body: { couponId: id } })`

### Etapa 3: Limpar o App.css (causa raiz de problemas de layout)
O arquivo `src/App.css` contem estilos do template padrao do Vite que conflitam com o layout do projeto:

```text
#root {
  max-width: 1280px;   <- limita largura indevidamente
  margin: 0 auto;
  padding: 2rem;       <- adiciona padding em TODAS as paginas
  text-align: center;  <- centraliza texto de tudo
}
```

**Acao:** Remover todas essas regras, deixando apenas o seletor vazio ou removendo o arquivo. Essas regras nao sao usadas pelo projeto (o layout e feito via Tailwind com `container mx-auto`).

### Etapa 4: Ajustar fonte base no mobile
No `src/index.css`, a regra `@media (max-width: 640px) { body { font-size: 18px } }` faz tudo ficar grande demais. 

**Acao:** Remover essa regra. O `font-size: 16px` padrao ja e adequado, e os componentes Tailwind controlam tamanhos com classes responsivas (`text-sm`, `text-base`, etc).

### Etapa 5: Melhorar responsividade de paginas especificas

**5a. AdminUsers (`src/pages/admin/AdminUsers.tsx`)**
- Stats grid: trocar `grid-cols-1 sm:grid-cols-4` por `grid-cols-2 sm:grid-cols-4` para 2 colunas no mobile
- User cards: melhorar truncamento de email/telefone em telas menores

**5b. AdminCoupons (`src/pages/admin/AdminCoupons.tsx`)**
- Stats grid: ja usa `sm:grid-cols-3`, esta ok
- Modal de criacao: garantir que funcione bem em tela cheia no mobile (usar `items-end sm:items-center` como ja feito em CompanyProducts)

**5c. AdminOrders (`src/pages/admin/AdminOrders.tsx`)**
- Stats grid: trocar `grid-cols-1 sm:grid-cols-3` por `grid-cols-2 sm:grid-cols-3` para mobile
- Cards de pedido: melhorar layout do preco/acoes em mobile

**5d. CustomerHome (`src/pages/CustomerHome.tsx`)**
- Ja esta razoavelmente responsiva, mas a barra de categorias pode ter touch targets maiores

**5e. CheckoutPage (`src/pages/CheckoutPage.tsx`)**
- Ja usa `max-w-lg` e layout mobile-first, esta ok

**5f. RestaurantPage (`src/pages/RestaurantPage.tsx`)**
- Info card: melhorar responsividade dos dados (rating/tempo/entrega) em mobile para quebrar linha se necessario

**5g. CompanyDashboard (`src/pages/company/CompanyDashboard.tsx`)**
- Stats cards: os valores com `text-2xl` ficam grandes demais em mobile, ajustar para responsive

---

## Resumo dos arquivos alterados

| Arquivo | Acao | Motivo |
|---------|------|--------|
| Migracao SQL | Criar | Corrigir FK `orders_coupon_id_fkey` para `ON DELETE SET NULL` |
| `src/App.css` | Limpar | Remover regras do template Vite que quebram layout |
| `src/index.css` | Editar | Remover `font-size: 18px` do mobile |
| `src/hooks/useCoupons.ts` | Editar | Usar edge function para deletar cupom |
| `src/pages/admin/AdminUsers.tsx` | Editar | Grid de stats responsivo |
| `src/pages/admin/AdminOrders.tsx` | Editar | Grid de stats responsivo |
| `src/pages/admin/AdminCoupons.tsx` | Editar | Modal full-screen no mobile |
| `src/pages/company/CompanyDashboard.tsx` | Editar | Tamanhos de texto responsivos nos stats |
| `src/pages/RestaurantPage.tsx` | Editar | Info card responsivo |

---

## O que NAO precisa mudar
- Permissoes RLS do admin: ja estao corretas (`ALL` via `has_role`)
- Pages da empresa (Products, Orders, Settings): ja possuem boa responsividade com breakpoints `sm:` e `lg:`
- AdminCompanies e AdminDashboard: ja foram ajustadas previamente com responsividade
- PWA: ja esta configurado e funcionando

