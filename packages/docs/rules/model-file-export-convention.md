# Model File Export Convention

The `model-file-export-convention` rule keeps model files predictable.

## Configuration

```javascript
{
  rules: {
    '@fyle/model-file-export-convention': 'error',
  },
}
```

Files ending in `.model.ts` must export exactly one locally declared type alias. The exported type name must match the filename in kebab case, and interface declarations are not allowed anywhere in the file.

```typescript
// ui-expense-out.model.ts
export type UIExpenseOut = {
  displayName: string;
};
```

Interfaces, type re-exports, export-all statements, and multiple exported type aliases are not allowed.

When the exported type is derived from a type imported from `@fylein/types` (including its subpaths), its name must start with `UI`. For example, `Dateify<ReportOut>` must be exported as `UIReportOut`, in `ui-report-out.model.ts`.
