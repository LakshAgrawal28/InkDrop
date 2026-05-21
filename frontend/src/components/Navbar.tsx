import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close about panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setIsAboutOpen(false);
      }
    }
    if (isAboutOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAboutOpen]);

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/LakshAgrawal28',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/laksh-agrawal-873598324/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      label: 'LeetCode',
      href: 'https://leetcode.com/u/LakshAgrawal/',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
        </svg>
      ),
    },
    {
      label: 'Portfolio',
      href: 'https://lakshdoes.tech',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <nav className="border-b border-neutral-100 dark:border-neutral-900 bg-white/80 dark:bg-[#0b0c10]/80 backdrop-blur-md transition-colors sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 tracking-widest">
              <span className="text-lg font-sans font-extrabold uppercase text-neutral-900 dark:text-white">
                INKDROP
              </span>
            </Link>
 
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="https://lakshdoes.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Portfolio
              </a>
              <button
                onClick={toggleTheme}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
              {isAuthenticated ? (
                <>
                  <Link to="/drafts" className="text-xs uppercase tracking-widest font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors">
                    Drafts
                  </Link>
                  <Link
                    to="/editor"
                    className="btn btn-primary text-xs"
                  >
                    NEW POST
                  </Link>
                  <div className="flex items-center space-x-4 pl-6 border-l border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {user?.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-xs uppercase tracking-widest font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs uppercase tracking-widest font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary text-xs">
                    SIGN UP
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-ink-600 dark:text-gray-400 hover:bg-ink-100 dark:hover:bg-gray-800 transition-all hover:scale-110 active:scale-95"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-ink-600 dark:text-gray-400 hover:bg-ink-100 dark:hover:bg-gray-800 transition-all hover:scale-110 active:scale-95"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 animate-slide-down">
              <div className="flex flex-col space-y-3 px-2">
                <a
                  href="https://lakshdoes.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Portfolio
                </a>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/drafts"
                      className="px-3 py-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all hover:translate-x-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Drafts
                    </Link>
                    <Link
                      to="/editor"
                      className="px-3 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest text-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      NEW POST
                    </Link>
                    <div className="px-3 py-2 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-3">
                      Signed in as <span className="font-bold text-neutral-800 dark:text-neutral-200">{user?.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-3 py-2 text-left text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 text-xs uppercase tracking-widest font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest text-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      SIGN UP
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Floating About Me Button (bottom-right) ─── */}
      <div ref={aboutRef} className="fixed bottom-6 right-6 z-[9999]">
        {/* Toggle Button — profile pic circle */}
        <button
          onClick={() => setIsAboutOpen(!isAboutOpen)}
          className={`group relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 ${
            isAboutOpen
              ? 'border-black dark:border-white scale-110'
              : 'border-neutral-300 dark:border-neutral-700'
          }`}
          aria-label="About me"
        >
          <img
            src="/me.jpeg"
            alt="Laksh Agrawal"
            className="w-full h-full object-cover"
          />
          {/* Subtle info badge */}
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#0b0c10] transform translate-x-0.5 translate-y-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white dark:text-black">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </span>
        </button>

        {/* About Me Panel */}
        {isAboutOpen && (
          <div
            className="absolute bottom-[calc(100%+12px)] right-0 w-72 animate-scale-in origin-bottom-right"
            style={{ transformOrigin: 'bottom right' }}
          >
            <div className="bg-white/90 dark:bg-[#1a1b1f]/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with profile */}
              <div className="p-5 pb-4 text-center border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-neutral-200 dark:border-neutral-700 shadow-md">
                  <img
                    src="/me.jpeg"
                    alt="Laksh Agrawal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-sans tracking-wide">
                  Laksh Agrawal
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                  Developer &amp; Creator
                </p>
              </div>

              {/* Social Links */}
              <div className="p-3 space-y-0.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all duration-200 group/link"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover/link:bg-black group-hover/link:text-white dark:group-hover/link:bg-white dark:group-hover/link:text-black transition-all duration-200">
                      {link.icon}
                    </span>
                    <span className="text-sm font-medium tracking-wide">{link.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-auto text-neutral-400 dark:text-neutral-600 group-hover/link:text-neutral-600 dark:group-hover/link:text-neutral-400 transition-colors">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 010-1.06l7.22-7.22H8.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-7.22 7.22a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                  Made with <span className="text-red-500">❤️</span> by Laksh Agrawal
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
