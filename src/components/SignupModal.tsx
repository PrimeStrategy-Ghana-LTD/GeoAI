import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { registerUser } from '@/utils/api'; // added

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
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await registerUser(name, email, password);


      console.log("Signup successful:", result);
      localStorage.setItem("token", result.token ?? "");
      onSignup(); // parent callback (optional)
      onClose();
    } catch (error: any) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
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
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Full Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="bg-gray-800 border-gray-700 text-white"
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
        
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-2 rounded-lg"
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
  );
};

export default SignupModal;
