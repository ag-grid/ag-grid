import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const findGroupRow = (page: any, name: string) =>
        page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
            .first();

    test.eachFramework('Each folder shows its size as a percentage of its parent', async ({ page }) => {
        // Top-level folders are shown as a share of the grand total (105320448 bytes).
        // Documents 3608576 => 3.43%, Media 91226112 => 86.62%, Downloads 10485760 => 9.96%.
        await expect(findGroupRow(page, 'Documents').locator('[col-id="size"]')).toContainText('3.43%');
        await expect(findGroupRow(page, 'Media').locator('[col-id="size"]')).toContainText('86.62%');
        await expect(findGroupRow(page, 'Downloads').locator('[col-id="size"]')).toContainText('9.96%');

        // Sub-folders are shown as a share of their parent folder.
        // Work 2584576 / Documents 3608576 => 71.62%, Personal 1024000 => 28.38%.
        await expect(findGroupRow(page, 'Work').locator('[col-id="size"]')).toContainText('71.62%');
        await expect(findGroupRow(page, 'Personal').locator('[col-id="size"]')).toContainText('28.38%');
    });

    test.eachFramework('Expanding a folder reveals leaf files as a share of that folder', async ({ agIdFor, page }) => {
        // Leaves are hidden until their folder is expanded (groupDefaultExpanded: 1).
        await expect(agIdFor.cell('0', 'size')).not.toBeVisible();

        await findGroupRow(page, 'Work').locator('.ag-group-contracted').click();

        // Proposal.docx 512000 / Work 2584576 => 19.81% (first row in the source data).
        await expect(agIdFor.cell('0', 'size')).toContainText('19.81%');
        // Timeline.xlsx 1048576 / Work 2584576 => 40.57%.
        await expect(agIdFor.cell('1', 'size')).toContainText('40.57%');
    });
});
