import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const bgColor = (locator: any) => locator.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor);

test.agExample(import.meta, () => {
    test.eachFramework('Static headerStyle colours the header cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Athlete Details group header uses a static cadetblue background.
        const athleteDetails = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        expect(await bgColor(athleteDetails)).toBe('rgb(95, 158, 160)');

        // Athlete column header uses a static teal background.
        expect(await bgColor(agIdFor.headerCell('athlete'))).toBe('rgb(0, 128, 128)');
    });

    test.eachFramework('Function headerStyle differs for header and floating filter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Country header (not the floating filter) => teal.
        expect(await bgColor(agIdFor.headerCell('country'))).toBe('rgb(0, 128, 128)');

        // Country floating filter => cornflowerblue.
        expect(await bgColor(agIdFor.floatingFilter('country'))).toBe('rgb(100, 149, 237)');
    });

    test.eachFramework('headerClass is applied to the sport header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.headerCell('sport')).toHaveClass(/sport-header/);
    });

    test.eachFramework('Medal Details header restyles when the group expands', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const medalDetails = page.locator('.ag-header-group-cell').filter({ hasText: 'Medal Details' }).first();

        // Closed: only the total column is shown, medals hidden, header is orangered.
        expect(await bgColor(medalDetails)).toBe('rgb(255, 69, 0)');
        await expect(agIdFor.headerCell('total')).toBeVisible();
        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);

        // Expand the group: medals appear and the header turns cornflowerblue.
        await medalDetails.locator('.ag-header-expand-icon-collapsed').first().click();
        await expect(agIdFor.headerCell('gold')).toBeVisible();
        expect(await bgColor(medalDetails)).toBe('rgb(100, 149, 237)');
    });
});
