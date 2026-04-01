<template>
  <div class="app-container">
    <div class="glass-card">
      <h1 class="title">Electron Print Hub</h1>
      <p class="subtitle">Select a printer and print instantly.</p>
      
      <div class="printer-section">
        <label for="printer-select" class="label">Choose Printer:</label>
        <div class="select-wrapper">
          <select id="printer-select" v-model="selectedPrinter" class="printer-select">
            <option disabled value="">Please select a printer...</option>
            <option v-for="printer in printers" :key="printer.name" :value="printer.name">
              {{ printer.name }} {{ printer.isDefault ? '(Default)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <div class="action-section">
        <button @click="printSilent" class="print-btn silent" :disabled="!selectedPrinter">
          Print Silently
        </button>
        <button @click="printNative" class="print-btn native">
          Browser Print Dialog
        </button>
      </div>

      <div v-if="statusMessage" class="status-message">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const printers = ref([])
const selectedPrinter = ref('')
const statusMessage = ref('')

onMounted(async () => {
  if (window.electronAPI && window.electronAPI.getPrinters) {
    try {
      const pList = await window.electronAPI.getPrinters()
      printers.value = pList
      // select default if found
      const def = pList.find(p => p.isDefault)
      if (def) selectedPrinter.value = def.name
    } catch (e) {
      console.error('Failed to get printers', e)
    }
  }
})

const printSilent = async () => {
  if (!selectedPrinter.value || !window.electronAPI) return
  statusMessage.value = 'Sending to printer...'
  try {
    const success = await window.electronAPI.printPage(selectedPrinter.value)
    if (success) {
      statusMessage.value = 'Print job sent successfully!'
      setTimeout(() => { if (statusMessage.value === 'Print job sent successfully!') statusMessage.value = '' }, 3000)
    } else {
      statusMessage.value = 'Print failed or was cancelled.'
    }
  } catch (e) {
    statusMessage.value = 'Error printing: ' + e.message
  }
}

const printNative = () => {
  window.print()
}
</script>

<style>
/* Add glassmorphism and premium UI */
:root {
  --primary: #6366f1;
  --bg-color: #0f172a;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg-color);
  background-image: radial-gradient(circle at top right, #3b0764, #0f172a 50%);
  color: var(--text-main);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  box-sizing: border-box;
}

.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-muted);
  margin-top: 0;
  margin-bottom: 2rem;
}

.printer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}

.printer-select {
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-main);
  font-size: 1rem;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.printer-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.printer-select option {
  background: var(--bg-color);
  color: var(--text-main);
}

.action-section {
  display: flex;
  gap: 1rem;
}

.print-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.print-btn.silent {
  background: var(--primary);
  color: white;
}

.print-btn.silent:hover {
  background: #4f46e5;
  transform: scale(1.02);
}

.print-btn.silent:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
  transform: none;
}

.print-btn.native {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-main);
}

.print-btn.native:hover {
  background: rgba(255, 255, 255, 0.1);
}

.status-message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  text-align: center;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
