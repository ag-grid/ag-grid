import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Verify group rows display names
        await expect(agIdFor.autoGroupCell('1')).toContainText('Desktop', { useInnerText: true });
        await expect(agIdFor.autoGroupCell('2')).toContainText('ProjectAlpha', { useInnerText: true });

        // Verify leaf rows with names and dates
        await expect(agIdFor.autoGroupCell('3')).toContainText('Proposal.docx', { useInnerText: true });
        await expect(agIdFor.cell('3', 'modified')).toContainText('2023-08-01');
        await expect(agIdFor.cell('3', 'created')).toContainText('2023-07-10');

        await expect(agIdFor.autoGroupCell('4')).toContainText('Timeline.xlsx', { useInnerText: true });
        await expect(agIdFor.cell('4', 'modified')).toContainText('2023-08-03');
        await expect(agIdFor.cell('4', 'created')).toContainText('2023-07-12');

        await expect(agIdFor.autoGroupCell('5')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.cell('5', 'modified')).toContainText('2023-08-10');

        await expect(agIdFor.autoGroupCell('6')).toContainText('MeetingNotes_August.pdf', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('6', 'modified')).toContainText('2023-08-15');
    });
});
