import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'node:path';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/model-file-export-convention.md',
);

const RULE_NAME = 'model-file-export-convention';

function getFilename(context) {
  return context.filename ?? context.getFilename?.() ?? '';
}

function toKebabCase(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require model files to export one type whose name matches the filename',
    },
    schema: [],
    messages: {
      exportCount: 'Model files must export exactly one local type; found {{ count }}.',
      invalidExport: 'Model files must export a local type declaration, not {{ exportKind }}.',
      filenameMustMatchExport:
        "Filename must be '{{ expectedFilename }}' to match the exported type '{{ exportName }}'.",
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = getFilename(context);
    if (!filename.endsWith('.model.ts') || filename === '<input>') {
      return {};
    }

    return {
      'Program:exit'(program) {
        const exportedTypes = [];
        const invalidExports = [];

        for (const statement of program.body) {
          if (statement.type !== 'ExportNamedDeclaration') {
            continue;
          }

          if (statement.declaration?.type === 'TSTypeAliasDeclaration') {
            exportedTypes.push(statement.declaration);
            continue;
          }

          if (statement.declaration) {
            invalidExports.push({ node: statement.declaration, exportKind: statement.declaration.type });
            continue;
          }

          if (statement.specifiers.length > 0 || statement.source || statement.exportKind === 'type') {
            invalidExports.push({ node: statement, exportKind: 'type re-export' });
          }
        }

        if (invalidExports.length > 0) {
          for (const exported of invalidExports) {
            context.report({
              node: exported.node,
              messageId: 'invalidExport',
              data: { exportKind: exported.exportKind },
            });
          }
        }

        if (exportedTypes.length !== 1) {
          context.report({
            node: program,
            messageId: 'exportCount',
            data: { count: String(exportedTypes.length) },
          });
          return;
        }

        const exportedType = exportedTypes[0];
        const exportName = exportedType.id.name;
        const expectedFilename = `${toKebabCase(exportName)}.model.ts`;
        const basename = path.basename(filename);

        if (basename !== expectedFilename) {
          context.report({
            node: exportedType.id,
            messageId: 'filenameMustMatchExport',
            data: { expectedFilename, exportName },
          });
        }
      },
    };
  },
});
