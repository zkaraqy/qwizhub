<template>
  <UiBaseCard>
    <div class="card-body p-4 bg-gradient" :class="`bg-${bgColor}`" :style="{ color: textColor }">
      <h2 class="mb-2">{{ greeting }}, {{ userName }}! 👋</h2>
      <p class="mb-0 opacity-75">{{ subtitle }}</p>
    </div>
  </UiBaseCard>
</template>

<script setup lang="ts">
interface Props {
  userName?: string
  subtitle?: string
  bgColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'User',
  subtitle: "Here's what's happening with your surveys today",
  bgColor: 'primary',
  textColor: 'white'
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
}
</style>
