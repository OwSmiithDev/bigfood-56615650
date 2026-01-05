// Configuração central de contato do administrador
// Atualize este arquivo para alterar as informações de contato em todo o site

export const ADMIN_CONTACT = {
  // Número do WhatsApp do admin (formato: código do país + DDD + número, sem espaços ou caracteres especiais)
  whatsappNumber: "5562999718912",
  
  // Número formatado para exibição
  phoneDisplay: "(62) 99971-8912",
  
  // Email de contato
  email: "Smiith.TechSolucoes@gmail.com",
  
  // Mensagem padrão do WhatsApp
  defaultWhatsAppMessage: "Olá, estou com dúvidas e gostaria de ajuda.",
};

// Função helper para gerar link do WhatsApp
export const getWhatsAppLink = (customMessage?: string) => {
  const message = encodeURIComponent(customMessage || ADMIN_CONTACT.defaultWhatsAppMessage);
  return `https://wa.me/${ADMIN_CONTACT.whatsappNumber}?text=${message}`;
};
