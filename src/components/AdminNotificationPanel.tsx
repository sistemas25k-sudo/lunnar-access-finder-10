import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Bell, 
  Users, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';

interface AdminNotificationPanelProps {
  users: Array<{
    id: string;
    user_id: string;
    name: string;
    email?: string;
    plan: string;
    searches_used: number;
    searches_limit: number;
    created_at: string;
    is_admin: boolean;
  }>;
}

export const AdminNotificationPanel = ({ users }: AdminNotificationPanelProps) => {
  const { addNotification, notifications, deleteNotification } = useNotifications();
  const { toast } = useToast();
  
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Notification['type']>('info');
  const [priority, setPriority] = useState<Notification['priority']>('medium');

  const handleSendNotification = () => {
    if (!title || !message) {
      toast({
        title: "Erro",
        description: "Preencha o título e a mensagem",
        variant: "destructive",
      });
      return;
    }

    if (target === 'specific' && !selectedUserId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário",
        variant: "destructive",
      });
      return;
    }

    addNotification({
      title,
      message,
      type,
      userId: target === 'all' ? 'all' : selectedUserId,
      priority
    });

    toast({
      title: "Aviso enviado",
      description: target === 'all' 
        ? "Aviso enviado para todos os usuários" 
        : `Aviso enviado para o usuário selecionado`,
    });

    // Limpar formulário
    setTitle('');
    setMessage('');
    setSelectedUserId('');
    setTarget('all');
    setType('info');
    setPriority('medium');
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-500';
      case 'warning': return 'bg-yellow-500/20 text-yellow-500';
      case 'success': return 'bg-green-500/20 text-green-500';
      case 'error': return 'bg-red-500/20 text-red-500';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-500/20 text-gray-500';
      case 'medium': return 'bg-orange-500/20 text-orange-500';
      case 'high': return 'bg-red-500/20 text-red-500';
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulário de Envio */}
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Enviar Aviso
          </CardTitle>
          <CardDescription>
            Envie avisos e notificações para os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Destinatário */}
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <RadioGroup value={target} onValueChange={(v) => setTarget(v as 'all' | 'specific')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Todos os usuários
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Usuário específico
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seleção de usuário */}
          {target === 'specific' && (
            <div className="space-y-2">
              <Label>Selecione o usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.user_id}>
                      {user.name} (ID: {user.user_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tipo de Notificação */}
          <div className="space-y-2">
            <Label>Tipo de Aviso</Label>
            <Select value={type} onValueChange={(v) => setType(v as Notification['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Informação
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Aviso
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Sucesso
                  </div>
                </SelectItem>
                <SelectItem value="error">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Erro
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Notification['priority'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta (mostra popup)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Título do aviso"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite a mensagem do aviso..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Botão de Envio */}
          <Button 
            onClick={handleSendNotification}
            className="w-full"
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Aviso
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Notificações */}
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Avisos Recentes
          </CardTitle>
          <CardDescription>
            Últimos avisos enviados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum aviso enviado ainda
              </p>
            ) : (
              recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 bg-background-secondary rounded-lg border border-border space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.userId === 'all' ? 'Todos' : 'Individual'}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority === 'low' && 'Baixa'}
                        {notification.priority === 'medium' && 'Média'}
                        {notification.priority === 'high' && 'Alta'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};