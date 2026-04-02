import { onMounted, onUnmounted } from 'vue';

/**
 * Helper to create global keyboard shortcuts.
 * 
 * @param {string} key - The key to listen for (e.g. 'F1', 'F12', 'Escape'). Match is case-insensitive.
 * @param {Function} callback - The function to trigger when the shortcut is used.
 * @param {Object} options - Configuration options.
 */
export function useShortcut(shortcut, callback, options = { preventDefault: true }) {
  const handleKeydown = (event) => {
    const keys = shortcut.toLowerCase().split('+').map(k => k.trim());
    const mainKey = keys.find(k => !['ctrl', 'alt', 'shift', 'meta', 'cmd'].includes(k));
    
    // If a modifier is NOT in the string, we should ensure it's NOT pressed
    // unless the user specifically wants to allow any modifier (advanced case)
    const exactCtrl = keys.includes('ctrl') === event.ctrlKey;
    const exactAlt = keys.includes('alt') === event.altKey;
    const exactShift = keys.includes('shift') === event.shiftKey;
    const exactMeta = (keys.includes('meta') || keys.includes('cmd')) === event.metaKey;

    if (
      event.key.toLowerCase() === mainKey &&
      exactCtrl && exactAlt && exactShift && exactMeta
    ) {
      if (options.preventDefault) {
        event.preventDefault();
      }
      callback(event);
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
}
