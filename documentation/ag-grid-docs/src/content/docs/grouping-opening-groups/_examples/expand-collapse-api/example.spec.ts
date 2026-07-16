import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // onFirstDataRendered calls setRowNodeExpanded(node('2'), true, true), which expands
        // row '2' along with all of its ancestor groups. Row '2' is United States > 2012.
        const usId = 'row-group-country-United States';
        const us2012Id = 'row-group-country-United States-year-2012';

        // Both ancestor groups of row '2' are expanded
        await expect(agIdFor.autoGroupExpanded(usId)).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(us2012Id)).toBeVisible();

        // The leaf row '2' is present within the expanded subtree
        const leafCell = agIdFor.cell('2', 'athlete');
        await leafCell.scrollIntoViewIfNeeded();
        await expect(leafCell).toContainText('Michael Phelps');
    });
});
