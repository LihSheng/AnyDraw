<template>
  <div class="flex flex-col items-center gap-6">
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
          <p v-if="winner !== null && !isRolling" class="mt-4 text-accent-400 font-semibold">
            🎉 Lucky Number!
          </p>
        </Transition>
      </div>
    </div>

    <!-- Range Inputs -->
    <div class="flex gap-4 items-center">
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
    </div>

    <!-- Roll Button -->
    <button
      @click="roll"
      :disabled="isRolling || !isValidRange"
      class="btn-primary text-lg px-10 py-4"
    >
      {{ isRolling ? 'Rolling...' : '🎲 ROLL' }}
    </button>

    <!-- Invalid range message -->
    <p v-if="!isValidRange" class="text-red-400 text-sm">
      Min must be less than Max
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { secureRandomInt, secureRandom } from '../../composables/useSecureRandom'

const emit = defineEmits(['winner'])

const minValue = ref(1)
const maxValue = ref(100)
const currentValue = ref(null)
const winner = ref(null)
const isRolling = ref(false)

const isValidRange = computed(() => minValue.value < maxValue.value)

const displayDigits = computed(() => {
  const num = currentValue.value ?? minValue.value
  const maxDigits = Math.max(
    String(minValue.value).length,
    String(maxValue.value).length
  )
  return String(num).padStart(maxDigits, '0').split('')
})

function roll() {
  if (isRolling.value || !isValidRange.value) return

  isRolling.value = true
  winner.value = null

  const duration = 2500
  const startTime = performance.now()
  // Final target uses cryptographically secure random
  const targetNumber = secureRandomInt(minValue.value, maxValue.value)

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    if (progress < 0.8) {
      // Fast random numbers during roll
      currentValue.value = secureRandomInt(minValue.value, maxValue.value)
    } else if (progress < 1) {
      // Slow down towards target
      const slowProgress = (progress - 0.8) / 0.2
      if (slowProgress > 0.5 && secureRandom() > 0.5) {
        currentValue.value = targetNumber
      } else {
        currentValue.value = secureRandomInt(minValue.value, maxValue.value)
      }
    } else {
      // Final value
      currentValue.value = targetNumber
      winner.value = targetNumber
      isRolling.value = false
      emit('winner', String(targetNumber))
      return
    }

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

// Initialize display
watch([minValue, maxValue], () => {
  if (!isRolling.value) {
    currentValue.value = minValue.value
    winner.value = null
  }
}, { immediate: true })
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
