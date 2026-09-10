<template>
  <div :class="spinnerClasses" role="status">
    <span class="visually-hidden">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  centered?: boolean
  type?: 'border' | 'grow'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  centered: false,
  type: 'border'
})

const text = 'Loading...'

const spinnerClasses = computed(() => {
  const classes = []
  
  if (props.type === 'border') {
    classes.push('spinner-border')
  } else {
    classes.push('spinner-grow')
  }
  
  classes.push(`text-${props.color}`)
  
  if (props.size === 'sm') {
    classes.push(props.type === 'border' ? 'spinner-border-sm' : 'spinner-grow-sm')
  }
  
  if (props.centered) {
    classes.push('d-block', 'mx-auto')
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
.spinner-border-lg,
.spinner-grow-lg {
  width: 3rem;
  height: 3rem;
}
</style>
