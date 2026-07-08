import type { VersionChangelog } from '@ag-website-shared/changes/change-types';

export const v36 = {
    dependencyChanges: [
        {
            dependency: 'angular',
            minVersion: '20',
            reason: 'Angular 18 and 19 have reached end of life.',
        },
        {
            dependency: 'typescript',
            minVersion: '5.8.3',
            reason: null,
        },
    ],
    newRequirements: [
        {
            title: 'AG Grid depends on the shared library `ag-stack`',
            description:
                '`ag-grid-community` and `ag-grid-enterprise` have a dependency on the AG Grid shared library `ag-stack`',
            // null: whether an app is affected depends on its build/registry configuration, not on anything in its source
            detectWords: null,
            mitigation:
                'No action is needed unless your build restricts which packages may be installed (e.g. a private registry allowlist), in which case allow `ag-stack`',
        },
        // TODO this kind of breaking change should be handled by the charts breaking changes records, ensure we have test cases for it
        // {
        //     title: 'Integrated Charts uses AG Charts 14',
        //     description:
        //         'Applications using Integrated Charts are affected by the behaviour and breaking changes in AG Charts 14.',
        //     detectWords: [
        //         'IntegratedChartsModule',
        //         'SparklinesModule',
        //         'enableCharts',
        //         'ag-charts-enterprise',
        //         'ag-grid-charts-enterprise',
        //         'ag-charts-community',
        //     ],
        //     mitigation:
        //         'Refer to [Upgrade to AG Charts 14](https://www.ag-grid.com/charts/r/upgrade-to-ag-charts-14/).',
        // },
    ],
    behaviourChanges: [
        {
            title: 'Aggregation functions are displayed in usage-frequency order (Sum, Average, Max, Min, Count, First, Last) instead of alphabetically',
            detectWords: ['aggFunc', 'enableValue', 'setValueColumns', 'addValueColumns'],
            mitigation: 'The order of functions can be controlled via colDef.allowedAggFuncs',
        },
        {
            title: "When `cellDataType` is `'date'`, the Filter Model returns date-only values",
            // Only applies in apps that access the filter model, this covers all ways of accessing it
            detectWords: ['getFilterModel', 'setFilterModel', 'filterModel'],
            mitigation:
                'Set filterParams: { includeTime: true } on affected date columns to restore the previous format.',
        },
        {
            title: 'The value column order in the columns tool panel is saved and reloaded as part of grid state',
            description:
                'When loading grid state, pivot result value column header order remains the same, since the order is saved as part of state.',
            detectWords: [
                'initialState',
                'getState',
                'setState',
                'onStateUpdated',
                'getColumnState',
                'applyColumnState',
            ],
            // Not recommending a mitigation here, seems only to be possible by patching the grid state object
            mitigation: null,
        },
        {
            title: 'The `ValidationModule` is not included in the `AllCommunityModule` and `AllEnterpriseModule` bundles',
            description:
                'This keeps production bundles smaller by default. Without the `ValidationModule`, console messages are reduced to an error code and a documentation link.',
            detectWords: ['AllCommunityModule', 'AllEnterpriseModule'],
            mitigation: (await import('./v36-enable-dev-validations.md?raw')).default,
        },
        {
            title: 'The Client-Side Row Model is part of the grid core',
            description:
                'It is no longer necessary to import and register ClientSideRowModelModule because it is included in the core bundle.',
            detectWords: ['ClientSideRowModelModule'],
            mitigation:
                'If `ClientSideRowModelModule` exists in a `ModuleRegistry.registerModules(...)` invocation, remove it and the corresponding import of it. If this would leave an empty array argument, remove the whole `ModuleRegistry.registerModules` call. This does not affect `ClientSideRowModelApiModule`, which is a separate module and still required for its API functions.',
        },
        {
            title: 'The default for the `suppressContentVisibilityAuto` grid option changed from `false` to `true`',
            description:
                'content-visibility:auto is a CSS API for improving rendering performance when grids are off-screen, e.g. scrolled out of view. Due to rare issues with this feature in some browsers, we no longer enable it by default. Apps with off-screen grids should consider enabling it to improve performance, and testing to ensure that it works for you.',
            // null: the flip only affects apps that never set the option — the trigger is its absence, so there is no code marker to detect
            detectWords: null,
            mitigation:
                'For v36.0, pass `suppressContentVisibilityAuto: false` to enable the feature. From v36.1, use `enableContentVisibilityAuto: true`. We recommend skipping 36.0 and updating to 36.1, which contains mitigations for buggy browser implementations of content-visibility. Additionally, any code that measures the size of grid elements while a grid is off-screen will receive a measurement of 0px. This includes application code, and column auto-size (autoSizeStrategy). If your grid application includes code that measures elements - e.g. using offsetHeight/Width, clientHeight/Width, or getBoundingClientRect - either ensure that the grid is on-screen when measured, or do not enable content-visibility:auto',
        },
        {
            title: 'Grouped rows use tooltip properties inherited from the underlying grouped column `colDef`',
            description:
                'This includes `tooltipField`, `tooltipValueGetter`, `tooltipComponent`, `tooltipComponentParams`, `tooltipComponentSelector` and `headerTooltip`. `autoGroupColumnDef` tooltip properties apply to leaf rows only.',
            detectWords: [
                'tooltipField',
                'tooltipValueGetter',
                'tooltipComponent',
                'tooltipComponentParams',
                'tooltipComponentSelector',
                'headerTooltip',
            ],
            mitigation:
                'There is no option to disable the inheritance. To suppress tooltips on group rows, use a `tooltipValueGetter` on the grouped column that returns `undefined` when `params.node.group` is true.',
        },
    ],
    styleChanges: [
        {
            title: 'The grid renders in a single scrollable container, and layout container class names have changed',
            description:
                'The grid uses a single container to permit both vertical and horizontal scrolling natively in the browser. Previously the header, body and pinned columns were placed in separate containers. The 9+ previous containers have been replaced with a single container, and the class names relating to high-level layout and scrolling containers have changed. Applications that only style visible grid components (cells, buttons, filters) are unaffected; applications that style containers, target them in CSS selectors or JS APIs like `document.querySelector`, or make assumptions about the DOM structure of pinned containers are likely to need an update. Pre-recorded tests may fail depending on how they are written.',
            // To keep the list of words down in size, we're searching for common
            // prefixes of container classes, many of these have multiple suffixes
            detectWords: [
                'ag-body',
                'ag-center-cols',
                'ag-viewport',
                'ag-horizontal-left',
                'ag-horizontal-right',
                'ag-scroller',
                'ag-pinned-left',
                'ag-pinned-right',
                'ag-header-container',
                'ag-header-viewport',
                'ag-header-root',
                'ag-floating-top',
                'ag-floating-bottom',
                'ag-sticky-top',
                'ag-sticky-bottom',
                'ag-full-width-container',
            ],
            mitigation: (await import('./v36-dom-structure-migration.md?raw')).default,
        },
        {
            title: 'Theme and RTL classes are set on a parent element of top-level grid components',
            description:
                'Every location where grid elements are inserted into application-owned DOM has a consistent structure: three nested layout-transparent `div.ag-styled-root` wrappers carry the theme and direction classes, e.g. `application-div > div.ag-styled-root > div.ag-styled-root.ag-theme-x > div.ag-styled-root.ag-ltr > div.ag-some-component`.',
            detectWords: [
                'ag-root-wrapper',
                'ag-dnd-ghost',
                'ag-popup',
                'ag-tool-panel-external',
                'ag-advanced-filter',
                'ag-chart',
                'ag-rtl',
                'ag-ltr',
            ],
            mitigation:
                '`.ag-root-wrapper`, `.ag-dnd-ghost`, `.ag-popup`, `.ag-popup-child`, `.ag-tool-panel-external`, `.ag-advanced-filter` and `.ag-chart` previously had theme and/or RTL classes set directly on them. Update application CSS such as `.ag-root-wrapper.ag-rtl { }` to the new structure: `.ag-rtl .ag-root-wrapper { }`, and likewise `.ag-theme-x .ag-root-wrapper { }` for theme-scoped rules.',
        },
        {
            title: "The `fontWeight` theme parameter defaults to `400` instead of inheriting the page's font weight",
            detectWords: null,
            mitigation:
                "If the grid's font weight has changed, to restore the correct font weight explicitly set the desired font weight using the `fontWeight` theme parameter (recommended) or to restore inheriting the page's font weight, set `fontWeight: 'inherit'`.",
        },
        {
            title: 'The pagination panel default height is based on the height of picker fields, not the row height',
            description: 'This ensures correct padding regardless of the size of your picker fields.',
            detectWords: ['pagination'],
            mitigation:
                'Use the `paginationPanelHeight` and `pickerFieldHeight` theme parameters to override these heights.',
        },
        {
            title: 'Picker fields respect the `borderRadius` theme parameter instead of a hard-coded `5px`',
            // Picker fields are all over the UI, opting to flag this change for
            // all apps rather than try to detect every feature that uses pickers
            detectWords: null,
            mitigation: 'Set the `pickerButtonBorderRadius` parameter to 5 to restore the old radius',
        },
        {
            title: 'Button and column drop styles are no longer bundled with themes returned by `createTheme()`',
            detectWords: ['createTheme'],
            mitigation:
                'Themes should have a button style and column drop style. Check if appropriate parts are already being added using `withPart`, and if not, add them using `createTheme().withPart(buttonStyleQuartz).withPart(columnDropStyleBordered)`.',
        },
        {
            title: 'The Pagination Panel and Status Bar use horizontal scroll overflow when space is constrained',
            detectWords: ['pagination', 'statusBar'],
            // One could set overflow:hidden on the containers, but that would
            // be awful UX so not flagging it as a possibility in case an agent
            // unilaterally decides to do it
            mitigation: null,
        },
    ],
} satisfies VersionChangelog;
