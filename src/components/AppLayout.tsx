import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, LogOut, PenIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import SearchChatsInterface from './SearchChatsInterface';

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [inputValue, setInputValue] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const navigate = useNavigate();

  const suggestions = [
    { id: '1', title: "Recommend litigation free land for my gym project" },
    { id: '2', title: "Which area in Accra is best for building a story building" },
    { id: '3', title: "Which areas in Kumasi are marked as ramsa sites?" },
    { id: '4', title: "I want to start water sell business, which areas in Takoradi is best?" }
  ];

  const chats = [
    { id: '1', title: "Gym Project", lastMessage: "Looking for land in Accra" },
    { id: '2', title: "Best area for story...", lastMessage: "3 bedroom house locations" },
    { id: '3', title: "Ramsa site", lastMessage: "Government approved areas" }
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const count = parseInt(localStorage.getItem('searchCount') || '0', 10);
    const savedName = localStorage.getItem('userName') || '';
    setIsLoggedIn(loggedIn);
    setSearchCount(count);
    setWelcomeName(savedName);
    if (loggedIn) {
      setCurrentView('chat');
    }
  }, []);

  const handleSendMessage = () => {
    if (!isLoggedIn && searchCount >= 3) {
      setShowLoginModal(true);
      return;
    }
    
    if (inputValue.trim()) {
      setInputValue('');
      setCurrentView('chat');
      if (!isLoggedIn) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('searchCount', newCount.toString());
      }
    }
  };

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('searchCount', '0');
    localStorage.setItem('userName', email);
    setIsLoggedIn(true);
    setSearchCount(0);
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
    setCurrentView('chat');
    setActiveChat('1');
  };

  const handleSignup = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('searchCount', '0');
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
    setSearchCount(0);
    setShowSignupModal(false);
    setName('');
    setEmail('');
    setPassword('');
    setCurrentView('chat');
    setActiveChat('1');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('searchCount');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setSearchCount(0);
    setShowAccountMenu(false);
    setCurrentView('home');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#2b2c33] text-white">
      {currentView === 'home' && (
        <div className="relative p-4">
          {/* Header section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-gray-300 text-lg">Land-Ai</span>
            </div>
            
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  
                  {showAccountMenu && (
                    <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-48">
                      <div className="p-2 border-b border-gray-700 text-sm text-white">
                        {welcomeName || 'Account'}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 flex items-center gap-2 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-300 hover:text-white font-medium"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => setShowSignupModal(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign up for free
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Beta tag */}
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-1 bg-white text-gray-900 px-3 py-1 rounded-full">
              <img src="/images/Vector-star.png" alt="Star Icon" className="w-3 h-3" />
              <span className="text-xs font-medium">Beta Test</span>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
              Get all you need<br />about your desired land
            </h1>
            <p className="text-gray-400 text-lg mb-8 text-center">How can I help you today?</p>
            
            {!isLoggedIn && (
              <div className="text-center text-sm text-gray-400 mb-4">
                {searchCount < 3 ? (
                  <p>You have {3 - searchCount} free search{searchCount !== 2 ? 'es' : ''} remaining</p>
                ) : (
                  <p className="text-red-400">Please login to continue searching</p>
                )}
              </div>
            )}
            
            <div className="relative w-full max-w-md">
              {/* Search Input Section */}
              <div className="p-4 border-t border-gray-700">
                <div className="relative max-w-2xl mx-auto">
                  {/* Input Field */}
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="I'm looking for..."
                    className="pl-12 pr-20 bg-[#3b3c44] text-white rounded-full border-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleSendMessage();
                      }
                    }}
                    disabled={!isLoggedIn && searchCount >= 3}
                  />

                  {/* Star Icon */}
                  <img
                    src="/images/Vector-star.png"
                    alt="Star"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 border border-white rounded-full p-0.5 z-10"
                  />

                  {/* Microphone Icon */}
                  <img
                    src="/images/microphone.png"
                    alt="Mic"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-opacity ${
                      !isLoggedIn && searchCount >= 3
                        ? 'opacity-40 cursor-not-allowed'
                        : 'opacity-100 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isLoggedIn && searchCount >= 3) {
                        setShowLoginModal(true);
                      } else {
                        console.log('Microphone clicked');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-center mt-8 mb-4">You may ask</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.map((s) => (
                <Card
                  key={s.id}
                  className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    if (!isLoggedIn && searchCount >= 3) {
                      setShowLoginModal(true);
                    } else {
                      setCurrentView('chat');
                      setActiveChat(s.id);
                      if (!isLoggedIn) {
                        const newCount = searchCount + 1;
                        setSearchCount(newCount);
                        localStorage.setItem('searchCount', newCount.toString());
                      }
                    }
                  }}
                >
                  <h3 className="text-sm font-medium text-white mb-2">{s.title}</h3>
                  <span className="text-xs text-cyan-400 hover:text-cyan-300">Ask this →</span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView === 'chat' && (
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-[#2b2c33] border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-white text-lg mb-4">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span>Land-Ai</span>
              </div>
              <Button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2 flex items-center justify-start gap-2"
                onClick={() => setCurrentView('home')}
              >
                <img src="/images/pen.png" alt="New Chat" className="w-4 h-4" />
                <span className="font-medium">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-300 hover:bg-gray-700 flex items-center justify-start gap-2"
                onClick={() => setShowSearchPopup(true)}
              >
                <Search className="w-4 h-4" />
                <span className="font-medium">Search Chats</span>
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-2 rounded cursor-pointer ${activeChat === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="text-sm font-medium text-white">{chat.title}</div>
                    <div className="text-xs text-gray-400">{chat.lastMessage}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto p-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                <p className="mb-1">Terms & Conditions</p>
                <p>Copyright © 2025</p>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-[#2b2c33]">
            <div className="flex justify-end p-4 relative">
              <div className="relative">
                <button 
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
                >
                  <User className="w-4 h-4" />
                </button>
                
                {showAccountMenu && (
                  <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-48">
                    <div className="p-2 border-b border-gray-700 text-sm text-white">
                      {welcomeName || 'Account'}
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 flex items-center gap-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6 w-full max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center">
                  <img src="/images/lightning-icon.png" alt="User" className="w-4 h-4" />
                </div>
                <div className="bg-[#3b3c44] text-white rounded-xl p-4 flex-1 flex justify-between items-center">
                  <span className="text-sm">Recommend litigation free land for my gym project</span>
                  <img src="/images/pen.png" alt="Edit" className="w-4 h-4 ml-2" />
                </div>
              </div>

              <div className="bg-[#3b3c44] text-white rounded-xl p-4 w-full max-w-2xl">
                <div className="flex items-start gap-2 mb-2">
                  <img src="/images/Vector-star.png" alt="AI" className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">
                    Here are the top 3 litigation-free land options for your gym project in the Greater Accra Region:
                  </span>
                </div>
                <div className="mt-2 pl-4 text-sm">
                  <p className="font-medium mb-2">1. Oyibi (Adenta area)</p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Registered, litigation-free plots from GHS 25K-38K, located near Valley View University, with utilities like water and electricity</li>
                    <li>Oyibi's rising value and infrastructure development along major roads</li>
                  </ul>
                  <p className="font-medium mb-2">2. Adjen Kotoku (Amasaman)</p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Serviced, fully registered plots for GHS 50k, and a 10-acre titled parcel at GHS 160k</li>
                    <li>Amasaman is the Ga West municipal capital, supporting commercial growth</li>
                  </ul>
                  <p className="font-medium mb-2">3. East Legon Hills</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Larger plots (~650 m²) that are titled, walled, and serviced, priced GHS 600k-690k</li>
                    <li>High-end mixed-use zone in North Accra—ideal for premium gym clientele</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="I'm looking for..."
                  className="pl-10 pr-10 bg-[#3b3c44] text-white rounded-full border-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                /> 
                <img
                  src="/images/Vector-star.png"
                  alt="star"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 border border-white rounded-full p-0.5"
                />
                <img
                  src="/images/microphone.png"
                  alt="mic"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer border border-white rounded-full p-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md"
          >
            <LoginModal 
              onClose={() => setShowLoginModal(false)}
              onLogin={handleLogin}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSwitchToSignup={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowSignupModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md"
          >
            <SignupModal 
              onClose={() => setShowSignupModal(false)}
              onSignup={handleSignup}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSwitchToLogin={() => {
                setShowSignupModal(false);
                setShowLoginModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Search Popup */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <SearchChatsInterface 
            onClose={() => setShowSearchPopup(false)}
            onChatSelect={(chatId) => {
              setActiveChat(chatId);
              setShowSearchPopup(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AppLayout;