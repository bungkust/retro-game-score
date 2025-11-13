# Contributing to Universal Leaderboard

First off, thank you for considering contributing to Universal Leaderboard! It's people like you that make this project better.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if applicable**
- **Include your environment details** (OS, browser, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and React styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide
- End all files with a newline

## Development Process

1. Fork the repository
2. Clone your fork: `git clone https://github.com/bungkust/retro-game-score.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes: `npm run build && npm run preview`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run linter**
   ```bash
   npm run lint
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type when possible
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for prop types
- Follow React best practices

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use the retro theme consistently
- Ensure responsive design

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Project Structure

```
retro-game-score/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and types
│   ├── hooks/           # Custom hooks
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── scripts/             # Build scripts
└── ...                  # Configuration files
```

## Testing

- Test your changes thoroughly
- Test on different browsers
- Test on mobile devices
- Test PWA functionality

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update CHANGELOG.md for significant changes

## Questions?

If you have any questions, please open an issue with the `question` label.

Thank you for contributing! 🎉

