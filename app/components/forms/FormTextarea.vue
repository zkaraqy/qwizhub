<template>
  <div class="form-group mb-3">
    <label v-if="label" :for="textareaId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :class="textareaClasses"
      @input="handleInput"
      @blur="handleBlur"
    ></textarea>
    
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
    
    <small v-if="hint && !error" class="form-text text-muted">
      {{ hint }}
    </small>
    
    <small v-if="maxLength" class="form-text text-muted float-end">
      {{ characterCount }} / {{ maxLength }}
    </small>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false,
  error: '',
  hint: '',
  rows: 3,
  maxLength: 0
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const textareaId = computed(() => {
  return `textarea-${Math.random().toString(36).substr(2, 9)}`
})

const textareaClasses = computed(() => {
  const classes = ['form-control']
  
  if (props.error) {
    classes.push('is-invalid')
  }
  
  return classes.join(' ')
})

const characterCount = computed(() => {
  return props.modelValue?.length || 0
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}
</script>
