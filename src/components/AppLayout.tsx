import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import Sidebar from './Sidebar';
import SearchChatsInterface from './SearchChatsInterface';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { loginUser, signupUser } from '@/services/authService';
import { conversationManager } from '@/lib/ConversationManager';


const AppLayout: React.FC<{}> = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
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

    const newUserMessage = { role: 'user' as const, text: userText };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');

    let convo = null;
    if (!activeChat) {
      convo = conversationManager.startNewConversation(userText);
      setActiveChat(convo.id);
    } else {
      conversationManager.setActiveConversation(activeChat);
      convo = conversationManager.getCurrentConversation();
    }

    const userMessage = await conversationManager.addUserMessage(userText);
    const latestConvo = conversationManager.getCurrentConversation();
    const aiMsg = latestConvo.messages.find((m) => m.role === 'assistant');

    if (aiMsg) {
      setMessages((prev) => [...prev, { role: 'ai', text: aiMsg.content }]);
    }

    if (!isLoggedIn) {
      setSearchCount((prev) => prev + 1);
    }

    setCurrentView('chat');
  };

  const handleBubbleClick = (text: string) => {
    setInputValue(text);
    setTimeout(() => handleSendMessage(), 50);
  };

  const renderChatAuthSection = () => {
    return isLoggedIn ? (
      <button
        onClick={() => {
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
          setMessages([]);
          setCurrentView('home');
        }}
        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
      >
        Logout
      </button>
    ) : (
      <div className="flex gap-2">
        <button onClick={() => setShowLoginModal(true)} className="text-sm text-blue-400 hover:text-blue-300">Login</button>
        <button onClick={() => setShowSignupModal(true)} className="text-sm text-blue-400 hover:text-blue-300">Sign Up</button>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#1e1f24] text-white">
      {currentView === 'chat' && (
        <Sidebar
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
            const mapped = convo.messages.map((m) => ({
              role: m.role,
              text: m.content
            })) as { role: 'user' | 'ai'; text: string }[];

            setActiveChat(chatId);
            setMessages(mapped);
            setCurrentView('chat');
          }}
          activeChat={activeChat}
        />
      )}

      <div className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <div className="p-4 md:p-8 flex flex-col min-h-screen items-center justify-center">
            <header className="hidden md:flex justify-between items-center mb-8 w-full max-w-6xl">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-lg font-medium">NomaRoot</span>
              </div>
              {renderChatAuthSection()}
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 w-full">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
                Get all you need<br />about your desired land
              </h1>
              <p className="text-gray-300 text-lg mb-8 text-center">How can I help you today?</p>

              <div className="relative w-full max-w-md mb-8">
                <div className="relative">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="I'm looking for..."
                    className="w-full pl-12 pr-12 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!isLoggedIn && searchCount >= 3}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <img src="/images/Vector-star.png" alt="Star" className="w-4 h-4" />
                  </div>
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Mic className={`w-4 h-4 ${!isLoggedIn && searchCount >= 3 ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md w-full mb-10">
                {['Buy land in Kumasi', 'Land disputes in Spintex', 'Freehold land types', 'How to verify land'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleBubbleClick(suggestion)}
                    className="bg-[#3b3c44] text-white py-2 px-4 rounded-full text-sm hover:bg-[#4c4d55] transition"
                  >
                    {suggestion}
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
          <div className="flex flex-col h-full">
            <div className="flex justify-end items-center p-4">{renderChatAuthSection()}</div>
            <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center mt-1">
                    {msg.role === 'ai' ? (
                      <img src="/images/Vector-star.png" alt="AI" className="w-4 h-4" />
                    ) : (
                      <img src="/images/lightning-icon.png" alt="User" className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#3b3c44] text-white rounded-xl p-4 text-sm">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Popup */}
      {showSearchPopup && (
        <SearchChatsInterface
          onClose={() => setShowSearchPopup(false)}
          onChatSelect={(chatId) => {
            conversationManager.setActiveConversation(chatId);
            const convo = conversationManager.getCurrentConversation();
            const mapped = convo.messages.map((m) => ({
              role: m.role,
              text: m.content
            })) as { role: 'user' | 'ai'; text: string }[];

            setMessages(mapped);
            setActiveChat(chatId);
            setCurrentView('chat');
          }}
        />
      )}

      {/* Login Modal */}
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

      {/* Signup Modal */}
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
