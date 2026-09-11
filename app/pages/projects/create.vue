<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h1 class="mb-4">Buat Proyek Penelitian Baru</h1>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <form @submit.prevent="createProject">
          <div class="mb-3">
            <label for="title" class="form-label">Judul Proyek *</label>
            <input
              type="text"
              class="form-control"
              id="title"
              v-model="form.title"
              required
              maxlength="200"
              placeholder="Masukkan judul proyek penelitian"
            />
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Deskripsi</label>
            <textarea
              class="form-control"
              id="description"
              v-model="form.description"
              rows="4"
              placeholder="Jelaskan secara singkat tentang proyek penelitian ini"
            ></textarea>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Membuat...' : 'Buat Proyek' }}
            </button>
            <NuxtLink to="/projects" class="btn btn-outline-secondary">
              Batal
            </NuxtLink>
          </div>
        </form>
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
