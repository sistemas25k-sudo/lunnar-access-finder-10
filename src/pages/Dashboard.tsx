import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardSearchBar } from '@/components/DashboardSearchBar';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { MatrixLoader } from '@/components/MatrixLoader';
import { PlansSection } from '@/components/PlansSection';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserNotifications } from '@/components/UserNotifications';
import { ApiService } from '@/services/ApiService';
import { useToast } from '@/hooks/use-toast';
import { Zap, Search, Clock, TrendingUp } from 'lucide-react';

interface SearchResponse {
  tempo_de_busca: string;
  total_encontrados: number;
  resultados: Array<{
    url: string;
    user: string;
    pass: string;
  }>;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedUrl, setSearchedUrl] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = async (url: string) => {
    // Verificar limite se o profile existir
    if (profile && (profile.searches_used || 0) >= (profile.searches_limit || 3)) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de buscas diárias do seu plano",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Mostrar aviso de tempo de espera
    toast({
      title: "🔍 Iniciando busca...",
      description: "A consulta pode demorar até 1 minuto. Aguarde enquanto buscamos os resultados.",
      duration: 5000,
    });

    setIsLoading(true);
    setSearchedUrl(url);
    setSearchResults(null);
    
    try {
      const data = await ApiService.searchCredentials(url);
      setSearchResults(data);
      
      // Salvar no histórico
      ApiService.saveSearchToHistory(url, data);
      
      // Atualizar contador de buscas
      ApiService.updateUserSearchCount();
      
      // Não recarregar a página para manter os resultados visíveis
      
      toast({
        title: "Busca concluída!",
        description: `${data.total_encontrados} resultados encontrados em ${data.tempo_de_busca}`,
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca. Verifique sua conexão e tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Buscas Restantes',
      value: `${(profile?.searches_limit || 3) - (profile?.searches_used || 0)}`,
      subtitle: `de ${profile?.searches_limit || 3} disponíveis`,
      icon: Search,
      color: 'text-primary'
    },
    {
      title: 'Plano Atual',
      value: profile?.plan === 'free' ? 'Grátis' : profile?.plan || 'Grátis',
      subtitle: 'Ativo',
      icon: Zap,
      color: 'text-accent'
    },
    {
      title: 'Histórico',
      value: ApiService.getSearchHistory().length.toString(),
      subtitle: 'buscas realizadas',
      icon: Clock,
      color: 'text-primary-bright'
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4 p-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">Buscar Acessos</h1>
                <p className="text-sm text-muted-foreground">
                  Encontre credenciais de acesso para qualquer site
                </p>
              </div>
              <UserNotifications />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-6xl space-y-8">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="glass p-6 border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.subtitle}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Barra de Busca */}
              <Card className="glass p-8 border border-border">
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
                      🔍 Sistema de Busca Ativo
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Digite o site que deseja buscar
                    </h2>
                    <p className="text-muted-foreground">
                      Nossa API irá buscar credenciais disponíveis em tempo real
                    </p>
                  </div>
                  
                  <DashboardSearchBar onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </Card>

              {/* Loading */}
              {isLoading && <MatrixLoader />}

              {/* Resultados */}
              {searchResults && !isLoading && (
                <div className="space-y-6">
                  <ResultsDisplay data={searchResults} searchUrl={searchedUrl} />
                </div>
              )}

              {/* Estado vazio */}
              {!searchResults && !isLoading && (
                <Card className="glass p-12 text-center border border-border">
                  <div className="space-y-4 max-w-md mx-auto">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">
                      Pronto para começar!
                    </h3>
                    <p className="text-muted-foreground">
                      Digite um site na barra de busca acima para encontrar credenciais disponíveis
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Exemplo: <code className="bg-muted px-2 py-1 rounded text-primary">netflix.com</code>
                    </p>
                  </div>
                </Card>
              )}

              {/* Seção de Planos */}
              <Card className="glass p-8 border border-border">
                <PlansSection />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;