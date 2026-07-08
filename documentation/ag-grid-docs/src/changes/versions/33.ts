import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

// ---
// title: "Upgrading to AG Grid 33.0"
// description: "See what's new in AG Grid, view a full list of changes and migrate your $framework Data Grid to v33 with our Codemods."
// migrationVersion: "33.0.0"
// ---
//
// Reductions in bundle size, updated theming, column header content customisation.
//
// ## What's New
//
// AG Grid {% migrationVersion() %} significantly reduces bundle size via modularization and enhances functionality, theming and accessibility as described in the [release post](https://blog.ag-grid.com/whats-new-in-ag-grid-33/). These major improvements require certain breaking changes as listed below.
//
// Please use the [codemods](#codemods) to start your migration, then review the changes to [modules](#changes-to-modules--packages) and [themes](#theming).
//
// {% note %}
// AG Grid {% migrationVersion() %} is aimed at addressing long-standing community feedback around bundle size and theming. Naturally, given the significance of these changes, AG Grid {% migrationVersion() %} has introduced more breaking changes than usual. We recognise that not all users can immediately benefit from these improvements.
//
// Therefore we are launching Long-Term Support (LTS) versions of AG Grid (v32-lts) and AG Charts (v10-lts), ensuring you can continue receiving bug fixes without upgrading to the latest major release. We will proactively identify necessary fixes, but please feel free to report any issues you encounter against our LTS versions.
// {% /note %}
//
// {% documentationArchiveSection version=migrationVersionPatch() /%}
//
//
//
// ## Codemods
//
// Follow these steps to upgrade your project's AG Grid version to {% migrationVersion() %}:
//
// 1. Locate your project's package.json and note the version of AG Grid that you are currently using
// 1. Update any AG Grid dependencies listed in the package.json as outline above to version {% migrationVersion() %}
// 1. Open a terminal and navigate to your project's root folder
// 1. Run the `migrate` command of version `33.0` of the AG Grid codemod runner, where `$FROM_VERSION` refers to your project's existing AG Grid version:
//
//     ```bash
//      npx @ag-grid-devtools/cli@latest migrate --from=$FROM_VERSION --to=33.0
//     ```
//
//     This will update your project's source files to prepare for the new release.
//
//     By default the Codemod runner will locate all source files within the current directory. For projects with more specific requirements, pass a list of input files to the `migrate` command, or specify the `--help` argument to see more fine-grained usage instructions.
//
// {% note %}
// The Codemod runner will check the state of your project to ensure that you don't lose any work. If you would rather see a diff of the changes instead of applying them, pass the `--dry-run` argument.
// {% /note %}
//
// The codemod only transforms source files that make use of deprecated features, so if you aren't currently making use of any of those APIs your source code will be unaffected by the codemod.
//
// See the [Codemods](./codemods/) documentation for more details.
//
//
// ## Breaking Changes
//
// The full list of breaking changes across all features for version {% migrationVersion() %}.
//
// {% expandingSection headerText="Breaking Changes" %}
// AG Grid version {% migrationVersion() %} includes the following breaking changes:
//
// ### Changes To Modules / Packages
//
// Changes outline above in the [Changes to Modules / Packages section](./upgrading-to-ag-grid-33/#changes-to-modules--packages).
//
// ### Integrated Charts / Sparklines
//
// Changes outline above in the [Integrated Charts / Sparklines section](./upgrading-to-ag-grid-33/#integrated-charts--sparklines)
//
//
// ## Behaviour Changes
//
// There are no behaviour changes in AG Grid version {% migrationVersion() %}
//
// ## Removal of Deprecated APIs
//
// The following APIs have been deprecated since at least v31 and have now been removed.
//
// {% expandingSection headerText="Removed Deprecated APIs" %}
//
//
//
// {% changelogSection version=$migrationVersion /%}

export const v33 = {
    dependencyChanges: [
        // {% if isFramework("angular") %}
        //
        // ### Angular Minimum Version
        //
        // The minimum Angular version supported is now Angular 17. Please upgrade to Angular 17 to use this AG Grid version.
        // {% /if %}
        //
        // {% if isFramework("vue") %}
        //
        // ### Vue Minimum Version
        //
        // The minimum Vue version supported is now Vue 3.5. Please upgrade to Vue 3.5 or later to use this AG Grid version.
        // {% /if %}
        //
        {
            dependency: 'angular',
            // Source floor `^17.0.9` (packages/ag-grid-angular/package.json @ v33.0.0; was
            // `^16.2.12` @ v32.3.0), commit 411535e41bc. More specific than the page's "17".
            minVersion: '17.0.9',
            // Angular 16 reached end of life before the v33.0.0 release (Angular support policy:
            // 6 months active + 12 months LTS). Grounded in Angular's schedule, not the commit.
            reason: 'Angular 16 reached end of life and is no longer supported by the Angular team.',
        },
        {
            dependency: 'vue',
            // Source floor `^3.5.0` (packages/ag-grid-vue3/package.json dependencies + peerDependencies
            // @ v33.0.0; was `^3.0.0` @ v32.3.0). Arrived with the Vue 3 wrapper rewrite (bd194dd1854).
            minVersion: '3.5.0',
            // null: no groundable reason. Not an EOL (Vue 3.x is one major line); neither commit nor
            // page states a driver beyond the wrapper adopting Vue 3.5 APIs.
            reason: null,
        },
    ],
    deprecations: {
        //
        // ## Theming
        //
        // The new and improved Theming API is now the default theming method for AG Grid. If you wish to migrate to the Theming Api see the [Theming API Migration Guide](./theming-migration/). However, this is not a requirement to upgrade to version {% migrationVersion() %}.
        //
        // ### Continue with Legacy Themes
        //
        // If you want to upgrade to version {% migrationVersion() %} without immediately adopting the Theming API, you can opt back in to the v32 style of themes by setting the grid option `theme: "legacy"`. You can then continue to use legacy themes.
        //
        // If you have multiple grids you can mark them all as using legacy themes via a [Global Grid Option](./grid-interface/#global-grid-options). Enterprise users can define this alongside their licence key.
        //
        // ```js
        // import { provideGlobalGridOptions } from 'ag-grid-community';
        //
        // // Mark all grids as using legacy themes
        // provideGlobalGridOptions({ theme: "legacy" });
        // ```
        // SOFT DEPRECATION. v33 makes the Theming API (`theme` grid option) the default; at v33.0.0
        // gridOptions.theme is `Theme | 'legacy'` with @default themeQuartz and NO @deprecated marker
        // (commit dd8538ec95c). Legacy CSS/Sass file-based themes still work but are opt-in via
        // theme: "legacy", so isSoft: true per the soft-deprecation rule.
        legacyThemes: {
            oldApi: 'legacy CSS/Sass file-based themes',
            oldDescription:
                'Themes imported as CSS files (e.g. `ag-grid.css` plus `ag-theme-quartz.css`) or built with the Sass API, and applied by setting a class name such as `ag-theme-quartz` on the grid container element',
            newApi: 'the Theming API (the `theme` grid option)',
            newDescription:
                'Themes are imported as JavaScript objects (e.g. `themeQuartz`) and passed to the `theme` grid option; the grid inserts the required CSS itself, loading only the styles for features in use',
            isSoft: true,
            // REVIEW: the app is affected precisely because it did NOT set `theme` (a changed default),
            // so option detection is impossible. These are the legacy-theme markers a styled app must
            // carry (built-in theme class names, the structural stylesheet, or the styles import path).
            // Residual false-negative risk: a structural-only app that renames ag-grid.css and applies
            // no theme class matches none of these - accepted over null (which flags every app).
            detectWords: [
                'ag-theme-quartz',
                'ag-theme-alpine',
                'ag-theme-balham',
                'ag-theme-material',
                'ag-grid.css',
                'ag-grid-community/styles',
            ],
            mitigation: (await import('./v33-theming-migration.md?raw')).default,
        },
        // ## Deprecations
        //
        // {% expandingSection headerText="Deprecations" %}
        //
        // ### Modules
        //
        // - `ModuleRegistry.register(module)` - deprecated, use `ModuleRegistry.registerModules([module])` instead.
        // - `MenuModule` - deprecated, use `ColumnMenuModule` for the Column Menu and/or `ContextMenuModule` for the Context Menu instead.
        // - `RangeSelectionModule` - deprecated, use `CellSelectionModule` instead.
        //
        // ### Column Object
        //
        // Real deprecation: @deprecated v33 on ModuleRegistry.register (moduleRegistry.ts:114). Still works.
        moduleRegistryRegister: {
            oldApi: '`ModuleRegistry.register(module)`',
            newApi: '`ModuleRegistry.registerModules([module])`',
            // Any affected app references ModuleRegistry; registerModules users match too (unaffected) -
            // accepted for this low-urgency deprecation.
            detectWords: ['ModuleRegistry'],
            mitigation: 'Replace `ModuleRegistry.register(module)` with `ModuleRegistry.registerModules([module])`.',
        },
        // REVIEW: page lists MenuModule under "Deprecations", but source has NO @deprecated marker
        // (menuModule.ts carries only @feature) and the module still works fully (dependsOn:
        // [ColumnMenuModule, ContextMenuModule]). Recorded isSoft: true per the soft-deprecation rule.
        menuModule: {
            oldApi: '`MenuModule`',
            newApi: '`ColumnMenuModule` for the Column Menu and/or `ContextMenuModule` for the Context Menu',
            detectWords: ['MenuModule'],
            mitigation:
                'Replace `MenuModule` with `ColumnMenuModule` (Column Menu), `ContextMenuModule` (Context Menu), or both.',
            isSoft: true,
        },
        // Real deprecation: @deprecated v33 on RangeSelectionModule (rangeSelectionModule.ts:32). Still
        // works (dependsOn: [CellSelectionModule]).
        rangeSelectionModule: {
            oldApi: '`RangeSelectionModule`',
            newApi: '`CellSelectionModule`',
            // Module-name deprecation only; the enableRangeSelection grid option is a separate concern.
            detectWords: ['RangeSelectionModule'],
            mitigation: 'Replace `RangeSelectionModule` with `CellSelectionModule`.',
        },
        // - `Column.isHovered()` - deprecated, use `api.isColumnHovered(column)` instead.
        //
        // Column.isHovered() @deprecated v33 in iColumn.ts:186 (commit 39a2eff09a2, 2024-12-04).
        columnIsHovered: {
            oldApi: '`Column.isHovered()`',
            newApi: '`api.isColumnHovered(column)`',
            // Sole detector. RowNode also has isHovered(), so this over-matches row-hover checks -
            // an acceptable false positive.
            detectWords: ['isHovered'],
            mitigation: 'Call `api.isColumnHovered(column)` instead of `column.isHovered()`.',
        },
        // ### Grid API
        //
        // - `deselectAllFiltered` - deprecated, use `deselectAll('filtered')` instead.
        // - `deselectAllOnCurrentPage` - deprecated, use `deselectAll('currentPage')` instead.
        // - `selectAllFiltered` - deprecated, use `selectAll('filtered')` instead.
        // - `selectAllOnCurrentPage` - deprecated, use `selectAll('currentPage')` instead.
        //
        // Family of 4 Grid API methods, identical advice; all @deprecated v33 in gridApi.ts.
        selectAllModeMethods: {
            oldApi: 'the `selectAllFiltered()`, `deselectAllFiltered()`, `selectAllOnCurrentPage()` and `deselectAllOnCurrentPage()` Grid API methods',
            newApi: "`selectAll('filtered')`, `deselectAll('filtered')`, `selectAll('currentPage')` and `deselectAll('currentPage')`",
            // Each identifier is the sole detector for an app calling only that method; finite family
            // enumerated in full. Names unchanged pre-v33, so no old-version gap.
            detectWords: [
                'selectAllFiltered',
                'deselectAllFiltered',
                'selectAllOnCurrentPage',
                'deselectAllOnCurrentPage',
            ],
            mitigation:
                "Replace `selectAllFiltered(source)` with `selectAll('filtered', source)`, `deselectAllFiltered(source)` with `deselectAll('filtered', source)`, `selectAllOnCurrentPage(source)` with `selectAll('currentPage', source)`, and `deselectAllOnCurrentPage(source)` with `deselectAll('currentPage', source)`.",
        },
        // ### Grid Options
        //
        // - `cellRendererParams.checkbox` - deprecated, use `rowSelection.checkboxLocation = "autoGroupColumn"` instead.
        // - `gridOptions.sortingOrder` - deprecated, use `defaultColDef.sortingOrder` instead.
        // - `gridOptions.unSortIcon` - deprecated, use `defaultColDef.unSortIcon` instead.
        // - `groupRemoveLowestSingleChildren` - deprecated, use `groupHideParentOfSingleChild: 'leafGroupsOnly'` instead.
        // - `groupRemoveSingleChildren` - deprecated, use `groupHideParentOfSingleChild: true` instead.
        // - `suppressMakeColumnVisibleAfterUnGroup` - deprecated, use `suppressGroupChangesColumnVisibility: "suppressShowOnUngroup"` instead.
        // - `suppressPropertyNamesCheck` - deprecated without replacement. Previously used for adding user properties in `gridOptions` and `columnDefs`. Now, use the `context` property in both for storing arbitrary metadata.
        // - `suppressRowGroupHidesColumns` - deprecated, use `suppressGroupChangesColumnVisibility: "suppressHideOnGroup"` instead.
        // - When setting both `suppressMakeColumnVisibleAfterUnGroup` and `suppressRowGroupHidesColumns` to `true`, use `suppressGroupChangesColumnVisibility: true` instead.
        //
        // The old prop lives on colDef.cellRendererParams for agGroupCellRenderer, not on GridOptions.
        // Verified against IGroupCellRendererParams.checkbox (groupCellRenderer.ts:37).
        groupCellRendererCheckbox: {
            oldApi: '`checkbox` in `cellRendererParams` for the Group Cell Renderer (`IGroupCellRendererParams`)',
            newApi: '`rowSelection.checkboxes` with `rowSelection.checkboxLocation: "autoGroupColumn"`',
            detectWords: ['checkbox'],
            // FIXME: upgrading-to-ag-grid-33/index.mdoc:629 gives only
            // `rowSelection.checkboxLocation = "autoGroupColumn"`, omitting `rowSelection.checkboxes`
            // (which is what turns the checkbox on at all). Source JSDoc (groupCellRenderer.ts:37) names both.
            mitigation:
                'Set `rowSelection.checkboxes: true` (or a callback) to render selection checkboxes and `rowSelection.checkboxLocation: "autoGroupColumn"` to place them in the group column, instead of setting `checkbox` in the Group Cell Renderer params.',
        },
        sortingOrder: {
            oldApi: '`sortingOrder` grid option',
            newApi: '`sortingOrder` on `defaultColDef`',
            detectWords: ['sortingOrder'],
            mitigation:
                'Move `sortingOrder` from `gridOptions` to `defaultColDef` so it applies as the default across columns.',
        },
        unSortIcon: {
            oldApi: '`unSortIcon` grid option',
            newApi: '`unSortIcon` on `defaultColDef`',
            detectWords: ['unSortIcon'],
            mitigation: 'Move `unSortIcon` from `gridOptions` to `defaultColDef`.',
        },
        // Both deprecated options map to the single `groupHideParentOfSingleChild`; one record.
        groupRemoveSingleChildren: {
            oldApi: '`groupRemoveSingleChildren` and `groupRemoveLowestSingleChildren` grid options',
            newApi: '`groupHideParentOfSingleChild`',
            detectWords: ['groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren'],
            mitigation:
                'Replace `groupRemoveSingleChildren: true` with `groupHideParentOfSingleChild: true`, and `groupRemoveLowestSingleChildren: true` with `groupHideParentOfSingleChild: "leafGroupsOnly"`.',
        },
        // Both deprecated options fold into the tri-state `suppressGroupChangesColumnVisibility`;
        // the combined-both case maps to `true`.
        suppressGroupChangesColumnVisibility: {
            oldApi: '`suppressMakeColumnVisibleAfterUnGroup` and `suppressRowGroupHidesColumns` grid options',
            newApi: '`suppressGroupChangesColumnVisibility`',
            detectWords: ['suppressMakeColumnVisibleAfterUnGroup', 'suppressRowGroupHidesColumns'],
            mitigation:
                'Replace `suppressMakeColumnVisibleAfterUnGroup: true` with `suppressGroupChangesColumnVisibility: "suppressShowOnUngroup"`, and `suppressRowGroupHidesColumns: true` with `suppressGroupChangesColumnVisibility: "suppressHideOnGroup"`. If both were set to `true`, use `suppressGroupChangesColumnVisibility: true`.',
        },
        suppressPropertyNamesCheck: {
            oldApi: '`suppressPropertyNamesCheck` grid option',
            // No replacement: the check catches typos, and arbitrary user data now belongs in `context`.
            newApi: null,
            oldDescription:
                'Disabled the grid warning about unrecognised properties in `gridOptions` and `columnDefs`, which was used to allow storing arbitrary user data on those objects.',
            detectWords: ['suppressPropertyNamesCheck'],
            mitigation:
                'Store arbitrary metadata in the `context` property (available on both `gridOptions` and `columnDefs`) instead of adding unrecognised properties, and remove `suppressPropertyNamesCheck`.',
        },
        // ### Row Node
        //
        // - `childIndex` - deprecated, use `rowNode.parent?.childrenAfterSort?.findIndex(r =&gt; r === rowNode)` instead.
        // - `firstChild` - deprecated, use `rowNode.parent?.childrenAfterSort?.[0] === rowNode` instead.
        // - `lastChild` - deprecated, use `!!rowNode.parent?.childrenAfterSort && (rowNode.parent.childrenAfterSort[rowNode.parent.childrenAfterSort.length - 1] === rowNode)` instead.
        //
        // ### Row Node Events
        //
        // - `childIndexChanged` - deprecated, use the global `modelUpdated` event to determine when row children have changed.
        // - `firstChildChanged` - deprecated, use the global `modelUpdated` event to determine when row children have changed.
        // - `lastChildChanged` - deprecated, use the global `modelUpdated` event to determine when row children have changed.
        //
        // Verified against iRowNode.ts@v33.0.0: `@deprecated v33` added in the v33 window (absent at
        // v32.3.0). Mitigation expressions taken verbatim from the source JSDoc; the page's `=&gt;`
        // (index.mdoc:641) is HTML escaping, corrected to `=>` here.
        rowNodeChildIndex: {
            oldApi: '`RowNode.childIndex`',
            newApi: '`rowNode.parent?.childrenAfterSort?.findIndex(r => r === rowNode)`',
            // Sole detector; readable only by spelling `.childIndex`. Also matches the childIndexChanged
            // event string - an acceptable false positive.
            detectWords: ['childIndex'],
            mitigation:
                "Compute the index from the parent's sorted children: `rowNode.parent?.childrenAfterSort?.findIndex(r => r === rowNode)`.",
        },
        rowNodeFirstChild: {
            oldApi: '`RowNode.firstChild`',
            newApi: '`rowNode.parent?.childrenAfterSort?.[0] === rowNode`',
            detectWords: ['firstChild'],
            mitigation:
                "Compare against the first of the parent's sorted children: `rowNode.parent?.childrenAfterSort?.[0] === rowNode`.",
        },
        rowNodeLastChild: {
            oldApi: '`RowNode.lastChild`',
            newApi: '`!!rowNode.parent?.childrenAfterSort && (rowNode.parent.childrenAfterSort[rowNode.parent.childrenAfterSort.length - 1] === rowNode)`',
            detectWords: ['lastChild'],
            mitigation:
                "Compare against the last of the parent's sorted children: `!!rowNode.parent?.childrenAfterSort && (rowNode.parent.childrenAfterSort[rowNode.parent.childrenAfterSort.length - 1] === rowNode)`.",
        },
        // All three RowNode events carry `@deprecated v33` (iRowNode.ts:70-75); identical advice -> one record.
        rowNodeChildEvents: {
            oldApi: '`childIndexChanged`, `firstChildChanged` and `lastChildChanged` RowNode events',
            newApi: 'the global `modelUpdated` event',
            detectWords: ['childIndexChanged', 'firstChildChanged', 'lastChildChanged'],
            mitigation:
                "Listen to the grid-level `modelUpdated` event instead and compute whether a row's child index, first-child or last-child status changed (see the `childIndex`, `firstChild` and `lastChild` replacements).",
        },
        // ### Theming Custom Icons
        //
        // - `smallDown` - deprecated, use:
        //     - `advancedFilterBuilderSelect` for Advanced Filter Builder dropdown.
        //     - `selectOpen` for Select cell editor and dropdowns (e.g., Integrated Charts menu).
        //     - `richSelectOpen` for Rich Select cell editor.
        // - `smallLeft` - deprecated, use:
        //     - `panelDelimiterRtl` for Row Group Panel / Pivot Panel.
        //     - `subMenuOpenRtl` for sub-menus.
        // - `smallRight` - deprecated, use:
        //     - `panelDelimiter` for Row Group Panel / Pivot Panel.
        //     - `subMenuOpen` for sub-menus.
        //
        // {% /expandingSection %}
        // Three directional icon keys deprecated together (identical advice). Verified against runtime
        // warnings 262/263/264 (errorText.ts) and `// deprecated v33` on the IconName union (icon.ts).
        smallDirectionIcons: {
            oldApi: 'the `smallDown`, `smallLeft` and `smallRight` icon keys',
            newApi: 'the specific per-use-case keys - `smallDown` -> `advancedFilterBuilderSelectOpen`, `selectOpen`, `richSelectOpen`; `smallLeft` -> `panelDelimiterRtl`, `subMenuOpenRtl`; `smallRight` -> `panelDelimiter`, `subMenuOpen`',
            // Same detection basis as the styleChange: an app customises these only by spelling the key
            // in `icons` / `colDef.icons` / theme `iconOverrides`. Names pre-date v33, so v32 apps match.
            detectWords: ['smallDown', 'smallLeft', 'smallRight'],
            // FIXME: runtime warning 262 (errorText.ts) and the page (lines 478, 654) name a
            // non-existent `advancedFilterBuilderSelect`; the real key is `advancedFilterBuilderSelectOpen`
            // (icon.ts:95). The linked file uses the correct key.
            mitigation: (await import('./v33-custom-icon-scoping.md?raw')).default,
        },
    },
    newRequirements: [
        //
        // ## Migrating from Packages
        //
        // npm packages: `ag-grid-community` / `ag-grid-enterprise` / `ag-grid-charts-enterprise`
        //
        // If you are currently using AG Grid packages, which did not support tree shaking, then you can match the existing behaviour by registering either `AllCommunityModule` or `AllEnterpriseModule` via the ModuleRegistry before any grid is created.
        //
        // {% warning %}
        // Using the `AllCommunityModule` / `AllEnterpriseModule` will prevent tree shaking. In v33 these bundles also included the `ValidationModule`, which should only be used in your development build; from v36 onwards it is excluded. In order to reduce the bundle size, use the [Module Selector](./modules/) to only register the modules you require instead of all modules.
        // {% /warning %}
        //
        // Most users will also want to set `{ theme: "legacy" }` if not already using the new Theming Api. See [Theming](#theming) for more details.
        //
        // **AG Grid Community**
        //
        // ```js
        // import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
        //
        // // Register all community features
        // ModuleRegistry.registerModules([AllCommunityModule]);
        //
        // // Mark all grids as using legacy themes
        // provideGlobalGridOptions({ theme: "legacy"});
        // ```
        //
        // **AG Grid Enterprise**
        //
        // ```js
        // import { ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
        // import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
        //
        // LicenseManager.setLicenseKey('your License Key');
        //
        // // Register all enterprise features
        // ModuleRegistry.registerModules([AllEnterpriseModule]);
        //
        // // Mark all grids as using legacy themes
        // provideGlobalGridOptions({ theme: "legacy"});
        // ```
        // Packages-approach users: the bare ag-grid-community/ag-grid-enterprise packages used to
        // auto-register every feature. In v33 they do not, so grids fail until AllCommunityModule /
        // AllEnterpriseModule are registered.
        {
            title: 'The `ag-grid-community` and `ag-grid-enterprise` packages no longer auto-register their feature modules',
            description:
                'Under the pre-v33 "packages" approach, importing `ag-grid-community` or `ag-grid-enterprise` registered all features automatically. In v33 features must be registered explicitly, matching the previously modules-only requirement.',
            // No positive code marker exists for the packages approach - its defining trait is the ABSENCE
            // of any ModuleRegistry.registerModules call. The bare package specifiers are the only net.
            detectWords: ['ag-grid-community', 'ag-grid-enterprise'],
            // REVIEW: the theme:"legacy" pointer overlaps the theming-default deprecation record; kept here
            // because Packages migrators need it as part of "match existing behaviour". Dedupe if desired.
            mitigation:
                'To keep the previous non-tree-shaken behaviour, register all modules before creating any grid: `ModuleRegistry.registerModules([AllCommunityModule])` (community) or `ModuleRegistry.registerModules([AllEnterpriseModule])` (enterprise), imported from `ag-grid-community` / `ag-grid-enterprise`. To reduce bundle size instead, use the [Module Selector](./modules/) to register only the modules you use. If you were not already using the Theming API, also call `provideGlobalGridOptions({ theme: "legacy" })` to keep the v32 CSS-file themes.',
        },
        // Modules users only: several modules no longer transitively include other feature modules.
        {
            title: 'Feature modules no longer transitively include other feature modules',
            description:
                'To minimise bundle size each module now includes only its own feature: `ColumnsToolPanelModule` no longer pulls in row grouping; `ExcelExportModule` no longer pulls in `CsvExportModule`; and `RowGroupingModule` (which in v32 also provided pivoting, tree data, the row-group/pivot panel and the group filter) is split into `RowGroupingModule` (row grouping only), `TreeDataModule`, `PivotModule`, `RowGroupingPanelModule` and `GroupFilterModule`.',
            // The v32 module names an affected app must have registered. New v33 names can't appear in a v32
            // codebase. Packages/AllModule users are unaffected.
            detectWords: ['ColumnsToolPanelModule', 'ExcelExportModule', 'RowGroupingModule'],
            mitigation:
                'Register the now-separate modules for the features you use: add `RowGroupingModule` if you relied on `ColumnsToolPanelModule` for grouping; add `CsvExportModule` alongside `ExcelExportModule` for CSV export; and add `TreeDataModule`, `PivotModule`, `RowGroupingPanelModule` and/or `GroupFilterModule` for those features previously provided by `RowGroupingModule`. The v33 codemod adds these automatically to match your v32 module dependencies.',
        },
        //
        // ## Integrated Charts / Sparklines
        //
        // AG Grid Enterprise no longer includes AG Charts as part of its distribution to avoid bloating the bundle size. If you are using either Integrated Charts or Sparklines, you must now explicitly include either the community / enterprise {% link isExternal=true href="https://www.ag-grid.com/charts/" %}AG Charts{% /link %} library as a dependency.
        //
        // ### Integrated Charts / Sparklines Migration Steps
        //
        // For an application using Integrated Charts / Sparklines via the `AllEnterpriseModule` bundle with the Enterprise version of AG Charts first add `ag-charts-enterprise` to your package.json dependencies.
        //
        // ```diff
        // "dependencies": {
        //     "ag-grid-enterprise": "{% migrationVersionPatch() %}",
        // +   "ag-charts-enterprise": "~11.0.0",
        // }
        // ```
        //
        // Then pass the `AgChartsEnterpriseModule` to the `AllEnterpriseModule` to activate the charting features.
        //
        // ```js
        // import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
        // import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
        //
        // ModuleRegistry.registerModules([
        //     AllEnterpriseModule.with(AgChartsEnterpriseModule)
        // ]);
        // LicenseManager.setLicenseKey('your License Key');
        // ```
        //
        // If you are using AG Grid Modules instead of `AllCommunityModule` or `AllEnterpriseModule`, then both the `IntegratedChartsModule` and `SparklinesModule` also require the AG Charts module to be registered when they are used.
        //
        // ```js
        // import { IntegratedChartsModule, SparklinesModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
        // import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
        //
        // ModuleRegistry.registerModules([
        //     IntegratedChartsModule.with(AgChartsEnterpriseModule),
        //     SparklinesModule.with(AgChartsEnterpriseModule)
        // ]);
        // LicenseManager.setLicenseKey('your License Key');
        // ```
        {
            // Verified: enterprise no longer ships AG Charts (optionalDependencies in v33.0.0
            // ag-grid-enterprise/package.json). AG Charts major = 11.
            title: 'AG Grid Enterprise no longer bundles AG Charts for Integrated Charts and Sparklines',
            description:
                'Integrated Charts and Sparklines previously worked out of the box because AG Grid Enterprise shipped AG Charts in its distribution. To reduce bundle size, AG Grid Enterprise no longer includes AG Charts, so applications using either feature must add an AG Charts package (`ag-charts-community` or `ag-charts-enterprise`, major version 11) as an explicit dependency and pass its module to the grid.',
            // IntegratedChartsModule / SparklinesModule: v33 registration (SparklinesModule also matches v32).
            // GridChartsModule: v32 integrated-charts module (deprecated v33). enableCharts / agSparklineCellRenderer:
            // sole detectors for UMD/config apps. ag-charts-*/ag-grid-charts-enterprise: the packages an app depends on.
            detectWords: [
                'IntegratedChartsModule',
                'SparklinesModule',
                'GridChartsModule',
                'enableCharts',
                'agSparklineCellRenderer',
                'ag-charts-enterprise',
                'ag-charts-community',
                'ag-grid-charts-enterprise',
            ],
            mitigation: (await import('./v33-integrated-charts-sparklines.md?raw')).default,
        },
    ],
    removalsWithoutDeprecation: [
        // ## Changes to Modules / Packages
        //
        // Version {% migrationVersion() %} introduces a major change in how feature modules are set up to reduce the bundle size. Previously there were two separate ways to include AG Grid in your project - via AG Grid Modules or AG Grid Packages. These have now been unified to simplify configuration whilst also introducing more fine-grained modules to reduce bundle size.
        //
        // To take full advantage of the new modules, use the [Module Selector](./modules/) to work out which modules you require for the AG Grid features you need.
        //
        // {% if isFramework("javascript") %}
        // If you are using the UMD bundle, you do not need to make any changes as all modules are automatically registered. Otherwise, see the steps below.
        // {% /if %}
        //
        // ## Migrating from Modules
        //
        // npm packages: `@ag-grid-community/**` / `@ag-grid-enterprise/**`
        //
        // In previous versions separate npm packages were required to achieve tree shaking of grid features to reduce the bundle size. The improvements made in version {% migrationVersion() %} remove the need for separate npm packages to achieve tree shaking.
        //
        // As a result all feature modules have been collapsed into either `ag-grid-community` or `ag-grid-enterprise` and all `@ag-grid-community/**` and `@ag-grid-enterprise/**` npm packages are removed as of version 33.0.
        //
        // The changes can be summarised as follows:
        //
        // {% if isFramework("react") %}
        //
        // - `@ag-grid-community/react` is replaced with `ag-grid-react`
        // - All individual `@ag-grid-community/**` packages are replaced by a single tree-shakable package `ag-grid-community`
        //     - Exception - the `@ag-grid-community/locale` package remains unchanged.
        // - All individual `@ag-grid-enterprise/**` packages are replaced by a single tree-shakable package `ag-grid-enterprise`.
        //
        // {% /if %}
        // {% if isFramework("angular") %}
        //
        // - `@ag-grid-community/angular` is replaced with `ag-grid-angular`
        // - All individual `@ag-grid-community/**` packages are replaced by a single tree-shakable package `ag-grid-community`
        //     - Exception - the `@ag-grid-community/locale` package remains unchanged.
        // - All individual `@ag-grid-enterprise/**` packages are replaced by a single tree-shakable package `ag-grid-enterprise`.
        //
        // {% /if %}
        // {% if isFramework("javascript") %}
        //
        // - All individual `@ag-grid-community/**` packages are replaced by a single tree-shakable package `ag-grid-community`
        //     - Exception - the `@ag-grid-community/locale` package remains unchanged.
        // - All individual `@ag-grid-enterprise/**` packages are replaced by a single tree-shakable package `ag-grid-enterprise`.
        //
        // {% /if %}
        // {% if isFramework("vue") %}
        //
        // - `@ag-grid-community/vue3` is replaced with `ag-grid-vue3`
        // - All individual `@ag-grid-community/**` packages are replaced by a single tree-shakable package `ag-grid-community`
        //     - Exception - the `@ag-grid-community/locale` package remains unchanged.
        // - All individual `@ag-grid-enterprise/**` packages are replaced by a single tree-shakable package `ag-grid-enterprise`.
        //
        // {% /if %}
        //
        // Here is an example of a typical package.json diff for the migration:
        //
        // **AG Grid Community**
        //
        // {% if isFramework("react") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/react": "^32.3.0",
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-community/csv-export": "^32.3.0",
        // +    "ag-grid-react": "{% migrationVersionPatch() %}",
        // +    "ag-grid-community": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("angular") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/angular": "^32.3.0",
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-community/csv-export": "^32.3.0",
        // +    "ag-grid-angular": "{% migrationVersionPatch() %}",
        // +    "ag-grid-community": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("javascript") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-community/csv-export": "^32.3.0",
        // +    "ag-grid-community": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("vue") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/vue3": "^32.3.0",
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-community/csv-export": "^32.3.0",
        // +    "ag-grid-vue3": "{% migrationVersionPatch() %}",
        // +    "ag-grid-community": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        //
        // **AG Grid Enterprise**
        //
        // {% if isFramework("react") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/react": "^32.3.0",
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-enterprise/master-detail": "^32.3.0",
        // -    "@ag-grid-enterprise/row-grouping": "^32.3.0",
        // +    "ag-grid-react": "{% migrationVersionPatch() %}",
        // +    "ag-grid-enterprise": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("angular") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/angular": "^32.3.0",
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-enterprise/master-detail": "^32.3.0",
        // -    "@ag-grid-enterprise/row-grouping": "^32.3.0",
        // +    "ag-grid-angular": "{% migrationVersionPatch() %}",
        // +    "ag-grid-enterprise": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("javascript") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/client-side-row-model": "^32.3.0",
        // -    "@ag-grid-enterprise/master-detail": "^32.3.0",
        // -    "@ag-grid-enterprise/row-grouping": "^32.3.0",
        // +    "ag-grid-enterprise": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        // {% if isFramework("vue") %}
        //
        // ```diff
        // "dependencies": {
        // -    "@ag-grid-community/vue3": "^32.3.0",
        // -    "@ag-grid-enterprise/clipboard": "^32.3.0",
        // -    "@ag-grid-enterprise/master-detail": "^32.3.0",
        // -    "@ag-grid-enterprise/row-grouping": "^32.3.0",
        // +    "ag-grid-vue3": "{% migrationVersionPatch() %}",
        // +    "ag-grid-enterprise": "{% migrationVersionPatch() %}",
        // }
        // ```
        //
        // {% /if %}
        //
        // The codemod for version {% migrationVersion() %} will automatically update all your import paths and module registration to ensure backwards compatibility.
        //
        // {% note %}
        // After updating your package.json file, we recommend using the Codmod to assist your migration as it will update all your applications import paths and module registration to ensure backwards compatibility.
        //
        // `npx @ag-grid-devtools/cli@latest migrate --from=$FROM_VERSION --to=33.0`
        // {% /note %}
        //
        // ### Changes to Existing Modules
        //
        // The following changes have been made to the existing modules to ensure that each module only includes the minimal code required for that feature:
        //
        // - `ColumnsToolPanelModule` - no longer imports the `RowGroupingModule`
        // - `ExcelExportModule` - no longer imports the `CsvExportModule`
        // - `MenuModule` - split into `ColumnMenuModule` for the Column Menu, and `ContextMenuModule` for the Context Menu
        // - `RangeSelectionModule` - replaced with `CellSelectionModule`
        // - `RowGroupingModule` - split into several modules
        //     - `RowGroupingModule` - Row Grouping only
        //     - `TreeDataModule` - Tree Data
        //     - `PivotModule` - Pivoting
        //     - `RowGroupingPanelModule` - Row Grouping Panel / Pivot Panel
        //     - `GroupFilterModule` - Group Filter
        // - `GridChartsModule` - replaced with `IntegratedChartsModule` and requires AG Charts module to be registered
        // - `SparklinesModule` - requires AG Charts module to be registered
        //
        // {% note %}
        // The codemod will include the new modules to match the existing behaviour of v32 module dependencies. For example, if you were importing the ExcelExportModule in v32 then the codemod will automatically include the CsvExportModule in v33.
        // {% /note %}
        //
        // The single unavoidable migration for every pre-v33 "modules" user. All scoped
        // @ag-grid-community/* and @ag-grid-enterprise/* packages (feature modules AND framework
        // wrappers) were removed in v33 and collapsed into the two tree-shakable packages.
        {
            oldApi: 'the scoped `@ag-grid-community/*` and `@ag-grid-enterprise/*` npm packages, including the `@ag-grid-community/react`, `@ag-grid-community/angular` and `@ag-grid-community/vue3` framework wrappers',
            oldDescription:
                'These were the separate feature packages required for tree shaking under the pre-v33 "modules" approach. Exception: `@ag-grid-community/locale` is unchanged and still published under its scoped name.',
            newApi: 'the unified `ag-grid-community` and `ag-grid-enterprise` packages, with framework wrappers renamed to `ag-grid-react`, `ag-grid-angular` and `ag-grid-vue3`',
            // The @ prefix scopes this to the scoped specifiers, so it does NOT fire on the bare unified
            // packages (already-migrated apps). @ag-grid-community/locale matches too - an accepted false
            // positive (it is unchanged). Identical across every version that had these specifiers.
            detectWords: ['@ag-grid-community/', '@ag-grid-enterprise/'],
            mitigation: (await import('./v33-modules-migration.md?raw')).default,
        },
        // REVIEW: page lists "GridChartsModule replaced with IntegratedChartsModule" as a module change
        // and the module carries an @deprecated v33 tag, but source
        // (packages/ag-grid-enterprise/src/charts/integratedChartsModule.ts:88) gives it
        // validate: () => ({ isValid: false, ... }), so registering it no longer activates charts.
        // That makes it a functional removal, not a working deprecation - hence this section.
        {
            oldApi: '`GridChartsModule`',
            newApi: '`IntegratedChartsModule.with(agChartsModule)`',
            // Only modules users reference the module by name (Packages users enable via enableCharts,
            // covered by the charts-dependency newRequirements record).
            detectWords: ['GridChartsModule'],
            mitigation:
                'Replace `GridChartsModule` with `IntegratedChartsModule.with(<AgChartsModule>)`, passing `AgChartsCommunityModule` (from `ag-charts-community`) or `AgChartsEnterpriseModule` (from `ag-charts-enterprise`). Add the corresponding AG Charts package to your dependencies. Example: `ModuleRegistry.registerModules([IntegratedChartsModule.with(AgChartsEnterpriseModule)])`.',
        },
        // ### Stricter Types
        //
        // The following properties are now strictly typed to only their valid values instead of `string`:
        //
        // - gridOptions - `chartMenuItems` / `getMainMenuItems` / `getContextMenuItems`
        // - columnDefs - `mainMenuItems` / `contextMenuItems`
        //
        // ### Column Menu
        // REVIEW: classified as removalsWithoutDeprecation (a type "signature change" per the schema
        // JSDoc), not behaviourChanges - a compile-time-only tightening with NO runtime change.
        // Precedent: 35.ts puts cellDataType-in-columnTypes (also a pure compile-time break) here.
        // Commit 36d7f5dc3ed (AG-11763, #9209) narrowed `string` to the DefaultMenuItem /
        // DefaultChartMenuItem unions.
        {
            oldApi: 'arbitrary `string` menu item names in `gridOptions.chartMenuItems`, `gridOptions.getMainMenuItems`, `gridOptions.getContextMenuItems`, `colDef.mainMenuItems` and `colDef.contextMenuItems`',
            oldDescription:
                'These properties (and the return values of the `getMainMenuItems`/`getContextMenuItems` callbacks) were typed to accept any `string` for a built-in menu item name.',
            newApi: 'the documented menu item name unions - `DefaultMenuItem` for `getMainMenuItems`, `getContextMenuItems`, `colDef.mainMenuItems` and `colDef.contextMenuItems`, and `DefaultChartMenuItem` for `chartMenuItems`',
            // Each property is a sole detector; all five identifiers are stable across v32/v33. Apps
            // passing only valid built-in names are unaffected - an acceptable false positive.
            detectWords: [
                'chartMenuItems',
                'getMainMenuItems',
                'getContextMenuItems',
                'mainMenuItems',
                'contextMenuItems',
            ],
            mitigation:
                'This is a compile-time change only - the runtime behaviour of menu items is unchanged, so applications passing valid built-in menu item names (e.g. `pinLeft`, `copy`, `export`, or `chartDownload` for `chartMenuItems`) are unaffected. If TypeScript now reports an error, replace any invalid strings with the documented menu item names: `DefaultMenuItem` values for `getMainMenuItems`, `getContextMenuItems`, `colDef.mainMenuItems` and `colDef.contextMenuItems`, or `DefaultChartMenuItem` values for `chartMenuItems`. If you deliberately supply a value typed as `string` (for example a name computed at runtime), cast it to the relevant menu item type to satisfy the compiler.',
        },
        // ### Integrated Charts
        //
        // `navigator` is removed from `ChartFormatPanelGroup`. Navigator setting is now part of the Integrated Charts Advanced Settings.
        //
        // Grid record: ChartFormatPanelGroup is a grid-owned type
        // (packages/ag-grid-community/src/interfaces/iChartOptions.ts). 'navigator' union member
        // removed in v33.0.0 by commit 5e97f5aa1e1 (AG-12029, PR #9167).
        // REVIEW: removalsWithoutDeprecation because 'navigator' never carried a JSDoc @deprecated. It
        // was FUNCTIONALLY deprecated from v31.2.0 (setting it emitted a runtime warning and rendered
        // no panel), so runtime behaviour is unchanged v32.3->v33; the v33 break is purely the TS union
        // narrowing. If a v31.2 deprecation record is later backfilled, re-link as
        // removalsAfterDeprecation: [v31_2.deprecations.chartNavigatorGroup].
        {
            oldApi: "`'navigator'` in `ChartFormatPanelGroup` (the type of `chartToolPanelsDef.formatPanel.groups` entries)",
            newApi: null,
            oldDescription:
                'A customize-panel group that showed navigator settings. From v31.2 it was ignored at runtime and the navigator moved to the chart Advanced Settings',
            // Sole necessary marker: the only route to set these groups is chartToolPanelsDef
            // (-> .formatPanel.groups -> [{ type: 'navigator' }]). Subsumes 'formatPanel',
            // 'ChartFormatPanelGroup' and the leaky value 'navigator' (which matches window.navigator).
            detectWords: ['chartToolPanelsDef'],
            mitigation:
                "Remove `'navigator'` from `chartToolPanelsDef.formatPanel.groups`. The chart navigator's settings are available in the chart's Advanced Settings panel (requires AG Charts Enterprise).",
        },
        // ### Sparklines
        //
        // - `type: 'column'` - removed, use `type: 'bar'` and `direction: 'vertical'` instead.
        // - `tooltip.renderer` no longer returns tooltip font colour and opacity - use CSS instead.
        // - `tooltip.xOffset / tooltip.yOffset` - removed, use CSS instead.
        // - `tooltip.container` - removed, AG Charts now handles this.
        // - `marker.formatter` - removed, use `marker.itemStyler` instead.
        // - `sparklineOptions.[line, area, bar, column]` to apply styles - removed, use `sparklineOptions` properties instead.
        // - `highlightStyle` now follows the AG Charts options - for more customisation options use an `itemStyler` instead.
        // - `sparklineOptions.valueAxisDomain` - removed, use `sparklineOptions.min/max` instead.
        // - `sparklineOptions.paddingInner / sparklineOptions.paddingOuter` - removed, use `sparklineOptions.axis.paddingInner / sparklineOptions.axis.paddingOuter` instead.
        // - `sparklineOptions.container` - removed.
        // - `sparklineOptions.label.placement` - updated to use [AG Charts Label Placement](https://www.ag-grid.com/charts/javascript/bar-series/#reference-AgBarSeriesOptions-label-placement). Instead of `insideBase`, `center`, `insideEnd` and `outsideEnd`, please use `inside-center`, `inside-start`, `inside-end` or `outside-end`
        //
        // v33 replaced the bespoke grid sparklines (enterprise-modules/sparklines) with AG Charts-powered
        // sparklines (commit 699ad002310, AG-13280, PR #9188). The renderer name agSparklineCellRenderer
        // and SparklinesModule are unchanged; the SHAPE of `sparklineOptions` changed from the grid's own
        // SparklineOptions to AG Charts' AgSparklineOptions, with no deprecation period. Grouped as one
        // record (single audience, single migration story - the Column-API-many-methods pattern).
        {
            oldApi: "the bespoke `sparklineOptions` shape for `agSparklineCellRenderer` (`type: 'column'`, `tooltip.container`/`xOffset`/`yOffset`, tooltip renderer colour/opacity fields, `marker.formatter`, per-type `line`/`area`/`bar`/`column` style objects, `highlightStyle`, `valueAxisDomain`, `paddingInner`/`paddingOuter`)",
            newApi: 'the AG Charts `AgSparklineOptions` shape, imported from `ag-charts-community` or `ag-charts-enterprise`',
            // agSparklineCellRenderer is the load-bearing net: every sparkline app sets
            // cellRenderer: 'agSparklineCellRenderer' as a string, catching apps regardless of
            // module-registration style. sparklineOptions kept as the marker for option-specific apps.
            // REVIEW: agSparklineCellRenderer alone arguably suffices; sparklineOptions kept defensively.
            detectWords: ['agSparklineCellRenderer', 'sparklineOptions'],
            mitigation: (await import('./v33-sparklines-migration.md?raw')).default,
        },
        //
        // Floating filters provided via the `colDef.filter` values `text`, `number`, `date`, `set`, `multi`, and `group` no longer work. Use the values `agTextColumnFilter`, `agNumberColumnFilter`, `agDateColumnFilter`, `agSetColumnFilter`, `agMultiColumnFilter`, and `agGroupColumnFilter` instead.
        //
        // REVIEW: page frames this under "Floating Filters"; source confirms the framing. The v33
        // removal (commit f31f90cf391, AG-12847) touched ONLY floatingFilterMapper.ts; the general
        // short-name -> ag*ColumnFilter translation for the MAIN filter was already removed in v28
        // (611c4be9b2e), so by v32.3.0 these aliases were tolerated only by the floating-filter mapper.
        // removalsWithoutDeprecation because the deprecation predates the v26 backfill floor (aliases
        // deprecated in v15.0).
        {
            oldApi: 'the `colDef.filter` floating-filter aliases `text`, `number`, `date`, `set`, `multi` and `group`',
            newApi: '`agTextColumnFilter`, `agNumberColumnFilter`, `agDateColumnFilter`, `agSetColumnFilter`, `agMultiColumnFilter` and `agGroupColumnFilter`',
            // Widen-before-null: the alias VALUES ('text','date',...) are too generic to search. The one
            // identifier an affected app must spell is the `filter` colDef property carrying the alias.
            // 'filter' matches any app using column filtering - heavy false positives, but sound.
            detectWords: 'filter',
            mitigation:
                'Set `colDef.filter` to the full component name instead of the short alias: use `agTextColumnFilter`, `agNumberColumnFilter`, `agDateColumnFilter`, `agSetColumnFilter`, `agMultiColumnFilter` or `agGroupColumnFilter`.',
        },
        // ### Interfaces
        //
        // - `RowDragEvent` interface: `vDirection` property is now typed as `'up' | 'down' | null`.
        // - `IFloatingFilterParams`: `suppressFilterButton` - removed, please use `colDef.suppressFloatingFilterButton` instead.
        // - `ITextFilterParams`: `textCustomComparator` - removed, please use `textMatcher` instead.
        // - `IFloatingFilter`: `onParamsUpdated` - removed, please use `refresh` instead.
        // - `IFilterParams`: `valueGetter` - removed, please use `getValue` instead.
        // - `IDate`: `onParamsUpdated` - removed, please use `refresh` instead.
        // - `IGroupCellRendererParams`: `footerValueGetter` - removed, please use `totalValueGetter` instead.
        // - `FlashCellsParams`:
        //     - `flashDelay` - removed, please use `flashDuration` instead.
        //     - `fadeDelay` - removed, please use `fadeDuration` instead.
        // - `ToolPanelColumnCompParams`: `ToolPanelColumnCompParams` - removed, please use `IToolPanelColumnCompParams` instead.
        // - `ExcelAlignment`: Legacy property `verticalText` - removed.
        // - `ExcelFont`: Legacy property `charSet` - removed.
        // - `ExcelStyle`: Legacy property `name` - removed.
        //
        // {% /expandingSection %}
        //
        // textCustomComparator was reworked to textMatcher in v27.0.0 (commit dc446145de7); by v32.3.0 it
        // survived only as a runtime shim read via (params as any).textCustomComparator with a warning,
        // removed in v33 (075eaadef6b). No v27 version file to reference, so recorded here.
        {
            oldApi: '`textCustomComparator` in `ITextFilterParams`',
            newApi: '`textMatcher`',
            detectWords: ['textCustomComparator'],
            mitigation:
                'Replace `textCustomComparator: (filterOption, value, filterText) => ...` with a `textMatcher` callback in the text filter params. `textMatcher` receives a single object argument `{ filterOption, value, filterText }` and returns a boolean.',
        },
        // All three @deprecated "Legacy property" in v25.2.0 (commit 14dd045d2e1) - predates the backfill
        // range - and removed in v33 (075eaadef6b). All were inert: ExcelStyle.name was always overwritten
        // internally, and verticalText/charSet were never read during export.
        {
            oldApi: 'the legacy `name` (`ExcelStyle`), `verticalText` (`ExcelAlignment`) and `charSet` (`ExcelFont`) properties',
            newApi: null,
            newDescription:
                'These were legacy properties with no effect: `ExcelStyle.name` was always overwritten internally, and `verticalText` and `charSet` were never read during export.',
            // ExcelStyle/ExcelAlignment/ExcelFont are reachable only through the `excelStyles` grid option,
            // so any affected app has an excelStyles option. 'name' is too generic to detect.
            detectWords: ['excelStyles'],
            mitigation:
                'Remove `name` from any `ExcelStyle`, `verticalText` from any `ExcelAlignment`, and `charSet` from any `ExcelFont` in your `excelStyles`. They had no effect, so deleting them changes nothing in the exported file.',
        },
        //
        // Server-side Row Model full store (activated by `suppressServerSideInfiniteScroll` property) is now removed.
        //
        // Please use the standard server-side row model functionality as documented.
        //
        // Per-level equivalent on ServerSideGroupLevelParams (returned by getServerSideGroupLevelParams),
        // removed in v33 (commit 1f123e0342f). Verified at v32.3.0: NO @deprecated tag on this property,
        // so this is a removal without deprecation - even though the sibling grid option WAS deprecated
        // (v31.1, see removalsAfterDeprecation).
        {
            oldApi: '`suppressInfiniteScroll` in `ServerSideGroupLevelParams` (returned by the `getServerSideGroupLevelParams` callback)',
            newApi: null,
            // An app opts into the per-level full store only by spelling this property; getServerSideGroupLevelParams
            // itself is redundant (an app must spell suppressInfiniteScroll to be affected).
            detectWords: ['suppressInfiniteScroll'],
            mitigation:
                'Remove the `suppressInfiniteScroll` property from the object returned by `getServerSideGroupLevelParams`; the level then uses the standard infinite-scroll store. To load that level in a single request as the full store did, set its `cacheBlockSize` larger than the level row count.',
        },
        // selectAll/deselectAll argument-order change is a SILENT v33 signature change with NO
        // deprecation period: v32.3.0 declares selectAll(source?); v33.0.0 declares
        // selectAll(selectAll?: SelectAllMode, source?). A v32 call selectAll('mySource') now passes
        // 'mySource' as the selection mode.
        {
            oldApi: 'the first argument of `selectAll(source)` and `deselectAll(source)` (the event source)',
            newApi: '`selectAll(selectAllMode?, source?)` / `deselectAll(selectAllMode?, source?)`, passing the event source as the second argument',
            // Both names needed: an app may call only one. Matches no-arg callers too (harmless FP).
            detectWords: ['selectAll', 'deselectAll'],
            mitigation:
                "Move the event source to the second argument, leaving the first `undefined`: change `api.selectAll('mySource')` to `api.selectAll(undefined, 'mySource')` (and likewise for `deselectAll`). The new first argument is the selection mode (`'all'` | `'filtered'` | `'currentPage'`); calls with no arguments are unaffected.",
        },
    ],
    removalsAfterDeprecation: [
        // {% if isFramework("react") %}
        //
        // ### React
        //
        // - `AgReactUiProps` removed, please use `AgGridReactProps` instead.
        // - `AgGridReactProps`:
        //     - `disableStaticMarkup` no longer used.
        //     - `legacyComponentRendering` no longer used.
        // - `AgReactComponent`:
        //     - `getReactContainerStyle` removed, apply styling directly to `ag-react-container` if needed.
        //     - `getReactContainerClasses` removed, apply styling directly to `ag-react-container` if needed.
        //     - `IHeaderGroupReactComp` removed, please use `IHeaderGroup` instead.
        //     - `IHeaderReactComp` removed, please use `IHeader` instead.
        //     - `IDateReactComp` removed, please use `IDate` instead.
        //     - `IFilterReactComp` removed, please use `IFilter` instead.
        //     - `IFloatingFilterReactComp` removed, please use `IFloatingFilter` instead.
        //     - `ICellRendererReactComp` removed, please use `ICellRenderer` instead.
        //     - `ICellEditorReactComp` removed, please use `ICellEditor` instead.
        //     - `ILoadingCellRendererReactComp` removed, no interface required.
        //     - `ILoadingOverlayReactComp` removed, please use `ILoadingOverlay` instead.
        //     - `INoRowsOverlayReactComp` removed, please use `INoRowsOverlay` instead.
        //     - `IStatusPanelReactComp` removed, please use `IStatusPanel` instead.
        //     - `IToolPanelReactComp` removed, please use `IToolPanel` instead.
        //     - `ITooltipReactComp` removed, no interface required.
        //
        // {% /if %}
        //
        // React-only removals. ALL @deprecated v31.1 in packages/ag-grid-react/src/shared/interfaces.ts;
        // removed at v33.0.0 (commit 075eaadef6b "AG-12903 v31 Deprecations Removed").
        // TODO: convert these to identity references (e.g. v31_1.deprecations.<key>) once 31.1.ts is
        // backfilled; inlined here as self-contained TransitionFacts because 31.1.ts does not exist yet.
        {
            framework: 'react',
            oldApi: '`AgReactUiProps`',
            newApi: '`AgGridReactProps`',
            detectWords: ['AgReactUiProps'],
            mitigation:
                'Replace `AgReactUiProps` with `AgGridReactProps`. It was an empty alias interface, so the swap is a pure rename.',
        },
        {
            framework: 'react',
            oldApi: '`disableStaticMarkup` and `legacyComponentRendering` on `AgGridReactProps`',
            newApi: null,
            newDescription: 'Both props had no effect from v31.1 onwards.',
            detectWords: ['disableStaticMarkup', 'legacyComponentRendering'],
            mitigation:
                'Remove `disableStaticMarkup` and `legacyComponentRendering` from your `AgGridReact` props. They had no effect from v31.1, so removing them changes nothing at runtime.',
        },
        {
            framework: 'react',
            oldApi: '`getReactContainerStyle` and `getReactContainerClasses` on `AgReactComponent`',
            newApi: null,
            newDescription: 'Style the `.ag-react-container` wrapper element directly with CSS instead.',
            detectWords: ['getReactContainerStyle', 'getReactContainerClasses'],
            mitigation:
                'Remove `getReactContainerStyle` / `getReactContainerClasses` from your custom React components and apply the equivalent styles to the `.ag-react-container` element directly via a CSS rule (or a `className`/`style` on your component root).',
        },
        {
            framework: 'react',
            oldApi: 'the React-suffixed component interfaces (`IHeaderGroupReactComp`, `IHeaderReactComp`, `IDateReactComp`, `IFilterReactComp`, `IFloatingFilterReactComp`, `ICellRendererReactComp`, `ICellEditorReactComp`, `ILoadingOverlayReactComp`, `INoRowsOverlayReactComp`, `IStatusPanelReactComp`, `IToolPanelReactComp`)',
            newApi: 'the corresponding non-suffixed interface (`IHeaderGroup`, `IHeader`, `IDate`, `IFilter`, `IFloatingFilter`, `ICellRenderer`, `ICellEditor`, `ILoadingOverlay`, `INoRowsOverlay`, `IStatusPanel`, `IToolPanel`)',
            // Each interface is a distinct type name usable alone in an annotation, so all 11 are required.
            detectWords: [
                'IHeaderGroupReactComp',
                'IHeaderReactComp',
                'IDateReactComp',
                'IFilterReactComp',
                'IFloatingFilterReactComp',
                'ICellRendererReactComp',
                'ICellEditorReactComp',
                'ILoadingOverlayReactComp',
                'INoRowsOverlayReactComp',
                'IStatusPanelReactComp',
                'IToolPanelReactComp',
            ],
            mitigation:
                'Replace each `*ReactComp` interface with its non-suffixed equivalent (drop the `ReactComp` suffix), e.g. `IFilterReactComp` becomes `IFilter`. These were alias interfaces, so it is a rename.',
        },
        {
            framework: 'react',
            oldApi: '`ILoadingCellRendererReactComp` and `ITooltipReactComp`',
            newApi: null,
            newDescription: 'No interface is required for React loading cell renderers or tooltip components.',
            detectWords: ['ILoadingCellRendererReactComp', 'ITooltipReactComp'],
            mitigation:
                'Remove `ILoadingCellRendererReactComp` / `ITooltipReactComp` from your components. No interface is required for these component types - just delete the annotation.',
        },
        // ### Grid API
        //
        // - `new Grid()` - removed, use `createGrid` instead.
        // - `api` - no longer mutated onto the provided `gridOptions` for Javascript users.
        // - First argument of `selectAll` and `deselectAll` grid API methods is now the selection mode, the event source is now the second argument. Both are optional.
        // - `getFirstDisplayedRow` - removed, use `getFirstDisplayedRowIndex` instead.
        // - `getLastDisplayedRow` - removed, use `getLastDisplayedRowIndex` instead.
        // - `getModel()` - removed, use the appropriate grid API methods instead.
        // - `getValue` - removed, use `getCellValue` instead.
        // - `showColumnMenuAfterButtonClick` - removed, use `IHeaderParams.showColumnMenu` within a header component, or `api.showColumnMenu` elsewhere.
        // - `showColumnMenuAfterMouseClick` - removed, use `IHeaderParams.showColumnMenuAfterMouseClick` within a header component, or `api.showColumnMenu` elsewhere.
        // - `autoSizeColumn(key)` - removed, please use `autoSizeColumns([colKey])` instead.
        // - `setColumnWidths(key, newWidth)` - removed, please use `{ setColumnWidths([{ key: newWidth }]) }` instead.
        // - `moveColumn(key, toIndex)` - removed, please use `moveColumns([key], toIndex)` instead.
        // - `addAggFunc(key, func)` - removed, please use `{ addAggFuncs({ key: func }) }` instead.
        // - `removeValueColumn(colKey)` - removed, please use `removeValueColumns([colKey])` instead.
        // - `addValueColumn(colKey)` - removed, please use `addValueColumns([colKey])` instead.
        // - `removeRowGroupColumn(colKey)` - removed, please use `removeRowGroupColumns([colKey])` instead.
        // - `addRowGroupColumn(colKey)` - removed, please use `addRowGroupColumns([colKey])` instead.
        // - `removePivotColumn(colKey)` - removed, please use `removePivotColumns([colKey])` instead.
        // - `addPivotColumn(colKey)` - removed, please use `addPivotColumns([colKey])` instead.
        // - `setColumnVisible(key, visible)` - removed, please use `setColumnsVisible([key], visible)` instead.
        // - `setColumnPinned(key, pinned)` - removed, please use `setColumnsPinned([key], pinned)` instead.
        // - To get/set individual filter models, use `getColumnFilterModel` or `setColumnFilterModel` instead.
        //
        // Grid API removals, deprecated in the v31.x cycle, removed v33.0.0. TODO: convert to identity
        // references (v31.deprecations.newGrid; v31_1.deprecations.getDisplayedRowSingular / .getModel /
        // .showColumnMenuLegacy / .singularColumnApi / .getFilterInstance; v31_3.deprecations.getValue)
        // once those files are backfilled; inlined here as self-contained TransitionFacts.
        {
            // Deprecated v31 (grid.ts). REVIEW: page lists `new Grid()` and "`api` no longer mutated onto
            // gridOptions" as two bullets; merged - same audience (vanilla JS) and one mitigation, since
            // `new Grid` was the only path that still mutated `api` onto gridOptions in v31+.
            oldApi: 'the `Grid` class (`new Grid(eGridDiv, gridOptions)`), and the `api` property that it mutated onto the provided `gridOptions`',
            newApi: '`createGrid(eGridDiv, gridOptions)`, using the `GridApi` it returns',
            // 'Grid' is the sole load-bearing token; case-sensitive whole-word matching does NOT match
            // createGrid, GridApi, GridOptions or AgGridReact.
            detectWords: ['Grid'],
            mitigation:
                'Replace `const grid = new Grid(eGridDiv, gridOptions)` with `const api = createGrid(eGridDiv, gridOptions)`, and use the returned `api` object wherever you previously read `gridOptions.api`. `createGrid` returns the `GridApi` directly; the grid no longer writes `api` (or `columnApi`) back onto the `gridOptions` object you pass in.',
        },
        {
            // Deprecated v31.1.
            oldApi: '`getFirstDisplayedRow` and `getLastDisplayedRow`',
            newApi: '`getFirstDisplayedRowIndex` and `getLastDisplayedRowIndex`',
            detectWords: ['getFirstDisplayedRow', 'getLastDisplayedRow'],
            mitigation:
                'Rename `api.getFirstDisplayedRow()` to `api.getFirstDisplayedRowIndex()` and `api.getLastDisplayedRow()` to `api.getLastDisplayedRowIndex()`. The return value (the row index) is unchanged.',
        },
        {
            // Deprecated v31.1.
            oldApi: '`getModel()`',
            oldDescription:
                'Returned the internal `IRowModel`, exposing the original, filtered, aggregated and displayed rows.',
            newApi: 'the appropriate row-access grid API methods',
            // 'getModel' also matches the (separate) filter-instance getModel; acceptable false positive.
            detectWords: ['getModel'],
            mitigation:
                'Replace `api.getModel()` with the specific grid API method for what you read from the row model: `api.getDisplayedRowCount()` and `api.getDisplayedRowAtIndex(index)` for displayed rows, `api.forEachNode(callback)` / `api.forEachNodeAfterFilterAndSort(callback)` to iterate nodes, and `api.getRowNode(id)` to look one up by id.',
        },
        {
            // Deprecated v31.3. Signature also changed (positional -> params object).
            oldApi: '`getValue(colKey, rowNode)`',
            newApi: '`getCellValue({ colKey, rowNode })`',
            detectWords: ['getValue'],
            mitigation:
                'Replace `api.getValue(colKey, rowNode)` with `api.getCellValue({ colKey, rowNode })`. `getCellValue` takes a single params object and can also return the formatted value via `useFormatter: true`.',
        },
        {
            // Deprecated v31.1.
            oldApi: '`showColumnMenuAfterButtonClick` and `showColumnMenuAfterMouseClick`',
            newApi: '`IHeaderParams.showColumnMenu` / `IHeaderParams.showColumnMenuAfterMouseClick` inside a header component, or `api.showColumnMenu` elsewhere',
            // showColumnMenuAfterMouseClick still exists as an IHeaderParams property in v33; a whole-word
            // match cannot tell the removed api method from the surviving param - acceptable false positive.
            detectWords: ['showColumnMenuAfterButtonClick', 'showColumnMenuAfterMouseClick'],
            mitigation:
                'Inside a custom header component, call `params.showColumnMenu(sourceElement)` or `params.showColumnMenuAfterMouseClick(mouseEvent)` from `IHeaderParams`. Elsewhere, use `api.showColumnMenu(colKey)`.',
        },
        {
            // ALL deprecated v31.1 together (singular->plural Column API tidy-up); one record, identical advice.
            // FIXME: upgrading-to-ag-grid-33/index.mdoc:547 writes `setColumnWidths(key, newWidth)` as the
            // removed method - the removed method is `setColumnWidth` (singular); `setColumnWidths` (plural)
            // is the surviving replacement. Verified against v31.1.0 (@deprecated on setColumnWidth) and v33.0.0.
            oldApi: 'the single-column Column API methods `autoSizeColumn`, `setColumnWidth`, `moveColumn`, `addAggFunc`, `removeValueColumn`, `addValueColumn`, `removeRowGroupColumn`, `addRowGroupColumn`, `removePivotColumn`, `addPivotColumn`, `setColumnVisible` and `setColumnPinned`',
            newApi: 'their plural equivalents that take an array (or, for `setColumnWidth`/`addAggFunc`, an array/object of entries)',
            // Every singular name is a distinct detector; whole-word matching means none match their own
            // plural form (e.g. autoSizeColumn does not match autoSizeColumns).
            detectWords: [
                'autoSizeColumn',
                'setColumnWidth',
                'moveColumn',
                'addAggFunc',
                'removeValueColumn',
                'addValueColumn',
                'removeRowGroupColumn',
                'addRowGroupColumn',
                'removePivotColumn',
                'addPivotColumn',
                'setColumnVisible',
                'setColumnPinned',
            ],
            mitigation:
                'Switch each single-column call to its plural form: `autoSizeColumn(key)` to `autoSizeColumns([key])`; `setColumnWidth(key, newWidth)` to `setColumnWidths([{ key, newWidth }])`; `moveColumn(key, toIndex)` to `moveColumns([key], toIndex)`; `addAggFunc(key, func)` to `addAggFuncs({ [key]: func })`; `removeValueColumn(colKey)` to `removeValueColumns([colKey])`; `addValueColumn(colKey)` to `addValueColumns([colKey])`; `removeRowGroupColumn(colKey)` to `removeRowGroupColumns([colKey])`; `addRowGroupColumn(colKey)` to `addRowGroupColumns([colKey])`; `removePivotColumn(colKey)` to `removePivotColumns([colKey])`; `addPivotColumn(colKey)` to `addPivotColumns([colKey])`; `setColumnVisible(key, visible)` to `setColumnsVisible([key], visible)`; `setColumnPinned(key, pinned)` to `setColumnsPinned([key], pinned)`.',
        },
        {
            // Deprecated v31.1. The page's "To get/set individual filter models..." bullet; removed method
            // is getFilterInstance.
            oldApi: '`getFilterInstance(key, callback)`',
            oldDescription:
                'Retrieved a column filter component, typically to call `getModel()` / `setModel()` on it for individual column filter state.',
            newApi: '`getColumnFilterModel(column)` / `setColumnFilterModel(column, model)` for the model, or `getColumnFilterInstance(column)` for the instance',
            detectWords: ['getFilterInstance'],
            mitigation:
                "To read or write a single column's filter model, use `api.getColumnFilterModel(column)` and `api.setColumnFilterModel(column, model)` (the latter returns a Promise; await it before calling `api.onFilterChanged()`). If you specifically need the filter component instance, use `api.getColumnFilterInstance(column)`, which returns it asynchronously as a Promise.",
        },
        // ### Grid Options
        //
        // - `suppressServerSideInfiniteScroll` - removed without replacement.
        // - Interface `getServerSideGroupLevelParams` - `suppressInfiniteScroll` property removed without replacement.
        // - `advancedFilterModel` - removed, please use `initialState.filter.advancedFilterModel` instead.
        // - `suppressAsyncEvents` - removed, Events should be handled asynchronously.
        // - `cellFlashDelay` - removed, please use `cellFlashDuration` instead.
        // - `cellFadeDelay` - removed, please use `cellFadeDuration` instead.
        // - `enableCellChangeFlash` - removed, set `enableCellChangeFlash` in the `ColDef` or `defaultColDef` for all columns.
        // - `suppressGroupMaintainValueType` - removed.
        // - `groupIncludeFooter` - removed, please use `groupTotalRow` instead.
        // - `groupIncludeTotalFooter` - removed, please use `grandTotalRow` instead.
        // - `serverSideSortOnServer` - removed.
        // - `serverSideFilterOnServer` - removed.
        // - `tabToNextCell` returning `null` - removed.
        // - `tabToNextHeader` returning `null` - removed.
        //
        // Grid Options removals, deprecated in the v31.x cycle, removed v33.0.0. TODO: convert to
        // identity references (v31.deprecations.* / v31_1.* / v31_2.* / v31_3.*) once those files are
        // backfilled; inlined here as self-contained TransitionFacts.
        {
            // Deprecated v31.
            oldApi: '`advancedFilterModel` grid option',
            newApi: '`initialState.filter.advancedFilterModel`',
            detectWords: ['advancedFilterModel'],
            mitigation:
                'Move the value from the `advancedFilterModel` grid option to `initialState.filter.advancedFilterModel`.',
        },
        {
            // Deprecated v31. No replacement - events are always async now.
            oldApi: '`suppressAsyncEvents` grid option',
            oldDescription:
                'Made grid events fire synchronously, for legacy code depending on the pre-v10 synchronous event behaviour.',
            newApi: null,
            newDescription: 'Grid events always fire asynchronously.',
            detectWords: ['suppressAsyncEvents'],
            mitigation:
                'Remove the `suppressAsyncEvents` grid option. If any event handlers relied on events firing synchronously, refactor them to handle events asynchronously.',
        },
        {
            // Deprecated v31. No replacement.
            oldApi: '`suppressGroupMaintainValueType` grid option',
            oldDescription: 'When enabled, the grid cast group values to string type.',
            newApi: null,
            detectWords: ['suppressGroupMaintainValueType'],
            mitigation: 'Remove the `suppressGroupMaintainValueType` grid option; it no longer has any effect.',
        },
        {
            // Deprecated v31.1. Straight rename.
            oldApi: '`cellFlashDelay` grid option',
            newApi: '`cellFlashDuration`',
            detectWords: ['cellFlashDelay'],
            mitigation: 'Rename the `cellFlashDelay` grid option to `cellFlashDuration`.',
        },
        {
            // Deprecated v31.1. Straight rename.
            oldApi: '`cellFadeDelay` grid option',
            newApi: '`cellFadeDuration`',
            detectWords: ['cellFadeDelay'],
            mitigation: 'Rename the `cellFadeDelay` grid option to `cellFadeDuration`.',
        },
        {
            // Deprecated v31.1. Only applied when the (also-removed) suppressServerSideInfiniteScroll=true.
            oldApi: '`serverSideSortOnServer` grid option',
            oldDescription:
                'Made sorting happen on the server in the Server-Side Row Model, only when `suppressServerSideInfiniteScroll` was `true`.',
            newApi: '`serverSideEnableClientSideSort`',
            newDescription:
                'The Server-Side Row Model now sorts on the server by default; `serverSideEnableClientSideSort` opts loaded rows into client-side sorting.',
            detectWords: ['serverSideSortOnServer'],
            mitigation:
                'Remove `serverSideSortOnServer`. The Server-Side Row Model now sorts on the server by default, so no action is needed if you had it set to `true`. To sort fully-loaded rows on the client instead, set `serverSideEnableClientSideSort: true`. See [Server-Side Sorting](./server-side-model-sorting/).',
        },
        {
            // Deprecated v31.1. No client-side filtering counterpart exists in v33.
            oldApi: '`serverSideFilterOnServer` grid option',
            oldDescription:
                'Made filtering happen on the server in the Server-Side Row Model, only when `suppressServerSideInfiniteScroll` was `true`.',
            newApi: null,
            newDescription: 'The Server-Side Row Model always filters on the server.',
            detectWords: ['serverSideFilterOnServer'],
            mitigation:
                'Remove `serverSideFilterOnServer`. The Server-Side Row Model now always filters on the server; there is no client-side filtering option. See [Server-Side Filtering](./server-side-model-filtering/).',
        },
        {
            // Deprecated v31.2. Grid option removed; enableCellChangeFlash still exists on ColDef.
            oldApi: '`enableCellChangeFlash` grid option',
            oldDescription: 'Flashed all cells after their data changed.',
            newApi: '`enableCellChangeFlash` on `ColDef` or `defaultColDef`',
            detectWords: ['enableCellChangeFlash'],
            mitigation:
                'Set `enableCellChangeFlash: true` on `defaultColDef` to flash all columns, or on individual `ColDef`s for specific columns, instead of on the grid options.',
        },
        {
            // Deprecated v31.3. Rename; groupTotalRow exists in v33.
            oldApi: '`groupIncludeFooter` grid option',
            newApi: '`groupTotalRow`',
            detectWords: ['groupIncludeFooter'],
            mitigation:
                'Replace the `groupIncludeFooter` grid option with `groupTotalRow`. A value of `true` becomes `groupTotalRow: "bottom"`; a callback maps to the `UseGroupTotalRow` callback form.',
        },
        {
            // Deprecated v31.3. Rename; grandTotalRow exists in v33.
            oldApi: '`groupIncludeTotalFooter` grid option',
            newApi: '`grandTotalRow`',
            detectWords: ['groupIncludeTotalFooter'],
            mitigation:
                'Replace the `groupIncludeTotalFooter` grid option with `grandTotalRow`. A value of `true` becomes `grandTotalRow: "bottom"`.',
        },
        {
            // Deprecated v31.3. Contract/signature removal, NOT an option removal - the callbacks remain;
            // returning null is what was removed (at v32.3.0 returning null == returning true + a warning).
            oldApi: 'returning `null` from the `tabToNextCell` and `tabToNextHeader` callbacks',
            oldDescription: 'Returning `null` kept focus on the current cell/header (equivalent to returning `true`).',
            newApi: 'return `true`',
            detectWords: ['tabToNextCell', 'tabToNextHeader'],
            mitigation:
                'In any `tabToNextCell` or `tabToNextHeader` callback, replace `return null` with `return true` to keep focus on the current cell/header, or `return false` to let the browser handle the Tab key.',
        },
        // ### ColDef
        //
        // - `suppressCellFlash` - removed, please use `enableCellChangeFlash: false` in the `ColDef`.
        // - `columnsMenuParams` - removed, please use `columnChooserParams` instead.
        // - `suppressMenu` - removed, please use `suppressHeaderMenuButton` instead.
        //
        // ### Floating Filters
        // ColDef removals, deprecated in the v31.x cycle, removed v33.0.0 (commit 075eaadef6b).
        // TODO: convert to identity references (v31_1.deprecations.columnsMenuParams / .suppressMenu,
        // v31_2.deprecations.suppressCellFlash) once 31.1.ts / 31.2.ts are backfilled.
        {
            // Deprecated v31.1.
            oldApi: '`ColDef.columnsMenuParams`',
            newApi: '`ColDef.columnChooserParams`',
            detectWords: ['columnsMenuParams'],
            mitigation:
                'Rename `columnsMenuParams` to `columnChooserParams` in the column definition; the params shape is unchanged.',
        },
        {
            // Deprecated v31.1.
            oldApi: '`ColDef.suppressMenu`',
            newApi: '`ColDef.suppressHeaderMenuButton`',
            detectWords: ['suppressMenu'],
            mitigation: 'Rename `suppressMenu` to `suppressHeaderMenuButton` in the column definition.',
        },
        {
            // Deprecated v31.2 (commit 5d996778ce3). Inverted boolean, not a like-for-like rename.
            oldApi: '`ColDef.suppressCellFlash`',
            newApi: '`ColDef.enableCellChangeFlash`',
            detectWords: ['suppressCellFlash'],
            mitigation:
                'Set `enableCellChangeFlash: false` in the `ColDef` (or in `defaultColDef` to disable flashing for all columns).',
        },
        // Interface property removals, deprecated in the v31.x cycle, removed v33.0.0 (commit 075eaadef6b).
        // TODO: convert to identity references (v31_1.deprecations.suppressFloatingFilterButton /
        // .componentOnParamsUpdated / .flashCellsDurations; v31.deprecations.filterParamsValueGetter;
        // v31_2.deprecations.footerValueGetter; v31_3.deprecations.toolPanelColumnCompParams) once those
        // files are backfilled; inlined here as self-contained TransitionFacts.
        {
            // Deprecated v31.1.
            oldApi: '`suppressFilterButton` in `IFloatingFilterParams`',
            newApi: '`suppressFloatingFilterButton` on the column definition (`colDef.suppressFloatingFilterButton`)',
            detectWords: ['suppressFilterButton'],
            mitigation:
                'Move the setting off the floating filter params and onto the column definition: set `colDef.suppressFloatingFilterButton: true` instead of `suppressFilterButton` in `IFloatingFilterParams`.',
        },
        {
            // Both @deprecated v31.1 (IFloatingFilter and IDate); same rename advice -> one record.
            oldApi: '`onParamsUpdated` on custom floating filter (`IFloatingFilter`) and custom date (`IDate`) components',
            newApi: '`refresh`',
            detectWords: ['onParamsUpdated'],
            mitigation:
                'Rename the `onParamsUpdated` method on your custom floating filter or date component to `refresh` (same signature). The grid calls `refresh` when the column definition or params update.',
        },
        {
            // Deprecated v31.
            oldApi: '`valueGetter` in `IFilterParams`',
            newApi: '`getValue`',
            // Heavy false positives (valueGetter is a common colDef property), but sound: any code reading
            // the param must spell valueGetter.
            detectWords: ['valueGetter'],
            mitigation:
                'In custom filter components, read the cell value via the `getValue` callback on `IFilterParams` (`params.getValue(node)`) instead of `params.valueGetter`.',
        },
        {
            // Deprecated v31.2.
            oldApi: '`footerValueGetter` in `IGroupCellRendererParams`',
            newApi: '`totalValueGetter`',
            detectWords: ['footerValueGetter'],
            mitigation:
                'Rename `footerValueGetter` to `totalValueGetter` in your group cell renderer params (same value: a string expression or `TotalValueGetterFunc`).',
        },
        {
            // Both @deprecated v31.1 (FlashCellsParams); same rename advice -> one record.
            oldApi: '`flashDelay` and `fadeDelay` in `FlashCellsParams` (passed to `api.flashCells()`)',
            newApi: '`flashDuration` and `fadeDuration`',
            detectWords: ['flashDelay', 'fadeDelay'],
            mitigation:
                'When calling `api.flashCells()`, rename `flashDelay` to `flashDuration` and `fadeDelay` to `fadeDuration` (same millisecond values).',
        },
        {
            // Deprecated v31.3. At v32.3.0 an empty alias interface extending IToolPanelColumnCompParams.
            oldApi: '`ToolPanelColumnCompParams` interface',
            newApi: '`IToolPanelColumnCompParams`',
            // Whole-word matching does NOT match the new name IToolPanelColumnCompParams (preceded by 'I').
            detectWords: ['ToolPanelColumnCompParams'],
            mitigation:
                'Replace references to the `ToolPanelColumnCompParams` type with `IToolPanelColumnCompParams` (identical shape).',
        },
        // Grid option removed in v33 (commit 1f123e0342f). Was @deprecated v31.1 (commit 9f5684475fd,
        // shipped v31.1.0). TODO: convert to v31_1.deprecations.suppressServerSideInfiniteScroll once
        // 31.1.ts is backfilled; inlined here as a self-contained TransitionFacts.
        {
            oldApi: '`suppressServerSideInfiniteScroll` grid option',
            newApi: null,
            detectWords: ['suppressServerSideInfiniteScroll'],
            mitigation:
                'The full store has no direct replacement. Use the standard (infinite-scroll) Server-Side Row Model. To load a level in a single request as the full store did, set `cacheBlockSize` (globally, or per level via `getServerSideGroupLevelParams`) larger than the number of rows in that level, so the level loads in one block.',
        },
    ],
    behaviourChanges: [
        // ### Validation Module
        //
        // To help identify configuration issues we strongly recommend enabling validation in your development build. This validates your configuration and provides extended error diagnosis to help you resolve issues quickly. Call `enableDevValidations()` once, before any grid is created:
        //
        // ```js
        // // via process.env.NODE_ENV
        // if (process.env.NODE_ENV !== 'production') {
        //     enableDevValidations();
        // }
        // ```
        //
        // This is equivalent to registering the `ValidationModule` directly, for example `ModuleRegistry.registerModules([ValidationModule])`.
        //
        // Keep validation out of your production build to avoid increasing bundle size unnecessarily. In v33 the `AllCommunityModule` / `AllEnterpriseModule` bundles included the `ValidationModule` by default; from v36 onwards it is excluded and must be enabled explicitly — see [Upgrading to AG Grid 36](./upgrading-to-ag-grid-36/#behaviour-changes).
        // v32: validation was always-on (ValidationService was an unconditional core bean). v33: extracted
        // to a separate ValidationModule. AllCommunityModule/AllEnterpriseModule and UMD/CDN include it, so
        // only individual-module registration is affected.
        {
            title: 'Full validation diagnostics require the `ValidationModule` to be registered when registering modules individually',
            description:
                'In v32 validation ran for every grid because it was part of the grid core. In v33 it is a separate `ValidationModule`. The `AllCommunityModule` and `AllEnterpriseModule` bundles include it, so applications using those (and UMD/CDN applications) are unaffected. Applications that register modules individually no longer receive full validation messages: console output is reduced to an error code and a documentation link unless the `ValidationModule` is registered.',
            // Affected apps register modules individually, only possible via ModuleRegistry.registerModules,
            // so ModuleRegistry is the sole unavoidable identifier (also matches unaffected All* users - accepted).
            detectWords: ['ModuleRegistry'],
            // FIXME: index.mdoc:218-227 present enableDevValidations() as the v33 API, but it did not exist
            // until ~v36 (AG-16590). Kept per the current-advice rule; flagged so the anachronism is not
            // mistaken for v33 ground truth.
            mitigation:
                "Register the `ValidationModule` in your development build to restore full diagnostics. Call `enableDevValidations()` once before any grid is created (equivalent to `ModuleRegistry.registerModules([ValidationModule])`), guarding it with `if (process.env.NODE_ENV !== 'production')` so it is excluded from production bundles. Alternatively, registering `AllCommunityModule` or `AllEnterpriseModule` includes the `ValidationModule` in v33 (note: from v36 it is excluded from those bundles).",
        },
        // ### Property Value Coercion
        //
        // For non-TS users or users who use TS but avoid type validation there's changes in property value coercion:
        //
        // {% if isFramework("angular") %}
        // For boolean values provided as strings, the Angular provided booleanAttribute is now used. All string values except "false" are truthy - only "false" will be false, any other spelling such as “FALSE” will be treated as true.
        // {% /if %}
        //
        // {% if not(isFramework("angular")) %}
        // For boolean values provided as strings, "false" is no longer converted to false any more - all string values are truthy.
        // {% /if %}
        //
        // v32.3.0 applied toBoolean to every BOOLEAN grid option for ALL frameworks (only 'TRUE' any-case
        // or '' became true; every other string became false). AG-11845 removed that core coercion (commit
        // e47169c2ada). Non-Angular frameworks fall through to JS truthiness; Angular re-adds coercion via
        // booleanAttribute (commits 44ecb8ce95d, 4ad5008696f).
        {
            title: 'Boolean grid options set via string values are coerced differently: the grid no longer converts strings with its own `toBoolean` logic, so non-Angular apps treat every non-empty string as truthy and Angular uses Angular booleanAttribute',
            description:
                'Previously the grid coerced string values assigned to boolean grid options: only "true" (any case) or an empty string became `true`, and every other string - including "false", "FALSE", "0" and "no" - became `false`. This coercion has been removed from the grid core. In React, Vue and vanilla JavaScript the raw string is now used with normal JavaScript truthiness, so any non-empty string ("false", "FALSE", "0", "no", ...) is truthy and only an empty string is falsy. In Angular, pure-boolean inputs now use Angular\'s `booleanAttribute` transform, under which only the exact lowercase string "false" is `false` and every other string (including "FALSE" and "") is `true`. This only affects apps that pass string values to boolean options - non-TypeScript users, or TypeScript users who bypass the types.',
            // null: no sound detector. An affected app passes a string to one of ~140 boolean options; the
            // option names appear whether the value is a boolean or a string, and the offending string value
            // cannot be matched reliably - any candidate word both over-matches every app and cannot confirm
            // a string value, so it would not narrow below null's "match all".
            detectWords: null,
            mitigation: [
                {
                    content:
                        'Pass real boolean values (`true` / `false`) to boolean grid options rather than strings. Applications typed with the AG Grid TypeScript definitions are unaffected, since the option types never permitted strings; this only affects apps that bypass the types (for example vanilla JavaScript, or values built from untyped configuration).',
                },
                {
                    frameworks: ['react', 'vue', 'javascript'],
                    content:
                        'The grid no longer converts strings to booleans, so a non-empty string such as `"false"`, `"FALSE"`, `"0"` or `"no"` is now treated as `true`. Anywhere you passed one of these strings intending `false`, pass the boolean `false` instead. (An empty string `""` remains falsy.)',
                },
                {
                    frameworks: ['angular'],
                    content:
                        'Boolean inputs now use Angular\'s `booleanAttribute`: only the exact lowercase string `"false"` evaluates to `false`; any other string, including `"FALSE"` or an empty attribute, is `true`. Prefer property binding with a real boolean, e.g. `[suppressRowClickSelection]="false"`, rather than a string attribute. If you set the value as a plain HTML attribute, use exactly `"false"` (lowercase) for a false value.',
                },
            ],
        },
        // ### Server-side Rendering
        //
        // AG Grid no longer patches global properties that are not present in a Server environment, i.e HTMLElement and others. If possible you should avoid rendering AG Grid on the server as this is not supported.
        //
        // Verified against v32.3.0 main.ts (the shim) and its removal by commit 7255273e13c (AG-12287,
        // 2024-11-04). The v32 block assigned empty-object stand-ins to exactly these six globals.
        {
            title: 'AG Grid no longer patches missing browser globals (`HTMLElement`, `HTMLButtonElement`, `HTMLSelectElement`, `HTMLInputElement`, `Node`, `MouseEvent`) when evaluated outside a browser',
            description:
                'Earlier versions assigned empty-object stand-ins to these globals at import time so that the grid could be imported and compiled in a Node/server environment without throwing a `ReferenceError`. From v33 this patching is removed, so importing or instantiating the grid on the server may throw. Server-side rendering of AG Grid is not supported.',
            // null: SSR is a property of the build/deployment environment, not of any grid API surface. Every
            // grid app imports and creates the grid, so the only "marker" would match every app and rule
            // nothing out - the guide's "no sound word" case.
            detectWords: null,
            // REVIEW: an intermediate commit (325e3e3b1f2, not in v33 ancestry) briefly exposed the shim as
            // an exported unsafeServerSidePatching() function, but it was dropped before release - v33 offers
            // no opt-out. Flagged in case a reviewer expects that function to be a documented mitigation.
            mitigation:
                "Do not render or instantiate AG Grid on the server. Guard grid creation so it runs on the client only: in Next.js mark the grid component with `'use client'` (or import it dynamically with `{ ssr: false }`); in other SSR frameworks use the equivalent client-only rendering guard. There is no supported way to restore the previous global-patching behaviour.",
        },
        //
        // The column property is now optional in the callback to get column menu items (in the grid option `getMainMenuItems` or `colDef.mainMenuItems`). `column` will be null when a column group header or empty column space is right-clicked on. A new property `columnGroup` will be provided when a column group header is right-clicked on.
        //
        // ### Row Drop Zone
        // Verified against commit 7649b7bec9d (AG-12651, PR #9166, 2024-10-31). GetMainMenuItemsParams.column
        // went Column -> Column | null, and columnGroup: ProvidedColumnGroup | null was added.
        {
            title: '`column` is nullable in the `getMainMenuItems` / `colDef.mainMenuItems` callback params, and a new `columnGroup` property is provided',
            description:
                'Previously the callback that builds the column menu items was only invoked over a real column, so `params.column` was always set. It is now also invoked when a column group header or empty header space is right-clicked: in those cases `params.column` is `null`. A new `params.columnGroup` property holds the `ProvidedColumnGroup` when a column group header is right-clicked, and is `null` otherwise.',
            // The grid option getMainMenuItems and the colDef property mainMenuItems are the only ways to
            // register this callback. Case-sensitive, so 'mainMenuItems' does not match 'getMainMenuItems'.
            detectWords: ['getMainMenuItems', 'mainMenuItems'],
            mitigation:
                'Handle the new cases in your callback: guard on `params.column` being `null` (returning `params.defaultItems` unchanged reproduces the old behaviour of not customising column group headers or empty header space), and use the new `params.columnGroup` (a `ProvidedColumnGroup | null`) if you want to add items when a column group header is right-clicked.',
        },
        //
        // `api.getRowDropZoneParams()` returns undefined if the `RowDragModule` is not registered.
        //
        // ### Server-side Row Model
        // Verified v33.0.0: getRowDropZoneParams is registered in RowDragModule.apiFunctions (dragModule.ts);
        // without the module the API function returns undefined.
        // REVIEW: classified as a behaviourChange (the call now returns undefined instead of params). Could
        // equally be a newRequirement; it is a narrow consequence of the v33 modularisation.
        {
            title: '`api.getRowDropZoneParams()` returns `undefined` when the `RowDragModule` is not registered',
            description:
                'With the v33 modular architecture, `api.getRowDropZoneParams()` is provided by the `RowDragModule`. If that module is not registered, the call returns `undefined`.',
            // The method name is the sole detector; same name in v32, so no old-version false negatives.
            detectWords: 'getRowDropZoneParams',
            mitigation:
                'Register the `RowDragModule` (imported from `ag-grid-community`) so `api.getRowDropZoneParams()` is available.',
        },
        // ### Column State
        //
        // Column state properties in the column definition are no longer parsed to number/boolean. Provide the correct types instead of strings.
        //
        // REVIEW: page heading is 'Column State' but the change is to COLUMN DEFINITION properties. Verified
        // against commit f2470432c01 (AG-12847, PR #8985): removed _attrToNumber/_attrToBoolean calls are all
        // in colDef read paths (columnFactory.ts, agColumn.ts, funcColsService.ts). applyColumnState never
        // coerced these values. The page body ("in the column definition") is correct; only the heading is a misnomer.
        {
            title: 'Numeric and boolean column definition properties are no longer coerced from strings',
            description:
                'The following column definition properties are used as provided instead of being parsed: the numeric `width`, `initialWidth`, `flex`, `sortIndex`, `rowGroupIndex`, `initialRowGroupIndex`, `pivotIndex` and `initialPivotIndex`, and the boolean `hide`, `rowGroup`, `initialRowGroup`, `pivot` and `initialPivot`. Passing a string such as `width: "100"` or `hide: "true"` no longer works.',
            // Affected apps must spell the colDef property they set as a string; each entry is the sole
            // detector for an app that sets only that property. High false positives are acceptable.
            detectWords: [
                'width',
                'initialWidth',
                'flex',
                'sortIndex',
                'rowGroupIndex',
                'initialRowGroupIndex',
                'pivotIndex',
                'initialPivotIndex',
                'hide',
                'rowGroup',
                'initialRowGroup',
                'pivot',
                'initialPivot',
            ],
            mitigation:
                'Provide the correct types in the column definition: numbers for `width`, `initialWidth`, `flex`, `sortIndex`, `rowGroupIndex`, `initialRowGroupIndex`, `pivotIndex` and `initialPivotIndex`, and booleans for `hide`, `rowGroup`, `initialRowGroup`, `pivot` and `initialPivot`. For example use `width: 100` rather than `width: "100"`, and `hide: true` rather than `hide: "true"`.',
        },
        // ### Grid State
        //
        // Grid state `colId ag-Grid-ControlsColumn` is now named `ag-Grid-SelectionColumn`.
        //
        // Restoring grid state with the old `colId` will have no effect.
        //
        // Verified: CONTROLS_COLUMN_ID_PREFIX 'ag-Grid-ControlsColumn' (v32.3.0 controlsColService.ts) ->
        // 'ag-Grid-SelectionColumn' (v33.0.0 selectionColService.ts). Commit 98d4237bca9 (AG-9625);
        // column-state support 4b51017c0da (AG-12861).
        {
            title: 'Grid state selection column `colId` renamed from `ag-Grid-ControlsColumn` to `ag-Grid-SelectionColumn`',
            description:
                'The auto-generated selection column is identified in grid state and column state by the `colId` `ag-Grid-SelectionColumn`, previously `ag-Grid-ControlsColumn`. Grid or column state saved from an earlier version referencing the old `colId` no longer matches the selection column, so restoring it has no effect on that column.',
            // An app references the selection column only by spelling the old literal in source (persisted
            // state, applyColumnState payloads, or state post-processing). Case-sensitive exact substring.
            detectWords: 'ag-Grid-ControlsColumn',
            mitigation:
                'Update any persisted grid state or column state, and any hard-coded `colId` references, from `ag-Grid-ControlsColumn` to `ag-Grid-SelectionColumn`. When migrating stored state, rewrite the old `colId` to the new value before restoring it.',
        },
        // REVIEW: compile-time type narrowing only, not a runtime behaviour change (no typeChanges section in
        // the schema, so filed here). At v32.3.0 vDirection was typed `string` but rowDragFeature.ts only ever
        // assigned 'up', 'down' or null; v33 (commit e277e97cd3f, AG-12847) narrowed the declared type.
        {
            title: "`RowDragEvent.vDirection` is typed `'up' | 'down' | null`",
            description:
                "The `vDirection` property on the row drag event was previously typed `string` but only ever held `'up'`, `'down'` or `null` at runtime. Its declared type is now narrowed to `'up' | 'down' | null`; the runtime values are unchanged.",
            // Affected app reads event.vDirection in a row-drag handler; must spell vDirection. Compile-only.
            detectWords: ['vDirection'],
            mitigation:
                "No runtime change is required. If TypeScript now reports an error, retype any variable or field you assign `event.vDirection` to as `'up' | 'down' | null` instead of `string`.",
        },
    ],
    styleChanges: [
        // ### Custom Icons
        //
        // Setting any of the custom icons listed below will have the provided custom icon only apply in the specific use case its name indicates, instead of all cases as before. To have the custom icon apply to additional cases, set the additional icon keys pointing to the same custom icon. See list of icons changed:
        //
        // - `smallDown` (deprecated):
        //     - `advancedFilterBuilderSelect` for Advanced Filter Builder dropdown
        //     - `selectOpen` for Select cell editor and dropdowns (e.g., Integrated Charts menu)
        //     - `richSelectOpen` for Rich Select cell editor
        // - `smallLeft` (deprecated):
        //     - `panelDelimiterRtl` for Row Group Panel / Pivot Panel
        //     - `subMenuOpenRtl` for sub-menus
        // - `smallRight` (deprecated):
        //     - `panelDelimiter` for Row Group Panel / Pivot Panel
        //     - `subMenuOpen` for sub-menus
        // - `previous`:
        //     - `previous` for pagination
        //     - `chartsThemePrevious` for Integrated Charts theme picker
        // - `next`:
        //     - `next` for pagination
        //     - `chartsThemeNext` for Integrated Charts theme picker
        // - `cancel`:
        //     - `cancel` for column drag pills
        //     - `richSelectRemove` for Rich Select cell editor pills
        // - `menu`:
        //     - `menu` for button to launch the legacy column menu
        //     - `legacyMenu` for legacy column menu tab header
        // - `menuAlt`:
        //     - `menuAlt` for new column menu
        //     - `chartsMenu` for Integrated Charts menu
        // - `columns`:
        //     - `columns` for the column menu/column chooser
        //     - `columnsToolPanel` for the Columns Tool Panel tab icon
        // - `filter`:
        //     - `filter` for buttons that open the filter (header/menu)
        //     - `filtersToolPanel` for the Filters Tool Panel tab icon
        //     - `filterActive` for displaying the filter is active (header with legacy column menu, Filters Tool Panel item)
        //     - `filterTab` for the filter tab of the legacy tabbed column menu
        // - `save`:
        //     - `save` for the export menu
        //     - `chartsDownload` for Integrated Charts download
        // - `columnSelectClosed`:
        //     - `columnSelectClosed` for the Columns Tool Panel/Column Chooser/column tab in the legacy tabbed column menu
        //     - `accordionClosed` for accordions (Filters Tool Panel, Integrated Charts tool panels)
        // - `columnSelectOpen`:
        //     - `columnSelectOpen` for the Columns Tool Panel/Column Chooser/column tab in the legacy tabbed column menu
        //     - `accordionOpen` for accordions (Filters Tool Panel, Integrated Charts tool panels)
        // - `columnSelectIndeterminate`:
        //     - `columnSelectIndeterminate` for the Columns Tool Panel/Column Chooser/column tab in the legacy tabbed column menu
        //     - `accordionIndeterminate` for accordions (Filters Tool Panel, Integrated Charts tool panels)
        //
        // {% /expandingSection %}
        //
        // REVIEW: classification styleChanges vs behaviourChanges. The page presents this under a "Custom
        // Icons" breaking-change heading. It is arguably a behaviourChange (existing icon config still runs
        // but applies to fewer places); filed under styleChanges because the entire surface is visual icon
        // customisation. Verified against implementing commit e373358a9bf (AG-13250, PR #9125, 2024-11-04),
        // which split each broad icon key into per-use-case keys.
        {
            title: 'Setting a custom icon by one of the umbrella icon keys applies it only to the specific use case the key names, not to every use case as before',
            description:
                'Previously, setting one of these icon keys (via the `icons` grid option, `colDef.icons`, or the Theming API `iconOverrides` part) applied the custom icon across several use cases at once. In v33 each of these keys applies only to the single use case its name indicates; the other use cases were given their own new icon keys and fall back to the default icon unless separately set.',
            // Each key is the sole detector for an app that customises only that key (minimality). The generic
            // words (menu, filter, columns, next, previous, save, cancel) over-match but are the literal key
            // names an affected app must contain. Names pre-date v33, so v32 apps match too.
            detectWords: [
                'smallDown',
                'smallLeft',
                'smallRight',
                'previous',
                'next',
                'cancel',
                'menu',
                'menuAlt',
                'columns',
                'filter',
                'save',
                'columnSelectClosed',
                'columnSelectOpen',
                'columnSelectIndeterminate',
            ],
            // FIXME: the upgrade page (lines 478, 654) and runtime warning 262 both name a non-existent
            // `advancedFilterBuilderSelect`; the real key is `advancedFilterBuilderSelectOpen` (icon.ts:95).
            // The linked file uses the correct key.
            mitigation: (await import('./v33-custom-icon-scoping.md?raw')).default,
        },
    ],
} satisfies VersionChangelog;
