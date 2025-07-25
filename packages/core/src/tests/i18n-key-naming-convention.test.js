import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../rules/i18n-key-naming-convention';
import tsParser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

// --- TypeScript Tests ---
ruleTester.run('i18n-key-naming-convention (TypeScript)', rule, {
  valid: [
    {
      code: `this.translate.translate('potentialDuplicatesReviewDialog.title');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
    },
    {
      code: `this.translate.translate('services.employeeStatus.error');`,
      filename: 'libs/shared/services/employee-status.service.ts',
    },
    {
      code: `
        const x = 'googleSignIn.unauthorizedAccessHeader';
        this.translocoService.translate(x);
      `,
      filename: 'apps/accounts/src/app/auth/google-sign-in/google-sign-in.component.ts',
    },
  ],

  invalid: [
    {
      code: `this.translate.translate('someRandom.key');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'someRandom.key',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `
        const x = 'googleSignIn1.unauthorizedAccessHeader';
        this.translocoService.translate(x);
      `,
      filename: 'apps/accounts/src/app/auth/google-sign-in/google-sign-in.component.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'googleSignIn1.unauthorizedAccessHeader',
            expectedPrefix: 'googleSignIn',
          },
        },
      ],
    },
    {
      code: `this.translocoService.translate('potentialDuplicatesReviewDialog.title.long');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      errors: [
        {
          messageId: 'tooManyParts',
          data: {
            key: 'potentialDuplicatesReviewDialog.title.long',
            maxParts: 2,
            type: 'component',
            example: 'signIn.warningAccountLockSoon',
          },
        },
      ],
    },
    {
      code: `this.translocoService.translate('services.employeeStatus');`,
      filename: 'libs/shared/services/employee-status.service.ts',
      errors: [
        {
          messageId: 'notEnoughParts',
          data: {
            key: 'services.employeeStatus',
            minParts: 3,
            type: 'service',
            example: 'services.warningAccountLockSoon.example',
          },
        },
      ],
    },
    {
      code: `this.translocoService.translate('services.employeeStatus1.error');`,
      filename: 'libs/shared/services/employee-status.service.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'services.employeeStatus1.error',
            expectedPrefix: 'services.employeeStatus',
          },
        },
      ],
    },
    {
      code: `this.translocoService.translate('services.utilExpensePolic12y.monthJanuary');`,
      filename: 'libs/shared/services/util-expense-policy.service.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'services.utilExpensePolic12y.monthJanuary',
            expectedPrefix: 'services.expensePolicy',
          },
        },
      ],
    },
  ],
});

// --- Template Tests ---
ruleTester.run('i18n-key-naming-convention (Templates)', rule, {
  valid: [
    {
      code: `
        @Component({
          template: \`<h1>{{ "potentialDuplicatesReviewDialog.title" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          template: \`<h1>{{ "someRandom.key" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'someRandom.key',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ "potentialDuplicatesReviewDialog.title.long" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      errors: [
        {
          messageId: 'tooManyParts',
          data: {
            key: 'potentialDuplicatesReviewDialog.title.long',
            maxParts: 2,
            type: 'component',
            example: 'signIn.warningAccountLockSoon',
          },
        },
      ],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ (true ? "googleSignIn12.loadingMessage" : "googleSignIn23.loadingMessage2") | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename: 'apps/accounts/src/app/auth/google-sign-in/google-sign-in.component.html',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'googleSignIn12.loadingMessage',
            expectedPrefix: 'googleSignIn',
          },
        },
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'googleSignIn23.loadingMessage2',
            expectedPrefix: 'googleSignIn',
          },
        },
      ],
    },
  ],
});

// --- Tests with ignoredPrefixes option ---
ruleTester.run('i18n-key-naming-convention (with ignoredPrefixes)', rule, {
  valid: [
    {
      code: `this.translate.translate('common.button.save');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `this.translate.translate('shared.validation.required');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `this.translate.translate('global.error.network');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.', 'global.'] }],
    },
    {
      code: `this.translate.translate('potentialDuplicatesReviewDialog.title');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `
        const x = 'common.button.cancel';
        this.translocoService.translate(x);
      `,
      filename: 'apps/accounts/src/app/auth/google-sign-in/google-sign-in.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `this.translate.translate('services.employeeStatus.error');`,
      filename: 'libs/shared/services/employee-status.service.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
  ],

  invalid: [
    {
      code: `this.translate.translate('someRandom.key');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'someRandom.key',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('auth.errorInvalidPassword');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'auth.errorInvalidPassword',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('common.button.save');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['shared.', 'global.'] }], // 'common.' not in ignoredPrefixes
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'common.button.save',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('common.button.save');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: [] }], // Empty ignoredPrefixes
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'common.button.save',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('potentialDuplicatesReviewDialog.title.long');`,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'tooManyParts',
          data: {
            key: 'potentialDuplicatesReviewDialog.title.long',
            maxParts: 2,
            type: 'component',
            example: 'signIn.warningAccountLockSoon',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('services.employeeStatus');`,
      filename: 'libs/shared/services/employee-status.service.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'notEnoughParts',
          data: {
            key: 'services.employeeStatus',
            minParts: 3,
            type: 'service',
            example: 'services.warningAccountLockSoon.example',
          },
        },
      ],
    },
  ],
});

// --- Template Tests with ignoredPrefixes option ---
ruleTester.run('i18n-key-naming-convention (Templates with ignoredPrefixes)', rule, {
  valid: [
    {
      code: `
        @Component({
          template: \`<h1>{{ "common.button.save" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ "shared.validation.required" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ "potentialDuplicatesReviewDialog.title" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
    {
      code: `
        @Component({
          template: \`<h1>*transloco="let t; read: 'common.button.save'"</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          template: \`<h1>{{ "someRandom.key" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'someRandom.key',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ "common.button.save" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['shared.', 'global.'] }], // 'common.' not in ignoredPrefixes
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'common.button.save',
            expectedPrefix: 'potentialDuplicatesReviewDialog',
          },
        },
      ],
    },
    {
      code: `
        @Component({
          template: \`<h1>{{ "potentialDuplicatesReviewDialog.title.long" | transloco }}</h1>\`
        })
        class TestComponent {}
      `,
      filename:
        'libs/shared/features/feature-potential-duplicates-review-dialog/src/lib/feature-potential-duplicates-review-dialog.component.ts',
      options: [{ ignoredPrefixes: ['common.', 'shared.'] }],
      errors: [
        {
          messageId: 'tooManyParts',
          data: {
            key: 'potentialDuplicatesReviewDialog.title.long',
            maxParts: 2,
            type: 'component',
            example: 'signIn.warningAccountLockSoon',
          },
        },
      ],
    },
  ],
});

// --- Tests for multiple prefixes and page files ---
ruleTester.run('i18n-key-naming-convention (Multiple prefixes and page files)', rule, {
  valid: [
    // Test custom file prefixes
    {
      code: `this.translate.translate('userProfile.title');`,
      filename: 'libs/shared/features/admin-user-profile/src/lib/admin-user-profile.component.ts',
      options: [{ stripFilePrefixes: ['feature-', 'ui-', 'admin-'] }],
    },
    {
      code: `this.translate.translate('dashboard.header');`,
      filename: 'libs/shared/ui/ui-dashboard/src/lib/ui-dashboard.component.ts',
      options: [{ stripFilePrefixes: ['feature-', 'ui-', 'admin-'] }],
    },
    // Test page files
    {
      code: `this.translate.translate('login.title');`,
      filename: 'apps/accounts/src/app/auth/login/login.page.ts',
    },
    {
      code: `this.translate.translate('dashboard.header');`,
      filename: 'apps/accounts/src/app/dashboard/dashboard.page.ts',
    },
    // Test page files with custom prefixes
    {
      code: `this.translate.translate('userProfile.title');`,
      filename: 'apps/admin/admin-user-profile/admin-user-profile.page.ts',
      options: [{ stripFilePrefixes: ['feature-', 'ui-', 'admin-'] }],
    },
    // Test that number format strings are not flagged as translation keys
    {
      code: `
        @Component({
          template: \`<span>{{ 'paginator.pageStatus' | transloco: { currentPage: (currentPage | number: 'obj.key'), totalPageCount: (totalPageCount | number: '1.0-0') } }}</span>\`
        })
        class TestComponent {}
      `,
      filename: 'libs/shared/features/feature-paginator/src/lib/feature-paginator.component.ts',
    },
    // Test various number format strings that should not be flagged
    {
      code: `
        @Component({
          template: \`
            <span>{{ 'paginator.pageStatus' | transloco: { 
              currentPage: (currentPage | number: '1.0-0'), 
              totalPageCount: (totalPageCount | number: '1.0-0'),
              percentage: (percentage | number: '1.2-2'),
              currency: (amount | currency: 'USD':true:'1.2-2')
            } }}</span>
          \`
        })
        class TestComponent {}
      `,
      filename: 'libs/shared/features/feature-paginator/src/lib/feature-paginator.component.ts',
    },
  ],
  invalid: [
    // Test that wrong keys are still flagged
    {
      code: `this.translate.translate('wrongKey.title');`,
      filename: 'libs/shared/features/admin-user-profile/src/lib/admin-user-profile.component.ts',
      options: [{ stripFilePrefixes: ['feature-', 'ui-', 'admin-'] }],
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'wrongKey.title',
            expectedPrefix: 'userProfile',
          },
        },
      ],
    },
    {
      code: `this.translate.translate('wrongKey.title');`,
      filename: 'apps/accounts/src/app/auth/login/login.page.ts',
      errors: [
        {
          messageId: 'mismatchedKey',
          data: {
            key: 'wrongKey.title',
            expectedPrefix: 'login',
          },
        },
      ],
    },
    // Test that page files follow component rules (max 2 parts)
    {
      code: `this.translate.translate('login.title.too.long');`,
      filename: 'apps/accounts/src/app/auth/login/login.page.ts',
      errors: [
        {
          messageId: 'tooManyParts',
          data: {
            key: 'login.title.too.long',
            maxParts: 2,
            type: 'component',
            example: 'signIn.warningAccountLockSoon',
          },
        },
      ],
    },
  ],
});
