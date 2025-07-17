import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Edit, Copy } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Recommend litigation free land for my gym project.',
      isUser: true
    },
    {
      id: '2', 
      content: 'Here are the top 5 litigation-free land options for your gym project in the Greater Accra Region mapped for your convenience:\n\n1. Oyibi (Adenta area):\n   • *Historic*: Litigation-free plots from GHS200-300k, located near Valley View University, with utilities like water and electricity\n   • *Oyibi\'s rising value and infrastructure development along major roads*\n\n2. Adjen Kotoku (Ashaiman):\n   • *Serviced, fully registered plots for GHS50k, and 3 18-acre titled parcel*\n   • *Ashaiman is the 3rd West municipal capital, supporting commercial growth*\n\n3. East Legon Hills:\n   • *Larger plots (~500 m²) that are titled, walled, and serviced, priced GHS200-500k, close to schools and well-developed roads*\n   • *High-end mixed-use zone in North Accra-ideal for premium gym clientele*',
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue,
        isUser: true
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'} rounded-lg p-4`}>
              {!message.isUser && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="I'm looking for..."
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;