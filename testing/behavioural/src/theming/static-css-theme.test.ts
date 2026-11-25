import { waitFor } from '@testing-library/dom';
import { _setStyleInjectionEnabledForTesting } from 'ag-stack';
import { TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridOptions, StaticCssThemeOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ValidationModule,
    enableDevValidations,
    staticCssTheme,
    themeQuartz,
} from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

describe('staticCssTheme', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnMenuModule, ValidationModule] });
    let eGridDiv: HTMLElement;
    let eLoadedMarkers: HTMLStyleElement;
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: [] });
        // style injection is off in tests by default, so turn it on for "injects no styles" to prove anything
        _setStyleInjectionEnabledForTesting(true);
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        eLoadedMarkers = document.createElement('style');
        eLoadedMarkers.textContent =
            '.ag-measurement-container { --ag-static-css-loaded: 1; --ag-static-css-icon-set-quartz-regular-loaded: 1; }';
        document.head.appendChild(eLoadedMarkers);
        eGridDiv = document.createElement('div');
        document.body.appendChild(eGridDiv);
    });

    afterEach(() => {
        gridMgr.reset();
        eGridDiv.remove();
        eLoadedMarkers.remove();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        _setStyleInjectionEnabledForTesting(false);
    });

    const createGrid = (options: Partial<GridOptions> = {}) =>
        gridMgr.createGridAndWait(eGridDiv, {
            theme: staticCssTheme(),
            columnDefs: [{ field: 'make' }],
            rowData: [{ make: 'Tesla' }],
            ...options,
        });

    const gridStyledRoot = () => eGridDiv.querySelector('.ag-styled-root.ag-static-css-theme');
    const gridClasses = () => [...(gridStyledRoot()?.classList ?? [])];

    const diagnostics = (spy: MockInstance, id: number) =>
        spy.mock.calls.filter((call) => String(call[0]).includes(`#${id}`));

    test('applies the theme and part classes to the grid and popup styled roots', async () => {
        const api = await createGrid({ theme: staticCssTheme({ tabStyle: 'material', colorScheme: 'darkBlue' }) });

        const expected = [
            'ag-theme-quartz',
            'ag-theme-part-tab-style-material',
            'ag-theme-part-color-scheme-dark-blue',
            'ag-theme-part-icon-set-quartz-regular',
        ];
        expect(gridClasses()).toEqual(expect.arrayContaining(expected));
        expect(gridClasses()).not.toContain('ag-theme-part-tab-style-quartz');
        expect(gridStyledRoot()!.parentElement!.classList.contains('ag-static-css-inherit')).toBe(true);

        api.showColumnMenu('make');
        const menu = await waitFor(() => {
            const el = document.querySelector('.ag-menu');
            if (!el) {
                throw new Error('Column menu not shown');
            }
            return el;
        });
        const popupRoot = menu.closest('.ag-styled-root.ag-static-css-theme')!;
        expect([...popupRoot.classList]).toEqual(expect.arrayContaining(expected));
        expect(popupRoot.parentElement!.classList.contains('ag-static-css-inherit')).toBe(true);
    });

    test('applies the part classes of the defaults theme for parts that are not set', async () => {
        eLoadedMarkers.textContent += '.ag-measurement-container { --ag-static-css-icon-set-balham-loaded: 1; }';

        await createGrid({ theme: staticCssTheme({ defaults: 'balham', inputStyle: 'underlined' }) });

        expect(gridClasses()).toEqual(
            expect.arrayContaining([
                'ag-theme-balham',
                'ag-theme-part-tab-style-rolodex',
                'ag-theme-part-icon-set-balham',
                'ag-theme-part-input-style-underlined',
            ])
        );
        expect(gridClasses()).not.toContain('ag-theme-part-input-style-bordered');
    });

    test('applies the linked icon set class with useLinkedImages', async () => {
        eLoadedMarkers.textContent =
            '.ag-measurement-container { --ag-static-css-loaded: 1; --ag-static-css-linked-loaded: 1; --ag-static-css-icon-set-quartz-regular-linked-loaded: 1; }';

        await createGrid({ theme: staticCssTheme({ useLinkedImages: true }) });

        expect(gridClasses()).toContain('ag-theme-part-icon-set-quartz-regular-linked');
        expect(gridClasses()).not.toContain('ag-theme-part-icon-set-quartz-regular');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test('ignores theme classes on ancestor elements', async () => {
        eGridDiv.className = 'ag-theme-alpine ag-theme-part-tab-style-rolodex';

        await createGrid();

        expect(gridClasses()).not.toContain('ag-theme-alpine');
        expect(gridClasses()).not.toContain('ag-theme-part-tab-style-rolodex');
    });

    test('updates the styled root classes when the theme option changes', async () => {
        eLoadedMarkers.textContent += '.ag-measurement-container { --ag-static-css-icon-set-alpine-loaded: 1; }';
        const api = await createGrid();

        api.setGridOption('theme', staticCssTheme({ defaults: 'alpine', colorScheme: 'dark' }));

        await waitFor(() => {
            expect(gridClasses()).toContain('ag-theme-alpine');
            expect(gridClasses()).toContain('ag-theme-part-color-scheme-dark');
            expect(gridClasses()).not.toContain('ag-theme-quartz');
        });
    });

    test('switches from a Theming API theme to a static CSS theme', async () => {
        const api = await createGrid({ theme: themeQuartz });
        expect(gridStyledRoot()).toBeNull();

        api.setGridOption('theme', staticCssTheme());

        await waitFor(() => expect(gridClasses()).toContain('ag-theme-quartz'));
    });

    test('switches from a static CSS theme to a Theming API theme', async () => {
        const api = await createGrid();

        api.setGridOption('theme', themeQuartz);

        await waitFor(() => {
            expect(gridStyledRoot()).toBeNull();
            expect(document.querySelectorAll('style[data-ag-css]').length).toBeGreaterThan(0);
        });
    });

    test('switches from a static CSS theme to legacy themes', async () => {
        const api = await createGrid();

        api.setGridOption('theme', 'legacy');

        await waitFor(() => expect(gridStyledRoot()).toBeNull());
        expect(document.querySelectorAll('style[data-ag-css]')).toHaveLength(0);
    });

    test('injects no styles', async () => {
        await createGrid();

        expect(document.querySelectorAll('style[data-ag-css]')).toHaveLength(0);
    });

    test('does not warn when ag-grid.css has loaded and the built-in icon set is used', async () => {
        await createGrid();

        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('warns when ag-grid.css has not loaded', async () => {
        eLoadedMarkers.remove();

        await createGrid();

        expect(diagnostics(consoleWarnSpy, 350)).toHaveLength(1);
    });

    test('errors when legacy theme CSS is also loaded', async () => {
        eLoadedMarkers.textContent = '.ag-measurement-container { --ag-legacy-styles-loaded: 1; }';

        await createGrid();

        expect(diagnostics(consoleErrorSpy, 349)).toHaveLength(1);
    });

    test.each<[string, StaticCssThemeOptions, string]>([
        ['the defaults theme', { defaults: 'alpine' }, 'icon-set-alpine'],
        ['the iconSet option', { iconSet: 'quartzLight' }, 'icon-set-quartz-light'],
        ['useLinkedImages', { useLinkedImages: true }, 'icon-set-quartz-regular-linked'],
    ])('warns when the icon set file for %s has not loaded, naming the file', async (_, options, file) => {
        eLoadedMarkers.textContent = options.useLinkedImages
            ? '.ag-measurement-container { --ag-static-css-loaded: 1; --ag-static-css-linked-loaded: 1; }'
            : '.ag-measurement-container { --ag-static-css-loaded: 1; }';

        await createGrid({ theme: staticCssTheme(options) });

        const warnings = diagnostics(consoleWarnSpy, 351);
        expect(warnings).toHaveLength(1);
        expect(String(warnings[0][1])).toContain(`ag-grid-community/css/${file}.css`);
    });

    test.each<[string, boolean, string, string]>([
        ['useLinkedImages is set without ag-grid-linked.css', true, '', 'ag-grid-linked.css'],
        [
            'ag-grid-linked.css is loaded without useLinkedImages',
            false,
            '--ag-static-css-linked-loaded: 1;',
            'ag-grid.css',
        ],
    ])('warns when %s, naming the file to load', async (_, useLinkedImages, marker, file) => {
        eLoadedMarkers.textContent = `.ag-measurement-container { --ag-static-css-loaded: 1; ${marker} }`;

        await createGrid({ theme: staticCssTheme({ useLinkedImages }) });

        const warnings = diagnostics(consoleWarnSpy, 354);
        expect(warnings).toHaveLength(1);
        expect(String(warnings[0][1])).toContain(`ag-grid-community/css/${file}`);
        expect(diagnostics(consoleWarnSpy, 351)).toHaveLength(0);
    });

    test('checks the theme again when the theme option changes', async () => {
        const api = await createGrid();
        expect(diagnostics(consoleWarnSpy, 351)).toHaveLength(0);

        api.setGridOption('theme', staticCssTheme({ iconSet: 'material' }));

        await waitFor(() => expect(diagnostics(consoleWarnSpy, 351)).toHaveLength(1));
        expect(String(diagnostics(consoleWarnSpy, 351)[0][1])).toContain('icon-set-material.css');
    });

    test('warns about unknown options and values', async () => {
        // @ts-expect-error - JavaScript callers can pass values that the types reject
        const theme = staticCssTheme({ defaults: 'quarts', iconSet: 'quartzlight', tabstyle: 'material' });

        await createGrid({ theme });

        const messages = diagnostics(consoleWarnSpy, 353).map((call) => String(call[1]));
        expect(messages).toEqual([
            expect.stringContaining('unknown `defaults`: `quarts`'),
            expect.stringContaining('unknown `iconSet`: `quartzlight`'),
            expect.stringContaining('unknown option: `tabstyle`'),
        ]);
    });

    test('rejects an object that was not created by staticCssTheme', async () => {
        // @ts-expect-error - the type is branded so only staticCssTheme can create one
        await createGrid({ theme: { options: {} } });

        expect(diagnostics(consoleErrorSpy, 240)).toHaveLength(1);
        expect(gridStyledRoot()).toBeNull();
    });

    test('warns that style injection options have no effect', async () => {
        await createGrid({ styleNonce: 'abc', themeCssLayer: 'grid' });

        const warnings = diagnostics(consoleWarnSpy, 352);
        expect(warnings).toHaveLength(1);
        expect(String(warnings[0][1])).toContain('`styleNonce`, `themeCssLayer`');
    });

    test('theme: legacy logs a deprecation warning pointing to staticCssTheme', async () => {
        await createGrid({ theme: 'legacy' });

        const warnings = diagnostics(consoleWarnSpy, 306);
        expect(warnings).toHaveLength(1);
        expect(String(warnings[0][1])).toContain('`staticCssTheme`');
    });
});
