import { ref, watch } from 'vue'

const STORAGE_KEYS = {
  participants: 'anydraw_participants',
  history: 'anydraw_history',
  settings: 'anydraw_settings'
}

const defaultSettings = {
  soundEnabled: true,
  partyEnabled: true,
  theme: 'light'
}

export function useStorage() {
  // Participants
  const participants = ref(loadFromStorage(STORAGE_KEYS.participants, []))
  
  watch(participants, (newVal) => {
    saveToStorage(STORAGE_KEYS.participants, newVal)
  }, { deep: true })

  function addParticipant(name) {
    if (name && name.trim() && !participants.value.includes(name.trim())) {
      participants.value.push(name.trim())
      return true
    }
    return false
  }

  function removeParticipant(index) {
    participants.value.splice(index, 1)
  }

  function clearParticipants() {
    participants.value = []
  }

  // History
  const history = ref(loadFromStorage(STORAGE_KEYS.history, []))

  watch(history, (newVal) => {
    saveToStorage(STORAGE_KEYS.history, newVal)
  }, { deep: true })

  function addToHistory(winner, gameType) {
    history.value.unshift({
      id: Date.now(),
      winner,
      gameType,
      timestamp: new Date().toLocaleString()
    })
  }

  function clearHistory() {
    history.value = []
  }

  // Settings
  const settings = ref(loadFromStorage(STORAGE_KEYS.settings, defaultSettings))

  watch(settings, (newVal) => {
    saveToStorage(STORAGE_KEYS.settings, newVal)
  }, { deep: true })

  function toggleSound() {
    settings.value.soundEnabled = !settings.value.soundEnabled
  }

  function toggleParty() {
    settings.value.partyEnabled = !settings.value.partyEnabled
  }

  function toggleTheme() {
    settings.value.theme = settings.value.theme === 'light' ? 'dark' : 'light'
  }

  return {
    // Participants
    participants,
    addParticipant,
    removeParticipant,
    clearParticipants,
    // History
    history,
    addToHistory,
    clearHistory,
    // Settings
    settings,
    toggleSound,
    toggleParty,
    toggleTheme
  }
}

// Helper functions
function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}
