import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom button renders in the button column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'id')).toContainText('1');
        await expect(agIdFor.cell('0', 'customButton')).toContainText('Custom Button');
    });

    test.eachFramework(
        'suppressMouseEventHandling stops the button cell selecting its row',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await page.getByRole('button', { name: 'Enable Row Selection' }).click();

            // Clicking a normal cell selects the row (enableClickSelection)
            await agIdFor.cell('0', 'id').click();
            await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

            // Clicking the button cell is suppressed, so its row is not selected
            await agIdFor.cell('1', 'customButton').click();
            await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-selected/);
        }
    );
});
