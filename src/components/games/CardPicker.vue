<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Card Count Indicator -->
    <div v-if="participants.length >= 2" class="glass px-4 py-2 text-center">
      <span class="text-white/60 text-sm">🃏 {{ participants.length }} cards in deck</span>
    </div>

    <!-- Cards Display -->
    <div class="cards-container" :class="{ 'scrollable': cards.length > 7 }">
      <!-- Card Stack/Spread -->
      <TransitionGroup name="cards" tag="div" class="cards-grid">
        <div
          v-for="(card, index) in displayCards"
          :key="card.id"
          class="card-item rounded-xl shadow-2xl cursor-pointer transition-all duration-500"
          :class="[
            isShuffling ? 'animate-shuffle' : '',
            card.isWinner ? 'winner-glow' : '',
            card.revealed && !card.isWinner ? 'revealed-non-winner' : ''
          ]"
          @click="!isShuffling && !winner && pickCard(index)"
        >
          <!-- Card Back -->
          <div 
            v-if="!card.revealed"
            class="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                   border-4 border-white/20 flex items-center justify-center
                   hover:scale-105 transition-transform"
          >
            <div class="text-4xl">🎴</div>
          </div>
          
          <!-- Card Front (Revealed) -->
          <div 
            v-else
            class="w-full h-full rounded-xl border-4 flex flex-col items-center justify-center p-3"
            :class="card.isWinner 
              ? 'bg-gradient-to-br from-accent-400 to-accent-600 border-white/30 text-surface-900' 
              : 'bg-gradient-to-br from-surface-600 to-surface-700 border-white/10 text-white/70'"
          >
            <div class="text-2xl mb-1">{{ card.isWinner ? '🏆' : '📋' }}</div>
            <p class="font-bold text-center text-sm break-words line-clamp-2">{{ card.name }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Winner Display -->
    <Transition name="bounce">
      <div 
        v-if="winner" 
        class="glass winner-glow p-6 text-center min-w-[250px]"
      >
        <p class="text-white/60 text-sm mb-1">🎉 Winner!</p>
        <p class="text-2xl font-bold text-accent-400">{{ winner }}</p>
      </div>
    </Transition>

    <!-- Action Buttons -->
    <div class="flex gap-4">
      <button
        @click="shuffle"
        :disabled="isShuffling || participants.length < 2"
        class="btn-secondary"
      >
        🔀 Shuffle
      </button>
      <button
        @click="pickRandom"
        :disabled="isShuffling || participants.length < 2 || winner"
        class="btn-primary"
      >
        {{ isShuffling ? 'Shuffling...' : '🎴 Pick Card' }}
      </button>
      <button
        v-if="winner"
        @click="reset"
        class="btn-secondary"
      >
        🔄 Reset
      </button>
    </div>

    <!-- No participants message -->
    <p v-if="participants.length < 2" class="text-white/40 text-sm">
      Add at least 2 participants to play
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { secureRandomInt } from '../../composables/useSecureRandom'

const props = defineProps({
  participants: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['winner'])

const cards = ref([])
const isShuffling = ref(false)
const winner = ref(null)

const displayCards = computed(() => {
  // Show all cards
  return cards.value
})

function initCards() {
  cards.value = props.participants.map((name, index) => ({
    id: index,
    name,
    revealed: false,
    isWinner: false
  }))
}

function getCardStyle(index, isWinner) {
  if (isWinner) {
    return {
      transform: 'translateX(0) translateY(0) rotate(0deg) scale(1.1)',
      zIndex: 50
    }
  }
  
  const total = Math.min(displayCards.value.length, 7)
  const spread = 30 // degrees of spread
  const rotation = (index - (total - 1) / 2) * (spread / total)
  const offsetX = (index - (total - 1) / 2) * 25
  const offsetY = Math.abs(index - (total - 1) / 2) * 5
  
  return {
    transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)`,
    zIndex: index
  }
}

function shuffle() {
  if (isShuffling.value) return
  
  isShuffling.value = true
  winner.value = null
  
  // Reset reveals
  cards.value.forEach(card => {
    card.revealed = false
    card.isWinner = false
  })

  // Shuffle animation
  let shuffleCount = 0
  const maxShuffles = 10
  
  const shuffleInterval = setInterval(() => {
    // Fisher-Yates shuffle with cryptographically secure random
    for (let i = cards.value.length - 1; i > 0; i--) {
      const j = secureRandomInt(0, i)
      ;[cards.value[i], cards.value[j]] = [cards.value[j], cards.value[i]]
    }
    
    shuffleCount++
    if (shuffleCount >= maxShuffles) {
      clearInterval(shuffleInterval)
      isShuffling.value = false
    }
  }, 150)
}

function pickRandom() {
  if (isShuffling.value || winner.value || cards.value.length < 2) return
  
  shuffle()
  
  setTimeout(() => {
    // Cryptographically secure winner selection
    const winnerIndex = secureRandomInt(0, cards.value.length - 1)
    pickCard(winnerIndex)
  }, 1600)
}

function pickCard(index) {
  if (winner.value || index >= cards.value.length) return
  
  const selectedCard = cards.value[index]
  selectedCard.revealed = true
  selectedCard.isWinner = true
  winner.value = selectedCard.name
  
  // Reveal all other cards after a short delay
  setTimeout(() => {
    cards.value.forEach(card => {
      card.revealed = true
    })
  }, 500)
  
  emit('winner', selectedCard.name)
}

function reset() {
  winner.value = null
  initCards()
}

watch(() => props.participants, () => {
  initCards()
}, { immediate: true, deep: true })
</script>

<style scoped>
.cards-container {
  width: 100%;
  max-width: 500px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cards-container.scrollable {
  max-height: 350px;
  overflow-y: auto;
  padding: 1rem;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem;
}

.card-item {
  width: 100px;
  height: 140px;
  flex-shrink: 0;
}

.winner-glow {
  transform: scale(1.1);
  z-index: 10;
}

.revealed-non-winner {
  opacity: 0.7;
  transform: scale(0.95);
}

.animate-shuffle {
  animation: shuffle 0.15s ease-in-out;
}

@keyframes shuffle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px) rotate(-3deg); }
  75% { transform: translateX(10px) rotate(3deg); }
}

.cards-move {
  transition: transform 0.3s ease;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.3s reverse;
}
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
