<template>
  <UiBaseCard title="Recent Activity">
    <template v-if="loading">
      <div class="text-center py-4">
        <UiBaseSpinner centered />
        <p class="mt-3 text-muted">Loading activities...</p>
      </div>
    </template>
    
    <template v-else-if="!activities || activities.length === 0">
      <div class="text-center py-4">
        <p class="text-muted mb-3">{{ emptyMessage }}</p>
        <slot name="empty-action">
          <UiBaseButton variant="primary" @click="$emit('create')">
            Create New Survey
          </UiBaseButton>
        </slot>
      </div>
    </template>
    
    <template v-else>
      <div class="list-group list-group-flush">
        <div 
          v-for="(activity, index) in activities" 
          :key="index"
          class="list-group-item"
        >
          <div class="d-flex w-100 justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">{{ activity.title }}</h6>
              <p class="mb-1 text-muted small">{{ activity.description }}</p>
            </div>
            <small class="text-muted">{{ formatDate(activity.date) }}</small>
          </div>
        </div>
      </div>
    </template>
  </UiBaseCard>
</template>

<script setup lang="ts">
interface Activity {
  title: string
  description: string
  date: Date | string
  type?: string
}

interface Props {
  activities?: Activity[]
  loading?: boolean
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  activities: () => [],
  loading: false,
  emptyMessage: 'No recent activity. Start by creating your first survey!'
})

defineEmits<{
  create: []
}>()

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  
  return d.toLocaleDateString()
}
</script>
