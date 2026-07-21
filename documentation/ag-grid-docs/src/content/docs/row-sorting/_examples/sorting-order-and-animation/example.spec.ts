import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Athlete cycles ascending then descending only', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = agIdFor.headerCell('athlete');
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-descending-icon')).toBeVisible();
    });

    test.eachFramework('Age cycles descending then ascending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = agIdFor.headerCell('age');
        await header.click();
        await expect(header.locator('.ag-sort-descending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).toBeVisible();
    });

    test.eachFramework('Country cycles descending then back to no sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = agIdFor.headerCell('country');
        await header.click();
        await expect(header.locator('.ag-sort-descending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-descending-icon')).not.toBeVisible();
        await expect(header.locator('.ag-sort-ascending-icon')).not.toBeVisible();
    });

    test.eachFramework('Year only ever sorts ascending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = agIdFor.headerCell('year');
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        // sortingOrder is ['asc'] only, so a second click stays ascending.
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).toBeVisible();
        await expect(header.locator('.ag-sort-descending-icon')).not.toBeVisible();
    });

    test.eachFramework('Default columns cycle descending, ascending, then none', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // date has no sortingOrder override, so it uses the defaultColDef order desc -> asc -> null.
        const header = agIdFor.headerCell('date');
        await header.click();
        await expect(header.locator('.ag-sort-descending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).toBeVisible();
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-ascending-icon')).not.toBeVisible();
        await expect(header.locator('.ag-sort-descending-icon')).not.toBeVisible();
    });
});
