import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('processColDef adds a filter to the user-created calculated column', async ({ agIdFor }) => {
        await expect(agIdFor.headerCell('profit')).toContainText('Profit');
        await expect(agIdFor.cell('0', 'profit')).toContainText('46000');

        // The callback adds a filter to the calculated column only; declared columns have none.
        await expect(agIdFor.headerFilterButton('profit')).toBeVisible();
        await expect(agIdFor.headerFilterButton('product')).toHaveCount(0);
    });
});
