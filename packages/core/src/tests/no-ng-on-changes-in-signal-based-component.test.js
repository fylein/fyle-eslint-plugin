import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-ng-on-changes-in-signal-based-component.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-ng-on-changes-in-signal-based-component', rule, {
  valid: [
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngOnInit(): void {}
        }
      `,
    },
    {
      code: `
        class Helper {
          ngOnChanges(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from 'another-package';

        @Component({})
        class ExampleComponent {
          ngOnChanges(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          handleNgOnChanges(): void {}

          handleChange(): void {
            this.ngOnChangesHandler();
          }

          private ngOnChangesHandler(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          static ngOnChanges(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        class Helper {
          ngOnChanges(): void {}
        }

        @Component({ template: '' })
        class ExampleComponent {}
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngOnChanges(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngOnChanges = (): void => {};
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          'ngOnChanges'(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ['ngOnChanges'](): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import { Component as NgComponent } from '@angular/core';

        @NgComponent({ template: '' })
        class ExampleComponent {
          ngOnChanges(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import * as ng from '@angular/core';

        @ng.Component({ template: '' })
        class ExampleComponent {
          ngOnChanges(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        const ExampleComponent = @Component({ template: '' }) class {
          ngOnChanges(): void {}
        };
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngOnChanges' } }],
    },
  ],
});
