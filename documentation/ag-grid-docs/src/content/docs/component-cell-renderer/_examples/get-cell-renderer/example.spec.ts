import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

/**
 * Re-samples until `predicate` holds or the timeout expires, then returns the last sample for the
 * caller to assert on. The `expect` re-exported from the docs test utils is a bare wrapper
 * function, so Playwright's `expect.poll` is not available here.
 */
async function pollFor<T>(sample: () => T, predicate: (value: T) => boolean, timeoutMs = 5000) {
    const deadline = Date.now() + timeoutMs;
    let value = sample();
    while (!predicate(value) && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        value = sample();
    }
    return value;
}

test.agExample(import.meta, () => {
    test.eachFramework('MedalCellRenderer renders one hash per medal', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Michael Phelps, gold 8 / silver 0 / bronze 0 (olympic-winners.json)
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toHaveText('########');

        // total is a valueGetter of gold + silver + bronze = 8
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('The buttons call medalUserFunction on the matching instances', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));
        const calls = () => logs.filter((line) => line.startsWith('user function called for medal column'));

        // 'Gold' reaches every rendered instance in the gold column, and only that column.
        await page.getByRole('button', { name: 'Gold', exact: true }).click();
        let lines = await pollFor(calls, (l) => l.length > 1);
        expect(lines.length).toBeGreaterThan(1);
        expect(lines.every((line) => line.includes('column = gold'))).toBe(true);
        const goldCalls = lines.length;

        // 'First Row Gold' narrows to a single cell.
        logs.length = 0;
        await page.getByRole('button', { name: 'First Row Gold', exact: true }).click();
        lines = await pollFor(calls, (l) => l.length === 1);
        expect(lines).toHaveLength(1);
        expect(lines[0]).toContain('row = 0');
        expect(lines[0]).toContain('column = gold');

        // 'All Cells' reaches every medal column, so strictly more instances than gold alone.
        logs.length = 0;
        await page.getByRole('button', { name: 'All Cells', exact: true }).click();
        lines = await pollFor(calls, (l) => l.length > goldCalls);
        expect(lines.length).toBeGreaterThan(goldCalls);
        expect(lines.some((line) => line.includes('column = silver'))).toBe(true);
        expect(lines.some((line) => line.includes('column = bronze'))).toBe(true);
    });

    test.eachFramework('Sorting the athlete column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps starts at the top but is not first alphabetically
        const phelps = agIdFor.rowNode('0');
        await expect(phelps).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('athlete').click();
        await expect(phelps).not.toHaveAttribute('row-index', '0');
    });
});
