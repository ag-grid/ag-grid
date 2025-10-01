import { ensureGridReady, expect, repeat, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

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
            async ({ page, agIdFor, remoteGrid }) => {
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
                await repeat(page, 'tab to 2nd column', tabAction, { count: 1, eachWait: 10 });

                // here the 2nd, 2nd cell row should be editing
                const modelCellRow2 = agIdFor.cell('2', 'model-1-1');
                const modelEditor2 = modelCellRow2.locator('input');
                await expect(modelEditor2).toBeVisible();
            }
        )
    );

    // AG-15796
    test.eachFramework(
        'should edit then tab to next row and commit the edit',
        async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page);
            await remoteApi.setGridOption('editType', 'fullRow');
            const colDefs = (await remoteApi.getColumnDefs()) as any[];
            await remoteApi.setGridOption('columnDefs', colDefs.slice(0, 3));

            const modelCellRow1 = agIdFor.cell('1', 'model-1-1');
            await modelCellRow1.dblclick();

            const modelEditor1 = modelCellRow1.locator('input');
            await expect(modelEditor1).toBeVisible();
            await expect(modelEditor1).toBeFocused();
            await page.waitForTimeout(10);

            await page.keyboard.type('XYZ');

            const tabAction = async () => await page.keyboard.press('Tab');

            await repeat(page, 'tab to new row', tabAction, { count: 2, eachWait: 10 });

            // here the 2nd, 2nd cell row should be editing
            const modelCellRow2 = agIdFor.cell('1', 'model-1-1');
            await expect(modelCellRow2).toHaveText('XYZ');
        }
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
        await expect(horizontalView).toBeVisible();

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

    // AG-15797
    test.eachFramework(
        'should edit then scroll back and forth without losing editors',
        async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page);
            await remoteApi.setGridOption('editType', 'fullRow');

            const verticalView = page.locator('.ag-body-viewport.ag-row-animation.ag-layout-normal');
            await expect(verticalView).toBeVisible();
            const horizontalView = page.locator('.ag-viewport.ag-center-cols-viewport');
            await expect(horizontalView).toBeVisible();

            const cell = agIdFor.cell('1', 'model-1-1');
            await cell.dblclick();
            const cellEditor = cell.locator('input');
            await expect(cellEditor).toBeVisible();

            const cell1 = agIdFor.cell('1', 'make-0-0');
            await expect(cell1).toBeVisible();
            const cellEditor1 = cell1.getByRole('combobox');
            await expect(cellEditor1).toBeVisible();

            const maxX = 1200;

            await scrollGridRelative('wheel', page, { x: maxX, xStep: 400 });
            await page.waitForTimeout(10);
            await scrollGridRelative('wheel', page, { x: -maxX, xStep: -400 });

            await page.waitForTimeout(10);

            const cell2 = agIdFor.cell('1', 'model-1-1');
            await expect(cell2).toBeVisible();
            const cellEditor2 = cell2.locator('input');
            await expect(cellEditor2).toBeVisible();
            const cell3 = agIdFor.cell('1', 'make-0-0');
            await expect(cell3).toBeVisible();
            const cellEditor3 = cell3.getByRole('combobox');
            await expect(cellEditor3).toBeVisible();
        }
    );
});
