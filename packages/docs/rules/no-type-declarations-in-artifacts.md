# No Type Declarations in Artifacts

The `no-type-declarations-in-artifacts` rule keeps Angular artifact files focused on runtime behavior.

## Configuration

```javascript
{
  rules: {
    '@fyle/no-type-declarations-in-artifacts': 'error',
  },
}
```

Files ending in `.component.ts`, `.service.ts`, or `.directive.ts` must not declare TypeScript `type` aliases or `interface` declarations. Move shared shapes to a model or interface file instead.
