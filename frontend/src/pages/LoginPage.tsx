import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuroraBackground from '../components/AuroraBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuroraBackground fullHeight className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] px-4 transition-colors">
      <div className="max-w-md w-full animate-scale-in relative z-10 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-sans tracking-widest uppercase text-neutral-900 dark:text-white mb-2">
            INKDROP
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-serif italic text-sm">
            A silent harbor for your drafts and thoughts
          </p>
        </div>

        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60 p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 px-4 py-3 text-sm font-sans tracking-wide">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="name@domain.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50">
            <p className="text-xs tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              New to the platform?{' '}
              <Link to="/register" className="text-black dark:text-white font-bold hover:underline underline-offset-4 ml-1">
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
