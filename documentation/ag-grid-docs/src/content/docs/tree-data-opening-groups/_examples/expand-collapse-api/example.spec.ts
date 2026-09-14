import { clickGroupValue, expandGroups, expect, orderedValues, test } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // onGridReady expands the path to 'Proposal.docx' via API
        const groupValues = page.locator('.ag-group-value');

        // Desktop should be expanded (ancestor of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'Desktop' }).first()).toBeVisible();

        // ProjectAlpha should be expanded (parent of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Proposal.docx should be visible (target of expansion)
        await expect(groupValues.filter({ hasText: 'Proposal.docx' }).first()).toBeVisible();
    });

    // The date and number filters each need their own module registered; without it the popup throws on
    // open instead of appearing. The columns name their filters, so every framework gets the same one.
    test.eachFramework('date filters open and filter the tree', async ({ agIdFor, page }) => {
        const groupValues = page.locator('.ag-group-value');

        await agIdFor.headerFilterButton('modified').click();
        await expect(agIdFor.dateFilterInstanceInput({ source: 'column-filter' })).toBeVisible();
        await clickGroupValue(page, 'Documents'); // closes the popup - a surviving group is a stable target

        await agIdFor.headerFilterButton('created').click();
        const createdFilter = agIdFor.dateFilterInstanceInput({ source: 'column-filter' });
        await expect(createdFilter).toBeVisible();

        // Report.pdf, under Documents > Work > ProjectBeta, is the only file created on this date.
        await createdFilter.fill('2023-06-22');
        await createdFilter.dispatchEvent('input');
        await clickGroupValue(page, 'Documents');

        // Desktop holds no match, so its disappearance marks the filter as applied.
        await expect(groupValues.filter({ hasText: 'Desktop' })).toHaveCount(0);
        await expandGroups(page, ['Documents', 'Work', 'ProjectBeta']);

        // Tree data keeps a matching leaf's whole ancestor path, though no group has a `created` of its own.
        // ProjectBeta's other child, Budget.xlsx, is a sibling of the match and so is dropped.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Documents', 'Work', 'ProjectBeta', 'Report.pdf']);
        }).toPass();
    });

    test.eachFramework('the number filter on size filters the tree', async ({ agIdFor, page }) => {
        const groupValues = page.locator('.ag-group-value');

        await agIdFor.headerFilterButton('size').click();
        const sizeFilter = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });
        await expect(sizeFilter).toBeVisible();

        // MeetingNotes_August.pdf is the only row this size, and no group's `sum` aggregation matches it.
        await sizeFilter.fill('460800');
        await sizeFilter.dispatchEvent('input');
        await clickGroupValue(page, 'Desktop');

        await expect(groupValues.filter({ hasText: 'Documents' })).toHaveCount(0);
        await expandGroups(page, ['Desktop']);

        // Desktop's other children, ToDoList.txt among them, are dropped on size.
        await expect(async () => {
            expect(await orderedValues(page, GROUP_COL)).toEqual(['Desktop', 'MeetingNotes_August.pdf']);
        }).toPass();
    });
});
