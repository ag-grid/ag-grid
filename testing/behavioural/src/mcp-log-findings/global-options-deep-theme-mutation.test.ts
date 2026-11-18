/*
 * Issue: with provideGlobalGridOptions({ theme }, 'deep'), creating a grid that has its own
 * `theme` option merges that theme object's fields into the shared global theme object, mutating it.
 *
 * Setup: provideGlobalGridOptions({ theme: themeAlpine }, 'deep'). Grid A is created with
 * theme: themeBalham, then grid B is created with no theme option.
 *
 * Expected: GlobalGridOptions docs (globalGridOptions.ts) say "Individually defined GridOptions will
 * take precedence over global options" and that merging avoids "leaking changes to the global options".
 * Grid A should use themeBalham as-is, the global themeAlpine should be untouched, and grid B
 * should still use themeAlpine.
 *
 * Actual: the deep merge treats the theme class instance as a mergeable object and copies the
 * per-grid theme's own fields (parts, params) onto the global theme instance. Grid A's theme is
 * then the (mutated) global theme object rather than themeBalham, and the global theme's parts
 * are replaced.
 *
 * Reported on: AG Grid Angular 35.1.0 and 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents on Angular 35.1.0 and 36.0.0
 * (May and July 2026) searched for why a theme set via provideGlobalGridOptions was not applied or
 * why multiple themes in one document misbehaved, e.g. "provideGlobalGridOptions theme override not
 * applied per grid instance" and "theme not applying troubleshooting multiple themes same document".
 */
import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    provideGlobalGridOptions,
    themeAlpine,
    themeBalham,
} from 'ag-grid-community';

// TODO: disabled due to AG-19222 - re-enable once fixed
describe.skip('global grid options deep merge with per-grid theme', () => {
    const apis: GridApi[] = [];

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(() => {
        apis.splice(0).forEach((api) => api.destroy());
        provideGlobalGridOptions({});
        document.body.innerHTML = '';
    });

    test('per-grid theme is used as-is and the global theme is not mutated', () => {
        // Fresh instances, so a mutation by the deep merge cannot leak into the exported theme singletons.
        const alpine = themeAlpine.withParams({});
        const balham = themeBalham.withParams({});
        const rootClasses = (id: string) => {
            const root = document.querySelector(`#${id} .ag-styled-root`)!;
            return Array.from(root.classList)
                .filter((c) => c.startsWith('ag-theme-'))
                .sort();
        };

        // Reference grids, created before any global options, show what each theme renders as.
        document.body.innerHTML = '<div id="refAlpine"></div><div id="refBalham"></div>';
        apis.push(createGrid(document.getElementById('refAlpine')!, { theme: alpine }));
        apis.push(createGrid(document.getElementById('refBalham')!, { theme: balham }));
        const alpineClasses = rootClasses('refAlpine');
        const balhamClasses = rootClasses('refBalham');

        provideGlobalGridOptions({ theme: alpine }, 'deep');

        document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
        apis.push(createGrid(document.getElementById('a')!, { theme: balham }));
        apis.push(createGrid(document.getElementById('b')!, {}));

        expect(rootClasses('a')).toEqual(balhamClasses);
        expect(rootClasses('b')).toEqual(alpineClasses);
    });
});
