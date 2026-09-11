import { ensureGridReady, expect, orderedValues, test, waitForGridContent } from '@utils/grid/test-utils';

// Athlete, not Sport: this example gives Athlete the Set Filter (with an uppercasing
// `valueFormatter`) and leaves Sport on a Text Filter, so `is any of` is only offered here. The
// two layout tests below were still asking for `[Sport] is any of [...]`, which the Builder cannot
// render as a value list - so their pill never appeared.
const SET_CONDITION = '[Athlete] is any of ["Aaron Gate", "Abby Bishop", "Abbos Atayev", "Aaron Miller"]';
const SET_CONDITION_PILL = '(4) AARON GATE, ABBY BISHOP, ABBOS ATAYEV, +1 more';

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

    test.eachFramework('grows a Builder value list without crowding its row actions', async ({ page }) => {
        // Wide enough for the pill to grow past its 152px floor. At the indented test's 570px the row
        // overflows and the pill is pinned to the floor, so nothing about growth is observable there.
        await page.setViewportSize({ width: 1000, height: 900 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill(SET_CONDITION);
        await filterInput.press('Escape');
        await filterInput.press('Enter');
        await page.getByRole('button', { name: 'Builder' }).click();

        const row = page.locator('.ag-advanced-filter-builder-set-value-list');
        const pill = row.locator('.ag-advanced-filter-builder-set-values-pill');
        const firstAction = row.locator('.ag-advanced-filter-builder-item-buttons > :visible').first();
        await expect(pill).toBeVisible();
        await expect(pill).toHaveCSS('cursor', 'pointer');
        await expect(pill.locator('.ag-advanced-filter-builder-pill-display')).toHaveText(SET_CONDITION_PILL);

        const pillBox = await pill.boundingBox();
        const firstActionBox = await firstAction.boundingBox();
        expect(pillBox).not.toBeNull();
        expect(firstActionBox).not.toBeNull();
        // Grown past the 152px floor, and still clear of the actions by the reserved 24px.
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
            `[Gold] > 0 AND ([Athlete] contains "A" AND ([Country] contains "A" AND ${SET_CONDITION}))`
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
        expect(pillBox!.width).toBe(152);
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
