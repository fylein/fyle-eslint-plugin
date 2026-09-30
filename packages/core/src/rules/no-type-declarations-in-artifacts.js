import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () =>
    'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/no-type-declarations-in-artifacts.md',
);

const RULE_NAME = 'no-type-declarations-in-artifacts';
const ARTIFACT_SUFFIXES = ['.component.ts', '.service.ts', '.directive.ts'];

function getFilename(context) {
  return context.filename ?? context.getFilename?.() ?? '';
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type and interface declarations in Angular artifact files',
    },
    schema: [],
    messages: {
      noTypeDeclaration: 'Do not declare types or interfaces in artifact files.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = getFilename(context);
    if (!ARTIFACT_SUFFIXES.some((suffix) => filename.endsWith(suffix))) {
      return {};
    }

    return {
      TSTypeAliasDeclaration(node) {
        context.report({ node, messageId: 'noTypeDeclaration' });
      },
      TSInterfaceDeclaration(node) {
        context.report({ node, messageId: 'noTypeDeclaration' });
      },
    };
  },
});
