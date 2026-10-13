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
        'index.ts',
      ],
    }],
  },
}
```

Every TypeScript file under a configured model folder must end in `.model.ts`. `skipFiles` accepts only exact `index.ts` or exact `*.interface.ts` filenames; the file may be located in any directory, but its basename must match exactly. Paths and glob patterns are not supported. Skipped files remain subject to their other applicable rules. Type and interface declarations outside the configured model folders are also rejected.
