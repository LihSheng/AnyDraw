import { ref } from 'vue'

// Audio context for sound effects
let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function useSoundEffects(settings) {
  const isPlaying = ref(false)

  // Generate a beep/tick sound
  function playTick() {
    if (!settings.value.soundEnabled) return
    playTone(800, 0.05, 'sine')
  }

  // Play spinning sound (continuous ticks)
  function playSpinning(duration = 3000) {
    if (!settings.value.soundEnabled) return
    
    isPlaying.value = true
    const tickInterval = 50
    let elapsed = 0
    
    const interval = setInterval(() => {
      elapsed += tickInterval
      // Slow down ticks as we approach end
      const progress = elapsed / duration
      if (progress < 0.7 || Math.random() > progress) {
        playTick()
      }
      if (elapsed >= duration) {
        clearInterval(interval)
        isPlaying.value = false
      }
    }, tickInterval)

    return () => {
      clearInterval(interval)
      isPlaying.value = false
    }
  }

  // Winner fanfare
  function playWinner() {
    if (!settings.value.soundEnabled) return
    
    // Play ascending notes
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine'), i * 150)
    })
  }

  // Click sound
  function playClick() {
    if (!settings.value.soundEnabled) return
    playTone(400, 0.08, 'square')
  }

  // Drum roll effect
  function playDrumRoll(duration = 2000) {
    if (!settings.value.soundEnabled) return
    
    isPlaying.value = true
    const interval = setInterval(() => {
      playTone(100 + Math.random() * 50, 0.03, 'triangle')
    }, 30)

    setTimeout(() => {
      clearInterval(interval)
      isPlaying.value = false
    }, duration)
  }

  // Core tone generator
  function playTone(frequency, duration, type = 'sine') {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Audio not supported:', e)
    }
  }

  return {
    isPlaying,
    playTick,
    playSpinning,
    playWinner,
    playClick,
    playDrumRoll
  }
}
