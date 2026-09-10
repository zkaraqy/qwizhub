<template>
  <div class="flip7-section-title">
    <div class="d-flex align-items-center flip7-section-divider">
      <div v-if="emoji" class="flip7-emoji-container">
        {{ emoji }}
      </div>
      <h3 class="flip7-section-text text-h2 mb-0">
        <slot>{{ title }}</slot>
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  emoji?: string
  title?: string
  variant?: 'primary' | 'accent' | 'coral'
}

const props = withDefaults(defineProps<Props>(), {
  emoji: '',
  title: '',
  variant: 'primary'
})

const colorClass = computed(() => {
  switch (props.variant) {
    case 'accent':
      return 'text-flip7-accent'
    case 'coral':
      return 'text-flip7-coral'
    default:
      return 'text-flip7-primary'
  }
})
</script>

<style scoped>
.flip7-section-title {
  margin-bottom: var(--space-lg);
}

.flip7-section-text {
  color: var(--flip7-primary-teal);
  font-weight: var(--fw-extra-bold);
}

.flip7-emoji-container {
  font-size: var(--text-h1);
  width: 32px;
  height: 32px;
}
</style>
