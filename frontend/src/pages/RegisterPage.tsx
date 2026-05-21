import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuroraBackground from '../components/AuroraBackground';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuroraBackground fullHeight className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-gray-900 px-4 transition-colors">
      <div className="max-w-md w-full animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-ink-900 dark:text-white mb-2">
            Join InkDrop
          </h1>
          <p className="text-ink-600 dark:text-gray-400 font-medium">
            Start your writing journey today
          </p>
        </div>

        <div className="backdrop-blur-md bg-white/75 dark:bg-gray-800/75 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/40 p-8 hover-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ink-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                placeholder="yourname"
                required
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, hyphens, and underscores"
              />
              <p className="text-xs text-ink-500 dark:text-gray-500 mt-1.5">
                3-50 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-ink-500 dark:text-gray-500 mt-1.5">
                At least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2.5 font-semibold text-sm shadow-md"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-ink-900 dark:text-white font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
