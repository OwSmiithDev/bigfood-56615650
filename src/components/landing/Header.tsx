import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (id: string) => {
    scrollToSection(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-primary-foreground font-display font-bold text-xl">B</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Big<span className="text-primary">Food</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
            <button
              type="button"
              onClick={() => handleNavClick("como-funciona")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Como funciona
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("categorias")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Categorias
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("empresas")}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Para empresas
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <MapPin className="w-4 h-4" />
              Sua localização
            </Button>
            <Link to="/auth">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button variant="hero">Começar agora</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 glass-strong"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4" aria-label="Menu móvel">
              <button
                type="button"
                onClick={() => handleNavClick("como-funciona")}
                className="py-2 text-left text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Como funciona
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("categorias")}
                className="py-2 text-left text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Categorias
              </button>
              <button
                type="button"
                onClick={() => handleNavClick("empresas")}
                className="py-2 text-left text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Para empresas
              </button>
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Entrar</Button>
                </Link>
                <Link to="/auth?tab=register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full">Começar agora</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
