import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should auto-open builder on first data render with initial filter applied',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Builder dialog should be visible (auto-opened via onFirstDataRendered)
            const builderDialog = page.locator('.ag-advanced-filter-builder');
            await expect(builderDialog).toBeVisible();

            // Builder should show filter condition pills
            const pills = page.locator('.ag-advanced-filter-builder-pill-display');
            await expect(pills.first()).toBeVisible();
        }
    );

    test.eachFramework('should show filtered data matching initial model', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Close the builder to see the grid
        const cancelButton = page.locator('.ag-advanced-filter-builder').getByText('Cancel');
        if (await cancelButton.isVisible()) {
            await cancelButton.click();
        }

        // The initial filter is: (age > 23 OR sport endsWith 'ing') AND country contains 'united'
        // Every visible row's country should contain 'united'
        const countryCells = page.locator('.ag-row [col-id="country"]');
        await expect(countryCells.first()).toBeVisible();
        const visibleCountries = await countryCells.allTextContents();
        for (const text of visibleCountries) {
            expect(text.toLowerCase()).toContain('united');
        }

        // Each row should also satisfy: age > 23 OR sport ends with 'ing'
        // Verify at least a few rows to confirm both parts of the OR work
        const ageCells = await page.locator('.ag-row [col-id="age"]').allTextContents();
        const sportCells = await page.locator('.ag-row [col-id="sport"]').allTextContents();
        for (let i = 0; i < ageCells.length; i++) {
            const age = parseInt(ageCells[i], 10);
            const sport = sportCells[i].toLowerCase();
            // Each row must satisfy: age > 23 OR sport ends with 'ing'
            expect(age > 23 || sport.endsWith('ing')).toBe(true);
        }
    });
});
