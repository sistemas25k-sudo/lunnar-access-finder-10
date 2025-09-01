import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Crown, 
  Settings, 
  Bell, 
  Shield, 
  Trash2, 
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { ApiService } from '@/services/ApiService';

const DashboardSettings = () => {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleExportData = () => {
    const history = ApiService.getSearchHistory();
    const dataToExport = {
      user: {
        name: profile?.name || user?.email || 'Usuário',
        email: user?.email,
        plan: profile?.plan
      },
      searchHistory: history,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunnar-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados!",
      description: "Seus dados foram baixados com sucesso",
      duration: 3000,
    });
  };

  const handleClearAllData = () => {
    ApiService.clearSearchHistory();
    toast({
      title: "Dados limpos!",
      description: "Todo o histórico de buscas foi removido",
      duration: 3000,
    });
  };

  const planInfo = {
    'free': { name: 'Grátis', color: 'bg-muted text-muted-foreground', icon: '🆓' },
    'light': { name: 'Light', color: 'bg-blue-500/20 text-blue-400', icon: '💎' },
    'premium': { name: 'Premium', color: 'bg-purple-500/20 text-purple-400', icon: '👑' },
    'premium-plus': { name: 'Premium Plus', color: 'bg-amber-500/20 text-amber-400', icon: '🌟' },
    'platinum': { name: 'Platinum', color: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white', icon: '💠' }
  };

  const currentPlan = planInfo[profile?.plan || 'free'];

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
                <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie sua conta e preferências
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-4xl space-y-8">
              
              {/* Informações da Conta */}
              <Card className="glass p-6 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Informações da Conta</h2>
                    <p className="text-sm text-muted-foreground">Gerencie seus dados pessoais</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={profile?.name || user?.email || 'Usuário'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Plano Atual</p>
                      <p className="text-sm text-muted-foreground">Sua assinatura ativa</p>
                    </div>
                  </div>
                  <Badge className={currentPlan.color}>
                    {currentPlan.icon} {currentPlan.name}
                  </Badge>
                </div>
              </Card>

              {/* Limites e Uso */}
              <Card className="glass p-6 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Uso e Limites</h2>
                    <p className="text-sm text-muted-foreground">Acompanhe seu consumo</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-background-secondary rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile?.searches_used || 0}</p>
                    <p className="text-sm text-muted-foreground">Buscas Utilizadas</p>
                  </div>
                  
                  <div className="text-center p-4 bg-background-secondary rounded-lg">
                    <p className="text-2xl font-bold text-accent">
                      {profile?.searches_limit || 3}
                    </p>
                    <p className="text-sm text-muted-foreground">Limite Diário</p>
                  </div>
                  
                  <div className="text-center p-4 bg-background-secondary rounded-lg">
                    <p className="text-2xl font-bold text-primary-bright">
                      {Math.max(0, (profile?.searches_limit || 3) - (profile?.searches_used || 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Restantes</p>
                  </div>
                </div>
              </Card>

              {/* Preferências */}
              <Card className="glass p-6 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-bright to-primary-bright/70 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Preferências</h2>
                    <p className="text-sm text-muted-foreground">Configure sua experiência</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Notificações</p>
                      <p className="text-sm text-muted-foreground">Receber alertas sobre buscas</p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Salvamento Automático</p>
                      <p className="text-sm text-muted-foreground">Salvar histórico automaticamente</p>
                    </div>
                    <Switch
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                  </div>
                </div>
              </Card>

              {/* Dados e Privacidade */}
              <Card className="glass p-6 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Dados e Privacidade</h2>
                    <p className="text-sm text-muted-foreground">Gerencie seus dados</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Dados
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleClearAllData}
                    className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Histórico
                  </Button>
                </div>
              </Card>

              {/* Ações da Conta */}
              <Card className="glass p-6 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Ações da Conta</h2>
                    <p className="text-sm text-muted-foreground">Opções avançadas</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={logout}
                    className="w-full"
                  >
                    Sair da Conta
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardSettings;