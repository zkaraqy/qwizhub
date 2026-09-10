<template>
  <div 
    v-if="shouldShow"
    class="alert alert-dismissible fade show" 
    :class="alertClass"
    role="alert"
  >
    <div class="d-flex align-items-start">
      <strong class="me-2">{{ statusIcon }}</strong>
      <div class="flex-grow-1">
        <strong>{{ statusTitle }}</strong>
        <p class="mb-2 mt-1">{{ statusMessage }}</p>
        <NuxtLink 
          v-if="verificationStatus === 'unverified'" 
          to="/profile" 
          class="btn btn-sm btn-warning"
        >
          Complete Your Profile
        </NuxtLink>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  verificationStatus?: 'unverified' | 'pending' | 'verified'
  role?: 'peneliti' | 'responden'
}

const props = withDefaults(defineProps<Props>(), {
  verificationStatus: 'unverified',
  role: 'responden'
})

const shouldShow = computed(() => {
  return props.role === 'responden' && props.verificationStatus !== 'verified'
})

const alertClass = computed(() => {
  if (props.verificationStatus === 'unverified') {
    return 'alert-warning'
  } else if (props.verificationStatus === 'pending') {
    return 'alert-info'
  }
  return 'alert-success'
})

const statusIcon = computed(() => {
  if (props.verificationStatus === 'unverified') return '⚠️'
  if (props.verificationStatus === 'pending') return 'ℹ️'
  return '✓'
})

const statusTitle = computed(() => {
  if (props.verificationStatus === 'unverified') {
    return 'Profile Incomplete'
  } else if (props.verificationStatus === 'pending') {
    return 'Verification Pending'
  }
  return 'Profile Verified'
})

const statusMessage = computed(() => {
  if (props.verificationStatus === 'unverified') {
    return 'Please complete your demographic profile to start participating in surveys and earn rewards.'
  } else if (props.verificationStatus === 'pending') {
    return 'Your profile is under review. We\'ll notify you once verification is complete.'
  }
  return 'Your profile has been verified. You can now participate in all surveys!'
})
</script>
