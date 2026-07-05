import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Both registration styles render the same custom cell', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps / United States.
        // One column registers the renderer by name ('medalRenderer'), the other
        // by direct reference (MedalRenderer). Both use the same MedalRenderer, so
        // both cells show the country value plus the "Push For Total" button.
        const byName = agIdFor.cell('0', 'country');
        const byReference = agIdFor.cell('0', 'country_1');

        await expect(byName).toContainText('United States', { useInnerText: true });
        await expect(byName.locator('button')).toContainText('Push For Total');

        await expect(byReference).toContainText('United States', { useInnerText: true });
        await expect(byReference.locator('button')).toContainText('Push For Total');
    });

    test.eachFramework('Custom renderer button logs the total on click', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const messages: string[] = [];
        page.on('console', (msg) => messages.push(msg.text()));

        // Michael Phelps won 8 medals in 2008 (first data row) so the renderer's
        // click handler logs "8 medals won!".
        await agIdFor.cell('0', 'country').locator('button').click();

        await expect(page.locator('body')).toBeVisible();
        await page.waitForTimeout(300);
        expect(messages.some((m) => m.includes('8 medals won!'))).toBe(true);
    });
});
