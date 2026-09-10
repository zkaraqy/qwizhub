<template>
  <div :class="cardClasses">
    <div v-if="hasHeader" class="card-header" :class="headerClass">
      <slot name="header">
        <h5 class="mb-0">{{ title }}</h5>
      </slot>
    </div>
    
    <div class="card-body" :class="bodyClass">
      <slot></slot>
    </div>
    
    <div v-if="hasFooter" class="card-footer" :class="footerClass">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  shadow?: boolean | 'sm' | 'lg'
  border?: boolean
  headerClass?: string
  bodyClass?: string
  footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  shadow: true,
  border: false,
  headerClass: 'bg-white border-bottom',
  bodyClass: '',
  footerClass: 'bg-light'
})

const slots = useSlots()

const hasHeader = computed(() => {
  return !!slots.header || !!props.title
})

const hasFooter = computed(() => {
  return !!slots.footer
})

const cardClasses = computed(() => {
  const classes = ['card']
  
  if (props.shadow === true) {
    classes.push('shadow-sm')
  } else if (props.shadow === 'sm') {
    classes.push('shadow-sm')
  } else if (props.shadow === 'lg') {
    classes.push('shadow-lg')
  }
  
  if (!props.border) {
    classes.push('border-0')
  }
  
  return classes.join(' ')
})
</script>
