import React, { useEffect, useState, useRef } from 'react';
import { Mic, ChevronDown, Copy, Edit3, Loader2, RefreshCw, Menu, Send,
ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from './Sidebar';
import SearchChatsInterface from './SearchChatsInterface';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { loginUser, signupUser } from '@/services/authService';
import { conversationManager } from '@/lib/ConversationManager';

interface AppLayoutProps {}

const AppLayout: React.FC<AppLayoutProps> = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; isLoading?: boolean }[]
  >([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [userInitial, setUserInitial] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userPlan, setUserPlan] = useState<string>('Guest');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [guestName, setGuestName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fixed refresh function - always just reload the page
  const refreshPage = () => {
    window.location.reload();
  };

  const goToHome = () => {
    setCurrentView('home');
    setActiveChat(null);
    setMessages([]);
  };

  const openFeedbackForm = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdFgEILxhppb_GRV-T7LUsmLmHr1tbCavz-v8xgeEVwC-U3CA/viewform', '_blank');
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const name = localStorage.getItem('user_name');
    const savedGuestName = localStorage.getItem('guest_name');
    const plan = localStorage.getItem('user_plan');
    
    setIsLoggedIn(!!token);
    
    if (name) {
      setUserName(name);
      setUserInitial(name.charAt(0).toUpperCase());
      setUserPlan(plan || 'Pro'); // Default to Pro for logged in users
    } else if (savedGuestName) {
      setGuestName(savedGuestName);
      setUserInitial(savedGuestName.charAt(0).toUpperCase());
      setUserPlan('Guest');
    }

    if (!token) {
      const stored = localStorage.getItem('searchCount');
      setSearchCount(stored ? parseInt(stored, 10) : 0);
    }
   
    // Check if user has any existing conversations
    const conversations = conversationManager.getConversations();
    if (conversations.length > 0) {
      setHasStartedChatting(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('searchCount', String(searchCount));
    } else {
      localStorage.removeItem('searchCount');
    }
  }, [searchCount, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
    }
  }, [searchCount, isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDropdown && !(e.target as Element).closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleGoToHome = () => goToHome();
    window.addEventListener('goToHome', handleGoToHome);
    return () => window.removeEventListener('goToHome', handleGoToHome);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex <= 0) return;

    const userMessage = messages[messageIndex - 1].text;
    setIsLoading(true);
    setMessages(prev => [...prev.slice(0, messageIndex),
      { role: 'ai', text: '', isLoading: true }
    ]);

    try {
      const aiResponse = await conversationManager.addUserMessage(userMessage);
      setMessages(prev => {
        const updated = [...prev.slice(0, messageIndex)];
        updated[messageIndex] = {
          role: 'ai',
          text: aiResponse.content,
          isLoading: false
        };
        return updated;
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
      setMessages(prev => {
        const updated = [...prev.slice(0, messageIndex)];
        if (updated.length > messageIndex) {
          updated[messageIndex] = {
            role: 'ai',
            text: 'Sorry, something went wrong. Please try again.',
            isLoading: false
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
      return;
    }
   
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsMicActive(true);
    recognition.onresult = (e: any) => {
      setInputValue(e.results[0][0].transcript);
      recognition.stop();
    };
    recognition.onerror = () => setIsMicActive(false);
    recognition.onend = () => setIsMicActive(false);
    recognition.start();
  };

  const handleGuestNameSubmit = () => {
    if (guestName.trim()) {
      localStorage.setItem('guest_name', guestName.trim());
      setUserInitial(guestName.trim().charAt(0).toUpperCase());
      setUserPlan('Guest');
      setShowNamePrompt(false);
    }
  };

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('access_token', data.access_token);
     
      // Generate a unique display name for logged in users
      const displayName = (data as any).name || `User${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('user_name', displayName);
      localStorage.setItem('user_plan', 'Pro'); // Set plan for logged in users
      
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setUserInitial(displayName.charAt(0).toUpperCase());
      setUserName(displayName);
      setUserPlan('Pro');
      setSearchCount(0); // Reset search count for logged in users
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
      const data = await signupUser(email, password, name);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_plan', 'Pro'); // Set plan for new users
      
      setIsLoggedIn(true);
      setShowSignupModal(false);
      setUserInitial(name.charAt(0).toUpperCase());
      setUserName(name);
      setUserPlan('Pro');
      setSearchCount(0); // Reset search count for new users
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (userTextParam?: string) => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
      return;
    }

    // Check if guest needs to provide name
    if (!isLoggedIn && !guestName && !localStorage.getItem('guest_name')) {
      setShowNamePrompt(true);
      return;
    }

    const userText = (userTextParam || inputValue).trim();
    if (!userText) return;

    // First message - show sidebar and mark as started chatting
    if (!hasStartedChatting) {
      setHasStartedChatting(true);
    }

    setIsLoading(true);
    setCurrentView('chat');

    const controller = new AbortController();
    setAbortController(controller);

    setMessages(prev => [...prev,
      { role: 'user', text: userText },
      { role: 'ai', text: '', isLoading: true }
    ]);

    setInputValue('');

    if (!isLoggedIn) {
      setSearchCount(prev => prev + 1);
    }

    try {
      if (!activeChat) {
        const newConvo = conversationManager.startNewConversation(userText);
        if (!newConvo) throw new Error('Failed to create new conversation');
        setActiveChat(newConvo.id);
        conversationManager.setActiveConversation(newConvo.id);
      } else {
        conversationManager.setActiveConversation(activeChat);
      }

      const aiResponse = await conversationManager.addUserMessage(userText, {
        abortSignal: controller.signal
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'ai',
          text: aiResponse.content,
          isLoading: false
        };
        return updated;
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Message processing error:', error);
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].isLoading) {
            updated[updated.length - 1] = {
              role: 'ai',
              text: 'Sorry, something went wrong. Please try again.',
              isLoading: false
            };
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isLoading) {
          updated.pop();
        }
        return updated;
      });
    }
  };

  const handleBubbleClick = (text: string) => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
      return;
    }
   
    setInputValue(text);
    setTimeout(() => handleSendMessage(text), 50);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_plan');
    localStorage.removeItem('guest_name');
    setIsLoggedIn(false);
    setMessages([]);
    setCurrentView('home');
    setUserInitial('');
    setUserName('');
    setUserPlan('Guest');
    setGuestName('');
    setShowDropdown(false);
    setActiveChat(null);
    setHasStartedChatting(false);
    setIsSidebarOpen(false);
    setSearchCount(0);
  };

  const renderAuthDropdown = () => {
    return isLoggedIn ? (
      <div className="relative user-dropdown">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {userInitial}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-white text-sm font-medium">{userName}</span>
            <span className="text-gray-400 text-xs">{userPlan} Plan</span>
          </div>
          <ChevronDown size={14} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#2b2c33] text-white border border-gray-700 rounded shadow-md z-50">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-400">{userPlan} Plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[#3b3c44] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className="flex gap-4">
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-4 py-2 border border-blue-500 rounded-full text-blue-400 font-semibold text-sm hover:bg-blue-500 hover:text-white transition-all"
        >
          Login
        </button>
        <button
          onClick={() => setShowSignupModal(true)}
          className="px-4 py-2 border border-blue-500 rounded-full text-blue-400 font-semibold text-sm hover:bg-blue-500 hover:text-white transition-all"
        >
          Sign Up
        </button>
      </div>
    );
  };

const renderFeedbackButton = () => {
  // Calculate the right position based on sidebar state
  let rightPosition = 'right-4'; // Default position
  
  if (hasStartedChatting && currentView === 'chat') {
    if (isSidebarOpen) {
      rightPosition = 'right-4 md:right-[17rem]'; // 64px * 4 = 256px (w-64) + some padding
    } else {
      rightPosition = 'right-4 md:right-[5rem]'; // 16px * 4 = 64px (w-16) + some padding
    }
  }

  return (
    <button
      onClick={openFeedbackForm}
      className={`fixed bottom-4 z-40 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 feedback-heartbeat hover:animate-none ${rightPosition}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012-2h-5l-5 5v-5z" />
      </svg>
      <span>Give Feedback</span>
    </button>
  );
};

  const renderHomeContent = () => (
    <div className="flex flex-col h-full bg-[#1e1f24] items-center justify-center">
      <div className="flex justify-end items-center p-4 border-b border-gray-700/50 w-full">
        {renderAuthDropdown()}
      </div>
     
      <div className="flex flex-col items-center justify-center flex-1 px-4 w-full">
        {hasStartedChatting && (
          <div className="mb-6">
            <img
              src="/images/lANDAilogo2.png"
              alt="LANDAi Logo"
              className="h-16 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goToHome}
            />
          </div>
        )}
       
        {!hasStartedChatting && (
          <div className="mb-8">
            <img
              src="/images/lANDAilogo2.png"
              alt="LANDAi Logo"
              className="h-20 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goToHome}
            />
          </div>
        )}
       
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
          Everything you need <br />to know about land in Ghana<br />
        </h1>
        <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 text-center">How can I help you today?</p>
       
        <div className="relative w-full max-w-md mb-6 md:mb-8">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="I'm looking for..."
            className="w-full pl-12 pr-16 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
            disabled={!isLoggedIn && searchCount >= 3}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <img src="/images/Vector-star.png" className="w-4 h-4" alt="Star" />
          </div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              onClick={handleVoiceInput}
              disabled={isMicActive || (!isLoggedIn && searchCount >= 3)}
              className="p-1"
            >
              {isMicActive ? (
                <Loader2 className="text-red-400 w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4 text-blue-400 hover:text-blue-300 transition-colors" />
              )}
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || (!isLoggedIn && searchCount >= 3)}
              className="p-1 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
       
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full mb-8 md:mb-10">
          {['land ownership types', 'Land disputes in Spintex', 'The Land Act 2020', 'How to verify land'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleBubbleClick(suggestion)}
              className="bg-[#3b3c44] text-white py-2 px-4 rounded-full text-sm hover:bg-[#4c4d55] transition-all disabled:opacity-50"
              disabled={!isLoggedIn && searchCount >= 3}
            >
              {suggestion}
            </button>
          ))}
        </div>
       
        {!isLoggedIn && (
          <div className="text-center text-sm text-gray-400 mb-6 md:mb-8">
            {searchCount < 3 ? (
              <p>You have {3 - searchCount} free search{searchCount !== 2 ? 'es' : ''} remaining</p>
            ) : (
              <p className="text-red-400">Please login to continue searching</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex flex-col h-full bg-[#1e1f24]">
      <div className="flex justify-end items-center p-4 border-b border-gray-700/50">
        {renderAuthDropdown()}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex max-w-3xl mx-auto gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'ai' && (
              <div className="flex-shrink-0 mt-1">
                <img
                  src="/images/Vector-star.png"
                  className="h-4 w-4"
                  alt="AI"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div
                className={`rounded-xl p-4 max-w-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-[#2e2f36] text-gray-100 border border-gray-700/50'
                }`}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">Generating...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert text-sm leading-relaxed max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {!msg.isLoading && (
                <div
                  className={`flex gap-2 justify-${
                    msg.role === 'user' ? 'end' : 'start'
                  } px-1`}
                >
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => regenerateResponse(idx)}
                      className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600 transition-colors"
                      title="Regenerate"
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 text-blue-400" />
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600 transition-colors"
                    title="Copy"
                  >
                    <Copy className="h-3 w-3 text-blue-400" />
                  </button>
                  {msg.role === 'user' && (
                    <button
                      onClick={() => setInputValue(msg.text)}
                      className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-3 w-3 text-blue-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {isLoading && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#2b2c33] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-10 border border-gray-700">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-white">Generating response</span>
          <button
            onClick={handleStopGeneration}
            className="ml-2 text-xs text-red-400 hover:text-red-300 flex items-center transition-colors"
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Stop
          </button>
        </div>
      )}

      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#1e1f24] via-[#1e1f24] to-transparent">
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center bg-[#2b2c33] rounded-xl px-4 py-3 shadow-lg border border-gray-700/30">
            <img
              src="/images/Vector.svg"
              alt=""
              className="h-8 w-8 mr-3 brightness-125"
            />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
              placeholder="Ask a follow-up..."
              disabled={!isLoggedIn && searchCount >= 3}
            />
            <button
              onClick={handleVoiceInput}
              disabled={isMicActive || (!isLoggedIn && searchCount >= 3)}
              className={`ml-3 transition-all ${isMicActive ? 'animate-pulse text-red-400' : 'text-blue-400 hover:text-blue-300'}`}
            >
              {isMicActive ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || (!isLoggedIn && searchCount >= 3)}
              className="ml-3 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1e1f24] text-white">
      {/* Sidebar - Only show when in chat mode or when logged in */}
      {hasStartedChatting && currentView === 'chat' && (
        <div className={`relative transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
          <Sidebar
            isLoading={isLoading}
            isLoggedIn={isLoggedIn}
            activeChat={activeChat}
            isCollapsed={!isSidebarOpen}
            userName={userName || guestName}
            userInitial={userInitial}
            onNewChat={() => {
              const newConvo = conversationManager.startNewConversation('');
              setActiveChat(newConvo.id);
              setMessages([]);
              setInputValue('');
              setCurrentView('chat');
            }}
            onSearchChats={() => setShowSearchPopup(true)}
            onChatSelect={(chatId) => {
              try {
                conversationManager.setActiveConversation(chatId);
                const convo = conversationManager.getCurrentConversation();
                setMessages(
                  convo.messages.map(m => ({
                    role: m.role === 'assistant' ? 'ai' : m.role,
                    text: m.content
                  }))
                );
                setActiveChat(chatId);
                setCurrentView('chat');
              } catch (error) {
                console.error('Error selecting chat:', error);
              }
            }}
            onGoHome={goToHome}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Sidebar toggle buttons - Only show when in chat mode */}
      {hasStartedChatting && currentView === 'chat' && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-50 p-2 rounded-md bg-[#2b2c33] hover:bg-[#3b3c44] transition-colors"
        >
          <img
            src="/images/pin.png"
            className="h-5 w-5"
            alt="Open sidebar"
          />
        </button>
      )}

      {hasStartedChatting && currentView === 'chat' && isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed left-64 top-4 z-50 p-2 rounded-md bg-[#2b2c33] hover:bg-[#3b3c44] transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-blue-400" />
        </button>
      )}

      <div className="flex-1 flex flex-col">
        {currentView === 'home' ? renderHomeContent() : renderChatContent()}
      </div>
     
      {/* Feedback button - visible on both home and chat views */}
      {renderFeedbackButton()}
     
      {/* Name prompt for guest users */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2b2c33] rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">What's your name?</h3>
            <p className="text-gray-300 text-sm mb-4">We'd love to personalize your experience!</p>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuestNameSubmit()}
              placeholder="Enter your first name"
              className="w-full px-4 py-2 bg-[#1e1f24] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleGuestNameSubmit}
                disabled={!guestName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              <button
                onClick={() => setShowNamePrompt(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
     
      {/* Modal components */}
      {showSearchPopup && (
        <SearchChatsInterface
          onClose={() => setShowSearchPopup(false)}
          onChatSelect={(chatId) => {
            conversationManager.setActiveConversation(chatId);
            const convo = conversationManager.getCurrentConversation();
            setMessages(
              convo.messages.map(m => ({
                role: m.role === 'assistant' ? 'ai' : m.role,
                text: m.content
              }))
            );
            setActiveChat(chatId);
            setCurrentView('chat');
          }}
        />
      )}
     
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          email={loginEmail}
          setEmail={setLoginEmail}
          password={loginPassword}
          setPassword={setLoginPassword}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}
     
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;