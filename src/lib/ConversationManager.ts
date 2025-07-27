import { v4 as uuidv4 } from 'uuid';
import api from '@/utils/api';

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
    try {
      const saved = localStorage.getItem('landai-conversations');
      if (saved) {
        this.conversations = JSON.parse(saved, (key, value) => {
          if (['timestamp', 'createdAt', 'lastActive'].includes(key)) {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      this.conversations = [];
    }
  }

  private persistConversations(): void {
    try {
      localStorage.setItem(
        'landai-conversations',
        JSON.stringify(this.conversations)
      );
    } catch (error) {
      console.error('Failed to persist conversations:', error);
    }
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

  public async addAssistantMessage(content: string): Promise<void> {
    if (!this.currentConversationId) {
      throw new Error('No active conversation');
    }

    const conversation = this.getCurrentConversation();
    const aiMessage: Message = {
      id: uuidv4(),
      content,
      role: 'assistant',
      timestamp: new Date()
    };

    conversation.messages.push(aiMessage);
    conversation.lastActive = new Date();
    this.persistConversations();
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
      
      // Fallback message
      const fallbackMessage: Message = {
        id: uuidv4(),
        content: "I'm having trouble connecting. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };

      conversation.messages.push(fallbackMessage);
      this.persistConversations();
      
      return fallbackMessage;
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

  public searchConversations(query: string): Conversation[] {
    const lowerQuery = query.toLowerCase();
    return this.conversations.filter(
      convo =>
        convo.title.toLowerCase().includes(lowerQuery) ||
        convo.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
    );
  }
}

export const conversationManager = ConversationManager.getInstance();