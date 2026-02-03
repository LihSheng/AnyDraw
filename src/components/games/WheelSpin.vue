<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Wheel Container -->
    <div class="relative">
      <!-- Pointer -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div class="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] 
                    border-l-transparent border-r-transparent border-t-accent-500
                    drop-shadow-lg"></div>
      </div>
      
      <!-- Canvas Wheel -->
      <canvas 
        ref="wheelCanvas" 
        :width="canvasSize" 
        :height="canvasSize"
        class="drop-shadow-2xl"
      ></canvas>
      
      <!-- Center Button -->
      <button
        @click="spin"
        :disabled="isSpinning || segments.length < 2"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               w-20 h-20 rounded-full bg-gradient-to-br from-accent-400 to-accent-600
               text-surface-900 font-bold text-lg
               shadow-lg shadow-accent-500/50
               hover:scale-110 hover:shadow-xl hover:shadow-accent-500/60
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
               transition-all duration-300 z-10"
      >
        {{ isSpinning ? '...' : 'SPIN' }}
      </button>
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

    <!-- No participants message -->
    <p v-if="segments.length < 2" class="text-white/40 text-sm">
      Add at least 2 participants to spin
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { secureRandom } from '../../composables/useSecureRandom'

const props = defineProps({
  participants: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['winner'])

const wheelCanvas = ref(null)
const isSpinning = ref(false)
const winner = ref(null)
const currentRotation = ref(0)
const canvasSize = 350

const segments = computed(() => props.participants)

const segmentColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
]

function getSegmentColor(index) {
  return segmentColors[index % segmentColors.length]
}

function drawWheel() {
  const canvas = wheelCanvas.value
  if (!canvas || segments.value.length === 0) return

  const ctx = canvas.getContext('2d')
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  const radius = canvasSize / 2 - 10

  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate((currentRotation.value * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)

  const segmentAngle = (2 * Math.PI) / segments.value.length

  segments.value.forEach((segment, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2
    const endAngle = startAngle + segmentAngle

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = getSegmentColor(i)
    ctx.fill()
    ctx.strokeStyle = '#ffffff20'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw text
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(startAngle + segmentAngle / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 4
    
    const text = segment.length > 12 ? segment.substring(0, 12) + '...' : segment
    ctx.fillText(text, radius - 20, 5)
    ctx.restore()
  })

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI)
  ctx.fillStyle = '#1e293b'
  ctx.fill()
  ctx.strokeStyle = '#ffffff20'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.restore()
}

function spin() {
  if (isSpinning.value || segments.value.length < 2) return

  isSpinning.value = true
  winner.value = null

  // Random spin: 5-8 full rotations + random position (cryptographically secure)
  const spinDegrees = 360 * (5 + secureRandom() * 3) + secureRandom() * 360
  const targetRotation = currentRotation.value + spinDegrees
  const duration = 4000

  const startTime = performance.now()
  const startRotation = currentRotation.value

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    
    currentRotation.value = startRotation + spinDegrees * eased
    drawWheel()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false
      determineWinner()
    }
  }

  requestAnimationFrame(animate)
}

function determineWinner() {
  const normalizedRotation = currentRotation.value % 360
  const segmentAngle = 360 / segments.value.length
  // Account for pointer at top (90 degrees offset)
  const adjustedRotation = (360 - normalizedRotation + 90) % 360
  const winnerIndex = Math.floor(adjustedRotation / segmentAngle) % segments.value.length
  
  winner.value = segments.value[winnerIndex]
  emit('winner', winner.value)
}

watch(segments, () => {
  nextTick(() => drawWheel())
}, { deep: true })

onMounted(() => {
  drawWheel()
})
</script>

<style scoped>
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
