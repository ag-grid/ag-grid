import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GridOptions } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

/** The selectors claude.ai's inline visualiser uses to style every input and button on the page. */
const CLAUDE_VISUALISER_CSS = `
    input:not([type='range']):not([type='checkbox']):not([type='radio']):not(form.elicit *),
    select:not(form.elicit *),
    textarea:not(form.elicit *) {
        width: 100%;
        height: 36px;
        padding: 8px 12px;
        font-size: 16px;
        border: 0.5px solid gray;
    }
    button:not(#action-btns button, :where(#vis-container ~ #larger-btns) button):not(form.elicit button) {
        padding: 8px 16px;
        font-size: 14px;
        border: 0.5px solid gray;
    }
`;

const options = (): GridOptions => ({
    columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', floatingFilter: true }],
    rowData: [{ country: 'France' }, { country: 'Spain' }],
});

async function measureControls(page: Page) {
    const read = (selector: string) =>
        page
            .locator(selector)
            .first()
            .evaluate((el) => {
                const { height, width } = el.getBoundingClientRect();
                const { padding, fontSize, borderTopWidth } = getComputedStyle(el);
                return { height, width, padding, fontSize, borderTopWidth };
            });
    const floatingFilterInput = await read('.ag-floating-filter-input input');
    const floatingFilterButton = await read('.ag-floating-filter-button-button');
    await page.evaluate(() => window.gridApi.showColumnFilter('country'));
    const miniFilterInput = await read('.ag-mini-filter input');
    return { floatingFilterInput, floatingFilterButton, miniFilterInput };
}

const isInShadowRoot = (page: Page) =>
    page.locator('#myGrid .ag-root-wrapper').evaluate((el) => el.getRootNode() instanceof ShadowRoot);

test.describe('host style isolation', () => {
    test('inside the claude.ai visualiser, the grid renders in a shadow root its input and button rules cannot reach', async ({
        page,
    }) => {
        await mountGrid(page, { enterprise: true, options });
        const expected = await measureControls(page);

        await mountGrid(page, { enterprise: true, wrapperId: 'vis-container', css: CLAUDE_VISUALISER_CSS, options });
        expect(await isInShadowRoot(page)).toBe(true);
        expect(await measureControls(page)).toEqual(expected);
    });

    test('inside the claude.ai visualiser, the container can be looked up and is left empty once the grid is destroyed', async ({
        page,
    }) => {
        await mountGrid(page, {
            enterprise: true,
            wrapperId: 'vis-container',
            css: CLAUDE_VISUALISER_CSS,
            options: () => ({
                gridId: 'visualised',
                columnDefs: [{ field: 'country' }],
                rowData: [{ country: 'France' }],
            }),
        });
        const lookups = await page.evaluate(() => {
            const { getGridApi } = (window as any).agGrid;
            return [getGridApi('#myGrid'), getGridApi('visualised')].map((api) => api === window.gridApi);
        });
        expect(lookups).toEqual([true, true]);

        // The grid element stays the grid's own root, so callers can still search its content.
        const gridElement = await page.evaluate(() => {
            const { getGridApi } = (window as any).agGrid;
            const element = window.gridApi.getGridElement()!;
            return {
                inShadowRoot: element.getRootNode() instanceof ShadowRoot,
                hasRows: element.querySelector('.ag-row') != null,
                mapsBackToApi: getGridApi(element) === window.gridApi,
            };
        });
        expect(gridElement).toEqual({ inShadowRoot: true, hasRows: true, mapsBackToApi: true });

        await page.evaluate(() => window.gridApi.destroy());
        expect(await page.locator('#myGrid').evaluate((el) => el.childNodes.length)).toBe(0);
    });

    const stylesOutsideGrid: [name: string, className: string, options: () => GridOptions][] = [
        ['a legacy theme', 'ag-theme-quartz', () => ({ theme: 'legacy' })],
        ['an explicit theme style container', '', () => ({ themeStyleContainer: document.body })],
        ['an external popup parent', '', () => ({ popupParent: document.body })],
        ['an external chart container', '', () => ({ createChartContainer: () => {} })],
    ];
    for (const [name, className, gridOptions] of stylesOutsideGrid) {
        test(`inside the claude.ai visualiser, a grid with ${name} stays in the light DOM so its styles still apply`, async ({
            page,
        }) => {
            await mountGrid(page, {
                enterprise: true,
                wrapperId: 'vis-container',
                className,
                css: CLAUDE_VISUALISER_CSS,
                options: gridOptions,
            });
            expect(await isInShadowRoot(page)).toBe(false);
        });
    }

    test('outside the visualiser container, the same rules still reach a grid in the light DOM', async ({ page }) => {
        await mountGrid(page, { enterprise: true, options });
        const unstyled = await measureControls(page);

        await mountGrid(page, { enterprise: true, css: CLAUDE_VISUALISER_CSS, options });
        expect(await isInShadowRoot(page)).toBe(false);
        expect(await measureControls(page)).not.toEqual(unstyled);
    });

    test('in a shadow root, the grid follows the theme mode set on the page', async ({ page }) => {
        const readBackground = () =>
            page.locator('#myGrid .ag-root-wrapper').evaluate((el) => getComputedStyle(el).backgroundColor);
        const setThemeMode = (mode: string | null) =>
            page.evaluate((mode) => {
                if (mode == null) {
                    delete document.documentElement.dataset.agThemeMode;
                } else {
                    document.documentElement.dataset.agThemeMode = mode;
                }
            }, mode);

        await mountGrid(page, { enterprise: true, options });
        const light = await readBackground();
        await setThemeMode('dark');
        const dark = await readBackground();
        expect(dark).not.toEqual(light);

        await mountGrid(page, { enterprise: true, wrapperId: 'vis-container', css: CLAUDE_VISUALISER_CSS, options });
        expect(await isInShadowRoot(page)).toBe(true);
        await setThemeMode('dark');
        expect(await readBackground()).toEqual(dark);
        await setThemeMode(null);
        expect(await readBackground()).toEqual(light);

        await page.evaluate(() => {
            const ancestor = document.getElementById('vis-container')!;
            ancestor.classList.add('ag-theme-mode');
            ancestor.dataset.agThemeMode = 'dark';
        });
        expect(await readBackground()).toEqual(dark);
    });

    test('inside the claude.ai visualiser, enableShadowDom: false keeps the grid in the light DOM', async ({
        page,
    }) => {
        await mountGrid(page, {
            enterprise: true,
            wrapperId: 'vis-container',
            css: CLAUDE_VISUALISER_CSS,
            options: () => ({ enableShadowDom: false, columnDefs: [{ field: 'country' }], rowData: [] }),
        });
        expect(await isInShadowRoot(page)).toBe(false);
    });

    test('on any page, enableShadowDom: true renders the grid in a shadow root the page rules cannot reach', async ({
        page,
    }) => {
        await mountGrid(page, { enterprise: true, options });
        const expected = await measureControls(page);

        await mountGrid(page, {
            enterprise: true,
            css: CLAUDE_VISUALISER_CSS,
            options: () => ({
                enableShadowDom: true,
                columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', floatingFilter: true }],
                rowData: [{ country: 'France' }, { country: 'Spain' }],
            }),
        });
        expect(await isInShadowRoot(page)).toBe(true);
        expect(await measureControls(page)).toEqual(expected);
    });
});
