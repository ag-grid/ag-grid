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

        await page.evaluate(() => window.gridApi.destroy());
        expect(await page.locator('#myGrid').evaluate((el) => el.childNodes.length)).toBe(0);
    });

    const stylesOutsideGrid: [name: string, className: string, options: () => GridOptions][] = [
        ['a legacy theme', 'ag-theme-quartz', () => ({ theme: 'legacy' })],
        ['an explicit theme style container', '', () => ({ themeStyleContainer: document.body })],
        ['an external popup parent', '', () => ({ popupParent: document.body })],
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
});
