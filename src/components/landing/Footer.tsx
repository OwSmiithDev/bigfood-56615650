import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">B</span>
              </div>
              <span className="font-display font-bold text-xl text-background">
                BigFood
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-4">
              A plataforma que conecta você aos melhores restaurantes da sua região.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Navegação</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/#como-funciona" className="text-background/70 hover:text-background transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link to="/home" className="text-background/70 hover:text-background transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link to="/#empresas" className="text-background/70 hover:text-background transition-colors">
                  Para empresas
                </Link>
              </li>
              <li>
                <Link to="/" className="text-background/70 hover:text-background transition-colors">
                  Planos e preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Suporte</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Central de ajuda</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Termos de uso</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Política de privacidade</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                contato@bigfood.com.br
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} BigFood. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
