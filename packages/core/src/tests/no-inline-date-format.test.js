import { RuleTester } from 'eslint';
import { afterAll, describe, it } from '@jest/globals';
import rule from '../rules/no-inline-date-format.js';

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
      // `@angular-eslint/template-parser` needs `filePath` to correctly parse HTML templates.
      filePath: 'example.component.html',
    },
  },
});

ruleTester.run('no-inline-date-format', rule, {
  valid: [
    {
      code: `<div>{{ someDate | date }}</div>`,
    },
    {
      code: `<div>{{ someDate | date: formatVar }}</div>`,
    },
    {
      code: `<div>{{ someDate | date: (formatVar) }}</div>`,
    },
  ],
  invalid: [
    {
      code: `<div>{{ someDate | date:'MMM dd, yyyy' }}</div>`,
      errors: [{ messageId: 'noInlineDateFormatTemplate' }],
    },
    {
      code: `<div>{{ someDate |date : 'h:mm a' }}</div>`,
      errors: [{ messageId: 'noInlineDateFormatTemplate' }],
    },
  ],
});
