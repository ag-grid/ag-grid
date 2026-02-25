import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // groupDefaultExpanded: 1 - level 0 expanded, level 1 collapsed
        // Custom group cell renderer - verify visible level 1 leaf data rows
        // Row 2: Desktop/ToDoList.txt (visible since Desktop is expanded)
        await expect(agIdFor.autoGroupCell('2')).toContainText('ToDoList.txt', { useInnerText: true });
        await expect(agIdFor.cell('2', 'size')).toContainText('50 KB');

        // Row 3: Desktop/MeetingNotes_August.pdf
        await expect(agIdFor.autoGroupCell('3')).toContainText('MeetingNotes_August.pdf', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('3', 'size')).toContainText('450 KB');
    });
});
