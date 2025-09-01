import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Upload,
  Download,
  Activity,
  Globe
} from 'lucide-react';

interface CheckResult {
  url: string;
  username: string;
  password: string;
  status: 'success' | 'failed' | 'checking' | 'timeout';
  responseTime?: number;
  lastChecked: Date;
}

const DashboardChecker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [singleCredential, setSingleCredential] = useState({ url: '', username: '', password: '' });
  const [bulkCredentials, setBulkCredentials] = useState('');
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mock function - em produção seria uma API real
  const checkCredential = async (url: string, username: string, password: string): Promise<CheckResult> => {
    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simular resultados aleatórios
    const success = Math.random() > 0.3;
    const timeout = Math.random() > 0.9;
    
    return {
      url,
      username,
      password,
      status: timeout ? 'timeout' : (success ? 'success' : 'failed'),
      responseTime: Math.floor(1000 + Math.random() * 4000),
      lastChecked: new Date()
    };
  };

  const handleSingleCheck = async () => {
    if (!singleCredential.url || !singleCredential.username || !singleCredential.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para realizar a verificação",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newResult: CheckResult = {
      ...singleCredential,
      status: 'checking',
      lastChecked: new Date()
    };

    setCheckResults(prev => [newResult, ...prev]);
    setIsChecking(true);

    try {
      const result = await checkCredential(
        singleCredential.url,
        singleCredential.username,
        singleCredential.password
      );

      setCheckResults(prev => 
        prev.map(item => 
          item.url === result.url && item.username === result.username ? result : item
        )
      );

      toast({
        title: "Verificação concluída",
        description: `Credencial ${result.status === 'success' ? 'válida' : 'inválida'}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar a credencial",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsChecking(false);
      setSingleCredential({ url: '', username: '', password: '' });
    }
  };

  const handleBulkCheck = async () => {
    if (!bulkCredentials.trim()) {
      toast({
        title: "Lista vazia",
        description: "Adicione credenciais para verificação em massa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const lines = bulkCredentials.split('\n').filter(line => line.trim());
    const credentials = lines.map(line => {
      const parts = line.split(':');
      if (parts.length >= 3) {
        return { url: parts[0], username: parts[1], password: parts.slice(2).join(':') };
      }
      return null;
    }).filter(Boolean);

    if (credentials.length === 0) {
      toast({
        title: "Formato inválido",
        description: "Use o formato: site.com:usuario:senha (um por linha)",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsChecking(true);

    // Adicionar todas as credenciais como "checking"
    const newResults: CheckResult[] = credentials.map(cred => ({
      url: cred.url,
      username: cred.username,
      password: cred.password,
      status: 'checking' as const,
      lastChecked: new Date()
    }));

    setCheckResults(prev => [...newResults, ...prev]);

    // Verificar cada credencial
    for (const cred of credentials) {
      try {
        const result = await checkCredential(cred.url, cred.username, cred.password);
        setCheckResults(prev => 
          prev.map(item => 
            item.url === result.url && item.username === result.username ? result : item
          )
        );
      } catch (error) {
        console.error('Error checking credential:', error);
      }
    }

    setIsChecking(false);
    setBulkCredentials('');
    
    toast({
      title: "Verificação em massa concluída",
      description: `${credentials.length} credenciais verificadas`,
      duration: 4000,
    });
  };

  const exportResults = () => {
    const validCredentials = checkResults.filter(result => result.status === 'success');
    const csvContent = 'URL,Username,Password,Status,Response Time\n' + 
      validCredentials.map(result => 
        `${result.url},${result.username},${result.password},${result.status},${result.responseTime}ms`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credenciais_validas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'timeout':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      case 'checking':
        return 'bg-blue-500/20 text-blue-500';
      case 'timeout':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-muted';
    }
  };

  const stats = {
    total: checkResults.length,
    success: checkResults.filter(r => r.status === 'success').length,
    failed: checkResults.filter(r => r.status === 'failed').length,
    checking: checkResults.filter(r => r.status === 'checking').length
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
                <h1 className="text-xl font-semibold text-foreground">Checker de Credenciais</h1>
                <p className="text-sm text-muted-foreground">
                  Verifique se as credenciais encontradas ainda funcionam
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-6xl space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-xl font-bold text-primary">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-xl font-bold text-green-500">{stats.success}</p>
                      <p className="text-sm text-muted-foreground">Válidas</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-xl font-bold text-red-500">{stats.failed}</p>
                      <p className="text-sm text-muted-foreground">Inválidas</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-xl font-bold text-blue-500">{stats.checking}</p>
                      <p className="text-sm text-muted-foreground">Verificando</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Verificação Individual */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Verificação Individual</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Site (ex: netflix.com)"
                      value={singleCredential.url}
                      onChange={(e) => setSingleCredential(prev => ({ ...prev, url: e.target.value }))}
                    />
                    <Input
                      placeholder="Usuário/Email"
                      value={singleCredential.username}
                      onChange={(e) => setSingleCredential(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={singleCredential.password}
                      onChange={(e) => setSingleCredential(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSingleCheck} 
                    disabled={isChecking}
                    className="w-full md:w-auto"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isChecking ? 'Verificando...' : 'Verificar Credencial'}
                  </Button>
                </div>
              </Card>

              {/* Verificação em Massa */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Verificação em Massa</h3>
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Cole suas credenciais aqui, uma por linha:&#10;site.com:usuario:senha&#10;outro-site.com:email@email.com:senha123"
                      value={bulkCredentials}
                      onChange={(e) => setBulkCredentials(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Formato: site.com:usuario:senha (uma credencial por linha)
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBulkCheck} 
                      disabled={isChecking}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isChecking ? 'Verificando...' : 'Verificar em Massa'}
                    </Button>
                    
                    {stats.success > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={exportResults}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exportar Válidas
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Resultados */}
              {checkResults.length > 0 && (
                <Card className="glass p-6 border border-border">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Resultados da Verificação</h3>
                    
                    <div className="space-y-3 max-h-96 overflow-auto">
                      {checkResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-border">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getStatusIcon(result.status)}
                            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{result.url}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.username} • {result.lastChecked.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {result.responseTime && (
                              <span className="text-xs text-muted-foreground">
                                {result.responseTime}ms
                              </span>
                            )}
                            <Badge className={getStatusColor(result.status)}>
                              {result.status === 'success' ? 'Válida' : 
                               result.status === 'failed' ? 'Inválida' : 
                               result.status === 'checking' ? 'Verificando' : 'Timeout'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default DashboardChecker;