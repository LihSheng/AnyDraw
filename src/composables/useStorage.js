import { ref, watch } from 'vue'

const STORAGE_KEYS = {
  // Legacy key (for migration)
  participants: 'anydraw_participants',
  
  // New per-game keys
  wheel: 'anydraw_wheel_participants',
  cards: 'anydraw_card_participants',
  number: 'anydraw_number_participants',
  
  history: 'anydraw_history',
  settings: 'anydraw_settings'
}

const defaultSettings = {
  soundEnabled: true,
  partyEnabled: true,
  theme: 'light'
}

export function useStorage() {
  // --- Participants State ---
  
  // Load initial data
  const wheelParticipants = ref(loadFromStorage(STORAGE_KEYS.wheel, []))
  const cardParticipants = ref(loadFromStorage(STORAGE_KEYS.cards, []))
  const numberParticipants = ref(loadFromStorage(STORAGE_KEYS.number, []))

  // Migration: If legacy participants exist but new ones don't, migrate them to Wheel
  const legacyData = loadFromStorage(STORAGE_KEYS.participants, null)
  if (legacyData && wheelParticipants.value.length === 0) {
    wheelParticipants.value = legacyData
    // Optional: Clear legacy data after migration, or keep as backup
    // localStorage.removeItem(STORAGE_KEYS.participants) 
  }

  // Watchers for persistence
  watch(wheelParticipants, (val) => saveToStorage(STORAGE_KEYS.wheel, val), { deep: true })
  watch(cardParticipants, (val) => saveToStorage(STORAGE_KEYS.cards, val), { deep: true })
  watch(numberParticipants, (val) => saveToStorage(STORAGE_KEYS.number, val), { deep: true })

  /**
   * Generalized add function
   * @param {string} gameType - 'wheel', 'cards', or 'number'
   * @param {string} name 
   */
  function addParticipant(gameType, name) {
    if (!name || !name.trim()) return false
    
    const list = getListByType(gameType)
    if (!list) return false

    const trimmed = name.trim()
    if (!list.value.includes(trimmed)) {
      list.value.push(trimmed)
      return true
    }
    return false
  }

  /**
   * Generalized remove function
   */
  function removeParticipant(gameType, index) {
    const list = getListByType(gameType)
    if (list) list.value.splice(index, 1)
  }

  /**
   * Generalized clear function
   */
  function clearParticipants(gameType) {
    const list = getListByType(gameType)
    if (list) list.value = []
  }

  function getListByType(type) {
    switch (type) {
      case 'wheel': return wheelParticipants
      case 'cards': return cardParticipants
      case 'number': return numberParticipants
      default: return null
    }
  }

  /**
   * Share participants from one game to another (Replace mode)
   */
  function shareParticipants(fromType, toType) {
    const source = getListByType(fromType)
    const target = getListByType(toType)
    
    if (source && target) {
      // Create a copy to break reference
      target.value = [...source.value]
      return true
    }
    return false
  }

  // --- History State ---
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

  // --- Settings State ---
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

  // --- Global Actions ---
  function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    window.location.reload()
  }

  return {
    // State refs
    wheelParticipants,
    cardParticipants,
    numberParticipants,
    
    // Actions
    addParticipant,
    removeParticipant,
    clearParticipants,
    shareParticipants,
    
    // History
    history,
    addToHistory,
    clearHistory,
    
    // Settings
    settings,
    toggleSound,
    toggleParty,
    toggleTheme,
    clearAllData
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
