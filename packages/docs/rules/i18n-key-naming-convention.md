# i18n-key-naming-convention ESLint Rule

Validate that every i18n key used with Transloco follows a predictable, context-aware format.

---

## 1 Key structure

| File type                                         | Required prefix               | Exactly **n** parts                       |
| ------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| Component (`*.component.ts` / `*.component.html`) | `componentName.`              | **2** (e.g. `signIn.errorMessage`)        |
| Service (`*.service.ts`)                          | `services.<serviceName>.`     | **3** (e.g. `services.auth.errorMessage`) |
| Pipe (`*.pipe.ts`)                                | `pipes.<pipeName>.`           | **3**                                     |
| Directive (`*.directive.ts`)                      | `directives.<directiveName>.` | **3**                                     |

_`componentName`, `serviceName`, … are derived automatically from the filename._

### Empty segments

Keys containing empty segments (two dots in a row or a trailing dot) are invalid and raise **notEnoughParts**.

---

## 2 Error catalogue

| Message ID       | Trigger                                               | Example key                                   | Example fix                                                   |
| ---------------- | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `mismatchedKey`  | Key prefix does **not** match file context            | `auth.errorMessage` in `sign-in.component.ts` | `signIn.errorMessage`                                         |
| `tooManyParts`   | More than the allowed depth                           | `signIn.footer.button.text` (4 parts)         | `signIn.footer`                                               |
| `notEnoughParts` | Fewer than the required depth **or** empty segment(s) | `signin.` / `services.userStatus`             | `signIn.warningAccountLockSoon` / `services.userStatus.error` |

Error messages include an example value to illustrate the correct pattern.

---

## 3 Good vs Bad

### Component (2-part key)

```ts
// ✅ GOOD – sign-in.component.ts
this.translate.instant('signIn.errorInvalidPassword');

// ❌ BAD – wrong prefix
this.translate.instant('auth.errorInvalidPassword');

// ❌ BAD – too many parts
this.translate.instant('signIn.error.invalidPassword');
```

### Service (3-part key)

```ts
// ✅ GOOD – auth.service.ts
this.translate.instant('services.auth.errorInvalidGrant');

// ❌ BAD – too few parts
this.translate.instant('services.auth');

// ❌ BAD – empty segment
this.translate.instant('services.auth.');
```

### Template usage

```html
<!-- ✅ GOOD -->
{{ 'signIn.warningAccountLockSoon' | transloco }}

<!-- ❌ BAD – trailing dot -->
{{ 'signIn.warningAccountLockSoon.' | transloco }}
```

### With ignored prefixes

```js
// eslint.config.js
export default [
  {
    rules: {
      'fyle-core/i18n-key-naming-convention': [
        'error',
        {
          ignoredPrefixes: ['common.', 'shared.', 'global.'],
        },
      ],
    },
  },
];
```

```ts
// ✅ GOOD – ignored prefix
this.translate.instant('common.button.save');

// ✅ GOOD – normal validation
this.translate.instant('signIn.errorInvalidPassword');

// ❌ BAD – not ignored, wrong prefix
this.translate.instant('auth.errorInvalidPassword');
```

### With file prefix stripping

```js
// eslint.config.js
export default [
  {
    rules: {
      'fyle-core/i18n-key-naming-convention': [
        'error',
        {
          stripFilePrefixes: ['feature-', 'ui-', 'admin-'],
        },
      ],
    },
  },
];
```

```ts
// ✅ GOOD – feature-user-profile.component.ts → userProfile.title
this.translate.instant('userProfile.title');

// ✅ GOOD – ui-dashboard.component.ts → dashboard.header
this.translate.instant('dashboard.header');

// ✅ GOOD – admin-user-settings.page.ts → userSettings.config
this.translate.instant('userSettings.config');
```

### With both options

```js
// eslint.config.js
export default [
  {
    rules: {
      'fyle-core/i18n-key-naming-convention': [
        'error',
        {
          ignoredPrefixes: ['common.', 'shared.', 'global.'],
          stripFilePrefixes: ['feature-', 'ui-', 'admin-'],
        },
      ],
    },
  },
];
```

---

## 4 Configuration

```js
// eslint.config.js
import fyleCore from 'fyle-eslint-plugin';

export default [
  {
    plugins: {
      'fyle-core': fyleCore,
    },
    rules: {
      'fyle-core/i18n-key-naming-convention': 'error',
      // or with options:
      'fyle-core/i18n-key-naming-convention': [
        'error',
        {
          ignoredPrefixes: ['common.', 'shared.', 'global.'],
        },
      ],
    },
  },
];
```

### Options

| Option              | Type       | Default               | Description                                                                                      |
| ------------------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `ignoredPrefixes`   | `string[]` | `[]`                  | Array of key prefixes to ignore. Keys starting with any of these prefixes will not be validated. |
| `stripFilePrefixes` | `string[]` | `['feature-', 'ui-']` | Array of file name prefixes to strip before generating translation key prefixes.                 |

---

## 5 Why enforce this?

- Simplifies locating translations for a feature/component.
- Prevents key collisions and facilitates removal of unused keys.
- Keeps translation JSON files shallow and predictable.

---

## 6 Running the unit tests

This rule ships with a Jest test-suite located alongside the implementation.

```bash
# from the package directory
npm install   # first-time only – brings in Jest & helpers

# run the tests for this rule only
npm test

# or run specific test file
npx jest src/tests/i18n-key-naming-convention.test.js
```

Under the hood the tests use `@typescript-eslint/rule-tester`, so they execute the rule against a set of valid/invalid code samples and assert the expected linting outcome.

If you modify the rule, always run the tests to ensure you haven't introduced regressions.
