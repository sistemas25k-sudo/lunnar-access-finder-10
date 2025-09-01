import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  userId: string | 'all';
  createdAt: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pushEnabled: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  enablePushNotifications: () => Promise<boolean>;
  sendTestNotification: () => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
    // Carregar notificações salvas do localStorage
    if (user) {
      const savedNotifications = localStorage.getItem(`lunnar_notifications_${user.id}`);
      const globalNotifications = localStorage.getItem('lunnar_notifications_global');
      
      const userNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      const allNotifications = globalNotifications ? JSON.parse(globalNotifications) : [];
      
      // Combinar notificações do usuário e globais
      const combined = [
        ...userNotifications,
        ...allNotifications.filter((n: Notification) => n.userId === 'all')
      ].map(n => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
      
      setNotifications(combined);
      checkPushSubscription();
    }
  }, [user]);

  const checkNotificationSupport = () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushEnabled(Notification.permission === 'granted');
    }
  };

  const checkPushSubscription = async () => {
    if (!user) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Sincronizar subscription com Supabase
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: subscription,
            endpoint: subscription.endpoint,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const saveNotifications = (newNotifications: Notification[]) => {
    if (user) {
      const userNotifications = newNotifications.filter(n => n.userId === user.id);
      const globalNotifications = newNotifications.filter(n => n.userId === 'all');
      
      localStorage.setItem(`lunnar_notifications_${user.id}`, JSON.stringify(userNotifications));
      
      // Salvar notificações globais separadamente
      const existingGlobal = localStorage.getItem('lunnar_notifications_global');
      const allGlobal = existingGlobal ? JSON.parse(existingGlobal) : [];
      const updatedGlobal = [...allGlobal, ...globalNotifications];
      localStorage.setItem('lunnar_notifications_global', JSON.stringify(updatedGlobal));
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    // Mostrar toast para notificações de alta prioridade
    if (notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearAll = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`lunnar_notifications_${user.id}`);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Notificações bloqueadas",
        description: "Habilite as notificações nas configurações do navegador",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setPushEnabled(granted);

    if (granted) {
      toast({
        title: "Notificações habilitadas!",
        description: "Você receberá alertas sobre suas buscas"
      });
    }

    return granted;
  };

  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      const granted = await requestPermission();
      if (!granted || !user) return false;

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID key (em produção, usar uma chave específica)
      const vapidPublicKey = 'BMqSvZkj8rqV5Q8OQ5H4J5qN7Hy2V3r4H9rQ2X8Y1N6P7t9';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Salvar subscription no Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subscription,
          endpoint: subscription.endpoint,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Push notifications ativadas!",
        description: "Você receberá notificações quando suas buscas ficarem prontas"
      });

      return true;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: "Erro ao ativar notificações",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendTestNotification = () => {
    if (!pushEnabled) {
      toast({
        title: "Notificações desabilitadas",
        description: "Habilite as notificações primeiro",
        variant: "destructive"
      });
      return;
    }

    new Notification('Painel Lunnar - Teste', {
      body: 'Suas notificações estão funcionando perfeitamente!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification',
      timestamp: Date.now(),
      requireInteraction: false
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pushEnabled,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        enablePushNotifications,
        sendTestNotification,
        requestPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};