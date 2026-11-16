import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const dispatchTouch = (target: Locator, type: 'touchstart' | 'touchend') =>
    target.evaluate((element, type) => {
        const touch = { identifier: 1, target: element, clientX: 10, clientY: 50 };
        const event = new Event(type, { bubbles: true, composed: true, cancelable: true });
        const touches = type === 'touchstart' ? [touch] : [];
        Object.defineProperties(event, {
            touches: { value: touches },
            targetTouches: { value: touches },
            changedTouches: { value: [touch] },
        });
        element.dispatchEvent(event);
        return event.defaultPrevented;
    }, type);

test('the default tooltip accepts the pointer across the gap and dismisses on Escape', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        options: () => ({
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'First tooltip' }, { value: 'Second tooltip' }, { value: 'Third tooltip' }],
            tooltipShowDelay: 0,
        }),
    });
    await page.evaluate(() => {
        const button = document.createElement('button');
        button.textContent = 'Outside';
        document.body.appendChild(button);
        button.focus();
    });
    const sourceBox = (await cell(0, 'value').boundingBox())!;
    await cell(0, 'value').hover({ position: { x: 30, y: sourceBox.height - 2 } });
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('First tooltip');
    const box = (await tooltip.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    // Past the leave delay: pointer events must hit the tooltip, not the underlying row.
    await page.waitForTimeout(200);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('First tooltip');
    await expect(tooltip).not.toBeFocused();
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Outside' })).toBeFocused();
});

test('focus tooltips survive keyboard scrolling into view', async ({ page }) => {
    const { cell, withApi } = await mountGrid(page, {
        width: 400,
        height: 210,
        options: () => ({
            columnDefs: ['a', 'b', 'c', 'd'].map((field) => ({ field, tooltip: true, width: 180 })),
            rowData: Array.from({ length: 30 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}`, d: `d${i}` })),
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 100,
        }),
    });
    await cell(0, 'a').focus();
    await expect(page.getByRole('tooltip')).toHaveText('a0');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(cell(0, 'c')).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText('c0');
    for (let i = 0; i < 4; i++) {
        await page.keyboard.press('ArrowDown');
    }
    await expect(cell(4, 'c')).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText('c4');

    await cell(3, 'c').focus();
    await withApi((api) => api.ensureIndexVisible(10, 'top'));
    await expect(cell(3, 'c')).toBeFocused();
    // Past the show delay: a still-focused cell outside the viewport must not open a tooltip.
    await page.waitForTimeout(200);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('a shadow-root grid opens its cell menu once and suppresses the later native menu', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        enterprise: true,
        shadowDom: true,
        options: () => ({
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'First' }],
            getContextMenuItems: ({ column, value }) => [{ name: `${column?.getColId()}: ${value}` }],
        }),
    });
    const source = cell(0, 'value');
    await dispatchTouch(source, 'touchstart');
    await expect(page.getByRole('menuitem', { name: 'value: First' })).toBeVisible();
    await source.dispatchEvent('contextmenu');
    await expect(page.locator('.ag-menu')).toHaveCount(1);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    expect(await dispatchTouch(source, 'touchend')).toBe(true);
});

test('interactive tooltips support native Tab navigation and restore source focus on Escape', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        options: () => {
            class Tooltip {
                private readonly gui = document.createElement('div');
                init() {
                    this.gui.innerHTML = '<input aria-label="Tooltip value"><button tabindex="0">Apply</button>';
                }
                getGui() {
                    return this.gui;
                }
            }
            return {
                columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: Tooltip }],
                rowData: [{ value: 'First tooltip' }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipInteraction: true,
                tooltipShowDelay: 0,
            };
        },
    });
    const source = cell(0, 'value');
    await source.focus();
    await expect(page.getByRole('dialog', { name: 'Tooltip' })).toBeVisible();
    await expect(source).toHaveAccessibleDescription('First tooltip');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Tooltip value' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('textbox', { name: 'Tooltip value' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(source).toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Tooltip' })).toHaveCount(0);
});

test('focus descriptions resolve inside a shadow root before visual display', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        shadowDom: true,
        options: () => ({
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'Shadow tooltip' }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 2000,
        }),
    });
    await cell(0, 'value').focus();
    await expect(cell(0, 'value')).toHaveAccessibleDescription('Shadow tooltip');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('long press resolves a tooltip inside Shadow DOM after the touch event finishes dispatching', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        shadowDom: true,
        options: () => ({
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'Shadow tooltip' }],
            suppressContextMenu: true,
        }),
    });
    await dispatchTouch(cell(0, 'value'), 'touchstart');
    await expect(page.getByRole('tooltip')).toHaveText('Shadow tooltip');
});

for (const header of [false, true]) {
    for (const nativeFirst of [false, true]) {
        test(`${header ? 'header' : 'cell'} long press opens one menu (native contextmenu first: ${nativeFirst})`, async ({
            page,
        }) => {
            const { cell, headerCell, withApi } = await mountGrid(page, {
                enterprise: true,
                options: () => ({
                    columnDefs: [{ field: 'value', tooltip: true, headerTooltip: true }],
                    rowData: [{ value: 'First' }],
                    context: { opened: 0 },
                    tooltipShowDelay: 0,
                    getContextMenuItems: () => [{ name: 'Action' }],
                    onContextMenuVisibleChanged: (event) => {
                        if (event.visible) {
                            event.context.opened++;
                        }
                    },
                    onColumnMenuVisibleChanged: (event) => {
                        if (event.visible) {
                            event.context.opened++;
                        }
                    },
                }),
            });
            const source = header ? headerCell('value').locator('.ag-header-cell-text') : cell(0, 'value');
            await dispatchTouch(source, 'touchstart');
            if (!nativeFirst) {
                await expect(page.locator('.ag-menu')).toBeVisible();
            }
            await source.dispatchEvent('contextmenu');
            await expect(page.locator('.ag-menu')).toBeVisible();
            // Observe past the long-press threshold, including when the native menu opened first.
            await page.waitForTimeout(600);
            await expect(page.locator('.ag-menu')).toHaveCount(1);
            await expect(page.getByRole('tooltip')).toHaveCount(0);
            expect(await withApi((api) => api.getGridOption('context').opened)).toBe(1);
            expect(await dispatchTouch(source, 'touchend')).toBe(true);
        });
    }
}

test('Escape dismisses a validation tooltip without cancelling editing', async ({ page }) => {
    const { cell, withApi } = await mountGrid(page, {
        options: () => ({
            columnDefs: [
                {
                    field: 'value',
                    editable: true,
                    tooltip: true,
                    cellEditorParams: { getValidationErrors: () => ['Invalid value'] },
                },
            ],
            rowData: [{ value: 'First' }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 0,
            invalidEditValueMode: 'block',
        }),
    });
    await cell(0, 'value').dblclick();
    await page.keyboard.press('Enter');
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toContainText('Invalid value');
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    expect(await withApi((api) => api.getEditingCells().length)).toBe(1);
});
