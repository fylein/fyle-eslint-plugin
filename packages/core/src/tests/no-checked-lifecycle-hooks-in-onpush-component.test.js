import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-checked-lifecycle-hooks-in-onpush-component.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-checked-lifecycle-hooks-in-onpush-component', rule, {
  valid: [
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngOnInit(): void {}
          ngOnChanges(): void {}
          ngAfterContentInit(): void {}
          ngAfterViewInit(): void {}
          ngOnDestroy(): void {}
        }
      `,
    },
    {
      code: `
        class Helper {
          ngDoCheck(): void {}
          ngAfterContentChecked(): void {}
          ngAfterViewChecked(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from 'another-package';

        @Component({})
        class ExampleComponent {
          ngDoCheck(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          handleNgDoCheck(): void {}
          handleNgAfterContentChecked(): void {}
          handleNgAfterViewChecked(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          static ngDoCheck(): void {}
          static ngAfterContentChecked(): void {}
          static ngAfterViewChecked(): void {}
        }
      `,
    },
    {
      code: `
        import { Component } from '@angular/core';

        class Helper {
          ngDoCheck(): void {}
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
          ngDoCheck(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngDoCheck' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngAfterContentChecked(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngAfterContentChecked' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngAfterViewChecked(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngAfterViewChecked' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngDoCheck(): void {}
          ngAfterContentChecked(): void {}
          ngAfterViewChecked(): void {}
        }
      `,
      errors: [
        { messageId: 'forbiddenHook', data: { hook: 'ngDoCheck' } },
        { messageId: 'forbiddenHook', data: { hook: 'ngAfterContentChecked' } },
        { messageId: 'forbiddenHook', data: { hook: 'ngAfterViewChecked' } },
      ],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ngDoCheck = (): void => {};
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngDoCheck' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          'ngAfterContentChecked'(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngAfterContentChecked' } }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({ template: '' })
        class ExampleComponent {
          ['ngAfterViewChecked'](): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngAfterViewChecked' } }],
    },
    {
      code: `
        import { Component as NgComponent } from '@angular/core';

        @NgComponent({ template: '' })
        class ExampleComponent {
          ngDoCheck(): void {}
        }
      `,
      errors: [{ messageId: 'forbiddenHook', data: { hook: 'ngDoCheck' } }],
    },
  ],
});
