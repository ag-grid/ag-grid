import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

declare global {
    interface Window {
        calculatedColumnPinningRtl: boolean;
    }
}

for (const enableRtl of [false, true]) {
    test(`calculated columns follow their source in every section (RTL: ${enableRtl})`, async ({ page }) => {
        await page.evaluate((rtl) => (window.calculatedColumnPinningRtl = rtl), enableRtl);
        const { headerCell, cell, withApi } = await mountGrid(page, {
            enterprise: true,
            width: 1000,
            options: () => ({
                enableRtl: window.calculatedColumnPinningRtl,
                calculatedColumns: true,
                defaultColDef: { width: 100 },
                columnDefs: [
                    { field: 'leftSource', pinned: 'left' },
                    { field: 'leftNext', pinned: 'left' },
                    { field: 'centerSource' },
                    { field: 'centerNext' },
                    { field: 'rightSource', pinned: 'right' },
                    { field: 'rightNext', pinned: 'right' },
                ],
                rowData: [{ leftSource: 10, rightSource: 20 }],
            }),
        });
        expect(await withApi((api) => api.getGridOption('enableRtl'))).toBe(enableRtl);
        await headerCell('leftSource').hover();
        await headerCell('leftSource').locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Add Calculated Column' }).click();
        await page.keyboard.press('Escape');
        await withApi((api) => api.openAddCalculatedColumnDialog('centerSource'));
        await page.keyboard.press('Escape');
        await withApi((api) => api.openAddCalculatedColumnDialog('rightSource'));
        await page.keyboard.press('Escape');

        expect(await withApi((api) => api.getDisplayedLeftColumns().map((col) => col.getColId()))).toEqual([
            'leftSource',
            'calculated_1',
            'leftNext',
        ]);
        expect(await withApi((api) => api.getDisplayedRightColumns().map((col) => col.getColId()))).toEqual([
            'rightSource',
            'calculated_3',
            'rightNext',
        ]);
        expect(await withApi((api) => api.getDisplayedCenterColumns().map((col) => col.getColId()))).toEqual([
            'centerSource',
            'calculated_2',
            'centerNext',
        ]);
        for (const [sourceId, calculatedId, nextId] of [
            ['leftSource', 'calculated_1', 'leftNext'],
            ['centerSource', 'calculated_2', 'centerNext'],
            ['rightSource', 'calculated_3', 'rightNext'],
        ]) {
            await expect(async () => {
                const source = (await headerCell(sourceId).boundingBox())!;
                const calculated = (await headerCell(calculatedId).boundingBox())!;
                const next = (await headerCell(nextId).boundingBox())!;
                if (enableRtl) {
                    expect(calculated.x).toBeLessThan(source.x);
                    expect(calculated.x).toBeGreaterThan(next.x);
                } else {
                    expect(calculated.x).toBeGreaterThan(source.x);
                    expect(calculated.x).toBeLessThan(next.x);
                }
                const calculatedCell = (await cell(0, calculatedId).boundingBox())!;
                expect(calculatedCell.x).toBeCloseTo(calculated.x, 0);
            }).toPass();
        }
    });
}
