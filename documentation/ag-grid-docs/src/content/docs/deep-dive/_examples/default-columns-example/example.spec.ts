import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the fetched space-mission data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.cell('1', 'company')).toContainText('ESA');
    });

    test.eachFramework('defaultColDef enables filtering on the company column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The company column is only filterable via defaultColDef.filter: true.
        await agIdFor.headerFilterButton('company').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('SpaceX');
        await filterInput.press('Enter');

        // The SpaceX row survives; the ESA row (record 1) is filtered out.
        await expect(agIdFor.cell('0', 'company')).toContainText('SpaceX');
        await expect(agIdFor.rowNode('1')).toHaveCount(0);
    });
});
