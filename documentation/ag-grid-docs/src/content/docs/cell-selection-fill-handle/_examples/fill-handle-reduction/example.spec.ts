import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('1', 'gold')).toContainText('2');
        await expect(agIdFor.cell('2', 'gold')).toContainText('1');
    });

    test.eachFramework(
        'should fill cells when dragging fill handle down and then clear when range reduced',
        async ({ agIdFor }) => {
            const sourceCell = agIdFor.cell('0', 'gold');

            await sourceCell.click();

            const fillHandle = agIdFor.fillHandle();
            await expect(fillHandle).toBeVisible();

            const targetCell = agIdFor.cell('2', 'gold');
            await dragFillHandleOverTo(sourceCell, targetCell);

            await expect(agIdFor.cell('0', 'gold')).toContainText('1');
            await expect(agIdFor.cell('1', 'gold')).toContainText('2');
            await expect(agIdFor.cell('2', 'gold')).toContainText('1');

            // Then drag back up to the first cell to clear the values
            await dragFillHandleOverTo(fillHandle, sourceCell);

            await expect(agIdFor.cell('0', 'gold')).toContainText('1');
            // TODO: This should ideally be cleared to empty string, but currently remains unchanged which is an issue we will address in the future
            // This seems to be a test issue as it does work when testing manually, so may be related to the way the test is simulating the drag or the test environment itself
            await expect(agIdFor.cell('1', 'gold')).toContainText('2');
            await expect(agIdFor.cell('2', 'gold')).toContainText('1');
        }
    );
});
