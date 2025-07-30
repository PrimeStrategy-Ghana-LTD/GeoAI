import React, { useEffect, useState } from 'react';
import { Mic, Star, ChevronDown, Copy, Edit3, Loader2, Plus, Search, MessageSquare } from 'lucide-react';
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


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);


  useEffect(() => {
    const handleGoToHome = () => setCurrentView('home');
    window.addEventListener('goToHome', handleGoToHome);
    return () => window.removeEventListener('goToHome', handleGoToHome);
  }, []);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  
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
    } catch (err: any) {
      alert(err.message);
    }
  };

 const handleSendMessage = async () => {
  const userText = inputValue.trim();
  if (!userText) return;

  setIsLoading(true);

  setMessages(prev => [...prev, { role: 'user' as const, text: userText }]);
  setInputValue('');

  try {
    
    if (!activeChat) {
    
      const newConvo = conversationManager.startNewConversation(userText);
      if (!newConvo) {
        throw new Error('Failed to create new conversation');
      }
      setActiveChat(newConvo.id);
      conversationManager.setActiveConversation(newConvo.id);
    } else {
    
      conversationManager.setActiveConversation(activeChat);
    }

    await conversationManager.addUserMessage(userText);
    const currentConvo = conversationManager.getCurrentConversation();
    
    if (!currentConvo) {
      throw new Error('No active conversation found');
    }

    const aiResponse = currentConvo.messages.find(m => m.role === 'assistant');
    if (aiResponse) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai' as const, 
          text: aiResponse.content 
        }
      ]);
    }

  
    if (!isLoggedIn) {
      setSearchCount(prev => prev + 1);
    }
  } catch (error) {
    console.error('Message processing error:', error);

  } finally {
    setIsLoading(false);
    setCurrentView('chat');
  }
};


const handleBubbleClick = (text: string) => {
  setInputValue(text);
  setTimeout(handleSendMessage, 50);
};
  
  const renderAuthDropdown = () => (
    isLoggedIn ? (
      <div className="relative group">
        <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">U</div>
          <ChevronDown size={14} />
        </button>
        <div className="absolute right-0 mt-2 w-32 bg-[#2b2c33] text-white border border-gray-700 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              setIsLoggedIn(false);
              setMessages([]);
              setCurrentView('home');
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-[#3b3c44] transition-colors"
          >
            Logout
          </button>
        </div>
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
    )
  );

   const renderChatContent = () => (
    <div className="flex flex-col h-full bg-[#1e1f24]">
      {/* Header */}
      <div className="flex justify-end items-center p-4 border-b border-gray-700/50">
        {renderAuthDropdown()}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`group flex max-w-3xl mx-auto gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'ai' && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  {msg.isLoading ? (
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <Star className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            )}
            
            <div className={`relative rounded-xl p-4 transition-all duration-200 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-[#2e2f36] text-gray-100 border border-gray-700/50 shadow'
            }`}>
              {msg.isLoading ? (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-sm/relaxed">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#1e1f24] via-[#1e1f24] to-transparent">
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center bg-[#2b2c33] rounded-xl px-4 py-3 shadow-lg border border-gray-700/30">
            <img 
              src="/images/Vector-star.png" 
              alt=""
              className="h-4 w-4 mr-3 brightness-125"
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
              className="ml-3 transition-transform hover:scale-110 disabled:opacity-50"
            >
              {isMicActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              ) : (
                <Mic className="h-4 w-4 text-blue-400" />
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
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => setCurrentView('home')}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                <span className="text-gray-300 text-lg font-medium">NomaRoot</span>
              </div>
              {renderAuthDropdown()}
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 w-full">
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
                {['Buy land in Kumasi', 'Land disputes in Spintex', 'Freehold land types', 'How to verify land'].map((sug) => (
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