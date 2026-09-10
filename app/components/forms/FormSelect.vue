<template>
  <div class="form-group mb-3">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <select
      :id="selectId"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="selectClasses"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
    
    <small v-if="hint && !error" class="form-text text-muted">
      {{ hint }}
    </small>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  label?: string
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  placeholder: 'Select an option',
  required: false,
  disabled: false,
  error: '',
  hint: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectId = computed(() => {
  return `select-${Math.random().toString(36).substr(2, 9)}`
})

const selectClasses = computed(() => {
  const classes = ['form-select']
  
  if (props.error) {
    classes.push('is-invalid')
  }
  
  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
