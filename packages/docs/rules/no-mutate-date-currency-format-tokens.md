# Custom ESLint Rule: no-mutate-date-currency-format-tokens

Prevent mutating org-level date/currency formatting tokens:

- `FORMAT_PREFERENCES` (from `@fyle/format-preferences-token`)
- `DATE_PIPE_DEFAULT_OPTIONS` (from `@angular/common`)

## Why

These tokens are treated as globally-managed configuration. Mutating them from arbitrary services/components can lead to inconsistent formatting behavior.

## Incorrect

```ts
const fp = inject(FORMAT_PREFERENCES);
fp.currencyFormat.decimalSeparator = ',';
```

```ts
const opts = inject(DATE_PIPE_DEFAULT_OPTIONS);
opts.dateFormat = 'MMM dd, yyyy';
```

## Correct

```ts
const fp = inject(FORMAT_PREFERENCES);
const decimalSeparator = fp.currencyFormat.decimalSeparator;
```

## Usage

```js
import fyleCore from '@fyle/eslint-plugin';

export default [
  {
    plugins: {
      '@fyle': fyleCore,
    },
    rules: {
      '@fyle/no-mutate-date-currency-format-tokens': 'error',
    },
  },
];
```
