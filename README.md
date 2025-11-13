# 🎮 Universal Leaderboard - Retro Game Scoreboard

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite)

**Satu Papan Skor untuk Semua Permainan** - Simple retro-style leaderboard for all your family games.

[Features](#-features) • [Demo](https://unileaderboard.netlify.app) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [License](#-license)

</div>

## ✨ Features

- 🎮 **Multi Game Support**: Create leaderboards for various games
- 🏆 **Win Count & Total Points**: Track wins or total points
- 📱 **PWA Support**: Install as app, works offline
- 📊 **Statistics**: View comprehensive statistics and rankings
- 📜 **History**: Track activity and score changes
- 🎯 **Retro Games**: Built-in Snake and Memory games
- ⚡ **Fast & Easy**: Update scores quickly and easily
- 🌐 **Multi-language**: Indonesian and English support
- 📱 **Mobile First**: Responsive design for all devices
- 🎨 **Retro Theme**: Beautiful retro pixel-art design

## 🎮 Games

- **Snake Game**: Classic retro snake game with virtual controls for mobile
- **Memory Game**: Test your memory with different difficulty levels

## 🚀 Demo

[Live Demo](https://unileaderboard.netlify.app) | [Documentation](#-documentation)

Try it out at: **https://unileaderboard.netlify.app**

## 📦 Installation

### Prerequisites

- Node.js 20 or higher
- npm or yarn or pnpm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/bungkust/retro-game-score.git
   cd retro-game-score
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
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

## 🛠️ Usage

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Generate PWA icons
npm run generate-icons
```

### Creating a Leaderboard

1. Click "NEW" button on the dashboard
2. Enter leaderboard name and description
3. Choose score mode (Win Count or Total Points)
4. Choose sort order (Highest or Lowest)
5. Add players to the leaderboard
6. Start tracking scores!

### Playing Games

1. Navigate to "Play" menu from bottom navigation
2. Choose a game (Snake or Memory)
3. Play and enjoy!

## 📁 Project Structure

```
retro-game-score/
├── public/              # Public assets (icons, robots.txt)
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # shadcn-ui components
│   │   └── ...          # Custom components
│   ├── pages/           # Page components
│   │   ├── games/       # Game components (Snake, Memory)
│   │   └── ...          # Other pages
│   ├── lib/             # Utilities and types
│   ├── hooks/           # Custom React hooks
│   └── main.tsx         # Entry point
├── scripts/             # Build scripts
├── .github/             # GitHub templates and workflows
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## 🚀 Deployment

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

### Deploy to Other Platforms

This project can be deployed to any static hosting platform:
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Use GitHub Actions
- **Cloudflare Pages**: Connect your Git repository
- **Any static host**: Build and upload the `dist/` folder

## 📱 PWA Features

This application is configured as a Progressive Web App (PWA):

- **Service Worker**: For offline support
- **Web App Manifest**: For installing as an app
- **Icons**: Generated PWA icons (64x64, 192x192, 512x512, maskable)

### Install as App

After deployment, users can:
1. Open the application in a mobile browser
2. Click browser menu > "Add to Home Screen" or "Install App"
3. The app will be installed and can be opened like a native app

## 🛠️ Technologies

This project is built with:

- **[React](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[React Router](https://reactrouter.com/)** - Routing
- **[shadcn-ui](https://ui.shadcn.com/)** - UI components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Lucide React](https://lucide.dev/)** - Icons
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** - PWA support
- **[Workbox](https://developers.google.com/web/tools/workbox)** - Service worker

## 📚 Documentation

- [Deployment Guide](./NETLIFY.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📝 License

This project is open source and available under the [MIT License](./LICENSE).

## 🙏 Acknowledgments

- [shadcn-ui](https://ui.shadcn.com/) for the amazing UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the amazing build tool

## 📧 Support

If you encounter any issues:

- Check [NETLIFY.md](./NETLIFY.md) for deployment guide
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment checklist
- Open an [issue](https://github.com/bungkust/retro-game-score/issues) on GitHub

## 🎯 Roadmap

- [ ] Add more games
- [ ] Add multiplayer support
- [ ] Add cloud sync
- [ ] Add more themes
- [ ] Add export/import functionality
- [ ] Add dark/light mode toggle
- [ ] Add more statistics
- [ ] Add tournament mode

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐!

---

<div align="center">

Made with ❤️ by [bungkust](https://github.com/bungkust)

[Report Bug](https://github.com/bungkust/retro-game-score/issues) • [Request Feature](https://github.com/bungkust/retro-game-score/issues) • [Contribute](https://github.com/bungkust/retro-game-score/pulls)

</div>
