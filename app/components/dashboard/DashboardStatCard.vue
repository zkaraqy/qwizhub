<template>
  <UiBaseCard shadow="sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <p class="text-muted mb-1 small">{{ label }}</p>
          <h3 class="mb-0">{{ formattedValue }}</h3>
          <small v-if="trend" :class="trendClass">
            <span>{{ trendIcon }}</span>
            {{ trend }}
          </small>
        </div>
        <div :class="`bg-${color} bg-opacity-10 rounded p-3`">
          <component :is="iconComponent" />
        </div>
      </div>
    </div>
  </UiBaseCard>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: number | string
  icon?: 'chart' | 'users' | 'activity' | 'check' | 'clock'
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  trend?: string
  trendUp?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'chart',
  color: 'primary',
  trend: '',
  trendUp: true
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendClass = computed(() => {
  return props.trendUp ? 'text-success' : 'text-danger'
})

const trendIcon = computed(() => {
  return props.trendUp ? '↑' : '↓'
})

const iconComponent = computed(() => {
  return h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    fill: getIconColor(),
    viewBox: '0 0 16 16'
  }, [
    h('path', { d: getIconPath() })
  ])
})

const getIconColor = () => {
  const colorMap: Record<string, string> = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    info: '#0dcaf0',
    danger: '#dc3545'
  }
  return colorMap[props.color] || colorMap.primary
}

const getIconPath = () => {
  const iconPaths: Record<string, string> = {
    chart: 'M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z',
    users: 'M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    activity: 'M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492z',
    check: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z',
    clock: 'M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z'
  }
  return iconPaths[props.icon] || iconPaths.chart
}
</script>
