import SearchChatsInterface from "@/components/SearchChatsInterface";

const SearchChats = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <SearchChatsInterface onClose={function (): void {
        throw new Error("Function not implemented.");
      } } onChatSelect={function (chatId: string): void {
        throw new Error("Function not implemented.");
      } } />
    </div>
  );
};

export default SearchChats;