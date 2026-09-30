import modelFileExportConvention from './rules/model-file-export-convention.js';
import noTypeDeclarationsInArtifacts from './rules/no-type-declarations-in-artifacts.js';
import i18nKeyNamingConvention from './rules/i18n-key-naming-convention.js';
import noAngularCurrencyPipe from './rules/no-angular-currency-pipe.js';
import noDatepipeTransformFormatArg from './rules/no-datepipe-transform-format-arg.js';
import noInlineDateFormat from './rules/no-inline-date-format.js';
import noHardcodedStrings from './rules/no-hardcoded-strings.js';
import noDateCurrencyMutation from './rules/no-date-currency-mutation.js';
import noMarkForCheckOutsideControlValueAccessor from './rules/no-mark-for-check-outside-control-value-accessor.js';
import noNgOnChangesInSignalBasedComponent from './rules/no-ng-on-changes-in-signal-based-component.js';
import noCheckedLifecycleHooksInOnPushComponent from './rules/no-checked-lifecycle-hooks-in-onpush-component.js';

const rules = {
  'model-file-export-convention': modelFileExportConvention,
  'no-type-declarations-in-artifacts': noTypeDeclarationsInArtifacts,
  'i18n-key-naming-convention': i18nKeyNamingConvention,
  'no-angular-currency-pipe': noAngularCurrencyPipe,
  'no-datepipe-transform-format-arg': noDatepipeTransformFormatArg,
  'no-inline-date-format': noInlineDateFormat,
  'no-hardcoded-strings': noHardcodedStrings,
  'no-date-currency-mutation': noDateCurrencyMutation,
  'no-mark-for-check-outside-control-value-accessor': noMarkForCheckOutsideControlValueAccessor,
  'no-ng-on-changes-in-signal-based-component': noNgOnChangesInSignalBasedComponent,
  'no-checked-lifecycle-hooks-in-onpush-component': noCheckedLifecycleHooksInOnPushComponent,
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
      '@fyle/model-file-export-convention': 'error',
      '@fyle/no-type-declarations-in-artifacts': 'error',
      '@fyle/i18n-key-naming-convention': 'error',
      '@fyle/no-hardcoded-strings': 'error',
    },
  },
};

export { rules, configs };
export default { rules, configs };
