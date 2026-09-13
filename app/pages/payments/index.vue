<template>
  <LayoutPrivateLayout :user="userProfile" active-item="payments" @logout="handleSignOut">
    <div class="topup-page">

      <!-- Page Header -->
      <div class="page-header mb-4 fade-in">
        <div class="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="header-icon">🤖</span>
              <span class="text-uppercase fw-bold small" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.72rem;">
                AI Tokenisasi
              </span>
            </div>
            <h1 class="page-title mb-1">Top Up Token AI</h1>
            <p class="text-muted mb-0" style="font-size: 0.875rem;">
              Token AI digunakan untuk generate kuisioner, pertanyaan, dan saran cerdas dari AI.
            </p>
          </div>

          <!-- Current Balance Card -->
          <div class="balance-card" :class="{ 'balance-card-low': isLowBalance, 'balance-card-empty': isEmptyBalance }">
            <div class="balance-label">Saldo Token Anda</div>
            <div class="balance-amount">
              <span class="balance-icon">🪙</span>
              <span class="balance-number" :class="{ 'count-up': balanceLoaded }">
                {{ displayBalance }}
              </span>
              <span class="balance-unit">token</span>
            </div>
            <div v-if="isEmptyBalance" class="balance-warning">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>Saldo habis — pilih paket di bawah
            </div>
            <div v-else-if="isLowBalance" class="balance-warning">
              <i class="bi bi-exclamation-circle me-1"></i>Saldo hampir habis
            </div>
            <button class="balance-refresh" @click="refreshBalance" :disabled="loading" title="Refresh saldo">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"
                :class="{ 'spin': loading }">
                <path fill-rule="evenodd"
                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                <path
                  d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Token Cost Info -->
      <div class="cost-info-row mb-4 fade-in stagger-1">
        <div class="cost-pill">
          <span class="cost-icon">⚡</span>
          <span class="cost-label">Generate Kuisioner</span>
          <span class="cost-value">10 token</span>
        </div>
        <div class="cost-pill">
          <span class="cost-icon">✨</span>
          <span class="cost-label">Saran/Edit AI</span>
          <span class="cost-value">5 token</span>
        </div>
        <div class="cost-pill">
          <span class="cost-icon">💡</span>
          <span class="cost-label">Tambah Pertanyaan AI</span>
          <span class="cost-value">5 token</span>
        </div>
        <div class="cost-pill">
          <span class="cost-icon">🎯</span>
          <span class="cost-label">Generate Indikator Variabel</span>
          <span class="cost-value">1 token / item</span>
        </div>
      </div>

      <!-- Package Selection -->
      <div class="section-title mb-3 fade-in stagger-2">
        <h2 class="h5 fw-bold mb-0" style="color: #0E3B43;">Pilih Paket Top Up</h2>
        <p class="text-muted small mb-0">Pilih paket yang sesuai kebutuhan riset Anda</p>
      </div>

      <div class="packages-grid mb-5 fade-in stagger-2">
        <!-- Bronze -->
        <div
          class="package-card package-bronze"
          :class="{ selected: selectedPackage === 'bronze' }"
          @click="selectPackage('bronze')"
          id="pkg-bronze"
        >
          <div class="pkg-badge">🥉</div>
          <div class="pkg-tier">Bronze</div>
          <div class="pkg-description">Paket Pemula</div>
          <div class="pkg-tokens">
            <span class="pkg-token-amount">30</span>
            <span class="pkg-token-label">token</span>
          </div>
          <div class="pkg-usage">~2x generate + 2x saran AI</div>
          <div class="pkg-price">Rp 10.000</div>
          <button
            class="pkg-btn"
            :class="{ 'pkg-btn-selected': selectedPackage === 'bronze' }"
            @click.stop="handleTopUp('bronze')"
            :disabled="topupLoading"
          >
            <span v-if="topupLoading && selectedPackage === 'bronze'">
              <span class="spinner-border spinner-border-sm me-1"></span>Memproses...
            </span>
            <span v-else>
              {{ selectedPackage === 'bronze' ? 'Bayar Sekarang' : 'Pilih Paket' }}
            </span>
          </button>
        </div>

        <!-- Silver (Popular) -->
        <div
          class="package-card package-silver popular"
          :class="{ selected: selectedPackage === 'silver' }"
          @click="selectPackage('silver')"
          id="pkg-silver"
        >
          <div class="popular-badge">⭐ Paling Populer</div>
          <div class="pkg-badge">🥈</div>
          <div class="pkg-tier">Silver</div>
          <div class="pkg-description">Paket Standar</div>
          <div class="pkg-tokens">
            <span class="pkg-token-amount">100</span>
            <span class="pkg-token-label">token</span>
          </div>
          <div class="pkg-usage">~7x generate + banyak saran AI</div>
          <div class="pkg-price">Rp 25.000</div>
          <button
            class="pkg-btn pkg-btn-silver"
            :class="{ 'pkg-btn-selected': selectedPackage === 'silver' }"
            @click.stop="handleTopUp('silver')"
            :disabled="topupLoading"
          >
            <span v-if="topupLoading && selectedPackage === 'silver'">
              <span class="spinner-border spinner-border-sm me-1"></span>Memproses...
            </span>
            <span v-else>
              {{ selectedPackage === 'silver' ? 'Bayar Sekarang' : 'Pilih Paket' }}
            </span>
          </button>
        </div>

        <!-- Gold -->
        <div
          class="package-card package-gold"
          :class="{ selected: selectedPackage === 'gold' }"
          @click="selectPackage('gold')"
          id="pkg-gold"
        >
          <div class="pkg-badge">🥇</div>
          <div class="pkg-tier">Gold</div>
          <div class="pkg-description">Paket Profesional</div>
          <div class="pkg-tokens">
            <span class="pkg-token-amount">250</span>
            <span class="pkg-token-label">token</span>
          </div>
          <div class="pkg-usage">~16x generate + unlimited saran AI</div>
          <div class="pkg-price">Rp 55.000</div>
          <button
            class="pkg-btn pkg-btn-gold"
            :class="{ 'pkg-btn-selected': selectedPackage === 'gold' }"
            @click.stop="handleTopUp('gold')"
            :disabled="topupLoading"
          >
            <span v-if="topupLoading && selectedPackage === 'gold'">
              <span class="spinner-border spinner-border-sm me-1"></span>Memproses...
            </span>
            <span v-else>
              {{ selectedPackage === 'gold' ? 'Bayar Sekarang' : 'Pilih Paket' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="section-title mb-3 fade-in stagger-3">
        <h2 class="h5 fw-bold mb-0" style="color: #0E3B43;">Riwayat Transaksi Token</h2>
        <p class="text-muted small mb-0">Penggunaan dan pembelian token AI Anda</p>
      </div>

      <div class="transactions-card fade-in stagger-3">
        <!-- Filter tabs -->
        <div class="tx-filter-bar mb-3">
          <button
            v-for="f in filterOptions"
            :key="f.value"
            class="tx-filter-btn"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tx-loading">
          <div class="spinner-border text-primary spinner-border-sm me-2"></div>
          Memuat riwayat...
        </div>

        <!-- Empty -->
        <div v-else-if="filteredTransactions.length === 0" class="tx-empty">
          <div class="tx-empty-icon">📋</div>
          <div class="tx-empty-title">Belum ada transaksi</div>
          <div class="tx-empty-sub">Riwayat penggunaan dan top up token akan muncul di sini</div>
        </div>

        <!-- Transaction list -->
        <div v-else class="tx-list">
          <div
            v-for="tx in filteredTransactions"
            :key="tx.id"
            class="tx-item"
            :class="tx.type === 'credit' ? 'tx-credit' : 'tx-debit'"
          >
            <div class="tx-icon">
              <span v-if="tx.type === 'credit'">💰</span>
              <span v-else>⚡</span>
            </div>
            <div class="tx-info">
              <div class="tx-desc">{{ tx.description || (tx.type === 'credit' ? 'Top Up Token' : 'Penggunaan AI') }}</div>
              <div class="tx-date">{{ formatDate(tx.createdAt) }}</div>
              <div v-if="tx.midtransStatus && tx.midtransStatus !== 'success'" class="tx-status-badge d-inline-flex align-items-center gap-2"
                :class="`status-${tx.midtransStatus}`">
                <span>{{ tx.midtransStatus === 'pending' ? 'Menunggu Pembayaran' : 'Gagal' }}</span>
                <button
                  v-if="tx.midtransStatus === 'pending' && tx.midtransOrderId"
                  class="btn btn-sm btn-outline-warning py-0 px-2 rounded-pill fw-semibold"
                  style="font-size: 0.72rem; line-height: 1.4; border-width: 1px;"
                  :disabled="checkingOrderId === tx.midtransOrderId"
                  @click.stop="checkStatus(tx.midtransOrderId)"
                >
                  <span v-if="checkingOrderId === tx.midtransOrderId" class="spinner-border spinner-border-sm me-1"></span>
                  <span v-else>🔄</span> Cek Status
                </button>
              </div>
            </div>
            <div class="tx-amount">
              <span :class="tx.type === 'credit' ? 'amount-credit' : 'amount-debit'">
                {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount }}
              </span>
              <span class="amount-unit">token</span>
              <div class="tx-balance-after">sisa {{ tx.balanceAfter }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Payment Status Alert -->
    <div v-if="paymentStatus" class="payment-status-toast" :class="`toast-${paymentStatus}`">
      <span v-if="paymentStatus === 'success'">✅ Pembayaran berhasil! Token sudah ditambahkan.</span>
      <span v-else-if="paymentStatus === 'pending'">⏳ Pembayaran sedang diproses. Token akan ditambahkan otomatis.</span>
      <span v-else-if="paymentStatus === 'error'">❌ Pembayaran gagal. Silakan coba lagi.</span>
    </div>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: true
})

const { data, signOut } = useAuth()
const router = useRouter()
const route = useRoute()

const { balance, loading, transactions, fetchBalance, createTopup, verifyTopup, isLowBalance, isEmptyBalance } = useAITokens()

const selectedPackage = ref<string | null>(null)
const topupLoading = ref(false)
const balanceLoaded = ref(false)
const paymentStatus = ref<'success' | 'pending' | 'error' | null>(null)
const checkingOrderId = ref<string | null>(null)

const activeFilter = ref<'all' | 'credit' | 'debit'>('all')

const filterOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'credit', label: '💰 Top Up' },
  { value: 'debit', label: '⚡ Penggunaan' }
]

const userProfile = computed(() => {
  if (!data.value?.user) return null
  return data.value.user as any
})

const displayBalance = computed(() => balance.value)

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') return transactions.value
  return transactions.value.filter(t => t.type === activeFilter.value)
})

const selectPackage = (pkg: string) => {
  selectedPackage.value = selectedPackage.value === pkg ? null : pkg
}

const checkStatus = async (orderId: string) => {
  checkingOrderId.value = orderId
  try {
    const res = await verifyTopup(orderId)
    await fetchBalance()
    if (res?.success) {
      paymentStatus.value = 'success'
      setTimeout(() => { paymentStatus.value = null }, 5000)
    } else if (res?.status === 'pending') {
      paymentStatus.value = 'pending'
      setTimeout(() => { paymentStatus.value = null }, 5000)
    }
  } catch (err) {
    console.error('Check status error:', err)
  } finally {
    checkingOrderId.value = null
  }
}

const handleTopUp = async (packageId: string) => {
  selectedPackage.value = packageId
  topupLoading.value = true

  try {
    const result = await createTopup(packageId)
    if (!result) return

    if (window.snap) {
      window.snap.pay(result.snapToken, {
        onSuccess: async () => {
          paymentStatus.value = 'success'
          if (result.orderId) {
            await verifyTopup(result.orderId)
          }
          await fetchBalance()
          setTimeout(() => { paymentStatus.value = null }, 5000)
        },
        onPending: async () => {
          paymentStatus.value = 'pending'
          if (result.orderId) {
            await verifyTopup(result.orderId)
          }
          await fetchBalance()
          setTimeout(() => { paymentStatus.value = null }, 6000)
        },
        onError: async () => {
          paymentStatus.value = 'error'
          if (result.orderId) {
            await verifyTopup(result.orderId)
          }
          await fetchBalance()
          setTimeout(() => { paymentStatus.value = null }, 5000)
        },
        onClose: async () => {
          if (result.orderId) {
            await verifyTopup(result.orderId)
          }
          await fetchBalance()
          selectedPackage.value = null
        }
      })
    } else {
      // Fallback: redirect to payment URL
      window.open(result.paymentUrl, '_blank')
    }
  } catch (error: any) {
    console.error('Top up error:', error)
    alert(error.data?.statusMessage || 'Gagal membuat transaksi. Silakan coba lagi.')
    selectedPackage.value = null
  } finally {
    topupLoading.value = false
  }
}

const refreshBalance = async () => {
  await fetchBalance()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

onMounted(async () => {
  // Check order_id from redirect callback
  const orderId = route.query.order_id as string | null
  if (orderId) {
    await verifyTopup(orderId)
  }

  await fetchBalance()
  balanceLoaded.value = true

  // Handle payment status from URL redirect
  const status = route.query.status as string | null
  if (status === 'success' || status === 'pending' || status === 'error') {
    paymentStatus.value = status as any
    setTimeout(() => { paymentStatus.value = null }, 6000)
    // Clean up URL
    router.replace('/payments')
  }
})
</script>

<style scoped>
/* ── Page Layout ─────────────────────────────────────────── */
.topup-page {
  max-width: 960px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0E3B43;
}

.header-icon {
  font-size: 1.1rem;
}

/* ── Balance Card ─────────────────────────────────────────── */
.balance-card {
  position: relative;
  background: linear-gradient(135deg, #0E3B43 0%, #137A7F 100%);
  color: white;
  border-radius: 16px;
  padding: 18px 24px;
  min-width: 200px;
  box-shadow: 0 4px 24px rgba(14, 59, 67, 0.25);
  transition: all 0.3s ease;
}

.balance-card-low {
  background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
  box-shadow: 0 4px 24px rgba(217, 119, 6, 0.3);
}

.balance-card-empty {
  background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%);
  box-shadow: 0 4px 24px rgba(220, 38, 38, 0.35);
}

.balance-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.75;
  margin-bottom: 4px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.balance-icon { font-size: 1.2rem; }

.balance-number {
  font-size: 2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.balance-unit {
  font-size: 0.85rem;
  opacity: 0.8;
}

.balance-warning {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-top: 4px;
}

.balance-refresh {
  position: absolute;
  top: 10px;
  right: 12px;
  background: rgba(255,255,255,0.15);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.balance-refresh:hover { background: rgba(255,255,255,0.25); }

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Cost Info Pills ─────────────────────────────────────── */
.cost-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cost-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 50px;
  padding: 6px 14px;
  font-size: 0.8rem;
  color: #0369a1;
}

.cost-icon { font-size: 0.9rem; }

.cost-label { color: #475569; }

.cost-value {
  font-weight: 700;
  color: #0E3B43;
  margin-left: 2px;
}

/* ── Section Title ──────────────────────────────────────── */
.section-title { border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; }

/* ── Package Cards ──────────────────────────────────────── */
.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .packages-grid { grid-template-columns: 1fr; }
}

.package-card {
  position: relative;
  border-radius: 20px;
  padding: 28px 22px 22px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  text-align: center;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.package-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}

.package-bronze::before { background: linear-gradient(90deg, #92400e, #d97706); }
.package-silver::before { background: linear-gradient(90deg, #475569, #94a3b8); }
.package-gold::before   { background: linear-gradient(90deg, #a16207, #f59e0b); }

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.package-card.selected {
  border-color: #137A7F;
  box-shadow: 0 8px 30px rgba(19, 122, 127, 0.2);
  transform: translateY(-4px);
}

.popular {
  border-color: #475569;
  background: linear-gradient(180deg, #f8faff 0%, #fff 100%);
  box-shadow: 0 4px 24px rgba(71, 85, 105, 0.18);
}

.popular-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #475569, #94a3b8);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 14px;
  border-radius: 0 0 10px 10px;
  white-space: nowrap;
}

.pkg-badge { font-size: 2.5rem; margin-bottom: 6px; line-height: 1; }

.pkg-tier {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0E3B43;
  margin-bottom: 2px;
}

.package-bronze .pkg-tier { color: #92400e; }
.package-silver .pkg-tier { color: #334155; }
.package-gold   .pkg-tier { color: #a16207; }

.pkg-description {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 16px;
}

.pkg-tokens {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 4px;
}

.pkg-token-amount {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  color: #0E3B43;
}

.pkg-token-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

.pkg-usage {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 14px;
  padding: 4px 10px;
  background: #f8fafc;
  border-radius: 6px;
}

.pkg-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0E3B43;
  margin-bottom: 14px;
}

.pkg-btn {
  width: 100%;
  border: 2px solid #0E3B43;
  background: transparent;
  color: #0E3B43;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 10px;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pkg-btn:hover:not(:disabled) {
  background: #0E3B43;
  color: white;
}

.pkg-btn-selected,
.pkg-btn:active:not(:disabled) {
  background: #0E3B43 !important;
  color: white !important;
}

.pkg-btn-silver {
  border-color: #334155;
  color: #334155;
}
.pkg-btn-silver:hover:not(:disabled), .package-silver .pkg-btn-selected {
  background: #334155 !important;
  color: white !important;
}

.pkg-btn-gold {
  border-color: #a16207;
  color: #a16207;
}
.pkg-btn-gold:hover:not(:disabled), .package-gold .pkg-btn-selected {
  background: #a16207 !important;
  color: white !important;
}

.pkg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

/* ── Transactions ────────────────────────────────────────── */
.transactions-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #E2E8F0;
}

.tx-filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tx-filter-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tx-filter-btn.active, .tx-filter-btn:hover {
  background: #0E3B43;
  color: white;
  border-color: #0E3B43;
}

.tx-loading, .tx-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.tx-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
.tx-empty-title { font-weight: 600; color: #64748b; margin-bottom: 4px; }
.tx-empty-sub { font-size: 0.82rem; }

.tx-list { display: flex; flex-direction: column; gap: 2px; }

.tx-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 8px;
  border-radius: 10px;
  transition: background 0.15s ease;
}

.tx-item:hover { background: #f8fafc; }

.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.tx-credit .tx-icon { background: #f0fdf4; }
.tx-debit  .tx-icon { background: #fdf2f8; }

.tx-info { flex: 1; min-width: 0; }

.tx-desc {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-date { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }

.tx-status-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 5px;
  margin-top: 3px;
}

.status-pending { background: #fef9c3; color: #854d0e; }
.status-failed  { background: #fee2e2; color: #991b1b; }

.tx-amount {
  text-align: right;
  flex-shrink: 0;
}

.amount-credit { font-size: 1rem; font-weight: 800; color: #16a34a; }
.amount-debit  { font-size: 1rem; font-weight: 800; color: #dc2626; }

.amount-unit { font-size: 0.72rem; color: #94a3b8; margin-left: 2px; }

.tx-balance-after { font-size: 0.68rem; color: #cbd5e1; margin-top: 2px; }

/* ── Payment Toast ──────────────────────────────────────── */
.payment-status-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  animation: slide-up 0.3s ease;
  max-width: 340px;
}

.toast-success { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
.toast-pending { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
.toast-error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Animations ─────────────────────────────────────────── */
.fade-in { animation: fadeIn 0.4s ease both; }
.stagger-1 { animation-delay: 0.08s; }
.stagger-2 { animation-delay: 0.16s; }
.stagger-3 { animation-delay: 0.24s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>