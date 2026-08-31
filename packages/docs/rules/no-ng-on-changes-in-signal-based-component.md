# Custom ESLint Rule: no-ng-on-changes-in-signal-based-component

Disallow `ngOnChanges()` in Angular components that have been migrated to signal-based inputs.

## Why

Migrated components use `computed()` for state derived from inputs and `effect()` for procedural input-change handling. Prohibiting `ngOnChanges()` prevents both input-change mechanisms from being mixed in the same component.

## Incorrect

```ts
@Component({
  selector: 'feature-expense',
  template: '',
})
export class FeatureExpenseComponent implements OnChanges {
  readonly expenseId = input.required<string>();

  ngOnChanges(): void {
    this.loadExpense();
  }
}
```

## Correct

```ts
@Component({
  selector: 'feature-expense',
  template: '',
})
export class FeatureExpenseComponent {
  readonly expenseId = input.required<string>();

  private readonly expenseIdEffect = effect(() => {
    this.loadExpense(this.expenseId());
  });
}
```

Use `computed()` instead when the value is purely derived from inputs.

## Usage

Enable this rule only for components that have completed the signal-input migration:

```js
import fyleCore from '@fyle/eslint-plugin';

const signalBasedComponents = ['app-v2/libs/shared/features/feature-expense/src/lib/feature-expense.component.ts'];

export default [
  {
    plugins: {
      '@fyle': fyleCore,
    },
  },
  {
    files: signalBasedComponents,
    rules: {
      '@fyle/no-ng-on-changes-in-signal-based-component': 'error',
    },
  },
];
```

The rule intentionally does not check whether signal inputs are still present. Keeping applicability in an explicit file list prevents a component from bypassing enforcement by removing its signal APIs.

The rule has no automatic fix because removing `ngOnChanges()` without migrating its behavior could introduce regressions.
