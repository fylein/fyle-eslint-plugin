# Custom ESLint Rule: no-checked-lifecycle-hooks-in-onpush-component

Disallow `ngDoCheck()`, `ngAfterContentChecked()`, and `ngAfterViewChecked()` in OnPush Angular components.

## Why

Angular can skip a clean OnPush component and its subtree during change detection. Checked lifecycle hooks therefore cannot safely poll for external state changes or serve as the mechanism that discovers a required UI update.

Use explicit reactive state updates instead:

- Update a template-consumed signal.
- Consume an observable with `AsyncPipe`.
- Subscribe to the relevant form or control event and update template-consumed state.

## Incorrect

```ts
@Component({
  selector: 'feature-expense',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureExpenseComponent implements DoCheck {
  ngDoCheck(): void {
    if (this.control.touched) {
      this.internalControl.markAsTouched();
    }
  }
}
```

## Correct

```ts
@Component({
  selector: 'feature-expense',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureExpenseComponent {
  readonly touched = toSignal(this.control.events.pipe(filter((event) => event instanceof TouchedChangeEvent)));
}
```

## Usage

Enable this rule only for components that have completed the OnPush migration:

```js
import fyleCore from '@fyle/eslint-plugin';

const onPushMigratedComponents = ['app-v2/libs/shared/features/feature-expense/src/lib/feature-expense.component.ts'];

export default [
  {
    plugins: {
      '@fyle': fyleCore,
    },
  },
  {
    files: onPushMigratedComponents,
    rules: {
      '@fyle/no-checked-lifecycle-hooks-in-onpush-component': 'error',
    },
  },
];
```

The rule intentionally does not inspect the component's `changeDetection` metadata. Keeping applicability in an explicit file list prevents a component from bypassing enforcement by removing `OnPush`.

The rule has no automatic fix because checked lifecycle hooks can contain business logic that must be migrated deliberately.
