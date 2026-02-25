import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const validDays = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$/;

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with initial athlete data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
    });

    test.eachFramework('should display a valid day-of-week value in the dayOfTheWeek column', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'dayOfTheWeek')).toHaveText(validDays);
    });

    test.eachFramework(
        'should cycle through days when dragging fill handle down on dayOfTheWeek column',
        async ({ agIdFor }) => {
            const sourceCell = agIdFor.cell('0', 'dayOfTheWeek');
            const initialDay = await sourceCell.textContent();
            const initialIndex = daysList.indexOf(initialDay!);

            await sourceCell.click();

            const fillHandle = agIdFor.fillHandle();
            await expect(fillHandle).toBeVisible();

            const targetCell = agIdFor.cell('2', 'dayOfTheWeek');
            await dragFillHandleOverTo(fillHandle, targetCell);

            const expectedDay1 = daysList[(initialIndex + 1) % daysList.length];
            const expectedDay2 = daysList[(initialIndex + 2) % daysList.length];

            await expect(agIdFor.cell('0', 'dayOfTheWeek')).toHaveText(initialDay!);
            await expect(agIdFor.cell('1', 'dayOfTheWeek')).toHaveText(expectedDay1);
            await expect(agIdFor.cell('2', 'dayOfTheWeek')).toHaveText(expectedDay2);
        }
    );
});
