import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardSearchBarProps {
  onSearch: (url: string) => void;
  isLoading?: boolean;
}

export const DashboardSearchBar = ({ onSearch, isLoading }: DashboardSearchBarProps) => {
  const [url, setUrl] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Permitir busca se ainda não atingiu o limite
  // Se profile não carregar (erro no Supabase), usar valores padrão
  const canSearch = user && (
    !profile || 
    (profile.searches_used || 0) < (profile.searches_limit || 3)
  );

  const handleUpgrade = () => {
    navigate('/payment');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && canSearch) {
      onSearch(url.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-bright rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
          <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden glass">
            <div className="flex items-center justify-center w-12 h-12 text-primary">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Digite o site que deseja buscar (ex: netflix.com.br)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground px-0"
              disabled={isLoading || !canSearch}
            />
            <Button 
              type="submit" 
              disabled={!url.trim() || isLoading || !canSearch}
              className="m-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright text-primary-foreground border-0 rounded-lg px-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Buscando...
                </>
              ) : (
                'Buscar Acessos'
              )}
            </Button>
          </div>
        </div>
      </form>

      {!canSearch && user && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            <div className="flex items-center justify-between">
              <span>
                Você atingiu o limite de {profile?.searches_limit || 3} buscas diárias do plano {profile?.plan === 'free' ? 'Grátis' : profile?.plan || 'Grátis'}. 
                Atualize seu plano para fazer mais buscas.
              </span>
              <Button 
                onClick={handleUpgrade}
                size="sm"
                className="ml-4 bg-primary hover:bg-primary/90"
              >
                Fazer Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Alert className="border-primary/50 bg-primary/10">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          💡 <strong>Dica:</strong> A consulta pode demorar até 1 minuto para carregar todos os resultados. Aguarde enquanto nossa API busca as credenciais.
        </AlertDescription>
      </Alert>

      {user && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Buscas utilizadas hoje: <span className="text-primary font-semibold">
              {`${profile?.searches_used || 0}/${profile?.searches_limit || 3}`}
            </span>
          </span>
          <span className="text-xs">
            Plano: <span className="text-primary font-semibold capitalize">
              {profile?.plan === 'free' ? 'Grátis' : profile?.plan || 'Grátis'}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};