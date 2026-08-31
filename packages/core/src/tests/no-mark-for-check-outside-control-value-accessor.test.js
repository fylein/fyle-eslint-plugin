import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-mark-for-check-outside-control-value-accessor.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-mark-for-check-outside-control-value-accessor', rule, {
  valid: [
    {
      code: `
        import { ControlValueAccessor } from '@angular/forms';

        class ExpenseFieldComponent implements ControlValueAccessor {
          writeValue(): void {
            this.cdr.markForCheck();
          }
        }
      `,
    },
    {
      code: `
        import { ControlValueAccessor as Cva } from '@angular/forms';

        class ExpenseFieldComponent implements Cva {
          setDisabledState(): void {
            this.cdr['markForCheck']();
          }
        }
      `,
    },
    {
      code: `
        import * as forms from '@angular/forms';

        class ExpenseFieldComponent implements forms.ControlValueAccessor {
          writeValue(): void {
            this.cdr.markForCheck();
          }
        }
      `,
    },
    {
      code: `
        import { ControlValueAccessor } from '@angular/forms';

        interface Validator {}

        class ExpenseFieldComponent implements Validator, ControlValueAccessor {
          writeValue(): void {
            const refresh = (): void => this.cdr.markForCheck();
            refresh();
          }
        }
      `,
    },
    {
      code: `
        class ExampleComponent {
          markForCheck(): void {}
        }
      `,
    },
    {
      code: `
        class ExampleComponent {
          refresh(): void {
            this.cdr.detectChanges();
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        class ExampleComponent {
          refresh(): void {
            this.cdr.markForCheck();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        class ExampleComponent {
          refresh(): void {
            this.cdr['markForCheck']();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        class ExampleComponent {
          refresh(): void {
            this.cdr[\`markForCheck\`]();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        cdr.markForCheck();
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        interface ControlValueAccessor {}

        class ExampleComponent implements ControlValueAccessor {
          refresh(): void {
            this.cdr.markForCheck();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        import { ControlValueAccessor } from '@angular/forms';

        class ExampleComponent {
          refresh(): void {
            this.cdr.markForCheck();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        import { ControlValueAccessor } from '@angular/forms';

        class BaseControl implements ControlValueAccessor {}

        class ExampleComponent extends BaseControl {
          refresh(): void {
            this.cdr.markForCheck();
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
    {
      code: `
        import { ControlValueAccessor } from '@angular/forms';

        class OuterControl implements ControlValueAccessor {
          createHelper(): void {
            class Helper {
              refresh(): void {
                this.cdr.markForCheck();
              }
            }
          }
        }
      `,
      errors: [{ messageId: 'markForCheckOutsideCva' }],
    },
  ],
});
