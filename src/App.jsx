import { defineComponent, ref } from 'vue';
import Sidebar from './components/Sidebar';

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class="flex h-screen bg-gray-900 text-black font-sans overflow-hidden">
        <Sidebar />
        
        <main class="flex-1 flex flex-col items-center justify-center relative relative">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 mix-blend-overlay pointer-events-none"></div>
          
          <div class="z-10 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 max-w-2xl w-full mx-8 shadow-2xl">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-black mb-4">
              Welcome to Your App
            </h1>
            <p class="text-gray-400 text-lg mb-8">
              This is a clean, modern template using pure Vue JSX and Tailwind CSS. Feel free to modify the Sidebar and this content area to start building your application!
            </p>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                <div class="text-indigo-400 mb-2 group-hover:scale-110 transform transition-transform origin-left">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 class="font-semibold text-gray-200">Lightning Fast</h3>
                <p class="text-sm text-gray-500 mt-1">Built with Vite and Vue JSX for incredible performance.</p>
              </div>
              
              <div class="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-colors cursor-pointer group">
                <div class="text-purple-400 mb-2 group-hover:scale-110 transform transition-transform origin-left">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                </div>
                <h3 class="font-semibold text-gray-200">Modern Styling</h3>
                <p class="text-sm text-gray-500 mt-1">Tailwind CSS integrated for rapid and beautiful designs.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
});
