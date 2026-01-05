import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ADMIN_CONTACT, getWhatsAppLink } from "@/constants/contact";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqItems = [
  {
    category: "Conta e Cadastro",
    questions: [
      {
        question: "Como criar uma conta na BigFood?",
        answer: "Para criar uma conta, clique em \"Entrar\" no topo da página e depois em \"Criar conta\". Preencha seus dados (nome, email e senha) e pronto! Você já pode começar a fazer pedidos."
      },
      {
        question: "Esqueci minha senha, o que fazer?",
        answer: "Na tela de login, clique em \"Esqueci minha senha\". Digite seu email cadastrado e enviaremos um link para redefinir sua senha."
      },
      {
        question: "Como alterar meus dados cadastrais?",
        answer: "Após fazer login, acesse seu perfil clicando no ícone do usuário. Lá você pode atualizar nome, telefone, endereço e outras informações."
      }
    ]
  },
  {
    category: "Pedidos",
    questions: [
      {
        question: "Como fazer um pedido?",
        answer: "Navegue pelos restaurantes disponíveis, escolha os produtos desejados e adicione ao carrinho. Depois, vá ao carrinho, confirme os itens, escolha a forma de entrega e finalize o pedido."
      },
      {
        question: "Posso cancelar um pedido?",
        answer: "O cancelamento depende do status do pedido. Se o restaurante ainda não começou a preparar, você pode solicitar o cancelamento. Entre em contato com o restaurante ou nosso suporte para mais informações."
      },
      {
        question: "Como acompanho meu pedido?",
        answer: "Após finalizar o pedido, você pode acompanhar o status em \"Meus Pedidos\". O restaurante atualizará o status conforme o preparo e entrega avançam."
      },
      {
        question: "Qual o tempo médio de entrega?",
        answer: "O tempo de entrega varia de acordo com cada restaurante e sua localização. Cada estabelecimento exibe uma estimativa de tempo na página do restaurante."
      }
    ]
  },
  {
    category: "Planos e Empresas",
    questions: [
      {
        question: "Como funcionam os planos para restaurantes?",
        answer: "Oferecemos planos mensais para restaurantes que desejam vender pela plataforma. Cada plano oferece diferentes recursos como limite de produtos, relatórios e mais. Acesse \"Para Empresas\" para ver os detalhes."
      },
      {
        question: "Como cadastrar meu restaurante?",
        answer: "Clique em \"Cadastrar Empresa\" na página inicial, preencha os dados do seu estabelecimento, escolha um plano e aguarde a aprovação. Nossa equipe entrará em contato para validar as informações."
      },
      {
        question: "Posso testar a plataforma antes de contratar?",
        answer: "Sim! Você pode cadastrar seu restaurante e explorar o painel de gestão. Após a aprovação do plano, você poderá começar a receber pedidos."
      }
    ]
  },
  {
    category: "Pagamentos",
    questions: [
      {
        question: "Quais formas de pagamento são aceitas?",
        answer: "As formas de pagamento variam de acordo com cada restaurante. Geralmente são aceitos: Pix, dinheiro na entrega e cartões. Confira as opções disponíveis ao finalizar o pedido."
      },
      {
        question: "É seguro pagar pela plataforma?",
        answer: "Sim! Utilizamos tecnologias de segurança e criptografia para proteger seus dados. Todas as transações são processadas de forma segura."
      }
    ]
  },
  {
    category: "Suporte",
    questions: [
      {
        question: "Como falar com o suporte?",
        answer: "Você pode entrar em contato diretamente pelo WhatsApp clicando no botão abaixo, ou através do email de contato. Nossa equipe está pronta para ajudar!"
      },
      {
        question: "Tive um problema com meu pedido, o que fazer?",
        answer: "Entre em contato diretamente com o restaurante ou com nosso suporte via WhatsApp. Teremos prazer em ajudar a resolver qualquer problema."
      }
    ]
  }
];

const FAQPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre a BigFood
          </p>
        </div>
        
        <div className="space-y-8">
          {faqItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {section.category}
              </h2>
              
              <Accordion type="single" collapsible className="space-y-2">
                {section.questions.map((item, itemIndex) => (
                  <AccordionItem 
                    key={itemIndex} 
                    value={`${sectionIndex}-${itemIndex}`}
                    className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="text-foreground font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA WhatsApp */}
        <div className="mt-16 p-8 bg-muted/50 rounded-2xl text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Não encontrou o que procurava?
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para ajudar você!
          </p>
          <Button asChild size="lg" className="gap-2">
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              Falar pelo WhatsApp
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Ou envie um email para:{" "}
            <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-primary hover:underline">
              {ADMIN_CONTACT.email}
            </a>
          </p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default FAQPage;
