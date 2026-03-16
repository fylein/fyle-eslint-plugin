# Custom ESLint Rule: no-inline-date-format

Disallow inline string literal date formats in Angular templates.

## Why

String literal date formats in templates bypass org-level formatting preferences. Use the default format preference or pass a variable instead.

## Incorrect

```html
{{ someDate | date:'MMM dd, yyyy' }} {{ someDate | date : 'h:mm a' }}
```

## Correct

```html
{{ someDate | date }} {{ someDate | date: formatVar }}
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
      '@fyle/no-inline-date-format': 'error',
    },
  },
];
```
