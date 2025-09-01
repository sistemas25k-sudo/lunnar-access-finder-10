import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentQRCodeProps {
  qrCodeText: string;
  amount: number;
}

export const PaymentQRCode = ({ qrCodeText, amount }: PaymentQRCodeProps) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCode = await QRCode.toDataURL(qrCodeText, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256
        });
        setQrCodeImage(qrCode);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    };

    if (qrCodeText) {
      generateQRCode();
    }
  }, [qrCodeText]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeText);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código PIX foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-primary">
          Pagamento PIX
        </CardTitle>
        <p className="text-2xl font-bold text-green-600">
          R$ {amount.toFixed(2).replace('.', ',')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeImage && (
          <div className="flex justify-center">
            <img 
              src={qrCodeImage} 
              alt="QR Code PIX" 
              className="border rounded-lg shadow-sm"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Código PIX (Copia e Cola):
          </p>
          <div className="relative">
            <textarea
              value={qrCodeText}
              readOnly
              className="w-full p-3 text-xs border rounded-lg bg-muted/50 resize-none font-mono"
              rows={4}
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <p className="font-medium">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção PIX</li>
            <li>Escaneie o QR Code ou cole o código acima</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Este PIX expira em 24 horas
        </div>
      </CardContent>
    </Card>
  );
};