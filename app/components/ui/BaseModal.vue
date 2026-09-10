<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="modal fade show d-block" 
        tabindex="-1" 
        role="dialog"
        @click.self="handleBackdropClick"
      >
        <div :class="modalDialogClasses" role="document">
          <div class="modal-content">
            <div v-if="hasHeader" class="modal-header">
              <slot name="header">
                <h5 class="modal-title">{{ title }}</h5>
              </slot>
              <button 
                type="button" 
                class="btn-close" 
                @click="handleClose"
                aria-label="Close"
              ></button>
            </div>
            
            <div class="modal-body">
              <slot></slot>
            </div>
            
            <div v-if="hasFooter" class="modal-footer">
              <slot name="footer">
                <UiBaseButton variant="secondary" @click="handleClose">
                  Close
                </UiBaseButton>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <Transition name="backdrop">
      <div v-if="show" class="modal-backdrop fade show"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  size: 'md',
  closeOnBackdrop: true,
  centered: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const slots = useSlots()

const hasHeader = computed(() => {
  return !!slots.header || !!props.title
})

const hasFooter = computed(() => {
  return !!slots.footer
})

const modalDialogClasses = computed(() => {
  const classes = ['modal-dialog']
  
  if (props.size !== 'md') {
    classes.push(`modal-${props.size}`)
  }
  
  if (props.centered) {
    classes.push('modal-dialog-centered')
  }
  
  return classes.join(' ')
})

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

// Prevent body scroll when modal is open
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal-open {
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
