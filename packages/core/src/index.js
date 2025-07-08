import i18nKeyNamingConvention from './rules/i18n-key-naming-convention';

export const rules = {
  'i18n-key-naming-convention': i18nKeyNamingConvention,
};

export const configs = {
  recommended: {
    plugins: ['fyle-angular'],
    rules: {
      'fyle-angular/i18n-key-naming-convention': 'error',
    },
  },
  strict: {
    plugins: ['fyle-angular'],
    rules: {
      'fyle-angular/i18n-key-naming-convention': 'error',
    },
  },
}; 