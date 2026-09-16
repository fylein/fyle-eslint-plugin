# Custom ESLint Rule: no-mark-for-check-outside-control-value-accessor

Disallow `markForCheck()` calls outside classes that explicitly implement Angular's `ControlValueAccessor`.

## Why

Application components should notify Angular through template-consumed signals or `AsyncPipe`. Allowing `markForCheck()` throughout the application makes missing reactive state notifications harder to detect and review.

Control value accessors are the exception because Angular Forms can call `writeValue()` and `setDisabledState()` programmatically without a template event. A CVA may need `markForCheck()` after updating plain internal state used by its view.

## Incorrect

```ts
@Component({
  selector: 'feature-expense',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureExpenseComponent {
  refresh(): void {
    this.cdr.markForCheck();
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
  readonly expense = signal<Expense | null>(null);

  refresh(expense: Expense): void {
    this.expense.set(expense);
  }
}
```

```ts
@Component({
  selector: 'ui-expense-field',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiExpenseFieldComponent implements ControlValueAccessor {
  writeValue(value: ExpenseValue | null): void {
    this.internalControl.setValue(value, { emitEvent: false });
    this.cdr.markForCheck();
  }
}
```

## Usage

```js
import fyleCore from '@fyle/eslint-plugin';

export default [
  {
    files: ['app-v2/apps/sage-expense-management/**/*.ts', 'app-v2/libs/shared/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    plugins: {
      '@fyle': fyleCore,
    },
    rules: {
      '@fyle/no-mark-for-check-outside-control-value-accessor': 'error',
    },
  },
];
```

The rule recognizes direct, aliased, and namespace imports of `ControlValueAccessor` from `@angular/forms`. The containing class must implement that imported interface explicitly.

Exceptional low-level view infrastructure can use a targeted ESLint suppression with a reason:

```ts
// eslint-disable-next-line @fyle/no-mark-for-check-outside-control-value-accessor -- Required by manually attached view infrastructure.
this.cdr.markForCheck();
```

The rule has no automatic fix because the correct replacement depends on how the component's view state is produced and consumed.
