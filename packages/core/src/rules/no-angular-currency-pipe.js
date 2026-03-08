import { ESLintUtils } from '@typescript-eslint/utils';
import * as angularEslintUtils from '@angular-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-angular-currency-pipe.md',
);

const RULE_NAME = 'no-angular-currency-pipe';

function normalizeSpanIndex(indexLike) {
  if (typeof indexLike === 'number') {
    return indexLike;
  }
  if (indexLike && typeof indexLike.offset === 'number') {
    return indexLike.offset;
  }
  return null;
}

function getSpanStartEnd(node) {
  const span = node?.nameSpan ?? node?.sourceSpan ?? null;
  const start = normalizeSpanIndex(span?.start);
  const end = normalizeSpanIndex(span?.end);

  if (start !== null && end !== null) {
    return { start, end };
  }

  const range = node?.range;
  if (Array.isArray(range) && range.length === 2) {
    return { start: range[0], end: range[1] };
  }

  return { start: null, end: null };
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Angular built-in `currency` pipe in templates (use `fyCurrency`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noAngularCurrencyPipe: 'Use the `fyCurrency` pipe instead of the built-in `currency` pipe.',
    },
  },
  defaultOptions: [],
  create(context) {
    angularEslintUtils.ensureTemplateParser(context);
    const sourceCode = context.sourceCode;

    return {
      'BindingPipe[name="currency"]'(node) {
        const { start, end } = getSpanStartEnd(node);

        if (start === null || end === null) {
          context.report({
            node,
            messageId: 'noAngularCurrencyPipe',
          });
          return;
        }

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noAngularCurrencyPipe',
          fix(fixer) {
            return fixer.replaceTextRange([start, end], 'fyCurrency');
          },
        });
      },
    };
  },
});
