<template>
  <LayoutPrivateLayout :user="userProfile" active-item="honor" @logout="handleSignOut">
    <div class="hero-section fade-in mb-4">
      <div class="position-relative d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 class="display-6 fw-bold mb-2">Pencairan Honor 💰</h1>
          <p class="lead mb-0 text-white opacity-90">Cairkan honor yang Anda dapatkan ke akun GoPay Anda</p>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Saldo Tersedia</h6>
            <div class="stat-icon success"><i class="bi bi-wallet2"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">Rp {{ formatCurrency(balance.availableBalance) }}</h2>
          <small class="text-muted">Dapat dicairkan</small>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Total Diterima</h6>
            <div class="stat-icon info"><i class="bi bi-cash-stack"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">Rp {{ formatCurrency(balance.totalEarned) }}</h2>
          <small class="text-muted">Total honor</small>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Total Dicairkan</h6>
            <div class="stat-icon warning"><i class="bi bi-arrow-up-circle"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">Rp {{ formatCurrency(balance.totalWithdrawn) }}</h2>
          <small class="text-muted">Sudah dibayar</small>
        </div>
      </div>
    </div>

    <div v-if="hasPending" class="alert alert-warning d-flex align-items-center justify-content-between mb-4">
      <div>
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Pengajuan Sedang Diproses</strong>
        <p class="mb-0 mt-1">Anda memiliki pengajuan pencairan sebesar <strong>Rp {{ formatCurrency(balance.pendingAmount) }}</strong> yang sedang diproses.</p>
      </div>
      <button @click="handleCancelPending" class="btn btn-outline-danger btn-sm">
        <i class="bi bi-x-circle me-1"></i>Batal
      </button>
    </div>

    <div v-if="!hasPending" class="card shadow-sm mb-4">
      <div class="card-body p-4">
        <h4 class="card-title mb-3"><i class="bi bi-send-fill me-2"></i>Ajukan Pencairan Honor</h4>
        <div v-if="!userPhone" class="alert alert-danger">
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


    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="card-title mb-4"><i class="bi bi-clock-history me-2"></i>Riwayat Pengajuan</h4>
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="withdrawals.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="text-muted mt-3">Belum ada riwayat pengajuan pencairan</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jumlah</th>
                <th>No. GoPay</th>
                <th>Status</th>
                <th>Dibayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in withdrawals" :key="w.id">
                <td>{{ formatDateTime(w.createdAt) }}</td>
                <td class="fw-semibold">Rp {{ formatCurrency(w.amount) }}</td>
                <td>{{ w.phoneNumber }}</td>
                <td>
                  <span class="badge" :class="statusBadgeClass(w.status)">
                    <i :class="statusIcon(w.status)" class="me-1"></i>
                    {{ statusText(w.status) }}
                  </span>
                </td>
                <td>{{ w.processedAt ? formatDate(w.processedAt) : '-' }}</td>
                <td>
                  <button v-if="w.status === 'sent'" @click="handleCancel(w.id)" class="btn btn-sm btn-outline-danger">
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
const statusBadgeClass = (status: string) => status === 'sent' ? 'bg-warning' : 'bg-success'
const statusIcon = (status: string) => status === 'sent' ? 'bi bi-clock-fill' : 'bi bi-check-circle-fill'
const statusText = (status: string) => status === 'sent' ? 'Terkirim' : 'Dibayar'

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #0E3B43 0%, #17a2b8 100%);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.stat-icon.success { background: rgba(40, 167, 69, 0.12); color: #28a745; }
.stat-icon.info { background: rgba(23, 162, 184, 0.12); color: #17a2b8; }
.stat-icon.warning { background: rgba(253, 126, 20, 0.12); color: #fd7e14; }

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

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
</style>
