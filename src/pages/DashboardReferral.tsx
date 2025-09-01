import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Users, 
  Gift, 
  Copy, 
  CheckCircle,
  Trophy,
  Clock,
  Star,
  ExternalLink
} from 'lucide-react';

const DashboardReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - em produção viria do backend
  const userPoints = 10;  // Valor inicial reduzido
  const referralCount = 0;  // Começar com 0 referrals
  const referralLink = `https://painel.lunnardatabase.com?ref=${user.id}`;
  
  const referralHistory = [
    { id: 1, email: 'usuario1@***', date: '2024-01-15', points: 250, status: 'confirmed', type: 'subscription' },
    { id: 2, email: 'usuario2@***', date: '2024-01-20', points: 10, status: 'confirmed', type: 'signup' },
    { id: 3, email: 'usuario3@***', date: '2024-01-25', points: 10, status: 'pending', type: 'signup' }
  ];

  const rewards = [
    { points: 100, reward: '7 dias de Premium', description: 'Acesso completo por uma semana' },
    { points: 250, reward: '15 dias de Premium', description: 'Acesso completo por duas semanas' },
    { points: 500, reward: '1 mês de Premium Plus', description: 'Acesso Premium Plus completo' },
    { points: 1000, reward: '3 meses de Platinum', description: 'Plano mais avançado por 3 meses' }
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência",
      duration: 3000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const canRedeem = (requiredPoints: number) => userPoints >= requiredPoints;

  const redeemReward = (requiredPoints: number, reward: string) => {
    if (canRedeem(requiredPoints)) {
      toast({
        title: "Recompensa resgatada!",
        description: `Você resgatou: ${reward}`,
        duration: 4000,
      });
    } else {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${requiredPoints - userPoints} pontos a mais`,
        variant: "destructive",
        duration: 3000,
      });
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
                <h1 className="text-xl font-semibold text-foreground">Programa de Indicações</h1>
                <p className="text-sm text-muted-foreground">
                  Indique amigos e ganhe pontos para trocar por tempo de uso
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-6xl space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{userPoints}</p>
                      <p className="text-sm text-muted-foreground">Pontos Disponíveis</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{referralCount}</p>
                      <p className="text-sm text-muted-foreground">Indicações</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-bright to-primary rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-bright">10</p>
                      <p className="text-sm text-muted-foreground">Pontos por Cadastro</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Link de Indicação */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Seu Link de Indicação</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Compartilhe este link com seus amigos e ganhe pontos quando eles se cadastrarem ou assinarem!
                  </p>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={referralLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={copyReferralLink} className="flex items-center gap-2">
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(referralLink, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Testar
                    </Button>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium text-primary mb-2">Como funciona:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Compartilhe seu link de indicação</li>
                      <li>• Quando alguém se cadastrar pelo seu link, você ganha 10 pontos</li>
                      <li>• Se a pessoa assinar um plano, você ganha 250 pontos</li>
                      <li>• O novo usuário também ganha 25 pontos de bônus</li>
                      <li>• Use seus pontos para resgatar tempo de uso premium</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Recompensas Disponíveis */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Recompensas Disponíveis</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map((reward, index) => (
                      <div key={index} className="bg-background-secondary rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-foreground">{reward.reward}</h4>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                          <Badge className="bg-primary/20 text-primary">
                            {reward.points} pts
                          </Badge>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant={canRedeem(reward.points) ? "default" : "outline"}
                          disabled={!canRedeem(reward.points)}
                          onClick={() => redeemReward(reward.points, reward.reward)}
                        >
                          {canRedeem(reward.points) ? 'Resgatar' : `Faltam ${reward.points - userPoints} pts`}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Histórico de Indicações */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-bright" />
                    <h3 className="text-lg font-semibold text-foreground">Histórico de Indicações</h3>
                  </div>
                  
                  {referralHistory.length > 0 ? (
                    <div className="space-y-3">
                      {referralHistory.map((referral) => (
                        <div key={referral.id} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              referral.status === 'confirmed' 
                                ? 'bg-green-500/20 border-2 border-green-500' 
                                : 'bg-yellow-500/20 border-2 border-yellow-500'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                referral.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{referral.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(referral.date).toLocaleDateString('pt-BR')} - {referral.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={`${
                              referral.status === 'confirmed' 
                                ? referral.points === 250 ? 'bg-purple-500/20 text-purple-500' : 'bg-green-500/20 text-green-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              +{referral.points} pts
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {referral.status === 'confirmed' 
                                ? (referral.points === 250 ? 'Assinatura' : 'Cadastro')
                                : 'Pendente'
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-medium text-foreground mb-2">
                        Nenhuma indicação ainda
                      </h4>
                      <p className="text-muted-foreground">
                        Compartilhe seu link e comece a ganhar pontos!
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardReferral;