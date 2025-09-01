import { useState } from 'react';
import { Copy, Eye, EyeOff, ExternalLink, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface SearchResult {
  url: string;
  user: string;
  pass: string;
}

interface SearchResponse {
  tempo_de_busca: string;
  total_encontrados: number;
  resultados: SearchResult[];
}

interface ResultsDisplayProps {
  data: SearchResponse;
  searchUrl: string;
}

export const ResultsDisplay = ({ data, searchUrl }: ResultsDisplayProps) => {
  const { toast } = useToast();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const togglePasswordVisibility = (index: number) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(index)) {
      newVisible.delete(index);
    } else {
      newVisible.add(index);
    }
    setVisiblePasswords(newVisible);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // Calcular paginação
  const totalPages = Math.ceil(data.resultados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = data.resultados.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header com estatísticas */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getFaviconUrl(searchUrl) && (
                <img 
                  src={getFaviconUrl(searchUrl)!} 
                  alt={`${searchUrl} favicon`}
                  className="w-8 h-8 rounded"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              )}
              <h2 className="text-xl font-semibold text-foreground">
                Resultados para: <span className="text-primary">{searchUrl}</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              <Clock className="w-3 h-3 mr-1" />
              {data.tempo_de_busca}
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              {data.total_encontrados} {data.total_encontrados === 1 ? 'resultado' : 'resultados'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="grid gap-6">
        {currentResults.map((result, index) => {
          const globalIndex = startIndex + index;
          return (
          <Card key={globalIndex} className="glass p-6 border border-border hover:border-primary/50 transition-all duration-300 group shadow-lg hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFaviconUrl(result.url) && (
                    <img 
                      src={getFaviconUrl(result.url)!} 
                      alt={`${result.url} favicon`}
                      className="w-6 h-6 rounded"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{result.url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://${result.url}`, '_blank')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-primary to-primary-light text-white shadow-lg">
                  #{globalIndex + 1}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Usuário */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Usuário/Email:
                  </label>
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-background-secondary to-background-secondary/50 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <code className="flex-1 text-sm font-mono text-foreground break-all font-medium">
                      {result.user}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.user, 'Usuário')}
                      className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Senha:
                  </label>
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-background-secondary to-background-secondary/50 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <code className="flex-1 text-sm font-mono text-foreground break-all font-medium">
                      {visiblePasswords.has(globalIndex) ? result.pass : '•'.repeat(result.pass.length)}
                    </code>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(globalIndex)}
                        className="h-8 w-8 p-0 hover:bg-accent/20 hover:text-accent transition-all duration-200 hover:scale-110"
                      >
                        {visiblePasswords.has(globalIndex) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.pass, 'Senha')}
                        className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {data.total_encontrados === 0 && (
        <Card className="glass p-12 text-center border border-border">
          <div className="space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-medium text-foreground">Nenhum acesso encontrado</h3>
            <p className="text-muted-foreground">
              Não foram encontrados acessos para <span className="text-primary font-medium">{searchUrl}</span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};