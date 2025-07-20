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
        if (key === 'timestamp' || key === 'createdAt' || key === 'lastActive') {
          return new Date(value);
        }
        return value;
      });
    }
  }

  private persistConversations(): void {
    localStorage.setItem(
      'landai-conversations',
      JSON.stringify(this.conversations)
    );
  }

  public startNewConversation(userMessage: string): Conversation {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: userMessage.substring(0, 50),
      messages: [],
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.conversations.unshift(newConversation);
    this.currentConversationId = newConversation.id;
    this.persistConversations();

    return newConversation;
  }

  public async addUserMessage(content: string): Promise<Message> {
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

    return this.getAIResponse(conversation);
  }

  private async getAIResponse(conversation: Conversation): Promise<Message> {
    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1].content;
      const { answer } = await api.query(lastMessage, { 
        conversationId: conversation.id 
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
    return [...this.conversations].sort(
      (a, b) => b.lastActive.getTime() - a.lastActive.getTime()
    );
  }

  public getCurrentConversation(): Conversation {
    if (!this.currentConversationId) {
      throw new Error('No active conversation');
    }
    const conversation = this.conversations.find(
      c => c.id === this.currentConversationId
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return conversation;
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
}

// Singleton export
export const conversationManager = ConversationManager.getInstance();