<template>
  <LayoutPrivateLayout :user="userProfile" active-item="dashboard" @logout="handleSignOut">
    <!-- Hero Welcome Section -->
    <div class="hero-section fade-in mb-4">
      <div class="position-relative d-flex justify-content-between align-items-center flex-wrap gap-3" style="z-index: 1;">
        <div>
          <h1 class="display-6 fw-bold mb-2">Welcome back, {{ userProfile?.name || 'User' }}! 👋</h1>
          <p v-if="userProfile?.role === 'peneliti'" class="lead mb-0 text-white opacity-90">
            Pusat analitik & pengelolaan seluruh kuesioner dan respons penelitian Anda.
          </p>
          <p v-else class="lead mb-0 text-white opacity-90">
            Temukan kuesioner menarik dan dapatkan honor setelah mengisi survei.
          </p>
        </div>

        <div v-if="userProfile?.role === 'peneliti'" class="d-flex gap-2">
          <button class="btn btn-light btn-lg px-4 fw-semibold shadow-sm" @click="handleCreateSurvey">
            <i class="bi bi-plus-lg me-2"></i>Proyek Baru
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
      <div class="filter-toolbar glass-card p-3 mb-4 fade-in stagger-1">
        <div class="row g-2 align-items-center">
          <!-- Filter Kuesioner Dropdown -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-ui-checks-grid me-1"></i>Filter Kuesioner
            </label>
            <select v-model="selectedQuestionnaireFilter" class="form-select form-select-sm rounded-3" @change="onFilterChange">
              <option value="all">Semua Kuesioner ({{ researcherQuestionnaires.length }})</option>
              <option v-for="q in researcherQuestionnaires" :key="q.id" :value="q.id">
                {{ q.topic.length > 30 ? q.topic.substring(0, 30) + '...' : q.topic }}
              </option>
            </select>
          </div>

          <!-- Filter Status Dropdown -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-funnel me-1"></i>Status
            </label>
            <select v-model="selectedStatusFilter" class="form-select form-select-sm rounded-3" @change="onFilterChange">
              <option value="all">Semua Status</option>
              <option value="active">🟢 Aktif (Published)</option>
              <option value="closed">🔵 Selesai / Ditutup</option>
              <option value="draft">⚪ Draft</option>
            </select>
          </div>

          <!-- Filter Rentang Tanggal -->
          <div class="col-lg-2 col-md-6 col-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-calendar3 me-1"></i>Rentang Waktu
            </label>
            <select v-model="selectedDateRangeFilter" class="form-select form-select-sm rounded-3" @change="onFilterChange">
              <option value="all">Semua Waktu</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>

          <!-- Search Box -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block">
              <i class="bi bi-search me-1"></i>Cari Kuesioner / Respons
            </label>
            <div class="input-group input-group-sm">
              <input
                v-model="searchFilter"
                type="text"
                class="form-control rounded-3"
                placeholder="Ketik topik atau tujuan..."
                @input="onSearchInput"
              />
              <button v-if="searchFilter" class="btn btn-outline-secondary" type="button" @click="clearSearch">
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
                  class="btn btn-sm btn-primary w-100 dropdown-toggle rounded-3 d-flex align-items-center justify-content-center gap-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  :disabled="globalExporting || !hasResponses"
                >
                  <span v-if="globalExporting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-download me-1"></i>
                  <span>Export Data</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                  <li>
                    <h6 class="dropdown-header text-uppercase small" style="font-size: 0.7rem;">Pilih Format File</h6>
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
              <small><i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i> Sedang dibuka</small>
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
          <div class="card glass-card border-0 shadow-sm rounded-4 overflow-hidden">
            <!-- Header -->
            <div class="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center p-4">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-clipboard-data-fill text-primary me-2"></i>Daftar & Analisis Kuesioner
                </h5>
                <p class="text-muted small mb-0">Kelola dan telusuri analisis komprehensif setiap kuesioner Anda</p>
              </div>
              <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="loadResearcherData">
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
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
                          🟢 Aktif
                        </span>
                        <span v-else-if="q.computedStatus === 'closed'" class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                          🔵 Selesai
                        </span>
                        <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                          ⚪ Draft
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
          <div class="card glass-card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center p-4">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-clock-history me-2 text-primary"></i>Respons Masuk Terbaru
              </h5>
              <span class="badge bg-light text-muted border px-2 py-1">
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
                      <span v-if="r.status === 'completed'" class="badge bg-success-subtle text-success border border-success-subtle">
                        Selesai
                      </span>
                      <span v-else class="badge bg-warning-subtle text-warning border border-warning-subtle">
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
    <!-- ─── RESPONDEN DASHBOARD SECTION (KEPT INTACT) ─────────────────────────── -->
    <!-- ========================================================================= -->
    <template v-else-if="userProfile?.role === 'responden'">
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-sm-12 fade-in stagger-1">
          <div class="stat-card">
            <div class="row">
              <div class="col gap-2 align-items-center" style="max-width: max-content;">
                <div class="stat-icon primary m-0">
                  <i class="bi bi-card-checklist"></i>
                </div>
              </div>
              <div class="col d-flex align-items-center">
                <div class="text-muted fw-semibold text-uppercase" style="font-size: 1rem; letter-spacing: 0.05em;">
                  Total Questionnaires Answered</div>
              </div>
            </div>
            <div class="row">
              <div class="col" style="max-width: max-content;">
                <div class="stat-icon primary m-0 opacity-0">
                  <i class="bi bi-card-checklist"></i>
                </div>
              </div>
              <div class="col">
                <h2 class="fw-bold mb-0 display-6">{{ stats.totalQuestionnairesAnswered }}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-sm-12 fade-in stagger-1">
          <div class="stat-card">
            <div class="row">
              <div class="col gap-2 align-items-center" style="max-width: max-content;">
                <div class="stat-icon success m-0">
                  <i class="bi bi-cash-stack"></i>
                </div>
              </div>
              <div class="col d-flex align-items-center">
                <div class="text-muted fw-semibold text-uppercase" style="font-size: 1rem; letter-spacing: 0.05em;">
                  Total Honor Earned</div>
              </div>
            </div>
            <div class="row">
              <div class="col" style="max-width: max-content;">
                <div class="stat-icon primary m-0 opacity-0">
                  <i class="bi bi-cash-stack"></i>
                </div>
              </div>
              <div class="col">
                <h2 class="fw-bold mb-0 display-6">Rp {{ formatCurrency(stats.totalHonorEarned) }}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kuesioner Tersedia (Responden Only) -->
      <div class="row mb-4 fade-in stagger-2">
        <div class="col-12">
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold mb-0">
                <i class="bi bi-clipboard-check text-primary me-2"></i>Kuesioner Tersedia
              </h5>
              <NuxtLink to="/questionnaires" class="btn btn-sm btn-outline-primary">
                Lihat Semua
              </NuxtLink>
            </div>

            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6 mb-2">
                <input v-model="searchQuery" type="text" class="form-control" placeholder="Cari kuesioner..."
                  @input="debouncedSearchQuestionnaires" />
              </div>
              <div class="col-md-3 mb-2">
                <select v-model="statusFilter" class="form-select" @change="loadQuestionnairesList">
                  <option value="all">Semua Status</option>
                  <option value="available">Tersedia</option>
                  <option value="full">Penuh</option>
                  <option value="completed">Sudah Dikerjakan</option>
                </select>
              </div>
              <div class="col-md-3 mb-2">
                <select v-model="sortBy" class="form-select" @change="loadQuestionnairesList">
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="honor">Honor Tertinggi</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingQuestionnaires" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Table -->
            <div v-else-if="questionnairesList.length > 0" class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 25%;">Topic</th>
                    <th style="width: 15%;">Peneliti</th>
                    <th style="width: 10%;">Target</th>
                    <th style="width: 12%;">Honor</th>
                    <th style="width: 13%;">Tanggal</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(q, index) in questionnairesList" :key="q.id">
                    <td>{{ (currentPageQuestionnaires - 1) * limitQuestionnaires + index + 1 }}</td>
                    <td>
                      <div class="fw-semibold">{{ q.topic }}</div>
                      <small class="text-muted">{{ truncateText(q.researchObjective, 50) }}</small>
                    </td>
                    <td>
                      <small>{{ q.project?.peneliti?.name || '-' }}</small>
                    </td>
                    <td>
                      <small>{{ q.currentResponses }}/{{ q.targetRespondents }}</small>
                    </td>
                    <td>
                      <span class="badge bg-success">Rp {{ formatCurrency(q.honorariumPerRespondent) }}</span>
                    </td>
                    <td>
                      <small>{{ formatDateShort(q.publishedAt) }}</small>
                    </td>
                    <td>
                      <span v-if="q.hasResponded" class="badge bg-info">Selesai</span>
                      <span v-else-if="!q.isAvailable" class="badge bg-secondary">Penuh</span>
                      <span v-else class="badge bg-primary">Tersedia</span>
                    </td>
                    <td>
                      <NuxtLink :to="`/questionnaires/${q.id}/detail`" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-eye"></i>
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-4">
              <i class="bi bi-inbox display-4 text-muted"></i>
              <p class="text-muted mt-2">Tidak ada kuesioner tersedia</p>
            </div>

            <!-- Pagination -->
            <div v-if="totalPagesQuestionnaires > 1" class="d-flex justify-content-center mt-3">
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
    </template>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, signOut, refresh } = useAuth()
import { useFetch } from '#app'
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
        limit: limitQuestionnaires
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
      const { data: statsData, error: statsError } = await useFetch('/api/dashboard/respondent')
      if (!statsError.value && statsData.value?.success) {
        stats.value.totalQuestionnairesAnswered = statsData.value.stats.totalQuestionnairesAnswered
        stats.value.totalHonorEarned = statsData.value.stats.totalHonorEarned
      }
      await loadQuestionnairesList()
    }
  } catch (e) {
    console.error('Dashboard onMounted error:', e)
  }
})
</script>

<style scoped>
.filter-toolbar {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
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

.stat-sublabel {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-footnote {
  font-size: 0.75rem;
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

.stat-icon.primary { background: rgba(14, 59, 67, 0.12); color: #0E3B43; }
.stat-icon.success { background: rgba(40, 167, 69, 0.12); color: #28a745; }
.stat-icon.info { background: rgba(23, 162, 184, 0.12); color: #17a2b8; }
.stat-icon.warning { background: rgba(253, 126, 20, 0.12); color: #fd7e14; }
.stat-icon.purple { background: rgba(111, 66, 193, 0.12); color: #6f42c1; }
.stat-icon.teal { background: rgba(32, 201, 151, 0.12); color: #20c997; }

.text-purple { color: #6f42c1 !important; }
.text-teal { color: #20c997 !important; }

.dropdown-item:active {
  background-color: #0E3B43;
}
</style>
