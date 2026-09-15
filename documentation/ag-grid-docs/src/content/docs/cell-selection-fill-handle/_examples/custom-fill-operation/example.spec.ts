import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should include an unchanged value in the custom day sequence', async ({ page, agIdFor }) => {
        await expect(agIdFor.cell('0', 'dayOfTheWeek')).toHaveText('Sunday');
        await expect(agIdFor.cell('1', 'dayOfTheWeek')).toHaveText('Monday');

        // change a target cell so the fill has an observable effect on it
        const editedCell = agIdFor.cell('3', 'dayOfTheWeek');
        await editedCell.dblclick();
        const cellEditor = editedCell.locator('input');
        await expect(cellEditor).toBeVisible();
        await page.keyboard.type('Saturday');
        await page.keyboard.press('Enter');
        await expect(editedCell).toHaveText('Saturday');

        const sourceCell = agIdFor.cell('0', 'dayOfTheWeek');
        await sourceCell.click();

        const fillHandle = agIdFor.fillHandle();
        await expect(fillHandle).toBeVisible();
        await dragFillHandleOverTo(fillHandle, agIdFor.cell('3', 'dayOfTheWeek'));

        await expect(agIdFor.cell('0', 'dayOfTheWeek')).toHaveText('Sunday');
        // `Monday` already matched the target cell, but `useValue` keeps the sequence advancing
        await expect(agIdFor.cell('1', 'dayOfTheWeek')).toHaveText('Monday');
        await expect(agIdFor.cell('2', 'dayOfTheWeek')).toHaveText('Tuesday');
        await expect(agIdFor.cell('3', 'dayOfTheWeek')).toHaveText('Wednesday');
    });

    test.eachFramework('should use the default fill behaviour for other columns', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'age')).toContainText('25');

        const sourceCell = agIdFor.cell('0', 'age');
        await sourceCell.click();

        const fillHandle = agIdFor.fillHandle();
        await expect(fillHandle).toBeVisible();
        await dragFillHandleOverTo(fillHandle, agIdFor.cell('2', 'age'));

        await expect(agIdFor.cell('1', 'age')).toHaveText('25');
        await expect(agIdFor.cell('2', 'age')).toHaveText('25');
    });
});
