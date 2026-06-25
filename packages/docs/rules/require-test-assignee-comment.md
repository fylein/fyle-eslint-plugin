# Custom ESLint Rule: require-test-assignee-comment

This rule ensures that Playwright `test.fixme` and `test.fail` annotations are never left orphaned by requiring an explicit assignee comment.

## What it checks

- `test.fixme(...)`
- `test.fail(...)`

The rule reports when these calls are present without a nearby comment assigning ownership.

## Accepted comment formats

Valid examples:

```js
// Assignee: @username
```

Only the `@assignee` syntax is accepted by this rule.

## Example

### ✅ Valid

```js
// Assignee: @arjun
test.fixme('known issue', async ({ page }) => {});
```

### ❌ Invalid

```js
test.fixme('known issue', async ({ page }) => {});
```

## Configuration

```js
import fyleCore from '@fyle/eslint-plugin';

export default [
  {
    plugins: {
      '@fyle': fyleCore,
    },
    rules: {
      '@fyle/require-test-assignee-comment': 'error',
    },
  },
];
```
