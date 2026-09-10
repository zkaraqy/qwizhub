<template>
  <UiBaseBadge :variant="badgeVariant" :text="badgeText" rounded />
</template>

<script setup lang="ts">
interface Props {
  status: 'draft' | 'published' | 'closed'
}

const props = defineProps<Props>()

const badgeVariant = computed(() => {
  const variantMap: Record<string, string> = {
    draft: 'secondary',
    published: 'success',
    closed: 'danger'
  }
  return variantMap[props.status] || 'secondary'
})

const badgeText = computed(() => {
  const textMap: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    closed: 'Closed'
  }
  return textMap[props.status] || props.status
})
</script>
