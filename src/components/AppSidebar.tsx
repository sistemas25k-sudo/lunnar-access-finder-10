import { Search, History, Settings, LogOut, User, Crown, TrendingUp, Users, Shield, ShieldCheck } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import painelLogo from '@/assets/painel-logo.png';

const menuItems = [
  {
    title: 'Buscar Acessos',
    url: '/dashboard',
    icon: Search,
  },
  {
    title: 'Histórico',
    url: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Indicações',
    url: '/dashboard/referral',
    icon: Users,
  },
  {
    title: 'Checker',
    url: '/dashboard/checker',
    icon: Shield,
  },
  {
    title: 'Configurações',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

const planColors = {
  free: 'bg-secondary text-secondary-foreground',
  light: 'bg-primary/20 text-primary',
  premium: 'bg-accent/20 text-accent',
  'premium-plus': 'bg-primary-bright/20 text-primary-bright',
  platinum: 'bg-gradient-to-r from-primary to-primary-bright text-white'
};

const planNames = {
  free: 'Grátis',
  light: 'Light',
  premium: 'Premium',
  'premium-plus': 'Premium Plus',
  platinum: 'Platinum'
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };
  
  const getNavCls = (path: string) =>
    isActive(path) 
      ? 'bg-primary/20 text-primary font-medium border-r-2 border-primary' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-center">
          <img src={painelLogo} alt="Logo" className="h-8 w-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} transition-all duration-200`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {profile?.is_admin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin" 
                      className={`${getNavCls('/admin')} transition-all duration-200`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {!isCollapsed && <span>Painel Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>Estatísticas</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 p-3 bg-card rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Buscas hoje</span>
                  <span className="text-sm font-semibold text-foreground">
                    {`${profile?.searches_used || 0}/${profile?.searches_limit || 3}`}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((profile?.searches_used || 0) / (profile?.searches_limit || 3)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <Badge className={planColors[profile?.plan || 'free']}>
                  <Crown className="w-3 h-3 mr-1" />
                  Plano {planNames[profile?.plan || 'free']}
                </Badge>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.name || user?.email || 'Usuário'}
                </p>
                {profile?.is_admin && (
                  <Badge className="bg-primary/20 text-primary text-xs px-2 py-0.5">
                    ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}