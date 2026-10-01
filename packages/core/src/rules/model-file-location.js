import { ESLintUtils } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';
import path from 'node:path';

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/fylein/fyle-eslint-plugin/blob/main/packages/docs/rules/model-file-location.md',
);

const RULE_NAME = 'model-file-location';

function getFilename(context) {
  return context.filename ?? context.getFilename?.() ?? '';
}

function toRelativePosixPath(filename, cwd) {
  return path.relative(cwd, filename).split(path.sep).join('/');
}

function isInModelFolder(filename, modelFolders) {
  return modelFolders.some((folder) => {
    const normalizedFolder = folder.replace(/\\/g, '/').replace(/\/$/, '');
    return (
      minimatch(filename, `${normalizedFolder}/*.ts`, { dot: true }) ||
      minimatch(filename, `${normalizedFolder}/**/*.ts`, { dot: true })
    );
  });
}

function matchesSkipFile(filename, skipFiles) {
  return skipFiles.some((pattern) => minimatch(filename, pattern, { dot: true }));
}

export default createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require TypeScript shape declarations to live in configured model files',
    },
    schema: [
      {
        type: 'object',
        properties: {
          modelFolders: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
          },
          skipFiles: {
            type: 'array',
            items: { type: 'string', minLength: 1, pattern: '\\.interface\\.ts$' },
          },
        },
        required: ['modelFolders'],
        additionalProperties: false,
      },
    ],
    messages: {
      declarationMustBeInModelFile:
        'Type and interface declarations must be in a .model.ts file under a configured model folder.',
      fileMustBeModelOrSkippedInterface:
        'Files under configured model folders must end in .model.ts unless matched by skipFiles.',
    },
  },
  defaultOptions: [{ modelFolders: [], skipFiles: [] }],
  create(context, [options]) {
    const filename = getFilename(context);
    if (!filename.endsWith('.ts') || filename.endsWith('.d.ts') || filename === '<input>') {
      return {};
    }

    const relativeFilename = toRelativePosixPath(filename, context.cwd ?? path.resolve('.'));
    const modelFolders = options?.modelFolders ?? [];
    const skipFiles = options?.skipFiles ?? [];
    const isInConfiguredModelFolder = isInModelFolder(relativeFilename, modelFolders);
    const isSkippedInterfaceFile = matchesSkipFile(relativeFilename, skipFiles);

    if (isSkippedInterfaceFile || (isInConfiguredModelFolder && filename.endsWith('.model.ts'))) {
      return {};
    }

    if (isInConfiguredModelFolder) {
      return {
        'Program:exit'(program) {
          context.report({ node: program, messageId: 'fileMustBeModelOrSkippedInterface' });
        },
      };
    }

    return {
      TSTypeAliasDeclaration(node) {
        context.report({ node, messageId: 'declarationMustBeInModelFile' });
      },
      TSInterfaceDeclaration(node) {
        context.report({ node, messageId: 'declarationMustBeInModelFile' });
      },
    };
  },
});
