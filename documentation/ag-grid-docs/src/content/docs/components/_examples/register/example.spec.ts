import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Both registration styles render the same custom cell',
        async ({ agFramework, agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // First row of olympic-winners.json is Michael Phelps / United States.
            // The renderer is registered by name ('medalRenderer'), so the first
            // 'country' column shows the country value plus the "Push For Total" button.
            const byName = agIdFor.cell('0', 'country');

            await expect(byName).toContainText('United States', { useInnerText: true });
            await expect(byName.locator('button')).toContainText('Push For Total');

            // Direct reference registration (passing the component itself to
            // cellRenderer) is only a documented pattern for JS/React/Angular. Vue
            // registers components by name only, so its example omits the second
            // column and there is no 'country_1' to assert against.
            if (agFramework === 'vue3') {
                return;
            }

            const byReference = agIdFor.cell('0', 'country_1');

            await expect(byReference).toContainText('United States', { useInnerText: true });
            await expect(byReference.locator('button')).toContainText('Push For Total');
        }
    );

    test.eachFramework('Custom renderer button logs the total on click', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const messages: string[] = [];
        page.on('console', (msg) => messages.push(msg.text()));

        // Michael Phelps won 8 medals in 2008 (first data row) so the renderer's
        // click handler logs "8 medals won!".
        await agIdFor.cell('0', 'country').locator('button').click();

        // The click handler logs synchronously, but the message arrives over CDP
        // asynchronously; retry until the captured logs contain it.
        await expect(() => {
            expect(messages.some((m) => m.includes('8 medals won!'))).toBe(true);
        }).toPass();
    });
});
