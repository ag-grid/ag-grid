import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic medal data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework(
        'Custom floating filter applies a greater-than filter',
        async ({ agIdFor, page, agFramework }) => {
            // React routes onModelChange through the deprecated setModel(), logging warning #286 — see AG-17785.
            test.fixme(
                agFramework.startsWith('reactFunctionalTs'),
                'AG-17785: React custom floating filter emits #286'
            );

            // Only Michael Phelps (2008) has gold > 7 in the dataset.
            await agIdFor.floatingFilter('gold').locator('input').fill('7');

            await expect(page.locator('.ag-row')).toHaveCount(1);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        }
    );
});
