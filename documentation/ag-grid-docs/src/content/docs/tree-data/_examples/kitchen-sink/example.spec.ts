import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Verify data rows with size formatting (all expanded via groupDefaultExpanded: -1)
        // Row 0: Desktop/ProjectAlpha/Proposal.docx - 512000 bytes = 500 KB
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('0', 'size')).toContainText('500 KB');
        await expect(agIdFor.cell('0', 'created')).toContainText('2023-07-10');
        await expect(agIdFor.cell('0', 'modified')).toContainText('2023-08-01');

        // Row 1: Desktop/ProjectAlpha/Timeline.xlsx - 1048576 bytes = 1024 KB (exactly 1024, not > 1024)
        await expect(agIdFor.autoGroupCell('1')).toContainText('Timeline.xlsx', { useInnerText: true });
        await expect(agIdFor.cell('1', 'size')).toContainText('1024 KB');

        // Row 2: Desktop/ToDoList.txt - 51200 bytes = 50 KB
        await expect(agIdFor.autoGroupCell('2')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.cell('2', 'size')).toContainText('50 KB');

        // Row 3: Desktop/MeetingNotes_August.pdf - 460800 bytes = 450 KB
        await expect(agIdFor.autoGroupCell('3')).toContainText('MeetingNotes_August.pdf', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('3', 'size')).toContainText('450 KB');

        // Collapse the first ProjectAlpha group (under Desktop) using page locators for filler node
        const projectAlphaRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: 'ProjectAlpha' }) })
            .first();
        await projectAlphaRow.locator('.ag-group-expanded').click();

        // Verify ProjectAlpha children are hidden after collapse
        await expect(agIdFor.autoGroupCell('0')).not.toBeVisible(); // Proposal.docx
        await expect(agIdFor.autoGroupCell('1')).not.toBeVisible(); // Timeline.xlsx

        // Verify other Desktop children are still visible
        await expect(agIdFor.autoGroupCell('2')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('3')).toContainText('MeetingNotes_August.pdf', {
            useInnerText: true,
        });
    });
});
