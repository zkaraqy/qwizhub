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
                <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 fw-semibold text-dark" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown">
                  <span class="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold" style="width: 34px; height: 34px; font-size: 0.85rem; background-color: #137A7F;">
                    {{ data?.user?.name?.charAt(0) || 'U' }}
                  </span>
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
    <section class="py-4 py-lg-5" id="features">
      <div class="container">
        <div class="row g-4">
          <!-- Card 1 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 h-100 bg-white shadow-xs transition-hover" style="border-color: #E4E9E7;">
              <div class="d-flex justify-content-between align-items-start">
                <div class="rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: #EBF5F3; color: #137A7F;">
                  <i class="bi bi-file-earmark-text fs-4"></i>
                </div>
                <div class="rounded-circle border d-inline-flex align-items-center justify-content-center text-secondary" style="width: 38px; height: 38px; border-color: #E2E8F0;">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">Susun Instrumen</h5>
              <p class="text-secondary small mb-0" style="line-height: 1.6;">
                Mulai dari topik, tujuan penelitian, hingga variabel dan indikator dengan panduan yang terstruktur.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 h-100 bg-white shadow-xs transition-hover" style="border-color: #E4E9E7;">
              <div class="d-flex justify-content-between align-items-start">
                <div class="rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: #EBF5F3; color: #137A7F;">
                  <i class="bi bi-stars fs-4"></i>
                </div>
                <div class="rounded-circle border d-inline-flex align-items-center justify-content-center text-secondary" style="width: 38px; height: 38px; border-color: #E2E8F0;">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">AI Review</h5>
              <p class="text-secondary small mb-0" style="line-height: 1.6;">
                Deteksi potensi bias, kalimat ambigu, dan dapatkan saran skala yang sesuai dengan teori penelitian.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="col-md-4">
            <div class="card border rounded-4 p-4 h-100 bg-white shadow-xs transition-hover" style="border-color: #E4E9E7;">
              <div class="d-flex justify-content-between align-items-start">
                <div class="rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: #EBF5F3; color: #137A7F;">
                  <i class="bi bi-people fs-4"></i>
                </div>
                <div class="rounded-circle border d-inline-flex align-items-center justify-content-center text-secondary" style="width: 38px; height: 38px; border-color: #E2E8F0;">
                  <i class="bi bi-arrow-right"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-2">Cari Responden</h5>
              <p class="text-secondary small mb-0" style="line-height: 1.6;">
                Temukan responden yang sesuai dengan kriteria usia, domisili, dan pekerjaan secara mudah dan cepat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5-Step Process Section matching the bottom reference card -->
    <section class="py-4 py-lg-5" id="how-it-works">
      <div class="container">
        <div class="card border rounded-4 p-4 p-lg-5 bg-white shadow-xs" style="border-color: #E4E9E7;">
          <!-- Card Header -->
          <div class="row align-items-end mb-4">
            <div class="col-lg-7">
              <p class="text-uppercase fw-bold small mb-1" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.775rem;">
                ALUR PENELITIAN BERSAMA QWIZHUB
              </p>
              <h2 class="display-6 fw-bold mb-0 lh-sm" style="color: #0E3B43;">
                Dari ide hingga data, dalam <span style="color: #137A7F;">lima langkah.</span>
              </h2>
            </div>
            <div class="col-lg-5 text-lg-end mt-2 mt-lg-0">
              <p class="text-secondary mb-0 small" style="line-height: 1.5;">
                Proses penelitian yang kompleks,<br class="d-none d-lg-block">
                sekarang jadi lebih sederhana.
              </p>
            </div>
          </div>

          <!-- 5 Steps Flow in a row with arrows -->
          <div class="d-flex flex-wrap flex-lg-nowrap align-items-start justify-content-between gap-3 mt-4 pt-2" id="steps">
            <!-- Step 1 -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1" style="min-width: 170px;">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #EBF5F3; color: #137A7F;">
                <i class="bi bi-lightbulb fs-5"></i>
              </div>
              <div>
                <div class="fw-semibold text-secondary" style="font-size: 0.75rem;">1</div>
                <h6 class="fw-bold text-dark mb-1" style="font-size: 0.875rem;">Topik Penelitian</h6>
                <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.4;">Tentukan topik dan tujuan penelitian Anda.</p>
              </div>
            </div>

            <!-- Arrow 1 -->
            <div class="d-none d-lg-flex align-items-center pt-3 text-secondary opacity-50">
              <i class="bi bi-arrow-right fs-5"></i>
            </div>

            <!-- Step 2 -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1" style="min-width: 170px;">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #EBF5F3; color: #137A7F;">
                <i class="bi bi-file-earmark-text fs-5"></i>
              </div>
              <div>
                <div class="fw-semibold text-secondary" style="font-size: 0.75rem;">2</div>
                <h6 class="fw-bold text-dark mb-1" style="font-size: 0.875rem;">Variabel & Indikator</h6>
                <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.4;">Susun variabel, indikator, dan definisi operasional.</p>
              </div>
            </div>

            <!-- Arrow 2 -->
            <div class="d-none d-lg-flex align-items-center pt-3 text-secondary opacity-50">
              <i class="bi bi-arrow-right fs-5"></i>
            </div>

            <!-- Step 3 -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1" style="min-width: 170px;">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #EBF5F3; color: #137A7F;">
                <i class="bi bi-list-check fs-5"></i>
              </div>
              <div>
                <div class="fw-semibold text-secondary" style="font-size: 0.75rem;">3</div>
                <h6 class="fw-bold text-dark mb-1" style="font-size: 0.875rem;">Item Pertanyaan</h6>
                <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.4;">Buat dan kembangkan item pertanyaan.</p>
              </div>
            </div>

            <!-- Arrow 3 -->
            <div class="d-none d-lg-flex align-items-center pt-3 text-secondary opacity-50">
              <i class="bi bi-arrow-right fs-5"></i>
            </div>

            <!-- Step 4 -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1" style="min-width: 170px;">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #EBF5F3; color: #137A7F;">
                <i class="bi bi-stars fs-5"></i>
              </div>
              <div>
                <div class="fw-semibold text-secondary" style="font-size: 0.75rem;">4</div>
                <h6 class="fw-bold text-dark mb-1" style="font-size: 0.875rem;">AI Check</h6>
                <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.4;">Evaluasi kualitas pertanyaan dengan bantuan AI.</p>
              </div>
            </div>

            <!-- Arrow 4 -->
            <div class="d-none d-lg-flex align-items-center pt-3 text-secondary opacity-50">
              <i class="bi bi-arrow-right fs-5"></i>
            </div>

            <!-- Step 5 -->
            <div class="d-flex align-items-start gap-2.5 flex-grow-1" style="min-width: 170px;">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background-color: #EBF5F3; color: #137A7F;">
                <i class="bi bi-people fs-5"></i>
              </div>
              <div>
                <div class="fw-semibold text-secondary" style="font-size: 0.75rem;">5</div>
                <h6 class="fw-bold text-dark mb-1" style="font-size: 0.875rem;">Matching Responden</h6>
                <p class="text-secondary mb-0" style="font-size: 0.775rem; line-height: 1.4;">Temukan responden yang paling sesuai.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Optional CTA Section -->
    <section class="py-5" id="cta" v-if="!data">
      <div class="container">
        <div class="card border-0 rounded-4 p-5 text-center text-white shadow-sm" style="background-color: #0E3B43;">
          <h2 class="display-6 fw-bold mb-3">Siap memulai penelitian Anda?</h2>
          <p class="lead mb-4 opacity-75 mx-auto" style="max-width: 650px; font-size: 1rem;">
            Bergabung bersama ribuan peneliti dan mahasiswa yang telah menggunakan QwizHub untuk menyusun instrumen penelitian berkualitas.
          </p>
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <NuxtLink to="/register" class="btn btn-light btn-lg px-4 py-2.5 fw-bold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" style="color: #0E3B43;" id="cta-register">
              <span>Mulai Gratis Sekarang</span>
              <i class="bi bi-arrow-right"></i>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-4 bg-white border-top mt-auto">
      <div class="container d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-2">
          <span class="fw-bold fs-5" style="color: #0E3B43;">QwizHub</span>
          <span class="small text-muted">| Platform riset dan instrumen penelitian terpercaya</span>
        </div>
        <p class="small mb-0 text-muted">&copy; 2026 QwizHub. All rights reserved.</p>
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
.transition-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transition-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(14, 59, 67, 0.08) !important;
}

.shadow-xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
</style>
