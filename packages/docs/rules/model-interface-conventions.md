# Model and Interface Conventions

The `model-interface-conventions` rule keeps API-backed models separate from application-only UI interfaces and makes their names and filenames predictable.

## Configuration

The rule is enabled by the plugin's `strict` config. It can also be enabled directly:

```javascript
{
  rules: {
    '@fyle/model-interface-conventions': 'error',
  },
}
```

The rule does not require a particular directory structure.

## API Models

A file that imports from `@fylein/types` or one of its subpaths is an API model. Files ending in `.model.ts` are also treated as API models. An API model must:

- End in `.model.ts`.
- Import and use at least one type from `@fylein/types` or one of its subpaths.
- Contain no imports from other packages or relative paths.
- Export exactly one type or interface.
- Use a kebab-case filename matching the complete exported name.
- Export a name ending in `In`, `Out`, `Response`, or `GetParams`.

The export-name suffix check applies only after the file has the `.model.ts` suffix. For example, an API-backed `expense.ts` file reports the missing `.model.ts` suffix without also reporting its export-name suffix.

When a type intersects one imported API type with an object literal containing additional fields, its name must be `UI<ImportedTypeName>`. The added field names must use camelCase. The `UI` prefix is part of the filename, so it is not optional.

```typescript
// ui-expense-out.model.ts
import type { ExpenseOut } from '@fylein/types/spender';

export type UIExpenseOut = ExpenseOut & {
  displayName: string;
  isSelected?: boolean;
};
```

The following examples are invalid:

```typescript
// Wrong type name and non-camelCase field.
export type ExpenseWithUIOut = ExpenseOut & {
  Display_Name: string;
};

// The UI prefix is misleading because no fields are added.
export type UIExpenseOut = ExpenseOut & {};
```

When an added-property intersection has exactly one imported API base, import aliases are resolved to the original export name, so an alias of `ExpenseOut` still requires `UIExpenseOut`. Intersections containing multiple imported API base types are allowed and do not receive a UI-name diagnostic.

## Local Interfaces

A runtime-free file containing local type definitions and no `@fylein/types` import is a non-contract interface file. It must:

- End in `.interface.ts`.
- Export exactly one locally declared interface.
- Use a kebab-case filename matching the complete interface name.
- Contain no type aliases, type re-exports, or runtime declarations.

```typescript
// filter-state.interface.ts
export interface FilterState {
  searchText: string;
  isEnabled: boolean;
}
```

The complete interface name is represented in the filename: `UIState` belongs in `ui-state.interface.ts`.

## Exclusions

The rule ignores declaration files (`.d.ts`), non-TypeScript files, and ordinary runtime TypeScript modules that are not named model/interface files and do not import from `@fylein/types`.
