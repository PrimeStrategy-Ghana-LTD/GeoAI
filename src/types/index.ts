// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (credentials: AuthCredentials) => Promise<void>;
  onSwitchToSignup: () => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export interface SignupModalProps extends Omit<LoginModalProps, 'onLogin' | 'onSwitchToSignup'> {
  onSignup: (credentials: AuthCredentials) => Promise<void>;
  onSwitchToLogin: () => void;
}

// Conversation Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  isPinned: boolean;
  messages: Message[];
  createdAt: Date;
  lastActive: Date;
}

export interface ConversationManager {
  startNewConversation: (initialMessage?: string) => Conversation;
  getCurrentConversation: () => Conversation;
  setActiveConversation: (id: string) => void;
  addUserMessage: (content: string) => Promise<Message>;
  getConversations: () => Conversation[];
  getCurrentConversationId: () => string | null;
  deleteConversation: (id: string) => void;
  togglePin: (id: string) => void;
}