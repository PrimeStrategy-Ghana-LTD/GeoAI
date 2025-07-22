const BASE_URL = import.meta.env.VITE_API_URL || 'https://nomar.up.railway.app';

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface QueryResponse {
  answer: string;
  conversation_id: string;
  processing_time?: number;
}

export class APIClient {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.fetchWrapper<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.fetchWrapper<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        organization: 'Land AI',
        location: 'Ghana'
      })
    });
  }

  async query(
    question: string,
    options: { conversationId?: string } = {}
  ): Promise<QueryResponse> {
    return this.fetchWrapper<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify({
        text: question,
        conversation_id: options.conversationId || this.sessionId
      })
    });
  }

  private async fetchWrapper<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    return response.json();
  }

  private async parseError(response: Response): Promise<Error> {
    try {
      const errorData = await response.json();
      return new Error(
        errorData.detail ||
        errorData.message ||
        `Request failed (${response.status})`
      );
    } catch {
      return new Error(response.statusText);
    }
  }
}

const api = new APIClient();
export default api;
