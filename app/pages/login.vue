<script setup lang="ts">
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' }
})

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const signInWithProvider = async (provider: string) => {
  error.value = null
  loading.value = true
  try {
    await signIn(provider, { callbackUrl: '/' })
  } catch (err: any) {
    error.value = err?.message ?? 'Sign-in failed'
  } finally {
    loading.value = false
  }
}

const signInWithCredentials = async () => {
  error.value = null
  
  // Validasi input
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }
  
  loading.value = true
  try {
    const result = await signIn('credentials', { 
      email: email.value, 
      password: password.value,
      redirect: false
    })
    
    if (result?.error) {
      error.value = 'Invalid email or password'
    } else {
      // Redirect ke home jika berhasil
      await navigateTo('/')
    }
  } catch (err: any) {
    error.value = err?.message ?? 'Sign-in failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="page">
    <section class="card" role="region" aria-labelledby="signin-heading">
      <header class="card__header">
        <h1 id="signin-heading" class="title">Welcome back</h1>
        <p class="subtitle">Sign in with Google OAuth or credentials</p>
      </header>

      <form class="form" @submit.prevent="signInWithCredentials" aria-describedby="signin-desc">
        <div id="signin-desc" class="sr-only">
          Choose Google or sign in with username and password.
        </div>

        <div class="socials">
          <button type="button" class="btn btn--social" @click="signInWithProvider('google')" :disabled="loading"
            aria-label="Sign in with Google">
            <span>Continue with Google OAuth</span>
          </button>

          <div class="divider" aria-hidden="true">
            <span>or</span>
          </div>
        </div>

        <div class="fields">
          <label class="field">
            <span class="label-text">Email</span>
            <input v-model="email" class="input" type="email" name="email" autocomplete="email" required
              :disabled="loading" placeholder="Enter your email" />
          </label>

          <label class="field">
            <span class="label-text">Password</span>
            <input v-model="password" class="input" type="password" name="password" autocomplete="current-password"
              required :disabled="loading" placeholder="Enter your password" />
          </label>

          <button type="submit" class="btn btn--primary" :aria-busy="loading" :disabled="loading">
            <span v-if="!loading">Sign in</span>
            <span v-else class="loader" aria-hidden="true"></span>
          </button>

          <p v-if="error" class="error" role="alert">{{ error }}</p>
        </div>
      </form>

      <footer class="card__footer">
        <p class="meta">Need an account? <a href="/register">Sign up</a></p>
      </footer>
    </section>
  </main>
</template>

<style>
:root {
  --bg-1: #0b1220;
  --bg-2: #071026;
  --card-bg: rgba(255, 255, 255, 0.03);
  --muted: #9aa4b2;
  --accent-start: #7c3aed;
  --accent-end: #06b6d4;
  --radius: 12px;
  --max-w: 760px;
  /* not full width */
}

/* Layout */
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2) 60%);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #e6eef8;
}

/* Card */
.card {
  width: 100%;
  max-width: var(--max-w);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: 0 8px 24px rgba(2, 6, 23, 0.45);
  /* subtle */
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Header */
.card__header {
  text-align: left;
}

.title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #eef6ff;
}

.subtitle {
  margin-top: 6px;
  font-size: 0.92rem;
  color: var(--muted);
}

/* Socials */
.socials {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .08s ease, box-shadow .12s ease;
  width: 100%;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

.btn--social {
  background: rgba(255, 255, 255, 0.04);
  color: #f8fafc;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.25);
}

.btn--social:hover {
  transform: translateY(-2px);
}

.icon {
  width: 18px;
  height: 18px;
  display: inline-block;
}

/* Divider small */
.divider {
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 2px;
}

/* Fields */
.fields {
  display: grid;
  gap: 12px;
  margin-top: 6px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-text {
  font-size: 0.82rem;
  color: var(--muted);
}

/* Inputs balanced */
.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.045);
  background: rgba(255, 255, 255, 0.02);
  color: #e6eef8;
  outline: none;
  transition: box-shadow .12s ease, transform .08s ease;
}

.input::placeholder {
  color: rgba(230, 238, 248, 0.28);
}

.input:focus {
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.08);
  transform: translateY(-1px);
  border-color: rgba(124, 58, 237, 0.6);
}

/* Primary */
.btn--primary {
  background: linear-gradient(90deg, var(--accent-start), var(--accent-end));
  color: #041022;
  padding: 11px 14px;
  border-radius: 10px;
  box-shadow: 0 8px 22px rgba(7, 9, 25, 0.38);
  justify-content: center;
}

.btn--primary:hover {
  transform: translateY(-2px);
}

/* Loader */
.loader {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.14);
  border-top-color: white;
  animation: spin .9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error & footer */
.error {
  color: #ff6b6b;
  font-size: 0.92rem;
  margin-top: 6px;
}

.card__footer {
  display: flex;
  justify-content: center;
  color: var(--muted);
  font-size: 0.92rem;
}

.card__footer a {
  color: #cfefff;
  text-decoration: underline;
}

/* Small screens */
@media (max-width: 560px) {
  .card {
    padding: 18px;
    border-radius: 10px;
  }

  .title {
    font-size: 1.15rem;
  }
}
</style>
