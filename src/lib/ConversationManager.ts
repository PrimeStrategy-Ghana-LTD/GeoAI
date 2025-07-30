import { v4 as uuidv4 } from 'uuid';
import api from '../utils/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  isPinned: boolean;
  messages: Message[];
  createdAt: Date;
  lastActive: Date;
}

class ConversationManager {
  private static instance: ConversationManager;
  private conversations: Conversation[] = [];
  private currentConversationId: string | null = null;

  private constructor() {
    this.loadConversations();
  }

  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  private loadConversations(): void {
    const saved = localStorage.getItem('landai-conversations');
    if (saved) {
      this.conversations = JSON.parse(saved, (key, value) => {
        if (['timestamp', 'createdAt', 'lastActive'].includes(key)) {
          return new Date(value);
        }
        return value;
      });
    }
  }

  private persistConversations(): void {
    localStorage.setItem('landai-conversations', JSON.stringify(this.conversations));
  }

  public startNewConversation(userMessage: string): Conversation {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: userMessage.substring(0, 50) || 'New Conversation',
      isPinned: false,
      messages: [],
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.conversations.unshift(newConversation);
    this.currentConversationId = newConversation.id;
    this.persistConversations();

    return newConversation;
  }

  public async addUserMessage(
    content: string,
    options?: { abortSignal?: AbortSignal }
  ): Promise<Message> {
    if (!this.currentConversationId) {
      this.startNewConversation(content);
    }

    const conversation = this.getCurrentConversation();
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);
    conversation.lastActive = new Date();
    this.persistConversations();

    return this.getAIResponse(conversation, options?.abortSignal);
  }

  private async getAIResponse(
    conversation: Conversation,
    abortSignal?: AbortSignal
  ): Promise<Message> {
    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1].content;
      const { answer } = await api.query(lastMessage, {
        conversationId: conversation.id,
        signal: abortSignal
      });

      const aiMessage: Message = {
        id: uuidv4(),
        content: answer,
        role: 'assistant',
        timestamp: new Date()
      };

      conversation.messages.push(aiMessage);
      conversation.lastActive = new Date();
      this.persistConversations();

      return aiMessage;
    } catch (error) {
      console.error('Failed to get AI response:', error);
      throw error;
    }
  }

  public getConversations(): Conversation[] {
    return [...this.conversations].sort((a, b) => {
      const aPriority = a.isPinned ? 1 : 0;
      const bPriority = b.isPinned ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.lastActive.getTime() - a.lastActive.getTime();
    });
  }

  public getCurrentConversation(): Conversation {
    if (!this.currentConversationId) {
      throw new Error('No active conversation');
    }
    const conversation = this.conversations.find(c => c.id === this.currentConversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return conversation;
  }

  public getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  public setActiveConversation(id: string): void {
    const exists = this.conversations.some(c => c.id === id);
    if (!exists) {
      throw new Error('Conversation not found');
    }
    this.currentConversationId = id;
  }

  public deleteConversation(id: string): void {
    this.conversations = this.conversations.filter(c => c.id !== id);
    if (this.currentConversationId === id) {
      this.currentConversationId = null;
    }
    this.persistConversations();
  }

  public togglePin(id: string): void {
    const convo = this.conversations.find(c => c.id === id);
    if (convo) {
      convo.isPinned = !convo.isPinned;
      this.persistConversations();
    }
  }
}

export const conversationManager = ConversationManager.getInstance();
