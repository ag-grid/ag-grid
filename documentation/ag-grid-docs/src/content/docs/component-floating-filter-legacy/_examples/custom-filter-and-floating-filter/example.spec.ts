import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic medal data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Custom floating filter drives the custom filter', async ({ agIdFor, page, agFramework }) => {
        // React routes onModelChange through the deprecated setModel(), logging warning #286 — see AG-17785.
        test.fixme(agFramework.startsWith('reactFunctionalTs'), 'AG-17785: React custom floating filter emits #286');

        // Only the two Michael Phelps rows have total > 7 in the dataset.
        await agIdFor.floatingFilter('total').locator('input').fill('7');

        await expect(page.locator('.ag-row')).toHaveCount(2);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });
});
