# Custom ESLint Rule: no-datepipe-transform-format-arg

Disallow passing a custom format (2nd argument) to Angular `DatePipe.transform(...)`.

## Why

Passing a second argument bypasses org-level date formatting preferences. Prefer `DatePipe.transform(value)` and let global configuration control formatting.

## Incorrect

```ts
this.datePipe.transform(date, 'MM/dd/yyyy');
this.datePipe.transform(date, someFormatVar);
```

## Correct

```ts
this.datePipe.transform(date);
```

## Notes

This rule is **type-aware**: it uses the TypeScript type checker to ensure the receiver is actually Angular `DatePipe` before reporting.
