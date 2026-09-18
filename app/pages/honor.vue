<template>
  <LayoutPrivateLayout :user="userProfile" active-item="honor" @logout="handleSignOut">
    <!-- Hero Section - Flat SaaS Header -->
    <div class="hero-section-clean fade-in mb-4">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="text-uppercase fw-bold small" style="color: var(--qh-accent); letter-spacing: 0.08em; font-size: 0.72rem;">
          PENCAIRAN HONOR
        </span>
      </div>
      <h2 class="fw-bold mb-1" style="color: var(--qh-primary); letter-spacing: -0.02em;">
        Pencairan Honor 💰
      </h2>
      <p class="text-secondary small mb-0">
        Cairkan honor yang Anda dapatkan dari mengisi kuesioner ke akun GoPay Anda.
      </p>
    </div>

    <!-- Stat Cards -->
    <div class="row g-3 mb-4">
      <div class="col-lg-4 col-md-6 fade-in stagger-1">
        <div class="stat-card p-3">
          <div class="stat-icon success mb-2">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Saldo Tersedia</div>
          <h3 class="fw-bold mb-0" style="color: var(--qh-success);">Rp {{ formatCurrency(balance.availableBalance) }}</h3>
          <div class="stat-footnote text-muted mt-1">
            <small>Dapat dicairkan</small>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 fade-in stagger-2">
        <div class="stat-card p-3">
          <div class="stat-icon teal mb-2">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Total Diterima</div>
          <h3 class="fw-bold mb-0 text-teal">Rp {{ formatCurrency(balance.totalEarned) }}</h3>
          <div class="stat-footnote text-muted mt-1">
            <small>Akumulasi seluruh honor</small>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 fade-in stagger-3">
        <div class="stat-card p-3">
          <div class="stat-icon warning mb-2">
            <i class="bi bi-arrow-up-circle"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Total Dicairkan</div>
          <h3 class="fw-bold mb-0" style="color: var(--qh-warning);">Rp {{ formatCurrency(balance.totalWithdrawn) }}</h3>
          <div class="stat-footnote text-muted mt-1">
            <small>Sudah dibayar</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Alert -->
    <div v-if="hasPending" class="alert alert-warning d-flex align-items-center justify-content-between mb-4 rounded-3">
      <div>
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Pengajuan Sedang Diproses</strong>
        <p class="mb-0 mt-1">Anda memiliki pengajuan pencairan sebesar <strong>Rp {{ formatCurrency(balance.pendingAmount) }}</strong> yang sedang diproses.</p>
      </div>
      <button @click="handleCancelPending" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="bi bi-x-circle me-1"></i>Batal
      </button>
    </div>

    <!-- Form Ajukan Pencairan -->
    <div v-if="!hasPending" class="card border rounded-4 shadow-sm bg-white overflow-hidden mb-4 fade-in stagger-2" style="border-color: var(--qh-border);">
      <div class="card-header bg-white border-bottom d-flex align-items-center p-3.5 p-md-4" style="border-color: var(--qh-border);">
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-send-fill me-2" style="color: var(--qh-accent);"></i>Ajukan Pencairan Honor
        </h5>
      </div>
      <div class="card-body p-4">
        <div v-if="!userPhone" class="alert alert-danger rounded-3">
          <i class="bi bi-exclamation-circle me-2"></i>
          Nomor telepon (GoPay) belum terdaftar. Silakan lengkapi profil Anda di halaman 
          <NuxtLink to="/profile" class="alert-link">Profil</NuxtLink> terlebih dahulu.
        </div>
        <form v-else @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label fw-semibold">Metode Pembayaran</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-phone"></i></span>
              <input type="text" class="form-control" :value="`GoPay - ${userPhone}`" readonly>
            </div>
            <small class="text-muted">Pencairan akan dikirim ke nomor GoPay yang terdaftar</small>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Jumlah Pencairan</label>
            <div class="input-group">
              <span class="input-group-text">Rp</span>
              <input v-model.number="withdrawalForm.amount" type="number" class="form-control" 
                :min="50000" :max="balance.availableBalance" placeholder="Minimal 50.000" required>
            </div>
            <small class="text-muted">Minimal Rp 50.000 | Maksimal Rp {{ formatCurrency(balance.availableBalance) }}</small>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Catatan (Opsional)</label>
            <textarea v-model="withdrawalForm.notes" class="form-control" rows="3" 
              placeholder="Tambahkan catatan jika diperlukan..."></textarea>
          </div>
          <div class="d-flex gap-2">
            <button type="button" @click="handleBack" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i>Kembali
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!canSubmit || submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-send-fill me-1"></i>
              {{ submitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Riwayat Pengajuan -->
    <div class="card border rounded-4 shadow-sm bg-white overflow-hidden fade-in stagger-3" style="border-color: var(--qh-border);">
      <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-3.5 p-md-4" style="border-color: var(--qh-border);">
        <div>
          <h5 class="fw-bold mb-1 text-dark">
            <i class="bi bi-clock-history me-2" style="color: var(--qh-accent);"></i>Riwayat Pengajuan
          </h5>
          <p class="text-muted small mb-0">Histori seluruh pengajuan pencairan honor Anda</p>
        </div>
        <span v-if="withdrawals.length > 0" class="badge rounded-pill px-2.5 py-1 fw-medium" style="background-color: var(--qh-accent-light); color: var(--qh-accent); font-size: 0.75rem;">
          {{ withdrawals.length }} pengajuan
        </span>
      </div>
      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary spinner-border-sm me-2"></div>
          Memuat riwayat pengajuan...
        </div>

        <!-- Empty State -->
        <div v-else-if="withdrawals.length === 0" class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
          <h6 class="fw-bold text-dark">Belum ada riwayat pengajuan</h6>
          <p class="text-muted small mb-0">Pengajuan pencairan honor Anda akan tampil di sini.</p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Jumlah</th>
                <th>No. GoPay</th>
                <th>Status</th>
                <th>Dibayar</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in withdrawals" :key="w.id">
                <td><small class="text-muted">{{ formatDateTime(w.createdAt) }}</small></td>
                <td>
                  <span class="badge rounded-pill px-2.5 py-1 fw-medium" style="background-color: var(--qh-accent-light); color: var(--qh-accent);">
                    Rp {{ formatCurrency(w.amount) }}
                  </span>
                </td>
                <td><small class="text-muted">{{ w.phoneNumber }}</small></td>
                <td>
                  <span v-if="w.status === 'sent'" class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                    <i class="bi bi-clock-fill me-1"></i>Terkirim
                  </span>
                  <span v-else class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle-fill me-1"></i>Dibayar
                  </span>
                </td>
                <td><small class="text-muted">{{ w.processedAt ? formatDate(w.processedAt) : '-' }}</small></td>
                <td class="text-end pe-4">
                  <button v-if="w.status === 'sent'" @click="handleCancel(w.id)" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                    <i class="bi bi-x-circle me-1"></i>Batal
                  </button>
                  <span v-else class="text-success"><i class="bi bi-check-circle-fill"></i></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>


<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  middleware: async () => {
    const { data } = useAuth()
    if ((data.value?.user as any)?.role !== 'responden') {
      return navigateTo('/dashboard')
    }
  }
})

const { data, signOut } = useAuth()
const router = useRouter()

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

const balance = ref({
  availableBalance: 0,
  totalEarned: 0,
  totalWithdrawn: 0,
  pendingAmount: 0
})
const withdrawals = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const userPhone = ref('')

const withdrawalForm = ref({
  amount: 50000,
  notes: ''
})

const hasPending = computed(() => balance.value.pendingAmount > 0)
const canSubmit = computed(() => {
  return withdrawalForm.value.amount >= 50000 &&
         withdrawalForm.value.amount <= balance.value.availableBalance &&
         userPhone.value !== ''
})

async function loadData() {
  loading.value = true
  try {
    const balanceRes = await $fetch('/api/honor/balance')
    if (balanceRes.success) {
      balance.value = balanceRes.data
    }

    const withdrawalsRes = await $fetch('/api/honor/withdrawals')
    if (withdrawalsRes.success) {
      withdrawals.value = withdrawalsRes.data
    }

    const profileRes = await $fetch('/api/profile')
    if (profileRes.success && profileRes.profile) {
      userPhone.value = profileRes.profile.phoneNumber || ''
    }
  } catch (error: any) {
    console.error('Failed to load data:', error)
    Swal.fire('Error', 'Gagal memuat data', 'error')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const confirm = await Swal.fire({
    title: 'Konfirmasi Pengajuan',
    html: `Anda akan mengajukan pencairan sebesar:<br><strong class="fs-4">Rp ${formatCurrency(withdrawalForm.value.amount)}</strong><br><small class="text-muted">Ke nomor GoPay: ${userPhone.value}</small>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Kirim',
    cancelButtonText: 'Batal'
  })

  if (!confirm.isConfirmed) return

  submitting.value = true
  try {
    const res = await $fetch('/api/honor/withdrawals', {
      method: 'POST',
      body: {
        amount: withdrawalForm.value.amount,
        notes: withdrawalForm.value.notes
      }
    })

    if (res.success) {
      await Swal.fire('Berhasil!', 'Pengajuan pencairan honor berhasil dikirim', 'success')
      withdrawalForm.value = { amount: 50000, notes: '' }
      await loadData()
    }
  } catch (error: any) {
    Swal.fire('Gagal', error.data?.statusMessage || 'Gagal mengirim pengajuan', 'error')
  } finally {
    submitting.value = false
  }
}

async function handleCancel(id: string) {
  const confirm = await Swal.fire({
    title: 'Batalkan Pengajuan?',
    text: 'Pengajuan akan dihapus dan Anda bisa mengajukan lagi',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Tidak'
  })

  if (!confirm.isConfirmed) return

  try {
    await $fetch(`/api/honor/withdrawals/${id}`, { method: 'DELETE' })
    await Swal.fire('Berhasil', 'Pengajuan berhasil dibatalkan', 'success')
    await loadData()
  } catch (error: any) {
    Swal.fire('Gagal', error.data?.statusMessage || 'Gagal membatalkan pengajuan', 'error')
  }
}

async function handleCancelPending() {
  const pending = withdrawals.value.find(w => w.status === 'sent')
  if (pending) {
    await handleCancel(pending.id)
  }
}

function handleBack() {
  router.push('/dashboard')
}

function handleSignOut() {
  signOut({ callbackUrl: '/login' })
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID').format(amount || 0)
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hero-section-clean {
  padding: 0.25rem 0 0.5rem 0;
}

.stat-card {
  background: var(--qh-surface, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--qh-border, #E4E9E7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 49, 83, 0.06);
  border-color: rgba(42, 127, 121, 0.3);
}

.stat-sublabel {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: var(--qh-text-secondary, #66727C);
}

.stat-footnote {
  font-size: 0.75rem;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.success { background: rgba(33, 138, 97, 0.12); color: var(--qh-success, #218A61); }
.stat-icon.teal { background: var(--qh-accent-light, #EAF5F3); color: var(--qh-accent, #2A7F79); }
.stat-icon.warning { background: rgba(200, 138, 40, 0.12); color: var(--qh-warning, #C88A28); }

.text-teal { color: var(--qh-accent, #2A7F79) !important; }

.table-responsive {
  min-height: 120px;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 575.98px) {
  .stat-card {
    text-align: center;
  }
  .stat-icon {
    width: 52px;
    height: 52px;
    font-size: 1.6rem;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
