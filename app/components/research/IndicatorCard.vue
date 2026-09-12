<template>
  <div class="indicator-card card border mb-2">
    <div class="card-body p-3">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1 me-3">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span :class="getStatusBadgeClass(indicator.status)" class="badge">
              {{ getIndicatorStatusLabel(indicator.status) }}
            </span>
            <span :class="getSourceBadgeClass(indicator.source)" class="badge">
              <i class="bi bi-tag me-1"></i>
              {{ getIndicatorSourceLabel(indicator.source) }}
            </span>
          </div>
          
          <p class="mb-1 fw-medium">{{ indicator.indicatorText }}</p>
          
          <p v-if="indicator.description" class="mb-0 small text-muted">
            {{ indicator.description }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="d-flex flex-column gap-1">
          <!-- Pending Status Actions -->
          <div v-if="indicator.status === 'pending'" class="d-flex gap-1">
            <button
              class="btn btn-sm btn-success"
              title="Terima Indikator"
              @click="emit('accept')"
            >
              <i class="bi bi-check-lg"></i>
            </button>
            <button
              class="btn btn-sm btn-danger"
              title="Tolak Indikator"
              @click="emit('reject')"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <!-- Accepted/Manual Actions -->
          <div v-if="indicator.status === 'accepted' || indicator.source === 'manual'" class="d-flex gap-1">
            <button
              class="btn btn-sm btn-outline-secondary"
              title="Edit Indikator"
              @click="emit('edit')"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              title="Hapus Indikator"
              @click="emit('delete')"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VariableIndicator } from '~/types/research'
import { getIndicatorStatusLabel, getIndicatorSourceLabel } from '~/types/research'

interface Props {
  indicator: VariableIndicator
}

defineProps<Props>()

const emit = defineEmits<{
  accept: []
  reject: []
  edit: []
  delete: []
}>()

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-warning text-dark',
    accepted: 'bg-success',
    rejected: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const getSourceBadgeClass = (source: string): string => {
  const classes: Record<string, string> = {
    manual: 'bg-primary',
    ai_generated: 'bg-info'
  }
  return classes[source] || 'bg-secondary'
}
</script>

<style scoped>
.indicator-card {
  transition: all 0.2s ease;
}

.indicator-card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
