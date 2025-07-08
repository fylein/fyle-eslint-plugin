# ESLint Plugin Fyle - Rules Documentation

This documentation covers all the custom ESLint rules available in the Fyle ESLint plugin ecosystem.

## Available Rules

### Angular Package (`eslint-plugin-fyle-angular`)

| Rule | Description | Documentation |
|------|-------------|---------------|
| `i18n-key-naming-convention` | Enforces consistent naming conventions for i18n translation keys based on file location and type | [View Documentation](./rules/i18n-key-naming-convention.md) |
| `no-hardcoded-strings` | Detects hardcoded user-facing strings in Angular applications and enforces i18n best practices | [View Documentation](./rules/no-hardcoded-strings.md) |

## Quick Start

### Installation

```bash
npm install --save-dev eslint-plugin-fyle-angular
```

### Basic Configuration

```javascript
// eslint.config.js
import angularPlugin from 'eslint-plugin-fyle-angular';

export default [
  {
    plugins: {
      'fyle-angular': angularPlugin
    },
    rules: {
      'fyle-angular/i18n-key-naming-convention': 'error',
      'fyle-angular/no-hardcoded-strings': 'error'
    }
  }
];
```

## Rule Categories

### Internationalization (i18n)
Rules that help maintain consistent internationalization practices:
- **i18n-key-naming-convention**: Ensures translation keys follow predictable naming patterns
- **no-hardcoded-strings**: Prevents hardcoded user-facing text

## Contributing

When adding new rules, please:
1. Create comprehensive documentation in the `rules/` folder
2. Include examples of valid and invalid code
3. Provide configuration options and their effects
4. Add this rule to the table above

## Testing

Each rule includes comprehensive test suites. Run tests with:

```bash
npm test
``` 