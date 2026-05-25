# Custom ESLint Rule: require-date-day-two-digits

This rule enforces using `day: '2-digit'` when calling `Date.prototype.toLocaleDateString` so date strings always use two-digit day representations (e.g., `01 Mar` instead of `1 Mar`).

## What it checks

- Calls to `toLocaleDateString` with an object literal options argument containing `day: 'numeric'` are reported.
- Cases where `day` is missing or uses `'2-digit'` are allowed.
- If the `day` value is a non-literal (variable/expression), the rule does not attempt to assert and will not report.

## Example

### ✅ Valid

```js
new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
```

### ❌ Invalid

```js
new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
```

## Rationale

E2E tests should match the application's date formatting which uses two-digit days. Using `day: 'numeric'` produces single-digit days for the 1st–9th days, causing intermittent failures when tests expect two-digit formatting.
