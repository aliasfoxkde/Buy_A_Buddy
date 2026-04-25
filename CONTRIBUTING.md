# 🤝 Contributing to Buy a Buddy

> Thank you for your interest in contributing! 🎮

---

## 📋 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Getting Started](#-getting-started)
3. [Development Setup](#-development-setup)
4. [Making Changes](#-making-changes)
5. [Testing](#-testing)
6. [Commit Guidelines](#-commit-guidelines)
7. [Pull Request Process](#-pull-request-process)

---

## 💜 Code of Conduct

We are committed to maintaining a friendly, inclusive environment for all contributors.

### Our Standards
- **Be respectful** - Treat others with kindness
- **Be inclusive** - Welcome diverse perspectives
- **Be constructive** - Provide helpful feedback
- **Be collaborative** - Work together toward goals

### Unacceptable Behavior
- Harassment or discrimination
- Personal attacks
- Spam or self-promotion

---

## 🎯 Getting Started

### Before You Start
1. Fork the repository
2. Clone your fork locally
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/aliasfoxkde/Buy_a_Buddy.git
   ```

### Finding Issues
- Look for `good first issue` labels
- Check the [Issues](https://github.com/aliasfoxkde/Buy_a_Buddy/issues) page
- Comment on issues you'd like to work on

---

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Installation
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Buy_a_Buddy.git
cd Buy_A_Buddy

# Install dependencies
npm install

# Start development server
npm run dev
```

### Recommended Tools
- **VS Code** - With extensions:
  - ESLint
  - Prettier
  - Phaser snippets
- **Git** - Version control
- **Chrome DevTools** - Debugging

---

## 🔧 Making Changes

### Branch Naming
```
feat/feature-name      # New features
fix/bug-description    # Bug fixes
docs/doc-type          # Documentation
test/test-name         # Tests
refactor/code-change   # Refactoring
```

### Example
```bash
git checkout -b feat/battle-system-ui
```

### Code Standards
- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Update tests for new features

---

## 🧪 Testing

### Run Tests Before Committing
```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Writing Tests
- Unit tests for all new functions
- Integration tests for new endpoints
- E2E tests for new features

### Coverage Target
- Aim for 70%+ coverage
- Test edge cases
- Test error conditions

---

## 📝 Commit Guidelines

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples
```bash
feat(idle): add offline earnings system
fix(battle): correct damage calculation
docs(api): add endpoint documentation
test(spawner): add rarity probability tests
```

### Commit Size
- Keep commits focused (single change per commit)
- Aim for < 500 lines changed per commit
- If larger, consider splitting

---

## 🔄 Pull Request Process

### Before Submitting
1. Run all tests (`npm run test`)
2. Run linting (`npm run lint`)
3. Update documentation if needed
4. Add tests for new features
5. Squash commits if needed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Code follows style
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process
1. Maintainer reviews PR
2. Address feedback
3. Approval required for merge
4. Squash and merge to main

---

## 📚 Resources

### Documentation
- [Phaser 3 Docs](https://phaser.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vitest Guide](https://vitest.dev/guide)
- [Playwright Docs](https://playwright.dev/docs)

### Getting Help
- [GitHub Discussions](https://github.com/aliasfoxkde/Buy_a_Buddy/discussions)
- [Discord (future)](https://discord.gg/)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎮💜**