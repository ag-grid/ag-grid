import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'age')).toContainText('25');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
        await expect(agIdFor.cell('1', 'age')).toContainText('24');
        await expect(agIdFor.cell('1', 'year')).toContainText('2000');
    });

    test.eachFramework('should have x direction button selected initially', async ({ page }) => {
        const xButton = page.locator('.ag-fill-direction.x');
        await expect(xButton).toHaveClass(/selected/);
    });

    test.eachFramework(
        'should fill cells horizontally when dragging fill handle in x direction',
        async ({ agIdFor }) => {
            const sourceCell = agIdFor.cell('0', 'athlete');
            await expect(sourceCell).toContainText('Natalie Coughlin');
            await expect(agIdFor.cell('0', 'age')).toContainText('25');

            await sourceCell.click();

            const fillHandle = agIdFor.fillHandle();
            await expect(fillHandle).toBeVisible();

            const targetCell = agIdFor.cell('0', 'age');
            await dragFillHandleOverTo(fillHandle, targetCell);

            await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
            await expect(agIdFor.cell('0', 'age')).toContainText('Natalie Coughlin');
        }
    );
});
