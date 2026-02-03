<template>
  <div class="glass p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold panel-title flex items-center gap-2">
        <span>📋</span> {{ gameLabels[activeGame] }}
        <span class="text-xs panel-count">({{ participants.length }})</span>
      </h3>
      <button 
        v-if="participants.length > 0"
        @click="$emit('clear')"
        class="text-xs text-red-500 hover:text-red-400 transition-colors"
      >
        Clear
      </button>
    </div>

    <!-- Add Input -->
    <form @submit.prevent="addParticipant" class="flex gap-2 mb-4">
      <input
        v-model="newName"
        type="text"
        placeholder="Enter name..."
        class="input-field flex-1 py-2 text-sm"
      />
      <button 
        type="submit"
        class="px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded-lg
               text-white text-sm font-medium transition-colors"
      >
        Add
      </button>
    </form>

    <!-- Participant List -->
    <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
      <TransitionGroup name="list">
        <div
          v-for="(name, index) in participants"
          :key="name + index"
          class="flex items-center justify-between p-2 participant-item rounded-lg
                 transition-colors group"
        >
          <span class="text-sm panel-text truncate flex-1">{{ name }}</span>
          <button
            @click="$emit('remove', index)"
            class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400
                   text-sm px-2 transition-all"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>

      <p v-if="participants.length === 0" class="text-center panel-muted text-sm py-4">
        No participants yet
      </p>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-4 pt-4 panel-border space-y-4">
      <!-- Bulk Add -->
      <div>
        <button 
          @click="showBulkAdd = !showBulkAdd"
          class="text-xs text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
        >
          <span>{{ showBulkAdd ? '▲' : '▼' }} Bulk Add</span>
        </button>
        
        <div v-if="showBulkAdd" class="mt-2">
          <textarea
            v-model="bulkNames"
            placeholder="One name per line..."
            class="input-field text-sm h-20 resize-none"
          ></textarea>
          <button 
            @click="addBulk"
            class="mt-2 w-full py-2 bulk-add-btn rounded-lg
                   text-xs transition-colors"
          >
            Add All
          </button>
        </div>
      </div>

      <!-- Share / Import -->
      <div v-if="otherGames.length > 0">
        <button 
          @click="showActions = !showActions"
          class="text-xs text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1"
        >
          <span>{{ showActions ? '▲' : '▼' }} Sync / Share</span>
        </button>
        
        <div v-if="showActions" class="mt-3 space-y-3">
          <!-- Share To -->
          <div class="space-y-1">
            <p class="text-[10px] uppercase tracking-wider text-muted font-bold opacity-60">Results in overwriting target</p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="game in otherGames" 
                :key="'share-'+game"
                @click="$emit('share', game)"
                class="px-2 py-1.5 bg-surface-700 hover:bg-surface-600 rounded text-xs text-left transition-colors flex items-center gap-2"
              >
                <span>➔ To {{ gameLabels[game] }}</span>
              </button>
            </div>
          </div>

          <!-- Import From -->
          <div class="space-y-1 mt-2">
             <p class="text-[10px] uppercase tracking-wider text-muted font-bold opacity-60">Overwrite current list</p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="game in otherGames" 
                :key="'import-'+game"
                @click="$emit('import-list', game)"
                class="px-2 py-1.5 bg-surface-700 hover:bg-surface-600 rounded text-xs text-left transition-colors flex items-center gap-2"
              >
                <span>📥 From {{ gameLabels[game] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  participants: {
    type: Array,
    required: true
  },
  activeGame: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['add', 'remove', 'clear', 'share', 'import-list'])

const newName = ref('')
const showBulkAdd = ref(false)
const showActions = ref(false)
const bulkNames = ref('')

const gameLabels = {
  wheel: 'Wheel',
  cards: 'Cards',
  number: 'Number'
}

const otherGames = computed(() => {
  return Object.keys(gameLabels).filter(k => k !== props.activeGame)
})

function addParticipant() {
  if (newName.value.trim()) {
    emit('add', newName.value.trim())
    newName.value = ''
  }
}

function addBulk() {
  const names = bulkNames.value.split('\n').filter(n => n.trim())
  names.forEach(name => emit('add', name.trim()))
  bulkNames.value = ''
  showBulkAdd.value = false
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
