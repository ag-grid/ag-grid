import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Header names can be set and removed', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Columns start with the field-derived header names.
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');

        // Set Header Names applies 'C{index}' to every column.
        await page.getByRole('button', { name: 'Set Header Names', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toContainText('C0');
        await expect(agIdFor.headerCell('age')).toContainText('C1');

        // Remove Header Names reverts to the defaults.
        await page.getByRole('button', { name: 'Remove Header Names' }).click();
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');
    });

    test.eachFramework('Value formatters can be set and removed', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Set Value Formatters wraps each value with '[ ... ]'.
        await page.getByRole('button', { name: 'Set Value Formatters', exact: true }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('[ Michael Phelps ]');
        await expect(agIdFor.cell('0', 'gold')).toContainText('[ 8 ]');

        // Remove Value Formatters reverts to raw values.
        await page.getByRole('button', { name: 'Remove Value Formatters' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'athlete')).not.toContainText('[');
    });
});
