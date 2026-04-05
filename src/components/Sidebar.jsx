import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Sidebar',
  props: {
    user:   { type: Object,  default: null  },
    isDark: { type: Boolean, default: true  },
  },
  setup(props) {
    const isExpanded = ref(false);

    const menuItems = [
      { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', active: true  },
      { name: 'Projects',  icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',                                                                                                                                                                                                                                        active: false },
      { name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',                                                                                                   active: false },
      { name: 'Settings',  icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', active: false },
    ];

    const initials = () => {
      if (!props.user?.username) return '?';
      return props.user.username.slice(0, 2).toUpperCase();
    };

    return () => (
      <aside
        class={`relative flex flex-col border-r transition-all duration-300 ease-in-out ${
          props.isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } ${isExpanded.value ? 'w-64' : 'w-20'}`}
      >
        {/* Toggle button */}
        <button
          onClick={() => isExpanded.value = !isExpanded.value}
          class="absolute -right-3 top-8 bg-indigo-600 rounded-full p-1 border border-indigo-400 text-white hover:bg-indigo-500 transition-colors z-20"
        >
          <svg
            class={`w-4 h-4 transform transition-transform duration-300 ${isExpanded.value ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Logo area */}
        <div class={`flex items-center h-16 px-6 border-b ${props.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-indigo-500/30">
              E
            </div>
            {isExpanded.value && (
              <span class={`text-base font-bold bg-clip-text text-transparent bg-gradient-to-r ${props.isDark ? 'from-gray-100 to-gray-400' : 'from-gray-800 to-gray-500'} whitespace-nowrap overflow-hidden`}>
                Electron Hub
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav class="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {menuItems.map((item) => (
            <a
              href="#"
              class={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : props.isDark
                    ? 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <svg
                class={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-indigo-400' : props.isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-700'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
              {isExpanded.value && (
                <span class="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.name}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User profile */}
        <div class={`p-4 border-t ${props.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div class={`flex items-center gap-3 p-2 rounded-xl ${props.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials()}
            </div>
            {isExpanded.value && (
              <div class="flex flex-col whitespace-nowrap overflow-hidden">
                <span class={`text-sm font-semibold ${props.isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {props.user?.username ?? 'Guest'}
                </span>
                <span class={`text-xs ${props.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {props.user?.role ?? '—'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  },
});
