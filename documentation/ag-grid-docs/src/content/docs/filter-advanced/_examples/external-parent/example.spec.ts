import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should render advanced filter in external parent above the grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Advanced filter should be rendered in the external parent (#advancedFilterParent)
        const externalParent = page.locator('#advancedFilterParent');
        const filterInput = externalParent.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toBeVisible();

        // The grid should not have the filter in its own header area
        const gridFilter = page.locator('#myGrid .ag-header .ag-advanced-filter');
        await expect(gridFilter).toHaveCount(0);
    });

    test.eachFramework('should filter rows when expression typed in external filter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before filtering: verify non-Phelps athletes are visible
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        const athletesBefore = await athleteCells.allTextContents();
        const hasNonPhelps = athletesBefore.some((name) => !name.toLowerCase().includes('phelps'));
        expect(hasNonPhelps).toBe(true);

        // Type expression and apply via Apply button
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] contains "phelps"');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Wait for filter to settle
        await page.waitForFunction(() => {
            const cells = document.querySelectorAll('.ag-row [col-id="athlete"]');
            return cells.length > 0 && Array.from(cells).every((c) => c.textContent?.toLowerCase().includes('phelps'));
        });

        // Every visible athlete cell should contain "Phelps"
        const athletesAfter = await athleteCells.allTextContents();
        expect(athletesAfter.length).toBeGreaterThan(0);
        for (const text of athletesAfter) {
            expect(text.toLowerCase()).toContain('phelps');
        }
    });
});
