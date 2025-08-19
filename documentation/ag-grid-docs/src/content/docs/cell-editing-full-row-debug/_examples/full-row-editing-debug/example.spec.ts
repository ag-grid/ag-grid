import { ensureGridReady, expect, repeat, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 300, height: 800 });
    });

    // AG-15758
    [
        { editType: 'fullRow', tabCount: 8 },
        { editType: 'singleCell', tabCount: 4 },
    ].forEach(({ editType, tabCount }) =>
        test.eachFramework(
            `[${editType}] should edit then tab to next row without error`,
            async ({ page, agIdFor, remoteGrid, agFramework }) => {
                const isReact = agFramework.startsWith('react');

                const remoteApi = remoteGrid(page);
                await remoteApi.setGridOption('editType', editType);

                const modelCellRow1 = agIdFor.cell('1', 'model-1-1');
                await modelCellRow1.dblclick();

                const modelEditor1 = modelCellRow1.locator('input');
                await expect(modelEditor1).toBeVisible();
                await page.waitForTimeout(10);

                const tabAction = async () => await page.keyboard.press('Tab');

                await repeat(page, 'tab across row', tabAction, { count: tabCount, eachWait: 10 });
                await repeat(page, 'tab to new row', tabAction, { count: 1, eachWait: 10 });
                await repeat(page, 'tab to 2nd column', tabAction, { count: isReact ? 2 : 1, eachWait: 10 });

                // here the 2nd, 2nd cell row should be editing
                const modelCellRow2 = agIdFor.cell('2', 'model-1-1');
                const modelEditor2 = modelCellRow2.locator('input');
                await expect(modelEditor2).toBeVisible();
            }
        )
    );

    // AG-15758
    test.eachFramework('should edit then scroll around without error', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('1', 'model-1-1');
        await cell.dblclick();

        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        const verticalView = page.locator('.ag-body-viewport.ag-row-animation.ag-layout-normal');
        await expect(verticalView).toBeVisible();

        const horizontalView = page.locator('.ag-viewport.ag-center-cols-viewport');
        expect(horizontalView).toBeVisible();

        const maxY = 20_500;
        const maxX = 1200;

        await scrollGridRelative('wheel', page, { y: maxY });
        await expect(agIdFor.cell('500', 'make-0-0')).toBeVisible();
        await expect(agIdFor.cell('500', 'make-0-0')).toHaveText('Porsche');

        await scrollGridRelative('wheel', page, { x: maxX });
        await expect(agIdFor.cell('500', 'field6-5-11')).toBeVisible();
        await expect(agIdFor.cell('500', 'field6-5-11')).toHaveText('Sample 27');

        await scrollGridRelative('wheel', page, { y: -maxY });
        await expect(agIdFor.cell('0', 'field6-5-11')).toBeVisible();
        await expect(agIdFor.cell('0', 'field6-5-11')).toHaveText('Sample 23');

        await scrollGridRelative('wheel', page, { x: -maxX });
        await expect(agIdFor.cell('0', 'make-0-0')).toBeVisible();
        await expect(agIdFor.cell('0', 'make-0-0')).toHaveText('Toyota');

        await page.waitForTimeout(10);

        const cell2 = agIdFor.cell('1', 'model-1-1');
        await expect(cell2).toBeVisible();
        const cellEditor2 = cell2.locator('input');
        await expect(cellEditor2).toBeVisible();
    });
});
