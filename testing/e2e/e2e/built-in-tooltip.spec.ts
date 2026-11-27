import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import type { IBuiltInTooltipParams } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

async function expectSideBarTooltips(page: Page, grid: Locator, side: 'left' | 'right') {
    for (const name of ['Columns', 'Filters']) {
        const button = grid.getByRole('tab', { name, exact: true });
        await button.hover();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText(`Configure ${name.toLowerCase()}`);
        await expect(async () => {
            const target = (await button.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            if (side === 'left') {
                expect(popup.x + popup.width).toBeLessThan(target.x);
            } else {
                expect(popup.x).toBeGreaterThan(target.x + target.width);
            }
            expect(popup.y + popup.height / 2).toBeCloseTo(target.y + target.height / 2, 0);
        }).toPass();
    }
    await page.keyboard.press('Escape');
}

test('sidebar hints face the grid and allow moving between labelled and icon-only tabs', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'One' }],
            sideBar: true,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    for (const iconOnly of [false, true]) {
        if (iconOnly) {
            await page.addStyleTag({ content: '.ag-side-button-label { display: none; }' });
        }
        await withApi((api) => api.setSideBarPosition('right'));
        await expectSideBarTooltips(page, grid, 'left');
        await withApi((api) => api.closeToolPanel());
        await withApi((api) => api.setSideBarPosition('left'));
        await expectSideBarTooltips(page, grid, 'right');
        await withApi((api) => api.openToolPanel('columns'));
    }
});

test('sidebar hints follow the visual side in RTL', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'One' }],
            sideBar: true,
            enableRtl: true,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    await expectSideBarTooltips(page, grid, 'right');
    await withApi((api) => api.setSideBarPosition('left'));
    await expectSideBarTooltips(page, grid, 'left');
});

test('sidebar hints respect restored position, focus persistence and placement callbacks', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'One' }],
            sideBar: true,
            initialState: { sideBar: { visible: true, position: 'left', openToolPanel: 'columns', toolPanels: {} } },
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            tooltipPosition: () => undefined,
        }),
    });
    await expectSideBarTooltips(page, grid, 'right');
    const columns = grid.getByRole('tab', { name: 'Columns', exact: true });
    await columns.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Configure columns');
    const search = grid.getByRole('textbox', { name: 'Filter Columns Input' });
    const searchBounds = (await search.boundingBox())!;
    await search.hover({ position: { x: searchBounds.width - 4, y: searchBounds.height / 2 } });
    await expect(columns).toBeFocused();
    await expect(tooltip).toHaveText('Configure columns');
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await withApi((api) =>
        api.setGridOption('tooltipPosition', ({ control }) => (control === 'toolPanel' ? 'right-end' : undefined))
    );
    await columns.hover();
    await expect(tooltip).toHaveClass(/ag-tooltip-position-right-end/);
});

test('short control hints stay on one line at the right edge of the grid', async ({ page }) => {
    const { grid, headerCell } = await mountGrid(page, {
        enterprise: true,
        width: 650,
        options: () => ({
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { flex: 1 },
            rowData: [
                { athlete: 'One', country: 'UK' },
                { athlete: 'Two', country: 'US' },
            ],
            pagination: true,
            paginationPageSize: 1,
            paginationPageSizeSelector: false,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    for (const control of [
        grid.getByRole('button', { name: 'Last Page', exact: true }),
        headerCell('country').locator('.ag-header-cell-menu-button'),
    ]) {
        await control.hover();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toBeVisible();
        await expect(async () => {
            const lines = await tooltip.evaluate((element) => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return new Set(Array.from(range.getClientRects(), (rect) => rect.top)).size;
            });
            expect(lines).toBe(1);
            const popup = (await tooltip.boundingBox())!;
            const bounds = (await grid.boundingBox())!;
            expect(popup.x).toBeGreaterThanOrEqual(bounds.x);
            expect(popup.x + popup.width).toBeLessThanOrEqual(bounds.x + bounds.width);
        }).toPass({ timeout: 3000 });
        await page.keyboard.press('Escape');
    }
});

test('Advanced Filter add buttons retain their hints over the nested picker', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'country', filter: true }],
            rowData: [{ country: 'UK' }],
            enableAdvancedFilter: true,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    await withApi((api) => {
        api.setAdvancedFilterModel({
            filterType: 'join',
            type: 'AND',
            conditions: [{ filterType: 'text', colId: 'country', type: 'equals', filter: 'UK' }],
        });
        api.showAdvancedFilterBuilder();
    });
    const buttons = grid.getByRole('combobox', { name: 'Add Filter or Group', exact: true });
    await expect(buttons).toHaveCount(2);
    for (const button of await buttons.all()) {
        await button.hover();
        await expect(page.getByRole('tooltip')).toHaveText('Add Filter or Group');
        await page.keyboard.press('Escape');
    }
});

test('the Close tooltip does not move focus out of an always-on-top dialog', async ({ page }) => {
    const { withApi, headerCell } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'athlete', headerNameEditable: true }],
            rowData: [{ athlete: 'Michael Phelps' }],
            columnHeaderEdit: { applyMode: 'deferred' },
        }),
    });
    await withApi((api) => api.showColumnMenu('athlete'));
    await page.getByRole('menuitem', { name: 'Edit Column Name' }).click();
    const input = page.getByRole('textbox', { name: 'Column Name Editor' });
    await input.fill('Competitor');
    const close = page.getByRole('button', { name: 'Close', exact: true });
    await close.focus();
    await expect(page.getByRole('tooltip')).toHaveText('Close');
    await expect(close).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(input).toHaveCount(0);
    await expect(headerCell('athlete')).toContainText('Athlete');
});

for (const focused of [false, true]) {
    test(`direct entry to a nested header control, handover and Escape (header focused: ${focused})`, async ({
        page,
    }) => {
        const { headerCell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'value', headerTooltip: 'Column description', width: 350 }],
                rowData: [{ value: 'One' }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            }),
        });
        const header = headerCell('value');
        const tooltip = page.getByRole('tooltip');
        if (focused) {
            await header.focus();
            await expect(tooltip).toHaveText('Column description');
        }
        await page.mouse.move(500, 250);
        await header.locator('.ag-header-cell-menu-button').hover();
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toHaveText('Open column menu');
        await header.locator('.ag-header-cell-text').hover();
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toHaveText('Column description');
        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);
        await page.mouse.move(500, 250);
        await header.locator('.ag-header-cell-menu-button').hover();
        await expect(tooltip).toHaveText('Open column menu');
        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);
    });
}

for (const custom of [false, true]) {
    test(`${custom ? 'custom' : 'default'} built-in tooltips stay target-anchored with arrows despite pointer tracking`, async ({
        page,
    }) => {
        const { grid, withApi } = await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'One' }, { value: 'Two' }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                tooltipMouseTrack: true,
                tooltipAnchor: 'pointer',
                popupParent: document.body,
            }),
        });
        if (custom) {
            await withApi((api) =>
                api.setGridOption(
                    'builtInTooltipComponent',
                    class {
                        private readonly gui = document.createElement('div');
                        init(params: IBuiltInTooltipParams): void {
                            this.gui.textContent = params.text;
                        }
                        getGui(): HTMLElement {
                            return this.gui;
                        }
                    }
                )
            );
        }
        const next = grid.getByRole('button', { name: 'Next Page' });
        const tooltip = page.getByRole('tooltip');
        await next.hover({ position: { x: 2, y: 2 } });
        await expect(tooltip).toHaveText('Go to next page');
        const arrow = await tooltip.evaluate((element) => {
            const style = getComputedStyle(element, '::after');
            return { content: style.content, width: parseFloat(style.width), height: parseFloat(style.height) };
        });
        expect(arrow.content).not.toBe('none');
        expect(arrow.width).toBeGreaterThan(0);
        expect(arrow.height).toBeGreaterThan(0);
        const expectAboveTarget = async () => {
            await expect(async () => {
                const source = (await next.boundingBox())!;
                const popup = (await tooltip.boundingBox())!;
                expect(popup.y + popup.height).toBeLessThan(source.y);
                expect(popup.x + popup.width / 2).toBeCloseTo(source.x + source.width / 2, 0);
            }).toPass();
        };
        await expectAboveTarget();
        const source = (await next.boundingBox())!;
        await next.hover({ position: { x: source.width - 2, y: source.height - 2 } });
        await expectAboveTarget();

        await page.mouse.move(500, 250);
        await expect(tooltip).toHaveCount(0);
        await withApi((api) =>
            api.setGridOption('tooltipPosition', ({ control }) => (control === 'nextPage' ? 'bottom' : undefined))
        );
        await next.hover();
        await expect(tooltip).toHaveText('Go to next page');
        await expect(async () => {
            const source = (await next.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.y).toBeGreaterThan(source.y + source.height);
        }).toPass();
    });
}

test('floating filter value tooltips follow actual input truncation and edits', async ({ page }) => {
    const { grid } = await mountGrid(page, {
        options: () => ({
            columnDefs: [{ field: 'value', filter: 'agTextColumnFilter', floatingFilter: true, width: 180 }],
            rowData: [{ value: 'A long filter value that cannot fit in the floating filter input' }],
            tooltipTrigger: 'hover',
            tooltipShowDelay: 10000,
        }),
    });
    const input = grid.locator('.ag-floating-filter-input input');
    const tooltip = page.getByRole('tooltip');
    const value = 'A long filter value that cannot fit in the floating filter input';
    await input.fill(value);
    expect(await input.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    await input.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(input).toBeFocused();
    await expect(tooltip).toHaveText(value);

    await input.fill('A');
    expect(await input.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
    await expect(tooltip).toHaveCount(0);
    await page.clock.install();
    await input.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(input).toBeFocused();
    await page.clock.runFor(1);
    await expect(tooltip).toHaveCount(0);
});
