import React, { useEffect, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversationManager } from '@/lib/ConversationManager';

interface SearchChatsInterfaceProps {
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
}

const SearchChatsInterface = ({ onClose, onChatSelect }: SearchChatsInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(conversationManager.getConversations());
  const [activeId, setActiveId] = useState<string | null>(conversationManager.getCurrentConversationId?.() ?? null);

  // Refresh on global updates
  useEffect(() => {
    const update = () => setConversations(conversationManager.getConversations());
    window.addEventListener('chatListUpdated', update);
    return () => window.removeEventListener('chatListUpdated', update);
  }, []);

  const filterAndGroupChats = () => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const today: typeof filtered = [];
    const yesterday: typeof filtered = [];
    const previous: typeof filtered = [];

    const now = new Date();
    const isToday = (date: Date) => date.toDateString() === now.toDateString();
    const isYesterday = (date: Date) => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return date.toDateString() === y.toDateString();
    };

    for (const convo of filtered) {
      if (isToday(convo.lastActive)) today.push(convo);
      else if (isYesterday(convo.lastActive)) yesterday.push(convo);
      else previous.push(convo);
    }

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: previous }
    ];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-2">
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

        {/* New Chat */}
        <button
          className="flex items-center space-x-3 p-3 mx-4 my-2 cursor-pointer hover:bg-gray-800/50 rounded-lg transition border-b border-gray-800"
          onClick={() => {
            const newConvo = conversationManager.startNewConversation('');
            setActiveId(newConvo.id);
            onChatSelect(newConvo.id);
            onClose();
            window.dispatchEvent(new Event('chatListUpdated'));
          }}
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">New chat</span>
        </button>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-4 pb-4">
          {filterAndGroupChats().map(({ label, items }) =>
            items.length > 0 && (
              <div key={label} className="mb-6">
                <h3 className="text-xs text-gray-500 mb-2 px-2">{label}</h3>
                <div className="space-y-1">
                  {items.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onChatSelect(chat.id);
                        setActiveId(chat.id);
                        onClose();
                      }}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                        chat.id === activeId ? 'bg-gray-700' : ''
                      }`}
                    >
                      <span
                        className="text-sm text-gray-200 truncate"
                        title={chat.title}
                      >
                        {chat.title || 'Untitled chat'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {chat.lastActive.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SearchChatsInterface;
