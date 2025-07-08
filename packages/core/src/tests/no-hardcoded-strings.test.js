import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from '@jest/globals';
import rule from '../rules/no-hardcoded-strings';
// Import the Angular-aware parser
import angularParser from '@angular-eslint/template-parser';

// Provide the testing framework functions to the RuleTester.
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

// Configure the RuleTester using the new "flat config" format.
const ruleTester = new RuleTester({
  languageOptions: {
    // CRITICAL FIX: Use the Angular ESLint parser.
    parser: angularParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      // Remove project settings to avoid TypeScript project inclusion errors
      // project: './tsconfig.json',
      // tsconfigRootDir: join(process.cwd(), 'tests/fixtures'),
      // Use createDefaultProgram as a fallback for in-memory test files
      createDefaultProgram: true,
    },
  },
});

ruleTester.run('no-hardcoded-strings', rule, {
  valid: [
    // Class: Private property is not checked
    `@Component({ template: '<div></div>' }) class D { private title = "Secret Title"; }`,
    {
      code: `
        @Component({ template: '<div></div>' }) 
        class D { 
        private title: string; 
        ngOnInit() { 
          this.title = "Secret Title"; 
        } 
      }`,
    },

    // Class: String literal initialized with translocoService is allowed
    {
      code: `@Component({ template: '<h1>{{ title }}</h1>' }) class F { title = this.translocoService.translate('some.key'); constructor(private translocoService: any) {} }`,
    },

    // Strings with only special characters should be ignored
    `class J { specialChars = "!!!"; }`,
    `class K { dots = "..."; }`,
    `class L { stars = "***"; }`,
    `class M { arrow = "→"; }`,
    `class N { bullets = "•••"; }`,
    // Toast: Using translated keys is allowed
    `
      interface ToastMessageService { 
        showSuccessToast(message: string): void; 
      }
      @Component({ template: '<div></div>' }) 
      class H { 
        constructor(private toastMessageService: ToastMessageService) {}
        showToast() { 
          this.toastMessageService.showSuccessToast(this.translocoService.translate('success.key')); 
        } 
      }
    `,
    // Toast: Different naming conventions with translated keys are allowed
    `
      interface ToastService { 
        show(message: string): void; 
      }
      @Component({ template: '<div></div>' }) 
      class I { 
        constructor(private myToast: ToastService) {}
        showToast() { 
          this.myToast.show(this.translocoService.translate('success.key')); 
        } 
      }
    `,
    // Non-user-facing assignments should be allowed
    `class ValidAssignment { 
      ngOnInit() { 
        this.config = { type: 'submit', class: 'btn-primary' }; 
      } 
    }`,
    // Template literal assigned to private property should be allowed
    `class PrivateTemplateTest { 
      private test: string; 
      ngOnInit() { 
        this.test = \`Hello \${this.employee()?.user?.full_name}\`; 
      } 
    }`,
    // Assignments to non-user-facing properties should be allowed
    `class ComponentRefTest { 
      setupComponent() { 
        componentRef.instance.classes = 'tw-h-12-px tw-w-12-px tw-ml-8-px tw-animate-spinner';
        componentRef.instance.containerClasses = 'tw-h-14-px';
        componentRef.instance.styles = 'color: red; background: blue';
        componentRef.instance.iconSize = 'large';
      } 
    }`,
    // Technical strings should be allowed
    `class TechnicalStrings { 
      setupRouting() { 
        this.window.location.href = '/app/#/signin';
        this.errorCode = 'access_denied';
        this.apiUrl = 'https://api.example.com/users';
        this.routePath = '/dashboard/settings';
        this.dataAttribute = 'data-testid';
        this.ariaLabel = 'aria-label';
      } 
    }`,
    // Translation key pattern should be allowed even without transloco pipe
    {
      code: `class Service { getTitle() { return this.translate.instant('dashboard.header.welcome'); } }`,
    },
    // Object literal with translation key should be allowed
    {
      code: `class Dialog { open() { this.dialog.open(MyCmp, { title: 'reports.submit' }); } }`,
    },
    // Strings inside *.spec.ts files should be ignored
    {
      code: `describe('Spec', () => { it('works', () => { const msg = 'should not flag'; }); });`,
      filename: 'example.spec.ts',
    },
    // Tracking service or eventTrack calls should be allowed
    {
      code: `class T { constructor(private trackingService: any) {} log() { this.eventTrack('Clicked schedule demo', { type: 'button' }); } }`,
    },
    {
      code: `class T { constructor(private trackingService: any) {} log() { this.trackingService.track('Clicked schedule demo'); } }`,
    },
    // Should not be flagged as it's not a user-facing string
    {
      code: `
        @Component({
          selector: 'app-root',
          template: '<h1>{{ title }}</h1>'
        })
        export class AppComponent {
          title = 'my-app';
        }`,
    },
    // Custom nonUserFacingPattern: custom properties should be ignored
    {
      code: `class CustomPropertyTest { 
        setupComponent() { 
          componentRef.instance.customProperty = 'some value';
          componentRef.instance.dataAttribute = 'data-value';
        } 
      }`,
      options: [
        {
          nonUserFacingPattern:
            '(class|style|type|form|loading|template|icon|size|src|href|router|query|fragment|preserve|skip|replace|state|button|default|validate|element|prefix|direction|styleClasses|tooltipShowEvent|keys|option|position|append|source|test|field|autocomplete|Id|image|url|height|width|target|pSortableColumn|name|alignment|mode|accept|responsiveLayout|customProperty|dataAttribute)',
        },
      ],
    },
    // Custom nonUserFacingPattern: completely different pattern (should work because it's combined with default)
    {
      code: `class TechnicalPropertyTest { 
        setupComponent() { 
          componentRef.instance.technical = 'technical value';
          componentRef.instance.internal = 'internal value';
          componentRef.instance.config = 'config value';
        } 
      }`,
      options: [
        {
          nonUserFacingPattern:
            '(technical|internal|config|setting|property|attribute)',
        },
      ],
    },
    // Custom nonUserFacingPattern: property definitions with custom pattern (should work because it's combined with default)
    {
      code: `class PropertyDefinitionTest { 
        technical = 'technical value';
        internal = 'internal value';
        config = 'config value';
      }`,
      options: [
        {
          nonUserFacingPattern:
            '(technical|internal|config|setting|property|attribute)',
        },
      ],
    },
  ],
  invalid: [
    // Class: Public property with hardcoded string
    {
      code: `
        @Component({
          selector: 'app-root',
          template: '<h1>{{ title }}</h1>'
        })
        export class AppComponent {
          title = 'my app';
        }`,
      errors: [{ messageId: 'noHardString', data: { text: 'my app' } }],
    },
    /*
    // Class: Protected property with hardcoded string
    {
      code: `
        @Component({
          template: '<p>{{ message }}</p>'
        })
        export class BaseComponent {
          protected message = "This is a default message.";
        }`,
      errors: [{ messageId: 'noHardString', data: { text: 'This is a default message.' } }],
    },
    // Simple assignment with hardcoded string
    {
      code: `
        @Component({ template: '<div>{{ message }}</div>' }) 
        class AppComponent {
          message = '';
          ngOnInit() {
            this.message = 'Welcome, User!';
          }
        }
      `,
      errors: [
        { messageId: 'noHardString', data: { text: 'Welcome, User!' } }
      ],
    },
    // Template literals with hardcoded parts
    {
      code: `
        @Component({ template: '<div>{{ welcomeMessage }}</div>' }) 
        class WelcomeComponent {
          name = 'User';
          welcomeMessage = \`Welcome, \${this.name}!\`;
        }
      `,
      errors: [
        { messageId: 'noHardString', data: { text: 'User' } },
        { messageId: 'noHardString', data: { text: 'Welcome, ' } }
      ],
    },
    // Mixed content (alphabetic + special chars) should still be detected
    {
      code: `class ErrorComponent { errorMsg = "Error!!!"; }`,
      errors: [
        { messageId: 'noHardString', data: { text: 'Error!!!' } }
      ],
    },
    // Multiple hardcoded strings in one class
    {
      code: `
        class MultipleStrings {
          title = 'Page Title';
          description = 'Page Description';
          getFooter() {
            return 'Copyright 2025';
          }
        }
      `,
      errors: [
        { messageId: 'noHardString', data: { text: 'Page Title' } },
        { messageId: 'noHardString', data: { text: 'Page Description' } },
      ],
    },
    // Template literal assigned to public property should be flagged
    {
      code: `
        class PublicTemplateTest { 
          message: string; 
          ngOnInit() { 
            this.message = \`Hello \${this.user?.name}\`; 
          } 
        }
      `,
      errors: [
        { messageId: 'noHardString', data: { text: 'Hello ' } }
      ],
    },
    // Assignment to user-facing property should be flagged
    {
      code: `
        class ComponentRefTest { 
          setupComponent() { 
            componentRef.instance.title = 'Delete Item';
            componentRef.instance.message = 'Welcome to our app';
          } 
        }
      `,
      errors: [
        { messageId: 'noHardString', data: { text: 'Delete Item' } },
        { messageId: 'noHardString', data: { text: 'Welcome to our app' } }
      ],
    },
    // Custom nonUserFacingPattern: properties not in pattern should still be flagged
    {
      code: `class CustomPropertyTest { 
        setupComponent() { 
          componentRef.instance.title = 'User-facing title';
          componentRef.instance.message = 'User-facing message';
        } 
      }`,
      options: [{ nonUserFacingPattern: '(technical|internal|config|setting|property|attribute)' }],
      errors: [
        { messageId: 'noHardString', data: { text: 'User-facing title' } },
        { messageId: 'noHardString', data: { text: 'User-facing message' } }
      ],
    },
    // Custom nonUserFacingPattern: property definitions not in pattern should be flagged
    {
      code: `class PropertyDefinitionTest { 
        title = 'User-facing title';
        message = 'User-facing message';
      }`,
      options: [{ nonUserFacingPattern: '(technical|internal|config|setting|property|attribute)' }],
      errors: [
        { messageId: 'noHardString', data: { text: 'User-facing title' } },
        { messageId: 'noHardString', data: { text: 'User-facing message' } }
      ],
    },
    // Custom nonUserFacingPattern: default pattern properties should still be ignored when using custom pattern
    {
      code: `class DefaultPatternTest { 
        setupComponent() { 
          componentRef.instance.class = 'some class';
          componentRef.instance.style = 'some style';
        } 
      }`,
      options: [{ nonUserFacingPattern: '(technical|internal|config|setting|property|attribute)' }],
    },
    */
  ],
});
