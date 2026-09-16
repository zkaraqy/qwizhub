<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <div class="row justify-content-center py-2">
      <div class="col-12 col-lg-8 col-xl-7">
        <!-- Back Navigation Button -->
        <NuxtLink to="/projects" class="btn btn-sm btn-white border text-secondary rounded-pill px-3 py-1.5 mb-3 d-inline-flex align-items-center gap-1.5 shadow-xs" style="border-color: #E2E8F0; font-size: 0.8rem;">
          <i class="bi bi-arrow-left"></i>
          <span>Kembali ke Daftar Proyek</span>
        </NuxtLink>

        <!-- Main Form Card -->
        <div class="card border rounded-4 shadow-sm bg-white p-4 p-md-5" style="border-color: #E2E8F0;">
          <div class="mb-4">
            <span class="text-uppercase fw-bold small mb-1 d-block" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.72rem;">
              PROYEK RISET BARU
            </span>
            <h2 class="fw-bold mb-1" style="color: #0E3B43; letter-spacing: -0.02em;">
              Buat Proyek Penelitian
            </h2>
            <p class="text-secondary small mb-0">
              Tentukan topik umum penelitian Anda sebelum menyusun variabel dan indikator kuesioner bersama AI.
            </p>
          </div>

          <div v-if="error" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 small mb-4" role="alert">
            <i class="bi bi-exclamation-circle-fill flex-shrink-0 text-danger"></i>
            <div>{{ error }}</div>
            <button type="button" class="btn-close ms-auto p-2" @click="error = null" aria-label="Close"></button>
          </div>

          <form @submit.prevent="createProject">
            <div class="mb-3">
              <label for="title" class="form-label fw-semibold text-dark small">
                Judul Proyek Penelitian <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control rounded-3 py-2 px-3"
                id="title"
                v-model="form.title"
                required
                maxlength="200"
                placeholder="Contoh: Pengaruh Beban Kerja Terhadap Burnout Guru SMK"
                style="border-color: #E2E8F0;"
              />
              <div class="form-text text-muted" style="font-size: 0.75rem;">
                Maksimal 200 karakter. Anda dapat mengubah judul ini kapan saja nanti.
              </div>
            </div>

            <div class="mb-4">
              <label for="description" class="form-label fw-semibold text-dark small">
                Deskripsi / Latar Belakang (Opsional)
              </label>
              <textarea
                class="form-control rounded-3 p-3"
                id="description"
                v-model="form.description"
                rows="4"
                placeholder="Jelaskan secara singkat tujuan atau konteks riset ini untuk membantu pemahaman tim atau AI..."
                style="border-color: #E2E8F0;"
              ></textarea>
            </div>

            <div class="d-flex align-items-center gap-2 pt-2 border-top" style="border-color: #F0F4F4;">
              <button 
                type="submit" 
                class="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" 
                style="background-color: #0E3B43;"
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-check2-circle"></i>
                <span>{{ submitting ? 'Menyimpan...' : 'Simpan & Lanjutkan' }}</span>
              </button>
              <NuxtLink to="/projects" class="btn btn-outline-secondary px-3 py-2 rounded-3">
                Batal
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
const router = useRouter()
const { data: session, signOut } = useAuth()

const userProfile = computed(() => {
  if (!session.value?.user) return null
  return {
    id: session.value.user.id,
    name: session.value.user.name || '',
    email: session.value.user.email || '',
    image: session.value.user.image,
    role: session.value.user.role
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const form = ref({
  title: '',
  description: ''
})

const submitting = ref(false)
const error = ref<string | null>(null)

async function createProject() {
  if (!form.value.title.trim()) {
    error.value = 'Judul proyek tidak boleh kosong'
    return
  }

  submitting.value = true
  error.value = null

  try {
    const response = await $fetch('/api/projects', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description
      }
    })

    // Redirect to questionnaire generation
    router.push(`/projects/manage/${response.project.id}`)
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Gagal membuat proyek'
    submitting.value = false
  }
}
</script>
