# Contributing to TronVid

First off, thank you for considering contributing to TronVid! It's people like you that make TronVid such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed** and explain why it's a problem
- **Describe the behavior you expected**
- **Include screenshots** if applicable
- **Include your environment details:**
  - OS and version (e.g., macOS 14.0, Windows 11, Ubuntu 22.04)
  - TronVid version
  - Node.js version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies:** `npm install`
3. **Make your changes** and test them thoroughly
4. **Ensure your code follows the existing style**
5. **Write clear, concise commit messages**
6. **Create a pull request** with a clear title and description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/tronvid.git
cd tronvid

# Install dependencies
npm install

# Run in development mode
npm start

# Build for testing
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## Project Structure

```
tronvid/
├── main.js           # Electron main process
├── renderer.js       # Renderer process (UI logic)
├── index.html        # Main HTML file
├── styles.css        # Application styles
├── package.json      # Project configuration
└── build/            # Build resources (icons)
```

## Style Guidelines

### JavaScript

- Use modern ES6+ syntax
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### CSS

- Use CSS custom properties (variables) for theming
- Follow the existing naming conventions
- Keep specificity low
- Group related styles together

### Commits

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues and pull requests when relevant

## Testing

Before submitting a pull request, please ensure:

- [ ] The app starts without errors
- [ ] All existing features still work
- [ ] Your new feature works as expected
- [ ] The app builds successfully for your platform

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
