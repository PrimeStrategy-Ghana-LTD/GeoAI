import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageSquare } from 'lucide-react';

const Sidebar: React.FC = () => {
  const chats = [
    "Gym Project",
    "Best area for story...",
    "Ramsa site"
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Chat 1</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span className="text-gray-300">Land-Ai</span>
        </div>
        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        <Button variant="ghost" className="w-full text-gray-300 hover:bg-gray-700">
          <Search className="w-4 h-4 mr-2" />
          Search Chats
        </Button>
      </div>
      
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
        <div className="space-y-2">
          {chats.map((chat, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300 truncate">{chat}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Copyright © 2025</p>
        <p className="text-xs text-gray-500 mt-1">Terms and conditions</p>
      </div>
    </div>
  );
};

export default Sidebar;