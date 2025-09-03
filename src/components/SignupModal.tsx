import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'social'>('email');
  const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | 'apple' | null>(null);

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

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    // Don't proceed if provider is not configured
    if (provider !== 'google') {
      setError(`${provider} login is not available yet`);
      return;
    }

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
      <div className="bg-[#2b2c33] rounded-xl max-w-4xl w-full overflow-hidden border border-gray-700 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div
            className="hidden md:block md:w-1/2 p-8 relative overflow-hidden"
            style={{
              backgroundImage: "url('/images/lANDAibg.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            <div className="relative z-10 h-full flex flex-col justify-center items-center">
              <img
                src="/images/Vector.svg"
                alt="Logo"
                className="w-16 h-16 mb-6 object-contain"
              />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to LandAI</h2>
              <p className="text-gray-200 text-center max-w-xs">
                Join thousands of users in Exploring, analyzing, and planning smarter with LandAI
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400 text-sm">Join LandAI to unlock all features</p>
            </div>

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

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-md">
                {error}
              </div>
            )}

            {activeTab === 'email' ? (
              <>
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

                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#3b3c44] border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and a number
                  </p>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
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
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <img
                          src="/images/google-icon.jpeg"
                          alt="Google"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      Continue with Google
                    </>
                  )}
                </Button>
                
                {/* Disabled Microsoft Button */}
                <Button
                  className="w-full flex items-center justify-center gap-3 bg-[#f3f3f3] text-gray-500 font-medium py-3 opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  <img src="/images/microsoft-icon.png" alt="Microsoft" className="w-5 h-5" />
                  Continue with Microsoft (Coming Soon)
                </Button>
                
                {/* Disabled Apple Button */}
                <Button
                  className="w-full flex items-center justify-center gap-3 bg-black text-gray-500 font-medium py-3 opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  <img src="/images/apple-icon.png" alt="Apple" className="w-5 h-5" />
                  Continue with Apple (Coming Soon)
                </Button>

                <div className="text-center text-xs text-gray-500 mt-4">
                  By continuing, you agree to our Terms & Privacy Policy.
                </div>
              </div>
            )}

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