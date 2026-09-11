# 💳 Implementasi Pembayaran Publikasi Kuesioner - Midtrans

## 📋 Overview

Dokumen ini menjelaskan implementasi sistem pembayaran untuk publikasi kuesioner menggunakan Midtrans Payment Gateway.

---

## 🔧 Konfigurasi yang Diperlukan

### 1. Environment Variables

Tambahkan ke file `.env` Anda:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
```

**Cara mendapatkan keys:**
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Pilih environment (Sandbox untuk testing, Production untuk live)
3. Settings → Access Keys
4. Copy Server Key dan Client Key

### 2. Konfigurasi Midtrans Dashboard

**PENTING:** Anda HARUS mengatur Payment Notification URL di Midtrans Dashboard:

**Untuk Development (Testing):**
```
http://your-ngrok-url.ngrok.io/api/webhooks/midtrans
```

**Untuk Production:**
```
https://qwizhub.up.railway.app/api/webhooks/midtrans
```

**Langkah-langkah:**
1. Login ke Midtrans Dashboard
2. Pilih Environment (Sandbox/Production)
3. Settings → Configuration
4. Scroll ke bagian "Payment Notification URL"
5. Masukkan URL webhook sesuai environment
6. Klik Save

---

## 🏗️ Arsitektur Sistem

```
┌─────────────┐
│   Frontend  │
│  (Vue Page) │
└──────┬──────┘
       │ 1. User klik "Publikasikan"
       ▼
┌─────────────────────────────────────────┐
│ POST /api/projects/{id}/questionnaires/ │
│      {questionnaireId}/publish          │
└──────┬──────────────────────────────────┘
       │ 2. Create Transaction + Get Snap Token
       ▼
┌─────────────────┐
│ Midtrans Snap   │ ◄── 3. User melakukan pembayaran
│   (Payment UI)  │
└─────────┬───────┘
          │
          │ 4. Payment processed
          ▼
┌─────────────────────────────────────┐
│      Midtrans Backend               │
└─────────┬───────────────────────────┘
          │ 5. Send notification
          ▼
┌─────────────────────────────────────┐
│ POST /api/webhooks/midtrans         │
│  (Webhook Handler)                  │
└─────────┬───────────────────────────┘
          │ 6. Update Transaction status
          │    & Publish Questionnaire
          ▼
┌─────────────────────────────────────┐
│         Database                    │
│  - transactions (status updated)    │
│  - questionnaires (status=published)│
└─────────────────────────────────────┘
```

---

## 📁 File yang Dimodifikasi

### 1. `server/api/webhooks/midtrans.post.ts`

**Fitur utama:**
- ✅ Signature verification untuk keamanan
- ✅ Detailed logging untuk debugging
- ✅ Handle semua status payment (success, pending, failed, expired)
- ✅ Auto-publish questionnaire saat payment success
- ✅ Idempotent (aman dipanggil multiple times)


### 2. `nuxt.config.ts`

**Perubahan:**
```typescript
runtimeConfig: {
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    public: {
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
      midtransSnapUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    }
}
```

### 3. `app/pages/projects/[id]/questionnaire/[questionnaireId]/edit.vue`

**Perubahan:**
- Menggunakan `useRuntimeConfig()` untuk mendapatkan Midtrans client key
- Dynamic loading Snap.js URL (sandbox vs production)
- Improved error handling dengan console logging
- Auto-refresh questionnaire data setelah payment success
- Better UX dengan SweetAlert2 notifications

---

## 🔐 Keamanan

### 1. Signature Verification

Webhook handler memverifikasi signature yang dikirim Midtrans:

```typescript
const expectedSignature = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex')

if (signatureKey !== expectedSignature) {
    return { status: 'error', message: 'Invalid signature' }
}
```

**Kenapa ini penting?**
- Mencegah webhook palsu dari pihak ketiga
- Memastikan data webhook benar-benar dari Midtrans

### 2. Environment Variables

- Server Key dan Client Key disimpan di environment variables
- Tidak pernah di-expose ke client-side (kecuali Client Key yang memang public)

---

## 🧪 Testing

### A. Testing Lokal dengan Ngrok

1. **Install ngrok:**
```bash
npm install -g ngrok
```

2. **Jalankan aplikasi lokal:**
```bash
npm run dev
```

3. **Expose ke internet dengan ngrok:**
```bash
ngrok http 3000
```

4. **Update Midtrans Dashboard:**
- Copy URL ngrok (contoh: `https://abc123.ngrok.io`)
- Set Payment Notification URL: `https://abc123.ngrok.io/api/webhooks/midtrans`

5. **Test payment flow:**
- Buka aplikasi via ngrok URL
- Login dan buat questionnaire
- Klik "Publikasikan"
- Gunakan test card dari Midtrans:
  - Card Number: `4811 1111 1111 1114`
  - Expiry: Any future date
  - CVV: `123`

### B. Testing di Production (Railway)

1. **Pastikan environment variables sudah diset di Railway**
2. **Update Payment Notification URL di Midtrans Dashboard (Production):**
```
https://qwizhub.up.railway.app/api/webhooks/midtrans
```

3. **Deploy ke Railway:**
```bash
git add .
git commit -m "Implement Midtrans payment integration"
git push
```

4. **Test dengan real payment**

### C. Monitoring Webhook

**Di Railway:**
1. Buka Railway dashboard
2. Pilih project QwizHub
3. Klik tab "Deployments" → "View Logs"
4. Filter logs dengan keyword: "Midtrans Webhook"

**Log yang akan muncul:**
```
=== Midtrans Webhook Received ===
Timestamp: 2026-09-11T06:55:01.338Z
Payload: { ... }
✓ Signature verified
Current transaction status: pending
→ Status: Payment settled
✓ Transaction updated to: success
✅ Questionnaire published: uuid-here
=== Webhook Processing Complete ===
```

---

## 🐛 Troubleshooting

### Problem: Webhook tidak terpanggil

**Solusi:**
1. Cek Payment Notification URL di Midtrans Dashboard sudah benar
2. Pastikan URL bisa diakses dari internet
3. Cek Railway logs untuk error
4. Test webhook manual dengan curl

### Problem: Invalid signature error

**Penyebab:**
- Server key tidak sesuai dengan environment (sandbox vs production)

**Solusi:**
1. Cek environment variable `MIDTRANS_SERVER_KEY`
2. Pastikan server key sesuai dengan environment yang digunakan

### Problem: Questionnaire tidak auto-publish

**Solusi:**
1. Cek logs webhook untuk melihat status yang diterima
2. Cek database transaction table untuk status terbaru
3. Pastikan relasi Transaction → Questionnaire benar

---

## 📝 Checklist Deployment

### Sebelum Deploy:

- [ ] Set environment variables di Railway
- [ ] Update Payment Notification URL di Midtrans Dashboard
- [ ] Test webhook dengan ngrok di local
- [ ] Verify signature verification working

### Setelah Deploy:

- [ ] Test complete payment flow di production
- [ ] Monitor Railway logs saat test payment
- [ ] Verify questionnaire status berubah ke 'published'
- [ ] Test dengan berbagai payment method

---

## 🔗 Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Snap Integration](https://docs.midtrans.com/en/snap/integration-guide)
- [Midtrans Notification/Webhook](https://docs.midtrans.com/en/after-payment/http-notification)

---

**Last Updated:** 2026-09-11
**Version:** 1.0.0

