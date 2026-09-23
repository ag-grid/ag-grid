import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GRID_ID = 'savedViews';

const filterButton = (page: Parameters<typeof ensureGridReady>[0]) =>
    page.getByRole('button', { name: 'Filter: United States', exact: true });

test.agExample(import.meta, () => {
    test.eachFramework('Medals by Country groups, aggregates and hides columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Medals by Country', exact: true }).click();

        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();
        await expect(
            page.locator('.ag-column-drop-horizontal .ag-column-drop-cell', { hasText: 'Country' })
        ).toBeVisible();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'descending');
        await expect(page.locator('.ag-row-group').first()).toContainText('United States');
        await expect(page.locator('.ag-row-group').first().locator('[col-id="total"]')).not.toBeEmpty();
    });

    test.eachFramework('Swimming Leaders filters, pins and sorts', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Swimming Leaders', exact: true }).click();

        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.headerCell('sport')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(page.locator('.ag-row').filter({ hasText: 'Athletics' })).toHaveCount(0);
    });

    test.eachFramework('Switching back to Default View replaces the previous view', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Medals by Country', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);

        await page.getByRole('button', { name: 'Default View', exact: true }).click();

        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toHaveCount(0);
        await expect(agIdFor.headerCell('athlete')).toBeVisible();
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect
            .poll(async () => {
                const athlete = await agIdFor.headerCell('athlete').boundingBox();
                const country = await agIdFor.headerCell('country').boundingBox();
                return athlete && country ? athlete.x < country.x : false;
            })
            .toBe(true);
    });

    test.eachFramework(
        'Applying a view clears the filter unless Ignore Filter is checked',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);

            const countryFilter = agIdFor.floatingFilter('country').locator('input');
            const nemovCountry = agIdFor.cell('4', 'country');
            await expect(nemovCountry).toContainText('Russia');
            await filterButton(page).click();
            await expect(countryFilter).toHaveValue('(1) United States');
            await expect(nemovCountry).toHaveCount(0);

            await page.getByRole('button', { name: 'Default View', exact: true }).click();
            await expect(countryFilter).toHaveValue('');
            await expect(nemovCountry).toContainText('Russia');

            await filterButton(page).click();
            await expect(countryFilter).toHaveValue('(1) United States');
            await page.getByLabel('Ignore Filter').check();

            await page.getByRole('button', { name: 'Default View', exact: true }).click();
            await expect(countryFilter).toHaveValue('(1) United States');
            await expect(nemovCountry).toHaveCount(0);
        }
    );

    test.eachFramework(
        'Column Order Only resets every omitted property unless it is ignored',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);

            await page.getByRole('button', { name: 'Swimming Leaders', exact: true }).click();
            await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
            await filterButton(page).click();
            const countryFilter = agIdFor.floatingFilter('country').locator('input');
            await expect(countryFilter).toHaveValue('(1) United States');

            await page.getByLabel('Ignore Filter').check();
            await page.getByRole('button', { name: 'Column Order Only', exact: true }).click();

            await expect
                .poll(async () => {
                    const total = await agIdFor.headerCell('total').boundingBox();
                    const athlete = await agIdFor.headerCell('athlete').boundingBox();
                    return total && athlete ? total.x < athlete.x : false;
                })
                .toBe(true);
            await expect(agIdFor.headerCell('athlete')).not.toHaveClass(/ag-header-cell-last-left-pinned/);
            await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'none');
            await expect(agIdFor.headerCell('sport')).toBeVisible();
            await expect(countryFilter).toHaveValue('(1) United States');

            await page.getByLabel('Ignore Filter').uncheck();
            await page.getByRole('button', { name: 'Column Order Only', exact: true }).click();
            await expect(countryFilter).toHaveValue('');
        }
    );
});
