import { Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatItem {
  id: string;
  title: string;
  isActive?: boolean;
}

const SearchChatsInterface = () => {
  const todayChats: ChatItem[] = [
    { id: "1", title: "Gym Project" },
    { id: "2", title: "Litigation free land", isActive: true },
    { id: "3", title: "Best area for story building" },
  ];

  const yesterdayChats: ChatItem[] = [
    { id: "4", title: "Ramsa site" },
    { id: "5", title: "Ramsa towns" },
    { id: "6", title: "Urban Green Spaces" },
  ];

  const previousChats: ChatItem[] = [
    { id: "7", title: "Farming areas in Accra" },
    { id: "8", title: "Slums in Accra" },
    { id: "9", title: "Slums in Kumasi" },
  ];

  const ChatItemComponent = ({ chat }: { chat: ChatItem }) => (
    <div
      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
        chat.isActive ? "bg-white text-black" : "text-gray-300"
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
      <span className="text-sm font-mono truncate">{chat.title}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl p-4 min-h-[600px] font-mono">
      {/* Search Header */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search chats.."
          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
        >
          <X className="w-4 h-4 text-gray-400" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="flex items-center space-x-3 p-2 mb-6 cursor-pointer hover:bg-gray-700/50 rounded-lg">
        <Plus className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">New chat</span>
      </div>

      <ScrollArea className="h-[450px]">
        {/* Today Section */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-400 mb-3 font-mono">Today</h3>
          <div className="space-y-2">
            {todayChats.map((chat) => (
              <ChatItemComponent key={chat.id} chat={chat} />
            ))}
          </div>
        </div>

        {/* Yesterday Section */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-400 mb-3 font-mono">Yesterday</h3>
          <div className="space-y-2">
            {yesterdayChats.map((chat) => (
              <ChatItemComponent key={chat.id} chat={chat} />
            ))}
          </div>
        </div>

        {/* Previous 7 Days Section */}
        <div>
          <h3 className="text-xs text-gray-400 mb-3 font-mono">Previous 7 Days</h3>
          <div className="space-y-2">
            {previousChats.map((chat) => (
              <ChatItemComponent key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchChatsInterface;