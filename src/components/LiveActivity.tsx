import { useState, useEffect } from 'react';
import { Users, Search, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: number;
  user: string;
  site: string;
  results: number;
  timestamp: Date;
}

const sampleSites = [
  'netflix.com', 'spotify.com', 'amazon.com', 'google.com', 'facebook.com',
  'instagram.com', 'linkedin.com', 'github.com', 'microsoft.com', 'apple.com',
  'twitter.com', 'youtube.com', 'tiktok.com', 'discord.com', 'reddit.com'
];

const sampleNames = [
  'Camila', 'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda', 'Lucas',
  'Juliana', 'Rafael', 'Beatriz', 'Gabriel', 'Larissa', 'Felipe', 'Amanda'
];

const generateRandomActivity = (): Activity => {
  const randomUser = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const randomSite = sampleSites[Math.floor(Math.random() * sampleSites.length)];
  const randomResults = Math.floor(Math.random() * 150) + 1;
  
  return {
    id: Date.now() + Math.random(),
    user: randomUser,
    site: randomSite,
    results: randomResults,
    timestamp: new Date()
  };
};

export const LiveActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalUsers, setTotalUsers] = useState(1247);
  const [todaySearches, setTodaySearches] = useState(3892);

  useEffect(() => {
    // Adicionar atividade inicial
    const initialActivities = Array.from({ length: 3 }, generateRandomActivity);
    setActivities(initialActivities);

    // Atualizar atividades a cada 3-5 segundos
    const interval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      
      // Incrementar contadores ocasionalmente
      if (Math.random() > 0.7) {
        setTotalUsers(prev => prev + 1);
        setTodaySearches(prev => prev + 1);
      }
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30 px-4 py-2">
            🟢 Sistema Online
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Atividade em
            <span className="text-primary"> tempo real</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estatísticas */}
          <div className="space-y-6">
            <Card className="glass p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Usuários ativos</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todaySearches.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Buscas hoje</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-bright to-accent rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                  <p className="text-sm text-muted-foreground">Taxa de sucesso</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Feed de Atividades */}
          <div className="lg:col-span-2">
            <Card className="glass p-6 border border-border h-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-foreground">Buscas Recentes</h3>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-hidden">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id}
                    className={`flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-border transition-all duration-500 ${
                      index === 0 ? 'animate-in slide-in-from-top-2 fade-in' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.user}</span> pesquisou{' '}
                          <span className="text-primary font-medium">{activity.site}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {activity.results} resultados
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};