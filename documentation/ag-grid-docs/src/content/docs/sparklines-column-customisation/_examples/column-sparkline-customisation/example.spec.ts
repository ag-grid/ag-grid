import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Loads every row of the hosted data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('[role="grid"][aria-rowcount]')).toHaveAttribute('aria-rowcount', String(500 + 1));
        await expect(agIdFor.cell('0', 'symbol')).toHaveText('A');
        await expect(agIdFor.cell('0', 'name')).toHaveText('Agilent Technologies Inc. Common Stock');
    });
});
