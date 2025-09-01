
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

export const useWelcomeNotification = () => {
  const { user, profile } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Verifica se o usuário acabou de se cadastrar (existe user mas ainda não tem profile completo)
    if (user && !profile) {
      // Adicionar um pequeno delay para garantir que o contexto de notificações está pronto
      const timer = setTimeout(() => {
        addNotification({
          title: '🎉 Bem-vindo ao Painel Lunnar!',
          message: 'Seu cadastro foi realizado com sucesso! Precisa de ajuda? Entre em contato conosco via WhatsApp clicando no botão verde no canto da tela.',
          type: 'success',
          userId: user.id,
          priority: 'high'
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, profile, addNotification]);
};
