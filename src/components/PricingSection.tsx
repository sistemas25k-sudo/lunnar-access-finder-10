import { Check, Crown, Zap, Star, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline' as const,
    gradient: 'from-secondary to-muted'
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
    buttonText: 'Assinar Light',
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
    buttonText: 'Assinar Premium',
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
    buttonText: 'Assinar Premium Plus',
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
    buttonText: 'Assinar Platinum',
    buttonVariant: 'outline' as const,
    gradient: 'from-primary to-primary-bright'
  }
];

export const PricingSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-16">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
            Planos & Preços
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Escolha o plano
            <span className="text-primary"> perfeito</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Planos flexíveis para todos os tipos de usuários. Comece grátis e escale conforme necessário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative p-6 glass border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg shadow-primary/20 red-glow' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.buttonVariant}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary-bright text-primary-foreground border-0' 
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

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Todos os planos incluem suporte técnico e atualizações automáticas.
            <br />
            <span className="text-primary">Cancele a qualquer momento.</span>
          </p>
        </div>
      </div>
    </section>
  );
};