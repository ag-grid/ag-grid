import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Verify child counts are displayed in group cells (no suppressCount)
        const childCounts = page.locator('.ag-group-child-count');
        await expect(childCounts.first()).toBeVisible();

        // Verify data rows display correct values
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('0', 'size')).toContainText('500 KB');
        await expect(agIdFor.cell('0', 'created')).toContainText('2023-07-10');

        await expect(agIdFor.autoGroupCell('2')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.cell('2', 'size')).toContainText('50 KB');
    });
});
