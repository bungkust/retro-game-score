# Deployment Checklist

## Pre-Deployment Checklist

### ✅ File Configuration
- [x] `netlify.toml` - Netlify configuration file
- [x] `.nvmrc` - Node.js version (20)
- [x] `package.json` - Build script configured
- [x] `vite.config.ts` - Vite configuration for PWA

### ✅ PWA Assets
- [x] `public/pwa-64x64.png` - PWA icon 64x64
- [x] `public/pwa-192x192.png` - PWA icon 192x192
- [x] `public/pwa-512x512.png` - PWA icon 512x512
- [x] `public/maskable-icon-512x512.png` - Maskable icon 512x512
- [x] `public/robots.txt` - Robots.txt file
- [x] `public/favicon.ico` - Favicon

### ✅ Build Verification
- [x] Build command: `npm run build`
- [x] Build output: `dist/` folder
- [x] PWA files generated: `manifest.webmanifest`, `sw.js`, `workbox-*.js`
- [x] All assets included in build

### ✅ Code Quality
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] All imports resolved
- [x] All routes configured

## Deployment Steps

### 1. Git Repository
```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for production deployment"

# Push to repository
git push origin main
```

### 2. Netlify Deployment

#### Option A: Via Netlify UI
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Select your Git repository
4. Verify build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`
5. Click "Deploy site"
6. Wait for build to complete
7. Verify deployment is successful

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy to production
netlify deploy --prod
```

### 3. Post-Deployment Verification

#### Check Deployment
- [ ] Site is accessible at Netlify URL
- [ ] All routes work correctly (SPA routing)
- [ ] PWA manifest is accessible
- [ ] Service Worker is registered
- [ ] Icons are loading correctly
- [ ] HTTPS is enabled (automatic with Netlify)

#### Test PWA Features
- [ ] Manifest file loads: `https://your-site.netlify.app/manifest.webmanifest`
- [ ] Service Worker is active: Check DevTools > Application > Service Workers
- [ ] Install prompt appears on mobile devices
- [ ] App works offline (after first visit)
- [ ] Icons display correctly when installed

#### Test Application Features
- [ ] Homepage loads correctly
- [ ] Create leaderboard works
- [ ] View leaderboard works
- [ ] Add player works
- [ ] Update score works
- [ ] History page works
- [ ] Stats page works
- [ ] Settings page works
- [ ] Navigation works (bottom navbar)
- [ ] Responsive design works (mobile/desktop)

#### Test Performance
- [ ] Page load time is acceptable
- [ ] Assets are cached correctly
- [ ] Service Worker caches resources
- [ ] Fonts load correctly

### 4. Custom Domain (Optional)

If you want to use a custom domain:

1. **Add Domain in Netlify**
   - Go to Site settings > Domain settings
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**
   - Add CNAME record:
     - Name: `@` or `www`
     - Value: `your-site.netlify.app`
   - Or add A record (check Netlify docs for IP addresses)

3. **Verify SSL**
   - Netlify will automatically generate SSL certificate
   - Wait for SSL certificate to be issued (usually a few minutes)
   - Verify HTTPS is working

### 5. Environment Variables (Not Required)

This application doesn't require any environment variables.
All data is stored in browser's localStorage.

### 6. Monitoring

#### Enable Netlify Analytics
- [ ] Go to Site settings > Analytics
- [ ] Enable Netlify Analytics (if available)
- [ ] Monitor page views, bandwidth, build time

#### Check Error Logs
- [ ] Check Netlify Dashboard > Deploys > Functions Logs
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20)
- Check `package.json` for correct dependencies
- Check `netlify.toml` for correct build command
- Check Netlify build logs for errors

### PWA Not Working
- Verify Service Worker is registered
- Check `manifest.webmanifest` is accessible
- Verify all icons are accessible
- Check HTTPS is enabled (required for PWA)
- Clear browser cache and try again

### Routing Not Working
- Verify `netlify.toml` has redirect rule: `/* /index.html 200`
- Check React Router configuration
- Verify all routes are defined in `App.tsx`

### Assets Not Loading
- Check file paths in `index.html`
- Verify assets are in `dist/` folder
- Check Netlify headers configuration
- Verify cache headers are set correctly

## Support

If you encounter any issues:
1. Check [NETLIFY.md](./NETLIFY.md) for detailed deployment guide
2. Check [Netlify Docs](https://docs.netlify.com/)
3. Check [Vite Docs](https://vitejs.dev/)
4. Check [React Router Docs](https://reactrouter.com/)
5. Check [PWA Docs](https://web.dev/progressive-web-apps/)

