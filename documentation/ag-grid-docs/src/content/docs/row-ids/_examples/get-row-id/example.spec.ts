import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        await expect(agIdFor.rowNode('c2')).toBeVisible();

        await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('c2', 'price')).toContainText('32000');
    });
});
