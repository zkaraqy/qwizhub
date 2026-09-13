<template>
  <div class="landing-page" style="background-color: #F8FAFA; min-height: 100vh;">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top py-3" id="main-navbar">
      <div class="container">
        <NuxtLink to="/" class="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" style="color: #0E3B43;" id="navbar-logo">
          <span>QwizHub</span>
        </NuxtLink>
        
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" id="navbar-toggler">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
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
            <template v-else>
              <div class="nav-item dropdown list-unstyled">
                <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <img 
                  v-if="data?.user?.image" 
                  :src="data?.user.image" 
                  class="rounded-circle me-2" 
                  width="32" 
                  height="32" 
                  alt="Profile"
                >
                <span>{{ data?.user?.name }}</span>
              </a>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm rounded-3 border">
                  <li><NuxtLink to="/dashboard" class="dropdown-item py-2"><i class="bi bi-speedometer2 me-2"></i>Dashboard</NuxtLink></li>
                  <li><NuxtLink to="/profile" class="dropdown-item py-2"><i class="bi bi-person me-2"></i>Profile</NuxtLink></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger py-2" href="#" @click.prevent="handleSignOut"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
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

          <!-- Right: Browser Mockup matching reference image -->
          <div class="col-lg-7">
            <div class="card shadow-lg border rounded-4 overflow-hidden bg-white" style="border-color: #E2E8F0;">
              <!-- Browser Titlebar -->
              <div class="bg-white border-bottom d-flex align-items-center justify-content-between py-2 px-3" style="border-color: #EEF2F6;">
                <div class="d-flex gap-1.5 align-items-center">
                  <span class="rounded-circle d-inline-block" style="width: 9px; height: 9px; background-color: #EF4444;"></span>
                  <span class="rounded-circle d-inline-block mx-1" style="width: 9px; height: 9px; background-color: #F59E0B;"></span>
                  <span class="rounded-circle d-inline-block" style="width: 9px; height: 9px; background-color: #10B981;"></span>
                </div>
                
                <!-- Search bar in center -->
                <div class="bg-light border rounded-pill px-3 py-1 text-muted d-flex align-items-center gap-2 flex-grow-1 mx-3" style="max-width: 320px; font-size: 0.775rem; border-color: #E2E8F0;">
                  <i class="bi bi-search text-muted"></i>
                  <span>Search research, questions, etc...</span>
                </div>
                
                <!-- User Profile on right -->
                <div class="d-flex align-items-center gap-2 small">
                  <span class="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold" style="width: 26px; height: 26px; font-size: 0.75rem; background-color: #137A7F;">N</span>
                  <div class="d-none d-sm-block text-start lh-1">
                    <div class="fw-bold text-dark" style="font-size: 0.75rem;">Nadia Putri</div>
                    <div class="text-muted" style="font-size: 0.65rem;">Researcher</div>
                  </div>
                  <i class="bi bi-chevron-down text-muted" style="font-size: 0.65rem;"></i>
                </div>
              </div>

              <!-- Window Inner Body -->
              <div class="card-body p-0">
                <div class="row g-0">
                  <!-- Sidebar -->
                  <div class="col-md-4 border-end p-3 d-none d-md-flex flex-column justify-content-between" style="background-color: #FAFBFA; border-color: #EEF2F6;">
                    <div>
                      <div class="fw-bold fs-6 mb-3 d-flex align-items-center gap-1" style="color: #0E3B43;">
                        <span>QwizHub</span>
                      </div>
                      
                      <!-- Sidebar Nav List -->
                      <div class="d-flex flex-column gap-1" style="font-size: 0.8rem;">
                        <div class="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 text-secondary">
                          <i class="bi bi-file-earmark-text"></i>
                          <span>Research Setup</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 fw-semibold position-relative" style="background-color: #EBF5F3; color: #137A7F;">
                          <span class="position-absolute start-0 top-0 bottom-0 rounded-start" style="width: 3px; background-color: #137A7F;"></span>
                          <i class="bi bi-sliders"></i>
                          <span>Variables</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 text-secondary">
                          <i class="bi bi-chat-square-text"></i>
                          <span>Questions</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 text-secondary">
                          <i class="bi bi-stars"></i>
                          <span>AI Review</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 px-2 py-1.5 rounded-2 text-secondary">
                          <i class="bi bi-people"></i>
                          <span>Respondents</span>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom Widget in Sidebar -->
                    <div class="card border rounded-3 p-2 bg-white mt-4" style="border-color: #E2E8F0; font-size: 0.75rem;">
                      <div class="text-muted" style="font-size: 0.7rem;">Your Research</div>
                      <div class="fw-bold text-dark mt-0.5">3/5 <span class="text-muted fw-normal" style="font-size: 0.7rem;">instrument</span></div>
                      <a href="#" class="text-decoration-none fw-semibold d-inline-flex align-items-center gap-1 mt-2" style="color: #137A7F; font-size: 0.75rem;">
                        <i class="bi bi-file-earmark-arrow-up"></i>
                        <span>Upgrade Plan &rarr;</span>
                      </a>
                    </div>
                  </div>

                  <!-- Main Content Area -->
                  <div class="col-md-8 p-3 p-md-3.5 bg-white">
                    <!-- Top Status -->
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-bold text-dark" style="font-size: 0.85rem;">Instrument Builder</span>
                      <span class="d-inline-flex align-items-center gap-1 text-muted" style="font-size: 0.7rem;">
                        <i class="bi bi-check-circle-fill" style="color: #10B981;"></i>
                        <span>Auto-saved 2 minutes ago</span>
                      </span>
                    </div>

                    <!-- Project Title Bar -->
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                      <span class="fw-bold text-dark text-truncate" style="font-size: 0.8rem;">Pengaruh Kemudahan Penggunaan Aplikasi terhadap Kepuasan Pengguna</span>
                      <i class="bi bi-three-dots text-muted ms-2"></i>
                    </div>

                    <!-- Secondary Tabs Bar -->
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <button class="btn btn-sm btn-light border fw-semibold py-0.5 px-2.5 rounded-pill text-dark" style="font-size: 0.75rem;">Variables</button>
                      <button class="btn btn-sm btn-outline-secondary py-0.5 px-2 rounded-pill text-muted" style="font-size: 0.75rem;">+ Add Variable</button>
                    </div>

                    <!-- Split Area: Variable Tree (Left) & Indicator Pane (Right) -->
                    <div class="row g-2">
                      <!-- Mini Tree Column -->
                      <div class="col-4 border-end pe-2" style="font-size: 0.75rem;">
                        <div class="mb-2">
                          <div class="fw-semibold text-dark d-flex align-items-center gap-1 mb-1">
                            <i class="bi bi-caret-down-fill text-muted" style="font-size: 0.65rem;"></i>
                            <span>Ease of Use</span>
                          </div>
                          <div class="ps-3 d-flex flex-column gap-1 text-muted">
                            <div>• Easy to Learn</div>
                            <div class="fw-semibold px-1 rounded position-relative" style="color: #137A7F; background-color: #EBF5F3;">
                              <span class="position-absolute start-0 top-0 bottom-0" style="width: 2px; background-color: #137A7F;"></span>
                              • Easy to Use
                            </div>
                          </div>
                        </div>
                        <div class="fw-semibold text-dark d-flex align-items-center gap-1">
                          <i class="bi bi-caret-right-fill text-muted" style="font-size: 0.65rem;"></i>
                          <span>Satisfaction</span>
                        </div>
                      </div>

                      <!-- Detail & Question Cards Column -->
                      <div class="col-8 ps-2">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <div>
                            <div class="text-muted" style="font-size: 0.65rem;">Indicator</div>
                            <div class="fw-bold text-dark" style="font-size: 0.8rem;">Easy to Use</div>
                          </div>
                          <span class="badge border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1" style="color: #137A7F; background-color: #EBF5F3; border-color: #A7F3D0; font-size: 0.7rem;">
                            <i class="bi bi-stars"></i> AI
                          </span>
                        </div>
                        <p class="text-muted mb-2" style="font-size: 0.7rem;">Item pertanyaan untuk mengukur kemudahan penggunaan aplikasi.</p>

                        <!-- Question 1 Card -->
                        <div class="border rounded-2 p-2 mb-2 bg-white" style="border-color: #E2E8F0;">
                          <div class="d-flex justify-content-between align-items-start mb-1">
                            <div class="d-flex align-items-center gap-1.5">
                              <span class="badge rounded-1" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">Q1</span>
                              <span class="text-dark fw-medium" style="font-size: 0.75rem;">Saya merasa aplikasi Shopee mudah digunakan.</span>
                            </div>
                            <i class="bi bi-three-dots text-muted" style="font-size: 0.7rem;"></i>
                          </div>
                          <div class="d-flex align-items-center gap-2 pt-1">
                            <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.65rem;">Likert 1-5</span>
                            <span class="badge rounded-pill text-white fw-medium d-inline-flex align-items-center gap-1" style="background-color: #10B981; font-size: 0.65rem;">
                              <i class="bi bi-check-circle-fill"></i> All Check: Good
                            </span>
                          </div>
                        </div>

                        <!-- Question 2 Card with Warning Callout -->
                        <div class="border rounded-2 p-2 bg-white" style="border-color: #E2E8F0;">
                          <div class="d-flex justify-content-between align-items-start mb-1">
                            <div class="d-flex align-items-center gap-1.5">
                              <span class="badge rounded-1" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">Q2</span>
                              <span class="text-dark fw-medium" style="font-size: 0.725rem;">Saya merasa aplikasi Shopee mudah digunakan dan fiturnya sangat lengkap.</span>
                            </div>
                            <i class="bi bi-three-dots text-muted" style="font-size: 0.7rem;"></i>
                          </div>
                          <div class="mb-1.5">
                            <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.65rem;">Likert 1-5</span>
                          </div>

                          <!-- Embedded Red AI Review Callout -->
                          <div class="rounded-2 p-2" style="background-color: #FEF2F2; border: 1px solid #FECACA;">
                            <div class="d-flex align-items-center gap-1 fw-bold text-danger mb-1" style="font-size: 0.7rem;">
                              <i class="bi bi-exclamation-triangle-fill"></i>
                              <span>AI Review</span>
                            </div>
                            <p class="text-danger mb-1" style="font-size: 0.675rem;">Pertanyaan ini mengukur dua hal sekaligus.</p>
                            <div class="text-secondary fw-semibold" style="font-size: 0.65rem;">Saran perbaikan:</div>
                            <div class="text-dark fw-medium mb-2" style="font-size: 0.675rem;">"Saya merasa aplikasi Shopee mudah digunakan."</div>
                            <div class="d-flex gap-1.5">
                              <button class="btn btn-sm text-white py-0.5 px-2 fw-semibold rounded-1" style="background-color: #137A7F; font-size: 0.65rem;">Apply Suggestion</button>
                              <button class="btn btn-sm btn-light border py-0.5 px-2 text-secondary rounded-1" style="font-size: 0.65rem;">Edit Manual</button>
                            </div>
                          </div>
                        </div>

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

            <!-- Right: Mini Preview Card echoing Instrument Builder UI -->
            <div class="col-lg-5 mt-4 mt-lg-0">
              <div class="card border rounded-4 p-3.5 p-lg-4 bg-white shadow-sm" style="border-color: #E2E8F0;">
                <!-- Window Chrome Dots & Status -->
                <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style="border-color: #F1F5F9;">
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="rounded-circle d-inline-block" style="width: 10px; height: 10px; background-color: #EF4444;"></span>
                    <span class="rounded-circle d-inline-block" style="width: 10px; height: 10px; background-color: #F59E0B;"></span>
                    <span class="rounded-circle d-inline-block" style="width: 10px; height: 10px; background-color: #10B981;"></span>
                  </div>
                  <span class="badge rounded-pill text-white fw-medium d-inline-flex align-items-center gap-1" style="background-color: #10B981; font-size: 0.65rem;">
                    <i class="bi bi-check-circle-fill"></i> Instrument Ready
                  </span>
                </div>

                <!-- Instrument Title & Info -->
                <div class="mb-3">
                  <div class="text-secondary small" style="font-size: 0.7rem;">Contoh Riset Terstruktur</div>
                  <div class="fw-bold text-dark" style="font-size: 0.875rem;">Pengaruh Kemudahan Penggunaan Aplikasi terhadap Kepuasan Pengguna</div>
                  <div class="d-flex gap-2 text-secondary mt-1" style="font-size: 0.725rem;">
                    <span>3 Variabel</span>
                    <span>•</span>
                    <span>8 Indikator</span>
                    <span>•</span>
                    <span>Skala Likert</span>
                  </div>
                </div>

                <!-- Evaluated Question Snippet -->
                <div class="border rounded-2 p-2.5 mb-2.5 bg-white" style="border-color: #E2E8F0;">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="d-flex align-items-center gap-1.5">
                      <span class="badge rounded-1" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">Q1</span>
                      <span class="text-dark fw-medium" style="font-size: 0.75rem;">Saya merasa aplikasi mudah digunakan.</span>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2 pt-1">
                    <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.65rem;">Likert 1-5</span>
                    <span class="badge rounded-pill text-white fw-medium d-inline-flex align-items-center gap-1" style="background-color: #10B981; font-size: 0.65rem;">
                      <i class="bi bi-check-circle-fill"></i> All Check: Good
                    </span>
                  </div>
                </div>

                <!-- Matching Responden Indicator -->
                <div class="p-2.5 rounded-2" style="background-color: #F8FAFA; border: 1px solid #E2E8F0;">
                  <div class="d-flex justify-content-between align-items-center mb-1.5" style="font-size: 0.75rem;">
                    <span class="text-secondary d-flex align-items-center gap-1.5">
                      <i class="bi bi-people-fill text-muted"></i>
                      <span>Target Responden: Mahasiswa</span>
                    </span>
                    <span class="fw-bold" style="color: #137A7F;">150 / 150 Siap</span>
                  </div>
                  <div class="progress" style="height: 6px; background-color: #E2E8F0;">
                    <div class="progress-bar rounded-pill" style="width: 100%; background-color: #137A7F;"></div>
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
