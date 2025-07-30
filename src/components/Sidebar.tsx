import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  ChevronRight,
  Star,
  History,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationManager } from '@/lib/ConversationManager';

interface SidebarProps {
  onNewChat: () => void;
  onSearchChats: () => void;
  onChatSelect: (chatId: string) => void;
  activeChat?: string | null;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onSearchChats,
  onChatSelect,
  activeChat,
  isLoading = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<
    { id: string; title: string; isPinned: boolean; lastActive: Date }[]
  >([]);

  useEffect(() => {
    const loadChats = () => {
      const conversations = conversationManager.getConversations();
      const mapped = conversations.map((c) => ({
        id: c.id,
        title: c.title || 'New Conversation',
        isPinned: c.isPinned || false,
        lastActive: c.lastActive
      }));
      setChats(mapped);
    };

    loadChats();
    const eventListener = () => loadChats();
    window.addEventListener('chatListUpdated', eventListener);
    return () => window.removeEventListener('chatListUpdated', eventListener);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePin = (chatId: string) => {
    conversationManager.togglePin(chatId);
    window.dispatchEvent(new Event('chatListUpdated'));
  };

  const deleteChat = (chatId: string) => {
    conversationManager.deleteConversation(chatId);
    window.dispatchEvent(new Event('chatListUpdated'));
  };

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const unpinnedChats = filteredChats.filter((chat) => !chat.isPinned);

  return (
    <div className={`h-full bg-[#1e1f24] border-r border-gray-700 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 z-10 bg-gray-700 rounded-full p-1 border border-gray-600 hover:bg-gray-600 transition-colors"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-300 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Header with Loading State */}
      <div className="p-4 border-b border-gray-700 flex flex-col items-center">
        {!isCollapsed ? (
          <>
            <div
              className="flex items-center gap-2 mb-4 w-full cursor-pointer group"
              onClick={() => window.dispatchEvent(new Event('goToHome'))}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-400">Generating...</span>
                </div>
              ) : (
                <>
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 group-hover:bg-blue-400 transition-colors"></div>
                  <span className="text-gray-300 truncate group-hover:text-white transition-colors">
                    NomaRoot
                  </span>
                </>
              )}
            </div>

            <Button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2 transition-colors"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 mb-2 transition-colors"
              onClick={onSearchChats}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Chats
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <>
                <Button
                  size="icon"
                  className="bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  onClick={onNewChat}
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={onSearchChats}
                  title="Search Chats"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </>
            )}
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
              className="w-full pl-9 pr-3 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Chats List */}
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
                  className={`group flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors ${
                    activeChat === chat.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="ml-2 overflow-hidden flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {chat.lastActive.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Unpin"
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors ml-1"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
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
                  className={`group flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors ${
                    activeChat === chat.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="ml-2 overflow-hidden flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {chat.lastActive.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Pin"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors ml-1"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
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
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} NomaRoot</p>
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