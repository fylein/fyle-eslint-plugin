# API Contract Naming

The `api-contract-naming` rule keeps API-backed UI models separate from application-only interfaces and makes their filenames predictable.

## Configuration

The rule is enabled by the plugin's `strict` config. It can also be configured directly:

```javascript
{
  rules: {
    '@fyle/api-contract-naming': ['error', { rootFolder: 'src/app/data' }],
  },
}
```

`rootFolder` defaults to ESLint's working directory. The rule expects these recursive folder trees beneath it:

```text
src/app/data/
├── model/
│   └── expense.model.ts
└── interface/
    └── filter-state.interface.ts
```

## API Models

A file that imports from `@fylein/types` or one of its subpaths is an API model. It must:

- Live below the configured `model/` folder.
- End in `.model.ts`.
- Import and use at least one type from `@fylein/types` or one of its subpaths.
- Contain no imports from other packages or relative paths.
- Export exactly one type or interface.
- Use a kebab-case filename matching the exported name. A leading `UI` is omitted from the filename, so `UIExpense` belongs in `expense.model.ts`.

When a type intersects one imported API type with an object literal containing additional fields, its name must be `UI<ImportedTypeName>`. The added field names must use camelCase.

```typescript
// model/expense.model.ts
import type { Expense } from '@fylein/types/spender';

export type UIExpense = Expense & {
  displayName: string;
  isSelected?: boolean;
};
```

The following examples are invalid:

```typescript
// Wrong type name and non-camelCase field.
export type ExpenseWithUI = Expense & {
  Display_Name: string;
};

// The UI prefix is misleading because no fields are added.
export type UIExpense = Expense & {};
```

When an added-property intersection has exactly one imported API base, import aliases are resolved to the original export name, so an alias of `Expense` still requires `UIExpense`. Intersections containing multiple imported API base types are allowed and do not receive a UI-name diagnostic.

## Local Interfaces

A runtime-free file containing local type definitions and no `@fylein/types` import is a non-contract interface file. It must:

- Live below the configured `interface/` folder.
- End in `.interface.ts`.
- Export exactly one locally declared interface.
- Use a kebab-case filename matching the complete interface name.
- Contain no type aliases, type re-exports, or runtime declarations.

```typescript
// interface/filter-state.interface.ts
export interface FilterState {
  searchText: string;
  isEnabled: boolean;
}
```

The `UI` prefix is not removed from interface filenames: `UIState` belongs in `ui-state.interface.ts`.

## Exclusions

The rule ignores declaration files (`.d.ts`), non-TypeScript files, and ordinary runtime TypeScript modules that are not named or placed as model/interface files and do not import from `@fylein/types`.
