import { RuleTester } from 'eslint';
import { afterAll, describe, it } from '@jest/globals';
import rule from '../rules/no-angular-currency-pipe.js';

// Jest runs these tests under CJS transform, so `require` is available here.
// eslint-disable-next-line no-undef
const angularParser = require('@angular-eslint/template-parser');

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: angularParser,
    parserOptions: {
      // RuleTester doesn't reliably pass `filename` as `filePath` to parsers.
      // `@angular-eslint/template-parser` needs `filePath` to correctly parse HTML templates.
      filePath: 'example.component.html',
    },
  },
});

ruleTester.run('no-angular-currency-pipe', rule, {
  valid: [
    {
      code: `<div>{{ amount | fyCurrency }}</div>`,
    },
    {
      code: `<div>{{ amount | number }}</div>`,
    },
    {
      code: `<div>{{ currency }}</div>`,
    },
  ],
  invalid: [
    {
      code: `<div>{{ amount | currency }}</div>`,
      output: `<div>{{ amount | fyCurrency }}</div>`,
      errors: [
        {
          messageId: 'noAngularCurrencyPipe',
        },
      ],
    },
    {
      code: `<div>{{ amount | currency:'USD' }}</div>`,
      output: `<div>{{ amount | fyCurrency:'USD' }}</div>`,
      errors: [
        {
          messageId: 'noAngularCurrencyPipe',
        },
      ],
    },
  ],
});
