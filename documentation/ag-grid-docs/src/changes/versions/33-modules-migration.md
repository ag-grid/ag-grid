The pre-v33 "modules" packages have been removed. Every `@ag-grid-community/*` and `@ag-grid-enterprise/*` package (feature modules **and** the framework wrappers) is replaced by the single tree-shakable `ag-grid-community` / `ag-grid-enterprise` packages. The one exception is `@ag-grid-community/locale`, which is unchanged.

## Recommended: run the codemod

The codemod rewrites every import path and registers the new modules so behaviour matches v32 (for example, if you imported `ExcelExportModule` it also adds `CsvExportModule`).

```bash
npx @ag-grid-devtools/cli@latest migrate --from=$FROM_VERSION --to=33.0
```

Replace `$FROM_VERSION` with your current version. Update `package.json` first (below), then run the codemod.

## Update package.json

Remove every scoped `@ag-grid-community/*` and `@ag-grid-enterprise/*` dependency (keep `@ag-grid-community/locale`) and add the unified packages plus your framework wrapper.

### React

```diff
"dependencies": {
-    "@ag-grid-community/react": "^32.3.0",
-    "@ag-grid-community/client-side-row-model": "^32.3.0",
-    "@ag-grid-enterprise/row-grouping": "^32.3.0",
+    "ag-grid-react": "33.0.0",
+    "ag-grid-community": "33.0.0",
+    "ag-grid-enterprise": "33.0.0"
}
```

Import the wrapper from `ag-grid-react` instead of `@ag-grid-community/react`.

### Angular

```diff
"dependencies": {
-    "@ag-grid-community/angular": "^32.3.0",
-    "@ag-grid-community/client-side-row-model": "^32.3.0",
-    "@ag-grid-enterprise/row-grouping": "^32.3.0",
+    "ag-grid-angular": "33.0.0",
+    "ag-grid-community": "33.0.0",
+    "ag-grid-enterprise": "33.0.0"
}
```

Import the module/component from `ag-grid-angular` instead of `@ag-grid-community/angular`.

### Vue 3

```diff
"dependencies": {
-    "@ag-grid-community/vue3": "^32.3.0",
-    "@ag-grid-community/client-side-row-model": "^32.3.0",
-    "@ag-grid-enterprise/row-grouping": "^32.3.0",
+    "ag-grid-vue3": "33.0.0",
+    "ag-grid-community": "33.0.0",
+    "ag-grid-enterprise": "33.0.0"
}
```

Import the component from `ag-grid-vue3` instead of `@ag-grid-community/vue3`.

### JavaScript / TypeScript (no framework)

```diff
"dependencies": {
-    "@ag-grid-community/client-side-row-model": "^32.3.0",
-    "@ag-grid-enterprise/row-grouping": "^32.3.0",
+    "ag-grid-community": "33.0.0",
+    "ag-grid-enterprise": "33.0.0"
}
```

The UMD bundle auto-registers all modules, so no registration changes are needed there.

## After migrating

- Import all runtime values (grid API, modules, `ModuleRegistry`, `provideGlobalGridOptions`) from `ag-grid-community` / `ag-grid-enterprise`.
- Some modules no longer transitively include others (for example `ExcelExportModule` no longer includes `CsvExportModule`, and `RowGroupingModule` is split into `RowGroupingModule`, `TreeDataModule`, `PivotModule`, `RowGroupingPanelModule` and `GroupFilterModule`). Register the specific modules for the features you use — the codemod does this automatically.
- v33 defaults to the new Theming API. To keep v32 CSS-file themes, call `provideGlobalGridOptions({ theme: "legacy" })` before creating any grid.
