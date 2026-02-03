<template>
  <div 
    class="min-h-screen transition-colors duration-300"
    :class="settings.theme === 'dark' ? 'theme-dark' : 'theme-light'"
  >
    <!-- Navbar -->
    <Navbar 
      :active-game="activeGame" 
      @change-game="activeGame = $event"
      @open-settings="showSettings = true"
    />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 pb-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Left Panel - Participants -->
        <div class="lg:col-span-1 order-2 lg:order-1">
          <ParticipantList
            :participants="participants"
            :active-game="activeGame"
            @add="addParticipant"
            @remove="removeParticipant"
            @clear="clearParticipants"
            @share="handleShare"
            @import-list="handleImport"
          />
        </div>

        <!-- Main Game Area -->
        <div class="lg:col-span-2 order-1 lg:order-2">
          <div class="glass p-8 flex items-center justify-center min-h-[500px]">
            <KeepAlive>
              <component 
                :is="currentGameComponent" 
                :participants="participants"
                @winner="handleWinner"
              />
            </KeepAlive>
          </div>
        </div>

        <!-- Right Panel - History -->
        <div class="lg:col-span-1 order-3">
          <WinnerHistory
            :history="history"
            @clear="clearHistory"
          />
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @toggle-sound="toggleSound"
      @toggle-party="toggleParty"
      @toggle-theme="toggleTheme"
      @clear-data="clearAllData"
    />
  </div>
</template>

<script setup>
import { ref, computed, markRaw, watchEffect } from 'vue'
import Navbar from './components/layout/Navbar.vue'
import SettingsModal from './components/layout/SettingsModal.vue'
import ParticipantList from './components/ParticipantList.vue'
import WinnerHistory from './components/WinnerHistory.vue'
import WheelSpin from './components/games/WheelSpin.vue'
import RandomNumber from './components/games/RandomNumber.vue'
import CardPicker from './components/games/CardPicker.vue'
import { useStorage } from './composables/useStorage'
import { useSoundEffects } from './composables/useSoundEffects'
import { useConfetti } from './composables/useConfetti'


// State
const activeGame = ref('wheel')
const showSettings = ref(false)

// Composables
const { 
  wheelParticipants,
  cardParticipants,
  numberParticipants,
  addParticipant: addParticipantToStorage,
  removeParticipant: removeParticipantFromStorage,
  clearParticipants: clearParticipantsInStorage,
  shareParticipants,
  history,
  addToHistory,
  clearHistory,
  settings,
  toggleSound,
  toggleParty,
  toggleTheme,
  clearAllData
} = useStorage()

const { playWinner, playClick } = useSoundEffects(settings)
const { startConfetti } = useConfetti(settings)

// Computed property for current game's participants
const participants = computed(() => {
  switch (activeGame.value) {
    case 'wheel': return wheelParticipants.value
    case 'cards': return cardParticipants.value
    case 'number': return numberParticipants.value
    default: return []
  }
})

// Wrappers for participant actions to include game type
function addParticipant(name) {
  return addParticipantToStorage(activeGame.value, name)
}

function removeParticipant(index) {
  removeParticipantFromStorage(activeGame.value, index)
}

function clearParticipants() {
  clearParticipantsInStorage(activeGame.value)
}

// Handle share action from ParticipantList
function handleShare(targetGame) {
  if (shareParticipants(activeGame.value, targetGame)) {
    // Optional: could show a toast here
    // alert(`Shared to ${targetGame}!`)
  }
}

function handleImport(sourceGame) {
  if (shareParticipants(sourceGame, activeGame.value)) {
    // Optional: could show a toast here
  }
}

// Apply theme class to document element for teleported modals
watchEffect(() => {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark')
  html.classList.add(settings.value.theme === 'dark' ? 'theme-dark' : 'theme-light')
})

// Game components mapping
const gameComponents = {
  wheel: markRaw(WheelSpin),
  number: markRaw(RandomNumber),
  cards: markRaw(CardPicker)
}

const currentGameComponent = computed(() => gameComponents[activeGame.value])

// Handle winner
function handleWinner(winner) {
  addToHistory(winner, activeGame.value)
  playWinner()
  startConfetti(3000)
}
</script>
