interface SearchResult {
  url: string;
  user: string;
  pass: string;
}

interface ApiResponse {
  tempo_de_busca: string;
  total_encontrados: number;
  resultados: SearchResult[];
}

interface SearchHistoryItem {
  id: string;
  url: string;
  timestamp: Date;
  results: ApiResponse;
}

const API_BASE_URL = 'https://mdzapis.com/apimdz/logs';
const API_KEY = '@amaralcoder45';

export class ApiService {
  static async searchCredentials(url: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}?url=${encodeURIComponent(url)}&apikey=${API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching credentials:', error);
      // Fallback para dados mock em caso de erro
      return {
        tempo_de_busca: "Erro na conexão",
        total_encontrados: 0,
        resultados: []
      };
    }
  }

  static saveSearchToHistory(url: string, results: ApiResponse): void {
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      url,
      timestamp: new Date(),
      results
    };

    const existingHistory = this.getSearchHistory();
    const newHistory = [historyItem, ...existingHistory.slice(0, 49)]; // Manter apenas os 50 mais recentes
    
    localStorage.setItem('lunnar_search_history', JSON.stringify(newHistory));
  }

  static getSearchHistory(): SearchHistoryItem[] {
    const history = localStorage.getItem('lunnar_search_history');
    if (!history) return [];
    
    try {
      const parsed = JSON.parse(history);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch {
      return [];
    }
  }

  static clearSearchHistory(): void {
    localStorage.removeItem('lunnar_search_history');
  }

  static updateUserSearchCount(): void {
    const user = localStorage.getItem('lunnar_user');
    if (user) {
      const userData = JSON.parse(user);
      
      userData.searchesUsed += 1;
      localStorage.setItem('lunnar_user', JSON.stringify(userData));
    }
  }
}