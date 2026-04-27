import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
    });

    test.eachFramework('should show fill handle on non-suppressed column', async ({ agIdFor, page }) => {
        const fillHandle = page.locator('.ag-fill-handle');

        await agIdFor.cell('0', 'athlete').click();
        await expect(fillHandle).toBeVisible();
    });

    test.eachFramework(
        'should hide fill handle on country column (suppressFillHandle: true)',
        async ({ agIdFor, page }) => {
            const fillHandle = page.locator('.ag-fill-handle');

            await agIdFor.cell('0', 'country').click();
            await expect(fillHandle).not.toBeVisible();
        }
    );

    test.eachFramework(
        'should hide fill handle on date column (suppressFillHandle: true)',
        async ({ agIdFor, page }) => {
            const fillHandle = page.locator('.ag-fill-handle');

            await agIdFor.cell('0', 'date').click();
            await expect(fillHandle).not.toBeVisible();
        }
    );

    test.eachFramework('should show fill handle on sport column (not suppressed)', async ({ agIdFor, page }) => {
        const fillHandle = page.locator('.ag-fill-handle');

        await agIdFor.cell('0', 'sport').click();
        await expect(fillHandle).toBeVisible();
    });

    test.eachFramework('should fill cells when dragging fill handle on non-suppressed column', async ({ agIdFor }) => {
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('1', 'athlete');

        await source.click();
        await dragFillHandleOverTo(agIdFor.fillHandle(), target);

        await expect(source).toContainText('Natalie Coughlin');
        await expect(target).toContainText('Natalie Coughlin');
    });
});
