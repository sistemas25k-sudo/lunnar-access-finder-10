import { ArrowRight, Lock, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SignupPromptProps {
  resultsCount: number;
  searchUrl: string;
}

export const SignupPrompt = ({ resultsCount, searchUrl }: SignupPromptProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="glass p-12 text-center border border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
        <div className="relative space-y-8">
          {/* Contador de resultados */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-6 py-3 text-lg font-semibold">
                🎯 {resultsCount} RESULTADOS ENCONTRADOS
              </Badge>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Encontramos acessos para
              <span className="text-primary block mt-2">{searchUrl}</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cadastre-se gratuitamente para ter acesso completo aos resultados e começar a usar o sistema hoje mesmo!
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">100% Gratuito</p>
                <p className="text-sm text-muted-foreground">Sem taxas ocultas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Acesso Imediato</p>
                <p className="text-sm text-muted-foreground">Use agora mesmo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-bright to-accent rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Dados Seguros</p>
                <p className="text-sm text-muted-foreground">Totalmente protegido</p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright text-primary-foreground px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    Criar Conta Grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary/30 hover:bg-primary/10 px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              ✅ Cadastro em 30 segundos • ✅ Sem cartão de crédito • ✅ Comece a usar imediatamente
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};