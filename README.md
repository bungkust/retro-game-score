# Universal Leaderboard - Retro Game Scoreboard

Satu Papan Skor untuk Semua Permainan - Simple retro-style leaderboard for all your family games.

## Features

- 🎮 **Multi Game Support**: Create leaderboards for various games
- 🏆 **Win Count & Total Points**: Track wins or total points
- 📱 **PWA Support**: Install as app, works offline
- 📊 **Statistics**: View comprehensive statistics and rankings
- 📜 **History**: Track activity and score changes
- ⚡ **Fast & Easy**: Update scores quickly and easily

## Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **React Router** - Routing
- **shadcn-ui** - UI components
- **Tailwind CSS** - Styling
- **PWA** - Progressive Web App support

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd retro-game-score
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate PWA icons** (optional, if icons are missing)
   ```bash
   npm run generate-icons
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Open `http://localhost:8080` in your browser

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
retro-game-score/
├── public/          # Public assets (icons, robots.txt)
├── src/
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── lib/         # Utilities and types
│   └── main.tsx     # Entry point
├── scripts/         # Build scripts
├── index.html       # HTML template
├── vite.config.ts   # Vite configuration
└── package.json     # Dependencies
```

## Deployment

### Deploy to Netlify (Recommended)

1. **Push code to Git repository**
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Deploy via Netlify UI**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Select your Git repository
   - Netlify will auto-detect settings from `netlify.toml`
   - Click "Deploy site"

3. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

For detailed deployment instructions, see [NETLIFY.md](./NETLIFY.md).

## Custom Domain

### Netlify

1. Go to Netlify Dashboard > Site settings > Domain settings
2. Click "Add custom domain"
3. Configure DNS records (CNAME or A record)
4. SSL certificate will be automatically generated

## PWA Features

This application is configured as a Progressive Web App (PWA):

- **Service Worker**: For offline support
- **Web App Manifest**: For installing as an app
- **Icons**: Generated PWA icons (64x64, 192x192, 512x512, maskable)

### Install as App

After deployment, users can:
1. Open the application in a mobile browser
2. Click browser menu > "Add to Home Screen" or "Install App"
3. The app will be installed and can be opened like a native app

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-icons` - Generate PWA icons

### Code Structure

- **Components**: Reusable UI components in `src/components/`
- **Pages**: Page components in `src/pages/`
- **Lib**: Utilities, types, and storage in `src/lib/`
- **Styles**: Global styles in `src/index.css`

## Data Storage

This application uses browser's `localStorage` for data storage:
- All leaderboards and players are stored locally
- Data persists across browser sessions
- Data can be exported/imported as JSON

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
- Check [NETLIFY.md](./NETLIFY.md) for deployment guide
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment checklist
- Check project documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
