import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'email' | 'social'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number');
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

  const handleSocialLogin = (provider: 'google' | 'microsoft' | 'apple') => {
    const authUrls = {
      google: 'https://nomar.up.railway.app/auth/google',
      microsoft: 'https://nomar.up.railway.app/auth/microsoft',
      apple: 'https://nomar.up.railway.app/auth/apple'
    };
    window.location.href = authUrls[provider];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2c33] rounded-xl max-w-4xl w-full overflow-hidden border border-gray-700 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Side */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500 blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-500 blur-3xl"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center items-center">
              <img src="/images/Vector-star.png" alt="Logo" className="w-16 h-16 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Land-AI</h2>
              <p className="text-gray-300 text-center max-w-xs">
                Join thousands of users finding their perfect property with AI assistance
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400 text-sm">Join Land-AI to unlock all features</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('email')}
              >
                Email Signup
              </button>
              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  activeTab === 'social'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('social')}
              >
                Social Login
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-md">
                {error}
              </div>
            )}

            {activeTab === 'email' ? (
              <>
                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#3b3c44] border-gray-700 text-white"
                  />
                  <Input
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#3b3c44] border-gray-700 text-white"
                  />
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#3b3c44] border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and a number
                  </p>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>

                <div className="text-center text-xs text-gray-500 mt-4">
                  By signing up, you agree to our Terms & Privacy Policy.
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 hover:opacity-90 transition"
                >
                  <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </Button>
                <Button
                  onClick={() => handleSocialLogin('microsoft')}
                  className="w-full flex items-center justify-center gap-3 bg-[#f3f3f3] text-black font-medium py-3 hover:opacity-90 transition"
                >
                  <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-5 h-5" />
                  Continue with Microsoft
                </Button>
                <Button
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-3 hover:opacity-90 transition"
                >
                  <img src="/images/apple-icon.png" alt="Apple" className="w-5 h-5" />
                  Continue with Apple
                </Button>

                <div className="text-center text-xs text-gray-500 mt-4">
                  By continuing, you agree to our Terms & Privacy Policy.
                </div>
              </div>
            )}

            {/* Footer Link */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
