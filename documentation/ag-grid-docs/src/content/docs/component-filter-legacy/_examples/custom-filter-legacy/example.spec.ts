import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom athlete filter does fuzzy multi-word matching', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps appears at data indices 0, 1 and 2 (years 2008, 2004, 2012).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Open the custom Athlete filter and confirm its bespoke UI is shown.
        await agIdFor.headerFilterButton('athlete').click();
        await expect(page.locator('.person-filter')).toBeVisible();

        // Partial words across the full name still match ("mich phel" => Michael Phelps).
        const filterInput = page.locator('.person-filter input');
        await filterInput.fill('mich phel');

        // Only the three Michael Phelps rows (data indices 0, 1, 2) remain.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        // Row index 3 (Natalie Coughlin) no longer matches and is filtered out.
        await expect(agIdFor.cell('3', 'athlete')).not.toBeVisible();

        // Clearing the filter restores the full data set.
        await filterInput.fill('');
        await expect(agIdFor.cell('3', 'athlete')).toContainText('Natalie Coughlin');
    });

    test.eachFramework('Custom year filter restricts rows to 2010 onwards', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before filtering the first row is Michael Phelps in 2008.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        // Open the custom Year filter and confirm its preset-option UI is shown.
        await agIdFor.headerFilterButton('year').click();
        await expect(page.locator('.year-filter')).toBeVisible();

        // Select the "Since 2010" preset (second radio in the year filter).
        await page.locator('.year-filter input[type="radio"]').nth(1).check();

        // The 2008 row is filtered out; the first surviving Phelps row is 2012 (data index 2).
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');

        // Switching back to "All" (first radio) restores the 2008 row.
        await page.locator('.year-filter input[type="radio"]').nth(0).check();
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
    });
});
