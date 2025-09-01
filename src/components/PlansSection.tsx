import { Check, Crown, Zap, Star, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    icon: Zap,
    popular: false,
    description: 'Ideal para testar a plataforma',
    features: [
      '3 consultas por dia',
      'Até 5 resultados por consulta',
      'Histórico básico',
      'Suporte por email'
    ],
    buttonText: 'Plano Atual',
    buttonVariant: 'outline' as const,
    gradient: 'from-secondary to-muted',
    current: true
  },
  {
    name: 'Light',
    price: 'R$ 15',
    period: '/mês',
    icon: Star,
    popular: true,
    description: 'Para uso pessoal regular',
    features: [
      '20 consultas por dia',
      'Até 10 resultados por consulta',
      'Histórico completo',
      'Suporte prioritário',
      'Exportar resultados'
    ],
    buttonText: 'Fazer Upgrade',
    buttonVariant: 'default' as const,
    gradient: 'from-primary to-primary-light'
  },
  {
    name: 'Premium',
    price: 'R$ 35',
    period: '/mês',
    icon: Crown,
    popular: false,
    description: 'Para usuários avançados',
    features: [
      '40 consultas por dia',
      'Até 15 resultados por consulta',
      'Histórico ilimitado',
      'API de acesso',
      'Suporte 24/7',
      'Relatórios detalhados'
    ],
    buttonText: 'Fazer Upgrade',
    buttonVariant: 'outline' as const,
    gradient: 'from-accent to-primary'
  },
  {
    name: 'Premium Plus',
    price: 'R$ 59,90',
    period: '/mês',
    icon: Diamond,
    popular: false,
    description: 'Máxima performance',
    features: [
      '70 consultas por dia',
      'Até 20 resultados por consulta',
      'Busca em lote',
      'Integrações avançadas',
      'Gerente dedicado',
      'SLA garantido'
    ],
    buttonText: 'Fazer Upgrade',
    buttonVariant: 'outline' as const,
    gradient: 'from-primary-bright to-accent'
  },
  {
    name: 'Platinum',
    price: 'R$ 99,90',
    period: '/mês',
    icon: Crown,
    popular: false,
    description: 'Solução empresarial',
    features: [
      '200 consultas por dia',
      'Resultados ilimitados',
      'Busca prioritária',
      'White-label',
      'Customizações',
      'Onboarding dedicado'
    ],
    buttonText: 'Fazer Upgrade',
    buttonVariant: 'outline' as const,
    gradient: 'from-primary to-primary-bright'
  }
];

export const PlansSection = () => {
  const navigate = useNavigate();

  const handleUpgrade = (planPrice: string, planName: string) => {
    // Extrair o valor numérico do preço (ex: "R$ 15" -> "15.00")
    const numericValue = planPrice.replace('R$ ', '').replace(',', '.');
    navigate(`/payment?amount=${numericValue}&plan=${encodeURIComponent(planName)}`);
  };
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
          Planos & Upgrades
        </Badge>
        <h2 className="text-3xl font-bold text-foreground">
          Escolha o plano
          <span className="text-primary"> perfeito</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Faça upgrade para ter mais consultas e recursos avançados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.name}
              className={`relative p-4 glass border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary shadow-md shadow-primary/20' 
                  : plan.current
                  ? 'border-secondary shadow-md shadow-secondary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-3 py-1 text-xs">
                    Mais Popular
                  </Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground px-3 py-1 text-xs">
                    Atual
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs">
                      <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.buttonVariant}
                  size="sm"
                  disabled={plan.current}
                  onClick={!plan.current ? () => handleUpgrade(plan.price, plan.name) : undefined}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright text-primary-foreground border-0' 
                      : plan.current
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Todos os planos incluem suporte técnico e atualizações automáticas.
          <br />
          <span className="text-primary">Cancele a qualquer momento.</span>
        </p>
      </div>
    </div>
  );
};