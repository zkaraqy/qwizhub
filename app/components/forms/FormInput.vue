<template>
  <div class="form-group mb-3">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <div class="input-group" :class="{ 'has-validation': error }">
      <span v-if="$slots.icon || icon" class="input-group-text">
        <slot name="icon">
          <i :class="icon"></i>
        </slot>
      </span>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
      />
      
      <span v-if="$slots.append" class="input-group-text">
        <slot name="append"></slot>
      </span>
    </div>
    
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
    
    <small v-if="hint && !error" class="form-text text-muted">
      {{ hint }}
    </small>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string | number
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false,
  error: '',
  hint: '',
  icon: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()

const inputId = computed(() => {
  return `input-${Math.random().toString(36).substr(2, 9)}`
})

const inputClasses = computed(() => {
  const classes = ['form-control']
  
  if (props.error) {
    classes.push('is-invalid')
  }
  
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}
</script>
