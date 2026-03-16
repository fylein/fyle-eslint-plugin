import { ESLintUtils } from '@typescript-eslint/utils';
import * as angularEslintUtils from '@angular-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-inline-date-format.md',
);

const RULE_NAME = 'no-inline-date-format';

function normalizeSpanIndex(indexLike) {
  if (typeof indexLike === 'number') {
    return indexLike;
  }
  if (indexLike && typeof indexLike.offset === 'number') {
    return indexLike.offset;
  }
  return null;
}

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
      'BindingPipe[name="date"]'(node) {
        const firstArg = node.args?.[0];
        if (!firstArg || typeof firstArg.value !== 'string') {
          return;
        }

        const sourceCode = context.getSourceCode();
        const span = firstArg.sourceSpan ?? null;
        const start = normalizeSpanIndex(span?.start);
        const end = normalizeSpanIndex(span?.end);

        if (start === null || end === null) {
          context.report({ node, messageId: 'noInlineDateFormatTemplate' });
          return;
        }

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noInlineDateFormatTemplate',
        });
      },
    };
  },
});
