import { ref } from 'vue'

export function useConfetti(settings) {
  const isActive = ref(false)
  let canvas = null
  let ctx = null
  let particles = []
  let animationId = null

  const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
  ]

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      width: Math.random() * 10 + 5,
      height: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: Math.random() * 3 + 2,
      oscillation: Math.random() * Math.PI * 2,
      oscillationSpeed: Math.random() * 0.02 + 0.01
    }
  }

  function initCanvas() {
    canvas = document.getElementById('confetti-canvas')
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = 'confetti-canvas'
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `
      document.body.appendChild(canvas)
    }
    ctx = canvas.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }

  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }

  function animate() {
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((p, index) => {
      // Update position
      p.oscillation += p.oscillationSpeed
      p.x += p.velocityX + Math.sin(p.oscillation) * 0.5
      p.y += p.velocityY
      p.rotation += p.rotationSpeed

      // Draw particle (strip/confetti piece)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
      ctx.restore()

      // Remove if off screen
      if (p.y > canvas.height + 50) {
        particles.splice(index, 1)
      }
    })

    if (particles.length > 0 || isActive.value) {
      animationId = requestAnimationFrame(animate)
    } else {
      cleanup()
    }
  }

  function startConfetti(duration = 3000) {
    if (!settings.value.partyEnabled) return

    initCanvas()
    isActive.value = true
    particles = []

    // Spawn particles over time
    const spawnInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        particles.push(createParticle())
      }
    }, 50)

    // Start animation
    animate()

    // Stop spawning after duration
    setTimeout(() => {
      clearInterval(spawnInterval)
      isActive.value = false
    }, duration)
  }

  function stopConfetti() {
    isActive.value = false
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    cleanup()
  }

  function cleanup() {
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas)
    }
    canvas = null
    ctx = null
    particles = []
    window.removeEventListener('resize', resizeCanvas)
  }

  return {
    isActive,
    startConfetti,
    stopConfetti
  }
}
