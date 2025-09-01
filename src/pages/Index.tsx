import { useState } from 'react';
import { Shield, Search, Database, Zap, Users, Lock, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/SearchBar';
import { SignupPrompt } from '@/components/SignupPrompt';
import { LiveActivity } from '@/components/LiveActivity';
import { useToast } from '@/hooks/use-toast';
import painelLogo from '@/assets/painel-logo.png';

const Index = () => {
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedUrl, setSearchedUrl] = useState('');
  const [resultsFound, setResultsFound] = useState(0);
  const { toast } = useToast();

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setSearchedUrl(url);
    setShowSignupPrompt(false);
    
    try {
      // Simular busca na API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar número aleatório de resultados entre 15 e 150
      const randomResults = Math.floor(Math.random() * 135) + 15;
      setResultsFound(randomResults);
      setShowSignupPrompt(true);
      
      toast({
        title: "Busca concluída!",
        description: `${randomResults} resultados encontrados`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Busca Avançada",
      description: "Sistema de busca inteligente que vasculha bases de dados em tempo real"
    },
    {
      icon: Database,
      title: "Base Atualizada",
      description: "Acesso a uma das maiores bases de dados de credenciais disponíveis"
    },
    {
      icon: Zap,
      title: "Resultados Rápidos",
      description: "Obtenha resultados em segundos com nossa infraestrutura otimizada"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Conexões criptografadas e dados protegidos com máxima segurança"
    },
    {
      icon: Users,
      title: "Multi-usuário",
      description: "Gerencie equipes e controle acessos com diferentes níveis de permissão"
    },
    {
      icon: Lock,
      title: "Privacidade Total",
      description: "Suas buscas são privadas e não são armazenadas em nossos servidores"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={painelLogo} alt="Logo" className="h-10 w-auto" />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Recursos</a>
              <Link to="/auth?mode=login">
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright">
                  Criar Conta
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 cyber-grid"></div>
        <div className="absolute inset-0 hero-glow"></div>
        
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 px-6 py-3 text-lg">
              🟢 Sistema Online
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Encontre
              <span className="text-primary block">Acessos de qualquer site</span>
              <span className="text-2xl md:text-3xl text-muted-foreground block mt-4">Gratuitamente</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistema de busca de credenciais totalmente gratuito. 
              <span className="text-primary font-semibold"> Cadastre-se agora</span> e comece a usar imediatamente.
            </p>
          </div>

          <div className="mt-12">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary" />
              100% Seguro
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-4 h-4 text-primary" />
              Base Atualizada
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              Resultados Instantâneos
            </span>
          </div>
        </div>
      </section>

      {/* Prompt de Cadastro */}
      {showSignupPrompt && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <SignupPrompt resultsCount={resultsFound} searchUrl={searchedUrl} />
          </div>
        </section>
      )}

      {/* Atividade em Tempo Real */}
      <LiveActivity />

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              Recursos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Por que escolher o
              <span className="text-primary"> Painel Lunnar</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para oferecer a melhor experiência em busca de credenciais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 glass border border-border hover:border-primary/50 transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass p-12 border border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Cadastre-se grátis e comece agora!
              </h2>
              <p className="text-xl text-muted-foreground">
                Milhares de usuários já estão usando o Painel Lunnar para encontrar acessos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright text-primary-foreground w-full sm:w-auto">
                    Criar Conta Gratuita
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 w-full sm:w-auto">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={painelLogo} alt="Logo" className="h-8 w-auto" />
              </div>
              <p className="text-muted-foreground">
                A plataforma mais avançada para busca de credenciais e acessos.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Produto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Painel Lunnar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;