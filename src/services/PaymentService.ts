interface PaymentData {
  amount: number;
  paymentMethod: string;
  customer: {
    name: string;
    email: string;
    document: {
      number: string;
      type: string;
    };
    phone: string;
    externalRef: string;
  };
  pix: {
    expiresInDays: number;
  };
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
    tangible: boolean;
  }>;
}

interface PaymentResponse {
  success: boolean;
  data: {
    id: number;
    status: string;
    amount: number;
    pix: {
      qrcode: string;
      expirationDate: string;
    };
    customer: {
      name: string;
      email: string;
      document: {
        number: string;
        type: string;
      };
    };
  };
}

// Dados pré-definidos do usuário
const PREDEFINED_USER = {
  name: 'MARIA DA SILVA',
  cpf: '08096843303',
  email: 'TESTE@LUNNAR.COM',
  phone: '2198767676'
};

// Chaves da API
const API_PUBLIC_KEY = 'sk_bge6huC3myNVBrRaGmlRi9ywGszOKJkXSX-ivwHV4ozK2lV0';
const API_SECRET_KEY = 'pk_FoWJXp_GzlQm_AtkENHx-hwyaUBsq_HSeC5YX6jDedEDR4lK';
const API_BASE_URL = 'https://api.novaera-pagamentos.com/api/v1';

export class PaymentService {
  static async createPixPayment(valor: number): Promise<PaymentResponse> {
    const valorCents = Math.round(valor * 100);
    
    const paymentData: PaymentData = {
      amount: valorCents,
      paymentMethod: "pix",
      customer: {
        name: PREDEFINED_USER.name,
        email: PREDEFINED_USER.email,
        document: {
          number: PREDEFINED_USER.cpf,
          type: "cpf"
        },
        phone: PREDEFINED_USER.phone,
        externalRef: `ref-${PREDEFINED_USER.cpf}-${Date.now()}`
      },
      pix: {
        expiresInDays: 1
      },
      items: [
        {
          title: "Pagamento Painel Lunnar",
          unitPrice: valorCents,
          quantity: 1,
          tangible: false
        }
      ]
    };

    const auth = btoa(`${API_PUBLIC_KEY}:${API_SECRET_KEY}`);

    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error('Falha ao processar pagamento. Tente novamente.');
    }
  }

  static async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    const auth = btoa(`${API_PUBLIC_KEY}:${API_SECRET_KEY}`);

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw new Error('Falha ao verificar status do pagamento.');
    }
  }

  static getUserData() {
    return PREDEFINED_USER;
  }
}