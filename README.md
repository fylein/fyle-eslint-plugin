# fyle-eslint-plugin

[![CI](https://github.com/fylein/fyle-eslint-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/fylein/fyle-eslint-plugin/actions/workflows/ci.yml)

Custom ESLint rules and configurations for Fyle projects.

## Packages

This monorepo contains the following packages:

- **core**: Core ESLint rules for Fyle projects (located in `packages/core`)

## Installation

Install the plugin from GitHub:

```bash
# Install from master branch
npm install --save-dev @fyle/eslint-plugin@github:fylein/fyle-eslint-plugin#master

# Or install from a specific tag/version
npm install --save-dev @fyle/eslint-plugin@github:fylein/fyle-eslint-plugin#v1.0.2

# For developers: install from a feature branch (e.g., testing latest features)
npm install --save-dev @fyle/eslint-plugin@github:fylein/fyle-eslint-plugin#feature/multiple-prefixes-and-page-files
```

## Usage

Add the plugin to your ESLint configuration:

```javascript
// eslint.config.js
import fyleCore from 'fyle-eslint-plugin';

export default [
  {
    plugins: {
      'fyle-core': fyleCore,
    },
    rules: {
      'fyle-core/i18n-key-naming-convention': 'error',
      'fyle-core/no-hardcoded-strings': 'error',
    },
  },
];
```

## Documentation

- [Core Rules Documentation](./packages/docs/README.md)

## Development Workflow

- **Linting**: `npm run lint` (runs on all packages)
- **Formatting**: `npm run format` (uses Prettier)
- **Testing**: `npm test` (runs Jest tests in all packages)
- **Type Checking**: `npm run type-check` (if applicable)
- **Pre-commit hooks**: Automatically run lint, format, and relevant tests on staged files using Husky and lint-staged.
- **CI**: All PRs and pushes to `master` run lint, type-check, and tests via [GitHub Actions](.github/workflows/ci.yml).

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting issues or pull requests.

- Use [conventional commits](https://www.conventionalcommits.org/) for commit messages.
- Pull requests and issues use templates for consistency.
- All code must pass linting, formatting, and tests before merging.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on setup, development, and submitting changes.

## License

MIT
