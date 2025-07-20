import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, LogIn } from 'lucide-react';

interface SignupModalProps {
  onClose: () => void;
  onSignup: (data: { email: string; password: string; name: string }) => Promise<void>;
  onSwitchToLogin: () => void;
  initialValues?: {
    name: string;
    email: string;
    password: string;
  };
}

const SignupModal: React.FC<SignupModalProps> = ({
  onClose,
  onSignup,
  onSwitchToLogin,
  initialValues = { name: '', email: '', password: '' }
}) => {
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [password, setPassword] = useState(initialValues.password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await onSignup({ email, password, name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700 transition-colors"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-gray-400 text-sm">
          Join Land-Ai to unlock all features
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="bg-[#3b3c44] border-gray-700 text-white"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-[#3b3c44] border-gray-700 text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-[#3b3c44] border-gray-700 text-white"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1 w-full mt-2"
        >
          <LogIn className="w-4 h-4" />
          Log in instead
        </button>
      </div>
    </div>
  );
};

export default SignupModal;