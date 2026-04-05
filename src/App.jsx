import { defineComponent, ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar';
import { useShortcut } from './helper/useShortcut';

export default defineComponent({
  name: 'App',
  setup() {
    const isDark   = ref(true);
    const user     = ref(null);   // { username, role, email }

    // ── Receive user data pushed from main process ─────────────────────────
    onMounted(async () => {
      // Method 1: listen for push event (arrives right after did-finish-load)
      if (window.electronAPI?.onUserData) {
        window.electronAPI.onUserData((data) => {
          user.value = data;
        });
      }
      // Method 2: pull fallback (handles hot-reload in dev)
      if (window.electronAPI?.getUserData) {
        const data = await window.electronAPI.getUserData();
        if (data) user.value = data;
      }
    });

    // ── Shortcuts ──────────────────────────────────────────────────────────
    useShortcut('shift+F1', () => alert('F1 pressed! Triggering an action…'));
    useShortcut('ctrl+l',   () => { isDark.value = !isDark.value; });

    // ── Avatar initials helper ─────────────────────────────────────────────
    const initials = () => {
      if (!user.value?.username) return '?';
      return user.value.username.slice(0, 2).toUpperCase();
    };

    return () => (
      <div class={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Sidebar user={user.value} isDark={isDark.value} />

        <main class="flex-1 flex flex-col overflow-hidden relative">

          {/* ── Top bar ── */}
          <header class={`flex items-center justify-between px-8 h-16 flex-shrink-0 border-b ${isDark.value ? 'border-white/5 bg-gray-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}>
            <div>
              <h1 class="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p class={`text-xs mt-0.5 ${isDark.value ? 'text-gray-500' : 'text-gray-400'}`}>
                {user.value
                  ? `Welcome back, ${user.value.username} · ${user.value.role}`
                  : 'Welcome to Electron Hub'}
              </p>
            </div>

            {/* User chip */}
            {user.value && (
              <div class={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark.value ? 'bg-white/5 border border-white/8' : 'bg-gray-100 border border-gray-200'}`}>
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials()}
                </div>
                <div class="flex flex-col leading-tight">
                  <span class={`text-sm font-semibold ${isDark.value ? 'text-gray-100' : 'text-gray-800'}`}>{user.value.username}</span>
                  <span class={`text-xs ${isDark.value ? 'text-gray-500' : 'text-gray-400'}`}>{user.value.email}</span>
                </div>
                <div class={`ml-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  user.value.role === 'Administrator'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {user.value.role}
                </div>
              </div>
            )}
          </header>

          {/* ── Main content ── */}
          <div class="flex-1 overflow-auto p-8 relative">
            {/* Background gradient overlay */}
            <div class={`absolute inset-0 pointer-events-none ${isDark.value ? 'bg-gradient-to-br from-indigo-900/10 to-purple-900/10' : 'bg-gradient-to-br from-indigo-100/40 to-purple-100/40'}`} />

            <div class="relative z-10 max-w-4xl mx-auto space-y-6">

              {/* Welcome banner */}
              <div class={`rounded-2xl p-6 border ${isDark.value ? 'bg-white/4 border-white/8 backdrop-blur-xl' : 'bg-white border-gray-200 shadow-lg'}`}>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                    {user.value
                      ? <span class="text-white text-lg font-bold">{initials()}</span>
                      : <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    }
                  </div>
                  <div>
                    <h2 class={`text-xl font-bold ${isDark.value ? 'text-white' : 'text-gray-900'}`}>
                      {user.value ? `Hey, ${user.value.username}! 👋` : 'Welcome to Your App'}
                    </h2>
                    <p class={`text-sm mt-1 ${isDark.value ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.value
                        ? `You're logged in as ${user.value.role} · ${user.value.email}`
                        : 'Sign in to get started.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <div class="grid grid-cols-2 gap-4">
                {[
                  {
                    icon:  'M13 10V3L4 14h7v7l9-11h-7z',
                    label: 'Lightning Fast',
                    desc:  'Built with Vite and Vue JSX for incredible performance.',
                    color: 'indigo',
                  },
                  {
                    icon:  'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
                    label: 'Modern Styling',
                    desc:  'Tailwind CSS integrated for rapid and beautiful designs.',
                    color: 'purple',
                  },
                  {
                    icon:  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                    label: 'Secure Auth',
                    desc:  'Login data passed securely via Electron IPC channels.',
                    color: 'pink',
                  },
                  {
                    icon:  'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
                    label: 'Multi-Window',
                    desc:  'Separate login & main windows with controlled lifecycle.',
                    color: 'cyan',
                  },
                ].map((card) => (
                  <div class={`p-5 rounded-xl border transition-all duration-200 cursor-pointer group hover:scale-[1.02] ${
                    isDark.value
                      ? 'bg-white/4 border-white/6 hover:border-' + card.color + '-500/40'
                      : 'bg-white border-gray-200 hover:border-' + card.color + '-300 shadow-sm hover:shadow-md'
                  }`}>
                    <div class={`text-${card.color}-400 mb-3 group-hover:scale-110 transform transition-transform origin-left`}>
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={card.icon} />
                      </svg>
                    </div>
                    <h3 class={`font-semibold mb-1 ${isDark.value ? 'text-gray-100' : 'text-gray-800'}`}>{card.label}</h3>
                    <p class={`text-sm ${isDark.value ? 'text-gray-500' : 'text-gray-500'}`}>{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Keyboard hint */}
              <p class={`text-center text-xs ${isDark.value ? 'text-gray-600' : 'text-gray-400'}`}>
                Press <kbd class={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark.value ? 'bg-white/8 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Ctrl+L</kbd> to toggle theme &nbsp;·&nbsp;
                <kbd class={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark.value ? 'bg-white/8 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>F11</kbd> fullscreen
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
});
