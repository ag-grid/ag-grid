import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Save State captures the current grid state, Recreate Grid with No State throws it away
// (fresh grid), and Set State restores the saved state onto the existing grid via
// api.setState(). We drive that round-trip with a sort so the restore is observable.
test.agExample(import.meta, () => {
    test.eachFramework(
        'Save then Set State restores the sort after recreating with no state',
        async ({ agIdFor, page }) => {
            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);

            await ensureGridReady(page);
            await waitForGridContent(page);

            // Apply a sort so there is meaningful state to save.
            await agIdFor.headerCell('age').click();
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

            // Wait for the state-updated event so the captured state includes the sort.
            await expect(() => {
                expect(logs.some((l) => l.includes('State updated'))).toBe(true);
            }).toPass();

            await page.getByRole('button', { name: 'Save State', exact: true }).click();
            await expect(() => {
                expect(logs.some((l) => l.includes('Saved state'))).toBe(true);
            }).toPass();

            // Recreate with no state: the fresh grid has no sort.
            await page.getByRole('button', { name: 'Recreate Grid with No State', exact: true }).click();
            await waitForGridContent(page);
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');

            // Set State restores the saved sort onto the running grid.
            await page.getByRole('button', { name: 'Set State', exact: true }).click();
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
            await expect(() => {
                expect(logs.some((l) => l.includes('Set state'))).toBe(true);
            }).toPass();

            page.off('console', handler);
        }
    );

    test.eachFramework('Print State logs the current grid state', async ({ page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Print State', exact: true }).click();
        await expect(() => {
            expect(logs.some((l) => l.includes('Grid state'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });
});
