import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { PaymentService } from '@/services/PaymentService';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusProps {
  transactionId: string;
  onPaymentConfirmed?: () => void;
}

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export const PaymentStatus = ({ transactionId, onPaymentConfirmed }: PaymentStatusProps) => {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const { toast } = useToast();

  const checkPaymentStatus = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    try {
      const response = await PaymentService.checkPaymentStatus(transactionId);
      const newStatus = response.data.status.toLowerCase() as PaymentStatus;
      
      if (newStatus !== status) {
        setStatus(newStatus);
        
        if (newStatus === 'paid') {
          toast({
            title: "Pagamento confirmado!",
            description: "Seu pagamento foi processado com sucesso.",
          });
          setAutoCheck(false);
          onPaymentConfirmed?.();
        } else if (newStatus === 'failed') {
          toast({
            title: "Pagamento falhou",
            description: "Houve um problema com seu pagamento. Tente novamente.",
            variant: "destructive",
          });
          setAutoCheck(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast({
        title: "Erro ao verificar pagamento",
        description: "Não foi possível verificar o status. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoCheck || !transactionId) return;

    // Verificar imediatamente
    checkPaymentStatus();

    // Verificar a cada 5 segundos
    const interval = setInterval(() => {
      if (autoCheck) {
        checkPaymentStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, autoCheck]);

  const getStatusInfo = () => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: 'Pagamento Confirmado!',
          description: 'Seu pagamento foi processado com sucesso.',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-600" />,
          title: 'Pagamento Falhou',
          description: 'Houve um problema com seu pagamento. Tente novamente.',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-8 w-8 text-orange-600" />,
          title: 'Pagamento Expirado',
          description: 'O tempo para pagamento expirou. Gere um novo PIX.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-blue-600" />,
          title: 'Aguardando Pagamento',
          description: 'Estamos aguardando a confirmação do seu pagamento.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Status do Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`${statusInfo.bgColor} p-4 rounded-lg text-center`}>
          <div className="flex justify-center mb-2">
            {statusInfo.icon}
          </div>
          <h3 className={`font-semibold ${statusInfo.color}`}>
            {statusInfo.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {statusInfo.description}
          </p>
        </div>

        {status === 'pending' && (
          <div className="text-center">
            <Button
              onClick={checkPaymentStatus}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Pagamento
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Verificação automática a cada 5 segundos
            </p>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground">
          ID da Transação: {transactionId}
        </div>
      </CardContent>
    </Card>
  );
};