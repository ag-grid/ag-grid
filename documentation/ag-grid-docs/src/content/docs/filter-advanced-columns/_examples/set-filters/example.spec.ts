import { ensureGridReady, expect, orderedValues, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('offers the set options on a Set Filter column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Country] ');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.getByText('is any of', { exact: true })).toBeVisible();
        await expect(autocompleteList.getByText('is none of', { exact: true })).toBeVisible();
    });

    test.eachFramework('suggests the column values and filters on the chosen ones', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Country] is any of [United St');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.getByText('United States', { exact: true })).toBeVisible();

        // The data starts with several United States rows, so a sample taken before the filter applies
        // already reads as filtered — wait for a non-US country first, then for it to be gone.
        const countryCells = page.locator('.ag-row [col-id="country"]');
        await expect(countryCells.filter({ hasNotText: /united states/i }).first()).toBeVisible();

        await filterInput.fill('[Country] is any of ["United States"]');
        await filterInput.press('Escape');
        await filterInput.press('Enter');

        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            expect(countries.length).toBeGreaterThan(0);
            expect(new Set(countries)).toEqual(new Set(['United States']));
        }).toPass();
    });

    test.eachFramework('renders the suggested values with the Set Filter cellRenderer', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Country] is any of [United St');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.locator('img.flag').first()).toBeVisible();
    });

    test.eachFramework('shows the formatted values a Set Filter valueFormatter produces', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is any of [MICHAEL PH');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        await expect(autocompleteList.getByText('MICHAEL PHELPS', { exact: true })).toBeVisible();
    });

    test.eachFramework('names the blank athlete the way the valueFormatter spells it', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is any of [(Bl');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList.getByText('(Blanks)', { exact: true })).toBeVisible();

        await filterInput.fill('[Athlete] is any of ["(Blanks)"]');
        await filterInput.press('Enter');
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        await expect(athleteCells).toHaveCount(5);
        await expect(athleteCells.filter({ hasText: /\S/ })).toHaveCount(0);
    });

    test.eachFramework('grows a Builder value list without crowding its row actions', async ({ page }) => {
        await page.setViewportSize({ width: 640, height: 900 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is any of ["Michael Phelps", "Ryan Lochte", "Ian Thorpe", "Usain Bolt"]');
        await filterInput.press('Escape');
        await filterInput.press('Enter');
        await page.getByRole('button', { name: 'Builder' }).click();

        const row = page.locator('.ag-advanced-filter-builder-set-value-list');
        const pill = row.locator('.ag-advanced-filter-builder-set-values-pill');
        const firstAction = row.locator('.ag-advanced-filter-builder-item-buttons > :visible').first();
        await expect(pill).toBeVisible();
        await expect(pill).toHaveCSS('cursor', 'pointer');
        await expect(pill.locator('.ag-advanced-filter-builder-pill-display')).toHaveText(
            '(4) MICHAEL PHELPS, RYAN LOCHTE, IAN THORPE, +1 more'
        );

        const pillBox = await pill.boundingBox();
        const firstActionBox = await firstAction.boundingBox();
        expect(pillBox).not.toBeNull();
        expect(firstActionBox).not.toBeNull();
        expect(pillBox!.width).toBeGreaterThan(152);
        expect(firstActionBox!.x - (pillBox!.x + pillBox!.width)).toBeCloseTo(24, 1);

        const viewport = page.locator('.ag-advanced-filter-builder-virtual-list-viewport');
        const widths = await viewport.evaluate(({ clientWidth, scrollWidth }) => ({ clientWidth, scrollWidth }));
        expect(widths.scrollWidth).toBe(widths.clientWidth);
    });

    test.eachFramework('keeps an indented Set value list clear of its row actions', async ({ page }) => {
        await page.setViewportSize({ width: 570, height: 900 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill(
            '[Gold] > 0 AND ([Sport] contains "S" AND ([Country] contains "A" AND [Athlete] is any of ["Michael Phelps", "Ryan Lochte", "Ian Thorpe", "Usain Bolt"]))'
        );
        await filterInput.press('Escape');
        await filterInput.press('Enter');
        await page.getByRole('button', { name: 'Builder' }).click();

        const row = page.locator('.ag-advanced-filter-builder-set-value-list');
        const pill = row.locator('.ag-advanced-filter-builder-set-values-pill');
        const firstAction = row.locator('.ag-advanced-filter-builder-item-buttons > :visible').first();
        await expect(pill).toBeVisible();

        const pillBox = await pill.boundingBox();
        const firstActionBox = await firstAction.boundingBox();
        expect(pillBox).not.toBeNull();
        expect(firstActionBox).not.toBeNull();
        // Firefox reports the clamped width a fraction under its computed value, so the pill's
        // width is compared to the nearest pixel rather than exactly.
        expect(pillBox!.width).toBeCloseTo(152, 1);
        expect(firstActionBox!.x - (pillBox!.x + pillBox!.width)).toBeCloseTo(24, 1);

        const viewport = page.locator('.ag-advanced-filter-builder-virtual-list-viewport');
        const widths = await viewport.evaluate(({ clientWidth, scrollWidth }) => ({ clientWidth, scrollWidth }));
        expect(widths.scrollWidth).toBeGreaterThan(widths.clientWidth);
    });

    test.eachFramework('offers a Tree List column as one flat list of whole paths', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Date] is any of [');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        // Every row is a whole path, its parent segments drawn back from the leaf that names the value.
        await expect(autocompleteList.locator('.ag-autocomplete-row-path-parent').first()).toBeVisible();

        // Whichever date is first: the whole path inside one pair of quotes, not a quoted segment each.
        await filterInput.press('Enter');
        await expect(filterInput).toHaveValue(/\["[^"]+ > [^"]+", $/);
    });
});
