# No Enums

The `no-enums` rule disallows TypeScript enums and recommends union types or `as const` objects.

## Configuration

The rule is included in the strict configuration and can also be enabled directly:

```javascript
{
  rules: {
    '@fyle/no-enums': 'error',
  },
}
```

```typescript
type Status = 'active' | 'inactive';

const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;
```
