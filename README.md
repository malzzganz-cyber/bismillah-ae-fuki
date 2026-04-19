# 🚀 Malzz Nokos

Platform cepat & simpel untuk membeli nomor virtual dan menerima OTP otomatis.

---

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Firebase Authentication
- **Database**: Firebase Firestore
- **API**: RumahOTP (semua endpoint real, tanpa mock)
- **UI**: Tailwind CSS + custom dark premium mobile-first design
- **Fonts**: Plus Jakarta Sans + Syne

---

## ⚙️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi `.env.local`
Salin `.env.example` → `.env.local` lalu isi semua nilai:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (dari Service Account JSON)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# RumahOTP
RUMAHOTP_API_KEY=...
RUMAHOTP_BASE_URL=https://www.rumahotp.io

# Admin UID (ambil dari Firebase Console setelah register)
ADMIN_UID=uid_firebase_admin_kamu

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WA_SUPPORT=6288980873712
```

### 3. Firebase Setup
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication → Email/Password**
3. Aktifkan **Firestore Database**
4. Buat **Service Account** → download JSON → ambil `project_id`, `client_email`, `private_key`
5. Tambahkan Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /transactions/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /orders/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /withdraws/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Jalankan Dev Server
```bash
npm run dev
```

Buka: http://localhost:3000

---

## 📱 Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard + saldo |
| `/deposit` | Deposit via QRIS |
| `/order` | Order nomor virtual |
| `/history` | Riwayat transaksi & order |
| `/support` | Dukungan + FAQ |
| `/leaderboard` | Top saldo & transaksi |
| `/withdraw` | Withdraw (Admin only) |
| `/admin-balance` | Cek saldo RumahOTP (Admin only) |

---

## 🛡️ Admin Setup

1. Register akun biasa
2. Buka Firebase Console → Firestore → `users` → temukan UID kamu
3. Set `ADMIN_UID=uid_kamu` di `.env.local`
4. Restart server → menu admin akan muncul otomatis

---

## 💰 Markup Harga

| Harga Dasar | Markup |
|-------------|--------|
| ≤ Rp 15.000 | + Rp 500 |
| > Rp 15.000 | + Rp 1.000 |

---

## 🔄 Polling Interval

- Deposit: 60 detik
- Order / OTP: 60 detik
- Withdraw: 60 detik

---

## 📦 Build Production

```bash
npm run build
npm start
```

---

## 👨‍💻 Developer

**Malzz** — Fullstack Developer  
Support: [WhatsApp](https://wa.me/6288980873712)
