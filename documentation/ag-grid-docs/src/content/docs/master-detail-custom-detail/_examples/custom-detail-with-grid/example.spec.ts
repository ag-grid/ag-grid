import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom detail cell renderer with grid', async ({ agIdFor, page }) => {
        // Master row at display index 1 (Mila Smith) is expanded on first data rendered.
        await expect(agIdFor.cell('1', 'name')).toContainText('Mila Smith');

        // The custom detail renders master row info plus a nested detail grid.
        const detail = page.locator('.ag-full-width-row');
        await expect(detail).toContainText('Name:');
        await expect(detail).toContainText('Mila Smith');
        await expect(detail).toContainText('Account:');
        await expect(detail).toContainText('177001');

        // The nested detail grid renders its five configured columns.
        const detailGrid = detail.locator('.ag-root-wrapper');
        await expect(detailGrid).toBeVisible();
        for (const colId of ['callId', 'direction', 'number', 'duration', 'switchCode']) {
            await expect(detailGrid.locator(`.ag-header-cell[col-id="${colId}"]`)).toBeVisible();
        }

        // The nested grid is populated from the master row's call records (first callId 579).
        await expect(detailGrid.locator('.ag-cell[col-id="callId"]').first()).toContainText('579');
    });
});
