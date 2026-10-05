# Model File Location

The `model-file-location` rule keeps TypeScript shape declarations in configured model folders. It is intended for explicit repository configuration, especially in monorepos.

## Configuration

```javascript
{
  rules: {
    '@fyle/model-file-location': ['error', {
      modelFolders: [
        'apps/*/src/models',
        'libs/*/src/models',
      ],
      skipFiles: [
        'apps/expenses/src/features/budget/budget.interface.ts',
      ],
    }],
  },
}
```

Every TypeScript file under a configured model folder must end in `.model.ts`. `skipFiles` is an exact, repository-relative allowlist of `.interface.ts` files that may bypass this filename requirement; glob patterns are not supported. Those files remain subject to the interface-file convention rule. Type and interface declarations outside the configured model folders are also rejected.
