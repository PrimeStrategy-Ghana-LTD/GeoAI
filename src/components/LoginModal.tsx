import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
        <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
        <p className="text-gray-400 text-sm">
          Log in to access your account
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
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-[#3b3c44] border-gray-700 text-white"
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-[#3b3c44] border-gray-700 text-white"
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1 w-full mt-2"
        >
          <UserPlus className="w-4 h-4" />
          Sign up instead
        </button>
      </div>
    </div>
  );
};

export default LoginModal;