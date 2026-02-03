<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="relative settings-modal p-6 w-full max-w-sm rounded-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <span>⚙️</span> Settings
            </h2>
            <button 
              @click="$emit('close')"
              class="close-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Settings Options -->
          <div class="space-y-3">
            <!-- Theme Toggle -->
            <div class="flex items-center justify-between p-4 setting-row rounded-xl">
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ settings.theme === 'dark' ? '🌙' : '☀️' }}</span>
                <div>
                  <span class="font-medium">Theme</span>
                  <p class="text-xs text-muted">{{ settings.theme === 'dark' ? 'Dark mode' : 'Light mode' }}</p>
                </div>
              </div>
              <button
                @click="$emit('toggle-theme')"
                class="toggle-track"
                :class="settings.theme === 'dark' ? 'toggle-on' : 'toggle-off'"
              >
                <span 
                  class="toggle-thumb"
                  :class="settings.theme === 'dark' ? 'thumb-on' : 'thumb-off'"
                ></span>
              </button>
            </div>

            <!-- Sound Toggle -->
            <div class="flex items-center justify-between p-4 setting-row rounded-xl">
              <div class="flex items-center gap-3">
                <span class="text-xl">🔊</span>
                <div>
                  <span class="font-medium">Sound Effects</span>
                  <p class="text-xs text-muted">{{ settings.soundEnabled ? 'Enabled' : 'Disabled' }}</p>
                </div>
              </div>
              <button
                @click="$emit('toggle-sound')"
                class="toggle-track"
                :class="settings.soundEnabled ? 'toggle-on' : 'toggle-off'"
              >
                <span 
                  class="toggle-thumb"
                  :class="settings.soundEnabled ? 'thumb-on' : 'thumb-off'"
                ></span>
              </button>
            </div>

            <!-- Party Effects Toggle -->
            <div class="flex items-center justify-between p-4 setting-row rounded-xl">
              <div class="flex items-center gap-3">
                <span class="text-xl">🎉</span>
                <div>
                  <span class="font-medium">Party Effects</span>
                  <p class="text-xs text-muted">{{ settings.partyEnabled ? 'Confetti on win' : 'No confetti' }}</p>
                </div>
              </div>
              <button
                @click="$emit('toggle-party')"
                class="toggle-track"
                :class="settings.partyEnabled ? 'toggle-on' : 'toggle-off'"
              >
                <span 
                  class="toggle-thumb"
                  :class="settings.partyEnabled ? 'thumb-on' : 'thumb-off'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="mt-6 pt-4 border-t border-current/10">
            <div class="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div class="flex items-center gap-3">
                <span class="text-xl">🗑️</span>
                <div>
                  <span class="font-medium text-red-500">Clear Data</span>
                  <p class="text-xs text-red-500/60">Reset all app data</p>
                </div>
              </div>
              <button
                @click="confirmClear"
                class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-6 text-center">
            <p class="text-xs text-muted">
              AnyDraw v1.0 • Lucky Draw Collection
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'toggle-sound', 'toggle-party', 'toggle-theme', 'clear-data'])

function confirmClear() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    emit('clear-data')
  }
}
</script>

<style scoped>
/* Toggle Track */
.toggle-track {
  position: relative;
  width: 50px;
  height: 26px;
  border-radius: 13px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  border: none;
  padding: 0;
  flex-shrink: 0;
}

.toggle-on {
  background-color: #0ea5e9;
}

.toggle-off {
  background-color: #94a3b8;
}

/* Toggle Thumb */
.toggle-thumb {
  position: absolute;
  top: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.3s ease;
}

.thumb-off {
  left: 3px;
}

.thumb-on {
  left: 27px;
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .settings-modal,
.modal-leave-to .settings-modal {
  transform: scale(0.9);
}
</style>
