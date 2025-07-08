import i18nKeyNamingConvention from './rules/i18n-key-naming-convention.js';
import noHardcodedStrings from './rules/no-hardcoded-strings.js';

export const rules = {
  'i18n-key-naming-convention': i18nKeyNamingConvention,
  'no-hardcoded-strings': noHardcodedStrings,
};

export const configs = {
  recommended: {
    plugins: ['fyle-core'],
    rules: {
      'fyle-core/i18n-key-naming-convention': 'error',
      'fyle-core/no-hardcoded-strings': 'error',
    },
  },
  strict: {
    plugins: ['fyle-core'],
    rules: {
      'fyle-core/i18n-key-naming-convention': 'error',
      'fyle-core/no-hardcoded-strings': 'error',
    },
  },
};
