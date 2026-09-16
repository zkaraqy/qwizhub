<template>
  <LayoutPrivateLayout :user="userProfile" active-item="profile" @logout="handleSignOut">
    <!-- Page Header - Standardized SaaS Header -->
    <div class="hero-section-clean mb-4 fade-in">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="text-uppercase fw-bold small" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.72rem;">
          PENGATURAN AKUN
        </span>
      </div>
      <h2 class="fw-bold mb-1" style="color: #0E3B43; letter-spacing: -0.02em;">Profil Pengguna</h2>
      <p class="text-secondary small mb-0">Kelola informasi data pribadi, preferensi akun, dan status verifikasi Anda.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <UiBaseSpinner centered size="lg" />
      <p class="mt-3 text-muted">Memuat profil...</p>
    </div>

    <!-- Error Alert -->
    <UiBaseAlert v-else-if="errorMessage" type="error" :message="errorMessage" dismissible v-model="showError" />

    <!-- Profile Content -->
    <div v-else-if="profile" class="row">
      <!-- Success Alert -->
      <div v-if="successMessage" class="col-12 mb-3">
        <UiBaseAlert type="success" :message="successMessage" dismissible v-model="showSuccess" />
      </div>

      <!-- Sidebar -->
      <div class="col-lg-3 mb-4">
        <!-- Profile Card -->
        <div class="card border rounded-4 shadow-sm mb-3 bg-white overflow-hidden" style="border-color: #E2E8F0;">
          <div class="card-body text-center p-4">
            <div class="mb-3 d-flex justify-content-center">
              <img 
                v-if="profile?.user?.image" 
                :src="profile?.user?.image" 
                class="rounded-circle shadow-sm" 
                width="68" 
                height="68" 
                alt="Profile"
                style="object-fit: cover; border: 2px solid #E2E8F0;"
              >
              <div
                v-else
                class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style="width: 68px; height: 68px; font-size: 1.6rem; background: linear-gradient(135deg, #0E3B43 0%, #137A7F 100%);"
              >
                {{ (profile?.user?.name || 'U').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h5 class="fw-bold text-dark mb-1" style="letter-spacing: -0.01em;">{{ profile?.user?.name }}</h5>
            <p class="text-muted small mb-2">{{ profile?.user?.email }}</p>
            <div class="d-flex justify-content-center gap-2 flex-wrap mb-2">
              <span class="badge rounded-pill px-2.5 py-1" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.72rem;">
                {{ profile?.user?.role === 'peneliti' ? 'Peneliti' : 'Responden' }}
              </span>
            </div>
            <div>
              <span
                class="badge rounded-pill px-3 py-1.5 fw-semibold"
                :style="profile?.user?.verificationStatus === 'verified' ? 'background-color: #DEF7EC; color: #0E9F6E; border: 1px solid rgba(14, 159, 110, 0.25);' : 'background-color: #FEF3C7; color: #D97706; border: 1px solid rgba(217, 119, 6, 0.25);'"
              >
                {{ profile?.user?.verificationStatus === 'verified' ? '✓ Terverifikasi' : '⚠ Menunggu Verifikasi' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="card border rounded-4 shadow-sm bg-white p-2" style="border-color: #E2E8F0;">
          <a href="#" class="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none fw-semibold small" style="background-color: #EBF5F3; color: #137A7F;">
            <i class="bi bi-person-fill"></i>
            <span>Informasi Akun</span>
          </a>
          <NuxtLink to="/dashboard" class="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none text-secondary small nav-hover mt-1">
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="col-lg-9">
        <!-- Basic Information Card -->
        <div class="card border rounded-4 shadow-sm mb-4 bg-white overflow-hidden" style="border-color: #E2E8F0;">
          <div class="card-header bg-white border-bottom p-3.5 p-md-4" style="border-color: #E2E8F0;">
            <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i class="bi bi-person-circle" style="color: #137A7F;"></i>
              <span>Informasi Utama</span>
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="name" class="form-label fw-semibold text-dark small">Nama Lengkap</label>
                <input id="name" v-model="formData.name" type="text" class="form-control rounded-3 py-2" placeholder="Nama lengkap Anda" style="border-color: #E2E8F0;" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold text-dark small">Alamat Email</label>
                <input :value="profile.user.email" type="email" class="form-control rounded-3 py-2 bg-light" disabled style="border-color: #E2E8F0;" />
                <div class="form-text text-muted" style="font-size: 0.75rem;">Email tertaut tidak dapat diubah langsung</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold text-dark small">Tipe Akun (Role)</label>
                <input :value="profile.user.role === 'peneliti' ? 'Peneliti (Researcher)' : 'Responden (Survey Participant)'" type="text" class="form-control rounded-3 py-2 bg-light" disabled style="border-color: #E2E8F0;" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold text-dark small">Status Verifikasi</label>
                <div class="pt-1">
                  <span
                    class="badge rounded-pill px-3 py-2 fw-semibold"
                    :style="profile.user.verificationStatus === 'verified' ? 'background-color: #DEF7EC; color: #0E9F6E;' : 'background-color: #FEF3C7; color: #D97706;'"
                  >
                    {{ profile.user.verificationStatus === 'verified' ? '✓ Terverifikasi' : '⚠ Menunggu Verifikasi' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Demographic Profile Card (only for responden) -->
        <div v-if="profile?.user?.role === 'responden'" class="card border rounded-4 shadow-sm mb-4 bg-white overflow-hidden" style="border-color: #E2E8F0;">
          <div class="card-header bg-white border-bottom p-3.5 p-md-4" style="border-color: #E2E8F0;">
            <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i class="bi bi-clipboard-data" style="color: #137A7F;"></i>
              <span>Profil Demografi Responden</span>
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="alert alert-light border d-flex align-items-center gap-2 mb-4 p-3 rounded-3" style="background-color: #EBF5F3; border-color: rgba(19, 122, 127, 0.25) !important;">
              <i class="bi bi-info-circle-fill flex-shrink-0" style="color: #137A7F;"></i>
              <div class="small" style="color: #0E3B43;">Lengkapi profil demografi Anda untuk mendapatkan status terverifikasi dan menerima rekomendasi survei berbayar yang relevan.</div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label for="dateOfBirth" class="form-label fw-semibold text-dark small">Tanggal Lahir <span class="text-danger">*</span></label>
                <input id="dateOfBirth" v-model="formData.profile.dateOfBirth" type="date" class="form-control rounded-3 py-2" style="border-color: #E2E8F0;" />
              </div>

              <div class="col-md-6">
                <label for="gender" class="form-label fw-semibold text-dark small">Jenis Kelamin <span class="text-danger">*</span></label>
                <select id="gender" v-model="formData.profile.gender" class="form-select rounded-3 py-2" style="border-color: #E2E8F0;">
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="profession" class="form-label fw-semibold text-dark small">Profesi / Pekerjaan <span class="text-danger">*</span></label>
                <input id="profession" v-model="formData.profile.profession" type="text" class="form-control rounded-3 py-2"
                  placeholder="Contoh: Mahasiswa, Dosen, Guru, Karyawan" style="border-color: #E2E8F0;" />
              </div>

              <div class="col-md-6">
                <label for="phoneNumber" class="form-label fw-semibold text-dark small">Nomor Telepon / WhatsApp</label>
                <input id="phoneNumber" v-model="formData.profile.phoneNumber" type="tel" class="form-control rounded-3 py-2"
                  placeholder="Contoh: 08123456789" style="border-color: #E2E8F0;" />
              </div>

              <div class="col-md-6">
                <label for="specialization" class="form-label">Specialization / Field of Expertise <span class="text-danger">*</span></label>
                <select id="specialization" v-model="formData.profile.specialization" class="form-select">
                  <option value="">Select your specialization</option>
                  <option v-for="spec in SPECIALIZATIONS" :key="spec.value" :value="spec.value">
                    {{ spec.label }}
                  </option>
                </select>
                <small class="text-muted d-block mt-1">Required for account verification</small>
              </div>

              <div class="col-md-6">
                <label for="city" class="form-label">City <span class="text-danger">*</span></label>
                <input id="city" v-model="formData.profile.city" type="text" class="form-control"
                  placeholder="e.g., Jakarta" />
                <label for="city" class="form-label fw-semibold text-dark small">Kota / Kabupaten <span class="text-danger">*</span></label>
                <input id="city" v-model="formData.profile.city" type="text" class="form-control rounded-3 py-2"
                  placeholder="Contoh: Jakarta Selatan" style="border-color: #E2E8F0;" />
              </div>

              <div class="col-md-6">
                <label for="province" class="form-label fw-semibold text-dark small">Provinsi <span class="text-danger">*</span></label>
                <input id="province" v-model="formData.profile.province" type="text" class="form-control rounded-3 py-2"
                  placeholder="Contoh: DKI Jakarta" style="border-color: #E2E8F0;" />
              </div>

              <div class="col-12">
                <label for="educationLevel" class="form-label fw-semibold text-dark small">Tingkat Pendidikan Terakhir <span
                    class="text-danger">*</span></label>
                <select id="educationLevel" v-model="formData.profile.educationLevel" class="form-select rounded-3 py-2" style="border-color: #E2E8F0;">
                  <option value="">Pilih Tingkat Pendidikan</option>
                  <option value="sd">SD (Sekolah Dasar)</option>
                  <option value="smp">SMP (Sekolah Menengah Pertama)</option>
                  <option value="sma">SMA / SMK (Sekolah Menengah Atas)</option>
                  <option value="d3">D3 (Diploma)</option>
                  <option value="s1">S1 (Sarjana)</option>
                  <option value="s2">S2 (Magister)</option>
                  <option value="s3">S3 (Doktoral)</option>
                </select>
              </div>
            </div>

            <div class="mt-3">
              <small class="text-muted"><span class="text-danger">*</span> Bidang wajib diisi untuk verifikasi akun responden.</small>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex gap-2 flex-wrap">
          <button @click="handleUpdate" class="btn text-white px-4 py-2.5 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #0E3B43;" :disabled="updating">
            <span v-if="updating" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-check2-circle"></i>
            <span>{{ updating ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
          <NuxtLink to="/dashboard" class="btn btn-outline-secondary px-4 py-2.5 rounded-3">Kembali ke Dashboard</NuxtLink>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
import { SPECIALIZATIONS } from '~/constants/specializations'

definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: '/login'
  },
})

const { signOut, refresh, data: authData } = useAuth()

const profile = ref<any>(null)
const loading = ref(true)
const updating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showError = ref(true)
const showSuccess = ref(true)

// Computed user profile for navbar
const userProfile = computed(() => {
  if (!profile.value?.user) return null
  return {
    id: profile.value.user.id,
    name: profile.value.user.name || '',
    email: profile.value.user.email || '',
    image: profile.value.user.image,
    role: profile.value.user.role
  }
})

// Watch for error/success message changes to show alerts
watch(errorMessage, (val) => {
  if (val) showError.value = true
})

watch(successMessage, (val) => {
  if (val) showSuccess.value = true
})

const formData = ref({
  name: '',
  profile: {
    dateOfBirth: '',
    gender: '',
    profession: '',
    city: '',
    province: '',
    educationLevel: '',
    phoneNumber: '',
    specialization: ''
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

onMounted(async () => {
  try {
    const response = await $fetch('/api/profile', {
      method: 'GET'
    })

    profile.value = response

    // Populate form data
    formData.value.name = response.user.name || ''

    if (response.profile) {
      formData.value.profile = {
        dateOfBirth: response.profile.dateOfBirth || '',
        gender: response.profile.gender || '',
        profession: response.profile.profession || '',
        city: response.profile.city || '',
        province: response.profile.province || '',
        educationLevel: response.profile.educationLevel || '',
        phoneNumber: response.profile.phoneNumber || '',
        specialization: response.profile.specialization || ''
      }
    }
  } catch (error: any) {
    console.error('Load profile error:', error)
    errorMessage.value = error.data?.statusMessage || 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

const handleUpdate = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  updating.value = true

  try {
    const response = await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        name: formData.value.name,
        profile: profile.value.user.role === 'responden' ? formData.value.profile : undefined
      }
    })

    // Update local profile
    profile.value.user = response.user
    const { refresh } = useAuth()
    if (response.profile) {
      profile.value.profile = response.profile
    }

    successMessage.value = 'Profile updated successfully!'

    if (response.user.verificationStatus === 'verified') {
      successMessage.value += ' Your profile is now verified!'
    }

    // Refresh auth state to reflect verification status
    await refresh()
    // Update the auth data so other pages (e.g., dashboard) see the new verification status
    if (authData && authData.value && authData.value.user) {
      authData.value.user = response.user
    }
    // Navigate to dashboard (will re‑evaluate auth data)
    await navigateTo('/dashboard')
  } catch (error: any) {
    console.error('Update profile error:', error)
    errorMessage.value = error.data?.statusMessage || 'Failed to update profile'
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
.hero-section-clean {
  padding: 0.25rem 0 0.5rem 0;
}

.nav-hover {
  transition: all 0.18s ease;
}

.nav-hover:hover {
  background-color: #F8FAFA;
  color: #0E3B43 !important;
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(14, 59, 67, 0.05) !important;
}
</style>
