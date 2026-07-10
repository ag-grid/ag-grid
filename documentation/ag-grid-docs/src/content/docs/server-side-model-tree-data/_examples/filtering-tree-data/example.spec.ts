import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GROUP_COL = 'ag-Grid-AutoColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Tree-list filter narrows the tree to matching branches', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Kathryn Powers is open by default, so her level-1 reports are all visible up front.
        await expect(groupRow('Kathryn Powers')).toBeVisible();
        await expect(groupRow('Addie Meyer')).toBeVisible();
        await expect(groupRow('Mabel Ward')).toBeVisible();

        // Open the employeeName tree-list set filter and search for a single leaf employee.
        await agIdFor.floatingFilterButton(GROUP_COL).click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // Filter values load asynchronously — wait for the root node before searching.
        await expect(setFilter.locator('.ag-set-filter-item').filter({ hasText: 'Kathryn Powers' })).toHaveCount(1);

        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await miniFilter.pressSequentially('Joshua Matthews');
        // The tree list is virtualised: the matched leaf is nested, so only its ancestor branch renders.
        await expect(setFilter.locator('.ag-filter-no-matches')).toBeHidden();

        // Excel mode applies the displayed (matching) values on Enter.
        await miniFilter.focus();
        await page.keyboard.press('Enter');
        await page.keyboard.press('Escape');

        // Only the matching branch (Kathryn Powers -> Addie Meyer -> Troy Walsh -> Joshua Matthews) survives:
        // the ancestor Addie Meyer remains, while her non-matching sibling Mabel Ward is filtered out.
        await expect(groupRow('Kathryn Powers')).toBeVisible();
        await expect(groupRow('Addie Meyer')).toBeVisible();
        await expect(groupRow('Mabel Ward')).toHaveCount(0);
    });
});
