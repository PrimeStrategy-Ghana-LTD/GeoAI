import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, LogOut, PenIcon, User, LayoutDashboard, FileText, BarChart2, Settings, HelpCircle } from 'lucide-react';
import { loginUser, signupUser } from '@/services/authService';
import LoginModal from '@/components/LoginModal';
import SignupModal from './SignupModal';
import SearchChatsInterface from './SearchChatsInterface';

type ActivePage = 'dashboard' | 'reports' | 'analytics' | 'settings' | 'help';

const AppLayout: React.FC = () => {
  // View state
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [welcomeName, setWelcomeName] = useState('');
  
  // Chat state
  const [inputValue, setInputValue] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const navigate = useNavigate();

  // Sample data
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

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help' }
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

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const { access_token: token, user } = await loginUser(credentials.email, credentials.password);
      
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user?.name || credentials.email);
      localStorage.setItem('userId', user?.id || '');
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setShowLoginModal(false);
      
      setEmail('');
      setPassword('');
      setCurrentView('chat');
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleSignup = async (signupData: { email: string; password: string; name: string }) => {
    try {
      const { access_token: token, user } = await signupUser(
        signupData.email, 
        signupData.password, 
        signupData.name
      );

      localStorage.setItem('token', token);
      localStorage.setItem('userName', user?.name || signupData.name);
      localStorage.setItem('userId', user?.id || '');
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setShowSignupModal(false);
      
      setName('');
      setEmail('');
      setPassword('');
      setCurrentView('chat');
      
    } catch (error) {
      console.error("Signup error:", error);
      alert(error instanceof Error ? error.message : "Signup failed");
    }
  };

  const handleLogout = () => {
    ['isLoggedIn', 'searchCount', 'userName', 'token', 'userId'].forEach(key => {
      localStorage.removeItem(key);
    });
    setIsLoggedIn(false);
    setSearchCount(0);
    setShowAccountMenu(false);
    setCurrentView('home');
    navigate('/');
  };

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

  const handleNavigation = (page: ActivePage) => {
    setActivePage(page);
    if (page === 'dashboard') {
      setCurrentView('home');
      navigate('/');
    } else {
      setCurrentView('chat');
      navigate(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2c33] text-white flex">
      {/* Sidebar - Only shown in chat view */}
      {currentView === 'chat' && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col hidden md:flex">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-gray-300 text-lg">Land-Ai</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id as ActivePage)}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
                  activePage === item.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Recent Chats</span>
            </h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    activeChat === chat.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-xs truncate">{chat.lastMessage}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-700">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{welcomeName}</p>
                  <p className="text-xs text-gray-400 truncate">Free Plan</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => setShowSignupModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${currentView === 'chat' ? 'md:ml-64' : ''}`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={() => handleNavigation('dashboard')}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-gray-300">Land-Ai</span>
            </div>
          </button>
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
                  className="text-gray-300 hover:text-white font-medium text-sm"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
         {currentView === 'home' && (
  <div className="p-4 md:p-8 flex flex-col min-h-screen">
    {/* Top Header */}
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
        <span className="text-gray-300 text-lg font-medium">Land-Ai</span>
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
          </div>
        ) : (
          <>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-gray-300 hover:text-white font-medium text-sm"
            >
              Log in
            </button>
            <button 
              onClick={() => setShowSignupModal(true)}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </header>

    {/* Main Content - Centered */}
    <div className="flex flex-col items-center justify-center flex-1">
      {/* Gradient Text Heading */}
       <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
              Get all you need<br />about your desired land
            </h1>
      
      {/* Subheading */}
      <p className="text-gray-400 text-lg mb-6 text-center">How can I help you today?</p>
      
      {/* Search Counter */}
      {!isLoggedIn && (
        <div className="text-center text-sm text-gray-400 mb-6">
          {searchCount < 3 ? (
            <p>You have {3 - searchCount} free search{searchCount !== 2 ? 'es' : ''} remaining</p>
          ) : (
            <p className="text-red-400">Please login to continue searching</p>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full max-w-md mb-8">
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="I'm looking for..."
            className="pl-12 pr-20 bg-[#3b3c44] text-white rounded-full border-none h-12"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isLoggedIn && searchCount >= 3}
          />
          <img
            src="/images/Vector-star.png"
            alt="Star"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
          />
          <img
            src="/images/microphone.png"
            alt="Mic"
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              !isLoggedIn && searchCount >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          />
        </div>
      </div>

      {/* Suggestions Heading */}
      <p className="text-gray-400 text-center mt-8 mb-4">You may ask</p>
      
      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
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
            <div className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
              <span>Ask this</span>
              <span className="text-sm">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

          {currentView === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Chat header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-gray-300"
                    onClick={() => setCurrentView('home')}
                  >
                    <PenIcon className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                  <h2 className="text-lg font-medium">
                    {activePage === 'dashboard' ? 'Chat' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
                  </h2>
                </div>
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

              {/* Chat content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activePage === 'dashboard' ? (
                  <div className="max-w-3xl mx-auto">
                    {/* Sample chat message */}
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center mt-1">
                        <img src="/images/lightning-icon.png" alt="User" className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-[#3b3c44] text-white rounded-xl p-4 mb-2">
                          <span className="text-sm">Recommend litigation free land for my gym project</span>
                        </div>
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center mt-1">
                        <img src="/images/Vector-star.png" alt="AI" className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-[#3b3c44] text-white rounded-xl p-4">
                          <div className="mb-2">
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
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto p-4">
                    <h2 className="text-xl font-bold mb-4">
                      {activePage.charAt(0).toUpperCase() + activePage.slice(1)} Content
                    </h2>
                    <p className="text-gray-300">
                      This is where your {activePage} content will be displayed. Connect to Grok API to show relevant data.
                    </p>
                    {/* Placeholder for Grok Report content */}
                    <div className="mt-6 bg-[#3b3c44] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="/images/Vector-star.png" alt="Grok" className="w-4 h-4" />
                        <span className="font-medium">Sample {activePage} Data</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Connect to Grok API to fetch real {activePage} data and display it here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-gray-700">
                <div className="relative max-w-3xl mx-auto">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activePage === 'dashboard' ? "I'm looking for..." : `Ask about ${activePage}...`}
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
          )}
        </div>
      </div>

      {/* Modals */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#2b2c33] rounded-xl p-6 w-full max-w-md border border-gray-700 relative"
          >
            <LoginModal 
              onClose={() => setShowLoginModal(false)}
              onLogin={async (credentials) => {
                setEmail(credentials.email);
                setPassword(credentials.password);
                await handleLogin(credentials);
              }}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSwitchToSignup={() => {
                setShowLoginModal(false);
                setShowLoginModal(true);
              }}
            />
          </div>
        </div>
      )}

      {showSignupModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowSignupModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#2b2c33] rounded-xl p-6 w-full max-w-md border border-gray-700 relative"
          >
            <SignupModal 
              onClose={() => setShowSignupModal(false)}
              onSignup={handleSignup}
              initialValues={{
                name,
                email,
                password
              }}
              onSwitchToLogin={() => {
                setShowSignupModal(false);
                setShowLoginModal(true);
              }}
            />
          </div>
        </div>
      )}

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