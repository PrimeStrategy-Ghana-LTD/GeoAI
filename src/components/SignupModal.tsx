import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { registerUser } from '@/utils/api';

interface SignupModalProps {
  onClose: () => void;
  onSignup: () => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({
  onClose,
  onSignup,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  onSwitchToLogin
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError("Password must contain at least one uppercase letter");
    } else {
      setPasswordError(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (name.length < 2) {
    setError("Name must be at least 2 characters");
    return;
  }

  validatePassword(password);
  if (passwordError) return;

  try {
    const result = await registerUser(name, email, password);
    console.log("Signup result:", result); // ✅ Helpful debug log

    if (!result?.token) {
      throw new Error("Signup failed: No token received");
    }

    // ✅ Set localStorage
    localStorage.setItem("token", result.token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("searchCount", "0");
    localStorage.setItem("userName", name);

    onSignup();  // Notify parent layout
    onClose();   // Close modal
  } catch (error: any) {
    console.error("Signup error:", error);
    setError(
      error?.response?.data?.detail?.[0]?.msg ||
      "Registration failed. Please try again."
    );
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#2b2c33] rounded-lg p-6 w-full max-w-md border border-gray-700 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            Create your account
          </h2>
          <p className="text-gray-400">Get started with Land-Ai today</p>
        </motion.div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="bg-gray-800 border-gray-700 text-white"
              required
              minLength={2}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="At least 8 chars with uppercase"
              className="bg-gray-800 border-gray-700 text-white"
              required
              minLength={8}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-400">{passwordError}</p>
            )}
          </div>
          
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-2 rounded-lg"
              disabled={!!passwordError}
            >
              Sign Up
            </Button>
          </motion.div>
        </form>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-4 text-sm text-gray-400"
        >
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Log in
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupModal;