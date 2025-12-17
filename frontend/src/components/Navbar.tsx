import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="border-b border-ink-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-ink-900">
              InkDrop
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/drafts" className="text-ink-700 hover:text-ink-900">
                  My Drafts
                </Link>
                <Link
                  to="/editor"
                  className="btn btn-primary"
                >
                  New Post
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-ink-200">
                  <span className="text-sm text-ink-600">
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-ink-600 hover:text-ink-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-ink-700 hover:text-ink-900">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
