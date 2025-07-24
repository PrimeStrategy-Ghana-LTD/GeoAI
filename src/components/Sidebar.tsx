import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  ChevronRight,
  Star,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationManager } from '@/lib/ConversationManager';

interface SidebarProps {
  onNewChat: () => void;
  onSearchChats: () => void;
  onChatSelect: (chatId: string) => void;
  activeChat?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onSearchChats,
  onChatSelect,
  activeChat
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<
    { id: string; title: string; isPinned: boolean; lastActive: string }[]
  >([]);

  useEffect(() => {
    const loadChats = () => {
      const conversations = conversationManager.getConversations();
      const mapped = conversations.map((c) => ({
        id: c.id,
        title: c.title || 'Untitled',
        isPinned: false,
        lastActive: c.lastActive.toISOString()
      }));
      setChats(mapped);
    };

    loadChats();
    window.addEventListener('chatListUpdated', loadChats);
    return () => window.removeEventListener('chatListUpdated', loadChats);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const unpinnedChats = filteredChats.filter((chat) => !chat.isPinned);

  return (
    <div
      className={`h-full bg-[#1e1f24] border-r border-gray-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 z-10 bg-gray-700 rounded-full p-1 border border-gray-600 hover:bg-gray-600"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-300 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex flex-col items-center">
        {!isCollapsed ? (
          <>
            <div
              className="flex items-center gap-2 mb-4 w-full cursor-pointer"
              onClick={() => window.dispatchEvent(new Event('goToHome'))}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-300 truncate hover:text-white transition">
                NomaRoot
              </span>
            </div>

            <Button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 mb-2"
              onClick={onSearchChats}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Chats
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <Button
              size="icon"
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-300 hover:bg-gray-700"
              onClick={onSearchChats}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search chats..."
              className="w-full pl-9 pr-3 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Chats */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isCollapsed && pinnedChats.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs text-gray-400 mb-2 px-2 flex items-center">
              <Star className="w-3 h-3 mr-1" /> Pinned
            </h3>
            <div className="space-y-1">
              {pinnedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors ${
                    activeChat === chat.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="ml-2 overflow-hidden">
                    <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 truncate">{new Date(chat.lastActive).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCollapsed && unpinnedChats.length > 0 && (
          <div>
            <h3 className="text-xs text-gray-400 mb-2 px-2 flex items-center">
              <History className="w-3 h-3 mr-1" /> Recent
            </h3>
            <div className="space-y-1">
              {unpinnedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors ${
                    activeChat === chat.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="ml-2 overflow-hidden">
                    <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 truncate">{new Date(chat.lastActive).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-2 pt-2">
            {filteredChats.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                className={`p-2 rounded-lg hover:bg-gray-700/70 transition-colors ${
                  activeChat === chat.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => onChatSelect(chat.id)}
                title={chat.title}
              >
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        {!isCollapsed ? (
          <>
            <p className="text-xs text-gray-500">© 2025 NomaRoot</p>
            <p className="text-xs text-gray-500 mt-1">Terms & Privacy</p>
          </>
        ) : (
          <div className="flex justify-center">
            <span className="text-xs text-gray-500">©</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
