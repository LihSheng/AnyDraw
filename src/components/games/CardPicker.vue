<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Cards Display -->
    <div class="relative h-[300px] w-[400px] flex items-center justify-center">
      <!-- Card Stack/Spread -->
      <TransitionGroup name="cards" tag="div" class="relative w-full h-full">
        <div
          v-for="(card, index) in displayCards"
          :key="card.id"
          class="absolute top-1/2 left-1/2 w-40 h-56 -mt-28 -ml-20
                 rounded-xl shadow-2xl cursor-pointer transition-all duration-500"
          :class="[
            isShuffling ? 'animate-shuffle' : '',
            card.isWinner ? 'winner-glow z-50' : ''
          ]"
          :style="getCardStyle(index, card.isWinner)"
          @click="!isShuffling && !winner && pickCard(index)"
        >
          <!-- Card Back -->
          <div 
            v-if="!card.revealed"
            class="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                   border-4 border-white/20 flex items-center justify-center
                   hover:scale-105 transition-transform"
          >
            <div class="text-6xl">🎴</div>
          </div>
          
          <!-- Card Front (Revealed Winner) -->
          <div 
            v-else
            class="w-full h-full rounded-xl bg-gradient-to-br from-accent-400 to-accent-600
                   border-4 border-white/30 flex flex-col items-center justify-center p-4
                   text-surface-900"
          >
            <div class="text-3xl mb-2">🏆</div>
            <p class="font-bold text-center text-lg break-words">{{ card.name }}</p>
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
  // Show max 7 cards for visual clarity
  return cards.value.slice(0, 7)
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
.animate-shuffle {
  animation: shuffle 0.15s ease-in-out;
}

@keyframes shuffle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-20px) rotate(-5deg); }
  75% { transform: translateX(20px) rotate(5deg); }
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
</style>
