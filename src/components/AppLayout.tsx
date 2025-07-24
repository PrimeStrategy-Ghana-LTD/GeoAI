  // AppLayout.tsx
  import React, { useEffect, useState } from 'react';
  import { Mic, Star, ChevronDown, Copy, Edit3 } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'main' | 'ai' | 'follow'>('main');

    useEffect(() => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    }, []);

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

      await conversationManager.addUserMessage(userText);
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

    const renderAuthDropdown = () => (
      isLoggedIn ? (
        <div className="relative group">
          <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
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
              className="w-full text-left px-4 py-2 text-sm hover:bg-[#3b3c44]"
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

    const renderTabs = () => (
      <div className="flex border-b border-gray-700 mb-4 space-x-6 text-sm font-medium">
        {[
          ['main', 'Main Question'],
          ['ai', 'AI Response'],
          ['follow', 'Follow-up'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`pb-2 ${activeTab === key ? 'border-b-2 border-blue-400 text-blue-300' : 'text-gray-400 hover:text-blue-200'}`}
          >
            {label}
          </button>
        ))}
      </div>
    );

    const renderChatContent = () => {
      const userMsg = messages.find(m => m.role === 'user');
      const aiMsg = messages.find(m => m.role === 'ai');
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-end items-center p-4">{renderAuthDropdown()}</div>
          <div className="px-4 max-w-4xl mx-auto flex-1 overflow-y-auto">
            {renderTabs()}
            <div className="space-y-4">
              {activeTab === 'main' && userMsg && (
                <div className="bg-[#2b2c33] p-4 rounded-xl relative text-white text-sm">
                  <div className="absolute top-2 right-2 flex gap-2 text-gray-400">
                    <Copy size={14} className="cursor-pointer hover:text-white" />
                    <Edit3 size={14} className="cursor-pointer hover:text-white" />
                  </div>
                  {userMsg.text}
                </div>
              )}
              {activeTab === 'ai' && aiMsg && (
                <div className="bg-[#3b3c44] p-4 rounded-xl text-white text-sm">
                  {aiMsg.text}
                </div>
              )}
              {activeTab === 'follow' && (
                <div className="flex items-center w-full border border-gray-700 rounded-full px-4 py-2 bg-[#2b2c33]">
                  <Star className="text-yellow-400 w-4 h-4 mr-2" />
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
                    placeholder="Ask a follow-up..."
                  />
                  <Mic className="text-blue-400 w-4 h-4 ml-2 cursor-pointer" />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex h-screen bg-[#1e1f24] text-white">
        {currentView === 'chat' && (
          <Sidebar
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
              const mapped = convo.messages.map((m) => ({
                role: m.role,
                text: m.content,
              })) as { role: 'user' | 'ai'; text: string }[];
              setMessages(mapped);
              setActiveChat(chatId);
              setCurrentView('chat');
            }}
          />
        )}

        <div className="flex-1 flex flex-col">
          {currentView === 'home' ? (
            <div className="p-4 md:p-8 flex flex-col min-h-screen items-center justify-center">
              <header className="hidden md:flex justify-between items-center mb-8 w-full max-w-6xl">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
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
                    className="w-full pl-12 pr-12 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isLoggedIn && searchCount >= 3}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <img src="/images/Vector-star.png" className="w-4 h-4" />
                  </div>
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Mic className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md w-full mb-10">
                  {['Buy land in Kumasi', 'Land disputes in Spintex', 'Freehold land types', 'How to verify land'].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleBubbleClick(sug)}
                      className="bg-[#3b3c44] text-white py-2 px-4 rounded-full text-sm hover:bg-[#4c4d55]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {!isLoggedIn && (
                  <div className="text-center text-sm text-gray-400 mb-8">
                    {searchCount < 3
                      ? <p>You have {3 - searchCount} free search{searchCount !== 2 ? 'es' : ''} remaining</p>
                      : <p className="text-red-400">Please login to continue searching</p>
                    }
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
              const mapped = convo.messages.map((m) => ({
                role: m.role,
                text: m.content,
              })) as { role: 'user' | 'ai'; text: string }[];
              setMessages(mapped);
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
