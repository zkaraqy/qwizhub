<template>
  <LayoutPrivateLayout :user="userProfile" active-item="dashboard" @logout="handleSignOut">
    <!-- Hero Welcome Section - Standardized SaaS Header -->
    <div v-if="userProfile?.role !== 'admin'" class="hero-section-clean fade-in mb-4">
      <div class="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-uppercase fw-bold small" style="color: var(--qh-accent); letter-spacing: 0.08em; font-size: 0.72rem;">
              PANEL KONTROL {{ userProfile?.role === 'peneliti' ? 'PENELITI' : 'RESPONDEN' }}
            </span>
          </div>
          <h2 class="fw-bold mb-1" style="color: var(--qh-primary); letter-spacing: -0.02em;">
            Selamat Datang Kembali, {{ userProfile?.name || 'User' }}
          </h2>
          <p v-if="userProfile?.role === 'peneliti'" class="mb-0 text-secondary small">
            Pusat analitik, evaluasi AI, dan pemantauan respons penelitian Anda secara real-time.
          </p>
          <p v-else class="mb-0 text-secondary small">
            Temukan kuesioner menarik, isi survei, dan dapatkan honor penelitian langsung ke dompet Anda.
          </p>
        </div>

        <div v-if="userProfile?.role === 'peneliti'" class="d-flex gap-2">
          <button 
            class="btn text-white px-3.5 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" 
            style="background-color: var(--qh-primary);"
            @click="handleCreateSurvey"
          >
            <i class="bi bi-plus-lg"></i>
            <span>Proyek Baru</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Verification Banner -->
    <DashboardVerificationBanner :verification-status="(data?.user as any)?.verificationStatus"
      :role="(data?.user as any)?.role" class="mb-4 fade-in stagger-1" />

    <!-- ========================================================================= -->
    <!-- ─── PENELITI DASHBOARD SECTION ────────────────────────────────────────── -->
    <!-- ========================================================================= -->
    <template v-if="userProfile?.role === 'peneliti'">
      <!-- Interactive Filter Toolbar -->
      <div class="filter-toolbar card border rounded-4 shadow-sm p-3 mb-4 fade-in stagger-1" style="border-color: #E2E8F0;">
        <div class="row g-2 align-items-center">
          <!-- Filter Kuesioner Dropdown -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-ui-checks-grid me-1" style="color: #137A7F;"></i>Filter Kuesioner
            </label>
            <select v-model="selectedQuestionnaireFilter" class="form-select rounded-3" @change="onFilterChange">
              <option value="all">Semua Kuesioner ({{ researcherQuestionnaires.length }})</option>
              <option v-for="q in researcherQuestionnaires" :key="q.id" :value="q.id">
                {{ q.topic.length > 30 ? q.topic.substring(0, 30) + '...' : q.topic }}
              </option>
            </select>
          </div>

          <!-- Filter Status Dropdown -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-funnel me-1" style="color: #137A7F;"></i>Status
            </label>
            <select v-model="selectedStatusFilter" class="form-select rounded-3" @change="onFilterChange">
              <option value="all">Semua Status</option>
              <option value="active">🟢 Aktif (Published)</option>
              <option value="closed">🔵 Selesai / Ditutup</option>
              <option value="draft">⚪ Draft</option>
            </select>
          </div>

          <!-- Filter Rentang Tanggal -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-calendar3 me-1" style="color: #137A7F;"></i>Rentang Waktu
            </label>
            <select v-model="selectedDateRangeFilter" class="form-select rounded-3" @change="onFilterChange">
              <option value="all">Semua Waktu</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>

          <!-- Search Box -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-search me-1" style="color: #137A7F;"></i>Cari Kuesioner / Respons
            </label>
            <div class="input-group">
              <input
                v-model="searchFilter"
                type="text"
                class="form-control border-end-0"
                style="border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;"
                :style="!searchFilter ? 'border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-right: 1px solid #dee2e6 !important;' : ''"
                placeholder="Ketik topik atau tujuan..."
                @input="onSearchInput"
              />
              <button v-if="searchFilter" class="btn btn-outline-secondary border-start-0" style="border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-color: #dee2e6;" type="button" @click="clearSearch">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Export Dropdown -->
          <div class="col-lg-2 col-md-12 d-flex align-items-end">
            <div class="w-100">
              <label class="filter-label text-muted small fw-semibold mb-1 d-block d-none d-lg-block">&nbsp;</label>
              <div class="dropdown w-100">
                <button
                  class="btn text-white w-100 dropdown-toggle d-flex align-items-center justify-content-center gap-1 shadow-sm"
                  style="background-color: #0E3B43; border-radius: 0.5rem;"
                  type="button"
                  data-bs-toggle="dropdown"
                  :disabled="globalExporting || !hasResponses"
                >
                  <span v-if="globalExporting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-download me-1"></i>
                  <span>Export Data</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border rounded-3" style="border-color: #E2E8F0;">
                  <li>
                    <h6 class="dropdown-header text-uppercase small" style="font-size: 0.7rem; color: #137A7F;">Pilih Format File</h6>
                  </li>
                  <li>
                    <button class="dropdown-item d-flex align-items-center gap-2 py-2" @click="exportData('excel')">
                      <i class="bi bi-file-earmark-excel text-success fs-5"></i>
                      <div>
                        <div class="fw-semibold">Excel (.xlsx)</div>
                        <small class="text-muted">Multi-sheet & format tabel rapi</small>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item d-flex align-items-center gap-2 py-2" @click="exportData('csv')">
                      <i class="bi bi-file-earmark-text text-primary fs-5"></i>
                      <div>
                        <div class="fw-semibold">CSV (.csv)</div>
                        <small class="text-muted">Kompatibel UTF-8 & analisis statistik</small>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6 Main Stat Cards Grid -->
      <div class="row g-3 mb-4">
        <!-- 1. Total Kuesioner Dibuat -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-1">
          <div class="stat-card p-3">
            <div class="stat-icon primary mb-2">
              <i class="bi bi-ui-checks-grid"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Total Kuesioner</div>
            <h3 class="fw-bold mb-0 text-dark">{{ researcherStats?.summary?.totalQuestionnaires ?? stats.questionnaires }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Dari seluruh proyek</small>
            </div>
          </div>
        </div>

        <!-- 2. Kuesioner Aktif -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-2">
          <div class="stat-card p-3">
            <div class="stat-icon success mb-2">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Kuesioner Aktif</div>
            <h3 class="fw-bold mb-0 text-success">{{ researcherStats?.summary?.activeQuestionnaires ?? stats.published }}</h3>
            <div class="stat-footnote text-success mt-1">
              <small><i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>&nbsp;&nbsp;Sedang dibuka</small>
            </div>
          </div>
        </div>

        <!-- 3. Kuesioner Selesai / Ditutup -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-3">
          <div class="stat-card p-3">
            <div class="stat-icon info mb-2">
              <i class="bi bi-check2-all"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Selesai / Tutup</div>
            <h3 class="fw-bold mb-0 text-info">{{ researcherStats?.summary?.closedQuestionnaires ?? 0 }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Target tercapai</small>
            </div>
          </div>
        </div>

        <!-- 4. Total Responden Unik -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-4">
          <div class="stat-card p-3">
            <div class="stat-icon warning mb-2">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Total Responden</div>
            <h3 class="fw-bold mb-0 text-warning">{{ researcherStats?.summary?.totalRespondents ?? 0 }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Responden terdaftar</small>
            </div>
          </div>
        </div>

        <!-- 5. Total Respons Masuk -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-5">
          <div class="stat-card p-3">
            <div class="stat-icon purple mb-2">
              <i class="bi bi-chat-left-text-fill"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Respons Masuk</div>
            <h3 class="fw-bold mb-0 text-purple">{{ researcherStats?.summary?.totalResponses ?? stats.responses }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>{{ researcherStats?.summary?.completedResponses ?? 0 }} lengkap</small>
            </div>
          </div>
        </div>

        <!-- 6. Rata-rata Respons & Completion Rate -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 fade-in stagger-6">
          <div class="stat-card p-3">
            <div class="stat-icon teal mb-2">
              <i class="bi bi-pie-chart-fill"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Rata-rata / Kues.</div>
            <h3 class="fw-bold mb-0 text-teal">{{ researcherStats?.summary?.avgResponsesPerQuestionnaire ?? 0 }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>{{ researcherStats?.summary?.overallCompletionRate ?? 0 }}% completion</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Charts Visualization Section -->
      <div class="mb-4 fade-in stagger-2">
        <DashboardResearcherCharts
          :timeline="researcherStats?.charts?.responsesOverTime"
          :status-distribution="researcherStats?.charts?.statusDistribution"
          :responses-per-questionnaire="researcherStats?.charts?.responsesPerQuestionnaire"
          :loading="loadingResearcherStats"
        />
      </div>

      <!-- Section 2: Analisis Berdasarkan Kuesioner -->
      <div class="row mb-4 fade-in stagger-3">
        <div class="col-12">
          <div class="card border rounded-4 shadow-sm bg-white overflow-hidden" style="border-color: #E2E8F0;">
            <!-- Header -->
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-3.5 p-md-4" style="border-color: #E2E8F0;">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-clipboard-data-fill me-2" style="color: #137A7F;"></i>Daftar & Analisis Kuesioner
                </h5>
                <p class="text-muted small mb-0">Kelola dan telusuri analisis komprehensif setiap kuesioner Anda</p>
              </div>
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1.5" @click="loadResearcherData">
                <i class="bi bi-arrow-clockwise"></i>
                <span>Refresh</span>
              </button>
            </div>

            <!-- Body / Table -->
            <div class="card-body p-0">
              <!-- Loading -->
              <div v-if="loadingResearcherQuestionnaires" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                Memuat daftar kuesioner...
              </div>

              <!-- Empty -->
              <div v-else-if="researcherQuestionnaires.length === 0" class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
                <h6 class="fw-bold text-dark">Belum ada kuesioner</h6>
                <p class="text-muted small mb-3">Mulai buat kuesioner pertama Anda pada proyek penelitian.</p>
                <button class="btn btn-primary rounded-pill px-4" @click="handleCreateSurvey">
                  <i class="bi bi-plus-lg me-1"></i>Buat Proyek
                </button>
              </div>

              <!-- Table List -->
              <div v-else class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 5%;">No</th>
                      <th style="width: 25%;">Judul Kuesioner & Proyek</th>
                      <th style="width: 12%;">Status</th>
                      <th style="width: 12%;">Pertanyaan</th>
                      <th style="width: 18%;">Capaian Respons</th>
                      <th style="width: 12%;">Tanggal Dibuat</th>
                      <th style="width: 16%;" class="text-end pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(q, idx) in researcherQuestionnaires" :key="q.id">
                      <td>{{ idx + 1 }}</td>
                      <td>
                        <div class="fw-bold text-dark">{{ q.topic }}</div>
                        <small class="text-muted d-block">{{ truncateText(q.researchObjective, 45) }}</small>
                        <small class="badge bg-light text-muted border mt-1">📁 {{ q.projectTitle }}</small>
                      </td>
                      <td>
                        <span v-if="q.computedStatus === 'active'" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          Aktif
                        </span>
                        <span v-else-if="q.computedStatus === 'closed'" class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                          Selesai
                        </span>
                        <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                          Draft
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                          {{ q.questionsCount }} pertanyaan
                        </span>
                      </td>
                      <td>
                        <div class="d-flex justify-content-between align-items-center mb-1 small">
                          <span class="fw-semibold">{{ q.currentResponses }} <span class="text-muted">/ {{ q.targetRespondents || '∞' }}</span></span>
                          <span class="text-muted">{{ q.completionRate }}% selesai</span>
                        </div>
                        <div class="progress rounded-pill" style="height: 6px;">
                          <div
                            class="progress-bar bg-primary"
                            :style="{ width: `${q.targetRespondents ? Math.min(100, Math.round((q.currentResponses / q.targetRespondents) * 100)) : (q.currentResponses ? 100 : 0)}%` }"
                          ></div>
                        </div>
                      </td>
                      <td>
                        <small class="text-muted">{{ formatDateShort(q.createdAt) }}</small>
                      </td>
                      <td class="text-end pe-4">
                        <div class="btn-group">
                          <!-- Detail Button -->
                          <NuxtLink
                            :to="`/projects/${q.projectId}/questionnaire/${q.id}/edit`"
                            class="btn btn-sm btn-outline-secondary"
                            title="Edit / Detail Kuesioner"
                          >
                            <i class="bi bi-pencil-square"></i>
                          </NuxtLink>

                          <!-- Analisis Button -->
                          <button
                            class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            title="Lihat Analisis Detail"
                            @click="openAnalysisModal(q.id)"
                          >
                            <i class="bi bi-bar-chart-fill"></i>
                            <span class="d-none d-md-inline">Analisis</span>
                          </button>

                          <!-- Export Single Questionnaire Dropdown -->
                          <button
                            class="btn btn-sm btn-outline-success dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown"
                            title="Export Data Kuesioner Ini"
                            :disabled="q.currentResponses === 0"
                          ></button>
                          <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                            <li><h6 class="dropdown-header small">Export Kuesioner Ini</h6></li>
                            <li>
                              <button class="dropdown-item small" @click="exportData('excel', q.id)">
                                <i class="bi bi-file-earmark-excel text-success me-2"></i>Export Excel (.xlsx)
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item small" @click="exportData('csv', q.id)">
                                <i class="bi bi-file-earmark-text text-primary me-2"></i>Export CSV
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Respons Masuk Terbaru (Recent Responses) -->
      <div class="row mb-4 fade-in stagger-3" v-if="researcherStats?.recentResponses && researcherStats.recentResponses.length > 0">
        <div class="col-12">
          <div class="card border rounded-4 shadow-sm bg-white overflow-hidden" style="border-color: #E2E8F0;">
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-3.5 p-md-4" style="border-color: #E2E8F0;">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-clock-history me-2" style="color: #137A7F;"></i>Respons Masuk Terbaru
              </h5>
              <span class="badge rounded-pill px-2.5 py-1 fw-medium" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.75rem;">
                {{ researcherStats.recentResponses.length }} respons terakhir
              </span>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 25%;">Responden</th>
                    <th style="width: 30%;">Kuesioner</th>
                    <th style="width: 15%;">Status</th>
                    <th style="width: 15%;">Durasi</th>
                    <th style="width: 15%;">Waktu Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in researcherStats.recentResponses" :key="r.id">
                    <td>
                      <div class="fw-semibold text-dark">{{ r.respondentName }}</div>
                      <small class="text-muted">{{ r.respondentEmail }}</small>
                    </td>
                    <td>
                      <div class="fw-medium text-dark">{{ r.questionnaireTopic }}</div>
                      <small class="text-muted">{{ r.answersCount }} pertanyaan terisi</small>
                    </td>
                    <td>
                      <span v-if="r.status === 'completed'" class="badge badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style="background-color: #DEF7EC; color: #0E9F6E;">
                        Selesai
                      </span>
                      <span v-else class="badge rounded-pill px-2.5 py-1" style="background-color: #FEF3C7; color: #D97706;">
                        Sedang Mengisi
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">{{ r.timeSpentSeconds ? `${r.timeSpentSeconds} detik` : '-' }}</small>
                    </td>
                    <td>
                      <small class="text-muted">{{ formatDateTimeShort(r.createdAt) }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Questionnaire Analysis Modal -->
      <DashboardQuestionnaireAnalysisModal
        :show="showAnalysisModal"
        :questionnaire-id="selectedAnalysisQuestionnaireId"
        @close="showAnalysisModal = false"
      />
    </template>

    <!-- ========================================================================= -->
    <!-- ─── RESPONDEN DASHBOARD SECTION (STANDARDIZED) ────────────────────────── -->
    <!-- ========================================================================= -->
    <template v-else-if="userProfile?.role === 'responden'">
      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6 col-sm-6 fade-in stagger-1">
          <div class="stat-card p-3">
            <div class="stat-icon primary mb-2">
              <i class="bi bi-card-checklist"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Total Kuesioner Diisi</div>
            <h3 class="fw-bold mb-0 text-dark">{{ stats.totalQuestionnairesAnswered }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Dari seluruh kuesioner</small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-6 fade-in stagger-2">
          <div class="stat-card p-3">
            <div class="stat-icon success mb-2">
              <i class="bi bi-check2-all"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Selesai Dikerjakan</div>
            <h3 class="fw-bold mb-0" style="color: var(--qh-success);">{{ stats.totalQuestionnairesAnswered }}</h3>
            <div class="stat-footnote mt-1" style="color: var(--qh-success);">
              <small><i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>&nbsp;&nbsp;Semua selesai</small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-6 fade-in stagger-3">
          <div class="stat-card p-3">
            <div class="stat-icon teal mb-2">
              <i class="bi bi-cash-stack"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Total Honor</div>
            <h3 class="fw-bold mb-0 text-teal">Rp {{ formatCurrency(stats.totalHonorEarned) }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Akumulasi seluruh honor</small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 col-sm-6 fade-in stagger-4">
          <div class="stat-card p-3">
            <div class="stat-icon warning mb-2">
              <i class="bi bi-wallet2"></i>
            </div>
            <div class="stat-sublabel text-muted text-uppercase">Honor Tersedia</div>
            <h3 class="fw-bold mb-0" style="color: var(--qh-warning);">Rp {{ formatCurrency(stats.totalHonorEarned) }}</h3>
            <div class="stat-footnote text-muted mt-1">
              <small>Siap dicairkan</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Filter Toolbar -->
      <div class="filter-toolbar card border rounded-4 shadow-sm p-3 mb-4 fade-in stagger-1" style="border-color: var(--qh-border);">
        <div class="row g-2 align-items-center">
          <!-- Search Box -->
          <div class="col-lg-4 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-search me-1" style="color: var(--qh-accent);"></i>Cari Kuesioner
            </label>
            <div class="input-group">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-end-0"
                style="border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;"
                :style="!searchQuery ? 'border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-right: 1px solid #dee2e6 !important;' : ''"
                placeholder="Ketik topik atau tujuan..."
                @input="debouncedSearchQuestionnaires"
              />
              <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" style="border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-color: #dee2e6;" type="button" @click="searchQuery = ''; loadQuestionnairesList()">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Filter Status -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-funnel me-1" style="color: var(--qh-accent);"></i>Status
            </label>
            <select v-model="statusFilter" class="form-select rounded-3" @change="loadQuestionnairesList">
              <option value="all">Semua Status</option>
              <option value="available">🟢 Tersedia</option>
              <option value="full">🔵 Penuh</option>
              <option value="completed">✅ Sudah Dikerjakan</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-sort-down me-1" style="color: var(--qh-accent);"></i>Urutkan
            </label>
            <select v-model="sortBy" class="form-select rounded-3" @change="loadQuestionnairesList">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="honor">Honor Tertinggi</option>
            </select>
          </div>

          <!-- Filter Specialization -->
          <div class="col-lg-4 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-mortarboard me-1" style="color: var(--qh-accent);"></i>Spesialisasi
            </label>
            <select
              class="form-select rounded-3"
              :value="specializationFilter"
              @change="setSpecializationFilter(($event.target as HTMLSelectElement).value)"
            >
              <option value="all">
                🎓 Semua Spesialisasi
              </option>
              <option
                v-for="spec in SPECIALIZATIONS"
                :key="spec.value"
                :value="spec.value"
              >
                {{ spec.label }}{{ userProfileSpecialization === spec.value ? ' ★' : '' }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Kuesioner Tersedia (Responden Only) -->
      <div class="row mb-4 fade-in stagger-2">
        <div class="col-12">
          <div class="card border rounded-4 shadow-sm bg-white overflow-hidden" style="border-color: var(--qh-border);">
            <!-- Header -->
            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center p-3.5 p-md-4" style="border-color: var(--qh-border);">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-clipboard-data-fill me-2" style="color: var(--qh-accent);"></i>Kuesioner Tersedia
                </h5>
                <p class="text-muted small mb-0">Temukan kuesioner yang sesuai dan kerjakan untuk mendapatkan honor</p>
              </div>
              <NuxtLink to="/questionnaires" class="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1.5">
                <i class="bi bi-arrow-right"></i>
                <span>Lihat Semua</span>
              </NuxtLink>
            </div>

            <!-- Body / Table -->
            <div class="card-body p-0">
              <!-- Loading State -->
              <div v-if="loadingQuestionnaires" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                Memuat daftar kuesioner...
              </div>

              <!-- Table -->
              <div v-else-if="questionnairesList.length > 0" class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 5%;">No</th>
                      <th style="width: 25%;">Judul Kuesioner</th>
                      <th style="width: 15%;">Peneliti</th>
                      <th style="width: 12%;">Capaian Respons</th>
                      <th style="width: 12%;">Honor</th>
                      <th style="width: 13%;">Tanggal</th>
                      <th style="width: 10%;">Status</th>
                      <th style="width: 8%;" class="text-end pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(q, index) in questionnairesList" :key="q.id">
                      <td>{{ (currentPageQuestionnaires - 1) * limitQuestionnaires + index + 1 }}</td>
                      <td>
                        <div class="fw-bold text-dark">{{ q.topic }}</div>
                        <small class="text-muted d-block">{{ truncateText(q.researchObjective, 45) }}</small>
                      </td>
                      <td>
                        <small class="text-muted">{{ q.project?.peneliti?.name || '-' }}</small>
                      </td>
                      <td>
                        <div class="d-flex justify-content-between align-items-center mb-1 small">
                          <span class="fw-semibold">{{ q.currentResponses }} <span class="text-muted">/ {{ q.targetRespondents }}</span></span>
                        </div>
                        <div class="progress rounded-pill" style="height: 6px;">
                          <div
                            class="progress-bar"
                            style="background-color: var(--qh-accent);"
                            :style="{ width: `${q.targetRespondents ? Math.min(100, Math.round((q.currentResponses / q.targetRespondents) * 100)) : (q.currentResponses ? 100 : 0)}%` }"
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span class="badge rounded-pill px-2.5 py-1 fw-medium" style="background-color: var(--qh-accent-light); color: var(--qh-accent);">
                          💰 Rp {{ formatCurrency(q.honorariumPerRespondent) }}
                        </span>
                      </td>
                      <td>
                        <small class="text-muted">{{ formatDateShort(q.publishedAt) }}</small>
                      </td>
                      <td>
                        <span v-if="q.hasResponded" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          Selesai
                        </span>
                        <span v-else-if="!q.isAvailable" class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                          Penuh
                        </span>
                        <span v-else class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                          Tersedia
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <NuxtLink :to="`/questionnaires/${q.id}/detail`" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                          <i class="bi bi-eye"></i>
                          <span class="d-none d-md-inline">Detail</span>
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
                <h6 class="fw-bold text-dark">Tidak ada kuesioner tersedia</h6>
                <p class="text-muted small mb-3">Belum ada kuesioner yang sesuai dengan filter Anda saat ini.</p>
                <NuxtLink to="/questionnaires" class="btn btn-sm btn-outline-primary rounded-pill px-4">
                  <i class="bi bi-search me-1"></i>Jelajahi Kuesioner
                </NuxtLink>
              </div>

              <!-- Pagination -->
              <div v-if="totalPagesQuestionnaires > 1" class="d-flex justify-content-center py-3 border-top" style="border-color: var(--qh-border);">
                <nav>
                  <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPageQuestionnaires === 1 }">
                      <a class="page-link" href="#"
                        @click.prevent="changeQuestionnaireePage(currentPageQuestionnaires - 1)">
                        <i class="bi bi-chevron-left"></i>
                      </a>
                    </li>
                    <li v-for="page in totalPagesQuestionnaires" :key="page" class="page-item"
                      :class="{ active: page === currentPageQuestionnaires }">
                      <a class="page-link" href="#" @click.prevent="changeQuestionnaireePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageQuestionnaires === totalPagesQuestionnaires }">
                      <a class="page-link" href="#"
                        @click.prevent="changeQuestionnaireePage(currentPageQuestionnaires + 1)">
                        <i class="bi bi-chevron-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="userProfile?.role === 'admin'">
      <DashboardAdmin/>
    </template>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
import { useFetch } from '#app'
import { SPECIALIZATIONS } from '~/constants/specializations'

definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, signOut, refresh } = useAuth()
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

// ─── Researcher (Peneliti) State ──────────────────────────────────────────
const researcherStats = ref<any>(null)
const loadingResearcherStats = ref(false)
const researcherQuestionnaires = ref<any[]>([])
const loadingResearcherQuestionnaires = ref(false)

// Filters
const selectedQuestionnaireFilter = ref('all')
const selectedStatusFilter = ref('all')
const selectedDateRangeFilter = ref('all')
const searchFilter = ref('')

// Export
const globalExporting = ref(false)
const globalExportFormat = ref<'excel' | 'csv' | null>(null)

// Analysis Modal
const showAnalysisModal = ref(false)
const selectedAnalysisQuestionnaireId = ref<string | null>(null)

const hasResponses = computed(() => {
  return (researcherStats.value?.summary?.totalResponses || 0) > 0
})

// Stats object for fallback / legacy
const stats = ref({
  projects: 0,
  questionnaires: 0,
  published: 0,
  responses: 0,
  totalQuestionnairesAnswered: 0,
  totalHonorEarned: 0
})

// Responden fields
const questionnairesList = ref<any[]>([])
const loadingQuestionnaires = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('newest')
const currentPageQuestionnaires = ref(1)
const totalPagesQuestionnaires = ref(1)
const limitQuestionnaires = 10
// Specialization filter — default will be set from user's profile on mount
const specializationFilter = ref('all')
const userProfileSpecialization = ref<string | null>(null)

// ─── Researcher Methods ───────────────────────────────────────────────────
const loadResearcherStats = async () => {
  if (userProfile.value?.role !== 'peneliti') return
  loadingResearcherStats.value = true
  try {
    const res = await $fetch<any>('/api/dashboard/peneliti/stats', {
      query: {
        questionnaireId: selectedQuestionnaireFilter.value,
        status: selectedStatusFilter.value,
        dateRange: selectedDateRangeFilter.value,
        search: searchFilter.value
      }
    })
    if (res?.success) {
      researcherStats.value = res
    }
  } catch (err) {
    console.error('Failed to load researcher stats:', err)
  } finally {
    loadingResearcherStats.value = false
  }
}

const loadResearcherQuestionnaires = async () => {
  if (userProfile.value?.role !== 'peneliti') return
  loadingResearcherQuestionnaires.value = true
  try {
    const res = await $fetch<any>('/api/dashboard/peneliti/questionnaires', {
      query: {
        status: selectedStatusFilter.value,
        search: searchFilter.value
      }
    })
    if (res?.success) {
      researcherQuestionnaires.value = res.questionnaires
    }
  } catch (err) {
    console.error('Failed to load researcher questionnaires:', err)
  } finally {
    loadingResearcherQuestionnaires.value = false
  }
}

const loadResearcherData = async () => {
  await Promise.all([loadResearcherStats(), loadResearcherQuestionnaires()])
}

const onFilterChange = () => {
  loadResearcherData()
}

let searchTimer: any = null
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadResearcherData()
  }, 400)
}

const clearSearch = () => {
  searchFilter.value = ''
  loadResearcherData()
}

const openAnalysisModal = (qId: string) => {
  selectedAnalysisQuestionnaireId.value = qId
  showAnalysisModal.value = true
}

const exportData = async (format: 'excel' | 'csv', qId?: string) => {
  globalExporting.value = true
  globalExportFormat.value = format

  try {
    const targetQId = qId || selectedQuestionnaireFilter.value || 'all'
    const url = `/api/dashboard/peneliti/export?questionnaireId=${targetQId}&format=${format}`
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    alert(err.message || 'Gagal mengekspor data kuesioner')
  } finally {
    setTimeout(() => {
      globalExporting.value = false
      globalExportFormat.value = null
    }, 1200)
  }
}

// ─── Responden Methods ────────────────────────────────────────────────────
const loadQuestionnairesList = async () => {
  if (userProfile.value?.role !== 'responden') return
  loadingQuestionnaires.value = true
  try {
    const { data: questData, error: questError } = await useFetch('/api/questionnaires/published', {
      query: {
        search: searchQuery.value,
        status: statusFilter.value,
        page: currentPageQuestionnaires.value,
        limit: limitQuestionnaires,
        specialization: specializationFilter.value === 'all' ? '' : specializationFilter.value
      }
    })

    if (!questError.value && questData.value?.success) {
      let data = questData.value.data
      if (sortBy.value === 'newest') {
        data = data.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      } else if (sortBy.value === 'oldest') {
        data = data.sort((a: any, b: any) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      } else if (sortBy.value === 'honor') {
        data = data.sort((a: any, b: any) => b.honorariumPerRespondent - a.honorariumPerRespondent)
      }
      questionnairesList.value = data
      totalPagesQuestionnaires.value = questData.value.pagination.totalPages
    }
  } catch (e) {
    console.error('Failed to load questionnaires:', e)
  } finally {
    loadingQuestionnaires.value = false
  }
}

const setSpecializationFilter = (value: string) => {
  specializationFilter.value = value
  currentPageQuestionnaires.value = 1
  loadQuestionnairesList()
}

let searchTimeout: NodeJS.Timeout
const debouncedSearchQuestionnaires = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPageQuestionnaires.value = 1
    loadQuestionnairesList()
  }, 500)
}

const changeQuestionnaireePage = (page: number) => {
  if (page >= 1 && page <= totalPagesQuestionnaires.value) {
    currentPageQuestionnaires.value = page
    loadQuestionnairesList()
  }
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

const formatDateShort = (dateString?: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTimeShort = (dateString?: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const handleCreateSurvey = () => {
  router.push('/projects/create')
}

onMounted(async () => {
  await refresh()
  try {
    if (userProfile.value?.role === 'peneliti') {
      await loadResearcherData()
    } else if (userProfile.value?.role === 'responden') {
      const responseDashboardRespondent = await $fetch('/api/dashboard/respondent')
      if (responseDashboardRespondent?.success) {
        stats.value.totalQuestionnairesAnswered = responseDashboardRespondent.stats.totalQuestionnairesAnswered
        stats.value.totalHonorEarned = responseDashboardRespondent.stats.totalHonorEarned
      }

      // Fetch user's profile specialization to set as default filter
      try {
        const profileResponse = await $fetch<any>('/api/profile')
        const profileSpecialization = profileResponse?.profile?.specialization || null
        userProfileSpecialization.value = profileSpecialization
        // Set the default specialization filter to user's profile specialization
        if (profileSpecialization) {
          specializationFilter.value = profileSpecialization
        }
      } catch (profileErr) {
        console.warn('Could not load profile specialization:', profileErr)
      }

      await loadQuestionnairesList()
    }
  } catch (e) {
    console.error('Dashboard onMounted error:', e)
  }
})
</script>

<style scoped>
.hero-section-clean {
  padding: 0.25rem 0 0.5rem 0;
}

.filter-toolbar {
  position: relative;
  border-radius: 16px;
  background: var(--qh-surface, #ffffff);
  border: 1px solid var(--qh-border, rgba(0, 0, 0, 0.07));
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  z-index: 999;
}

.filter-toolbar .dropdown-menu {
  z-index: 1060 !important;
}

.filter-label {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.table-responsive {
  min-height: 160px;
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

.stat-icon.primary { background: rgba(24, 49, 83, 0.1); color: var(--qh-primary, #183153); }
.stat-icon.success { background: rgba(33, 138, 97, 0.12); color: var(--qh-success, #218A61); }
.stat-icon.info { background: var(--qh-accent-light, #EAF5F3); color: var(--qh-accent, #2A7F79); }
.stat-icon.warning { background: rgba(200, 138, 40, 0.12); color: var(--qh-warning, #C88A28); }
.stat-icon.purple { background: #EDE9FE; color: #6D28D9; }
.stat-icon.teal { background: var(--qh-accent-light, #EAF5F3); color: var(--qh-accent, #2A7F79); }

.text-purple { color: #6D28D9 !important; }
.text-teal { color: var(--qh-accent, #2A7F79) !important; }

.dropdown-item:active {
  background-color: var(--qh-primary, #183153);
}

/* Pagination Navy + Teal */
.pagination .page-link {
  color: var(--qh-text-secondary, #66727C);
  border-color: var(--qh-border, #E4E9E7);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0 2px;
  transition: all 0.18s ease;
}

.pagination .page-item.active .page-link {
  background-color: var(--qh-primary, #183153);
  border-color: var(--qh-primary, #183153);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 49, 83, 0.2);
}

.pagination .page-link:hover {
  background-color: var(--qh-accent-light, #EAF5F3);
  color: var(--qh-accent, #2A7F79);
  border-color: var(--qh-accent-light, #EAF5F3);
}

.pagination .page-item.disabled .page-link {
  color: #c4ccd4;
  background-color: transparent;
}

/* Progress bar teal accent */
.progress {
  background-color: rgba(42, 127, 121, 0.08);
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
