import React, { useState } from 'react';
import { Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatItem {
  id: string;
  title: string;
  isActive?: boolean;
  timeLabel?: string;
}

interface SearchChatsInterfaceProps {
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
}

const SearchChatsInterface = ({ onClose, onChatSelect }: SearchChatsInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const todayChats: ChatItem[] = [
    { id: "1", title: "Sidebar changes not reflecting", timeLabel: "Today" },
  ];

  const yesterdayChats: ChatItem[] = [
    { id: "2", title: "Sidebar changes not reflecting", timeLabel: "Yesterday" },
  ];

  const previousChats: ChatItem[] = [
    { id: "3", title: "Blank Page Troubleshooting", timeLabel: "Previous 7 Days" },
  ];

  const filteredChats = (chats: ChatItem[]) =>
    chats.filter(chat =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header: Search + Close */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={onClose} 
              className="ml-2 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          className="flex items-center space-x-3 p-3 mx-4 my-2 cursor-pointer hover:bg-gray-800/50 rounded-lg transition border-b border-gray-800"
          onClick={onClose}
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">New chat</span>
        </button>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-4 pb-4">
          {[
            { label: "Today", items: filteredChats(todayChats) },
            { label: "Yesterday", items: filteredChats(yesterdayChats) },
            { label: "Previous 7 Days", items: filteredChats(previousChats) }
          ].map(({ label, items }) => (
            items.length > 0 && (
              <div key={label} className="mb-6">
                <h3 className="text-xs text-gray-500 mb-2 px-2">{label}</h3>
                <div className="space-y-1">
                  {items.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onChatSelect(chat.id);
                        onClose();
                      }}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                        chat.isActive ? "bg-gray-700" : ""
                      }`}
                    >
                      <span className="text-sm text-gray-200 truncate">{chat.title}</span>
                      {chat.timeLabel && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {chat.timeLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SearchChatsInterface;