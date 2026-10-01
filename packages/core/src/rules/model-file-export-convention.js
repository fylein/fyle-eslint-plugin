import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'node:path';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/model-file-export-convention.md',
);

const RULE_NAME = 'model-file-export-convention';
const CONTRACT_IMPORT_PATTERN = /^@fylein\/types(?:\/|$)/;

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

function getTypeReferenceRootName(node) {
  if (node?.typeName?.type === 'Identifier') {
    return node.typeName.name;
  }

  let current = node?.typeName;
  while (current?.type === 'TSQualifiedName') {
    current = current.left;
  }
  return current?.type === 'Identifier' ? current.name : null;
}

function containsImportedTypeReference(node, importedTypeNames) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (node.type === 'TSTypeReference' && importedTypeNames.has(getTypeReferenceRootName(node))) {
    return true;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') {
      continue;
    }
    if (Array.isArray(value) && value.some((child) => containsImportedTypeReference(child, importedTypeNames))) {
      return true;
    }
    if (!Array.isArray(value) && containsImportedTypeReference(value, importedTypeNames)) {
      return true;
    }
  }

  return false;
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
      interfaceNotAllowed: 'Model files must not contain interface declarations.',
      uiPrefixRequired: "Model types derived from '@fylein/types' must start with 'UI'; found '{{ exportName }}'.",
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
      TSInterfaceDeclaration(node) {
        context.report({ node, messageId: 'interfaceNotAllowed' });
      },
      'Program:exit'(program) {
        const exportedTypes = [];
        const exportedTypeStatements = [];
        const invalidExports = [];
        const importedTypeNames = new Set();

        for (const statement of program.body) {
          if (statement.type !== 'ImportDeclaration' || !CONTRACT_IMPORT_PATTERN.test(String(statement.source.value))) {
            continue;
          }

          for (const specifier of statement.specifiers) {
            importedTypeNames.add(specifier.local.name);
          }
        }

        for (const statement of program.body) {
          if (statement.type !== 'ExportNamedDeclaration') {
            continue;
          }

          if (statement.declaration?.type === 'TSTypeAliasDeclaration') {
            exportedTypes.push(statement.declaration);
            exportedTypeStatements.push(statement);
            continue;
          }

          if (statement.declaration && statement.declaration.type !== 'TSInterfaceDeclaration') {
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

        if (invalidExports.length > 0) {
          for (const exported of invalidExports) {
            context.report({
              node: exported.node,
              messageId: 'invalidExport',
              data: { exportKind: exported.exportKind },
            });
          }
        }

        if (exportedTypes.length === 0) {
          context.report({
            node: program,
            messageId: 'exportCount',
            data: { count: String(exportedTypes.length) },
          });
          return;
        }

        if (exportedTypes.length > 1) {
          for (const statement of exportedTypeStatements.slice(1)) {
            context.report({
              node: statement,
              messageId: 'exportCount',
              data: { count: String(exportedTypes.length) },
            });
          }
          return;
        }

        const exportedType = exportedTypes[0];
        const exportName = exportedType.id.name;
        const expectedFilename = `${toKebabCase(exportName)}.model.ts`;
        const basename = path.basename(filename);

        if (
          importedTypeNames.size > 0 &&
          containsImportedTypeReference(exportedType.typeAnnotation, importedTypeNames) &&
          !exportName.startsWith('UI')
        ) {
          context.report({
            node: exportedType.id,
            messageId: 'uiPrefixRequired',
            data: { exportName },
          });
        }

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
