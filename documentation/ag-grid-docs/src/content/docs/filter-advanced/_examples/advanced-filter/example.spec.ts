import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with data and show advanced filter input', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Advanced filter input should be visible
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toBeVisible();

        // Grid should have rows loaded — unfiltered data includes many different athletes
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        await expect(athleteCells.first()).toBeVisible();
        const athletes = await athleteCells.allTextContents();
        const uniqueAthletes = new Set(athletes);
        expect(uniqueAthletes.size).toBeGreaterThan(5);
    });

    test.eachFramework('should filter rows by typing expression and clicking Apply', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before filtering: wait for a non-Phelps athlete to be rendered. The data
        // starts with several Michael Phelps rows, so a one-shot snapshot can catch a
        // moment where only Phelps rows are virtualised in — use an auto-retrying
        // locator instead of allTextContents() to avoid that race.
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        await expect(athleteCells.filter({ hasNotText: /phelps/i }).first()).toBeVisible();

        // Type expression into the filter input
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] contains "phelps"');

        // Close any autocomplete dropdown, then click the Apply button
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Wait for filter to apply — Phelps should appear and non-Phelps should disappear
        // Use page.waitForFunction to wait for the grid to settle with only Phelps rows
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
