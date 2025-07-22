import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, LogOut, PenIcon, User, LayoutDashboard, 
  FileText, BarChart2, Settings, HelpCircle,
  ChevronDown, BookOpen, Mic, ArrowRight,
  SearchCheck
} from 'lucide-react';
import SearchChatsInterface from './SearchChatsInterface';

type ActivePage = 'dashboard' | 'reports' | 'analytics' | 'settings' | 'help';

// Updated auth service functions
const loginUser = async (email: string, password: string) => {
  const response = await fetch('https://nomar.up.railway.app/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

const signupUser = async (email: string, password: string, name: string) => {
  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and a number');
  }

  const response = await fetch('https://nomar.up.railway.app/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      name
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
};

// Updated LoginModal component
const LoginModal = ({ 
  onClose, 
  onLogin, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSwitchToSignup 
}: {
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSwitchToSignup: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Log In</h2>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-[#3b3c44] rounded border border-gray-600"
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-[#3b3c44] rounded border border-gray-600"
            placeholder="••••••••"
            required
          />
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Don't have an account? Sign up
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Updated SignupModal component
const SignupModal = ({ 
  onClose, 
  onSignup, 
  initialValues, 
  onSwitchToLogin 
}: {
  onClose: () => void;
  onSignup: (data: { email: string; password: string; name: string }) => Promise<void>;
  initialValues: { email: string; password: string; name: string };
  onSwitchToLogin: () => void;
}) => {
  const [email, setEmail] = useState(initialValues.email);
  const [password, setPassword] = useState(initialValues.password);
  const [name, setName] = useState(initialValues.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onSignup({ email, password, name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Create Account</h2>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-[#3b3c44] rounded border border-gray-600"
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-[#3b3c44] rounded border border-gray-600"
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-[#3b3c44] rounded border border-gray-600"
            placeholder="••••••••"
            required
          />
          <p className="text-xs text-gray-400">
            Password must be at least 8 characters with uppercase, lowercase, and a number
          </p>
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Already have an account? Log in
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

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
    // Demo account (remove before production)
    const demoAccount = {
      email: "demo@nomaroot.com",
      password: "demo123",
      name: "Demo User",
      id: "demo-user-123"
    };

    // Check demo credentials first
    if (credentials.email === demoAccount.email && credentials.password === demoAccount.password) {
      localStorage.setItem('token', 'demo-token-123');
      localStorage.setItem('userName', demoAccount.name);
      localStorage.setItem('userId', demoAccount.id);
      localStorage.setItem('isLoggedIn', 'true');
      
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setCurrentView('chat');
      setWelcomeName(demoAccount.name);
      return;
    }

    // Original login logic for real accounts
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
      setWelcomeName(user?.name || credentials.email);
      
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
      setWelcomeName(user?.name || signupData.name);
      
    } catch (error) {
      console.error("Signup error:", error);
      alert(error instanceof Error ? error.message : "Signup failed. Password must be at least 8 characters with uppercase, lowercase, and a number");
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

  const renderLandingAuthSection = () => (
    <div className="flex items-center gap-3">
      {!isLoggedIn && (
        <>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-1.5 text-sm font-medium rounded-md border border-gray-600 hover:bg-gray-700 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );

  const renderChatAuthSection = () => (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={() => setShowAccountMenu(!showAccountMenu)}
        className="flex items-center gap-2 group"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            showAccountMenu ? "rotate-180" : ""
          }`}
        />
      </button>

      {showAccountMenu && (
        <div className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 w-48 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium truncate">{welcomeName}</p>
            <p className="text-xs text-gray-400">Free Plan</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-700 text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e1f24] text-white flex">
      {/* Sidebar - Only shown in chat view */}
      {currentView === 'chat' && (
        <div className="w-64 bg-[#1e1f24] border-r border-gray-700 p-4 flex flex-col hidden md:flex">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300 text-lg font-medium">NomaRoot</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id as ActivePage)}
                className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                  activePage === item.id 
                    ? 'bg-blue-900/30 text-white border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-700'
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
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChat === chat.id 
                      ? 'bg-blue-900/20 border border-blue-500/30' 
                      : 'bg-gray-800/50 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="font-medium text-white truncate">{chat.title}</div>
                  <div className="text-xs text-gray-400 truncate">{chat.lastMessage}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-700">
            <button className="w-full text-left px-4 py-3 rounded-md flex items-center gap-3 text-gray-300 hover:bg-gray-700 transition-colors">
              <BookOpen className="w-5 h-5" />
              <span>Terms & Conditions</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${currentView === 'chat' ? 'md:ml-64' : ''}`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={() => handleNavigation('dashboard')}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300 font-medium">NomaRoot</span>
            </div>
          </button>
          {currentView === 'home' ? renderLandingAuthSection() : renderChatAuthSection()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {currentView === 'home' ? (
            <div className="p-4 md:p-8 flex flex-col min-h-screen items-center justify-center">
              {/* Desktop Header */}
              <header className="hidden md:flex justify-between items-center mb-8 w-full max-w-6xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 text-lg font-medium">NomaRoot</span>
                </div>
                {renderLandingAuthSection()}
              </header>

              {/* Main Content - Centered */}
              <div className="flex flex-col items-center justify-center flex-1 px-4 w-full">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4 text-center">
              Get all you need<br />about your desired land
            </h1>

                
                <p className="text-gray-300 text-lg mb-8 text-center">
                  How can I help you today?
                </p>

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
                      <img
                        src="/images/Vector-star.png"
                        alt="Star"
                        className="w-4 h-4"
                      />
                    </div>
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Mic className={`w-4 h-4 ${
                        !isLoggedIn && searchCount >= 3 ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'
                      }`} />
                    </button>
                  </div>
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

                <div className="w-full max-w-2xl">
                  <p className="text-gray-400 text-center mb-6 uppercase text-sm tracking-wider">
                    You may ask
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 bg-[#2b2c33] border border-gray-700 rounded-lg hover:border-blue-500 transition-all cursor-pointer group"
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
                        <h3 className="text-sm font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {s.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <span>Ask this</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Chat header - Cleaned up (no border, no "Chat" text) */}
              <div className="flex justify-end items-center p-4">
                {renderChatAuthSection()}
              </div>

              {/* Chat content */}
              <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto">
                {activePage === 'dashboard' ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center mt-1">
                        <img src="/images/lightning-icon.png" alt="User" className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-[#3b3c44] text-white rounded-xl p-4">
                          <span className="text-sm">Recommend litigation free land for my gym project</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
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
                      This is where your {activePage} content will be displayed.
                    </p>
                    <div className="mt-6 bg-[#3b3c44] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img src="/images/Vector-star.png" alt="Grok" className="w-4 h-4" />
                        <span className="font-medium">Sample {activePage} Data</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Connect to API to fetch real {activePage} data and display it here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-4">
                <div className="relative max-w-3xl mx-auto">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activePage === 'dashboard' ? "I'm looking for..." : `Ask about ${activePage}...`}
                    className="pl-10 pr-10 bg-[#3b3c44] text-white rounded-full border-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <img
                      src="/images/Vector-star.png"
                      alt="star"
                      className="w-4 h-4"
                    />
                  </div>
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Mic className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                  </button>
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
                setShowSignupModal(true);
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
                email,
                password,
                name
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