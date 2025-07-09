import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const suggestions = [
    { title: "Recommend litigation free land for my gym project" },
    { title: "Which area in Accra is best for building a story building" },
    { title: "Which areas in Kumasi are marked as ramsa sites?" },
    { title: "I want to start water sell business, which areas in Takoradi is best?" }
  ];

  const chats = [
    { title: "Gym Project", active: true },
    { title: "Best area for story...", active: false },
    { title: "Ramsa site", active: false }
  ];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setInputValue('');
      setCurrentView('chat');
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2c33] text-white">
      {/* Homepage View */}
      {currentView === 'home' && (
        <div>
        <div className="relative p-4">
  {/* Top row: Land-Ai on the left, Menu icon on the right */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
      <span className="text-gray-300 text-lg">Land-Ai</span>
    </div>
    {/* Menu icon on the right */}
    <img src="/images/menu.png" alt="Menu Icon" className="w-5 h-5 cursor-pointer" />
  </div>

  {/* Beta Test badge centered below */}
  <div className="flex justify-center mt-2">
    <div className="flex items-center gap-1 bg-white text-gray-900 px-3 py-1 rounded-full">
      <img src="/images/Vector-star.png" alt="Star Icon" className="w-3 h-3" />
      <span className="text-xs font-medium">Beta Test</span>
    </div>
  </div>
</div>


          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-blue-500 mb-4">
                Get all you need<br />about your desired land
              </h1>
              <p className="text-gray-400 text-lg mb-8">How can I help you today?</p>
              <div className="relative w-full max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
                <Input
                  type="text"
                  placeholder="I'm looking for..."
                  className="pl-10 pr-4 py-2 bg-white text-gray-900 rounded-full border-0 focus:ring-2 focus:ring-cyan-400"
                  onKeyDown={(e) => e.key === 'Enter' && setCurrentView('chat')}
                />
              </div>
            </div>

            <div className="w-full max-w-4xl">
              <p className="text-gray-400 text-center mb-6">You may ask</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.map((s, i) => (
                  <Card
                    key={i}
                    className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setCurrentView('chat')}
                  >
                    <h3 className="text-sm font-medium text-white mb-2">{s.title}</h3>
                    <div className="mt-3">
                      <span className="text-xs text-cyan-400 hover:text-cyan-300">Ask this →</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Mode View */}
      {currentView === 'chat' && (
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-[#2b2c33] border-r border-gray-700 flex flex-col justify-between h-screen">
            <div>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 text-white text-lg mb-4">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  Land–Ai
                </div>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2 flex items-center justify-start gap-2">
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

              <div className="p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
                <div className="space-y-1">
                  {chats.map((chat, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded cursor-pointer ${chat.active ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${chat.active ? 'text-white font-medium' : 'text-gray-300'}`}>{chat.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 text-xs text-gray-500 border-t border-gray-700">Copyright © 2025</div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {/* User Prompt */}
              <div className="flex justify-end mb-6">
                <div className="max-w-3xl bg-[#3b3c44] text-white rounded-lg p-4">
                  <div className="text-sm leading-relaxed">
                    Recommend litigation free land for my gym project
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start mb-6">
                <div className="max-w-3xl bg-[#2b2c33] text-gray-100 rounded-lg p-4 relative">
                  <img src="/images/Vector-star.png" alt="vector" className="absolute -top-3 left-3 w-4 h-4" />
                  <div className="whitespace-pre-wrap text-sm leading-relaxed pl-6">
                    <p className="mb-4">Here are the top 3 litigation-free land options for your gym project in the Greater Accra Region:</p>
                    <p className="font-medium mb-2">1. Oyibi (Adenta area)</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Litigation-free plots from GHS 200k–300k near Valley View University</li>
                      <li>Utilities available; value rising with road upgrades</li>
                    </ul>
                    <p className="font-medium mb-2">2. Adjen Kotoku (Ashaiman)</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Registered plots for GHS 50k, titled parcels at GHS 160k</li>
                      <li>Commercial hotspot in Ga West municipality</li>
                    </ul>
                    <p className="font-medium mb-2">3. East Legon Hills</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Serviced plots (500m²) priced GHS 200k–500k, ideal for premium clientele</li>
                      <li>Near schools, paved roads; high-end mixed-use zone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="relative flex items-center gap-2">
                <img src="/images/Vector-star.png" alt="vector" className="absolute left-4 w-4 h-4" />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="I'm looking for..."
                  className="pl-10 pr-12 bg-[#3b3c44] border-none text-white rounded-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <img src="/images/microphone.png" alt="mic" className="absolute right-4 w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
