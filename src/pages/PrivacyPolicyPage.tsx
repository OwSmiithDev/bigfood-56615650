import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ADMIN_CONTACT, getWhatsAppLink } from "@/constants/contact";

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">
          Política de Privacidade
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p>
              A BigFood está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários. 
              Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Dados que Coletamos</h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            
            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.1 Dados fornecidos por você:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome completo e informações de contato</li>
              <li>Endereço de email e número de telefone</li>
              <li>Endereço para entrega</li>
              <li>Informações de login e senha (armazenadas de forma criptografada)</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.2 Dados coletados automaticamente:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Histórico de pedidos e preferências</li>
              <li>Dados de navegação e interação com a plataforma</li>
              <li>Informações do dispositivo e localização (quando autorizado)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Usamos seus Dados</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Processar e entregar seus pedidos</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Enviar atualizações sobre seus pedidos</li>
              <li>Melhorar nossos serviços e funcionalidades</li>
              <li>Garantir a segurança da plataforma</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Restaurantes parceiros:</strong> informações necessárias para preparar e entregar seu pedido
              </li>
              <li>
                <strong>Prestadores de serviço:</strong> empresas que nos auxiliam na operação da plataforma
              </li>
              <li>
                <strong>Autoridades legais:</strong> quando exigido por lei ou ordem judicial
              </li>
            </ul>
            <p className="mt-4">
              <strong>Não vendemos</strong> suas informações pessoais para terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Proteção dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Criptografia de dados sensíveis</li>
              <li>Controle de acesso restrito</li>
              <li>Monitoramento de segurança contínuo</li>
              <li>Backups regulares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir informações incorretas ou desatualizadas</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimentos dados anteriormente</li>
              <li>Solicitar a portabilidade de seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, 
              analisar o uso da plataforma e personalizar conteúdo. Você pode gerenciar as 
              preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>
                <strong>WhatsApp:</strong>{" "}
                <a 
                  href={getWhatsAppLink("Olá, tenho dúvidas sobre a Política de Privacidade.")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {ADMIN_CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-primary hover:underline">
                  {ADMIN_CONTACT.email}
                </a>
              </li>
            </ul>
          </section>

          <p className="text-sm text-muted-foreground mt-8 pt-4 border-t border-border">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default PrivacyPolicyPage;
