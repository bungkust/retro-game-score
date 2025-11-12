# Favicon Update

Favicon sudah di-update dari icon Lovable ke icon retro aplikasi ini.

## Cara Update Favicon di Browser

Karena browser biasanya cache favicon lama, ikuti langkah berikut:

### 1. Hard Refresh Browser

**Chrome/Edge (Windows/Linux):**
- Tekan `Ctrl + Shift + R` atau `Ctrl + F5`

**Chrome/Edge (Mac):**
- Tekan `Cmd + Shift + R`

**Firefox:**
- Tekan `Ctrl + Shift + R` (Windows/Linux) atau `Cmd + Shift + R` (Mac)

**Safari:**
- Tekan `Cmd + Option + R`

### 2. Clear Browser Cache

**Chrome:**
1. Buka DevTools (F12)
2. Klik kanan pada tombol refresh
3. Pilih "Empty Cache and Hard Reload"

**Firefox:**
1. Buka Settings
2. Privacy & Security
3. Clear Data
4. Pilih "Cached Web Content"
5. Clear Now

### 3. Clear Favicon Cache Secara Manual

**Chrome:**
1. Buka `chrome://favicon/` di address bar
2. Clear semua favicon cache
3. Restart browser

**Atau:**
1. Tutup semua tab browser
2. Restart browser
3. Buka aplikasi lagi

### 4. Setelah Deploy ke Netlify

Setelah deploy ke production (Netlify), icon baru akan otomatis digunakan karena file `favicon.ico` sudah diganti. Browser akan download icon baru.

Jika masih melihat icon lama setelah deploy:
1. Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)
2. Clear browser cache
3. Restart browser

## Icon yang Digunakan

- **favicon.ico**: 32x32 PNG (icon retro dengan design leaderboard)
- **pwa-64x64.png**: 64x64 PNG
- **pwa-192x192.png**: 192x192 PNG
- **pwa-512x512.png**: 512x512 PNG
- **maskable-icon-512x512.png**: 512x512 PNG (maskable)

Semua icon menggunakan design retro dengan:
- Background: Dark blue (#0d1621)
- Border: Cyan (#00ffff)
- Leaderboard lines: Cyan
- Score indicators: Cyan squares
- Title "S": Yellow (#ffff00) pixel art

## Generate Icons

Jika perlu regenerate icons:

```bash
npm run generate-icons
```

Ini akan generate semua icons termasuk `favicon.ico`.

## Verifikasi

Untuk memverifikasi icon sudah benar:

1. **Check file:**
   ```bash
   file public/favicon.ico
   ```
   Should show: `PNG image data, 32 x 32`

2. **Check in browser:**
   - Open DevTools (F12)
   - Go to Network tab
   - Reload page
   - Check if `favicon.ico` is loaded
   - Check Response headers - should show new file

3. **Check in production:**
   - After deploy, visit `https://your-site.netlify.app/favicon.ico`
   - Should show retro icon, not Lovable icon

