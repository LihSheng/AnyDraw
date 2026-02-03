<template>
  <div class="glass p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold panel-title flex items-center gap-2">
        <span>🏆</span> Winner History
        <span class="text-xs panel-count">({{ history.length }})</span>
      </h3>
      <button 
        v-if="history.length > 0"
        @click="$emit('clear')"
        class="text-xs text-red-500 hover:text-red-400 transition-colors"
      >
        Clear
      </button>
    </div>

    <!-- History List -->
    <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
      <TransitionGroup name="list">
        <div
          v-for="entry in history"
          :key="entry.id"
          class="p-3 history-item rounded-lg border-l-2 border-accent-500"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-accent-500 truncate">{{ entry.winner }}</span>
            <span class="text-xs px-2 py-0.5 game-badge rounded-full">
              {{ getGameIcon(entry.gameType) }}
            </span>
          </div>
          <p class="text-xs panel-muted mt-1">{{ entry.timestamp }}</p>
        </div>
      </TransitionGroup>

      <p v-if="history.length === 0" class="text-center panel-muted text-sm py-4">
        No winners yet
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  history: {
    type: Array,
    required: true
  }
})

defineEmits(['clear'])

function getGameIcon(gameType) {
  const icons = {
    wheel: '🎡',
    number: '🔢',
    cards: '🃏'
  }
  return icons[gameType] || '🎲'
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
