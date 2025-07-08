# eslint-plugin-fyle

[![CI](https://github.com/fylein/eslint-plugin-fyle/actions/workflows/ci.yml/badge.svg)](https://github.com/fylein/eslint-plugin-fyle/actions/workflows/ci.yml)

Custom ESLint rules and configurations for Fyle projects.

## Packages

This monorepo contains the following packages:

- **core**: Core ESLint rules for Fyle projects (located in `packages/core`)

## Installation

Install the core plugin:

```bash
npm install --save-dev eslint-plugin-fyle-core
```

## Usage

Add the plugin to your ESLint configuration:

```javascript
// eslint.config.js
import corePlugin from 'eslint-plugin-fyle-core';

export default [
  {
    plugins: {
      'fyle-core': corePlugin
    },
    rules: {
      'fyle-core/i18n-key-naming-convention': 'error',
      'fyle-core/no-hardcoded-strings': 'error'
    }
  }
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
- **CI**: All PRs and pushes to `main`/`develop` run lint, type-check, and tests via [GitHub Actions](.github/workflows/ci.yml).

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting issues or pull requests.

- Use [conventional commits](https://www.conventionalcommits.org/) for commit messages.
- Pull requests and issues use templates for consistency.
- All code must pass linting, formatting, and tests before merging.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on setup, development, and submitting changes.

## License

MIT
