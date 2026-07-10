import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Custom protection controls are present with defaults', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The password input defaults to 'secret' and the allow-toggles start unchecked.
        await expect(page.locator('#worksheetPassword')).toHaveValue('secret');
        await expect(page.locator('#allowAutoFilter')).not.toBeChecked();
        await expect(page.locator('#allowFormatCells')).not.toBeChecked();

        await page.locator('#allowAutoFilter').check();
        await expect(page.locator('#allowAutoFilter')).toBeChecked();
    });

    test.eachFramework('Sorting the athlete column reorders rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Aleksey Nemov (data index 1) is the alphabetically-first athlete.
        const aleksey = agIdFor.rowNode('1');
        await expect(aleksey).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('athlete').click();

        await expect(aleksey).toHaveAttribute('row-index', '0');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
    });
});
