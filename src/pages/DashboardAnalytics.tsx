import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/ApiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  Shield,
  AlertTriangle,
  Database,
  Activity
} from 'lucide-react';

const DashboardAnalytics = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - em produção viria de uma API
  const searchHistory = ApiService.getSearchHistory();
  
  const searchTrends = [
    { month: 'Jan', searches: 45 },
    { month: 'Fev', searches: 67 },
    { month: 'Mar', searches: 89 },
    { month: 'Abr', searches: 123 },
    { month: 'Mai', searches: 156 },
    { month: 'Jun', searches: 178 }
  ];

  const topDomains = [
    { domain: 'netflix.com', searches: 45, credentials: 12 },
    { domain: 'spotify.com', searches: 38, credentials: 8 },
    { domain: 'amazon.com', searches: 29, credentials: 15 },
    { domain: 'gmail.com', searches: 24, credentials: 6 },
    { domain: 'facebook.com', searches: 18, credentials: 4 }
  ];

  const planDistribution = [
    { name: 'Free', value: 45, color: '#8B5CF6' },
    { name: 'Light', value: 25, color: '#06B6D4' },
    { name: 'Premium', value: 20, color: '#F59E0B' },
    { name: 'Premium Plus', value: 10, color: '#EF4444' }
  ];

  const stats = [
    {
      title: 'Buscas Totais',
      value: searchHistory.length,
      subtitle: 'este mês',
      icon: TrendingUp,
      color: 'text-primary',
      change: '+12%'
    },
    {
      title: 'Credenciais Encontradas',
      value: searchHistory.reduce((acc, item) => acc + item.results.total_encontrados, 0),
      subtitle: 'resultados válidos',
      icon: Shield,
      color: 'text-accent',
      change: '+8%'
    },
    {
      title: 'Sites Únicos',
      value: new Set(searchHistory.map(item => item.url)).size,
      subtitle: 'domínios pesquisados',
      icon: Globe,
      color: 'text-primary-bright',
      change: '+5%'
    },
    {
      title: 'Taxa de Sucesso',
      value: Math.round((searchHistory.filter(item => item.results.total_encontrados > 0).length / Math.max(searchHistory.length, 1)) * 100),
      subtitle: '% com resultados',
      icon: Activity,
      color: 'text-green-500',
      change: '+3%'
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
                <h1 className="text-xl font-semibold text-foreground">Analytics & Relatórios</h1>
                <p className="text-sm text-muted-foreground">
                  Análise detalhada de buscas e tendências da plataforma
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 max-w-7xl space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="glass p-6 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-500">
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">vs mês anterior</span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendência de Buscas */}
                <Card className="glass p-6 border border-border">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Tendência de Buscas</h3>
                      <p className="text-sm text-muted-foreground">Evolução mensal das buscas realizadas</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={searchTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="searches" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>

                {/* Distribuição de Planos */}
                <Card className="glass p-6 border border-border">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Distribuição de Planos</h3>
                      <p className="text-sm text-muted-foreground">Porcentagem de usuários por plano</p>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {planDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {planDistribution.map((plan, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: plan.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {plan.name}: {plan.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sites Mais Buscados */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Sites Mais Buscados</h3>
                    <p className="text-sm text-muted-foreground">Ranking dos domínios com mais buscas</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topDomains}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="domain" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="searches" fill="hsl(var(--primary))" />
                        <Bar dataKey="credentials" fill="hsl(var(--accent))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Relatório Executivo */}
              <Card className="glass p-6 border border-border">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Relatório Executivo</h3>
                    <p className="text-sm text-muted-foreground">Resumo das principais métricas e insights</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background-secondary rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-foreground">Volume de Dados</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total de {searchHistory.length} buscas realizadas, com média de{' '}
                        {Math.round(searchHistory.reduce((acc, item) => acc + item.results.total_encontrados, 0) / Math.max(searchHistory.length, 1))}{' '}
                        credenciais por busca.
                      </p>
                    </div>
                    
                    <div className="bg-background-secondary rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-accent" />
                        <h4 className="font-medium text-foreground">Segurança</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {topDomains.length} domínios únicos analisados, com foco em detecção de vazamentos.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardAnalytics;