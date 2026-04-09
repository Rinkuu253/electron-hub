import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useShortcut } from './helper/useShortcut';

const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null); // { username, role, email }

  // ── Receive user data pushed from main process ─────────────────────────
  useEffect(() => {
    const handleUserData = (data) => {
      setUser(data);
    };

    // Method 1: listen for push event
    if (window.electronAPI?.onUserData) {
      window.electronAPI.onUserData(handleUserData);
    }

    // Method 2: pull fallback
    const fetchUserData = async () => {
      if (window.electronAPI?.getUserData) {
        const data = await window.electronAPI.getUserData();
        if (data) setUser(data);
      }
    };
    fetchUserData();
  }, []);

  // ── Shortcuts ──────────────────────────────────────────────────────────
  useShortcut('shift+F1', () => alert('F1 pressed! Triggering an action…'));
  useShortcut('ctrl+l', () => { setIsDark(prev => !prev); });

  // ── Avatar initials helper ─────────────────────────────────────────────
  const initials = () => {
    if (!user?.username) return '?';
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar user={user} isDark={isDark} />

      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Top bar ── */}
        <header className={`flex items-center justify-between px-8 h-16 flex-shrink-0 border-b ${isDark ? 'border-white/5 bg-gray-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {user
                ? `Welcome back, ${user.username} · ${user.role}`
                : 'Welcome to Electron Hub'}
            </p>
          </div>

          {/* User chip */}
          {user && (
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5 border border-white/8' : 'bg-gray-100 border border-gray-200'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{user.username}</span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</span>
              </div>
              <div className={`ml-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                user.role === 'Administrator'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {user.role}
              </div>
            </div>
          )}
        </header>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-gradient-to-br from-indigo-900/10 to-purple-900/10' : 'bg-gradient-to-br from-indigo-100/40 to-purple-100/40'}`} />

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">

            {/* Welcome banner */}
            <div className={`rounded-2xl p-6 border ${isDark ? 'bg-white/4 border-white/8 backdrop-blur-xl' : 'bg-white border-gray-200 shadow-lg'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  {user
                    ? <span className="text-white text-lg font-bold">{initials()}</span>
                    : <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  }
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user ? `Hey, ${user.username}! 👋` : 'Welcome to Your App'}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user
                      ? `You're logged in as ${user.role} · ${user.email}`
                      : 'Sign in to get started.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  icon:  'M13 10V3L4 14h7v7l9-11h-7z',
                  label: 'Lightning Fast',
                  desc:  'Built with Vite and React for incredible performance.',
                  color: 'indigo',
                },
                {
                  id: 2,
                  icon:  'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
                  label: 'Modern Styling',
                  desc:  'Tailwind CSS integrated for rapid and beautiful designs.',
                  color: 'purple',
                },
                {
                  id: 3,
                  icon:  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  label: 'Secure Auth',
                  desc:  'Login data passed securely via Electron IPC channels.',
                  color: 'pink',
                },
                {
                  id: 4,
                  icon:  'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
                  label: 'Multi-Window',
                  desc:  'Separate login & main windows with controlled lifecycle.',
                  color: 'cyan',
                },
              ].map((card) => (
                <div key={card.id} className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer group hover:scale-[1.02] ${
                  isDark
                    ? `bg-white/4 border-white/6 hover:border-${card.color}-500/40`
                    : `bg-white border-gray-200 hover:border-${card.color}-300 shadow-sm hover:shadow-md`
                }`}>
                  <div className={`text-${card.color}-400 mb-3 group-hover:scale-110 transform transition-transform origin-left`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                    </svg>
                  </div>
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{card.label}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Keyboard hint */}
            <div className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Press <kbd className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-white/8 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Ctrl+L</kbd> to toggle theme &nbsp;·&nbsp;
              <kbd className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-white/8 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>F11</kbd> fullscreen
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
