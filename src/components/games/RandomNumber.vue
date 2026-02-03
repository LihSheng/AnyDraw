<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Mode Toggle -->
    <div class="bg-surface-800 p-1 rounded-full flex gap-1">
      <button 
        @click="mode = 'range'"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="mode === 'range' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white'"
        :disabled="isRolling"
      >
        123 Range
      </button>
      <button 
        @click="mode = 'participants'"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="mode === 'participants' ? 'bg-primary-600 text-white shadow-lg' : 'text-white/60 hover:text-white'"
        :disabled="isRolling"
      >
        👤 Participants
      </button>
    </div>

    <!-- Number Display -->
    <div class="relative">
      <div 
        class="glass p-8 min-w-[280px] text-center overflow-hidden"
        :class="{ 'winner-glow': winner !== null && !isRolling }"
      >
        <div class="flex justify-center gap-2">
          <div 
            v-for="(digit, index) in displayDigits" 
            :key="index"
            class="relative w-16 h-24 bg-surface-800 rounded-lg overflow-hidden
                   border border-white/10 shadow-inner"
          >
            <Transition :name="isRolling ? 'roll' : 'none'" mode="out-in">
              <span 
                :key="digit"
                class="absolute inset-0 flex items-center justify-center
                       text-5xl font-bold text-white"
              >
                {{ digit }}
              </span>
            </Transition>
          </div>
        </div>
        
        <!-- Winner label -->
        <Transition name="fade">
          <div v-if="winner !== null && !isRolling" class="mt-4">
            <p class="text-accent-400 font-semibold text-lg">
              🎉 {{ winnerName ? winnerName : 'Lucky Number!' }}
            </p>
            <p v-if="winnerName" class="text-sm text-white/60">
              #{{ winner }}
            </p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Range Inputs / Info -->
    <div class="flex gap-4 items-center h-16">
      <template v-if="mode === 'range'">
        <div class="flex flex-col">
          <label class="text-white/60 text-xs mb-1">Min</label>
          <input
            v-model.number="minValue"
            type="number"
            class="input-field w-24 text-center"
            :disabled="isRolling"
          />
        </div>
        <span class="text-white/40 mt-5">to</span>
        <div class="flex flex-col">
          <label class="text-white/60 text-xs mb-1">Max</label>
          <input
            v-model.number="maxValue"
            type="number"
            class="input-field w-24 text-center"
            :disabled="isRolling"
          />
        </div>
      </template>

      <template v-else>
        <div class="text-center">
          <p class="text-sm text-white/80">
            Rolling from <span class="text-primary-400 font-bold">1</span> to <span class="text-primary-400 font-bold">{{ Math.max(1, participants.length) }}</span>
          </p>
          <p class="text-xs text-white/40 mt-1">
            Matching {{ participants.length }} participants
          </p>
        </div>
      </template>
    </div>

    <!-- Roll Button -->
    <button
      @click="roll"
      :disabled="isRolling || !isValidRange || (mode === 'participants' && participants.length === 0)"
      class="btn-primary text-lg px-10 py-4"
    >
      {{ isRolling ? 'Rolling...' : '🎲 ROLL' }}
    </button>

    <!-- Messages -->
    <div class="h-6">
      <p v-if="!isValidRange && mode === 'range'" class="text-red-400 text-sm">
        Min must be less than Max
      </p>
      <p v-if="mode === 'participants' && participants.length === 0" class="text-red-400 text-sm">
        Add participants to play
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { secureRandomInt, secureRandom } from '../../composables/useSecureRandom'

const props = defineProps({
  participants: {
    type: Array,
    required: false,
    default: () => []
  }
})

const emit = defineEmits(['winner'])

const mode = ref('range') // 'range' | 'participants'
const minValue = ref(1)
const maxValue = ref(100)
const currentValue = ref(null)
const winner = ref(null)
const winnerName = ref(null)
const isRolling = ref(false)

// Determine effective range based on mode
const effectiveMin = computed(() => mode.value === 'participants' ? 1 : minValue.value)
const effectiveMax = computed(() => {
  if (mode.value === 'participants') {
    return Math.max(1, props.participants.length)
  }
  return maxValue.value
})

const isValidRange = computed(() => effectiveMin.value < effectiveMax.value || (mode.value === 'participants' && props.participants.length > 0))

const displayDigits = computed(() => {
  const num = currentValue.value ?? effectiveMin.value
  const maxDigits = Math.max(
    String(effectiveMin.value).length,
    String(effectiveMax.value).length
  )
  return String(num).padStart(maxDigits, '0').split('')
})

// Toggle mode
function toggleMode() {
  if (isRolling.value) return
  mode.value = mode.value === 'range' ? 'participants' : 'range'
}

function roll() {
  if (isRolling.value || !isValidRange.value) return

  // Need at least one participant in participant mode
  if (mode.value === 'participants' && props.participants.length === 0) return

  isRolling.value = true
  winner.value = null
  winnerName.value = null

  const duration = 2500
  const startTime = performance.now()
  const targetNumber = secureRandomInt(effectiveMin.value, effectiveMax.value)

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    if (progress < 0.8) {
      currentValue.value = secureRandomInt(effectiveMin.value, effectiveMax.value)
    } else if (progress < 1) {
      const slowProgress = (progress - 0.8) / 0.2
      if (slowProgress > 0.5 && secureRandom() > 0.5) {
        currentValue.value = targetNumber
      } else {
        currentValue.value = secureRandomInt(effectiveMin.value, effectiveMax.value)
      }
    } else {
      currentValue.value = targetNumber
      winner.value = targetNumber
      
      if (mode.value === 'participants') {
        const index = targetNumber - 1
        if (index >= 0 && index < props.participants.length) {
          winnerName.value = props.participants[index]
          emit('winner', `${winnerName.value} (#${targetNumber})`)
        } else {
          emit('winner', String(targetNumber))
        }
      } else {
        emit('winner', String(targetNumber))
      }
      
      isRolling.value = false
      return
    }

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

watch([effectiveMin, effectiveMax], () => {
  if (!isRolling.value) {
    currentValue.value = effectiveMin.value
    winner.value = null
    winnerName.value = null
  }
}, { immediate: true })

// Reset to range mode if participants empty? optional..
</script>

<style scoped>
.roll-enter-active,
.roll-leave-active {
  transition: all 0.05s ease;
}
.roll-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.roll-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
