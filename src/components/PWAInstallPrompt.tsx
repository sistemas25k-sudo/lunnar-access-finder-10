import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setIsDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 bg-card border shadow-lg md:left-auto md:right-6 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Instalar Painel Lunnar</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Instale o app para acesso rápido e notificações
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleInstall} className="text-xs">
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsDismissed(true)}
                className="text-xs"
              >
                Agora não
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};