import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { loginUser } from '@/services/authService';


interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  onClose, 
  onLogin, 
  email, 
  setEmail, 
  password, 
  setPassword,
  onSwitchToSignup
}) => {
  const [error, setError] = React.useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  try {
    const result = await loginUser(email, password);
    console.log("Login result:", result); // ✅ Check the structure of the response

    // Check if result has token directly or inside a 'data' or 'access_token' property
    const token = result.token || result.access_token || result?.data?.token;

    if (!token) {
      throw new Error("Login failed: No token received");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("searchCount", "0");
    localStorage.setItem("userName", email);

    onLogin();  // Notify parent
    onClose();  // Close modal
  } catch (error: any) {
    console.error("Login error:", error);
    setError(error.message || "Login failed");
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2b2c33] rounded-xl p-6 w-full max-w-md border border-gray-700 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue your land search</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#3b3c44] text-white border-gray-600"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#3b3c44] text-white border-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="text-right">
            <button 
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </button>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Log In
            </Button>
          </motion.div>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#2b2c33] px-2 text-sm text-gray-400">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Social login buttons */}
        </div>

        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToSignup}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign up
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;