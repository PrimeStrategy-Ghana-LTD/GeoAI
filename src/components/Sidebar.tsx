import React, { useEffect, useState } from 'react';
import { Plus, Search, MessageSquare, Pin, History, Loader2, User,
LogOut, Home, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationManager } from '@/lib/ConversationManager';

interface SidebarProps {
  onNewChat: () => void;
  onSearchChats: () => void;
  onChatSelect: (chatId: string) => void;
  onGoHome: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  activeChat?: string | null;
  isLoading?: boolean;
  isLoggedIn?: boolean;
  userName?: string;
  userInitial?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onSearchChats,
  onChatSelect,
  onGoHome,
  onLogout,
  onToggleSidebar,
  isCollapsed = false,
  activeChat,
  isLoading = false,
  isLoggedIn = false,
  userName = '',
  userInitial = ''
}) => {
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

  const handleLogoClick = () => {
    window.location.reload();
  };

  // Clean collapsed sidebar with toggle icons
  if (isCollapsed) {
    return (
      <div className="h-full bg-[#1e1f24] border-r border-gray-700 flex flex-col w-16 items-center">
        {/* Header - Collapsed with toggle button */}
        <div className="p-3 border-b border-gray-700 flex flex-col items-center space-y-4 w-full">
          <button
            className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
            onClick={onToggleSidebar}
            title="Expand sidebar"
          >
            <ChevronRight className="h-6 w-6 text-blue-400" />
          </button>
        </div>

        {/* Action buttons - Collapsed */}
        <div className="flex flex-col items-center space-y-3 py-4 w-full">
          <button
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors w-12 h-12 flex items-center justify-center group relative"
            onClick={onGoHome}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors w-12 h-12 flex items-center justify-center"
            onClick={onNewChat}
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>

          {chats.length > 0 && (
            <button
              className="p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors w-12 h-12 flex items-center justify-center relative"
              onClick={onSearchChats}
              title="Search Chats"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer with user profile - Collapsed */}
        <div className="mt-auto p-3 border-t border-gray-700 flex flex-col items-center space-y-3 w-full">
          {(isLoggedIn || userInitial) && (
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              {userInitial}
            </div>
          )}

          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full sidebar view
  return (
    <div className="h-full bg-[#1e1f24] border-r border-gray-700 flex flex-col w-64">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-sm text-blue-400">Generating...</span>
              </div>
            ) : (
              <img
                src="/images/pin.png"
                alt="LANDAI Logo"
                className="h-12 w-auto object-contain cursor-pointer transition duration-200 hover:opacity-80"
                onClick={handleLogoClick}
              />
            )}
          </div>
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5 text-blue-400" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full text-gray-300 hover:bg-blue-600 hover:text-white mb-2 justify-start"
            onClick={onGoHome}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>

          <Button
            className="w-full bg-gray-700 hover:bg-gray-600 text-white mb-2 justify-start"
            onClick={onNewChat}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <Button
            variant="ghost"
            className="w-full text-gray-300 hover:bg-gray-700 mb-2 justify-start"
            onClick={onSearchChats}
          >
            <Search className="w-4 h-4 mr-2" />
            Search Chats
          </Button>
        </div>
      </div>

      {/* Chat List (only if logged in) */}
      {isLoggedIn && (
        <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {chats.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            <>
              {pinnedChats.length > 0 && (
                <>
                  <div className="text-xs text-gray-400 px-2 mb-2 flex items-center font-medium">
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
              {unpinnedChats.length > 0 && (
                <>
                  <div className="text-xs text-gray-400 px-2 mt-4 mb-2 flex items-center font-medium">
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
            </>
          )}
        </div>
      )}

      {/* Guest user chat preview with pin/delete functionality */}
      {!isLoggedIn && chats.length > 0 && (
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="text-xs text-gray-400 px-2 mb-2 flex items-center font-medium">
            <History className="w-3 h-3 mr-1" />
            Current Session
          </div>
          {chats.slice(0, 3).map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              isActive={activeChat === chat.id}
              onClick={() => onChatSelect(chat.id)}
              onTogglePin={() => togglePin(chat.id)}
              onDelete={() => deleteChat(chat.id)}
              isGuest={true}
              showActions={true}
            />
          ))}
          {chats.length > 3 && (
            <div className="px-2 py-1 text-xs text-gray-500 text-center">
              +{chats.length - 3} more chats
            </div>
          )}
        </div>
      )}

      {/* Footer with user profile - Full view */}
      <div className="mt-auto p-3 border-t border-gray-700">
        {(isLoggedIn || userInitial) ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#2b2c33] to-[#323340] border border-gray-600/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName || 'Guest User'}
              </p>
              <p className="text-xs text-gray-400">
                Beta Test
              </p>
            </div>
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700/50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-4">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Sign in to save your chats</p>
          </div>
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
  pinned = false,
  isGuest = false,
  showActions = true
}: {
  chat: { id: string; title: string; lastActive: Date };
  isActive: boolean;
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  pinned?: boolean;
  isGuest?: boolean;
  showActions?: boolean;
}) => (
  <div
    className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
        : 'hover:bg-gray-700/50 hover:border-gray-600/30 border border-transparent'
    }`}
    onClick={onClick}
  >
    <MessageSquare className={`w-4 h-4 flex-shrink-0 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
    <div className="overflow-hidden flex-1 min-w-0">
      <p className={`text-sm truncate font-medium ${isActive ? 'text-white' : 'text-gray-200'}`}>
        {chat.title}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {chat.lastActive.toLocaleString()}
      </p>
    </div>

    {showActions && (
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="p-1.5 hover:bg-gray-600/50 rounded-md transition-colors"
          title={pinned ? 'Unpin' : 'Pin'}
        >
          <Pin
            className={`w-3 h-3 ${pinned ? 'text-blue-400 fill-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this chat?')) {
              onDelete();
            }
          }}
          className="p-1.5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )}
  </div>
);
 
export default Sidebar;