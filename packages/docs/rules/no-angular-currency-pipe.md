# Custom ESLint Rule: no-angular-currency-pipe

Disallow Angular’s built-in `currency` pipe in templates and enforce using `fyCurrency` instead.

## Why

`fyCurrency` supports org-level currency formatting preferences, while Angular’s default `currency` pipe does not.

## Rule details

### Incorrect

```html
{{ amount | currency }} {{ amount | currency:'USD' }}
```

### Correct

```html
{{ amount | fyCurrency }} {{ amount | fyCurrency:'USD' }}
```

## Autofix

When ESLint is run with `--fix`, this rule will automatically rewrite:

- `currency` → `fyCurrency`

## Usage

In your ESLint config:

```js
import fyleCore from '@fyle/eslint-plugin';

export default [
  {
    plugins: {
      '@fyle': fyleCore,
    },
    rules: {
      '@fyle/no-angular-currency-pipe': 'error',
    },
  },
];
```
