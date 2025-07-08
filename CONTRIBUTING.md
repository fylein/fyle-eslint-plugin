# Contributing to ESLint Plugin Fyle

Thank you for your interest in contributing to ESLint Plugin Fyle! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 8.0.0
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/eslint-plugin-fyle.git
   cd eslint-plugin-fyle
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/fylein/eslint-plugin-fyle.git
   ```

## Development Setup

### Install Dependencies

```bash
npm ci
```

### Verify Setup

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

All commands should pass without errors.

## Making Changes

### Branch Naming

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
# or
git checkout -b docs/your-docs-update
```

### Code Style

- Follow the existing code style
- Run `npm run format` to format your code
- Ensure `npm run lint` passes without errors
- Write meaningful commit messages

### Adding New Rules

1. Create the rule file in `packages/core/src/rules/`
2. Add tests in `packages/core/src/tests/`
3. Export the rule in `packages/core/src/index.js`
4. Update documentation in `packages/docs/`

### Example Rule Structure

```javascript
// packages/core/src/rules/your-rule.js
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () =>
    `https://github.com/fylein/eslint-plugin-fyle/blob/main/packages/docs/rules/your-rule.md`
);

export default createRule({
  name: 'your-rule',
  meta: {
    type: 'problem',
    docs: {
      description: 'Description of your rule',
    },
    messages: {
      errorMessage: 'Error message for your rule',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      // Your rule implementation
    };
  },
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
cd packages/core && npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Tests should be comprehensive
- Include both valid and invalid cases
- Test edge cases and error conditions
- Use descriptive test names

### Example Test Structure

```javascript
// packages/core/src/tests/your-rule.test.js
import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../rules/your-rule';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('your-rule', rule, {
  valid: [
    // Valid code examples
  ],
  invalid: [
    // Invalid code examples with expected errors
  ],
});
```

## Submitting Changes

### Pre-commit Checks

Before committing, ensure:

```bash
npm run lint
npm test
npm run type-check
```

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:

```
feat(core): add new i18n rule for Angular templates
fix(core): resolve false positive in no-hardcoded-strings rule
docs: update installation instructions
```

### Pull Request Process

1. Push your changes to your fork
2. Create a Pull Request against the `main` branch
3. Fill out the PR template
4. Ensure CI checks pass
5. Request review from maintainers

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

## Release Process

### For Maintainers

1. Update version in `package.json` files
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

```bash
# Update versions
npm version patch|minor|major

# Create and push tag
git push --tags

# Publish packages
npm run publish
```

## Getting Help

- Open an issue for bugs or feature requests
- Join our discussions for questions
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
