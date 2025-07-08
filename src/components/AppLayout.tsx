import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, MessageSquare, Star, Send } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header - Homepage Only */}
      {currentView === 'home' && (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-gray-300 text-lg">Land-Ai</span>
          </div>
          <div className="flex items-center gap-1 bg-white text-gray-900 px-2 py-1 rounded-full">
            <Star className="w-3 h-3" />
            <span className="text-xs font-medium">Beta Test</span>
          </div>
        </div>
      )}

      {/* Views */}
      {currentView === 'home' ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-500 to-blue-500 mb-4">
              Get all you need<br />about your desired land
            </h1>
            <p className="text-gray-400 text-lg mb-8">How can I help you today?</p>
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
              <Input
                type="text"
                placeholder="I'm looking for..."
                className="pl-10 pr-4 py-2 bg-white text-gray-900 rounded-full border-0 focus:ring-2 focus:ring-cyan-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentView('chat');
                  }
                }}
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
      ) : (
        // Chat View
        <div className="flex min-h-[calc(100vh-80px)] bg-[#1e1e1e]">
          {/* Sidebar */}
          <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300 text-lg font-semibold">Land-Ai</span>
              </div>
              <Button className="w-full bg-[#262626] hover:bg-[#333333] text-white mb-2 flex items-center justify-start gap-2" onClick={() => setCurrentView('home')}>
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-300 hover:bg-[#262626] flex items-center justify-start gap-2"
                onClick={() => navigate('/search-chats')}
              >
                <Search className="w-4 h-4" />
                <span className="font-medium">Search Chats</span>
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
              <div className="space-y-1">
                {chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded cursor-pointer ${chat.active ? 'bg-[#262626]' : 'hover:bg-[#262626]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${chat.active ? 'text-white font-medium' : 'text-gray-300'}`}>{chat.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">Copyright © 2025</p>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="flex-1 overflow-y-auto p-6">
              {/* User Message */}
              <div className="flex justify-end mb-6">
                <div className="max-w-3xl text-gray-200 bg-[#262626] rounded-lg p-4">
                  <div className="text-sm leading-relaxed">
                    Recommend litigation free land for my gym project
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start mb-6">
                <div className="max-w-3xl bg-[#1a1a1a] text-gray-200 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <p className="mb-4">Here are the top 3 litigation-free land options for your gym project in the Greater Accra Region:</p>
                    <p className="font-medium mb-2">1. <strong>Oyibi (Adenta area)</strong></p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Litigation-free plots from GHS 200k-300k near Valley View University</li>
                      <li>Utilities available; value rising with road upgrades</li>
                    </ul>
                    <p className="font-medium mb-2">2. <strong>Adjen Kotoku (Ashaiman)</strong></p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Registered plots for GHS 50k, and titled parcels at GHS 160k</li>
                      <li>Commercial hotspot in Ga West municipality</li>
                    </ul>
                    <p className="font-medium mb-2">3. <strong>East Legon Hills</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Serviced plots (500m²) priced GHS 200k–500k, ideal for premium clientele</li>
                      <li>Near schools, paved roads; high-end mixed-use zone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="I'm looking for..."
                  className="flex-1 bg-[#1a1a1a] border-gray-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button className="bg-[#262626] hover:bg-[#333333]" onClick={handleSendMessage}>
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
