import React, { useState, useEffect, useMemo } from 'react';

// ── Mock credentials (replace with real API call) ──────────────────────────
const MOCK_USERS = [
  { username: 'admin', password: 'admin123', role: 'Administrator', email: 'admin@electronhub.dev' },
  { username: 'user', password: 'user123', role: 'User', email: 'user@electronhub.dev' },
];

const Login = () => {
  // ── Splash state ─────────────────────────────────────────────────────────
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState('Initializing…');

  // ── Login form state ──────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  // ── Animated background orbs ──────────────────────────────────────────────
  const orbs = [
    { w: 320, h: 320, bg: 'radial-gradient(circle, #6366f180 0%, transparent 70%)', top: '-80px', left: '-80px',  delay: '0s',   dur: '8s'  },
    { w: 280, h: 280, bg: 'radial-gradient(circle, #8b5cf680 0%, transparent 70%)', top: '60%',  left: '70%',     delay: '-3s',  dur: '10s' },
    { w: 200, h: 200, bg: 'radial-gradient(circle, #ec489980 0%, transparent 70%)', top: '40%',  left: '-40px',   delay: '-6s',  dur: '7s'  },
    { w: 160, h: 160, bg: 'radial-gradient(circle, #06b6d480 0%, transparent 70%)', top: '10%',  left: '65%',     delay: '-2s',  dur: '9s'  },
  ];

  // ── Splash sequence ───────────────────────────────────────────────────────
  const splashSteps = [
    { pct: 20,  msg: 'Loading modules…'    },
    { pct: 45,  msg: 'Connecting services…' },
    { pct: 70,  msg: 'Preparing workspace…' },
    { pct: 90,  msg: 'Almost ready…'        },
    { pct: 100, msg: 'Welcome!'             },
  ];

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    const runSplash = async () => {
      for (const step of splashSteps) {
        await delay(480);
        setProgress(step.pct);
        setSplashStatus(step.msg);
      }
      await delay(500);
      setSplashFading(true);
      await delay(600);
      setSplashDone(true);
      // slight delay before form fades in
      await delay(80);
      setFormVisible(true);
    };
    runSplash();
  }, []);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    await delay(900); // simulate network/auth latency

    const match = MOCK_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );

    if (!match) {
      setIsLoading(false);
      setError('Invalid username or password.');
      return;
    }

    // Send user data to main process → open main window → close login
    if (window.electronAPI?.loginSuccess) {
      window.electronAPI.loginSuccess({
        username: match.username,
        role:     match.role,
        email:    match.email,
      });
    }
  };

  const canSubmit = useMemo(() => username.trim() && password.trim() && !isLoading, [username, password, isLoading]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a12', position: 'relative' }}>

      {/* ── Animated background orbs ── */}
      {orbs.map((o, i) => (
        <div key={i} style={{
          position:       'absolute',
          width:          o.w + 'px',
          height:         o.h + 'px',
          background:     o.bg,
          top:            o.top,
          left:           o.left,
          borderRadius:   '50%',
          animation:      `orbFloat ${o.dur} ease-in-out infinite alternate`,
          animationDelay: o.delay,
          pointerEvents:  'none',
          zIndex:         0,
        }} />
      ))}

      {/* ── Subtle grid pattern ── */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* ════════════════════════════════════════
          SPLASH SCREEN
      ════════════════════════════════════════ */}
      {!splashDone && (
        <div style={{
          position:   'absolute', inset: 0,
          display:    'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex:     50,
          background: '#0a0a12',
          opacity:    splashFading ? 0 : 1,
          transition: 'opacity .6s ease',
        }}>
          {/* Logo mark */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px #6366f160,0 0 80px #8b5cf630', animation: 'splashPulse 2s ease-in-out infinite' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            {/* Ripple rings */}
            <div style={{ position: 'absolute', inset: '-12px', borderRadius: '34px', border: '2px solid #6366f140', animation: 'rippleRing 2s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: '-24px', borderRadius: '46px', border: '1px solid #6366f120', animation: 'rippleRing 2s ease-in-out infinite', animationDelay: '.4s' }} />
          </div>

          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '-.5px', marginBottom: '6px' }}>
            Electron Hub
          </h1>
          <p style={{ color: '#ffffff60', fontSize: '14px', marginBottom: '48px', letterSpacing: '.5px' }}>
            {splashStatus}
          </p>

          {/* Progress bar */}
          <div style={{ width: '220px', height: '4px', background: '#ffffff12', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height:     '100%',
              width:      progress + '%',
              background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)',
              borderRadius: '99px',
              transition: 'width .45s cubic-bezier(.4,1,1)',
              boxShadow:  '0 0 12px #8b5cf680',
            }} />
          </div>
          <span style={{ color: '#ffffff40', fontSize: '11px', marginTop: '10px', fontVariantNumeric: 'tabular-nums' }}>
            {progress}%
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════
          LOGIN CARD
      ════════════════════════════════════════ */}
      {splashDone && (
        <div style={{
          position:   'absolute', inset: 0,
          display:    'flex', alignItems: 'center', justifyContent: 'center',
          zIndex:     10,
          opacity:    formVisible ? 1 : 0,
          transform:  formVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity .5s ease, transform .5s ease',
        }}>
          <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
            {/* Card */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '24px', padding: '40px 36px', backdropFilter: 'blur(24px)', boxShadow: '0 32px 64px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset' }}>

              {/* Brand header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px #6366f150' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>Electron Hub</div>
                  <div style={{ color: '#ffffff50', fontSize: '12px', marginTop: '1px' }}>Sign in to your workspace</div>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{ background: '#ef444418', border: '1px solid #ef444440', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ color: '#ef4444', fontSize: '13px' }}>{error}</span>
                </div>
              )}

              {/* Username field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#ffffff80', fontSize: '12px', fontWeight: 500, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleLogin()}
                    placeholder="Enter your username"
                    autoComplete="username"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 14px 12px 42px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, box-shadow .2s' }}
                    onFocus={(e) => { e.target.style.borderColor='#6366f180'; e.target.style.boxShadow='0 0 0 3px #6366f120'; }}
                    onBlur={(e)  => { e.target.style.borderColor='rgba(255,255,255,.1)'; e.target.style.boxShadow='none'; }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: '#ffffff80', fontSize: '12px', fontWeight: 500, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleLogin()}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 44px 12px 42px', color: '#fff', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, box-shadow .2s' }}
                    onFocus={(e) => { e.target.style.borderColor='#8b5cf680'; e.target.style.boxShadow='0 0 0 3px #8b5cf620'; }}
                    onBlur={(e)  => { e.target.style.borderColor='rgba(255,255,255,.1)'; e.target.style.boxShadow='none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff50', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                id="login-submit"
                onClick={handleLogin}
                disabled={!canSubmit}
                style={{
                  width:         '100%',
                  padding:       '13px',
                  borderRadius:  '11px',
                  border:        'none',
                  cursor:        canSubmit ? 'pointer' : 'not-allowed',
                  background:    canSubmit
                    ? 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)'
                    : 'rgba(255,255,255,.08)',
                  color:         canSubmit ? '#fff' : '#ffffff40',
                  fontSize:      '15px',
                  fontWeight:    '600',
                  fontFamily:    'inherit',
                  letterSpacing: '.2px',
                  transition:    'all .25s ease',
                  boxShadow:     canSubmit ? '0 8px 24px #6366f150' : 'none',
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           '10px',
                }}
              >
                {isLoading
                  ? <>
                      <svg style={{ animation: 'spin .8s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Signing in…
                    </>
                  : <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      Sign In
                    </>
                }
              </button>

              {/* Hint */}
              <p style={{ textAlign: 'center', color: '#ffffff30', fontSize: '11px', marginTop: '20px', lineHeight: '1.6' }}>
                Demo: <span style={{ color: '#6366f180' }}>admin</span> / <span style={{ color: '#6366f180' }}>admin123</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Global keyframe styles ── */}
      <style>{`
        @keyframes orbFloat {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(20px,30px) scale(1.08); }
        }
        @keyframes splashPulse {
          0%,100% { box-shadow: 0 0 40px #6366f160, 0 0 80px #8b5cf630; }
          50%      { box-shadow: 0 0 60px #6366f190, 0 0 120px #8b5cf660; }
        }
        @keyframes rippleRing {
          0%   { opacity:.6; transform:scale(.95); }
          100% { opacity:0;  transform:scale(1.1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { -webkit-app-region: no-drag; }
        body { margin:0; padding:0; }
        input::placeholder { color:rgba(255,255,255,.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1a2e inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
