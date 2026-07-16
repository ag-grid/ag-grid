import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // groupDefaultExpanded: 1 expands only the first level (country) groups,
        // leaving the second level (year) groups collapsed.
        const usId = 'row-group-country-United States';
        const us2008Id = 'row-group-country-United States-year-2008';

        // First-level country group is expanded by default
        await expect(agIdFor.autoGroupExpanded(usId)).toBeVisible();

        // Second-level year group is visible (parent open) but itself collapsed
        await expect(agIdFor.autoGroupContracted(us2008Id)).toBeVisible();
    });
});
