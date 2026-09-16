<template>
  <div class="variable-card card border shadow-sm mb-3">
    <div 
      class="card-body cursor-pointer p-3 p-sm-4"
      @click="handleToggle"
    >
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3">
        <div class="flex-grow-1 min-w-0 w-100" style="min-width: 0;">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h5 class="mb-0 fw-bold text-break">{{ variable.variableName }}</h5>
            <span :class="getVariableTypeBadgeClass(variable.variableType)" class="badge text-nowrap">
              {{ getVariableTypeLabel(variable.variableType) }}
            </span>
          </div>
          
          <p v-if="variable.description" class="text-muted mb-2 small text-break">
            {{ variable.description }}
          </p>
          
          <div class="d-flex align-items-center flex-wrap gap-3 small text-muted">
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
        
        <div class="variable-actions d-flex gap-2 flex-shrink-0 align-self-end align-self-sm-start" @click.stop>
          <button
            class="btn btn-sm btn-outline-primary action-btn"
            title="Generate Indikator dengan AI"
            @click="emit('generate-indicators')"
          >
            <i class="bi bi-stars"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary action-btn"
            title="Edit Variabel"
            @click="emit('edit')"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-danger action-btn"
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
  border-radius: 12px;
  overflow: hidden;
  border-color: #e4e9e7 !important;
}

.variable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 575.98px) {
  .variable-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(0, 0, 0, 0.06);
  }
}
</style>
