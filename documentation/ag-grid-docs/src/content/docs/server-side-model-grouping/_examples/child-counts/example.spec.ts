import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('getChildCount renders the child count beside each group name', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top level is grouped by Country. getChildCount surfaces the server 'childCount'
        // which the grid renders as "GroupName (N)" in the auto group column.
        await expect(groupRow('United States')).toContainText(/United States\s*\(\d+\)/, { useInnerText: true });

        // The child-count suffix appears on other country groups too.
        await expect(groupRow('Russia')).toContainText(/Russia\s*\(\d+\)/, { useInnerText: true });
    });
});
