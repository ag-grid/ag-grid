import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Verify custom group column header "My Group"
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toContainText('My Group');

        // Verify a data row with size formatting
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('0', 'size')).toContainText('500 KB');

        // Verify child counts are shown
        const childCount = page.locator('.ag-group-child-count').first();
        await expect(childCount).toBeVisible();

        // Helper to get the size cell within a group row identified by its group value text
        const groupSizeCell = (groupName: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: groupName }) })
                .first()
                .locator('[col-id="size"]');

        const viewport = page.locator('.ag-grid-viewport');

        // Level 0: Desktop (sum: 2,072,576 bytes = 1.98 MB)
        await expect(groupSizeCell('Desktop')).toContainText('1.98 MB');
        // Level 0: Documents (sum: 8,290,304 bytes = 7.91 MB)
        await expect(groupSizeCell('Documents')).toContainText('7.91 MB');
        // Level 1: Work (sum: 5,193,728 bytes = 4.95 MB)
        await expect(groupSizeCell('Work')).toContainText('4.95 MB');
        // Level 2: ProjectBeta (sum: 2,072,576 bytes = 1.98 MB)
        await expect(groupSizeCell('ProjectBeta')).toContainText('1.98 MB');

        // Scroll to middle to reach deeper groups
        await viewport.evaluate((el) => (el.scrollTop = 600));

        // Level 2: Meetings (sum: 1,560,576 bytes = 1.49 MB)
        await expect(groupSizeCell('Meetings')).toContainText('1.49 MB');
        // Level 1: Personal (sum: 3,096,576 bytes = 2.95 MB)
        await expect(groupSizeCell('Personal')).toContainText('2.95 MB');
        // Level 2: Taxes (sum: 3,096,576 bytes = 2.95 MB)
        await expect(groupSizeCell('Taxes')).toContainText('2.95 MB');

        // Scroll to bottom for remaining groups
        await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight));

        // Level 0: Videos (sum: 20,971,520 bytes = 20 MB)
        await expect(groupSizeCell('Videos')).toContainText('20 MB');
        // Level 0: Downloads (sum: 4,194,304 bytes = 4 MB)
        await expect(groupSizeCell('Downloads')).toContainText('4 MB');
    });
});
