import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppSupport = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '551151233478';
    const message = encodeURIComponent('Olá! Preciso de suporte com o Painel Lunnar.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 p-0 z-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
      title="Suporte via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};