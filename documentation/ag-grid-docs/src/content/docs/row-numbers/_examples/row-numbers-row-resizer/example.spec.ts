import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('Row resizer handle increases the row height', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const row = agIdFor.rowNode('0');
        const heightBefore = (await row.boundingBox())!.height;

        // The resizer handle sits inside the row-number cell; hover to reveal it, then drag down.
        const numberCell = agIdFor.rowNumber('0');
        await numberCell.hover();
        const resizer = numberCell.locator('.ag-row-numbers-resizer');
        const handle = (await resizer.boundingBox())!;
        await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
        await page.mouse.down();
        await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2 + 40, { steps: 5 });
        await page.mouse.up();

        await expect(async () => {
            const heightAfter = (await row.boundingBox())!.height;
            expect(heightAfter).toBeGreaterThan(heightBefore);
        }).toPass();
    });
});
