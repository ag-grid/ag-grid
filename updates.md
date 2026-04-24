# Dependency Upgrade Analysis

Scanned all packages in the monorepo (2026-04-15). Internal AG Grid/AG Charts beta references are excluded since those are managed by the release process.

---

## SAFE — Patch/Minor Upgrades (low risk, can upgrade now)

These are non-breaking version bumps within the same major version:

| Package | Current | Latest | Location(s) |
|---------|---------|--------|-------------|
| `@playwright/test` | ^1.56.0 | ^1.59.1 | root, docs, testing/* |
| `playwright` | ^1.56.0 | ^1.59.1 | testing/*, docs |
| `playwright-ctrf-json-reporter` | 0.0.20–0.0.24 | 0.0.29 | docs, testing/csp |
| `@swc/helpers` | 0.5.3–0.5.15 | 0.5.21 | root, plugins, ag-shared |
| `@swc/jest` | 0.2.37 | 0.2.39 | root |
| `@swc/core` | 1.5.7 | 1.15.26 | root |
| `@swc-node/register` | 1.9.2 | 1.11.1 | root |
| `@vue/compiler-sfc` | 3.5.13 | 3.5.32 | root |
| `vue` | ^3.5.0–^3.5.13 | ^3.5.32 | vue3 wrapper, docs, testing |
| `autoprefixer` | ^10.4.20 | ^10.5.0 | root |
| `cssnano` | ^7.0.5 | ^7.1.5 | root |
| `ts-jest` | ^29.1.0 | ^29.4.9 | root, locale |
| `ts-node` | 10.9.1 | 10.9.2 | root |
| `tsx` | 4.8.2 / ^4.7.x | 4.21.0 | root, scripts, ag-shared |
| `prettier` | 3.2.5 / ^3.2.5 | 3.8.3 | root, ag-website-shared, plugins |
| `sass` | 1.79.3 / ^1.77.8 | 1.99.0 | styles, docs |
| `postcss-import` | ^16.1.0 | ^16.1.1 | root |
| `postcss-selector-parser` | ^7.1.0 | ^7.1.1 | root |
| `postcss-scss` | 4.0.4 | 4.0.9 | styles |
| `csso` | 5.0.4 | 5.0.5 | styles |
| `fs-extra` | ^11.2.0 / 11.1.1 | 11.3.4 | root, scripts |
| `patch-package` | ^8.0.0 | ^8.0.1 | root |
| `canvas` | ^3.2.1 | ^3.2.3 | ag-grid-enterprise |
| `rxjs` | ~7.8.0 | ~7.8.2 | testing/accessibility, angular-tests, module-size-angular |
| `tslib` | ^2.3.0 | ^2.8.1 | root, angular, testing |
| `karma` | ~6.4.0 | ~6.4.4 | ag-grid-angular |
| `karma-coverage` | ~2.2.0 | ~2.2.1 | ag-grid-angular |
| `karma-jasmine-html-reporter` | ~2.1.0 | ~2.2.0 | ag-grid-angular |
| `@babel/runtime` | ^7.27.1 | ^7.29.2 | ag-grid-react |
| `@babel/preset-typescript` | ^7.27.1 | ^7.28.5 | ag-grid-react |
| `babel-preset-react-app` | ^10.0.0 | ^10.1.0 | ag-grid-react |
| `@tsconfig/node20` | ^20.1.4 | ^20.1.9 | ag-grid-vue3 |
| `@tsconfig/recommended` | ^1.0.3 | ^1.0.13 | update-algolia-indices |
| `@types/node-fetch` | 2.5.10 | 2.6.13 | root |
| `@types/yargs` | ^17.0.32 | ^17.0.35 | ag-shared, subrepo scripts |
| `@types/estree` | 1.0.5 | 1.0.8 | scripts |
| `@types/node` | 18.16.9–^24.0.3 | 25.6.0 | various (see alignment note) |
| `@testing-library/dom` | ^10.4.0 | ^10.4.1 | behavioural |
| `@testing-library/jest-dom` | ^6.6.3 | ^6.9.1 | behavioural |
| `@testing-library/react` | ^16.3.0 | ^16.3.2 | behavioural |
| `@astrojs/check` | ^0.9.6 | ^0.9.8 | docs |
| `@astrojs/sitemap` | ^3.6.0 | ^3.7.2 | docs |
| `@carbon/icons-react` | ^11.33.0 | ^11.78.0 | docs |
| `@emotion/react` | ^11.11.4 | ^11.14.0 | docs |
| `@emotion/styled` | ^11.11.5 | ^11.14.1 | docs |
| `@radix-ui/react-accordion` | ^1.1.2 | ^1.2.12 | docs |
| `@radix-ui/react-dialog` | ^1.0.5 | ^1.1.15 | docs |
| `@radix-ui/react-dropdown-menu` | ^2.0.6 | ^2.1.16 | docs |
| `@radix-ui/react-select` | ^2.0.0 | ^2.2.6 | docs |
| `@tanstack/react-query` | ^5.51.1 | ^5.99.0 | docs |
| `cheerio` | ^1.0.0 | ^1.2.0 | docs, plugins |
| `dompurify` | ^3.2.6 | ^3.4.0 | docs |
| `downshift` | ^9.0.6 | ^9.3.2 | docs |
| `jotai` | ^2.8.0 | ^2.19.1 | docs |
| `prismjs` | ^1.29.0 | ^1.30.0 | docs |
| `react-hook-form` | ^7.62.0 | ^7.72.1 | docs |
| `react-instantsearch` | ^7.22.1 | ^7.29.0 | docs |
| `react-shadow` | ^20.4.0 | ^20.6.0 | docs |
| `decimal.js` | ^10.4.3 | ^10.6.0 | testing/vue3-tests |
| `@mobileaction/action-kit` | ^1.31.3 | ^1.58.16 | testing/vue3-tests |
| `@analogjs/vite-plugin-angular` | ^2.3.0 | ^2.4.7 | testing/manual/template |
| `terser` | ^5.36.0 | ^5.46.1 | testing/module-size |
| `typescript-eslint` | ^8.0.1 | ^8.58.2 | testing/module-size |
| `@microlink/react-json-view` | ^1.26.1 | ^1.31.18 | docs |
| `jest-serial-runner` | ^1.2.1 | ^1.2.2 | locale |
| `js-yaml` | ^4.1.0 | ^4.1.1 | root |
| `bent` | ^7.2.0 | ^7.3.12 | root |
| `@vue/tsconfig` | ^0.5.1 | ^0.9.1 | ag-grid-vue3 |

**Note on `@types/node`:** versions vary widely across packages (16.x, 18.x, 20.x, 24.x). Aligning these to a consistent version is safe but should match the minimum supported Node.js version.

---

## MODERATE RISK — Major Upgrades (test thoroughly)

These cross major version boundaries but are generally well-documented migrations:

| Package | Current | Latest | Risk Notes |
|---------|---------|--------|------------|
| **Nx ecosystem** (`nx`, `@nx/devkit`, `@nx/*`) | 17.2.6–20.3.1 | 22.6.5 | Major upgrade. Plugins use 17.x, root uses 20.x. Should align all to same version. Migration guide available. |
| **TypeScript** | ~5.4.5–~5.6.3 | ~6.0.2 | Major. Needs thorough testing of type-checking across all packages. |
| **ESLint** | ^9.2.0 | ^10.2.0 | Major. Flat config was already adopted in v9, so v10 migration should be smoother. |
| `@eslint/js` | ^9.2.0–^9.9.0 | ^10.0.1 | Align with ESLint major. |
| `eslint-config-prettier` | ^9.1.0 | ^10.1.8 | Major, aligns with ESLint 10. |
| `eslint-plugin-import-x` | 0.5.1 | 4.16.2 | Several majors behind, likely API changes. |
| `eslint-plugin-react-hooks` | 5.1.0 | 7.0.1 | Major, likely new rule defaults. |
| `eslint-plugin-sonarjs` | 3.0.5 | 4.0.2 | Major. |
| `eslint-plugin-unicorn` | 61.0.2 | 64.0.0 | Major, may add new recommended rules. |
| `@typescript-eslint/*` | 5.51.0–7.18.0 | 8.58.2 | Major. Locale module uses very old v5; root uses v7. Align to v8. |
| `typescript-eslint` | ^7.9.0 | ^8.58.2 | Major, same family as above. |
| **Stylelint** | 14.9.1 / ^16.10.0 | 17.8.0 | Major. Styles module is on v14, root on v16. |
| `stylelint-config-standard` | ^36.0.1 | ^40.0.0 | Major, aligns with stylelint 17. |
| `stylelint-csstree-validator` | 2.0.0 | 4.0.0 | Major. |
| `stylelint-scss` | 4.3.0 | 7.0.0 | Major. |
| `css-tree` | 2.1.0 | 3.2.1 | Major. |
| `glob` | 7.1.6 / 8.0.3 / ^11.1.0 | 13.0.6 | Major. Versions scattered across packages. API changes between majors. |
| `esbuild` | ^0.19.2 | ^0.28.0 | Pre-1.0 so any bump can break. Test build output. |
| `esbuild-plugin-umd-wrapper` | ^2.0.0 | ^3.0.0 | Major. |
| `knip` | 5.62.0 | 6.4.1 | Major. Config format may change. |
| `dependency-cruiser` | ^13.1.5 | ^17.3.10 | Several majors. Check config compat. |
| `postcss-rtlcss` | ^5.3.1 | ^6.0.0 | Major. |
| `replace-in-file` | 4.3.1 | 8.4.0 | Several majors. API may have changed. |
| `rimraf` | 3.0.2 | 6.1.3 | Major. v4+ is ESM-only. |
| `@floating-ui/react` | ^0.26.11 | ^0.27.19 | Pre-1.0 so minor = breaking. |
| `@nanostores/persistent` | ^0.9.1 | ^1.3.3 | Major. |
| `@nanostores/react` | ^0.7.1 | ^1.1.0 | Major. |
| `nanostores` | ^0.9.5 | ^1.2.0 | Major. |
| `lucide-react` | ^0.343.0 | ^1.8.0 | Major (0.x to 1.x). Import paths may change. |
| `prettier-plugin-astro` | ^0.12.3–^0.13.0 | ^0.14.1 | Pre-1.0 minor bump. |
| `@trivago/prettier-plugin-sort-imports` | ^5.2.2 | ^6.0.2 | Major. |
| `octokit` | ^4.0.2 | ^5.0.5 | Major. |
| `rulesync` | ^7.0.0 | ^8.2.0 | Major. |
| `tinypool` | ^1.0.2 | ^2.1.0 | Major. |
| `jsdom` | ^24.0.0–^24.1.0 | ^29.0.2 | Several majors. |
| `@types/jsdom` | ^21.1.7 | ^28.0.1 | Align with jsdom. |
| `vue-tsc` | ^2.0.0–^2.0.21 | ^3.2.6 | Major. |
| `npm-run-all2` | ^6.2.0 | ^8.0.4 | Major. |
| `jest-preset-angular` | ^14.0.0 | ^16.1.4 | Major. Align with Angular version. |
| `vite-plugin-mkcert` | ^1.17.8 | ^2.0.0 | Major. |
| `vite-plugin-svgr` | ^4.5.0 | ^5.2.0 | Major. |

---

## HIGH RISK — Major Framework/Toolchain Upgrades (plan carefully)

These require significant migration effort and coordinated changes:

| Package | Current | Latest | Impact |
|---------|---------|--------|--------|
| **Vite** | ~5.4.19 / ^6.0.0 | ~8.0.8 | 3 major versions behind in root. Affects build pipeline, plugins, and all vite-dependent packages. |
| **Vitest** | 2.1.9 | 4.1.4 | 2 majors. Must align with Vite version. |
| **Jest** | 29.7.0 / ^29.5.0 | 30.3.0 | Major. Affects all unit test packages. `@types/jest`, `jest-environment-jsdom`, `@jest/globals` must upgrade together. |
| **React** (dev/testing) | ~18.2.0 / ^18.3.1 | ~19.2.5 | Major. Affects docs site, behavioural tests, module-size tests. `@types/react`, `@types/react-dom` must align. |
| **Angular** | ^18.0.7–^19.0.0 | ^21.2.8 | Multiple majors. ag-grid-angular uses v18, testing uses v19/v21. Significant migration (`ng-packagr`, `zone.js`, build tools). |
| **Astro** | 5.16.6 | 6.1.6 | Major. Docs site framework. `@astrojs/markdoc`, `@astrojs/react` must upgrade together. |
| `@astrojs/markdoc` | 0.15.10 | 1.0.3 | Major (0.x to 1.x), likely tied to Astro 6. |
| `@astrojs/react` | 4.4.2 | 5.0.3 | Major, tied to Astro 6. |
| **Rollup** | ^2.74.1 | ^4.60.1 | Major (scripts only). Plugin APIs changed significantly. |
| **Lerna** | ^5.3.0 | ^9.0.7 | Several majors (scripts only). |
| `node-fetch` | 2.7.0 | 3.3.2 | Major. v3 is ESM-only — would break CJS usage. |
| `inquirer` | ^7.0.0 | ^13.4.1 | Several majors. Complete API rewrite in v9+. |
| `command-line-args` | ^5.1.1 | ^6.0.2 | Major. |
| `algoliasearch` | ^4.18.0–^4.22.1 | ^5.50.2 | Major. Client rewrite in v5. |
| `react-markdown` | 5.0.3 | 10.1.0 | 5 majors behind. Complete API changes. |
| `@tweenjs/tween.js` | ^18.6.4 | ^25.0.0 | Several majors. |
| `vue-router` | ^4.5.0 | ^5.0.4 | Major. Vue Router 5 has new APIs. |
| `globals` | ^15.2.0–^15.9.0 | ^17.5.0 | Major. |
| `commander` | ^12.0.0 | ^14.0.3 | Major. |
| `yargs` | ^17.7.2 | ^18.0.0 | Major. |
| `@vitejs/plugin-vue` | ^5.0.5–^5.2.0 | ^6.0.6 | Major, tied to Vite version. |
| `@vitejs/plugin-vue-jsx` | ^4.0.0 | ^5.1.5 | Major. |
| `@vitejs/plugin-react` | ^4.3.1–^4.4.0 | ^6.0.1 | Major, tied to Vite version. |
| `vite-plugin-vue-devtools` | ^7.3.1 | ^8.1.1 | Major. |
| `zone.js` | ~0.15.0–~0.15.1 | ~0.16.1 | Tied to Angular version. |
| `ng-packagr` | ^18.0.0 | ^21.2.2 | Tied to Angular version. |
| `esprima-next` | ^5.8.4 | ^6.0.3 | Major. |
| `node-html-parser` | ^6.1.5 | ^7.1.0 | Major. |
| `web-streams-polyfill` | ^3.3.2 | ^4.2.0 | Major. ESM-only in v4. |
| `blob-polyfill` | ^7.0.20220408 | ^9.0.20240710 | Major. |

---

## DO NOT UPGRADE

| Package | Reason |
|---------|--------|
| `node-fetch` 2.x to 3.x | v3 is ESM-only. Breaks CJS imports. Stick with v2 or switch to native `fetch`. |
| `rimraf` 3.x to 6.x | v4+ is ESM-only. Would need CJS-to-ESM migration. |
| `npm-run-all` 4.1.5 | Unmaintained. If upgrading, switch to `npm-run-all2` instead. |
| `react` / `react-dom` in ag-grid-react devDeps | Currently ^16.9.0 for backwards compatibility testing. Intentionally old. |
| `prop-types` in ag-grid-react | Supporting React 16+ requires it. Leave as-is. |
| Internal `ag-grid-*` / `ag-charts-*` beta refs | Managed by the release pipeline. |

---

## Recommended Upgrade Order

1. **Immediate** (safe, no migration): All items in the SAFE table above.
2. **Short-term** (moderate effort): Nx 20 to 22 alignment (including plugins), ESLint 9 to 10 + related plugins, stylelint alignment, `glob` version alignment, `knip` 5 to 6.
3. **Medium-term** (coordinate across packages): Jest 29 to 30, TypeScript 5 to 6, Vite/Vitest alignment.
4. **Planned migrations** (significant effort, do one at a time): Angular 18 to 21, Astro 5 to 6, React 18 to 19 in docs/testing, Rollup 2 to 4 in scripts.

---

## Version Inconsistencies to Align

Even without upgrading, these should be unified across the monorepo:

- **`@types/node`**: 16.x, 18.x, 20.x, 24.x — pick one consistent version
- **`glob`**: 7.x, 8.x, 11.x — align to one version
- **`@nx/devkit`**: 17.2.6, 18.3.5, 20.3.1 — align all plugins to root's version
- **`typescript`**: ~5.4.5 and ~5.6.x — align across all packages
- **`@typescript-eslint/*`**: v5, v7, v8 — align to latest supported
