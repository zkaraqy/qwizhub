<template>
  <div class="indicator-card card border mb-2">
    <div class="card-body p-3">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2">
        <div class="flex-grow-1 min-w-0 w-100" style="min-width: 0;">
          <div class="d-flex align-items-center flex-wrap gap-2 mb-2">
            <span :class="getStatusBadgeClass(indicator.status)" class="badge text-nowrap">
              {{ getIndicatorStatusLabel(indicator.status) }}
            </span>
            <span :class="getSourceBadgeClass(indicator.source)" class="badge text-nowrap">
              <i class="bi bi-tag me-1"></i>
              {{ getIndicatorSourceLabel(indicator.source) }}
            </span>
          </div>
          
          <p class="mb-1 fw-medium text-break">{{ indicator.indicatorText }}</p>
          
          <p v-if="indicator.description" class="mb-0 small text-muted text-break">
            {{ indicator.description }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="indicator-actions d-flex gap-1 align-self-end align-self-sm-start flex-shrink-0" @click.stop>
          <!-- Pending Status Actions -->
          <div v-if="indicator.status === 'pending'" class="d-flex gap-1">
            <button
              class="btn btn-sm btn-success action-btn"
              title="Terima Indikator"
              @click="emit('accept')"
            >
              <i class="bi bi-check-lg"></i>
            </button>
            <button
              class="btn btn-sm btn-danger action-btn"
              title="Tolak Indikator"
              @click="emit('reject')"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <!-- Accepted/Manual Actions -->
          <div v-if="indicator.status === 'accepted' || indicator.source === 'manual'" class="d-flex gap-1">
            <button
              class="btn btn-sm btn-outline-secondary action-btn"
              title="Edit Indikator"
              @click="emit('edit')"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger action-btn"
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
  border-radius: 10px;
  overflow: hidden;
  border-color: #e4e9e7 !important;
}

.indicator-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.06);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 575.98px) {
  .indicator-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0.35rem;
    border-top: 1px dashed rgba(0, 0, 0, 0.05);
  }
}
</style>
