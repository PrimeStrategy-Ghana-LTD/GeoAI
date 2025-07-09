import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal'; // Make sure this path is correct


const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [inputValue, setInputValue] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const suggestions = [
    { title: "Recommend litigation free land for my gym project" },
    { title: "Which area in Accra is best for building a story building" },
    { title: "Which areas in Kumasi are marked as ramsa sites?" },
    { title: "I want to start water sell business, which areas in Takoradi is best?" }
  ];

  const chats = [
    { title: "Gym Project", active: false },
    { title: "Best area for story...", active: false },
    { title: "Ramsa site", active: false }
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const count = parseInt(localStorage.getItem('searchCount') || '0');
    setIsLoggedIn(loggedIn);
    setSearchCount(count);
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
    if (email === 'admin@gmail.com' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('searchCount', '0');
      setIsLoggedIn(true);
      setSearchCount(0);
      setShowLoginModal(false);
    } else {
      alert('Invalid credentials. Use admin@gmail.com/admin for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2c33] text-white">
      {/* Homepage */}
      {currentView === 'home' && (
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-gray-300 text-lg">Land-Ai</span>
            </div>
            <button onClick={() => setShowLoginModal(true)}>
              <img src="/images/menu.png" alt="Menu Icon" className="w-5 h-5 cursor-pointer z-10" />
            </button>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-1 bg-white text-gray-900 px-3 py-1 rounded-full">
              <img src="/images/Vector-star.png" alt="Star Icon" className="w-3 h-3" />
              <span className="text-xs font-medium">Beta Test</span>
            </div>
          </div>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
              <Input
                type="text"
                placeholder="I'm looking for..."
                className="pl-10 pr-10 py-2 bg-white text-gray-900 rounded-full border-0 focus:ring-2 focus:ring-cyan-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!isLoggedIn && searchCount >= 3}
              />
              <img
                src="/images/microphone.png"
                alt="Mic"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
            </div>
            <p className="text-gray-400 text-center mt-8 mb-4">You may ask</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.map((s, i) => (
                <Card
                  key={i}
                  className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => {
                    if (!isLoggedIn && searchCount >= 3) {
                      setShowLoginModal(true);
                    } else {
                      setCurrentView('chat');
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

      {/* Chat Mode View */}
      {currentView === 'chat' && (
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-[#2b2c33] border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-white text-lg mb-4">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                Land-Ai
              </div>
              <Button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2 flex items-center justify-start gap-2"
                onClick={() => setCurrentView('home')}
              >
                <img src="/images/pen.png" alt="pen" className="w-4 h-4" />
                <span className="font-medium">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-300 hover:bg-gray-700 flex items-center justify-start gap-2"
                onClick={() => navigate('/search-chats')}
              >
                <Search className="w-4 h-4" />
                <span className="font-medium">Search Chats</span>
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`p-2 rounded cursor-pointer ${chat.active ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                  <span className={`text-sm ${chat.active ? 'text-white font-medium' : 'text-gray-300'}`}>{chat.title}</span>
                </div>
              ))}
            </div>
            <div className="p-4 text-xs text-gray-500 border-t border-gray-700">
              <p className="mb-1">Terms & Conditions</p>
              <p>Copyright © 2025</p>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col bg-[#2b2c33]">
            <div className="flex justify-end p-4">
              <button onClick={() => setShowLoginModal(true)}>
                <img src="/images/menu.png" alt="menu" className="w-5 h-5 cursor-pointer" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              {/* User Prompt */}
              <div className="flex items-center gap-2 mb-6 w-full max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-[#3b3c44] flex items-center justify-center">
                  <img src="/images/lightning-icon.png" alt="Lightning" className="w-4 h-4" />
                </div>
                <div className="bg-[#3b3c44] text-white rounded-xl p-4 flex-1 flex justify-between items-center">
                  <span className="text-sm">Recommend litigation free land for my gym project</span>
                  <img src="/images/pen.png" alt="pen" className="w-4 h-4 ml-2" />
                </div>
              </div>

              {/* AI Response */}
              <div className="bg-[#3b3c44] text-white rounded-xl p-4 w-full max-w-2xl">
                <div className="flex items-start gap-2 mb-2">
                  <img src="/images/Vector-star.png" alt="Star" className="w-4 h-4 mt-0.5" />
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

            {/* Input area */}
            <div className="p-4 border-t border-gray-700">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="I'm looking for..."
                  className="pl-10 pr-10 bg-[#3b3c44] text-white rounded-full border-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!isLoggedIn && searchCount >= 3}
                />
                <img
                  src="/images/Vector-star.png"
                  alt="star"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                />
                <img
                  src="/images/microphone.png"
                  alt="mic"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      )}
    </div>
  );
};

export default AppLayout;