import i18nKeyNamingConvention from './rules/i18n-key-naming-convention.js';
import noHardcodedStrings from './rules/no-hardcoded-strings.js';

const rules = {
  'i18n-key-naming-convention': i18nKeyNamingConvention,
  'no-hardcoded-strings': noHardcodedStrings,
};

const configs = {
  recommended: {
    rules: {
      '@fyle/i18n-key-naming-convention': 'error',
      '@fyle/no-hardcoded-strings': 'error',
    },
  },
  strict: {
    rules: {
      '@fyle/i18n-key-naming-convention': 'error',
      '@fyle/no-hardcoded-strings': 'error',
    },
  },
};

export { rules, configs };
export default { rules, configs };
