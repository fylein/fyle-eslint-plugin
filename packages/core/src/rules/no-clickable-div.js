import { ESLintUtils } from '@typescript-eslint/utils';
import { getTemplateParserServices } from '@angular-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () => `https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-clickable-div.md`,
);

const RULE_NAME = 'no-clickable-div';

/** Output / event binding names that imply user activation (mouse or keyboard). */
const INTERACTIVE_OUTPUT_PREFIXES = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'keydown',
  'keyup',
];

function outputImpliesInteractive(outputName) {
  if (!outputName) {
    return false;
  }
  const normalized = outputName.toLowerCase();
  return INTERACTIVE_OUTPUT_PREFIXES.some(
    (ev) => normalized === ev || normalized.startsWith(`${ev}.`),
  );
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer <button type="button"> or <a> over clickable <div>/<span> for accessibility.',
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      useSemantic:
        'Use <button type="button"> or <a> instead of a clickable {{tag}}. Divs/spans have no built-in role or keyboard behavior.',
    },
  },
  defaultOptions: [],

  create(context) {
    let parserServices;
    try {
      parserServices = getTemplateParserServices(context);
    } catch {
      return {};
    }

    return {
      Element(node) {
        const tag = node.name?.toLowerCase?.();
        if (tag !== 'div' && tag !== 'span') {
          return;
        }

        const hasInteractiveOutput = node.outputs?.some((output) =>
          outputImpliesInteractive(output.name),
        );
        if (!hasInteractiveOutput) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          loc,
          messageId: 'useSemantic',
          data: { tag },
        });
      },
    };
  },
});
