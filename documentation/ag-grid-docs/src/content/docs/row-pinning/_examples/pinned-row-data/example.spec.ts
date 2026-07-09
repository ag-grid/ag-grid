import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('floating pinned rows use pinnedRowBackgroundColor', async ({ page }) => {
        await waitForGridContent(page);

        const backgrounds = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.ag-row-pinned')).map((row) => getComputedStyle(row).backgroundColor)
        );

        expect(backgrounds.length).toBeGreaterThan(0);
        for (const background of backgrounds) {
            expect(background).toBe('rgb(255, 249, 196)');
        }
    });
});
