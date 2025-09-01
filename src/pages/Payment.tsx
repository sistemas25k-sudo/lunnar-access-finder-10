import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentQRCode } from '@/components/PaymentQRCode';
import { PaymentStatus } from '@/components/PaymentStatus';
import { PaymentService } from '@/services/PaymentService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Clock } from 'lucide-react';

interface PaymentData {
  id: string;
  amount: number;
  qrCodeText: string;
}

export default function Payment() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Valor vem dos parâmetros da URL (ex: /payment?amount=29.90&plan=basic)
  const amount = parseFloat(searchParams.get('amount') || '29.90');
  const planName = searchParams.get('plan') || 'Plano Selecionado';

  // Timer de 15 minutos
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          toast({
            title: "PIX expirado",
            description: "O tempo para pagamento expirou. Gerando novo código...",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, toast]);

  // Gerar PIX automaticamente ao entrar na página
  useEffect(() => {
    const generatePix = async () => {
      if (!amount || amount <= 0) {
        toast({
          title: "Valor inválido",
          description: "Valor do pagamento não foi fornecido.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const response = await PaymentService.createPixPayment(amount);
        
        // Mapear dados da API para o formato esperado
        const mappedData: PaymentData = {
          id: response.data.id.toString(),
          amount: response.data.amount,
          qrCodeText: response.data.pix.qrcode
        };
        
        setPaymentData(mappedData);
        
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código para realizar o pagamento.",
        });
      } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        toast({
          title: "Erro ao gerar PIX",
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generatePix();
  }, [amount, toast, navigate]);

  const handlePaymentConfirmed = () => {
    toast({
      title: "Pagamento confirmado!",
      description: "Redirecionando para o dashboard...",
    });
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const regeneratePix = async () => {
    setLoading(true);
    setTimeLeft(15 * 60); // Reset timer
    
    try {
      const response = await PaymentService.createPixPayment(amount);
      
      // Mapear dados da API para o formato esperado
      const mappedData: PaymentData = {
        id: response.data.id.toString(),
        amount: response.data.amount,
        qrCodeText: response.data.pix.qrcode
      };
      
      setPaymentData(mappedData);
      
      toast({
        title: "Novo PIX gerado!",
        description: "Novo código PIX criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="absolute inset-0 hero-glow"></div>
        
        <Card className="glass border border-border">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Gerando seu PIX...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-30"></div>
      <div className="absolute inset-0 hero-glow"></div>
      
      <div className="w-full max-w-md relative">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Card className="glass border border-border overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-primary-light/10 border-b border-border">
            <CardTitle className="text-2xl font-bold text-foreground">
              Pagamento PIX
            </CardTitle>
            <p className="text-muted-foreground mb-2">
              {planName}
            </p>
            <p className="text-3xl font-bold text-primary">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </CardHeader>
        </Card>

        {/* Timer */}
        <Card className="glass border border-border mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Expira em:</span>
              <span className={`font-mono text-lg font-bold ${timeLeft <= 300 ? 'text-red-500' : 'text-orange-500'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            {timeLeft <= 0 && (
              <div className="mt-4 text-center">
                <p className="text-red-500 text-sm mb-3">Este PIX expirou</p>
                <Button onClick={regeneratePix} variant="outline" className="w-full">
                  Gerar Novo PIX
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code e código PIX */}
        {paymentData?.qrCodeText && timeLeft > 0 && (
          <>
            <PaymentQRCode 
              qrCodeText={paymentData.qrCodeText}
              amount={amount}
            />
            
            {/* Status do pagamento */}
            <div className="mt-6">
              <PaymentStatus 
                transactionId={paymentData.id}
                onPaymentConfirmed={handlePaymentConfirmed}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}