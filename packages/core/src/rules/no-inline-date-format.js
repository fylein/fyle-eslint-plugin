import { ESLintUtils } from '@typescript-eslint/utils';
import * as angularEslintUtils from '@angular-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-inline-date-format.md',
);

const RULE_NAME = 'no-inline-date-format';

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow inline string literal date formats in Angular templates; use the default format preference or a variable instead',
    },
    schema: [],
    messages: {
      noInlineDateFormatTemplate:
        'Do not pass a string literal for formatting dates in templates. Use the default date format or a variable to support org level formatting.',
    },
  },
  defaultOptions: [],
  create(context) {
    angularEslintUtils.ensureTemplateParser(context);

    return {
      Program() {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.text;

        // Rough pattern:
        //   | date:'MMM dd, yyyy'
        //   |date : 'h:mm a'
        // Capture the quoted literal as group 1 so we can report precisely on it.
        const regex = /\|\s*date\s*:\s*('([^']*)')/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const fullMatch = match[0];
          const literalWithQuotes = match[1];

          const relativeIndex = fullMatch.indexOf(literalWithQuotes);
          if (relativeIndex === -1) {
            continue;
          }

          const absoluteIndex = match.index + relativeIndex;
          const startLoc = sourceCode.getLocFromIndex(absoluteIndex);
          const endLoc = sourceCode.getLocFromIndex(absoluteIndex + literalWithQuotes.length);

          context.report({
            loc: {
              start: startLoc,
              end: endLoc,
            },
            messageId: 'noInlineDateFormatTemplate',
          });
        }
      },
    };
  },
});
