import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'node:path';
import process from 'node:process';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/api-contract-naming.md',
);

const RULE_NAME = 'api-contract-naming';
const CONTRACT_IMPORT_PATTERN = /^@fylein\/types(?:\/|$)/;
const CAMEL_CASE_PATTERN = /^[a-z][A-Za-z0-9]*$/;

function getFilename(context) {
  return context.filename ?? context.getFilename?.() ?? '';
}

function isDeclarationFile(filename) {
  return filename.endsWith('.d.ts');
}

function isTypeDeclaration(node) {
  return node?.type === 'TSTypeAliasDeclaration' || node?.type === 'TSInterfaceDeclaration';
}

function getDeclarationName(node) {
  return node?.id?.type === 'Identifier' ? node.id.name : null;
}

function getExportedName(specifier) {
  if (specifier.exported.type === 'Identifier') {
    return specifier.exported.name;
  }
  return String(specifier.exported.value);
}

function getLocalName(specifier) {
  if (specifier.local.type === 'Identifier') {
    return specifier.local.name;
  }
  return String(specifier.local.value);
}

function toKebabCase(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function stripModelUiPrefix(name) {
  return name.replace(/^UI(?=[A-Z0-9])/, '');
}

function unwrapType(node) {
  let current = node;
  while (current?.type === 'TSParenthesizedType') {
    current = current.typeAnnotation;
  }
  return current;
}

function flattenIntersection(node) {
  const current = unwrapType(node);
  if (current?.type !== 'TSIntersectionType') {
    return [current];
  }
  return current.types.flatMap((typeNode) => flattenIntersection(typeNode));
}

function isExplicitTypeExport(statement, localTypeNames, importedTypeNames) {
  if (statement.type === 'ExportAllDeclaration') {
    return statement.exportKind === 'type';
  }
  if (statement.type !== 'ExportNamedDeclaration' || statement.declaration) {
    return false;
  }
  if (statement.specifiers.length === 0) {
    return false;
  }
  if (statement.exportKind === 'type') {
    return true;
  }
  return statement.specifiers.every(
    (specifier) =>
      specifier.exportKind === 'type' ||
      localTypeNames.has(getLocalName(specifier)) ||
      importedTypeNames.has(getLocalName(specifier)),
  );
}

function isRuntimeFreeStatement(statement, localTypeNames, importedTypeNames) {
  if (statement.type === 'ImportDeclaration' || statement.type === 'EmptyStatement' || isTypeDeclaration(statement)) {
    return true;
  }
  if (statement.type === 'ExportNamedDeclaration' && isTypeDeclaration(statement.declaration)) {
    return true;
  }
  return isExplicitTypeExport(statement, localTypeNames, importedTypeNames);
}

function getStaticMemberName(member) {
  if (!member.key) {
    return null;
  }
  if (member.key.type === 'Identifier' && !member.computed) {
    return member.key.name;
  }
  if (member.key.type === 'Literal' && typeof member.key.value === 'string') {
    return member.key.value;
  }
  if (member.key.type === 'TemplateLiteral' && member.key.expressions.length === 0) {
    return member.key.quasis[0]?.value?.cooked ?? member.key.quasis[0]?.value?.raw ?? null;
  }
  return null;
}

function isPathInside(rootFolder, filename) {
  const relativePath = path.relative(rootFolder, filename);
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath))
  );
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce naming, folder, export, and UI-extension conventions for API models and local interfaces',
    },
    schema: [
      {
        type: 'object',
        properties: {
          rootFolder: {
            type: 'string',
            description: 'Root folder whose model/ and interface/ children contain contract files',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      contractFilenameSuffix: "API contract files must use the '.model.ts' suffix.",
      interfaceFilenameSuffix: "Non-contract interface files must use the '.interface.ts' suffix.",
      missingContractImport:
        "Model files must import and use at least one type from '@fylein/types' or one of its subpaths.",
      forbiddenModelImport:
        "Model files may only import from '@fylein/types' or one of its subpaths; remove the import from '{{ importPath }}'.",
      modelFolder: "API contract files must be inside the '{{ folder }}' folder.",
      interfaceFolder: "Non-contract interface files must be inside the '{{ folder }}' folder.",
      exportedTypeCount: 'API contract files must export exactly one type or interface; found {{ count }}.',
      exportedInterfaceCount:
        'Non-contract files must export exactly one locally declared interface; found {{ count }}.',
      filenameMustMatchExport:
        "Filename must be '{{ expectedFilename }}' to match the exported {{ exportKind }} '{{ exportName }}'.",
      interfaceOnly:
        'Non-contract interface files must use a local interface declaration, not a type alias or type re-export.',
      interfaceRuntimeDeclaration: 'Non-contract interface files must not contain runtime declarations.',
      uiTypeName: "An API type that adds properties to '{{ importedName }}' must be named '{{ expectedName }}'.",
      misleadingUiPrefix: "Type '{{ exportName }}' uses a UI prefix but adds no properties to its imported API type.",
      propertyCamelCase: "Added property '{{ propertyName }}' must use camelCase.",
      propertyStaticName: 'Added intersection members must have a statically named camelCase property key.',
    },
  },
  defaultOptions: [{ rootFolder: '.' }],
  create(context) {
    const filename = getFilename(context);
    if (!filename.endsWith('.ts') || isDeclarationFile(filename) || filename === '<input>') {
      return {};
    }

    return {
      'Program:exit'(program) {
        const cwd = context.cwd ?? process.cwd();
        const configuredRoot = context.options[0]?.rootFolder ?? '.';
        const rootFolder = path.resolve(cwd, configuredRoot);
        const absoluteFilename = path.isAbsolute(filename) ? path.normalize(filename) : path.resolve(cwd, filename);
        const basename = path.basename(absoluteFilename);
        const relativePath = path.relative(rootFolder, absoluteFilename);
        const firstFolder = isPathInside(rootFolder, absoluteFilename) ? relativePath.split(path.sep)[0] : null;
        const inModelFolder = firstFolder === 'model';
        const inInterfaceFolder = firstFolder === 'interface';
        const modelAttempt = basename.endsWith('.model.ts') || inModelFolder;
        const interfaceAttempt = basename.endsWith('.interface.ts') || inInterfaceFolder;

        const localDeclarations = new Map();
        const localTypeNames = new Set();
        const importedTypeNames = new Set();
        const contractImportLocalNames = new Set();
        const contractImports = new Map();
        const contractNamespaces = new Set();

        for (const statement of program.body) {
          const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
          if (isTypeDeclaration(declaration)) {
            const name = getDeclarationName(declaration);
            if (name) {
              localDeclarations.set(name, declaration);
              localTypeNames.add(name);
            }
          }

          if (statement.type !== 'ImportDeclaration') {
            continue;
          }

          const isContractImport = CONTRACT_IMPORT_PATTERN.test(String(statement.source.value));
          for (const specifier of statement.specifiers) {
            if (statement.importKind === 'type' || specifier.importKind === 'type') {
              importedTypeNames.add(specifier.local.name);
            }
            if (!isContractImport) {
              continue;
            }
            importedTypeNames.add(specifier.local.name);
            contractImportLocalNames.add(specifier.local.name);
            if (specifier.type === 'ImportNamespaceSpecifier') {
              contractNamespaces.add(specifier.local.name);
            } else if (specifier.type === 'ImportSpecifier') {
              const originalName =
                specifier.imported.type === 'Identifier' ? specifier.imported.name : String(specifier.imported.value);
              contractImports.set(specifier.local.name, originalName);
            } else {
              contractImports.set(specifier.local.name, specifier.local.name);
            }
          }
        }

        const hasContractImport = program.body.some(
          (statement) =>
            statement.type === 'ImportDeclaration' && CONTRACT_IMPORT_PATTERN.test(String(statement.source.value)),
        );
        const hasTypeSyntax =
          localTypeNames.size > 0 ||
          program.body.some((statement) => isExplicitTypeExport(statement, localTypeNames, importedTypeNames));
        const runtimeStatements = program.body.filter(
          (statement) => !isRuntimeFreeStatement(statement, localTypeNames, importedTypeNames),
        );
        const isRuntimeFree = runtimeStatements.length === 0;
        const isInterfaceFile = !hasContractImport && (interfaceAttempt || (hasTypeSyntax && isRuntimeFree));
        const isModelFile = hasContractImport || (!isInterfaceFile && modelAttempt);

        if (modelAttempt && !hasContractImport) {
          context.report({ node: program, messageId: 'missingContractImport' });
        }

        if (isModelFile || modelAttempt) {
          for (const statement of program.body) {
            if (
              statement.type === 'ImportDeclaration' &&
              !CONTRACT_IMPORT_PATTERN.test(String(statement.source.value))
            ) {
              context.report({
                node: statement.source,
                messageId: 'forbiddenModelImport',
                data: { importPath: String(statement.source.value) },
              });
            }
          }
        }

        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const usesContractImport = sourceCode.scopeManager.scopes.some((scope) =>
          scope.variables.some(
            (variable) => contractImportLocalNames.has(variable.name) && variable.references.length > 0,
          ),
        );
        if (hasContractImport && !usesContractImport) {
          context.report({ node: program, messageId: 'missingContractImport' });
        }

        const reportFolder = (expectedFolder, messageId) => {
          if (firstFolder !== expectedFolder) {
            context.report({
              node: program,
              messageId,
              data: { folder: path.join(configuredRoot, expectedFolder) },
            });
          }
        };

        const getTypeExports = () => {
          const exports = [];
          let hasTypeExportAll = false;
          for (const statement of program.body) {
            if (statement.type === 'ExportAllDeclaration' && statement.exportKind === 'type') {
              hasTypeExportAll = true;
              continue;
            }
            if (statement.type !== 'ExportNamedDeclaration') {
              continue;
            }
            if (isTypeDeclaration(statement.declaration)) {
              const name = getDeclarationName(statement.declaration);
              exports.push({
                name,
                kind: statement.declaration.type === 'TSInterfaceDeclaration' ? 'interface' : 'type',
                declaration: statement.declaration,
                node: statement.declaration,
              });
              continue;
            }
            for (const specifier of statement.specifiers) {
              const localName = getLocalName(specifier);
              const isTypeExport =
                statement.exportKind === 'type' ||
                specifier.exportKind === 'type' ||
                localTypeNames.has(localName) ||
                importedTypeNames.has(localName);
              if (!isTypeExport) {
                continue;
              }
              const declaration = localDeclarations.get(localName) ?? null;
              exports.push({
                name: getExportedName(specifier),
                kind: declaration?.type === 'TSInterfaceDeclaration' ? 'interface' : 'type',
                declaration,
                node: specifier,
                isReExport: Boolean(statement.source) || !declaration,
              });
            }
          }
          return { exports, hasTypeExportAll };
        };

        const { exports: typeExports, hasTypeExportAll } = getTypeExports();

        const reportFilenameMatch = (exported, suffix, stripUiPrefix) => {
          const sourceName = stripUiPrefix ? stripModelUiPrefix(exported.name) : exported.name;
          const expectedFilename = `${toKebabCase(sourceName)}${suffix}`;
          if (basename !== expectedFilename) {
            context.report({
              node: exported.node,
              messageId: 'filenameMustMatchExport',
              data: {
                expectedFilename,
                exportKind: exported.kind,
                exportName: exported.name,
              },
            });
          }
        };

        const getContractBaseName = (typeNode) => {
          const node = unwrapType(typeNode);
          if (node?.type !== 'TSTypeReference') {
            return null;
          }
          if (node.typeName.type === 'Identifier') {
            return contractImports.get(node.typeName.name) ?? null;
          }
          if (
            node.typeName.type === 'TSQualifiedName' &&
            node.typeName.left.type === 'Identifier' &&
            contractNamespaces.has(node.typeName.left.name) &&
            node.typeName.right.type === 'Identifier'
          ) {
            return node.typeName.right.name;
          }
          return null;
        };

        const checkContractIntersection = (exported) => {
          if (exported.declaration?.type !== 'TSTypeAliasDeclaration') {
            return;
          }
          const annotation = unwrapType(exported.declaration.typeAnnotation);
          if (annotation?.type !== 'TSIntersectionType') {
            return;
          }

          const operands = flattenIntersection(annotation).filter(Boolean);
          const baseNames = [...new Set(operands.map(getContractBaseName).filter(Boolean))];
          const objectLiterals = operands.filter((operand) => operand.type === 'TSTypeLiteral');
          const addedMembers = objectLiterals.flatMap((literal) => literal.members);

          for (const member of addedMembers) {
            const propertyName = getStaticMemberName(member);
            if (propertyName === null) {
              context.report({ node: member, messageId: 'propertyStaticName' });
            } else if (!CAMEL_CASE_PATTERN.test(propertyName)) {
              context.report({
                node: member.key ?? member,
                messageId: 'propertyCamelCase',
                data: { propertyName },
              });
            }
          }

          if (addedMembers.length > 0 && baseNames.length === 1) {
            const expectedName = `UI${baseNames[0]}`;
            if (exported.name !== expectedName) {
              context.report({
                node: exported.declaration.id,
                messageId: 'uiTypeName',
                data: { importedName: baseNames[0], expectedName },
              });
            }
            return;
          }

          const consistsOnlyOfBaseAndEmptyObjects =
            baseNames.length === 1 &&
            objectLiterals.length > 0 &&
            objectLiterals.every((literal) => literal.members.length === 0) &&
            operands.every((operand) => Boolean(getContractBaseName(operand)) || operand.type === 'TSTypeLiteral');
          if (consistsOnlyOfBaseAndEmptyObjects && /^UI(?=[A-Z0-9])/.test(exported.name)) {
            context.report({
              node: exported.declaration.id,
              messageId: 'misleadingUiPrefix',
              data: { exportName: exported.name },
            });
          }
        };

        if (isModelFile) {
          if (!basename.endsWith('.model.ts')) {
            context.report({ node: program, messageId: 'contractFilenameSuffix' });
          }
          reportFolder('model', 'modelFolder');
          const exportCount = hasTypeExportAll ? typeExports.length + 1 : typeExports.length;
          if (exportCount !== 1 || hasTypeExportAll) {
            context.report({
              node: program,
              messageId: 'exportedTypeCount',
              data: { count: hasTypeExportAll ? 'an unknown number of' : String(exportCount) },
            });
          } else {
            reportFilenameMatch(typeExports[0], '.model.ts', true);
            checkContractIntersection(typeExports[0]);
          }
        }

        if (isInterfaceFile) {
          if (!basename.endsWith('.interface.ts')) {
            context.report({ node: program, messageId: 'interfaceFilenameSuffix' });
          }
          reportFolder('interface', 'interfaceFolder');

          for (const declaration of localDeclarations.values()) {
            if (declaration.type === 'TSTypeAliasDeclaration') {
              context.report({ node: declaration, messageId: 'interfaceOnly' });
            }
          }
          for (const statement of program.body) {
            if (
              (statement.type === 'ExportAllDeclaration' && statement.exportKind === 'type') ||
              (statement.type === 'ExportNamedDeclaration' &&
                !statement.declaration &&
                (statement.exportKind === 'type' ||
                  statement.specifiers.some(
                    (specifier) => specifier.exportKind === 'type' || Boolean(statement.source),
                  )))
            ) {
              context.report({ node: statement, messageId: 'interfaceOnly' });
            }
          }
          if (runtimeStatements.length > 0) {
            context.report({ node: runtimeStatements[0], messageId: 'interfaceRuntimeDeclaration' });
          }

          const interfaceExports = typeExports.filter(
            (exported) => exported.declaration?.type === 'TSInterfaceDeclaration' && !exported.isReExport,
          );
          if (interfaceExports.length !== 1) {
            context.report({
              node: program,
              messageId: 'exportedInterfaceCount',
              data: { count: String(interfaceExports.length) },
            });
          } else {
            reportFilenameMatch(interfaceExports[0], '.interface.ts', false);
          }
        }
      },
    };
  },
});
