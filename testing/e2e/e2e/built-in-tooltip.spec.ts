import { expect, test } from '@playwright/test';

import type { IBuiltInTooltipParams } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

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
        await expect(tooltip).toHaveText('Column Menu');
        await header.locator('.ag-header-cell-text').hover();
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toHaveText('Column description');
        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);
        await page.mouse.move(500, 250);
        await header.locator('.ag-header-cell-menu-button').hover();
        await expect(tooltip).toHaveText('Column Menu');
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
        await expect(tooltip).toHaveText('Next Page');
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
        await expect(tooltip).toHaveText('Next Page');
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
