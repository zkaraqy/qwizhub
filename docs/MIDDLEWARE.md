# Authentication Middleware

## File: `middleware/auth.global.ts`

Middleware global untuk mengontrol akses ke halaman-halaman dalam aplikasi QwizHub.

## Fungsi

### 1. **Protected Routes (Memerlukan Authentication)**
Routes berikut hanya dapat diakses oleh user yang sudah login:
- `/dashboard` - Halaman dashboard user
- `/profile` - Halaman profil user

**Behavior:**
- Jika user **belum login** mencoba akses → redirect ke `/login`
- Jika user **sudah login** → akses diizinkan

### 2. **Auth Routes (Hanya untuk Guest)**
Routes berikut hanya dapat diakses oleh user yang belum login:
- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/forgot-password` - Halaman lupa password

**Behavior:**
- Jika user **sudah login** mencoba akses → redirect ke `/dashboard`
- Jika user **belum login** → akses diizinkan

### 3. **Public Routes**
Routes yang dapat diakses oleh siapa saja:
- `/` - Landing page
- Routes lain yang tidak termasuk protected atau auth routes

## Cara Kerja

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const { status, data } = useAuth()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile']
  
  // Auth routes (guest only)
  const authRoutes = ['/login', '/register', '/forgot-password']

  // Check route type
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => to.path.startsWith(route))

  // Guard logic
  if (isProtectedRoute && status.value === 'unauthenticated') {
    return navigateTo('/login')
  }

  if (isAuthRoute && status.value === 'authenticated') {
    return navigateTo('/dashboard')
  }
})
```

## Contoh Skenario

### Skenario 1: User Belum Login
```
User → /dashboard
Middleware → Cek status: unauthenticated
Middleware → Redirect ke /login
```

### Skenario 2: User Sudah Login, Akses Dashboard
```
User → /dashboard
Middleware → Cek status: authenticated
Middleware → Allow access
```

### Skenario 3: User Sudah Login, Akses Login Page
```
User → /login
Middleware → Cek status: authenticated
Middleware → Redirect ke /dashboard
```

### Skenario 4: User Akses Landing Page
```
User → /
Middleware → Route bukan protected/auth route
Middleware → Allow access (public)
```

## Menambah Protected Routes

Untuk menambahkan route baru yang memerlukan authentication, tambahkan ke array `protectedRoutes`:

```typescript
const protectedRoutes = [
  '/dashboard', 
  '/profile',
  '/surveys',        // New protected route
  '/analytics',      // New protected route
  '/settings'        // New protected route
]
```

## Menambah Auth Routes

Untuk menambahkan route auth baru (guest only), tambahkan ke array `authRoutes`:

```typescript
const authRoutes = [
  '/login', 
  '/register', 
  '/forgot-password',
  '/reset-password'  // New auth route
]
```

## Testing

### Test 1: Akses Dashboard Tanpa Login
1. Buka browser (incognito mode)
2. Akses: http://localhost:3000/dashboard
3. **Expected:** Redirect otomatis ke /login

### Test 2: Akses Dashboard Setelah Login
1. Login dengan kredensial valid
2. **Expected:** Dashboard terbuka dan menampilkan data user

### Test 3: Akses Login Page Setelah Login
1. Login dengan kredensial valid
2. Akses: http://localhost:3000/login
3. **Expected:** Redirect otomatis ke /dashboard

### Test 4: Akses Landing Page
1. Buka browser (dengan atau tanpa login)
2. Akses: http://localhost:3000/
3. **Expected:** Landing page terbuka untuk semua

## Security Notes

1. **Global Middleware** - File dengan suffix `.global.ts` akan berjalan di setiap route change
2. **Client-side Protection** - Middleware ini berjalan di client-side, jadi tetap perlu validasi di server-side API
3. **useAuth()** - Menggunakan composable dari @sidebase/nuxt-auth untuk cek status authentication

## Troubleshooting

### Infinite Redirect Loop
Jika terjadi infinite redirect:
- Pastikan protected route tidak overlap dengan auth route
- Cek konfigurasi auth di `nuxt.config.ts`
- Clear browser cache dan cookies

### Middleware Tidak Berjalan
- Pastikan file berada di folder `middleware/`
- Pastikan nama file mengandung `.global.ts`
- Restart dev server

## File Structure
```
middleware/
└── auth.global.ts    ✓ Global auth middleware
```
