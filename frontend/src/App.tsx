import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Snowfall from 'react-snowfall';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
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

  return (
    <>
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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* Snowfall Toggle Button */}
        <button
          onClick={() => setShowSnowfall(!showSnowfall)}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-ink-200 dark:border-gray-700 hover:scale-110 transition-all"
          aria-label="Toggle snowfall"
          title={showSnowfall ? 'Hide snowfall' : 'Show snowfall'}
        >
          {showSnowfall ? '❄️' : '☀️'}
        </button>
        
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
