<template>
      <div class="hero-section fade-in mb-4">
      <div class="position-relative d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 class="display-6 fw-bold mb-2">Admin Panel</h1>
          <p class="lead mb-0 text-white opacity-90">Kelola pengajuan pencairan honor responden</p>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Pending</h6>
            <div class="stat-icon warning"><i class="bi bi-clock-history"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">{{ stats.pending }}</h2>
          <small class="text-muted">Menunggu proses</small>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Dibayar Hari Ini</h6>
            <div class="stat-icon success"><i class="bi bi-check-circle"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">{{ stats.paidToday }}</h2>
          <small class="text-muted">Transaksi hari ini</small>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Total Pending</h6>
            <div class="stat-icon info"><i class="bi bi-cash-stack"></i></div>
          </div>
          <h2 class="display-6 fw-bold mb-0">Rp {{ formatCurrency(stats.pendingAmount) }}</h2>
          <small class="text-muted">Total nominal pending</small>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card p-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="text-muted mb-0">Total Dibayar</h6>
            <div class="stat-icon primary"><i class="bi bi-graph-up"></i></div>
          </div>
          <h2 class="display-5 fw-bold mb-0">{{ stats.paid }}</h2>
          <small class="text-muted">Total transaksi paid</small>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="card-title mb-0"><i class="bi bi-list-ul me-2"></i>Daftar Pengajuan Pencairan</h4>
          <div class="d-flex gap-2">
            <select v-model="statusFilter" @change="loadWithdrawals" class="form-select form-select-sm">
              <option value="all">Semua Status</option>
              <option value="sent">Terkirim</option>
              <option value="paid">Dibayar</option>
            </select>
            <button @click="loadWithdrawals" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="withdrawals.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="text-muted mt-3">Tidak ada pengajuan pencairan</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Responden</th>
                <th>No. GoPay</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in withdrawals" :key="w.id">
                <td>{{ formatDateTime(w.createdAt) }}</td>
                <td>
                  <strong>{{ w.respondent?.name }}</strong><br>
                  <small class="text-muted">{{ w.respondent?.email }}</small>
                </td>
                <td>{{ w.phoneNumber }}</td>
                <td class="fw-semibold">Rp {{ formatCurrency(w.amount) }}</td>
                <td>
                  <span class="badge" :class="statusBadgeClass(w.status)">
                    <i :class="statusIcon(w.status)" class="me-1"></i>
                    {{ statusText(w.status) }}
                  </span>
                </td>
                <td>
                  <button v-if="w.status === 'sent'" @click="openDetail(w.id)" class="btn btn-sm btn-primary">
                    <i class="bi bi-eye me-1"></i>Detail
                  </button>
                  <span v-else class="text-muted small">
                    {{ formatDate(w.processedAt) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Detail Pengajuan Pencairan</h5>
            <button type="button" class="btn-close" @click="closeDetail"></button>
          </div>
          <div v-if="selectedWithdrawal" class="modal-body">
            <div class="mb-4">
              <h6 class="fw-bold mb-3">Informasi Responden</h6>
              <table class="table table-sm">
                <tr>
                  <td width="200"><strong>Nama</strong></td>
                  <td>{{ selectedWithdrawal.respondent?.name }}</td>
                </tr>
                <tr>
                  <td><strong>Email</strong></td>
                  <td>{{ selectedWithdrawal.respondent?.email }}</td>
                </tr>
                <tr>
                  <td><strong>Kuesioner Dikerjakan</strong></td>
                  <td>{{ selectedWithdrawal.respondent?.totalQuestionnairesAnswered || 0 }} kuesioner</td>
                </tr>
                <tr>
                  <td><strong>Total Honor Diterima</strong></td>
                  <td>Rp {{ formatCurrency(selectedWithdrawal.respondent?.totalHonorEarned || 0) }}</td>
                </tr>
                <tr>
                  <td><strong>Total Sudah Dicairkan</strong></td>
                  <td>Rp {{ formatCurrency(selectedWithdrawal.respondent?.totalHonorWithdrawn || 0) }}</td>
                </tr>
              </table>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold mb-3">Detail Pencairan</h6>
              <table class="table table-sm">
                <tr>
                  <td width="200"><strong>Jumlah Pencairan</strong></td>
                  <td class="fs-5 fw-bold text-primary">Rp {{ formatCurrency(selectedWithdrawal.amount) }}</td>
                </tr>
                <tr>
                  <td><strong>Nomor GoPay</strong></td>
                  <td>{{ selectedWithdrawal.phoneNumber }}</td>
                </tr>
                <tr>
                  <td><strong>Catatan</strong></td>
                  <td>{{ selectedWithdrawal.notes || '-' }}</td>
                </tr>
                <tr>
                  <td><strong>Tanggal Pengajuan</strong></td>
                  <td>{{ formatDateTime(selectedWithdrawal.createdAt) }}</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetail">Tutup</button>
            <button v-if="selectedWithdrawal?.status === 'sent'" type="button" class="btn btn-success" @click="handlePay" :disabled="processing">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              {{ processing ? 'Memproses...' : 'Tandai Sebagai Dibayar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
</template>


<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  middleware: async () => {
    const { data } = useAuth()
    if ((data.value?.user as any)?.role !== 'admin') {
      return navigateTo('/dashboard')
    }
  }
})

const { data, signOut } = useAuth()

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

const withdrawals = ref<any[]>([])
const loading = ref(false)
const processing = ref(false)
const statusFilter = ref('all')
const showDetailModal = ref(false)
const selectedWithdrawal = ref<any>(null)
const countdown = ref(10)

const stats = ref({
  total: 0,
  pending: 0,
  paid: 0,
  pendingAmount: 0,
  paidToday: 0
})

const POLLING_INTERVAL = 10000
let pollingTimer: NodeJS.Timeout | null = null
let countdownTimer: NodeJS.Timeout | null = null

async function loadWithdrawals() {
  loading.value = true
  try {
    const res = await $fetch(`/api/admin/honor/withdrawals?status=${statusFilter.value}`)
    if (res.success) {
      withdrawals.value = res.data
      stats.value = res.stats
    }
  } catch (error: any) {
    console.error('Failed to load withdrawals:', error)
    Swal.fire('Error', 'Gagal memuat data', 'error')
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  try {
    const res = await $fetch(`/api/admin/honor/withdrawals/${id}`)
    if (res.success) {
      selectedWithdrawal.value = res.data
      showDetailModal.value = true
    }
  } catch (error: any) {
    Swal.fire('Error', 'Gagal memuat detail', 'error')
  }
}

function closeDetail() {
  showDetailModal.value = false
  selectedWithdrawal.value = null
}

async function handlePay() {
  const confirm = await Swal.fire({
    title: 'Konfirmasi Pembayaran',
    html: `Tandai pencairan <strong>Rp ${formatCurrency(selectedWithdrawal.value.amount)}</strong> sebagai dibayar?<br><small class="text-muted">Ke GoPay: ${selectedWithdrawal.value.phoneNumber}</small>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Sudah Dibayar',
    cancelButtonText: 'Batal'
  })

  if (!confirm.isConfirmed) return

  processing.value = true
  try {
    const res = await $fetch(`/api/admin/honor/withdrawals/${selectedWithdrawal.value.id}/pay`, {
      method: 'PUT'
    })

    if (res.success) {
      await Swal.fire('Berhasil!', 'Pencairan telah ditandai sebagai dibayar', 'success')
      closeDetail()
      await loadWithdrawals()
    }
  } catch (error: any) {
    Swal.fire('Gagal', error.data?.statusMessage || 'Gagal memproses pembayaran', 'error')
  } finally {
    processing.value = false
  }
}

function startPolling() {
  pollingTimer = setInterval(() => {
    loadWithdrawals()
    countdown.value = 10
  }, POLLING_INTERVAL)

  countdownTimer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else countdown.value = 10
  }, 1000)
}

function stopPolling() {
  if (pollingTimer) clearInterval(pollingTimer)
  if (countdownTimer) clearInterval(countdownTimer)
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
  loadWithdrawals()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>





<style scoped>
.hero-section {
  background: linear-gradient(135deg, #183153 0%, #10243D 100%);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 18px rgba(24, 49, 83, 0.15);
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--qh-border, #E4E9E7);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 49, 83, 0.08);
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

.stat-icon.primary { background: rgba(24, 49, 83, 0.1); color: #183153; }
.stat-icon.success { background: rgba(33, 138, 97, 0.12); color: #218A61; }
.stat-icon.info { background: #EAF5F3; color: #2A7F79; }
.stat-icon.warning { background: rgba(200, 138, 40, 0.12); color: #C88A28; }

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

