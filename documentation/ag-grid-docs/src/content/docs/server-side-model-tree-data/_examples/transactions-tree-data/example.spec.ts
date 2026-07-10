import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Transactions add and delete tree children under the selected node', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Mabel Ward (level 1) is open by default, so her existing children load in and a child added
        // under her renders straight away. Wait for her subtree to load before mutating it, otherwise
        // an SSRM transaction routed to a not-yet-loaded store is a no-op.
        await expect(groupRow('Mabel Ward')).toHaveCount(1);
        await expect(groupRow('Bryan Butler')).toHaveCount(1);
        await expect(groupRow('Bertrand Parker')).toHaveCount(0);

        // Select Mabel Ward and add a child via an add transaction routed to her node. The button
        // reads getSelectedNodes()[0], so wait until the row is actually selected before clicking it.
        await groupRow('Mabel Ward').locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(groupRow('Mabel Ward')).toHaveClass(/ag-row-selected/);
        await page.getByRole('button', { name: 'Add Child to Selected' }).click();
        await expect(groupRow('Bertrand Parker')).toHaveCount(1);
        await expect(groupRow('Bertrand Parker').locator('[col-id="employmentType"]')).toContainText('Permanent');

        // Select the new child and remove it via a delete transaction.
        await groupRow('Bertrand Parker').locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(groupRow('Bertrand Parker')).toHaveClass(/ag-row-selected/);
        await page.getByRole('button', { name: 'Delete Selected' }).click();
        await expect(groupRow('Bertrand Parker')).toHaveCount(0);
        await expect(groupRow('Mabel Ward')).toHaveCount(1);
    });
});
