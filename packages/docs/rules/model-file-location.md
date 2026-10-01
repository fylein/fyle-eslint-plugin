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
        'apps/*/src/features/*/**/*.interface.ts',
      ],
    }],
  },
}
```

Files containing `type` or `interface` declarations must be named `.model.ts` and live under one of the configured model folders. `skipFiles` allows specific `.interface.ts` files to bypass this placement rule; those files remain subject to the interface-file convention rule.
