<template>
  <div class="card border rounded-4 shadow-sm bg-white h-100 project-card" style="border-color: #E2E8F0;">
    <div class="card-body p-4 d-flex flex-column">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="stat-icon-folder">
          <i class="bi bi-folder2-open" style="color: #137A7F;"></i>
        </div>
        <ProjectStatusBadge :status="project.status" />
      </div>
      
      <h5 class="fw-bold mb-2 text-dark" style="letter-spacing: -0.01em;">{{ project.title }}</h5>
      <p class="text-muted small mb-3 flex-grow-1" style="line-height: 1.6;">
        {{ project.description || 'Tidak ada deskripsi untuk proyek penelitian ini.' }}
      </p>
      
      <div class="d-flex align-items-center gap-3 text-secondary small mb-4 pt-3 border-top" style="border-color: #F0F4F4; font-size: 0.8rem;">
        <span class="d-flex align-items-center gap-1.5">
          <i class="bi bi-calendar3" style="color: #137A7F;"></i>
          <span>{{ formatDate(project.createdAt) }}</span>
        </span>
        <span v-if="project.questionnaireCount !== undefined" class="d-flex align-items-center gap-1.5 ms-auto">
          <i class="bi bi-clipboard-check" style="color: #137A7F;"></i>
          <span>{{ project.questionnaireCount }} kuesioner</span>
        </span>
      </div>

      <div class="d-flex gap-2 mt-auto">
        <button 
          class="btn text-white btn-sm flex-grow-1 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-1.5" 
          style="background-color: #0E3B43;"
          @click="$emit('view', project.id)"
        >
          <i class="bi bi-kanban"></i>
          <span>Kelola</span>
        </button>
        <button 
          v-if="project.status === 'draft'"
          class="btn btn-outline-secondary btn-sm px-2.5 rounded-3" 
          @click="$emit('edit', project.id)"
          title="Edit Proyek"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button 
          v-if="project.status === 'draft'"
          class="btn btn-outline-danger btn-sm px-2.5 rounded-3" 
          @click="$emit('delete', project.id)"
          title="Hapus Proyek"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </div>
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
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.stat-icon-folder {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #EBF5F3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(14, 59, 67, 0.08) !important;
  border-color: rgba(19, 122, 127, 0.35) !important;
}
</style>
