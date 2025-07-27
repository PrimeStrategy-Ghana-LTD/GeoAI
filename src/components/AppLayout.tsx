import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchChatsInterface from '@/components/SearchChatsInterface';
import { Mic, Loader2, Send, Paperclip, Star, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import toast, { Toaster } from 'react-hot-toast';
import { conversationManager } from '@/lib/ConversationManager';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';
import api from '@/utils/api';


// ADD these hooks early in the component:
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');


declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

type InsightType = 'location' | 'legal' | 'price' | 'info';

interface Insight {
  type: InsightType;
  value: string;
}

const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    if (isRecording) recognition.start();
    else recognition.stop();

    return () => recognition.abort();
  }, [isRecording]);

  return { 
    isRecording, 
    startRecording: () => setIsRecording(true), 
    stopRecording: () => setIsRecording(false), 
    transcript 
  };
};

const getInsightBadgeColor = (type: InsightType) => {
  switch (type) {
    case 'location': return 'bg-blue-600 text-white';
    case 'legal': return 'bg-yellow-600 text-white';
    case 'price': return 'bg-green-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

const extractInsights = (text: string): Insight[] => {
  const points: Insight[] = [];
  const lower = text.toLowerCase();
  
  if (lower.includes('leasehold')) points.push({ type: 'legal', value: 'Title: Leasehold' });
  if (lower.includes('freehold')) points.push({ type: 'legal', value: 'Title: Freehold' });
  
  const locations = ['madina', 'adenta', 'east legon', 'airport'];
  locations.forEach(loc => {
    if (lower.includes(loc)) points.push({ 
      type: 'location', 
      value: `Location: ${loc.charAt(0).toUpperCase() + loc.slice(1)}` 
    });
  });

  const priceMatch = lower.match(/(ghs\s?[\d,]+|\$\s?[\d,]+)/i);
  if (priceMatch) points.push({ type: 'price', value: `Price: ${priceMatch[0]}` });

  return points.length ? points : [{ type: 'info', value: 'No key insights found.' }];
};

const generateFollowUps = (text: string): string[] => {
  const lower = text.toLowerCase();
  const followups: string[] = [];
  
  if (lower.includes('madina')) followups.push('What is the price range in Madina?');
  if (lower.includes('adenta')) followups.push('Are there any disputes in Adenta?');
  if (lower.includes('leasehold')) followups.push('Can I convert leasehold to freehold?');
  if (lower.includes('freehold')) followups.push('What are the benefits of freehold?');
  
  return followups.length ? followups : [
    'Is it safe to buy land here?',
    'Can I see legal documents?',
    'What are the payment plans available?'
  ].slice(0, 3);
};

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [activeTab, setActiveTab] = useState<'question' | 'response' | 'followup'>('question');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 5.614818, lng: -0.205874 });
  const [showMap, setShowMap] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isRecording, startRecording, stopRecording, transcript } = useSpeechToText();
  const [email, setEmail] = useState('');
const [password, setPassword] = useState('');


  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
    const storedName = localStorage.getItem('userName') || '';
    setIsLoggedIn(storedLogin);
    setUserName(storedName);
  }, []);

  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  const handleSend = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    setLoading(true);
    try {
      if (!activeChat) {
        const newConvo = conversationManager.startNewConversation('');
        setActiveChat(newConvo.id);
      }

      await conversationManager.addUserMessage(inputValue);
      
      const { answer } = await api.query(inputValue, {
        conversationId: activeChat || undefined
      });
      
      await conversationManager.addAssistantMessage(answer);

      const currentConvo = conversationManager.getCurrentConversation();
      setMessages(currentConvo.messages.map(m => ({
        role: m.role === 'assistant' ? 'ai' : 'user',
        text: m.content
      })));

      setInsights(extractInsights(answer));
      setSuggestions(generateFollowUps(inputValue));
      
      const locationInsight = insights.find(i => i.type === 'location');
      if (locationInsight) {
        const location = locationInsight.value.replace('Location: ', '');
        const coords = await geocodeLocation(location);
        if (coords) setMapCenter(coords);
      }

      setInputValue('');
      setActiveTab('response');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (place: string) => {
    if (!place) return null;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      return data.results?.[0]?.geometry?.location || null;
    } catch (error) {
      toast.error('Failed to fetch location');
      return null;
    }
  };

  const handleLoginSuccess = (username: string, token: string) => {
    setIsLoggedIn(true);
    setUserName(username);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', username);
    localStorage.setItem('token', token);
    toast.success(`Welcome, ${username}`);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    api.resetSession();
    toast.success('Logged out successfully');
  };

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex space-x-6 border-b border-gray-700 text-sm font-medium mb-6 px-6">
        <button
          onClick={() => setActiveTab('question')}
          className={`pb-3 ${activeTab === 'question' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          # {messages.find(m => m.role === 'user')?.text || 'Your question'}
        </button>
        <button
          onClick={() => setActiveTab('response')}
          className={`pb-3 ${activeTab === 'response' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          AI Response
        </button>
        <button
          onClick={() => setActiveTab('followup')}
          className={`pb-3 ${activeTab === 'followup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          Follow-up
        </button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        {activeTab === 'question' && (
          <div className="bg-[#2b2c33] p-6 rounded-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {messages.find(m => m.role === 'user')?.text || 'No question yet'}
              </h2>
              <button 
                onClick={() => {
                  const userMessage = messages.find(m => m.role === 'user');
                  if (userMessage) setInputValue(userMessage.text);
                }}
                className="text-gray-400 hover:text-white"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-6">
            <div className="bg-[#3b3c44] p-6 rounded-xl">
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
                </div>
              ) : (
                messages.find(m => m.role === 'ai')?.text
                  ?.split('\n\n')
                  .map((section, i) => (
                    <div key={i} className="space-y-2">
                      {section.split('\n').map((line, j) => (
                        <p 
                          key={j} 
                          className={`text-white text-sm ${line.match(/^\d+\./) ? 'font-medium' : ''}`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )) || <p className="text-gray-400">No response yet</p>
              )}
            </div>

            {insights.length > 0 && (
              <div className="bg-[#25262b] p-4 rounded-lg border-l-4 border-blue-400">
                <p className="font-semibold text-blue-400 mb-2">🔍 Insights</p>
                <div className="flex flex-wrap gap-2">
                  {insights.map((point, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(point.value);
                        toast.success('Copied to clipboard!');
                      }}
                      className={`text-xs px-3 py-1 rounded-full ${getInsightBadgeColor(point.type)} hover:opacity-80 transition-opacity`}
                    >
                      {point.value}
                    </button>
                  ))}
                </div>
                {insights.some(i => i.type === 'location') && (
                  <button 
                    onClick={() => setShowMap(!showMap)}
                    className="mt-3 text-blue-400 text-sm hover:underline"
                  >
                    {showMap ? 'Hide map' : 'Show on map'}
                  </button>
                )}
              </div>
            )}

            {showMap && (
              <div className="h-64 rounded-lg overflow-hidden">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                  <GoogleMap 
                    center={mapCenter} 
                    zoom={14} 
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false
                    }}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                </LoadScript>
              </div>
            )}
          </div>
        )}

        {activeTab === 'followup' && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(s);
                    inputRef.current?.focus();
                  }}
                  className="bg-[#2b2c33] hover:bg-[#3b3c44] text-sm px-4 py-2 rounded-full border border-gray-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-12 pr-12 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Ask a follow-up..."
                disabled={loading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="text-gray-400 hover:text-white"
                >
                  <Paperclip className="w-4 h-4" />
                  <input id="file-upload" type="file" className="hidden" />
                </button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? 'text-red-400' : 'text-blue-400'}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSend} 
                  disabled={loading}
                  className="text-blue-400 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#1e1f24] text-white">
      <Toaster position="top-right" />
      
      <Sidebar
        activeChat={activeChat}
        onNewChat={() => {
          const convo = conversationManager.startNewConversation('');
          setActiveChat(convo.id);
          setMessages([]);
          setInputValue('');
          setInsights([]);
          setSuggestions([]);
          setCurrentView('chat');
          setActiveTab('question');
        }}
        onSearchChats={() => setShowSearch(true)}
        onChatSelect={(chatId) => {
          conversationManager.setActiveConversation(chatId);
          const convo = conversationManager.getCurrentConversation();
          setMessages(convo.messages.map(m => ({
            role: m.role === 'assistant' ? 'ai' : 'user',
            text: m.content,
          })));
          setActiveChat(chatId);
          setCurrentView('chat');
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to home
          </button>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {userName}</span>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                className="text-blue-400 hover:text-blue-300"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSignup(true)}
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {currentView === 'home' ? (
          <div className="flex flex-col items-center justify-center h-full text-xl text-gray-400 p-6">
            <p className="text-2xl font-semibold mb-4 text-center">Get all you need about your desired land</p>
            <p className="text-base text-gray-500 mb-8">Ask a question to begin</p>
            
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full pl-12 pr-12 py-3 bg-[#2b2c33] text-white rounded-full border border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="Ask about a location, title, or price..."
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? 'text-red-400' : 'text-blue-400'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <button 
                    onClick={handleSend} 
                    disabled={loading}
                    className="text-blue-400 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderChatContent()
        )}
      </main>

      <LoginModal 
        open={showLogin} 
        onClose={() => setShowLogin(false)}
        onLogin={async (credentials) => {
          try {
            const { token, user } = await api.login(credentials.email, credentials.password);
            if (user?.name) {
              handleLoginSuccess(user.name, token);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
          }
        }}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
      
      <SignupModal 
        open={showSignup} 
        onClose={() => setShowSignup(false)}
        onSignup={async (data) => {
          try {
            const { token, user } = await api.register(data);
            if (user?.name) {
              handleLoginSuccess(user.name, token);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Signup failed');
          }
        }}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
        initialValues={{
          name: '',
          email: '',
          password: ''
        }}
      />
      
      {showSearch && (
        <SearchChatsInterface 
          onClose={() => setShowSearch(false)} 
          onChatSelect={(chatId) => {
            conversationManager.setActiveConversation(chatId);
            const convo = conversationManager.getCurrentConversation();
            setMessages(convo.messages.map(m => ({
              role: m.role === 'assistant' ? 'ai' : 'user',
              text: m.content,
            })));
            setActiveChat(chatId);
            setCurrentView('chat');
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;