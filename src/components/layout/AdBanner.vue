<template>
  <div class="ad-container">
    <div class="ad-wrapper">
      <!-- AdSense ad will be inserted here -->
      <ins 
        class="adsbygoogle"
        style="display:block"
        :data-ad-client="adClient"
        :data-ad-slot="adSlot"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      ></ins>
      
      <!-- Fallback placeholder when no ad is loaded -->
      <div v-if="showPlaceholder" class="ad-placeholder">
        <span class="ad-label">Advertisement</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  adClient: {
    type: String,
    default: 'ca-pub-XXXXXXXXXXXXXXXX' // Replace with your AdSense Publisher ID
  },
  adSlot: {
    type: String,
    default: 'XXXXXXXXXX' // Replace with your Ad Unit ID
  }
})

const showPlaceholder = ref(true)

onMounted(() => {
  // Initialize AdSense if the script is loaded
  try {
    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
      showPlaceholder.value = false
    }
  } catch (e) {
    console.log('AdSense not loaded:', e)
  }
})
</script>

<style scoped>
.ad-container {
  width: 100%;
  padding: 1rem;
  margin-top: auto;
}

.ad-wrapper {
  max-width: 728px;
  margin: 0 auto;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-placeholder {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(128, 128, 128, 0.3);
  border-radius: 0.5rem;
  background: rgba(128, 128, 128, 0.05);
}

.ad-label {
  font-size: 0.75rem;
  color: rgba(128, 128, 128, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive ad sizes */
@media (max-width: 768px) {
  .ad-wrapper {
    min-height: 100px;
  }
}
</style>
