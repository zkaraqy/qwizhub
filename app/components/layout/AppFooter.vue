<template>
  <footer :class="footerClasses">
    <div :class="containerClass">
      <div v-if="variant === 'full'" class="row">
        <div class="col-md-6">
          <h5 class="fw-bold mb-3">QwizHub</h5>
          <p class="text-muted">Your trusted survey and research platform</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="text-muted mb-0">&copy; 2026 QwizHub. All rights reserved.</p>
        </div>
      </div>
      <div v-else class="text-center">
        <p class="text-muted mb-0">&copy; 2026 QwizHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'simple' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full'
})

const footerClasses = computed(() => {
  return 'bg-dark text-white py-4'
})

const containerClass = computed(() => {
  return 'container'
})
</script>
