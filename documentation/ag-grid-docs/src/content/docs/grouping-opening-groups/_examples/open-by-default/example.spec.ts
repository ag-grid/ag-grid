import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // isGroupOpenByDefault expands the Australia > 2004 route only.
        const australiaId = 'row-group-country-Australia';
        const australia2004Id = 'row-group-country-Australia-year-2004';
        const usId = 'row-group-country-United States';

        // Australia and its 2004 child are open by default
        await expect(agIdFor.autoGroupExpanded(australiaId)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(australia2004Id)).toBeVisible();

        // Other countries remain collapsed
        await expect(agIdFor.autoGroupContracted(usId)).toBeVisible();
    });
});
