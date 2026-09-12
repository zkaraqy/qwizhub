<template>
  <div class="variable-card card border-0 shadow-sm mb-3">
    <div 
      class="card-body cursor-pointer"
      @click="handleToggle"
    >
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-2">
            <h5 class="mb-0 fw-bold">{{ variable.variableName }}</h5>
            <span :class="getVariableTypeBadgeClass(variable.variableType)" class="badge">
              {{ getVariableTypeLabel(variable.variableType) }}
            </span>
          </div>
          
          <p v-if="variable.description" class="text-muted mb-2 small">
            {{ variable.description }}
          </p>
          
          <div class="d-flex align-items-center gap-3 small text-muted">
            <span>
              <i class="bi bi-list-check me-1"></i>
              {{ indicatorCount }} indikator
            </span>
            <span v-if="indicatorCount > 0">
              <i class="bi bi-check-circle me-1"></i>
              {{ acceptedCount }} diterima
            </span>
          </div>
        </div>
        
        <div class="d-flex gap-1" @click.stop>
          <button
            class="btn btn-sm btn-outline-primary"
            title="Generate Indikator dengan AI"
            @click="emit('generate-indicators')"
          >
            <i class="bi bi-stars"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            title="Edit Variabel"
            @click="emit('edit')"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            title="Hapus Variabel"
            @click="emit('delete')"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Indicators Section (Collapsible) -->
    <div v-if="expanded" class="card-footer bg-light">
      <slot name="indicators"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResearchVariable } from '~/types/research'
import { getVariableTypeLabel } from '~/types/research'

interface Props {
  variable: ResearchVariable
  expanded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  'generate-indicators': []
  toggle: []
}>()

const indicatorCount = computed(() => {
  return props.variable.indicators?.length || 0
})

const acceptedCount = computed(() => {
  return props.variable.indicators?.filter(i => i.status === 'accepted').length || 0
})

const getVariableTypeBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    independent: 'bg-primary',
    dependent: 'bg-success',
    moderating: 'bg-warning text-dark',
    intervening: 'bg-info',
    control: 'bg-secondary'
  }
  return classes[type] || 'bg-secondary'
}

const handleToggle = () => {
  emit('toggle')
}
</script>

<style scoped>
.variable-card {
  transition: all 0.2s ease;
}

.variable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
