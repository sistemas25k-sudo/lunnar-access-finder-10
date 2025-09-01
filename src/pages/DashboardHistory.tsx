import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/ApiService';
import { useToast } from '@/hooks/use-toast';
import { Clock, Search, ExternalLink, Trash2, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchHistory] = useState(() => {
    const fullHistory = ApiService.getSearchHistory();
    // Limitar histórico para plano grátis
    if (user && fullHistory.length > 2) { // Simplificado para todos os usuários
      return fullHistory.slice(0, 2);
    }
    return fullHistory;
  });
  const [filteredHistory, setFilteredHistory] = useState(searchHistory);
  const [searchFilter, setSearchFilter] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSearchFilter = (query: string) => {
    setSearchFilter(query);
    if (query.trim()) {
      const filtered = searchHistory.filter(item => 
        item.url.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(searchHistory);
    }
  };

  const clearHistory = () => {
    ApiService.clearSearchHistory();
    setFilteredHistory([]);
    toast({
      title: "Histórico limpo",
      description: "Todo o histórico de buscas foi removido",
      duration: 3000,
    });
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

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
                <h1 className="text-xl font-semibold text-foreground">Histórico de Buscas</h1>
                <p className="text-sm text-muted-foreground">
                  Visualize todas as suas buscas anteriores
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-6xl space-y-6">
              {/* Filtros */}
              <Card className="glass p-6 border border-border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Filtrar por site..."
                      value={searchFilter}
                      onChange={(e) => handleSearchFilter(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {filteredHistory.length} resultado(s)
                    </Badge>
                    {searchHistory.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearHistory}
                        className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpar Histórico
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Lista do Histórico */}
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <Card key={item.id} className="glass p-6 border border-border hover:border-primary/50 transition-all duration-300">
                      <div className="space-y-4">
                        {/* Header do item - simplificado */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            {getFaviconUrl(item.url) && (
                              <img 
                                src={getFaviconUrl(item.url)!} 
                                alt={`${item.url} favicon`}
                                className="w-8 h-8 rounded flex-shrink-0"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                  {item.url}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`https://${item.url}`, '_blank')}
                                  className="p-1 h-auto opacity-70 hover:opacity-100"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(item.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge 
                              className={`text-lg px-3 py-1 ${
                                item.results.total_encontrados > 0 
                                  ? 'bg-primary/20 text-primary border-primary/30' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item.results.total_encontrados} resultado(s)
                            </Badge>
                          </div>
                        </div>

                        {/* Resultados - removidos para simplicidade */}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass p-12 text-center border border-border">
                  <div className="space-y-4 max-w-md mx-auto">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">
                      {searchFilter ? 'Nenhum resultado encontrado' : 'Nenhuma busca realizada ainda'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchFilter 
                        ? `Não encontramos buscas que correspondam a "${searchFilter}"`
                        : 'Quando você realizar buscas, elas aparecerão aqui para consulta posterior'
                      }
                    </p>
                    {searchFilter && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleSearchFilter('')}
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Limpar filtro
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardHistory;