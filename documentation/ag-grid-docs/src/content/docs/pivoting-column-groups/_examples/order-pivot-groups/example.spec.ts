import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'pivotComparator reverses the default alphabetical order of the pivot groups',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // The sport column supplies pivotComparator (b.localeCompare(a)) => reverse alphabetical order,
            // so `Wrestling` (normally last) becomes the leftmost pivot group.
            const wrestlingGroup = agIdFor.headerGroupCell('pivotGroup_sport_Wrestling_0');
            await expect(wrestlingGroup).toBeVisible();
            await expect(wrestlingGroup).toContainText('Wrestling');
            await expect(agIdFor.headerCell('pivot_sport_Wrestling_gold')).toContainText('Gold');

            // `Alpine Skiing` (first alphabetically) is now last, so it is scrolled off-screen and not rendered.
            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toHaveCount(0);

            // The leftmost rendered pivot group is Wrestling, confirming the reversed order.
            await expect(page.locator('.ag-header-group-cell').first()).toContainText('Wrestling');
        }
    );
});
