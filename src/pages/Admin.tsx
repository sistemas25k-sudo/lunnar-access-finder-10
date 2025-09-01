import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AdminNotificationPanel } from '@/components/AdminNotificationPanel';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Search, 
  Shield, 
  Plus, 
  Trash2, 
  Edit3,
  TrendingUp,
  DollarSign,
  Activity,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Bell
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  plan: 'free' | 'light' | 'premium' | 'premium-plus' | 'platinum';
  searches_used: number;
  searches_limit: number;
  created_at: string;
  is_admin: boolean;
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  plan: string;
  status: string;
  created_at: string;
  transaction_id?: string;
  payment_method?: string;
}

interface SearchData {
  id: string;
  user_id: string;
  url: string;
  status: string;
  created_at: string;
  completed_at?: string;
  results_count: number;
}

interface AnalyticsData {
  totalRevenue: string;
  monthlyGrowth: string;
  totalUsers: number;
  activeSearches: number;
  totalSearches: number;
  planDistribution: Record<string, number>;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searches, setSearches] = useState<SearchData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 'R$ 0,00',
    monthlyGrowth: '+0%',
    totalUsers: 0,
    activeSearches: 0,
    totalSearches: 0,
    planDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check for admin authentication via localStorage (simple approach)
  const isAdminAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Fetch data from Supabase
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch searches
      const { data: searchesData, error: searchesError } = await supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchesError) throw searchesError;

      setUsers(usersData || []);
      setPayments(paymentsData || []);
      setSearches(searchesData || []);

      // Calculate analytics
      calculateAnalytics(usersData || [], paymentsData || [], searchesData || []);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do painel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (users: User[], payments: Payment[], searches: SearchData[]) => {
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const planCounts = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = users.length;
    const planDistribution = Object.entries(planCounts).reduce((acc, [plan, count]) => {
      acc[plan] = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);

    setAnalytics({
      totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      monthlyGrowth: '+12.5%', // This would need more complex calculation
      totalUsers: users.length,
      activeSearches: searches.filter(s => s.status === 'pending').length,
      totalSearches: searches.length,
      planDistribution
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.user_id !== userId));
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover usuário.",
        variant: "destructive",
      });
    }
  };

  const handlePromoteUser = async (userId: string, newPlan: User['plan']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan: newPlan,
          searches_limit: getPlanLimit(newPlan)
        })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.user_id === userId 
          ? { ...u, plan: newPlan, searches_limit: getPlanLimit(newPlan) }
          : u
      ));

      toast({
        title: "Plano atualizado",
        description: `Usuário promovido para ${newPlan} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano do usuário.",
        variant: "destructive",
      });
    }
  };

  const getPlanLimit = (plan: User['plan']): number => {
    switch (plan) {
      case 'free': return 3;
      case 'light': return 100;
      case 'premium': return 500;
      case 'premium-plus': return 1000;
      case 'platinum': return 10000;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-muted text-muted-foreground';
      case 'light': return 'bg-blue-500/20 text-blue-600';
      case 'premium': return 'bg-primary/20 text-primary';
      case 'premium-plus': return 'bg-orange-500/20 text-orange-600';
      case 'platinum': return 'bg-yellow-500/20 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Filter users based on search term and plan
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 cyber-grid opacity-30"></div>
      <div className="absolute inset-0 hero-glow"></div>
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Painel Administrativo
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie usuários, planos, métricas e todo o sistema
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('admin_authenticated');
                navigate('/');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Sair do Admin
            </Button>
          </div>
        </header>

        <div className="container mx-auto p-6 max-w-7xl space-y-6">
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{analytics.totalRevenue}</p>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-xs text-green-500">{analytics.monthlyGrowth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{analytics.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Usuários</p>
                    <p className="text-xs text-green-500">{users.filter(u => !u.is_admin).length} usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-bright to-primary rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{analytics.totalSearches}</p>
                    <p className="text-sm text-muted-foreground">Total Buscas</p>
                    <p className="text-xs text-green-500">{analytics.activeSearches} ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">{payments.length}</p>
                    <p className="text-sm text-muted-foreground">Total Pagamentos</p>
                    <p className="text-xs text-green-500">{payments.filter(p => p.status === 'completed').length} concluídos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Principais */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Avisos
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Planos
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            {/* Tab: Usuários */}
            <TabsContent value="users" className="space-y-6">
              <Card className="glass border border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gerenciar Usuários
                    </CardTitle>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Usuário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-4">
                      <Input 
                        placeholder="Buscar por email ou nome..." 
                        className="max-w-sm" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Select value={filterPlan} onValueChange={setFilterPlan}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os planos</SelectItem>
                          <SelectItem value="free">Grátis</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="premium-plus">Premium Plus</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lista de Usuários */}
                    <div className="space-y-3">
                      {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {user.user_id}</p>
                                <p className="text-xs text-muted-foreground">
                                  Cadastro: {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                {user.is_admin && (
                                  <Badge variant="secondary" className="w-fit mt-1">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={getPlanColor(user.plan)}>
                                {user.plan}
                              </Badge>
                              <div className="text-right">
                                <p className="text-sm font-medium">{user.searches_used}/{user.searches_limit}</p>
                                <p className="text-xs text-muted-foreground">buscas</p>
                              </div>
                              
                              {!user.is_admin && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePromoteUser(user.user_id, user.plan === 'free' ? 'premium' : 'free')}
                                    title="Promover/Rebaixar plano"
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(user.user_id)}
                                    title="Remover usuário"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Notificações */}
            <TabsContent value="notifications" className="space-y-6">
              <AdminNotificationPanel users={users} />
            </TabsContent>

            {/* Tab: Planos */}
            <TabsContent value="plans" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Distribuição de Planos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.planDistribution).map(([plan, percentage]) => (
                        <div key={plan} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{plan}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Ações Manuais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Ativar Plano Manual
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Alterar Preços
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Crown className="w-4 h-4 mr-2" />
                      Criar Promoção
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Pagamentos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 bg-card rounded border">
                          <div>
                            <p className="font-medium">R$ {Number(payment.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{payment.plan}</p>
                          </div>
                          <Badge 
                            className={payment.status === 'completed' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-600'}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                      {payments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Nenhum pagamento encontrado</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Buscas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {searches.slice(0, 5).map((search) => (
                        <div key={search.id} className="flex justify-between items-center p-3 bg-card rounded border">
                          <div>
                            <p className="font-medium text-sm">{search.url.substring(0, 30)}...</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(search.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge 
                            className={
                              search.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                              search.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                              'bg-red-500/20 text-red-600'
                            }
                          >
                            {search.status}
                          </Badge>
                        </div>
                      ))}
                      {searches.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Nenhuma busca encontrada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Resumo do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Usuários</span>
                        <span className="font-bold">{analytics.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuários Admin</span>
                        <span className="font-bold">{users.filter(u => u.is_admin).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receita Total</span>
                        <span className="font-bold text-green-600">{analytics.totalRevenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Buscas Ativas</span>
                        <span className="font-bold text-yellow-600">{analytics.activeSearches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sistema</span>
                        <Badge className="bg-green-500/20 text-green-600">Online</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Sistema */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Status do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>API Principal</span>
                      <Badge className="bg-green-500/20 text-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Banco de Dados</span>
                      <Badge className="bg-green-500/20 text-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sistema de Pagamento</span>
                      <Badge className="bg-green-500/20 text-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cache Redis</span>
                      <Badge className="bg-yellow-500/20 text-yellow-500">Lento</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border border-border">
                  <CardHeader>
                    <CardTitle>Ações Administrativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Limpar Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Modo Manutenção
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;