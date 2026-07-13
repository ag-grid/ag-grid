import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Set Rows and Update Rows both bump the version on every row', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Rows are loaded from the fake server with the initial version counter (0).
        const topVersion = agIdFor.cell('0', 'version');
        await expect(topVersion).toContainText('0 - 0 - 0');

        // "Set Rows" replaces the data on every node (setData, no flash) — version bumps to 1.
        await page.getByRole('button', { name: 'Set Rows' }).click();
        await expect(topVersion).toContainText('1 - 1 - 1');

        // "Update Rows" applies a transaction on every node (updateData, flashes) — version bumps to 2.
        await page.getByRole('button', { name: 'Update Rows' }).click();
        await expect(topVersion).toContainText('2 - 2 - 2');

        // The update is applied to every loaded row, not just the top one.
        await expect(agIdFor.cell('3', 'version')).toContainText('2 - 2 - 2');
    });
});
