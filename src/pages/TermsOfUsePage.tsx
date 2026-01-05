import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ADMIN_CONTACT, getWhatsAppLink } from "@/constants/contact";

const TermsOfUsePage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">
          Termos de Uso
        </h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma BigFood, você concorda com os presentes Termos de Uso. 
              Caso não concorde com qualquer parte destes termos, solicitamos que não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Uso da Plataforma</h2>
            <p>
              A BigFood é uma plataforma que conecta usuários a restaurantes e estabelecimentos de alimentação. 
              Nossos serviços incluem:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Visualização de cardápios e menus de restaurantes parceiros</li>
              <li>Realização de pedidos online para entrega ou retirada</li>
              <li>Gerenciamento de pedidos para estabelecimentos parceiros</li>
              <li>Sistema de avaliações e reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Responsabilidades do Usuário</h2>
            <p>Ao utilizar nossa plataforma, você se compromete a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Fornecer informações verdadeiras e atualizadas durante o cadastro</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Não utilizar a plataforma para fins ilegais ou não autorizados</li>
              <li>Respeitar os direitos de propriedade intelectual</li>
              <li>Não realizar ações que possam prejudicar o funcionamento da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Pedidos e Pagamentos</h2>
            <p>
              Os pedidos realizados através da plataforma são de responsabilidade conjunta do usuário e do 
              estabelecimento parceiro. A BigFood atua como intermediária, facilitando a comunicação entre as partes.
            </p>
            <p className="mt-2">
              Os preços, disponibilidade de produtos e condições de entrega são definidos pelos estabelecimentos 
              parceiros e podem variar sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Responsabilidades dos Estabelecimentos</h2>
            <p>Os estabelecimentos parceiros são responsáveis por:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Manter informações atualizadas sobre produtos e preços</li>
              <li>Garantir a qualidade e segurança dos alimentos</li>
              <li>Cumprir os prazos de entrega informados</li>
              <li>Atender às normas sanitárias e de vigilância</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Modificações nos Termos</h2>
            <p>
              A BigFood reserva-se o direito de modificar estes Termos de Uso a qualquer momento. 
              As alterações entrarão em vigor imediatamente após sua publicação na plataforma. 
              O uso continuado dos serviços após as modificações implica na aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>
                <strong>WhatsApp:</strong>{" "}
                <a 
                  href={getWhatsAppLink("Olá, tenho dúvidas sobre os Termos de Uso.")} 
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

export default TermsOfUsePage;
