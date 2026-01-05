// Categorias padronizadas para todo o sistema
// O 'id' é usado como chave no banco de dados
// O 'name' é o texto exibido para o usuário
// O 'emoji' é o ícone visual

export const RESTAURANT_CATEGORIES = [
  { id: "Pizzaria", name: "Pizzaria", emoji: "🍕" },
  { id: "Hamburgueria", name: "Hamburgueria", emoji: "🍔" },
  { id: "Japonês", name: "Japonês", emoji: "🍣" },
  { id: "Saudável", name: "Saudável", emoji: "🥗" },
  { id: "Cafeteria", name: "Cafeteria", emoji: "☕" },
  { id: "Doces", name: "Doces", emoji: "🍰" },
  { id: "Brasileira", name: "Brasileira", emoji: "🍖" },
  { id: "Italiana", name: "Italiana", emoji: "🍝" },
  { id: "Mexicana", name: "Mexicana", emoji: "🌮" },
  { id: "Árabe", name: "Árabe", emoji: "🥙" },
  { id: "Açaí", name: "Açaí", emoji: "🍇" },
  { id: "Lanches", name: "Lanches", emoji: "🥪" },
] as const;

export type CategoryId = typeof RESTAURANT_CATEGORIES[number]["id"];

export const getCategoryById = (id: string) => 
  RESTAURANT_CATEGORIES.find(cat => cat.id === id);

export const getCategoryEmoji = (id: string) => 
  getCategoryById(id)?.emoji || "🍽️";

export const getCategoryName = (id: string) => 
  getCategoryById(id)?.name || id;
