<template>
  <span :class="badgeClasses">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  text?: string
  rounded?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  text: '',
  rounded: false,
  size: 'md'
})

const badgeClasses = computed(() => {
  const classes = ['badge', `bg-${props.variant}`]
  
  if (props.rounded) {
    classes.push('rounded-pill')
  }
  
  if (props.size === 'sm') {
    classes.push('badge-sm')
  } else if (props.size === 'lg') {
    classes.push('badge-lg')
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
.badge-sm {
  font-size: 0.75rem;
  padding: 0.25em 0.5em;
}

.badge-lg {
  font-size: 1rem;
  padding: 0.5em 1em;
}
</style>
