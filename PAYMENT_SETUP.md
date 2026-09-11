# Quick Setup Guide - Midtrans Payment Integration

## ⚡ Quick Start

### 1. Ganti Payment Notification URL di Midtrans Dashboard

**WAJIB DILAKUKAN:**

```
Production: https://qwizhub.up.railway.app/api/webhooks/midtrans
```

**Cara:**
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Settings → Configuration → Payment Notification URL
3. Paste URL di atas
4. Save

### 2. Pastikan Environment Variables di Railway

```env
MIDTRANS_SERVER_KEY=your-actual-server-key
MIDTRANS_CLIENT_KEY=your-actual-client-key
MIDTRANS_IS_PRODUCTION=false (atau true untuk production)
```

### 3. Deploy

```bash
git add .
git commit -m "Implement Midtrans payment integration with webhook"
git push
```

## 📝 Testing Checklist

- [ ] Klik "Publikasikan" pada questionnaire
- [ ] Popup Midtrans muncul
- [ ] Lakukan pembayaran test (use test card: 4811 1111 1111 1114)
- [ ] Cek Railway logs untuk webhook notification
- [ ] Verify questionnaire status berubah jadi "published"

## 🔍 Monitoring

**Railway Logs:**
```
=== Midtrans Webhook Received ===
✓ Signature verified
✓ Transaction updated to: success
✅ Questionnaire published
```

## 📄 Full Documentation

Lihat [PAYMENT_IMPLEMENTATION.md](./PAYMENT_IMPLEMENTATION.md) untuk dokumentasi lengkap.

## 🚨 Important Notes

1. **Webhook URL berbeda dengan yang lama**
   - ❌ Old: `/api/payment/notification`
   - ✅ New: `/api/webhooks/midtrans`

2. **Signature verification sudah aktif** - hanya request dari Midtrans yang valid yang akan diproses

3. **Status auto-update** - questionnaire otomatis jadi "published" saat payment success
