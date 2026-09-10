<template>
  <UiBaseCard>
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 class="card-title mb-1">{{ project.title }}</h5>
          <p class="text-muted small mb-2">{{ project.description || 'No description' }}</p>
        </div>
        <ProjectStatusBadge :status="project.status" />
      </div>
      
      <div class="d-flex gap-3 text-muted small mb-3">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-calendar3 me-1" viewBox="0 0 16 16">
            <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
            <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
          {{ formatDate(project.createdAt) }}
        </span>
        <span v-if="project.questionnaireCount">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-clipboard-check me-1" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>
          {{ project.questionnaireCount }} questionnaire(s)
        </span>
      </div>
      
      <div class="d-flex gap-2">
        <UiBaseButton 
          variant="primary" 
          size="sm"
          @click="$emit('view', project.id)"
        >
          View Details
        </UiBaseButton>
        <UiBaseButton 
          v-if="project.status === 'draft'"
          variant="outline-secondary" 
          size="sm"
          @click="$emit('edit', project.id)"
        >
          Edit
        </UiBaseButton>
        <UiBaseButton 
          v-if="project.status === 'draft'"
          variant="outline-danger" 
          size="sm"
          @click="$emit('delete', project.id)"
        >
          Delete
        </UiBaseButton>
      </div>
    </div>
  </UiBaseCard>
</template>

<script setup lang="ts">
interface Project {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'closed'
  createdAt: Date | string
  questionnaireCount?: number
}

interface Props {
  project: Project
  variant?: 'list' | 'grid'
}

withDefaults(defineProps<Props>(), {
  variant: 'grid'
})

defineEmits<{
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
