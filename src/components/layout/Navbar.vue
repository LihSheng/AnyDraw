<template>
  <nav class="glass sticky top-0 z-50 px-6 py-4 mb-6">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <span class="text-3xl">🎲</span>
        <h1 class="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 
                   bg-clip-text text-transparent">
          AnyDraw
        </h1>
      </div>

      <!-- Game Type Tabs -->
      <div class="flex items-center gap-1 tab-container rounded-xl p-1">
        <button
          v-for="game in games"
          :key="game.id"
          @click="$emit('change-game', game.id)"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="activeGame === game.id 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
            : 'tab-inactive'"
        >
          <span class="mr-1">{{ game.icon }}</span>
          {{ game.name }}
        </button>
      </div>

      <!-- Settings Button -->
      <button 
        @click="$emit('open-settings')"
        class="p-2 rounded-lg settings-btn transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  activeGame: {
    type: String,
    required: true
  }
})

defineEmits(['change-game', 'open-settings'])

const games = [
  { id: 'wheel', name: 'Wheel', icon: '🎡' },
  { id: 'number', name: 'Number', icon: '🔢' },
  { id: 'cards', name: 'Cards', icon: '🃏' }
]
</script>

<style scoped>
/* Theme-aware styles will be inherited from parent */
</style>
