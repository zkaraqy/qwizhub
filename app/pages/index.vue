<template>
  <div class="landing-page" style="background-color: #F8FAFA; min-height: 100vh;">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top py-3" id="main-navbar">
      <div class="container">
        <NuxtLink to="/" class="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" style="color: #0E3B43;" id="navbar-logo">
          <span>QwizHub</span>
        </NuxtLink>
        
        <div class="d-flex align-items-center gap-2 gap-lg-3 order-lg-3">
          <button class="navbar-toggler border-0 shadow-none p-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" id="navbar-toggler">
            <span class="navbar-toggler-icon"></span>
          </button>

          <template v-if="data">
            <div class="dropdown">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center gap-2 py-1 px-2 rounded-3 text-decoration-none" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
                style="color: #17212B;"
              >
                <img 
                  v-if="data?.user?.image" 
                  :src="data?.user.image" 
                  class="rounded-circle border" 
                  width="32" 
                  height="32" 
                  alt="Profile"
                  style="border-color: #E2E8F0; object-fit: cover;"
                >
                <div 
                  v-else 
                  class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style="width: 32px; height: 32px; font-size: 0.8rem; background-color: #0E3B43;"
                >
                  {{ (data?.user?.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <span class="fw-semibold small d-none d-sm-inline" style="color: #17212B;">{{ data?.user?.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm rounded-3 border p-1 position-absolute" style="border-color: #E2E8F0; min-width: 220px; z-index: 1021 !important;">
                <li class="px-3 py-2 border-bottom mb-1 bg-light rounded-top">
                  <div class="fw-bold text-dark small text-truncate">{{ data?.user?.name }}</div>
                  <div class="text-secondary" style="font-size: 0.75rem;">{{ data?.user?.email || 'User' }}</div>
                </li>
                <li>
                  <NuxtLink to="/dashboard" class="dropdown-item py-1.5 px-3 rounded-2 d-flex align-items-center gap-2 small">
                    <i class="bi bi-speedometer2 text-secondary"></i>
                    <span>Dashboard</span>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/profile" class="dropdown-item py-1.5 px-3 rounded-2 d-flex align-items-center gap-2 small">
                    <i class="bi bi-person text-secondary"></i>
                    <span>Profile</span>
                  </NuxtLink>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <a class="dropdown-item text-danger py-1.5 px-3 rounded-2 d-flex align-items-center gap-2 small" href="#" @click.prevent="handleSignOut">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          </template>
        </div>
        
        <div class="collapse navbar-collapse order-lg-2" id="navbarNav">
          <ul class="navbar-nav mx-auto gap-1 gap-lg-3 my-2 my-lg-0">
            <li class="nav-item">
              <a href="#how-it-works" class="nav-link text-secondary fw-semibold px-2">How It Works</a>
            </li>
            <li class="nav-item">
              <a href="#features" class="nav-link text-secondary fw-semibold px-2">Features</a>
            </li>
            <li class="nav-item">
              <a href="#steps" class="nav-link text-secondary fw-semibold px-2">Pricing</a>
            </li>
            <li class="nav-item">
              <a href="#cta" class="nav-link text-secondary fw-semibold px-2">About</a>
            </li>
          </ul>
          
          <div class="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            <template v-if="!data">
              <NuxtLink to="/login" class="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3 bg-white" style="border-color: #D1D9D6; color: #17212B;" id="btn-signin">Sign In</NuxtLink>
              <NuxtLink to="/register" class="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm" style="background-color: #0E3B43;" id="btn-getstarted">Get Started</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="py-5 position-relative overflow-hidden" id="hero-section">
      <div class="container py-3 py-lg-4">
        <div class="row align-items-center g-5">
          <!-- Left: Hero Text & CTAs -->
          <div class="col-lg-5">
            <div>
              <p class="text-uppercase fw-bold small mb-2" style="color: #137A7F; letter-spacing: 0.1em; font-size: 0.775rem;">
                RISET LEBIH MUDAH, DAMPAK LEBIH BESAR
              </p>
              <h1 class="display-5 fw-bold mb-3 lh-sm" style="color: #0E3B43; font-weight: 800;">
                Dari variabel penelitian hingga responden <span style="color: #137A7F;">yang sesuai.</span>
              </h1>
              <p class="text-secondary mb-4" style="line-height: 1.65; font-size: 0.95rem;">
                QwizHub membantu mahasiswa dan peneliti menyusun instrumen penelitian dengan bantuan AI, mengevaluasi kualitas pertanyaan, dan menemukan responden yang sesuai dalam satu platform.
              </p>
              
              <!-- Buttons -->
              <div class="d-flex gap-3 flex-wrap mb-4 align-items-center">
                <NuxtLink v-if="!data" to="/register" class="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #0E3B43;" id="hero-cta-start">
                  <span>Mulai Penelitian</span>
                  <i class="bi bi-arrow-right"></i>
                </NuxtLink>
                <NuxtLink v-else to="/dashboard" class="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #0E3B43;" id="hero-cta-dashboard">
                  <span>Go to Dashboard</span>
                  <i class="bi bi-arrow-right"></i>
                </NuxtLink>
                
                <a href="#how-it-works" class="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-pill bg-white d-inline-flex align-items-center gap-2" style="border-color: #D1D9D6; color: #17212B;" id="hero-cta-howitworks">
                  <span class="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style="width: 22px; height: 22px; background-color: #0E3B43; font-size: 0.65rem;">
                    <i class="bi bi-play-fill ms-0.5"></i>
                  </span>
                  <span>Lihat Cara Kerja</span>
                </a>
              </div>
              
              <!-- Feature Badges below CTAs -->
              <div class="d-flex flex-wrap gap-3 pt-2 text-secondary small fw-medium">
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-file-earmark-text fs-5" style="color: #137A7F;"></i>
                  <span>Instrument Builder</span>
                </div>
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-stars fs-5" style="color: #137A7F;"></i>
                  <span>AI Review</span>
                </div>
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-people fs-5" style="color: #137A7F;"></i>
                  <span>Verified Respondents</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Realistic Dashboard Mockup -->
          <div class="col-lg-7">
            <div class="dashboard-mockup card shadow-lg border-0 rounded-4 overflow-hidden bg-white" style="border: 1px solid #E4E9E7;">
              <!-- Browser Chrome Bar -->
              <div class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style="background:#F8FAFA; border-color:#E4E9E7;">
                <div class="d-flex gap-1 align-items-center">
                  <span class="rounded-circle d-inline-block" style="width:9px;height:9px;background:#EF4444;"></span>
                  <span class="rounded-circle d-inline-block mx-1" style="width:9px;height:9px;background:#F59E0B;"></span>
                  <span class="rounded-circle d-inline-block" style="width:9px;height:9px;background:#10B981;"></span>
                </div>
                <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border text-muted" style="font-size:0.72rem; background:#fff; border-color:#E4E9E7; max-width:240px;">
                  <i class="bi bi-lock-fill" style="font-size:0.6rem; color:#2A7F79;"></i>
                  <span>qwizhub.app/dashboard</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <div class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" style="width:26px;height:26px;font-size:0.72rem;background:#183153;">A</div>
                  <div class="d-none d-sm-block lh-1">
                    <div class="fw-semibold text-dark" style="font-size:0.72rem;">Ahmad Fauzi</div>
                    <div class="text-muted" style="font-size:0.62rem;">Peneliti</div>
                  </div>
                </div>
              </div>

              <!-- Dashboard Body -->
              <div class="p-3 p-md-3" style="background:#FAFBFA;">

                <!-- Hero Header -->
                <div class="mb-3">
                  <div class="fw-bold mb-0" style="color:#183153; font-size:0.95rem;">Selamat Datang, Ahmad 👋</div>
                  <div class="text-muted" style="font-size:0.72rem;">Pantau kemajuan riset dan kelola kuesioner Anda.</div>
                </div>

                <!-- Stat Cards Row -->
                <div class="row g-2 mb-3">
                  <div class="col-4">
                    <div class="rounded-3 p-2 bg-white border" style="border-color:#E4E9E7;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 mb-1" style="width:28px;height:28px;background:rgba(24,49,83,0.1);">
                        <i class="bi bi-folder2-open" style="font-size:0.75rem;color:#183153;"></i>
                      </div>
                      <div style="font-size:0.62rem;color:#66727C;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Proyek</div>
                      <div class="fw-bold" style="font-size:1.1rem;color:#183153;line-height:1.2;">3</div>
                      <div style="font-size:0.6rem;color:#66727C;">Aktif</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="rounded-3 p-2 bg-white border" style="border-color:#E4E9E7;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 mb-1" style="width:28px;height:28px;background:rgba(42,127,121,0.1);">
                        <i class="bi bi-clipboard-check" style="font-size:0.75rem;color:#2A7F79;"></i>
                      </div>
                      <div style="font-size:0.62rem;color:#66727C;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Kuesioner</div>
                      <div class="fw-bold" style="font-size:1.1rem;color:#2A7F79;line-height:1.2;">7</div>
                      <div style="font-size:0.6rem;color:#66727C;">Dipublikasi</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="rounded-3 p-2 bg-white border" style="border-color:#E4E9E7;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 mb-1" style="width:28px;height:28px;background:rgba(33,138,97,0.12);">
                        <i class="bi bi-people" style="font-size:0.75rem;color:#218A61;"></i>
                      </div>
                      <div style="font-size:0.62rem;color:#66727C;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Responden</div>
                      <div class="fw-bold" style="font-size:1.1rem;color:#218A61;line-height:1.2;">142</div>
                      <div style="font-size:0.6rem;color:#66727C;">Terkumpul</div>
                    </div>
                  </div>
                </div>

                <!-- Table Card -->
                <div class="rounded-3 bg-white border overflow-hidden" style="border-color:#E4E9E7;">
                  <!-- Table Header + Filter -->
                  <div class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style="border-color:#E4E9E7;">
                    <div class="fw-semibold" style="font-size:0.78rem;color:#183153;">
                      <i class="bi bi-list-ul me-1" style="color:#2A7F79;"></i>Daftar Kuesioner
                    </div>
                    <div class="d-flex align-items-center gap-1">
                      <div class="border rounded-2 px-2 py-1 text-muted d-flex align-items-center gap-1" style="font-size:0.62rem;border-color:#E4E9E7;background:#FAFBFA;">
                        <i class="bi bi-search" style="font-size:0.6rem;"></i>
                        <span>Cari...</span>
                      </div>
                      <div class="border rounded-2 px-2 py-1 text-muted" style="font-size:0.62rem;border-color:#E4E9E7;background:#FAFBFA;">Semua Status ▾</div>
                    </div>
                  </div>
                  <!-- Table Rows -->
                  <div>
                    <!-- Row 1 - Published -->
                    <div class="d-flex align-items-center px-3 py-2 border-bottom" style="border-color:#F0F4F2;gap:8px;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style="width:28px;height:28px;background:#EAF5F3;">
                        <i class="bi bi-file-earmark-text" style="font-size:0.75rem;color:#2A7F79;"></i>
                      </div>
                      <div class="flex-grow-1 overflow-hidden">
                        <div class="fw-semibold text-truncate" style="font-size:0.72rem;color:#17212B;">Pengaruh Machine Learning thd Efektivitas Belajar</div>
                        <div class="text-muted" style="font-size:0.6rem;">Proyek: Machine Learning — 45/100 responden</div>
                      </div>
                      <div class="flex-shrink-0 d-flex align-items-center gap-1">
                        <div class="progress flex-shrink-0" style="width:36px;height:5px;background:#E4E9E7;">
                          <div class="progress-bar" style="width:45%;background:#2A7F79;"></div>
                        </div>
                        <span class="badge rounded-pill fw-medium" style="background:#EAF5F3;color:#2A7F79;font-size:0.6rem;padding:2px 7px;">Aktif</span>
                      </div>
                    </div>
                    <!-- Row 2 - Active (higher %) -->
                    <div class="d-flex align-items-center px-3 py-2 border-bottom" style="border-color:#F0F4F2;gap:8px;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style="width:28px;height:28px;background:#EAF5F3;">
                        <i class="bi bi-file-earmark-text" style="font-size:0.75rem;color:#2A7F79;"></i>
                      </div>
                      <div class="flex-grow-1 overflow-hidden">
                        <div class="fw-semibold text-truncate" style="font-size:0.72rem;color:#17212B;">Kepuasan Pengguna Aplikasi E-Commerce</div>
                        <div class="text-muted" style="font-size:0.6rem;">Proyek: UX Research — 80/80 responden</div>
                      </div>
                      <div class="flex-shrink-0 d-flex align-items-center gap-1">
                        <div class="progress flex-shrink-0" style="width:36px;height:5px;background:#E4E9E7;">
                          <div class="progress-bar" style="width:100%;background:#218A61;"></div>
                        </div>
                        <span class="badge rounded-pill fw-medium" style="background:rgba(33,138,97,0.12);color:#218A61;font-size:0.6rem;padding:2px 7px;">Selesai</span>
                      </div>
                    </div>
                    <!-- Row 3 - Draft -->
                    <div class="d-flex align-items-center px-3 py-2" style="gap:8px;">
                      <div class="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style="width:28px;height:28px;background:#F0F4F2;">
                        <i class="bi bi-file-earmark-text" style="font-size:0.75rem;color:#66727C;"></i>
                      </div>
                      <div class="flex-grow-1 overflow-hidden">
                        <div class="fw-semibold text-truncate" style="font-size:0.72rem;color:#17212B;">Analisis Motivasi Belajar Mahasiswa</div>
                        <div class="text-muted" style="font-size:0.6rem;">Proyek: Edukasi — 0/50 responden</div>
                      </div>
                      <div class="flex-shrink-0">
                        <span class="badge rounded-pill fw-medium" style="background:#F0F4F2;color:#66727C;font-size:0.6rem;padding:2px 7px;">Draft</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3 Features Section (Susun Instrumen, AI Review, Cari Responden) -->
    <section class="py-5" id="features">
      <div class="container">
        <div class="row g-4">
          <!-- Card 1 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 p-lg-4 h-100 bg-white shadow-sm qh-feature-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="qh-icon-box">
                  <i class="bi bi-file-earmark-text fs-4"></i>
                </div>
                <div class="qh-circle-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">Susun Instrumen</h5>
              <p class="text-secondary small mb-0 lh-base">
                Mulai dari topik, tujuan penelitian, hingga variabel dan indikator dengan panduan yang terstruktur.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 p-lg-4 h-100 bg-white shadow-sm qh-feature-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="qh-icon-box">
                  <i class="bi bi-stars fs-4"></i>
                </div>
                <div class="qh-circle-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">AI Review</h5>
              <p class="text-secondary small mb-0 lh-base">
                Deteksi potensi bias, kalimat ambigu, dan dapatkan saran skala yang sesuai dengan teori penelitian.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 p-lg-4 h-100 bg-white shadow-sm qh-feature-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="qh-icon-box">
                  <i class="bi bi-people fs-4"></i>
                </div>
                <div class="qh-circle-arrow">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">Cari Responden</h5>
              <p class="text-secondary small mb-0 lh-base">
                Temukan responden yang sesuai dengan kriteria usia, domisili, dan pekerjaan secara mudah dan cepat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5-Step Process Section -->
    <section class="py-4 py-lg-5" id="how-it-works">
      <div class="container">
        <div class="card border rounded-4 p-4 p-lg-5 bg-white shadow-sm" style="border-color: #E2E8F0;">
          <!-- Card Header -->
          <div class="row align-items-end mb-4 g-3">
            <div class="col-lg-7">
              <p class="text-uppercase fw-bold small mb-2" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.775rem;">
                ALUR PENELITIAN BERSAMA QWIZHUB
              </p>
              <h2 class="display-6 fw-bold mb-0 lh-sm" style="color: #0E3B43;">
                Dari ide hingga data, dalam <span style="color: #137A7F;">lima langkah.</span>
              </h2>
            </div>
            <div class="col-lg-5 text-lg-end">
              <p class="text-secondary mb-0 small" style="line-height: 1.6;">
                Proses penelitian yang kompleks,<br class="d-none d-lg-block">
                sekarang jadi lebih sederhana.
              </p>
            </div>
          </div>

          <!-- 5 Steps Flow -->
          <div class="row g-3 g-xl-4 align-items-center mt-3 pt-2" id="steps">
            <!-- Step 1 -->
            <div class="col-12 col-md-6 col-lg">
              <div class="d-flex align-items-start gap-3 p-2 rounded-3 qh-step-card">
                <div class="qh-step-icon-circle flex-shrink-0">
                  <i class="bi bi-lightbulb"></i>
                </div>
                <div>
                  <span class="fw-bold text-secondary small d-block" style="font-size: 0.75rem;">1</span>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">Topik Penelitian</h6>
                  <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.45;">Tentukan topik dan tujuan penelitian Anda.</p>
                </div>
              </div>
            </div>

            <div class="col-auto d-none d-lg-block text-secondary opacity-25 px-0">
              <i class="bi bi-arrow-right fs-4"></i>
            </div>

            <!-- Step 2 -->
            <div class="col-12 col-md-6 col-lg">
              <div class="d-flex align-items-start gap-3 p-2 rounded-3 qh-step-card">
                <div class="qh-step-icon-circle flex-shrink-0">
                  <i class="bi bi-file-earmark-text"></i>
                </div>
                <div>
                  <span class="fw-bold text-secondary small d-block" style="font-size: 0.75rem;">2</span>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">Variabel & Indikator</h6>
                  <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.45;">Susun variabel, indikator, dan definisi operasional.</p>
                </div>
              </div>
            </div>

            <div class="col-auto d-none d-lg-block text-secondary opacity-25 px-0">
              <i class="bi bi-arrow-right fs-4"></i>
            </div>

            <!-- Step 3 -->
            <div class="col-12 col-md-6 col-lg">
              <div class="d-flex align-items-start gap-3 p-2 rounded-3 qh-step-card">
                <div class="qh-step-icon-circle flex-shrink-0">
                  <i class="bi bi-list-check"></i>
                </div>
                <div>
                  <span class="fw-bold text-secondary small d-block" style="font-size: 0.75rem;">3</span>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">Item Pertanyaan</h6>
                  <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.45;">Buat dan kembangkan butir pertanyaan kuesioner.</p>
                </div>
              </div>
            </div>

            <div class="col-auto d-none d-lg-block text-secondary opacity-25 px-0">
              <i class="bi bi-arrow-right fs-4"></i>
            </div>

            <!-- Step 4 -->
            <div class="col-12 col-md-6 col-lg">
              <div class="d-flex align-items-start gap-3 p-2 rounded-3 qh-step-card">
                <div class="qh-step-icon-circle flex-shrink-0">
                  <i class="bi bi-stars"></i>
                </div>
                <div>
                  <span class="fw-bold text-secondary small d-block" style="font-size: 0.75rem;">4</span>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">AI Check</h6>
                  <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.45;">Evaluasi kualitas pertanyaan otomatis dengan AI.</p>
                </div>
              </div>
            </div>

            <div class="col-auto d-none d-lg-block text-secondary opacity-25 px-0">
              <i class="bi bi-arrow-right fs-4"></i>
            </div>

            <!-- Step 5 -->
            <div class="col-12 col-md-6 col-lg">
              <div class="d-flex align-items-start gap-3 p-2 rounded-3 qh-step-card">
                <div class="qh-step-icon-circle flex-shrink-0">
                  <i class="bi bi-people"></i>
                </div>
                <div>
                  <span class="fw-bold text-secondary small d-block" style="font-size: 0.75rem;">5</span>
                  <h6 class="fw-bold text-dark mb-1" style="font-size: 0.9rem;">Matching Responden</h6>
                  <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.45;">Temukan responden target yang paling sesuai.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section matching clean reference design -->
    <section class="py-4 py-lg-5" id="cta">
      <div class="container">
        <div class="card border rounded-4 p-4 p-lg-5 bg-white shadow-sm position-relative overflow-hidden" style="border-color: #E2E8F0;">
          <!-- Subtle decorative radial background tint -->
          <div class="position-absolute end-0 top-0 w-50 h-100 opacity-25 pe-none d-none d-lg-block" 
               style="background: radial-gradient(circle at 80% 30%, #EBF5F3 0%, transparent 70%);">
          </div>

          <div class="row align-items-center g-4 position-relative" style="z-index: 1;">
            <!-- Left: Value Proposition & Dual Action Buttons -->
            <div class="col-lg-7">
              <p class="text-uppercase fw-bold small mb-2" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.775rem;">
                MULAI RISET BERSAMA QWIZHUB
              </p>
              <h2 class="display-6 fw-bold mb-3 lh-sm" style="color: #0E3B43;">
                Dari instrumen penelitian hingga responden <span style="color: #137A7F;">yang sesuai.</span>
              </h2>
              <p class="text-secondary mb-4" style="max-width: 560px; font-size: 0.95rem; line-height: 1.65;">
                QwizHub membantu mahasiswa dan peneliti menyusun instrumen penelitian dengan bantuan AI, mengevaluasi kualitas pertanyaan, dan menemukan responden yang sesuai dalam satu platform.
              </p>

              <!-- Buttons matching Hero style -->
              <div class="d-flex flex-wrap gap-3 align-items-center mb-4">
                <template v-if="!data">
                  <NuxtLink to="/register" class="btn text-white px-4 py-2.5 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #0E3B43;" id="cta-start-btn">
                    <span>Mulai Penelitian</span>
                    <i class="bi bi-arrow-right"></i>
                  </NuxtLink>
                  <NuxtLink to="/login" class="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-pill bg-white d-inline-flex align-items-center gap-2" style="border-color: #D1D9D6; color: #17212B;" id="cta-login-btn">
                    <span class="rounded-circle text-white d-inline-flex align-items-center justify-content-center" style="width: 22px; height: 22px; background-color: #0E3B43; font-size: 0.65rem;">
                      <i class="bi bi-box-arrow-in-right"></i>
                    </span>
                    <span>Masuk ke Akun</span>
                  </NuxtLink>
                </template>
                <template v-else>
                  <NuxtLink to="/dashboard" class="btn text-white px-4 py-2.5 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="background-color: #0E3B43;" id="cta-dashboard-btn">
                    <span>Buka Dashboard Penelitian</span>
                    <i class="bi bi-arrow-right"></i>
                  </NuxtLink>
                </template>
              </div>

              <!-- Feature Chips matching Hero Bottom -->
              <div class="d-flex flex-wrap gap-3 pt-2 text-secondary small fw-medium">
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-file-earmark-text fs-5" style="color: #137A7F;"></i>
                  <span>Instrument Builder</span>
                </div>
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-stars fs-5" style="color: #137A7F;"></i>
                  <span>AI Review</span>
                </div>
                <div class="d-inline-flex align-items-center gap-2">
                  <i class="bi bi-people fs-5" style="color: #137A7F;"></i>
                  <span>Verified Respondents</span>
                </div>
              </div>
            </div>

            <!-- Right: Mini Preview Card -->
            <div class="col-lg-5 mt-4 mt-lg-0">
              <div class="card border-0 rounded-4 p-4 bg-white" style="box-shadow: 0 4px 32px rgba(24,49,83,0.09); border: 1px solid #E8ECEB !important;">
                <!-- Window Chrome Dots & Status -->
                <div class="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom" style="border-color: #EEF2F0;">
                  <div class="d-flex align-items-center gap-2">
                    <span class="rounded-circle d-inline-block" style="width: 12px; height: 12px; background-color: #EF4444;"></span>
                    <span class="rounded-circle d-inline-block" style="width: 12px; height: 12px; background-color: #F59E0B;"></span>
                    <span class="rounded-circle d-inline-block" style="width: 12px; height: 12px; background-color: #10B981;"></span>
                  </div>
                  <span class="badge rounded-pill text-white fw-semibold d-inline-flex align-items-center gap-1 px-3 py-1" style="background-color: #2A7F79; font-size: 0.72rem;">
                    <i class="bi bi-check-circle-fill"></i> Instrument Ready
                  </span>
                </div>

                <!-- Instrument Title & Info -->
                <div class="mb-3">
                  <div class="text-secondary mb-1" style="font-size: 0.75rem; color: #66727C;">Contoh Riset Terstruktur</div>
                  <div class="fw-bold text-dark mb-2" style="font-size: 1rem; line-height: 1.4; color: #17212B;">Pengaruh Kemudahan Penggunaan Aplikasi terhadap Kepuasan Pengguna</div>
                  <div class="d-flex align-items-center gap-2" style="font-size: 0.78rem; color: #66727C;">
                    <span>3 Variabel</span>
                    <span style="color: #C4CED4;">•</span>
                    <span>8 Indikator</span>
                    <span style="color: #C4CED4;">•</span>
                    <span>Skala Likert</span>
                  </div>
                </div>

                <!-- Q1 Card -->
                <div class="border rounded-3 p-3 mb-3 bg-white" style="border-color: #E4E9E7;">
                  <div class="d-flex align-items-start gap-2 mb-2">
                    <span class="badge rounded-2 fw-semibold flex-shrink-0" style="background-color: #EAF5F3; color: #2A7F79; font-size: 0.72rem; padding: 3px 8px;">Q1</span>
                    <span class="text-dark fw-medium" style="font-size: 0.85rem; line-height: 1.4;">Saya merasa aplikasi mudah digunakan.</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge border fw-normal rounded-pill" style="background-color: #F8FAFA; color: #66727C; border-color: #E4E9E7 !important; font-size: 0.72rem; padding: 4px 10px;">Likert 1–5</span>
                    <span class="badge rounded-pill text-white fw-semibold d-inline-flex align-items-center gap-1" style="background-color: #2A7F79; font-size: 0.72rem; padding: 4px 10px;">
                      <i class="bi bi-check-circle-fill" style="font-size: 0.65rem;"></i> All Check: Good
                    </span>
                  </div>
                </div>

                <!-- Target Responden -->
                <div class="rounded-3 p-3" style="background-color: #F8FAFA; border: 1px solid #E4E9E7;">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center gap-2" style="font-size: 0.8rem; color: #66727C;">
                      <i class="bi bi-people-fill" style="color: #2A7F79;"></i>
                      <span>Target Responden: Mahasiswa</span>
                    </span>
                    <span class="fw-bold" style="color: #2A7F79; font-size: 0.82rem;">150 / 150 Siap</span>
                  </div>
                  <div class="progress rounded-pill" style="height: 7px; background-color: #E4E9E7;">
                    <div class="progress-bar rounded-pill" style="width: 100%; background-color: #2A7F79;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer matching reference aesthetic -->
    <footer class="py-5 bg-white border-top mt-auto" style="border-color: #E2E8F0;">
      <div class="container">
        <div class="row g-4 g-lg-5 justify-content-between mb-5">
          <!-- Brand Column -->
          <div class="col-lg-4 col-md-12">
            <div class="fw-bold fs-4 mb-2 d-flex align-items-center gap-2" style="color: #0E3B43;">
              <span>QwizHub</span>
              <span class="badge rounded-pill py-1 px-2 fw-medium" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">
                AI Powered
              </span>
            </div>
            <p class="text-secondary small mb-3" style="line-height: 1.65; max-width: 330px;">
              Platform riset terpadu untuk merancang instrumen kuesioner ilmiah, evaluasi kualitas butir pertanyaan dengan AI, hingga menemukan responden yang sesuai.
            </p>
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill small fw-medium mb-3" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.75rem;">
              <i class="bi bi-shield-check"></i>
              <span>Platform Riset Berstandar Akademik</span>
            </div>
            <!-- Social Buttons -->
            <div class="d-flex gap-2">
              <a href="#" class="qh-social-btn" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
              <a href="#" class="qh-social-btn" aria-label="GitHub"><i class="bi bi-github"></i></a>
              <a href="#" class="qh-social-btn" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="qh-social-btn" aria-label="Email"><i class="bi bi-envelope-fill"></i></a>
            </div>
          </div>

          <!-- Links Columns -->
          <div class="col-6 col-md-3 col-lg-2">
            <h6 class="fw-bold small text-uppercase text-dark mb-3" style="letter-spacing: 0.05em; font-size: 0.775rem;">Fitur Riset</h6>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
              <li><a href="#features" class="text-decoration-none qh-footer-link">Susun Instrumen</a></li>
              <li><a href="#features" class="text-decoration-none qh-footer-link">AI Review Kuesioner</a></li>
              <li><a href="#features" class="text-decoration-none qh-footer-link">Cari Responden</a></li>
              <li><a href="#how-it-works" class="text-decoration-none qh-footer-link">Uji Validitas</a></li>
              <li><a href="#how-it-works" class="text-decoration-none qh-footer-link">Skala Likert</a></li>
            </ul>
          </div>

          <div class="col-6 col-md-3 col-lg-2">
            <h6 class="fw-bold small text-uppercase text-dark mb-3" style="letter-spacing: 0.05em; font-size: 0.775rem;">Alur Penelitian</h6>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
              <li><a href="#steps" class="text-decoration-none qh-footer-link">1. Topik Penelitian</a></li>
              <li><a href="#steps" class="text-decoration-none qh-footer-link">2. Variabel & Indikator</a></li>
              <li><a href="#steps" class="text-decoration-none qh-footer-link">3. Item Pertanyaan</a></li>
              <li><a href="#steps" class="text-decoration-none qh-footer-link">4. AI Quality Check</a></li>
              <li><a href="#steps" class="text-decoration-none qh-footer-link">5. Matching Responden</a></li>
            </ul>
          </div>

          <div class="col-6 col-md-3 col-lg-2">
            <h6 class="fw-bold small text-uppercase text-dark mb-3" style="letter-spacing: 0.05em; font-size: 0.775rem;">Pengguna</h6>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Mahasiswa & Skripsi</a></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Dosen & Peneliti</a></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Lembaga Riset</a></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Pricing & Paket</a></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Panduan Metodologi</a></li>
            </ul>
          </div>

          <div class="col-6 col-md-3 col-lg-2">
            <h6 class="fw-bold small text-uppercase text-dark mb-3" style="letter-spacing: 0.05em; font-size: 0.775rem;">Bantuan & Akun</h6>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
              <li><NuxtLink to="/login" class="text-decoration-none qh-footer-link">Sign In ke Akun</NuxtLink></li>
              <li><NuxtLink to="/register" class="text-decoration-none qh-footer-link">Daftar Akun Baru</NuxtLink></li>
              <li><NuxtLink to="/dashboard" class="text-decoration-none qh-footer-link">Dashboard Penelitian</NuxtLink></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Pusat Bantuan & FAQ</a></li>
              <li><a href="#cta" class="text-decoration-none qh-footer-link">Kontak Tim Kami</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Copyright & Legal Row -->
        <div class="border-top pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small text-secondary" style="border-color: #F1F5F9;">
          <div>&copy; 2026 QwizHub. Hak cipta dilindungi undang-undang.</div>
          <div class="d-flex gap-3">
            <a href="#" class="text-decoration-none qh-footer-link">Kebijakan Privasi</a>
            <span>•</span>
            <a href="#" class="text-decoration-none qh-footer-link">Syarat & Ketentuan</a>
            <span>•</span>
            <a href="#" class="text-decoration-none qh-footer-link">Keamanan Data</a>
          </div>
          <div class="d-flex align-items-center gap-1.5 text-secondary">
            <i class="bi bi-globe"></i>
            <span>Indonesia (ID)</span>
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
.qh-feature-card {
  border-color: #E2E8F0 !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.qh-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(14, 59, 67, 0.08) !important;
  border-color: #137A7F !important;
}

.qh-icon-box {
  width: 52px;
  height: 52px;
  background-color: #EBF5F3;
  color: #137A7F;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qh-circle-arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #E2E8F0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  transition: all 0.2s ease;
}

.qh-feature-card:hover .qh-circle-arrow {
  background-color: #137A7F;
  border-color: #137A7F;
  color: #FFFFFF;
  transform: translateX(3px);
}

.qh-step-card {
  transition: all 0.2s ease;
}

.qh-step-card:hover {
  background-color: #F8FAFA;
}

.qh-step-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #EBF5F3;
  color: #137A7F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.25s ease;
}

.qh-step-card:hover .qh-step-icon-circle {
  background-color: #137A7F;
  color: #FFFFFF;
  transform: scale(1.05);
}

.qh-footer-link {
  color: #64748B;
  transition: color 0.15s ease, transform 0.15s ease;
  display: inline-block;
}

.qh-footer-link:hover {
  color: #137A7F;
  transform: translateX(2px);
}

.qh-social-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.85rem;
}

.qh-social-btn:hover {
  background-color: #EBF5F3;
  border-color: #137A7F;
  color: #137A7F;
  transform: translateY(-2px);
}
</style>
