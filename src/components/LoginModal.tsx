import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LoginModal = ({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 px-4">
      <Card className="bg-black text-white p-8 rounded-xl w-full max-w-sm shadow-xl transition-transform transform hover:scale-[1.02] hover:ring-2 hover:ring-cyan-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Log In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 text-white border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 text-white border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-cyan-100 transition-colors"
          >
            Log in
          </Button>
        </form>

        <div className="flex justify-between mt-4 mb-6 text-sm text-gray-400">
          <a href="#" className="hover:underline text-cyan-400">Sign Up</a>
          <a href="#" className="hover:underline text-cyan-400">Forgot Password</a>
          <a href="#" className="hover:underline text-cyan-400">Contact Us</a>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-2 text-sm text-gray-500">or</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-black border-gray-300 hover:bg-gray-100"
          >
            <img src="/images/google-icon.png" alt="Google" className="w-4 h-4" />
            Log in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-black border-gray-300 hover:bg-gray-100"
          >
            <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-4 h-4" />
            Log in with Microsoft
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-black border-gray-300 hover:bg-gray-100"
          >
            <img src="/images/apple-icon.png" alt="Apple" className="w-4 h-4" />
            Log in with Apple
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-black border-gray-300 hover:bg-gray-100"
          >
            <img src="/images/iphone-icon.png" alt="Phone" className="w-4 h-4" />
            Log in with Phone
          </Button>
        </div>

        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-2">
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>

        <div className="text-center text-xs text-gray-500">
          © 2025 ChatGPT
        </div>
      </Card>
    </div>
  );
};

export default LoginModal;
