<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <div class="row">
      <div class="col-lg-6 mx-auto text-center">
        <div class="card shadow-sm">
          <div class="card-body p-5">
            <div class="mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
            </div>
            <h2 class="mb-3">Terima Kasih!</h2>
            <p class="text-muted mb-4">
              Jawaban Anda telah berhasil dikirim. Honor Anda akan segera diproses.
            </p>
            
            <div class="alert alert-success mb-4">
              <i class="bi bi-cash-coin me-2"></i>
              Honor sebesar <strong>Rp {{ formatCurrency(honorAmount) }}</strong> 
              telah dikreditkan ke akun Anda
            </div>

            <div class="d-grid gap-2">
              <NuxtLink to="/questionnaires" class="btn btn-primary">
                <i class="bi bi-clipboard-check me-2"></i>
                Cari Kuesioner Lain
              </NuxtLink>
              <NuxtLink to="/questionnaires/my-responses" class="btn btn-outline-secondary">
                <i class="bi bi-clock-history me-2"></i>
                Lihat Riwayat Jawaban
              </NuxtLink>
              <NuxtLink to="/dashboard" class="btn btn-outline-secondary">
                <i class="bi bi-house me-2"></i>
                Ke Dashboard
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, signOut } = useAuth()
const route = useRoute()
const honorAmount = ref(0)

const userProfile = computed(() => {
  if (!data.value?.user) return null
  return {
    id: (data.value.user as any).id,
    name: data.value.user.name || '',
    email: data.value.user.email || '',
    image: data.value.user.image,
    role: (data.value.user as any).role
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

// Get honor amount from query params or default
onMounted(() => {
  honorAmount.value = parseInt(route.query.honor as string) || 0
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value)
}
</script>
