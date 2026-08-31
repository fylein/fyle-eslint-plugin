import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from '@jest/globals';
import * as angularTemplateParserModule from '@angular-eslint/template-parser';
import rule from '../rules/no-clickable-div.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

/** CJS/ESM interop: default import can be undefined under Jest; use namespace + default fallback. */
const angularTemplateParser =
  typeof angularTemplateParserModule.parseForESLint === 'function'
    ? angularTemplateParserModule
    : angularTemplateParserModule.default;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: angularTemplateParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      createDefaultProgram: true,
    },
  },
});

ruleTester.run('no-clickable-div', rule, {
  valid: [
    {
      code: '<button type="button" (click)="onClick()">OK</button>',
      filename: 'test.component.html',
    },
    {
      code: '<a href="/home" (click)="track()">Home</a>',
      filename: 'test.component.html',
    },
    {
      code: '<div>No click here</div>',
      filename: 'test.component.html',
    },
    {
      code: '<span>{{ label }}</span>',
      filename: 'test.component.html',
    },
  ],
  invalid: [
    {
      code: '<div (click)="doThing()"></div>',
      filename: 'test.component.html',
      errors: [{ messageId: 'useSemantic' }],
    },
    {
      code: '<span (keydown.enter)="submit()"></span>',
      filename: 'test.component.html',
      errors: [{ messageId: 'useSemantic' }],
    },
    {
      code: '<div (mousedown)="start()"></div>',
      filename: 'test.component.html',
      errors: [{ messageId: 'useSemantic' }],
    },
  ],
});
