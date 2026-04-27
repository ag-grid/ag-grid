import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // No filter applied initially, all groups expanded (groupDefaultExpanded: -1)
        // Verify tree data with set filter is loaded
        await expect(agIdFor.autoGroupCell('0')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('0', 'size')).toContainText('500 KB');

        await expect(agIdFor.autoGroupCell('2')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.cell('2', 'size')).toContainText('50 KB');
    });
});
