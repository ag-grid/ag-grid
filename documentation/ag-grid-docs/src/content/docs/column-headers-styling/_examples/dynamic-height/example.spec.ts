import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('headerHeight button resizes the column header row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const ageHeader = agIdFor.headerCell('age');

        await page.getByRole('button', { name: '70px' }).click();
        await expect(page.locator('#headerHeight')).toHaveText('70');
        const height70 = (await ageHeader.boundingBox())!.height;
        expect(Math.round(height70)).toBe(70);

        await page.getByRole('button', { name: '80px' }).click();
        await expect(page.locator('#headerHeight')).toHaveText('80');
        const height80 = (await ageHeader.boundingBox())!.height;
        expect(Math.round(height80)).toBe(80);
    });

    test.eachFramework('groupHeaderHeight button resizes the group header row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const groupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();

        await page.getByRole('button', { name: '40px' }).click();
        await expect(page.locator('#groupHeaderHeight')).toHaveText('40');
        const height40 = (await groupHeader.boundingBox())!.height;
        expect(Math.round(height40)).toBe(40);

        await page.getByRole('button', { name: '60px' }).click();
        await expect(page.locator('#groupHeaderHeight')).toHaveText('60');
        const height60 = (await groupHeader.boundingBox())!.height;
        expect(Math.round(height60)).toBe(60);
    });

    test.eachFramework('Enabling pivot mode reveals the pivot height controls', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Pivot-only controls are hidden until pivot mode is on.
        await expect(page.locator('#requiresPivot')).not.toBeVisible();

        await page.getByRole('button', { name: 'on', exact: true }).click();
        await expect(page.locator('#pivot')).toHaveText('on');
        await expect(page.locator('#requiresPivot')).toBeVisible();
        await expect(page.locator('#requiresNotPivot')).not.toBeVisible();
    });
});
