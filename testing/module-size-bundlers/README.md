# AG Grid Module Size Across Bundlers

`testing/module-size` measures every module with one bundler (Vite 5, which uses Rollup). Bundlers differ in how
much unused code they can prove is safe to drop, so a change that is invisible there can add bytes for apps built with
Vite 8 (Rolldown), webpack or esbuild.

This project builds a small cross-section of apps with other bundlers: nothing registered, one community module, one
enterprise module and all enterprise modules. Every build targets `es2020`, so the numbers reflect the grid's own code
rather than a bundler's default syntax lowering.

```
npm run module-combinations
```

This writes `module-size-results-bundlers.json`. Its entries carry a `bundler` and appear as separate rows in the
Module Size Comparison report posted on every pull request, labelled `Vite 8: StatusBarModule` and so on.

To add a bundler, add an entry to `BUNDLERS` in `bundlers.ts`. To change the apps, edit `APPS` in `apps.ts`.
