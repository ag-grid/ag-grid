import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Advanced Filter expression reloads only matching rows from the server', async ({ page }) => {
        await waitForGridContent(page);

        const athleteCells = page.locator('.ag-row [col-id="athlete"]');

        // Unfiltered data includes many different athletes.
        await expect(athleteCells.filter({ hasNotText: 'Phelps' }).first()).toBeVisible();

        // Enter an Advanced Filter expression and apply it. With the SSRM the expression
        // is sent to the server as an Advanced Filter Model.
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] contains "phelps"');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Only Michael Phelps rows remain.
        await expect(athleteCells.first()).toBeVisible();
        await expect(athleteCells.filter({ hasNotText: 'Phelps' })).toHaveCount(0);
    });

    test.eachFramework('the value list shows it is loading until the server answers', async ({ page }) => {
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is any of [');

        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        // The values callback answers after a delay, so the list says so rather than standing empty.
        await expect(autocompleteList.locator('.ag-autocomplete-loading')).toHaveText('Loading...');

        // The same open list picks the values up when they land, blanks first.
        await expect(autocompleteList.getByText('(Blanks)', { exact: true })).toBeVisible();
        await expect(autocompleteList.locator('.ag-autocomplete-loading')).toBeHidden();

        // Typing narrows the list to the athletes matching, as it does once the values are held.
        await filterInput.fill('[Athlete] is any of [Michael Ph');
        await expect(autocompleteList.getByText('Michael Phelps', { exact: true })).toBeVisible();
    });

    test.eachFramework('is any of an athlete with an apostrophe in the name reloads that athlete', async ({ page }) => {
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill(`[Athlete] is any of ["Cian O'Connor"]`);
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        await expect(athleteCells).toHaveCount(1);
        await expect(athleteCells.first()).toHaveText("Cian O'Connor");
    });

    test.eachFramework('is any of blanks reloads only the rows with no athlete', async ({ page }) => {
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is any of ["(Blanks)"]');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // The data holds five rows with an empty athlete, and only those come back.
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        await expect(athleteCells).toHaveCount(5);
        await expect(athleteCells.filter({ hasText: /\S/ })).toHaveCount(0);
    });

    test.eachFramework('is none of blanks reloads every row with an athlete', async ({ page }) => {
        await waitForGridContent(page);

        // The row count is unknown until the first block lands, so read it once the server has answered.
        const grid = page.locator('[role="grid"][aria-rowcount], [role="treegrid"][aria-rowcount]');
        let unfilteredRowCount = 0;
        await expect(async () => {
            unfilteredRowCount = Number(await grid.getAttribute('aria-rowcount'));
            expect(unfilteredRowCount).toBeGreaterThan(5);
        }).toPass();

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] is none of ["(Blanks)"]');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Exactly the five blank rows are gone; a server matching the blank key as text would drop none.
        await expect(grid).toHaveAttribute('aria-rowcount', String(unfilteredRowCount - 5));
        await expect(page.locator('.ag-row [col-id="athlete"]').first()).toBeVisible();
    });
});
