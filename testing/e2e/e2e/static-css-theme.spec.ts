import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import type * as AgGrid from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

const CSS_DIR = path.join(__dirname, '../../../packages/ag-grid-community/css');

const readCss = (file: string) => {
    const cssPath = path.join(CSS_DIR, file);
    if (!fs.existsSync(cssPath)) {
        throw new Error(`${cssPath} not found, run "nx run ag-grid-community:build:static-css"`);
    }
    return fs.readFileSync(cssPath, 'utf8');
};

interface Rendered {
    params: Record<string, string>;
    styles: Record<string, string>;
}

/**
 * Computed theme params and a sample of rendered styles, which must match between Theming API and static CSS themes.
 * Custom property values keep the whitespace and case they were written with, which differ between the generated and
 * injected CSS, so they are normalised before comparing.
 */
const readRendered = (page: Page): Promise<Rendered> =>
    page.evaluate(() => {
        const normaliseSpace = (value: string) =>
            value
                .replace(/\s+/g, ' ')
                .replace(/\s*([(),])\s*/g, '$1')
                .trim()
                .toLowerCase();
        const root = document.querySelector('#myGrid .ag-root-wrapper')!;
        const rootStyle = getComputedStyle(root);
        const params: Record<string, string> = {};
        for (let i = 0; i < rootStyle.length; ++i) {
            const name = rootStyle[i];
            if (name.startsWith('--ag-') && !/^--ag-(inherited|internal)-/.test(name)) {
                params[name] = normaliseSpace(rootStyle.getPropertyValue(name));
            }
        }
        const samples: [string, string, string[]][] = [
            ['.ag-root-wrapper', '', ['background-color', 'color', 'font-family', 'border-top-color']],
            ['.ag-header', '', ['background-color', 'height']],
            ['.ag-header-cell-menu-button .ag-icon', '::before', ['mask-image']],
            ['.ag-row', '', ['background-color', 'height']],
            ['.ag-cell', '', ['color', 'padding-left']],
            ['.ag-checkbox-input-wrapper', '', ['background-color', 'border-top-color', 'border-radius']],
            ['.ag-input-field-input', '', ['border-bottom-color', 'border-top-width', 'box-shadow']],
        ];
        const styles: Record<string, string> = {};
        for (const [selector, pseudo, properties] of samples) {
            const el = document.querySelector(`#myGrid ${selector}`);
            const style = el ? getComputedStyle(el, pseudo || null) : null;
            for (const property of properties) {
                styles[`${selector}${pseudo} ${property}`] = style?.getPropertyValue(property) ?? 'missing';
            }
        }
        return { params, styles };
    });

interface ParityCase {
    name: string;
    /** Builds the Theming API theme. It is serialised and run in the page, so it can't reference this file's variables. */
    theme: () => AgGrid.Theme;
    /** Builds the equivalent static CSS theme, serialised in the same way. */
    staticCss: () => AgGrid.StaticCssTheme;
    /** The icon set file to load, if the theme doesn't use the icon set built into `ag-grid.css`. */
    iconSetFile?: string;
    darkMode?: boolean;
    /** Application CSS for the static CSS grid, equivalent to params set in `theme`. */
    css?: string;
}

const CASES: ParityCase[] = [
    {
        name: 'Quartz',
        theme: () => window.agGrid.themeQuartz,
        staticCss: () => window.agGrid.staticCssTheme(),
    },
    {
        name: 'Quartz with Material tabs, icons and underlined inputs, and a dark colour scheme',
        theme: () =>
            window.agGrid.themeQuartz
                .withPart(window.agGrid.tabStyleMaterial)
                .withPart(window.agGrid.iconSetMaterial)
                .withPart(window.agGrid.inputStyleUnderlined)
                .withPart(window.agGrid.colorSchemeDark),
        staticCss: () =>
            window.agGrid.staticCssTheme({
                tabStyle: 'material',
                iconSet: 'material',
                inputStyle: 'underlined',
                colorScheme: 'dark',
            }),
        iconSetFile: 'icon-set-material.css',
    },
    {
        name: 'Alpine defaults',
        theme: () => window.agGrid.themeAlpine,
        staticCss: () => window.agGrid.staticCssTheme({ defaults: 'alpine' }),
        iconSetFile: 'icon-set-alpine.css',
    },
    {
        name: 'Material defaults',
        theme: () => window.agGrid.themeMaterial,
        staticCss: () => window.agGrid.staticCssTheme({ defaults: 'material' }),
        iconSetFile: 'icon-set-material.css',
    },
    {
        name: 'Balham defaults in dark mode',
        theme: () => window.agGrid.themeBalham,
        staticCss: () => window.agGrid.staticCssTheme({ defaults: 'balham' }),
        iconSetFile: 'icon-set-balham.css',
        darkMode: true,
    },
    {
        name: 'Quartz with params set on an ancestor',
        theme: () => window.agGrid.themeQuartz.withParams({ accentColor: 'red', spacing: 6 }),
        staticCss: () => window.agGrid.staticCssTheme(),
        css: 'body { --ag-accent-color: red; --ag-spacing: 6px; }',
    },
];

/** Grid options source shared by both grids, with the theme expression spliced in. */
const optionsFor = (themeSource: string, darkMode = false): (() => AgGrid.GridOptions) =>
    new Function(`return () => {
        ${darkMode ? "document.body.dataset.agThemeMode = 'dark';" : ''}
        return {
            theme: ${themeSource},
            columnDefs: [{ field: 'make', filter: true, floatingFilter: true }],
            rowData: [{ make: 'Tesla' }],
            rowSelection: { mode: 'multiRow' },
        };
    }`)();

for (const { name, theme, staticCss, iconSetFile, darkMode, css } of CASES) {
    test(`static CSS theme matches the Theming API: ${name}`, async ({ page }) => {
        await mountGrid(page, { options: optionsFor(`(${theme.toString()})()`, darkMode) });
        const expected = await readRendered(page);

        await mountGrid(page, {
            css: [readCss('ag-grid.css'), iconSetFile ? readCss(iconSetFile) : '', css ?? ''].join('\n'),
            options: optionsFor(`(${staticCss.toString()})()`, darkMode),
        });
        const actual = await readRendered(page);

        expect(actual.styles).toEqual(expected.styles);
        expect(actual.params).toEqual(expected.params);
        expect(await page.locator('style[data-ag-css]').count()).toBe(0);
    });
}

test('linked images load from files beside the CSS, with a CSP that blocks data URLs', async ({ page }) => {
    const origin = 'http://static-css.test';
    await page.route(`${origin}/**`, (route) => {
        const { pathname } = new URL(route.request().url());
        return pathname.startsWith('/css/')
            ? route.fulfill({ path: path.join(CSS_DIR, pathname.slice('/css/'.length)) })
            : route.fulfill({ contentType: 'text/html', headers: { 'Content-Security-Policy': "img-src 'self'" } });
    });
    const failed: string[] = [];
    page.on('response', (response) => {
        if (!response.ok()) {
            failed.push(response.url());
        }
    });
    const cspViolations: string[] = [];
    page.on('console', (message) => {
        if (/content.security.policy/i.test(message.text())) {
            cspViolations.push(message.text());
        }
    });
    // the page is in a different directory to the CSS, so the images only load if their URLs resolve against the CSS file
    await page.goto(`${origin}/app/`);
    const { withApi } = await mountGrid(page, {
        options: () => ({
            theme: window.agGrid.staticCssTheme({ useLinkedImages: true }),
            columnDefs: [{ field: 'make' }],
            rowData: [{ make: 'Tesla' }],
            rowSelection: { mode: 'multiRow' },
            pagination: true,
        }),
    });
    const checkboxImage = page.waitForResponse(
        `${origin}/css/ag-grid-files/core-images/checkbox-checked-shape-image.svg`
    );
    const icon = page.waitForResponse((response) =>
        response.url().startsWith(`${origin}/css/ag-grid-files/icon-set-quartz-regular/`)
    );
    for (const file of ['ag-grid-linked.css', 'icon-set-quartz-regular-linked.css']) {
        await page.addStyleTag({ url: `${origin}/css/${file}` });
    }
    await withApi((api) => api.selectAll());

    expect((await checkboxImage).ok()).toBe(true);
    expect((await icon).ok()).toBe(true);
    expect(failed).toEqual([]);
    expect(cspViolations).toEqual([]);
});
