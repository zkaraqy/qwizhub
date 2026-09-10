<template>
  <div class="form-check mb-2">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      class="form-check-input"
      :class="{ 'is-invalid': error }"
      @change="handleChange"
    />
    <label :for="checkboxId" class="form-check-label">
      {{ label }}
    </label>
    
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  modelValue?: boolean | any[]
  value?: any
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: true,
  disabled: false,
  error: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | any[]]
}>()

const checkboxId = computed(() => {
  return `checkbox-${Math.random().toString(36).substr(2, 9)}`
})

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === true
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value)
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', target.checked)
  }
}
</script>
