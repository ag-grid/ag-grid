import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays custom pagination info on load', async ({ agIdFor, page }) => {
        // Wait for data to load — labels update from "-" to actual values
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await expect(page.locator('#lbLastPageFound')).toContainText('true');
        await expect(page.locator('#lbPageSize')).toContainText('500');
        await expect(page.locator('#lbTotalPages')).toContainText('18');
        await expect(page.locator('#lbCurrentPage')).toContainText('1');
    });

    test.eachFramework('To Next navigates forward', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page.locator('button', { hasText: 'To Next' }).click();
        await expect(page.locator('#lbCurrentPage')).toContainText('2');
    });

    test.eachFramework('To Page 5 navigates to page 5', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await page.getByRole('button', { name: 'To Page 5', exact: true }).click();
        await expect(page.locator('#lbCurrentPage')).toContainText('5');
    });

    test.eachFramework('To Page 50 clamps to last page', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Only 18 pages exist, so requesting page 50 goes to last page
        await page.locator('button', { hasText: 'To Page 50' }).click();
        await expect(page.locator('#lbCurrentPage')).toContainText('18');
    });

    test.eachFramework('To First and To Last navigate to boundaries', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Go to last
        await page.locator('button', { hasText: 'To Last' }).click();
        await expect(page.locator('#lbCurrentPage')).toContainText('18');

        // Go to first
        await page.locator('button', { hasText: 'To First' }).click();
        await expect(page.locator('#lbCurrentPage')).toContainText('1');
    });
});
