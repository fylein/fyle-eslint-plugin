import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import rule from '../rules/no-mutate-date-currency-format-tokens.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-mutate-date-currency-format-tokens', rule, {
  valid: [
    {
      code: `
        import { inject } from '@angular/core';
        import { FORMAT_PREFERENCES } from '@fyle/format-preferences-token';

        const fp = inject(FORMAT_PREFERENCES);
        const placement = fp.currencyFormat.placement;
      `,
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

        const opts = inject(DATE_PIPE_DEFAULT_OPTIONS);
        const fmt = opts.dateFormat;
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { inject } from '@angular/core';
        import { FORMAT_PREFERENCES } from '@fyle/format-preferences-token';

        const fp = inject(FORMAT_PREFERENCES);
        fp.currencyFormat.decimalSeparator = ',';
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { FORMAT_PREFERENCES } from '@fyle/format-preferences-token';

        const fp = inject(FORMAT_PREFERENCES);
        const cf = fp.currencyFormat;
        cf.thousandSeparator = ',';
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { FORMAT_PREFERENCES } from '@fyle/format-preferences-token';

        const { currencyFormat } = inject(FORMAT_PREFERENCES);
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

        const opts = inject(DATE_PIPE_DEFAULT_OPTIONS);
        opts.dateFormat = 'MMM dd, yyyy';
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

        const opts = inject(DATE_PIPE_DEFAULT_OPTIONS);
        opts.someCounter++;
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
    {
      code: `
        import { inject } from '@angular/core';
        import { FORMAT_PREFERENCES } from '@fyle/format-preferences-token';

        class Example {
          private formatPreferences = inject(FORMAT_PREFERENCES);

          updateSeparators() {
            this.formatPreferences.currencyFormat.thousandSeparator = ',';
          }
        }
      `,
      errors: [{ messageId: 'noMutateFormatTokens' }],
    },
  ],
});
