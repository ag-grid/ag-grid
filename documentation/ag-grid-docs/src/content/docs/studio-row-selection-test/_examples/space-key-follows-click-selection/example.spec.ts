import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Space on a row does not select it when click selection is disabled',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await agIdFor.cell('0', 'athlete').first().click();
            await page.keyboard.press('Space');
            await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
        }
    );

    test.eachFramework('Space on the checkbox cell still toggles the row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Space');
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await page.keyboard.press('Space');
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        'Space on a row selects but does not deselect with enableSelection',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await page.locator('#select-enable').selectOption('enableSelection');
            await waitForRowAnimations(page);

            await agIdFor.cell('0', 'athlete').first().click();
            await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

            await page.keyboard.press('Space');
            await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        }
    );
});
