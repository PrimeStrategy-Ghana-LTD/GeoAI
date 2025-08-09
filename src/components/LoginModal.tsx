import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus, LogIn } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'email' | 'social'>('email');

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
      <div className="bg-[#2b2c33] rounded-xl max-w-4xl w-full overflow-hidden border border-gray-700 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding/Graphics */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500 filter blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-500 filter blur-3xl"></div>
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-center items-center">
              <img 
                src="/images/Vector-star.png" 
                alt="Logo" 
                className="w-16 h-16 mb-6"
              />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300 text-center max-w-xs">
                Access your personalized property recommendations
              </p>
            </div>
          </div>

          
          <div className="w-full md:w-1/2 p-8 relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Log In</h2>
              <p className="text-gray-400 text-sm">
                Access your Land-AI account
              </p>
            </div>

          
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`flex-1 py-2 font-medium text-sm ${activeTab === 'email' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('email')}
              >
                Email Login
              </button>
              <button
                className={`flex-1 py-2 font-medium text-sm ${activeTab === 'social' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('social')}
              >
                Social Login
              </button>
            </div>

        
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-md">
                {error}
              </div>
            )}

            {activeTab === 'email' ? (
              <>
           
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

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-700"></div>
                  <span className="px-3 text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-700"></div>
                </div>

                {/* Quick Social Login Option */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                    onClick={() => handleSocialLogin('google')}
                  >
                    <img src="/images/google-icon.png" alt="Google" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                    onClick={() => handleSocialLogin('microsoft')}
                  >
                    <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                    onClick={() => handleSocialLogin('apple')}
                  >
                    <img src="/images/apple-icon.png" alt="Apple" className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 bg-[#3b3c44] border-gray-700 hover:bg-gray-700 py-5"
                  onClick={() => handleSocialLogin('google')}
                >
                  <img src="/images/google-icon.png" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 bg-[#3b3c44] border-gray-700 hover:bg-gray-700 py-5"
                  onClick={() => handleSocialLogin('microsoft')}
                >
                  <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-5 h-5" />
                  <span>Continue with Microsoft</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 bg-[#3b3c44] border-gray-700 hover:bg-gray-700 py-5"
                  onClick={() => handleSocialLogin('apple')}
                >
                  <img src="/images/apple-icon.png" alt="Apple" className="w-5 h-5" />
                  <span>Continue with Apple</span>
                </Button>

                <div className="text-center text-sm text-gray-500 mt-6">
                  By continuing, you agree to our Terms and Privacy Policy
                </div>
              </div>
            )}

            
            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;