<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand fw-bold">
          <span class="fs-4">QwizHub</span>
        </NuxtLink>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <NuxtLink to="/dashboard" class="nav-link">Dashboard</NuxtLink>
            </li>
            <li v-if="(profile?.user as any)?.role === 'peneliti'" class="nav-item">
              <NuxtLink to="/projects" class="nav-link">My Projects</NuxtLink>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button"
                data-bs-toggle="dropdown">
                <span class="badge bg-light text-primary rounded-circle me-2"
                  style="width: 32px; height: 32px; line-height: 32px;">{{ profile?.user?.name?.charAt(0) || 'U'
                  }}</span>
                <span>{{ profile?.user?.name || 'User' }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <NuxtLink to="/profile" class="dropdown-item active">Profile</NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/" class="dropdown-item">Home</NuxtLink>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleSignOut">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container-fluid py-4 bg-light min-vh-100">
      <div class="container">
        <!-- Page Header -->
        <div class="row mb-4">
          <div class="col-12">
            <h1 class="h3 mb-0">My Profile</h1>
            <p class="text-muted">Manage your account information and preferences</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading profile...</p>
        </div>

        <!-- Error Alert -->
        <div v-else-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <!-- Profile Content -->
        <div v-else-if="profile" class="row">
          <!-- Success Alert -->
          <div v-if="successMessage" class="col-12 mb-3">
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                class="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-3 mb-4">
            <!-- Profile Card -->
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-body text-center">
                <div class="mb-3">
                  <span class="badge bg-primary rounded-circle display-4"
                    style="width: 80px; height: 80px; line-height: 80px;">
                    {{ profile?.user?.name?.charAt(0) || 'U' }}
                  </span>
                </div>
                <h5 class="mb-1">{{ profile?.user?.name }}</h5>
                <p class="text-muted small mb-2">{{ profile?.user?.email }}</p>
                <span
                  :class="['badge', profile?.user?.verificationStatus === 'verified' ? 'bg-success' : 'bg-warning text-dark']">
                  {{ profile?.user?.verificationStatus === 'verified' ? '✓ Verified' : '⚠ Pending Verification' }}
                </span>
              </div>
            </div>

            <!-- Navigation -->
            <div class="list-group">
              <a href="#" class="list-group-item list-group-item-action active">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-person me-2" viewBox="0 0 16 16">
                  <path
                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                </svg>
                Profile
              </a>
              <NuxtLink to="/dashboard" class="list-group-item list-group-item-action">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-house me-2" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                    d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                  <path fill-rule="evenodd"
                    d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
                </svg>
                Dashboard
              </NuxtLink>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="col-lg-9">
            <!-- Basic Information Card -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    class="bi bi-person-circle me-2" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path fill-rule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                  </svg>
                  Basic Information
                </h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="name" class="form-label">Full Name</label>
                    <input id="name" v-model="formData.name" type="text" class="form-control"
                      placeholder="Enter your full name" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email Address</label>
                    <input :value="profile.user.email" type="email" class="form-control" disabled />
                    <div class="form-text">Email cannot be changed</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Account Role</label>
                    <input
                      :value="profile.user.role === 'peneliti' ? 'Peneliti (Researcher)' : 'Responden (Survey Participant)'"
                      type="text" class="form-control" disabled />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Verification Status</label>
                    <span
                      :class="['badge fs-6', profile.user.verificationStatus === 'verified' ? 'bg-success' : 'bg-warning text-dark']">
                      {{ profile.user.verificationStatus === 'verified' ? '✓ Verified' : '⚠ Pending Verification' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Demographic Profile Card (only for responden) -->
            <div v-if="profile?.user?.role === 'responden'" class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    class="bi bi-clipboard-data me-2" viewBox="0 0 16 16">
                    <path
                      d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                    <path
                      d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                  </svg>
                  Demographic Profile
                </h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    class="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
                    <path
                      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                  </svg>
                  <div>Complete your demographic profile to get verified and access paid surveys.</div>
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="dateOfBirth" class="form-label">Date of Birth <span class="text-danger">*</span></label>
                    <input id="dateOfBirth" v-model="formData.profile.dateOfBirth" type="date" class="form-control" />
                  </div>

                  <div class="col-md-6">
                    <label for="gender" class="form-label">Gender <span class="text-danger">*</span></label>
                    <select id="gender" v-model="formData.profile.gender" class="form-select">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label for="profession" class="form-label">Profession <span class="text-danger">*</span></label>
                    <input id="profession" v-model="formData.profile.profession" type="text" class="form-control"
                      placeholder="e.g., Student, Teacher, Engineer" />
                  </div>

                  <div class="col-md-6">
                    <label for="phoneNumber" class="form-label">Phone Number</label>
                    <input id="phoneNumber" v-model="formData.profile.phoneNumber" type="tel" class="form-control"
                      placeholder="e.g., 08123456789" />
                  </div>

                  <div class="col-md-6">
                    <label for="city" class="form-label">City <span class="text-danger">*</span></label>
                    <input id="city" v-model="formData.profile.city" type="text" class="form-control"
                      placeholder="e.g., Jakarta" />
                  </div>

                  <div class="col-md-6">
                    <label for="province" class="form-label">Province <span class="text-danger">*</span></label>
                    <input id="province" v-model="formData.profile.province" type="text" class="form-control"
                      placeholder="e.g., DKI Jakarta" />
                  </div>

                  <div class="col-12">
                    <label for="educationLevel" class="form-label">Education Level <span
                        class="text-danger">*</span></label>
                    <select id="educationLevel" v-model="formData.profile.educationLevel" class="form-select">
                      <option value="">Select education level</option>
                      <option value="sd">SD (Elementary School)</option>
                      <option value="smp">SMP (Junior High School)</option>
                      <option value="sma">SMA (Senior High School)</option>
                      <option value="d3">D3 (Diploma)</option>
                      <option value="s1">S1 (Bachelor's Degree)</option>
                      <option value="s2">S2 (Master's Degree)</option>
                      <option value="s3">S3 (Doctoral Degree)</option>
                    </select>
                  </div>
                </div>

                <div class="mt-3">
                  <small class="text-muted"><span class="text-danger">*</span> Required fields for verification</small>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 flex-wrap">
              <button @click="handleUpdate" class="btn btn-primary btn-lg" :disabled="updating">
                <span v-if="updating" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
              <NuxtLink to="/dashboard" class="btn btn-outline-secondary btn-lg">Back to Dashboard</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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

const formData = ref({
  name: '',
  profile: {
    dateOfBirth: '',
    gender: '',
    profession: '',
    city: '',
    province: '',
    educationLevel: '',
    phoneNumber: ''
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
        phoneNumber: response.profile.phoneNumber || ''
      }
    }
    console.log('Profile loaded:', profile.value)
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
.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.input-group-text.bg-warning {
  background-color: #ffc107 !important;
}
</style>
