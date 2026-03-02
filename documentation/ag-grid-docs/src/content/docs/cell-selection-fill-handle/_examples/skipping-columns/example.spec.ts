import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'age')).toContainText('25');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
        await expect(agIdFor.cell('1', 'age')).toContainText('24');
        await expect(agIdFor.cell('1', 'year')).toContainText('2000');
    });

    test.eachFramework('should fill athlete column when dragging fill handle down', async ({ agIdFor }) => {
        const sourceCell = agIdFor.cell('0', 'athlete');

        await sourceCell.click();

        const fillHandle = agIdFor.fillHandle();
        await expect(fillHandle).toBeVisible();

        const targetCell = agIdFor.cell('2', 'athlete');
        await dragFillHandleOverTo(fillHandle, targetCell);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Natalie Coughlin');
    });

    test.eachFramework('should display all expected header cells', async ({ agIdFor }) => {
        await expect(agIdFor.headerCell('athlete')).toBeVisible();
        await expect(agIdFor.headerCell('age')).toBeVisible();
        await expect(agIdFor.headerCell('country')).toBeVisible();
        await expect(agIdFor.headerCell('year')).toBeVisible();
        await expect(agIdFor.headerCell('date')).toBeVisible();
        await expect(agIdFor.headerCell('sport')).toBeVisible();
    });
});
