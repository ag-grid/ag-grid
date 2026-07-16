import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // getRowId uses the account, so row ids are the account numbers.
    const NORA = '177000';
    const MILA = '177001';

    test.eachFramework('Adding a call row makes a non-master row an expanded master', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Nora Thomas has no calls, so is not a master row initially.
        await expect(agIdFor.cell(NORA, 'name')).toContainText('Nora Thomas');
        await expect(agIdFor.cell(NORA, 'name').locator('.ag-cell-expandable')).toHaveCount(0);

        // Only Mila's auto-expanded detail grid is present on load.
        await expect(page.locator('.ag-details-row')).toHaveCount(1);

        // Clicking '+' in Nora's calls cell adds a detail row, makes the row expandable, and expands it.
        await agIdFor.cell(NORA, 'calls').getByRole('button', { name: '+' }).click();
        await expect(agIdFor.cell(NORA, 'name').locator('.ag-cell-expandable')).toBeVisible();
        await expect(agIdFor.groupExpanded(NORA, 'name')).toBeVisible();
        await expect(page.locator('.ag-details-row')).toHaveCount(2);
    });

    test.eachFramework('Removing all calls makes a master row non-expandable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Mila Smith is a master row (auto-expanded) with call records.
        await expect(agIdFor.cell(MILA, 'name')).toContainText('Mila Smith');
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toBeVisible();

        // Read Mila's current call count from the calls cell.
        const callsText = await agIdFor.cell(MILA, 'calls').innerText();
        const callCount = parseInt(callsText.replace(/[^0-9]/g, ''), 10);
        expect(callCount).toBeGreaterThan(0);

        const removeButton = agIdFor.cell(MILA, 'calls').getByRole('button', { name: '-' });
        for (let i = 0; i < callCount; ++i) {
            await removeButton.click();
        }

        // With no call records left, isRowMaster returns false: the row is no longer expandable.
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toHaveCount(0);
        await expect(page.locator('.ag-details-row')).toHaveCount(0);
    });
});
