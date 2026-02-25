import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // All expanded (groupDefaultExpanded: -1) with checkboxes in autoGroupColumn
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('0', 'size')).toContainText('500 KB');

        // Verify checkboxes are present in group cells
        await expect(agIdFor.autoGroupCell('0').locator('.ag-selection-checkbox')).toBeVisible();
    });
});
