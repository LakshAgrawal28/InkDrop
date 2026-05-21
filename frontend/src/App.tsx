import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Snowfall from 'react-snowfall';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import RippleEffect from './components/RippleEffect';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditorPage from './pages/EditorPage';
import DraftsPage from './pages/DraftsPage';
import './index.css';

function AppContent() {
  const { theme } = useTheme();
  const [showSnowfall, setShowSnowfall] = useState(true);
  const [showRipples, setShowRipples] = useState(true);

  return (
    <>
      {showRipples && <RippleEffect />}
      {showSnowfall && (
        <Snowfall
          color={theme === 'dark' ? '#e2e8f0' : '#adb5bd'}
          snowflakeCount={50}
          speed={[0.5, 1.5]}
          wind={[-0.5, 1.0]}
          radius={[0.5, 3.0]}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
      )}
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0c10] transition-colors">
        {/* Effects Toggle Buttons */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-1.5">
          <button
            onClick={() => setShowSnowfall(!showSnowfall)}
            className="p-2.5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm flex items-center justify-center"
            aria-label="Toggle snowfall"
            title={showSnowfall ? 'Hide Snowfall' : 'Show Snowfall'}
          >
            {showSnowfall ? '❄️' : '☀️'}
          </button>

          <button
            onClick={() => setShowRipples(!showRipples)}
            className="p-2.5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm flex items-center justify-center"
            aria-label="Toggle ripples"
            title={showRipples ? 'Hide Ripple Effect' : 'Show Ripple Effect'}
          >
            {showRipples ? '💧' : '🚫'}
          </button>
        </div>
        
        <Navbar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drafts"
              element={
                <ProtectedRoute>
                  <DraftsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
