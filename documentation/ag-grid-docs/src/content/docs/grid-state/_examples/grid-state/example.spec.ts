import { clickHeaderToSort, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The grid records every state change (onStateUpdated) and, when recreated, seeds the new
// grid from the previous grid's state so sort/filter/etc. are restored. State changes and
// getState() are logged to the console via the Print State / Recreate buttons.
test.agExample(import.meta, () => {
    test.eachFramework('Sorting fires the state updated event', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // onStateUpdated logs 'State updated' whenever the grid state changes.
        await expect(() => {
            expect(logs.some((l) => l.includes('State updated'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });

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

    test.eachFramework('Recreating the grid restores the applied sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // Recreate destroys the grid and seeds the new one from the previous state.
        await page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true }).click();
        await waitForGridContent(page);

        // The ascending sort on 'age' survives the destroy/recreate cycle via the restored state.
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
    });
});
