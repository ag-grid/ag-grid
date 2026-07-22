import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('enableClickSelection true selects and deselects on click', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Default control value is 'true' — clicking a row selects it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // Clicking the selected row again deselects it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('setting enableClickSelection false disables click selection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await page.locator('#select-enable').selectOption('false');
        await waitForRowAnimations(page);

        // With click selection disabled, clicking a row does not select it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
