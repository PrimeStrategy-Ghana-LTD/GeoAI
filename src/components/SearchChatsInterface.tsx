import React, { useState } from 'react';
import { Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatItem {
  id: string;
  title: string;
  isActive?: boolean;
  hasCheckbox?: boolean;
  timeLabel?: string;
}

interface SearchChatsInterfaceProps {
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
}

const SearchChatsInterface = ({ onClose, onChatSelect }: SearchChatsInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const todayChats: ChatItem[] = [
    { id: "1", title: "Sidebar changes not reflecting", hasCheckbox: true, timeLabel: "Today" },
  ];

  const yesterdayChats: ChatItem[] = [
    { id: "2", title: "Sidebar changes not reflecting", hasCheckbox: true, timeLabel: "Yesterday" },
  ];

  const previousChats: ChatItem[] = [
    { id: "3", title: "Blank Page Troubleshooting", hasCheckbox: true },
    { id: "4", title: "Labour Productivity Calculation", hasCheckbox: true },
    { id: "5", title: "Gym Project", timeLabel: "Previous 7 Days" },
    { id: "6", title: "Litigation free land", isActive: true, timeLabel: "Previous 7 Days" },
  ];

  const filteredChats = (chats: ChatItem[]) => 
    chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-2xl p-4 min-h-[600px] relative">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Search Header */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search chats..."
          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* New Chat Button */}
      <div 
        className="flex items-center space-x-3 p-3 mb-6 cursor-pointer hover:bg-gray-700/50 rounded-lg"
        onClick={onClose}
      >
        <Plus className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">New chat</span>
      </div>

      <ScrollArea className="h-[450px] pr-2">
        {/* Today Section */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-400 mb-3">Today</h3>
          <div className="space-y-2">
            {filteredChats(todayChats).map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
                  chat.isActive ? "bg-white text-black" : "text-gray-300"
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  {chat.hasCheckbox && (
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{chat.title}</span>
                </div>
                {chat.timeLabel && (
                  <span className="text-xs text-gray-400">{chat.timeLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Yesterday Section */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-400 mb-3">Yesterday</h3>
          <div className="space-y-2">
            {filteredChats(yesterdayChats).map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
                  chat.isActive ? "bg-white text-black" : "text-gray-300"
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  {chat.hasCheckbox && (
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{chat.title}</span>
                </div>
                {chat.timeLabel && (
                  <span className="text-xs text-gray-400">{chat.timeLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Previous 7 Days Section */}
        <div>
          <h3 className="text-xs text-gray-400 mb-3">Previous 7 Days</h3>
          <div className="space-y-2">
            {filteredChats(previousChats).map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
                  chat.isActive ? "bg-white text-black" : "text-gray-300"
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  {chat.hasCheckbox && (
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{chat.title}</span>
                </div>
                {chat.timeLabel && (
                  <span className="text-xs text-gray-400">{chat.timeLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchChatsInterface;