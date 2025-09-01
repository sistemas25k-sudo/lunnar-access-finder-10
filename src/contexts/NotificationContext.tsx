import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

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
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
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
    }
  }, [user]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
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