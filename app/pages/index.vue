<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <NuxtLink to="/" class="navbar-brand fw-bold text-primary">
          <span class="fs-4">QwizHub</span>
        </NuxtLink>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li v-if="!data" class="nav-item me-2">
              <NuxtLink to="/login" class="btn btn-outline-primary">Login</NuxtLink>
            </li>
            <li v-if="!data" class="nav-item">
              <NuxtLink to="/register" class="btn btn-primary">Get Started</NuxtLink>
            </li>
            
            <template v-if="data">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                  <img v-if="data?.user?.image" :src="data.user.image" class="rounded-circle me-2" width="32" height="32" alt="Profile">
                  <span v-else class="badge bg-secondary rounded-circle me-2" style="width: 32px; height: 32px; line-height: 32px;">{{ data?.user?.name?.charAt(0) || 'U' }}</span>
                  <span>{{ data?.user?.name }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><NuxtLink to="/dashboard" class="dropdown-item">Dashboard</NuxtLink></li>
                  <li><NuxtLink to="/profile" class="dropdown-item">Profile</NuxtLink></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleSignOut">Logout</a></li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section py-5 bg-light">
      <div class="container py-5">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <h1 class="display-4 fw-bold mb-4">Create & Share Surveys with Ease</h1>
            <p class="lead text-muted mb-4">
              QwizHub is your all-in-one platform for creating surveys, collecting responses, and gaining valuable insights from your audience.
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <NuxtLink v-if="!data" to="/register" class="btn btn-primary btn-lg px-4">Get Started Free</NuxtLink>
              <NuxtLink v-else to="/dashboard" class="btn btn-primary btn-lg px-4">Go to Dashboard</NuxtLink>
              <NuxtLink v-if="!data" to="/login" class="btn btn-outline-secondary btn-lg px-4">Login</NuxtLink>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" class="img-fluid" style="max-width: 450px;">
                <rect fill="#e3f2fd" width="500" height="400" rx="20"/>
                <rect fill="#2196f3" x="50" y="80" width="400" height="240" rx="10"/>
                <circle fill="#fff" cx="120" cy="150" r="15"/>
                <rect fill="#fff" x="150" y="140" width="250" height="20" rx="5"/>
                <circle fill="#fff" cx="120" cy="200" r="15"/>
                <rect fill="#fff" x="150" y="190" width="200" height="20" rx="5"/>
                <circle fill="#fff" cx="120" cy="250" r="15"/>
                <rect fill="#fff" x="150" y="240" width="280" height="20" rx="5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container py-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-3">Why Choose QwizHub?</h2>
          <p class="text-muted">Everything you need to create professional surveys</p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#2196f3" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                </div>
                <h5 class="card-title fw-bold">Easy to Use</h5>
                <p class="card-text text-muted">Create surveys in minutes with our intuitive drag-and-drop interface</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#4caf50" viewBox="0 0 16 16">
                    <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z"/>
                  </svg>
                </div>
                <h5 class="card-title fw-bold">Real-time Analytics</h5>
                <p class="card-text text-muted">Get instant insights with powerful analytics and visualization tools</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <div class="feature-icon bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ff9800" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                    <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                  </svg>
                </div>
                <h5 class="card-title fw-bold">Engage Your Audience</h5>
                <p class="card-text text-muted">Reach respondents and researchers with our community platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="!data" class="cta-section py-5 bg-primary text-white">
      <div class="container text-center py-5">
        <h2 class="fw-bold mb-3">Ready to Get Started?</h2>
        <p class="lead mb-4">Join thousands of researchers and respondents on QwizHub today!</p>
        <NuxtLink to="/register" class="btn btn-light btn-lg px-5">Create Free Account</NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h5 class="fw-bold mb-3">QwizHub</h5>
            <p class="text-muted">Your trusted survey and research platform</p>
          </div>
          <div class="col-md-6 text-md-end">
            <p class="text-muted mb-0">&copy; 2026 QwizHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, status, signOut } = useAuth()
const router = useRouter()

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}
</script>

<style scoped>
.hero-section {
  min-height: 500px;
  display: flex;
  align-items: center;
}

.feature-icon {
  transition: transform 0.3s ease;
}

.card:hover .feature-icon {
  transform: scale(1.1);
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>

