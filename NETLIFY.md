# Deployment ke Netlify

## Prasyarat

1. Akun Netlify (gratis di [netlify.com](https://www.netlify.com))
2. Repository Git (GitHub, GitLab, atau Bitbucket)
3. Node.js 20 atau lebih tinggi

## Cara Deploy

### Opsi 1: Deploy via Netlify UI (Recommended)

1. **Push code ke repository Git**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Login ke Netlify**
   - Buka [app.netlify.com](https://app.netlify.com)
   - Login dengan akun GitHub/GitLab/Bitbucket

3. **Create New Site**
   - Klik "Add new site" > "Import an existing project"
   - Pilih repository yang berisi project ini
   - Netlify akan otomatis mendeteksi konfigurasi dari `netlify.toml`

4. **Configure Build Settings**
   - Build command: `npm run build` (sudah dikonfigurasi di netlify.toml)
   - Publish directory: `dist` (sudah dikonfigurasi di netlify.toml)
   - Node version: `20` (sudah dikonfigurasi di netlify.toml)

5. **Deploy**
   - Klik "Deploy site"
   - Tunggu proses build selesai
   - Setelah selesai, site akan live di URL Netlify (contoh: `your-site.netlify.app`)

### Opsi 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login ke Netlify**
   ```bash
   netlify login
   ```

3. **Initialize site**
   ```bash
   netlify init
   ```
   - Pilih "Create & configure a new site"
   - Pilih team (atau buat baru)
   - Site name: (kosongkan untuk random name atau isi custom name)

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Konfigurasi

### File netlify.toml

File `netlify.toml` sudah dikonfigurasi dengan:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`
- SPA routing: redirect semua route ke `/index.html`
- Security headers: X-Frame-Options, X-XSS-Protection, dll
- Cache headers: untuk assets (JS, CSS, images)
- Service Worker headers: untuk PWA support

### Environment Variables

Tidak ada environment variables yang diperlukan untuk aplikasi ini.
Semua data disimpan di localStorage browser.

## Fitur PWA

Aplikasi ini sudah dikonfigurasi sebagai Progressive Web App (PWA):
- Service Worker: untuk offline support
- Web App Manifest: untuk install sebagai aplikasi
- Icons: sudah di-generate (pwa-64x64.png, pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png)

### Install sebagai App

Setelah deploy, user dapat:
1. Buka aplikasi di browser mobile
2. Klik menu browser > "Add to Home Screen" atau "Install App"
3. Aplikasi akan terinstall dan dapat dibuka seperti aplikasi native

## Custom Domain

Untuk menggunakan custom domain:

1. **Di Netlify Dashboard**
   - Buka site settings
   - Pilih "Domain settings"
   - Klik "Add custom domain"
   - Masukkan domain yang ingin digunakan

2. **Konfigurasi DNS**
   - Tambahkan CNAME record di DNS provider:
     - Name: `@` atau `www`
     - Value: `your-site.netlify.app`
   - Atau tambahkan A record:
     - Name: `@`
     - Value: IP address dari Netlify (cek di Netlify docs)

3. **SSL Certificate**
   - Netlify otomatis menyediakan SSL certificate gratis
   - Certificate akan otomatis di-generate setelah DNS terkonfigurasi

## Build & Deploy

### Build Production

```bash
npm run build
```

Build akan menghasilkan folder `dist/` yang berisi:
- `index.html`: entry point aplikasi
- `assets/`: JS dan CSS files
- `manifest.webmanifest`: PWA manifest
- `sw.js`: Service Worker
- `workbox-*.js`: Workbox library
- Icons: PWA icons

### Preview Build

```bash
npm run preview
```

Ini akan menjalankan preview server untuk melihat hasil build lokal.

## Troubleshooting

### Build Error

Jika build error:
1. Pastikan Node.js version 20 atau lebih tinggi
2. Hapus `node_modules` dan `package-lock.json`
3. Install ulang dependencies: `npm install`
4. Coba build lagi: `npm run build`

### PWA Tidak Berfungsi

Jika PWA tidak berfungsi:
1. Pastikan Service Worker terdaftar (cek di DevTools > Application > Service Workers)
2. Pastikan manifest.webmanifest dapat diakses
3. Pastikan semua icons dapat diakses
4. Pastikan site menggunakan HTTPS (Netlify otomatis menyediakan HTTPS)

### Routing Error

Jika routing tidak berfungsi:
1. Pastikan `netlify.toml` sudah dikonfigurasi dengan redirect rule
2. Pastikan semua route redirect ke `/index.html`
3. Pastikan React Router sudah dikonfigurasi dengan benar

## Monitoring

### Netlify Analytics

Netlify menyediakan analytics gratis untuk:
- Page views
- Unique visitors
- Bandwidth usage
- Build time

Aktifkan di: Site settings > Analytics

### Error Logs

Cek error logs di:
- Netlify Dashboard > Site > Deploys > [Deploy] > Functions Logs
- Browser DevTools > Console
- Browser DevTools > Network

## Support

Jika ada masalah:
1. Cek [Netlify Docs](https://docs.netlify.com/)
2. Cek [Vite Docs](https://vitejs.dev/)
3. Cek [React Router Docs](https://reactrouter.com/)
4. Cek [PWA Docs](https://web.dev/progressive-web-apps/)

