import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus, LogIn, Loader2 } from 'lucide-react';

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
  const [socialLoading, setSocialLoading] = useState<'google'|'microsoft'|'apple'|null>(null);

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

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setSocialLoading(provider);
    setError('');
    try {
      const backendUrl = 'https://nomar.up.railway.app';
      const authUrl = `${backendUrl}/auth/${provider}`;
      
      sessionStorage.setItem('preAuthRoute', window.location.pathname);
      window.location.href = authUrl;
    } catch (err) {
      setError(`Failed to start ${provider} login. Please try again.`);
      console.error(`${provider} login error:`, err);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2c33] rounded-xl max-w-4xl w-full overflow-hidden border border-gray-700 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 relative overflow-hidden">
           <div className="absolute inset-0 opacity-20">
  <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500"></div>
  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-purple-500"></div>
</div>
            
            <div className="relative z-10 h-full flex flex-col justify-center items-center">
            <img 
            src="/images/Vector.svg" 
            alt="Logo" 
            className="w-16 h-16 mb-6 object-contain"
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

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-md">
                {error}
              </div>
            )}

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
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
              </Button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <img 
                      src="/images/google-icon.jpeg" 
                      alt="Google" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIyLjU2IDEyLjI1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTIvNC4yN2MxLjU0LjAyIDIuOTguNTggNC4wNCAxLjU0bDIuODMtMi44M2EzLjk5IDMuOTkgMCAwIDEgNi4zOSAxLjI1bDIuNjggMi4wOGE5Ljk5IDkuOTkgMCAwIDEgLjYyIDMuODV6IiBmaWxsPSIjRUE0MzM1Ii8+PHBhdGggZD0iTTEyIDMuOTljLTIuNzQgMC01LjEuMS03LjA1LjhhOS45NCA5Ljk0IDAgMCAwLTQuMDkgMi4xOGwtMi44MyAyLjgzQTEwIDEwIDAgMCAwIDEyIDIyYzIuNzQgMCA1LjEtLjEgNy4wNS0uOGE5Ljk0IDkuOTQgMCAwIDAgNC4wOS0yLjE4bDIuODMtMi44M0ExMCAxMCAwIDAgMCAxMiAzLjk5eiIgZmlsbD0iIzM0QTg1MyIvPjxwYXRoIGQ9Ik0xMiAzLjk5YzEuNTQgMCAyLjk4LjU4IDQuMDQgMS41NGwyLjgzLTIuODNhMy45OSAzLjk5IDAgMCAxIDYuMzkgMS4yNWwyLjY4IDIuMDhhOS45OSA5Ljk5IDAgMCAxIC42MiAzLjg1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTJWMy45OXoiIGZpbGw9IiNGQkJDMjQiLz48cGF0aCBkPSJNMTIgMTIuMjVoNS43NWE1LjI1IDUuMjUgMCAwIDEtLjM4IDEuODhsLS4wNi4xMy0yLjgzIDIuODNjLS4yNi4yNi0uNTQuNDktLjgzLjY4QTEwIDEwIDAgMCAxIDEyIDMuOTl2OC4yNnoiIGZpbGw9IjQyODVGNCIvPjwvc3ZnPg==';
                      }}
                    />
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'microsoft' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 bg-[#3b3c44] border-gray-700 hover:bg-gray-700"
                onClick={() => handleSocialLogin('apple')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'apple' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <img src="/images/apple-icon.png" alt="Apple" className="w-4 h-4" />
                )}
              </Button>
            </div>

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