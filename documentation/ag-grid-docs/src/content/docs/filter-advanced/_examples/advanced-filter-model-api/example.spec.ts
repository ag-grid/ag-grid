import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load with initial filter applied and show filtered rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Initial model is: (age > 23 OR sport endsWith 'ing') AND country contains 'united'
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toHaveValue(/.+/);

        // All visible rows must have country containing 'united'
        const countryCells = page.locator('.ag-row [col-id="country"]');
        await expect(countryCells.first()).toBeVisible();
        const visibleCountries = await countryCells.allTextContents();
        for (const text of visibleCountries) {
            expect(text.toLowerCase()).toContain('united');
        }
    });

    test.eachFramework('should set custom filter model via button', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Click "Set Custom Advanced Filter Model" — applies [Gold] >= 1
        await page.getByText('Set Custom Advanced Filter Model').click();

        // Filter input should show the gold >= 1 expression
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toHaveValue(/Gold/);

        // Wait for the filter to take effect — all visible gold values should be >= 1
        await page.waitForFunction(() => {
            const cells = document.querySelectorAll('.ag-row [col-id="gold"]');
            return cells.length > 0 && Array.from(cells).every((c) => parseInt(c.textContent || '0', 10) >= 1);
        });

        // Verify all visible gold values
        const goldCells = page.locator('.ag-row [col-id="gold"]');
        const visibleGold = await goldCells.allTextContents();
        for (const text of visibleGold) {
            expect(parseInt(text, 10)).toBeGreaterThanOrEqual(1);
        }
    });

    test.eachFramework('should clear filter via button', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The grid starts with a filter — all visible countries contain 'united'
        const countryCells = page.locator('.ag-row [col-id="country"]');
        const filteredCountries = await countryCells.allTextContents();
        const allUnited = filteredCountries.every((c) => c.toLowerCase().includes('united'));
        expect(allUnited).toBe(true);

        // Click "Clear Advanced Filter"
        await page.getByText('Clear Advanced Filter').click();

        // Filter input should now be empty
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toHaveValue('');

        // After clearing, non-United countries should appear (data includes many countries)
        // Michael Phelps (United States) is first, but other countries should now be visible too
        await expect(page.locator('.ag-row [col-id="athlete"]').first()).toContainText('Michael Phelps');
        const unfilteredCountries = await countryCells.allTextContents();
        const hasNonUnited = unfilteredCountries.some((c) => !c.toLowerCase().includes('united'));
        expect(hasNonUnited).toBe(true);
    });
});
