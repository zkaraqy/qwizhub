# QwizHub

Platform riset & instrumen penelitian berbasis **Nuxt 4** dengan AI untuk mengelola kuisioner, responden, analitik, dan sistem honor.

## Quick Start (1 Menit)

```bash
# Clone & Install
git clone https://github.com/zkaraqy/qwizhub.git
cd qwizhub
npm install

# Setup Environment (Windows)
copy .env.example .env
# Edit .env: isi DB_* dan NEXTAUTH_SECRET

# Setup Database
npm run db:migrate
npm run db:seed:admin

# Run
npm run dev
# Akses: http://localhost:3000
# Login: admin@qwizhub.com / admin123
```

---

## Daftar Isi

1. [Deskripsi Proyek](#deskripsi-proyek)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Akun Demo per Role](#akun-demo-per-role)
5. [Prasyarat Sistem](#prasyarat-sistem)
6. [Panduan Instalasi Lengkap](#panduan-instalasi-lengkap)
7. [Konfigurasi Environment](#konfigurasi-environment)
8. [Setup Database](#setup-database)
9. [Menjalankan Aplikasi](#menjalankan-aplikasi)
10. [Panduan Penggunaan per Role](#panduan-penggunaan-per-role)
11. [API & Endpoint Utama](#api--endpoint-utama)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Arsitektur & Database](#arsitektur--database)
15. [Keamanan & Production](#keamanan--production)
16. [Struktur Folder](#struktur-folder)
17. [Lisensi](#lisensi)

---

## Deskripsi Proyek

**QwizHub** adalah platform riset digital yang membantu peneliti dan mahasiswa menyusun instrumen penelitian dengan bantuan AI, mengevaluasi kualitas pertanyaan, dan mengelola responden secara terintegrasi.

### Konsep Utama

Platform ini mengintegrasikan tiga komponen inti:

1. **Manajemen Penelitian**: Kelola proyek penelitian, buat kuisioner dengan berbagai tipe pertanyaan
2. **AI Assistant**: Generate, rewrite, dan improve pertanyaan penelitian dengan AI (OpenRouter)
3. **Sistem Honor**: Responden mendapat reward per kuisioner, dapat ditarik melalui sistem withdrawal

### Role Pengguna

- **Admin**: Mengelola sistem, approve withdrawal honor, monitor platform
- **Peneliti**: Membuat kuisioner, gunakan AI untuk improve instrumen, analisis data
- **Responden**: Isi kuisioner, kumpulkan honor, tarik penghasilan

---

## Fitur Utama

### 🔬 Untuk Peneliti

**Manajemen Proyek & Kuisioner**
- Buat proyek penelitian dengan metadata lengkap
- Desain kuisioner dengan drag-and-drop question builder
- Multiple question types: text, textarea, radio, checkbox, select, scale (Likert)
- Definisi variabel penelitian dan indikator
- Atur honor per responden untuk insentif pengisian

**Fitur AI (Powered by OpenRouter)**
- ✨ **Generate Pertanyaan Otomatis** (10 token): AI membuat pertanyaan berdasarkan topik/variabel penelitian
- 🔄 **Rewrite Pertanyaan** (5 token): Dapatkan 3 variasi rewrite untuk setiap pertanyaan
- 💡 **Saran Perbaikan** (5 token): AI analisis kuisioner dan beri rekomendasi improvement
- 🎯 **AI Review**: Otomatis evaluasi kualitas setiap pertanyaan

**Sistem AI Token**
- Gratis 100 token saat registrasi peneliti
- Top-up paket: 100, 500, 1000 token via Midtrans
- Track riwayat penggunaan token
- Rate limiting: 5 request AI per 60 menit

**Publikasi & Monitoring**
- Publikasi kuisioner dengan payment gateway (Midtrans)
- Real-time monitoring jumlah respons
- Dashboard statistik per kuisioner
- Export data ke Excel (.xlsx) untuk analisis lanjutan
- Visualisasi data dengan Chart.js

### 👥 Untuk Responden

**Profil & Demografi**
- Profil lengkap: usia, jenis kelamin, pendidikan, pekerjaan, domisili, penghasilan
- Update profil kapan saja

**Pengisian Kuisioner**
- Browse kuisioner aktif yang tersedia
- Lihat estimasi waktu dan honor sebelum mulai
- Interface responsif dan user-friendly
- Track kuisioner yang sudah diisi

**Sistem Honor (Reward)**
- Dapatkan honor otomatis setelah submit kuisioner
- Dashboard honor: total earned, withdrawn, available balance
- Riwayat transaksi honor lengkap

**Penarikan Honor**
- Minimal withdrawal: **Rp 50.000**
- Metode: Transfer bank atau e-wallet
- Request withdrawal dengan informasi rekening
- Track status: pending → approved → paid
- Cancel withdrawal jika masih pending

### 🛡️ Untuk Admin

**Dashboard & Monitoring**
- Statistik platform: jumlah user, kuisioner, responses
- Monitor aktivitas peneliti dan responden
- Akses ke semua data sistem

**Manajemen Withdrawal**
- Review permintaan penarikan honor responden
- Approve atau reject withdrawal dengan catatan
- Tandai sebagai "paid" setelah transfer dilakukan
- Track semua withdrawal: pending, approved, paid, rejected

---

## Teknologi yang Digunakan

### Core Stack
- **Framework**: Nuxt 4.1+ (Vue 3, TypeScript)
- **Runtime**: Node.js 18+ dengan npm 9+
- **Database**: PostgreSQL 13+ dengan Sequelize ORM
- **Authentication**: @sidebase/nuxt-auth + NextAuth.js 4.21

### Frontend
- **UI Framework**: Bootstrap 5.3.8 + Bootstrap Icons
- **State Management**: Vue 3 Composition API + Composables
- **Charts**: Chart.js 4.5
- **Drag & Drop**: VueDraggable + Sortable.js
- **Notifications**: SweetAlert2
- **Image Optimization**: @nuxt/image

### Backend & Services
- **AI Provider**: OpenRouter (via openai SDK) - support multiple LLM models
  - Default: deepseek/deepseek-chat
  - Alternatives: Claude, GPT, Gemini, Llama
- **Payment Gateway**: Midtrans Snap (midtrans-client)
- **Email**: Nodemailer
- **File Processing**: ExcelJS (untuk export data)

### Development & Testing
- **Testing**: Vitest + @nuxt/test-utils
- **Type Safety**: TypeScript strict mode
- **Database Migration**: Sequelize CLI
- **Dev Tools**: Nuxt DevTools

---

## Akun Demo per Role

> **PENTING**: Gunakan akun berikut untuk pengujian dan demo aplikasi.

### 1) Role Responden
- **Email**: `responden@gmail.com`
- **Password**: `123456`
- **Akses**: Isi kuisioner, kelola honor, ajukan withdrawal

### 2) Role Peneliti
- **Email**: `peneliti@gmail.com`
- **Password**: `123456`
- **Akses**: Buat kuisioner, gunakan AI, export data, top-up token

### 3) Role Admin
- **Email**: `admin@qwizhub.com`
- **Password**: `admin123`
- **Akses**: Dashboard admin, approve withdrawal, monitor sistem

---

## Prasyarat Sistem

### Minimum Requirements

**Wajib:**
- **Node.js** >= 18.0.0 (disarankan Node 20 LTS)
- **npm** >= 9.0.0
- **PostgreSQL** >= 13.0
- **Git** untuk version control

**Opsional tapi Direkomendasikan:**
- **pgAdmin 4** atau **DBeaver** untuk GUI database management
- **Postman** atau **Thunder Client** untuk testing API
- **OpenRouter API Key** untuk fitur AI (gratis tier tersedia)
- **Midtrans Account** (sandbox/production) untuk payment gateway

### Cara Verifikasi Prasyarat

```bash
# Check Node.js version
node --version  # harus >= v18.0.0

# Check npm version
npm --version   # harus >= 9.0.0

# Check PostgreSQL
psql --version  # harus >= 13.x

# Check Git
git --version
```

---

## Panduan Instalasi Lengkap

### 1. Clone Repository

```bash
git clone https://github.com/zkaraqy/qwizhub.git
cd qwizhub
```

### 2. Install Dependencies

```bash
npm install
```

Proses ini akan menginstall semua package yang diperlukan (~5-10 menit tergantung koneksi internet).

### 3. Siapkan File Environment

**Untuk Linux/Mac:**
```bash
cp .env.example .env
```

**Untuk Windows CMD:**
```cmd
copy .env.example .env
```

**Untuk Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

### 4. Generate NEXTAUTH_SECRET

Secret key untuk enkripsi session. Generate dengan salah satu cara:

**Cara 1 - OpenSSL (recommended):**
```bash
openssl rand -base64 32
```

**Cara 2 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy hasil output dan paste ke `.env` pada bagian `NEXTAUTH_SECRET`.

### 5. Setup Database PostgreSQL

**Buat database baru:**

```sql
-- Login ke PostgreSQL
psql -U postgres

-- Buat database
CREATE DATABASE qwizhub;

-- Buat user (opsional, bisa pakai user postgres)
CREATE USER qwizhub_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE qwizhub TO qwizhub_user;

-- Keluar
\q
```

---dev-secret-change-this

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=qwizhub
DB_PORT=5432

APP_URL=http://localhost:3000
MIDTRANS_IS_PRODUCTION=false
```

### 5. Buat database PostgreSQL

Masuk PostgreSQL lalu buat DB:

```sql
CREATE DATABASE qwizhub;
```

### 6. Jalankan migrasi database

```bash
npm run db:migrate
```

### 7. Jalankan seeding data (opsional tapi direkomendasikan untuk demo)

```bash
npm run db:seed
```

Jika hanya ingin seed admin:

```bash
npm run db:seed:admin
```

### 8. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan tersedia di:
- `http://localhost:3000`

---

## Konfigurasi Environment

Mengacu pada `.env.example`, berikut ringkasan variabel penting:

### Auth
- `AUTH_ORIGIN` → endpoint auth origin Nuxt Auth
- `NEXTAUTH_URL` → base URL aplikasi
- `NEXTAUTH_SECRET` → secret untuk session/token auth (**wajib**)

### OAuth Google (opsional)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Database
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

### AI (opsional)
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `AI_RATE_LIMIT_REQUESTS`
- `AI_RATE_LIMIT_WINDOW_MINUTES`
- `AI_REQUEST_TIMEOUT_MS`

### Midtrans
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`

---

## Setup Database

### Perintah migration
- Jalankan migrasi:
  ```bash
  npm run db:migrate
  ```
- Undo 1 langkah:
  ```bash
  npm run db:migrate:undo
  ```
- Undo semua migrasi:
  ```bash
  npm run db:migrate:undo:all
  ```

### Perintah seeding
- Semua seeder:
  ```bash
  npm run db:seed
  ```
- Seeder admin:
  ```bash
  npm run db:seed:admin
  ```

---

## Menjalankan Aplikasi

### Mode development
```bash
npm run dev
```

### Preview production build lokal
```bash
npm run build
npm run preview
```

---

## Panduan Penggunaan per Role

Berikut adalah panduan lengkap penggunaan aplikasi untuk setiap role dengan fitur-fitur yang tersedia.

---

### 🛡️ A. Admin

#### Akses & Login
- **URL**: http://localhost:3000/login
- **Email**: `admin@qwizhub.com`
- **Password**: `admin123`

#### Fitur-Fitur Admin

**1. Dashboard Admin**
- Lihat statistik platform secara keseluruhan
- Monitor jumlah user (peneliti & responden)
- Monitor jumlah kuisioner aktif
- Monitor total responses yang masuk
- Grafik aktivitas platform

**2. Manajemen Withdrawal Honor**

Akses: Menu "Honor Withdrawals" atau `/admin/honor/withdrawals`

- **Lihat Semua Permintaan Withdrawal**
  - Filter berdasarkan status: All, Pending, Approved, Paid, Rejected
  - Lihat detail: nama responden, jumlah, metode pembayaran, rekening

- **Review Withdrawal (Status: Pending)**
  - Klik "Review" pada withdrawal pending
  - Lihat detail lengkap responden dan riwayat transaksi
  - Verifikasi informasi rekening
  - Pilih tindakan:
    - **Approve**: Setujui permintaan withdrawal
    - **Reject**: Tolak dengan memberikan alasan penolakan

- **Proses Payment (Status: Approved)**
  - Transfer dana ke rekening responden sesuai metode yang dipilih
  - Setelah transfer selesai, tandai withdrawal sebagai "Paid"
  - System akan otomatis update saldo responden

- **Track & Monitor**
  - Lihat riwayat lengkap semua withdrawal
  - Export data withdrawal untuk laporan keuangan
  - Monitor pending withdrawals yang perlu diproses

**3. Manajemen Pengguna**
- Monitor daftar user (peneliti & responden)
- Lihat aktivitas per user
- Kelola status verifikasi user (jika implemented)

**4. Monitoring Sistem**
- Monitor integrasi payment gateway (Midtrans)
- Lihat log transaksi AI token
- Monitor error logs dan system health

#### Workflow Tipikal Admin

```
1. Login ke dashboard admin
2. Cek dashboard untuk overview aktivitas
3. Buka menu "Honor Withdrawals"
4. Review withdrawal yang pending:
   - Verifikasi identitas responden
   - Cek validitas rekening
   - Approve atau Reject
5. Untuk approved withdrawals:
   - Lakukan transfer manual ke rekening responden
   - Tandai sebagai "Paid" di sistem
6. Monitor statistik platform secara berkala
```

---

### 🔬 B. Peneliti

#### Akses & Login
- **URL**: http://localhost:3000/login
- **Email**: `peneliti@gmail.com`
- **Password**: `123456`
- **Bonus**: 100 AI Token Gratis saat registrasi baru

#### Fitur-Fitur Peneliti

**1. Dashboard Peneliti**
- Overview statistik: total proyek, kuisioner, responses
- Saldo AI Token real-time
- Quick actions: Buat Proyek, Top-up Token
- Daftar kuisioner dengan status & jumlah responses
- Grafik responses per kuisioner

**2. Manajemen Proyek**
- **Buat Proyek**: Judul, deskripsi, tujuan penelitian, timeline
- **Edit/Hapus**: Kelola proyek yang sudah ada
- **Manage Kuisioner**: Buat dan kelola kuisioner dalam proyek

**3. Membuat Kuisioner**

**Setup Dasar:**
- Judul & deskripsi kuisioner
- Estimasi waktu pengisian (menit)
- Honor per responden (Rupiah)
- Target jumlah responden

**Definisi Variabel (Opsional untuk penelitian akademis):**
- Tambah variabel penelitian (contoh: "Kepuasan Pelanggan")
- Definisi operasional per variabel
- Tambah indikator untuk setiap variabel
- Link pertanyaan ke indikator tertentu

**Menambah Pertanyaan - 3 Cara:**

**Cara 1: Manual**
- Ketik pertanyaan sendiri
- Pilih tipe: text, textarea, radio, checkbox, select, scale (Likert)
- Atur opsi jawaban (untuk pilihan ganda)
- Link ke indikator (opsional)

**Cara 2: AI Generate (10 token)**
- Input topik penelitian & variabel
- Tentukan jumlah & tipe pertanyaan
- AI generate pertanyaan otomatis
- Review & edit hasil
- Simpan yang sesuai

**Cara 3: AI Rewrite (5 token)**
- Pilih pertanyaan existing
- AI beri 3 variasi rewrite
- Pilih versi terbaik
- Update pertanyaan

**AI Suggestions (5 token):**
- Analisis keseluruhan kuisioner
- Saran perbaikan wording
- Rekomendasi tipe skala
- Deteksi ambiguitas
- Improvement struktur

**Drag & Drop:**
- Reorder pertanyaan dengan drag-and-drop
- Grouping per section

**4. Sistem AI Token**

**Biaya AI:**
- Generate pertanyaan: 10 token
- Rewrite pertanyaan: 5 token
- AI Suggestions: 5 token
- Rate limit: 5 request per 60 menit

**Top-up Token:**
- Pilih paket: 100, 500, atau 1000 token
- Bayar via Midtrans (card, bank transfer, e-wallet, retail)
- Token masuk otomatis setelah payment success

**Riwayat Token:**
- Track semua transaksi token
- Lihat saldo real-time
- Filter by date/type

**5. Publikasi Kuisioner**
1. Review semua pertanyaan
2. Preview kuisioner
3. Klik "Publish"
4. Bayar biaya publikasi via Midtrans
5. Kuisioner aktif setelah payment success
6. Salin link untuk dibagikan ke responden

**6. Monitoring & Analisis**

**Real-time Monitoring:**
- Jumlah responses per kuisioner
- Progress bar target responses
- Notifikasi response baru

**Lihat Detail Responses:**
- Daftar semua responden
- Waktu pengisian
- Status: completed/incomplete
- Detail jawaban per responden

**Export Data:**
- Export ke Excel (.xlsx)
- Sheet 1: Raw data (1 row per responden)
- Sheet 2: Summary statistics
- Sheet 3: Crosstab data
- Import ke SPSS/R/Python untuk analisis

**Visualisasi:**
- Chart.js untuk grafik real-time
- Distribusi jawaban per pertanyaan
- Demographics responden

**7. Workflow Tipikal**

```
1. Login & check saldo AI token
2. Buat proyek penelitian
3. Buat kuisioner dalam proyek
4. Generate pertanyaan dengan AI (10 token)
5. Edit & refine manual
6. Rewrite dengan AI (5 token/question)
7. Minta AI suggestions (5 token)
8. Preview & publish (bayar via Midtrans)
9. Bagikan link ke responden
10. Monitor responses di dashboard
11. Export data saat target tercapai
12. Analisis dengan tools statistik
```

---

### 👥 C. Responden

#### Akses & Login
- **URL**: http://localhost:3000/login  
- **Email**: `responden@gmail.com`
- **Password**: `123456`

#### Fitur-Fitur Responden

**1. Setup Profil**
- Lengkapi profil demografis: nama, usia, jenis kelamin
- Pendidikan, pekerjaan, domisili, penghasilan
- Upload foto profil (opsional)
- Update profil kapan saja

**2. Dashboard Responden**
- Total kuisioner yang sudah diisi
- Total honor earned (Rupiah)
- Honor available (bisa ditarik)
- Honor pending withdrawal
- Daftar kuisioner baru
- Status withdrawal terbaru

**3. Browse & Isi Kuisioner**

**Lihat Daftar:**
- Browse kuisioner available
- Lihat: judul, deskripsi, estimasi waktu, honor
- Filter by topik, honor range, waktu

**Mengisi:**
1. Pilih kuisioner
2. Baca instruksi & konfirmasi honor
3. Klik "Mulai Mengisi"
4. Jawab semua pertanyaan (progress bar)
5. Review jawaban
6. Submit
7. Honor masuk otomatis

**Track:**
- Lihat kuisioner completed
- Tanggal pengisian
- Honor per kuisioner

**4. Sistem Honor**

**Dashboard Honor:**
- **Total Earned**: Total honor dari semua kuisioner
- **Total Withdrawn**: Total yang sudah ditarik
- **Pending**: Yang sedang diproses
- **Available**: Saldo bisa ditarik (Earned - Withdrawn - Pending)

**Riwayat Transaksi:**
- Tanggal & waktu
- Jenis: Earned / Withdrawal
- Jumlah
- Status
- Keterangan

**5. Penarikan Honor (Withdrawal)**

**Syarat:**
- Minimal saldo: **Rp 50.000**
- Tidak ada pending withdrawal
- Profil lengkap

**Langkah Withdrawal:**
1. Akses `/honor`
2. Cek available balance
3. Klik "Ajukan Penarikan"
4. Isi form:
   - Jumlah (min 50.000)
   - Metode: Transfer Bank / E-Wallet
   - Info rekening (bank, nomor, nama pemilik)
5. Submit request
6. Status: Pending

**Track Status:**
- **Pending**: Menunggu review admin
- **Approved**: Disetujui, admin akan transfer
- **Paid**: Transfer selesai, dana sampai
- **Rejected**: Ditolak (lihat alasan)

**Cancel Withdrawal:**
- Bisa cancel jika masih "Pending"
- Saldo kembali ke available

**6. Workflow Tipikal**

```
Setup:
1. Register & verify email
2. Login & lengkapi profil

Mengumpulkan Honor:
3. Browse kuisioner available
4. Pilih yang sesuai
5. Isi hingga selesai
6. Submit → honor masuk
7. Ulangi untuk kuisioner lain

Withdrawal:
8. Monitor saldo di dashboard
9. Saat >= 50.000:
   - Ajukan withdrawal
   - Isi info rekening
   - Submit
10. Tunggu approval (1-3 hari)
11. Check status di halaman honor
12. Setelah "Paid", dana masuk rekening
```

---

## API & Endpoint Utama

Berikut adalah ringkasan endpoint API yang tersedia di aplikasi:

### Authentication
```
POST   /api/auth/register          - Registrasi user baru
POST   /api/auth/[...nextauth]     - Login/logout NextAuth
```

### Projects (Peneliti)
```
GET    /api/projects               - List semua proyek peneliti
POST   /api/projects               - Buat proyek baru
GET    /api/projects/[id]          - Detail proyek
PUT    /api/projects/[id]          - Update proyek
DELETE /api/projects/[id]          - Hapus proyek
```

### Questionnaires (Peneliti)
```
GET    /api/questionnaires                           - List kuisioner
POST   /api/questionnaires                           - Buat kuisioner baru
GET    /api/questionnaires/[id]                      - Detail kuisioner
PUT    /api/questionnaires/[id]                      - Update kuisioner
DELETE /api/questionnaires/[id]                      - Hapus kuisioner
POST   /api/questionnaires/payment                   - Publikasi kuisioner (payment)
GET    /api/questionnaires/[id]/questions            - List pertanyaan
POST   /api/questionnaires/[id]/questions            - Tambah pertanyaan
PUT    /api/questionnaires/[id]/questions/[qid]      - Update pertanyaan
DELETE /api/questionnaires/[id]/questions/[qid]      - Hapus pertanyaan
```

### AI Features (Peneliti)
```
POST   /api/questions/generate                       - Generate pertanyaan dengan AI (10 token)
POST   /api/questionnaires/[id]/questions/[qid]/rewrite  - Rewrite pertanyaan (5 token)
POST   /api/ai-tokens/suggestion                     - AI suggestions untuk kuisioner (5 token)
```

### AI Tokens (Peneliti)
```
GET    /api/ai-tokens/balance                        - Cek saldo token
GET    /api/ai-tokens/history                        - Riwayat transaksi token
POST   /api/ai-tokens/topup                          - Top-up token (create payment)
POST   /api/ai-tokens/topup/verify                   - Verify payment status
```

### Responses (Responden)
```
GET    /api/responses                                - List responses (peneliti)
POST   /api/responses                                - Submit response baru (responden)
GET    /api/responses/my-responses                   - List responses user (responden)
GET    /api/responses/[responseId]                   - Detail response
```

### Honor System (Responden)
```
GET    /api/honor/balance                            - Cek saldo honor
GET    /api/honor/transactions                       - Riwayat transaksi honor
POST   /api/honor/withdrawals                        - Ajukan withdrawal
GET    /api/honor/withdrawals                        - List withdrawal user
DELETE /api/honor/withdrawals/[id]                   - Cancel withdrawal (pending only)
```

### Admin
```
GET    /api/admin/honor/withdrawals                  - List semua withdrawal
PUT    /api/admin/honor/withdrawals/[id]             - Approve/reject/pay withdrawal
GET    /api/dashboard/peneliti                       - Statistik dashboard peneliti
GET    /api/dashboard/respondent                     - Statistik dashboard responden
```

### Webhooks & Profile
```
POST   /api/webhooks/midtrans                        - Webhook callback Midtrans
GET    /api/profile                                  - Get user profile
PUT    /api/profile                                  - Update profile
```

---

## Troubleshooting

### Database Issues

**Error: database "qwizhub" does not exist**
```sql
-- Buat database manual di PostgreSQL
CREATE DATABASE qwizhub;
```

**Migration Failed**
```bash
# Check koneksi database di .env
# Rollback dan re-run
npm run db:migrate:undo:all
npm run db:migrate
```

**Connection Refused (ECONNREFUSED)**
- Pastikan PostgreSQL service running
- Check port 5432 tidak dipakai aplikasi lain
- Verifikasi DB_HOST, DB_USER, DB_PASSWORD di .env

### Authentication Issues

**Session Expired / Invalid**
- Clear browser cookies
- Login ulang
- Pastikan NEXTAUTH_SECRET tidak berubah

**Google OAuth Error**
- Verifikasi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET
- Check authorized redirect URIs di Google Console: `http://localhost:3000/api/auth/callback/google`

**NEXTAUTH_SECRET Missing**
```bash
# Generate secret baru
openssl rand -base64 32
# Paste ke .env
```

### AI Token Issues

**Insufficient Tokens**
- Top-up token via dashboard peneliti
- Minimal purchase: 100 token

**AI Generation Timeout**
- Check OPENROUTER_API_KEY valid
- Verifikasi koneksi internet
- Coba model yang lebih ringan (gunakan free tier)

**Rate Limit Exceeded**
- Tunggu 60 menit (limit: 5 request/hour)
- Atau adjust AI_RATE_LIMIT_WINDOW_MINUTES di .env

### Payment Issues

**Midtrans Snap Not Loading**
- Check MIDTRANS_CLIENT_KEY di .env
- Verifikasi key sesuai environment (sandbox/production)
- Check browser console untuk error

**Payment Success but Status Not Updated**
- Verifikasi webhook URL configured di Midtrans dashboard
- Webhook URL: `https://your-domain.com/api/webhooks/midtrans`
- Check server logs untuk incoming webhook

**Sandbox vs Production**
- Development: MIDTRANS_IS_PRODUCTION=false
- Production: MIDTRANS_IS_PRODUCTION=true
- Gunakan key yang sesuai environment

### Honor/Withdrawal Issues

**Minimum Withdrawal Not Met**
- Minimal Rp 50.000 (defined di MIN_WITHDRAWAL_AMOUNT)
- Kumpulkan honor hingga mencapai minimum

**Withdrawal Rejected**
- Hubungi admin untuk alasan penolakan
- Perbaiki info yang diminta
- Submit ulang withdrawal

**Pending Too Long**
- Withdrawal membutuhkan approval manual admin
- Normal process: 1-3 hari kerja
- Hubungi admin jika > 3 hari

### Port Issues

**Port 3000 Already in Use**
```bash
# Windows: kill process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain
PORT=3001 npm run dev
```

### Build Issues

**Build Failed - Out of Memory**
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Module Not Found**
```bash
# Clear cache dan reinstall
rm -rf node_modules .nuxt
npm install
npm run dev
```

## Arsitektur & Database

### Database Models

**Core Models:**
- **User**: Data pengguna (peneliti, responden, admin)
- **RespondentProfile**: Data demografis responden
- **Project**: Proyek penelitian milik peneliti
- **Questionnaire**: Kuisioner dalam proyek
- **Question**: Pertanyaan dalam kuisioner
- **ResearchVariable**: Variabel penelitian
- **VariableIndicator**: Indikator per variabel
- **Response**: Jawaban responden untuk kuisioner

**Transaction Models:**
- **HonorTransaction**: Transaksi honor responden (earn/withdraw)
- **HonorWithdrawal**: Request penarikan honor
- **AITokenTransaction**: Transaksi AI token peneliti
- **Transaction**: Payment transactions (Midtrans)

**Auth Models:**
- **Account**: OAuth accounts (Google, etc)
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

### Relationships

```
User (peneliti) 
  → hasMany Project
    → hasMany Questionnaire
      → hasMany Question
      → hasMany ResearchVariable
        → hasMany VariableIndicator

User (responden)
  → hasOne RespondentProfile
  → hasMany Response (per questionnaire)
  → hasMany HonorTransaction
  → hasMany HonorWithdrawal

Question
  → belongsTo VariableIndicator (optional link)
```

### Tech Stack Architecture

```
┌─────────────────────────────────────┐
│         Client (Browser)            │
│    Vue 3 + Nuxt 4 + Bootstrap       │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────┴──────────────────────┐
│         Nuxt Server (Nitro)         │
│   - API Routes (/server/api)        │
│   - Middleware (auth, validation)   │
│   - Services (AI, email, payment)   │
└──────────────┬──────────────────────┘
               │ 
    ┌──────────┼──────────┐
    │          │          │
┌───▼────┐ ┌──▼───────┐ ┌▼────────────┐
│PostgreSQL│ OpenRouter│ │  Midtrans   │
│Sequelize│ │   AI    │ │   Payment   │
└─────────┘ └──────────┘ └─────────────┘
```

---

## Keamanan & Production

### Security Checklist

**Sebelum Deploy Production:**

- [ ] Ganti semua kredensial demo (admin, peneliti, responden)
- [ ] Generate NEXTAUTH_SECRET yang kuat dan unik
- [ ] Set NODE_ENV=production
- [ ] Gunakan HTTPS untuk semua koneksi
- [ ] Set MIDTRANS_IS_PRODUCTION=true dengan production keys
- [ ] Jangan commit file .env ke repository
- [ ] Implement password policy yang kuat
- [ ] Enable email verification untuk registrasi
- [ ] Setup rate limiting untuk API endpoints
- [ ] Regular backup database
- [ ] Monitor error logs dan security events

**Environment Variables Production:**
- Gunakan secret management service (AWS Secrets Manager, Azure Key Vault)
- Rotate API keys secara berkala
- Separate keys untuk dev/staging/production
- Audit access logs regular

**Database Security:**
- Gunakan strong password untuk DB user
- Limit koneksi database hanya dari app server
- Enable SSL untuk DB connection
- Regular backup & test restore procedure

**API Security:**
- Implement CORS dengan whitelist domains
- Validate dan sanitize semua input
- Use parameterized queries (sudah default di Sequelize)
- Rate limiting per endpoint
- Log suspicious activities

**Payment Security:**
- Validasi semua webhook callbacks dari Midtrans
- Verify signature pada webhook
- Double-check amount sebelum process payment
- Log semua payment transactions

**File Upload Security (jika ada):**
- Validate file types
- Limit file size
- Scan untuk malware
- Store di secure location dengan proper permissions

### Production Deployment

**Build Production:**
```bash
# Build aplikasi
npm run build

# Preview production build lokal
npm run preview
```

**Environment Production:**
```env
NODE_ENV=production
AUTH_ORIGIN=https://yourdomain.com/api/auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<production-secret-32-chars>

DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=<strong-password>
DB_NAME=qwizhub_production
DB_PORT=5432

OPENROUTER_API_KEY=<production-key>
MIDTRANS_SERVER_KEY=Mid-server-<production-key>
MIDTRANS_CLIENT_KEY=Mid-client-<production-key>
MIDTRANS_IS_PRODUCTION=true

GOOGLE_CLIENT_ID=<production-oauth-id>
GOOGLE_CLIENT_SECRET=<production-oauth-secret>
```

**Server Requirements:**
- Node.js 18+ LTS
- PostgreSQL 13+
- Minimum 2GB RAM
- HTTPS/SSL Certificate
- Domain dengan DNS configured
- Firewall configured (port 80, 443, DB port)

**Monitoring & Maintenance:**
- Setup error tracking (Sentry, LogRocket)
- Monitor server resources (CPU, RAM, disk)
- Setup uptime monitoring
- Regular security updates
- Database backup automation
- Log rotation

---



## Struktur Folder

```text
qwizhub/
├── app/                          # Frontend Nuxt application
│   ├── assets/                   # CSS, images, fonts
│   │   └── css/                  # Global styles
│   ├── components/               # Vue components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components (header, footer)
│   │   ├── project/              # Project-related components
│   │   ├── question/             # Question builder components
│   │   ├── research/             # Research variable components
│   │   └── ui/                   # Reusable UI components
│   ├── composables/              # Vue composables (reusable logic)
│   ├── layout/                   # Layout templates
│   ├── middleware/               # Route middleware
│   ├── pages/                    # File-based routing pages
│   │   ├── payments/             # Payment pages
│   │   ├── projects/             # Project management pages
│   │   └── questionnaires/       # Questionnaire pages
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
│
├── server/                       # Backend Nuxt server
│   ├── api/                      # API route handlers
│   │   ├── admin/                # Admin endpoints
│   │   ├── ai-tokens/            # AI token management
│   │   ├── auth/                 # Authentication
│   │   ├── dashboard/            # Dashboard statistics
│   │   ├── honor/                # Honor system
│   │   ├── projects/             # Project CRUD
│   │   ├── questionnaires/       # Questionnaire CRUD
│   │   ├── questions/            # Question management
│   │   ├── responses/            # Response handling
│   │   └── webhooks/             # Payment webhooks
│   ├── models/                   # Sequelize models
│   ├── plugins/                  # Server plugins
│   ├── services/                 # Business logic services
│   │   └── ai/                   # AI service providers
│   └── utils/                    # Server utilities
│
├── database/                     # Database configuration
│   ├── config.cjs                # Sequelize config
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
│
├── tests/                        # Test files
│   └── unit/                     # Unit tests
│
├── public/                       # Static assets
├── docs/                         # Additional documentation
├── .env.example                  # Environment template
├── .sequelizerc                  # Sequelize CLI config
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## Credit

Developer yang berkontibusi pada repositori ini antara lain:
- Muhammad Azka Raki
- Nicholas Widyadhana Sindunanta

---

## Lisensi

Proyek ini adalah karya internal/proprietary. Hak cipta dilindungi undang-undang.

Untuk informasi lebih lanjut mengenai penggunaan dan distribusi, hubungi tim development.

---

## Kontribusi & Support

**Maintainer:**
- Repository: https://github.com/zkaraqy/qwizhub

**Untuk Bug Reports atau Feature Requests:**
- Buat issue di GitHub repository
- Sertakan langkah reproduksi untuk bug
- Lampirkan screenshot jika relevan

**Documentation:**
- README ini adalah dokumentasi utama
- Additional docs tersedia di folder `/docs`
- API documentation tersedia dalam kode (JSDoc comments)

---

**Terakhir diupdate**: September 2026

© 2026 QwizHub. All rights reserved.

