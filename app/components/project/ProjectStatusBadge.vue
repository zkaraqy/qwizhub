<template>
  <span class="badge rounded-pill px-2.5 py-1" :class="badgeClass">
    {{ badgeText }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: 'draft' | 'published' | 'closed'
}

const props = defineProps<Props>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'draft': return 'badge-draft'
    case 'published': return 'badge-published'
    case 'closed': return 'badge-closed'
    default: return 'badge-draft'
  }
})

const badgeText = computed(() => {
  switch (props.status) {
    case 'draft': return 'Draft'
    case 'published': return '🟢 Aktif'
    case 'closed': return '🔵 Ditutup'
    default: return props.status
  }
})
</script>

<style scoped>
.badge-draft {
  background-color: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.badge-published {
  background-color: #DEF7EC;
  color: #0E9F6E;
  border: 1px solid rgba(14, 159, 110, 0.25);
}

.badge-closed {
  background-color: #EBF5F3;
  color: #137A7F;
  border: 1px solid rgba(19, 122, 127, 0.25);
}
</style>
