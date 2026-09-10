<template>
  <div 
    v-if="show"
    :class="alertClasses" 
    role="alert"
  >
    <div class="d-flex align-items-start">
      <span v-if="showIcon" class="me-2">{{ iconSymbol }}</span>
      <div class="flex-grow-1">
        <strong v-if="title">{{ title }}</strong>
        <div v-if="message">{{ message }}</div>
        <slot v-else></slot>
      </div>
      <button 
        v-if="dismissible" 
        type="button" 
        class="btn-close" 
        @click="handleDismiss"
        aria-label="Close"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'success' | 'error' | 'warning' | 'info' | 'danger'
  message?: string
  title?: string
  dismissible?: boolean
  showIcon?: boolean
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
  title: '',
  dismissible: false,
  showIcon: true,
  modelValue: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  dismiss: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const alertClasses = computed(() => {
  const typeClass = props.type === 'error' ? 'danger' : props.type
  const classes = ['alert', `alert-${typeClass}`]
  
  if (props.dismissible) {
    classes.push('alert-dismissible', 'fade', 'show')
  }
  
  return classes.join(' ')
})

const iconSymbol = computed(() => {
  switch (props.type) {
    case 'success':
      return '✓'
    case 'error':
    case 'danger':
      return '✕'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return 'ℹ️'
  }
})

const handleDismiss = () => {
  show.value = false
  emit('dismiss')
}
</script>
