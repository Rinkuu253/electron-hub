import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useShortcut } from './helper/useShortcut';

const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null); 
  const [devices, setDevices] = useState({}); // { [path]: { type, status, lastUpdate } }

  // ── Receive user data pushed from main process ─────────────────────────
  useEffect(() => {
    const handleUserData = (data) => setUser(data);
    if (window.electronAPI?.onUserData) {
      window.electronAPI.onUserData(handleUserData);
    }
    const fetchUserData = async () => {
      if (window.electronAPI?.getUserData) {
        const data = await window.electronAPI.getUserData();
        if (data) setUser(data);
      }
    };
    fetchUserData();
  }, []);

  // ── Hardware Monitoring ──────────────────────────────────────────────────
  useEffect(() => {
    if (window.electronAPI?.onHardwareEvent) {
      window.electronAPI.onHardwareEvent(({ type, detail }) => {
        setDevices(prev => {
          const next = { ...prev };
          const isConnected = type.endsWith('_CONNECTED');
          const deviceType = type.startsWith('SERIAL') ? 'Serial' : 'TCP';
          if (isConnected) {
            next[detail] = {
              type: deviceType,
              status: 'Connected',
              lastUpdate: new Date().toLocaleTimeString(),
            };
          } else {
            delete next[detail];
          }
          return next;
        });
      });
    }
  }, []);

  // ── Shortcuts ──────────────────────────────────────────────────────────
  useShortcut('ctrl+l', () => setIsDark(prev => !prev));

  const initials = () => {
    if (!user?.username) return '?';
    return user.username.slice(0, 2).toUpperCase();
  };

  const deviceList = Object.entries(devices);

  // ── Dynamic Styles ─────────────────────────────────────────────────────
  const themeClass = isDark 
    ? "bg-[#0f111a] text-slate-200" 
    : "bg-[#f8fafc] text-slate-900";

  const cardClass = isDark
    ? "bg-[#1a1d2e] border-[#2d314d] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    : "bg-white border-slate-200 shadow-sm";

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-500 ${themeClass}`}>
      {/* Sidebar Component */}
      <Sidebar user={user} isDark={isDark} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Animated Background Orbs (Visual Polish) */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        )}

        {/* ── Header / Top Bar ── */}
        <header className={`flex items-center justify-between px-8 h-20 flex-shrink-0 z-20 border-b ${isDark ? 'border-white/5 bg-[#0f111a]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md`}>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">
              COMMAND CENTER
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {user?.role || 'SYSTEM'}
              </span>
              <span className="w-1 h-1 rounded-full bg-indigo-500/50" />
              <span className={`text-[10px] uppercase font-medium tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Live Hub Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Toggle Theme (Ctrl+L)"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1m-16 0H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Profile Section */}
            {user && (
              <div className="flex items-center gap-4 pl-6 border-l border-slate-200/10">
                <div className="flex flex-col items-end leading-tight hidden md:flex">
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.username}</span>
                  <span className={`text-[11px] font-medium opacity-50`}>{user.email}</span>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                    <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-black text-sm text-white ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                      <span className="bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">{initials()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main Viewport ── */}
        <main className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10 scrollbar-hide">
          
          {/* Welcome Banner */}
          <section className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`} />
            <div className={`relative px-8 py-10 rounded-2xl border ${cardClass} flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden`}>
              {/* Decoration stripes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rotate-45 translate-x-16 -translate-y-16" />
              
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Welcome back, <span className="text-indigo-500">{user?.username || 'Commander'}</span>
                  </h2>
                  <p className={`text-sm mt-1.5 font-medium opacity-60`}>
                    System is operational. {deviceList.length} devices are currently communicating with the hub.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-[10px] font-bold uppercase opacity-40">Status</div>
                  <div className="text-sm font-black text-emerald-500 uppercase tracking-widest">Normal</div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-[10px] font-bold uppercase opacity-40">Uptime</div>
                  <div className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>99.9%</div>
                </div>
              </div>
            </div>
          </section>

          {/* Machine Monitoring Hub */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Hardware Integration
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>AUTO-SCANNING</span>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: `${i * 0.3}s` }} />)}
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border overflow-hidden ${cardClass}`}>
              <div className="p-8">
                {deviceList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deviceList.map(([path, info]) => (
                      <div key={path} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-[#0f111a] border-white/5 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-300 shadow-sm'}`}>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-2xl transition-colors pointer-events-none" />
                        
                        <div className="flex items-start justify-between relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${info.type === 'Serial' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {info.type === 'Serial' ? (
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                            ) : (
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md mb-1">Active</span>
                            <span className="text-[10px] opacity-40 font-mono">{info.lastUpdate}</span>
                          </div>
                        </div>

                        <div className="mt-4 relative z-10">
                          <h4 className={`text-lg font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{path}</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${info.type === 'Serial' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {info.type}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-500/30" />
                            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>RS232 Protocol</span>
                          </div>
                        </div>

                        {/* Data visualization placeholder */}
                        <div className="mt-6 flex items-end gap-[2px] h-8 opacity-40 group-hover:opacity-100 transition-opacity">
                          {[.2,.5,.8,.3,.9,.4,.7,.5,.2,.6,.8,.4].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-500 rounded-[1px]" style={{ height: `${h * 100}%` }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-16 border-2 border-dashed rounded-3xl ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <svg className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h4 className={`text-lg font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No Machines Detected</h4>
                    <p className={`text-sm mt-2 max-w-xs mx-auto opacity-50`}>
                      Listening for Serial hardware and incoming TCP connections on ports <span className="text-indigo-500">5000</span>, <span className="text-indigo-500">5001</span>.
                    </p>
                    <button className="mt-6 px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-2 mx-auto">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Manual Probe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Data Packets', value: '1.2k', change: '+12%', color: 'blue' },
              { label: 'Success Rate', value: '100%', change: 'Stable', color: 'emerald' },
              { label: 'Avg Latency', value: '12ms', change: '-2ms', color: 'purple' },
              { label: 'Memory', value: '246MB', change: '+2MB', color: 'pink' },
            ].map((stat, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${cardClass}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-2`}>{stat.label}</div>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.change.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-indigo-500 bg-indigo-500/10'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* Footer Hints */}
          <footer className="pt-10 flex flex-col items-center gap-4">
            <div className={`p-1.5 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
              <div className="flex items-center gap-2 px-3">
                <span className="text-[10px] font-black opacity-30">HOTKEYS</span>
                <kbd className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-white/10 border-white/5 text-indigo-400' : 'bg-white border-slate-200 text-indigo-600 shadow-sm'}`}>CTRL + L</kbd>
                <kbd className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-white/10 border-white/5 text-indigo-400' : 'bg-white border-slate-200 text-indigo-600 shadow-sm'}`}>F11</kbd>
              </div>
            </div>
            <p className={`text-[10px] font-bold tracking-widest uppercase opacity-20 ${isDark ? 'text-white' : 'text-black'}`}>
              Electron Hub v1.0.0 · © 2026 Lab Systems
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
