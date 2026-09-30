import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'node:path';

const createRule = ESLintUtils.RuleCreator(
  () =>
    'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/interface-file-export-convention.md',
);

const RULE_NAME = 'interface-file-export-convention';

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
      description: 'Require interface files to export one interface whose name matches the filename',
    },
    schema: [],
    messages: {
      exportCount: 'Interface files must export exactly one local interface; found {{ count }}.',
      invalidExport: 'Interface files must export a local interface declaration, not {{ exportKind }}.',
      typeNotAllowed: 'Interface files must not contain type declarations.',
      filenameMustMatchExport:
        "Filename must be '{{ expectedFilename }}' to match the exported interface '{{ exportName }}'.",
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = getFilename(context);
    if (!filename.endsWith('.interface.ts') || filename === '<input>') {
      return {};
    }

    return {
      TSTypeAliasDeclaration(node) {
        context.report({ node, messageId: 'typeNotAllowed' });
      },
      'Program:exit'(program) {
        const exportedInterfaces = [];
        const invalidExports = [];

        for (const statement of program.body) {
          if (statement.type !== 'ExportNamedDeclaration') {
            continue;
          }

          if (statement.declaration?.type === 'TSInterfaceDeclaration') {
            exportedInterfaces.push(statement.declaration);
            continue;
          }

          if (statement.declaration && statement.declaration.type !== 'TSTypeAliasDeclaration') {
            invalidExports.push({ node: statement.declaration, exportKind: statement.declaration.type });
            continue;
          }

          if (statement.declaration) {
            continue;
          }

          if (statement.specifiers.length > 0 || statement.source || statement.exportKind === 'type') {
            invalidExports.push({ node: statement, exportKind: 'type re-export' });
          }
        }

        for (const exported of invalidExports) {
          context.report({
            node: exported.node,
            messageId: 'invalidExport',
            data: { exportKind: exported.exportKind },
          });
        }

        if (exportedInterfaces.length !== 1) {
          context.report({
            node: program,
            messageId: 'exportCount',
            data: { count: String(exportedInterfaces.length) },
          });
          return;
        }

        const exportedInterface = exportedInterfaces[0];
        const exportName = exportedInterface.id.name;
        const expectedFilename = `${toKebabCase(exportName)}.interface.ts`;
        const basename = path.basename(filename);

        if (basename !== expectedFilename) {
          context.report({
            node: exportedInterface.id,
            messageId: 'filenameMustMatchExport',
            data: { expectedFilename, exportName },
          });
        }
      },
    };
  },
});
