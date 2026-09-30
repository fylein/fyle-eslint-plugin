# Interface File Export Convention

The `interface-file-export-convention` rule keeps interface files predictable.

## Configuration

```javascript
{
  rules: {
    '@fyle/interface-file-export-convention': 'error',
  },
}
```

Files ending in `.interface.ts` must export exactly one locally declared interface. The exported interface name must match the filename in kebab case, and type aliases are not allowed.

```typescript
// expense-details.interface.ts
export interface ExpenseDetails {
  amount: number;
}
```
