import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the first displayed row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps, United States.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Buttons log displayed row info to the console', async ({ page }) => {
        const messages: string[] = [];
        page.on('console', (msg) => messages.push(msg.text()));

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Get Displayed Row 0' }).click();
        await page.getByRole('button', { name: 'Get Displayed Row Count' }).click();

        // Retry until both button clicks have emitted their console logs over CDP.
        // getDisplayedRowAtIndex(0) => first row is Michael Phelps in 2008.
        await expect(() => {
            expect(messages.some((m) => m.includes('getDisplayedRowAtIndex(0) => Michael Phelps 2008'))).toBe(true);
            expect(messages.some((m) => m.includes('getDisplayedRowCount() =>'))).toBe(true);
        }).toPass();
    });
});
