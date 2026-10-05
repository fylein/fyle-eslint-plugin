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
        'budget.interface.ts',
      ],
    }],
  },
}
```

Every TypeScript file under a configured model folder must end in `.model.ts`. `skipFiles` is an exact filename allowlist of `.interface.ts` files; the file may be located in any directory, but its basename must match exactly. Paths and glob patterns are not supported. Those files remain subject to the interface-file convention rule. Type and interface declarations outside the configured model folders are also rejected.
