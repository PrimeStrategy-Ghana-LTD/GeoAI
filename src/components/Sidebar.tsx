import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  ChevronRight,
  Pin,
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
    const listener = () => loadChats();
    window.addEventListener('chatListUpdated', listener);
    return () => window.removeEventListener('chatListUpdated', listener);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const unpinnedChats = filteredChats.filter((c) => !c.isPinned);

  const togglePin = (chatId: string) => {
    conversationManager.togglePin(chatId);
    window.dispatchEvent(new Event('chatListUpdated'));
  };

  const deleteChat = (chatId: string) => {
    conversationManager.deleteConversation(chatId);
    window.dispatchEvent(new Event('chatListUpdated'));
  };

  return (
    <div
      className={`h-full bg-[#1e1f24] border-r border-gray-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 z-10 bg-gray-700 border border-gray-600 rounded-full p-1 hover:bg-gray-600"
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-300 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        {!isCollapsed ? (
          <>
            <div
              className="flex items-center gap-2 mb-3 cursor-pointer group"
              onClick={() => window.dispatchEvent(new Event('goToHome'))}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-400">Generating...</span>
                </div>
              ) : (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:bg-blue-400 transition" />
                  <span className="text-gray-300 group-hover:text-white text-sm font-semibold">
                    NomaRoot
                  </span>
                </>
              )}
            </div>

            <Button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2"
              onClick={onNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            {/* Keep only this Search Chats */}
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
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <>
                <Button
                  size="icon"
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={onNewChat}
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-300 hover:bg-gray-700"
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

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {!isCollapsed && pinnedChats.length > 0 && (
          <>
            <div className="text-xs text-gray-400 px-2 mb-2 flex items-center">
              <Pin className="w-3 h-3 mr-1" />
              Pinned
            </div>
            {pinnedChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => onChatSelect(chat.id)}
                onTogglePin={() => togglePin(chat.id)}
                onDelete={() => deleteChat(chat.id)}
                pinned
              />
            ))}
          </>
        )}

        {!isCollapsed && unpinnedChats.length > 0 && (
          <>
            <div className="text-xs text-gray-400 px-2 mt-4 mb-2 flex items-center">
              <History className="w-3 h-3 mr-1" />
              Recent
            </div>
            {unpinnedChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => onChatSelect(chat.id)}
                onTogglePin={() => togglePin(chat.id)}
                onDelete={() => deleteChat(chat.id)}
              />
            ))}
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            {filteredChats.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${
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
      <div className="p-3 border-t border-gray-700 text-xs text-gray-500">
        {!isCollapsed ? (
          <>
            <p>© {new Date().getFullYear()} NomaRoot</p>
            <p className="mt-1">Terms & Privacy</p>
          </>
        ) : (
          <div className="text-center">©</div>
        )}
      </div>
    </div>
  );
};

const ChatRow = ({
  chat,
  isActive,
  onClick,
  onTogglePin,
  onDelete,
  pinned = false
}: {
  chat: { id: string; title: string; lastActive: Date };
  isActive: boolean;
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  pinned?: boolean;
}) => (
  <div
    className={`group flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors ${
      isActive ? 'bg-gray-700' : ''
    }`}
    onClick={onClick}
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
          onTogglePin();
        }}
        className="p-1 text-gray-400 hover:text-yellow-400"
        title={pinned ? 'Unpin' : 'Pin'}
      >
        <Pin className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 text-gray-400 hover:text-red-400 ml-1"
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
);

export default Sidebar;
