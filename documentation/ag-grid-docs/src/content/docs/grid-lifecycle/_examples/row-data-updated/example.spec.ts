import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// firstDataRendered fires once, on the initial render; rowDataUpdated fires on every data
// change. The example stamps the time of each event above the grid and logs to the console.
// Reloading data re-fires rowDataUpdated but must NOT re-fire firstDataRendered.
test.agExample(import.meta, () => {
    test.eachFramework('Initial load fires firstDataRendered and rowDataUpdated', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'name')).toContainText('Michael Phelps');

        // Both lifecycle events fire once the data has loaded.
        await expect(() => {
            expect(logs.some((l) => l.includes('First Data Rendered'))).toBe(true);
            expect(logs.some((l) => l.includes('Row Data Updated'))).toBe(true);
            expect(logs.some((l) => l.includes('Data Loaded'))).toBe(true);
        }).toPass();

        // The timestamps in the header are populated (no longer the '-' placeholder).
        await expect(page.locator('#firstDataRendered .value')).not.toHaveText('-');
        await expect(page.locator('#rowDataUpdated .value')).not.toHaveText('-');

        page.off('console', handler);
    });

    test.eachFramework('Reloading data re-fires rowDataUpdated but not firstDataRendered', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Wait for the initial firstDataRendered timestamp so we can prove it stays fixed.
        const firstRenderStamp = page.locator('#firstDataRendered .value');
        await expect(firstRenderStamp).not.toHaveText('-');
        const initialFirstRender = await firstRenderStamp.innerText();

        // Capture only the logs emitted from the reload onward.
        const reloadLogs: string[] = [];
        const handler = (msg: { text: () => string }) => reloadLogs.push(msg.text());
        page.on('console', handler);

        await page.getByRole('button', { name: 'Reload Data', exact: true }).click();

        // rowDataUpdated fires again for the reloaded data.
        await expect(() => {
            expect(reloadLogs.some((l) => l.includes('Row Data Updated'))).toBe(true);
        }).toPass();

        // firstDataRendered is a one-time event: it must not appear again, and its timestamp is unchanged.
        expect(reloadLogs.some((l) => l.includes('First Data Rendered'))).toBe(false);
        await expect(firstRenderStamp).toHaveText(initialFirstRender);

        page.off('console', handler);
    });
});
