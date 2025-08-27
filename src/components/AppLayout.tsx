import React, { useEffect, useState, useRef } from 'react';
import { Mic, ChevronDown, Copy, Edit3, Loader2, RefreshCw } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Sidebar from './Sidebar';
import SearchChatsInterface from './SearchChatsInterface';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { loginUser, signupUser } from '@/services/authService';
import { conversationManager } from '@/lib/ConversationManager';

const AppLayout: React.FC<{}> = () => {
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
  const [userInitial, setUserInitial] = useState<string>('U');
  const [showDropdown, setShowDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (!token) {
      const stored = localStorage.getItem('searchCount');
      setSearchCount(stored ? parseInt(stored, 10) : 0);
    }
  }, []);

  // Persist counter changes
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('searchCount', String(searchCount));
    } else {
      localStorage.removeItem('searchCount');
    }
  }, [searchCount, isLoggedIn]);

  // Add the click-outside handler effect for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDropdown && !(e.target as Element).closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Home view event listener
  useEffect(() => {
    const handleGoToHome = () => setCurrentView('home');
    window.addEventListener('goToHome', handleGoToHome);
    return () => window.removeEventListener('goToHome', handleGoToHome);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
      setMessages(prev => [...prev.slice(0, messageIndex)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
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

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('access_token', data.access_token);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setUserInitial(email.charAt(0).toUpperCase());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
      const data = await signupUser(email, password, name);
      localStorage.setItem('access_token', data.access_token);
      setIsLoggedIn(true);
      setShowSignupModal(false);
      setUserInitial(name.charAt(0).toUpperCase());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (userTextParam?: string) => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
      return;
    }

    const userText = (userTextParam || inputValue).trim();
    if (!userText) return;

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
    setInputValue(text);
    setTimeout(() => handleSendMessage(text), 50);
  };

  const renderAuthDropdown = () => {
    return isLoggedIn ? (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
            {userInitial}
          </div>
          <ChevronDown size={14} />
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-32 bg-[#2b2c33] text-white border border-gray-700 rounded shadow-md z-50">
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                setIsLoggedIn(false);
                setMessages([]);
                setCurrentView('home');
                setUserInitial('U');
                setShowDropdown(false);
              }}
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

  const renderChatContent = () => (
    <div className="flex flex-col h-full bg-[#1e1f24]">
      <div className="flex justify-end items-center p-4 border-b border-gray-700/50">
        {renderAuthDropdown()}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                className={`rounded-xl p-4 ${
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
                  <div className="prose prose-invert text-sm/relaxed">
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
                      className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-3 w-3 text-blue-400" />
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600"
                    title="Copy"
                  >
                    <Copy className="h-3 w-3 text-blue-400" />
                  </button>
                  {msg.role === 'user' && (
                    <button
                      onClick={() => setInputValue(msg.text)}
                      className="p-1 rounded-full bg-[#3b3c44] hover:bg-[#4c4d55] border border-gray-600"
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
            className="ml-2 text-xs text-red-400 hover:text-red-300 flex items-center"
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
              src="/images/Vector-star.png"
              alt=""
              className="h-8 w-8 mr-3 brightness-125"
            />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1e1f24] text-white">
      {currentView === 'chat' && (
      <Sidebar
      isLoading={isLoading}
      isLoggedIn={isLoggedIn}   
      activeChat={activeChat}
      onNewChat={() => {
      const newConvo = conversationManager.startNewConversation('');
     setActiveChat(newConvo.id);
     setMessages([]);
     setInputValue('');
     setCurrentView('chat');
   }}
    onSearchChats={() => setShowSearchPopup(true)}
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

      <div className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <div className="p-4 md:p-8 flex flex-col min-h-screen items-center justify-center">
            <header className="hidden md:flex justify-between items-center mb-8 w-full max-w-6xl">
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={refreshPage}
              >
                <img
                  src="/images/lANDAilogo2.png"
                  alt="LANDAi Logo"
                  className="h-14 w-auto max-w-xs"
                  style={{ maxHeight: '60px' }}
                />
              </div>
              {renderAuthDropdown()}
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 w-full">
              <div className="md:hidden mb-6">
                <img
                  src="/images/lANDAilogo.png"
                  alt="LANDAi Logo"
                  className="h-16 w-auto mx-auto"
                  onClick={refreshPage}
                />
              </div>

              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
                Get all you need<br />about your desired land
              </h1>
              <p className="text-gray-300 text-lg mb-8 text-center">How can I help you today?</p>

              <div className="relative w-full max-w-md mb-8">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="I'm looking for..."
                  className="w-full pl-12 pr-12 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                  disabled={!isLoggedIn && searchCount >= 3}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <img src="/images/Vector-star.png" className="w-4 h-4" />
                </div>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={handleVoiceInput}
                  disabled={isMicActive || (!isLoggedIn && searchCount >= 3)}
                >
                  {isMicActive ? (
                    <Loader2 className="text-red-400 w-4 h-4 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4 text-blue-400 hover:text-blue-300 transition-colors" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md w-full mb-10">
                {['land ownership types', 'Land disputes in Spintex', 'The Land Act 2020', 'How to verify land'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleBubbleClick(sug)}
                    className="bg-[#3b3c44] text-white py-2 px-4 rounded-full text-sm hover:bg-[#4c4d55] transition-all disabled:opacity-50"
                    disabled={!isLoggedIn && searchCount >= 3}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {!isLoggedIn && (
                <div className="text-center text-sm text-gray-400 mb-8">
                  {searchCount < 3 ? (
                    <p>You have {3 - searchCount} free search{searchCount !== 2 ? 'es' : ''} remaining</p>
                  ) : (
                    <p className="text-red-400">Please login to continue searching</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          renderChatContent()
        )}
      </div>

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
