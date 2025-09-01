import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (url: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-bright rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
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
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!url.trim() || isLoading}
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
  );
};