import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('buttons show the column menu and column chooser', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // showColumnMenu('age') opens the age column menu
        await page.locator('button', { hasText: 'Show Age Column Menu' }).click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);

        // showColumnChooser() opens the column chooser
        await page.locator('button', { hasText: 'Show Column Chooser' }).click();
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toBeVisible();

        // hideColumnChooser() closes it again
        await page.locator('button', { hasText: 'Hide Column Chooser' }).click();
        await expect(page.locator('.ag-column-select-column-label', { hasText: 'Gold' })).toHaveCount(0);
    });

    test.eachFramework(
        'column chooser follows the grid tab order with default and external popup parents',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            await page.evaluate(() => {
                const grid = document.querySelector('.ag-root-wrapper')!;
                const after = document.createElement('input');
                const popupParent = document.createElement('div');
                const final = document.createElement('input');
                after.id = 'focus-after-grid';
                after.value = 'After grid';
                popupParent.id = 'external-popup-parent';
                final.id = 'focus-after-popup-parent';
                final.value = 'After popup parent';
                grid.after(after, popupParent, final);
            });

            await page.locator('button', { hasText: 'Show Column Chooser' }).click();
            const dialog = page.locator('.ag-dialog');
            await expect(dialog).toBeVisible();
            const after = page.locator('#focus-after-grid');

            await dialog.evaluate((element) => {
                element.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom')!.focus();
            });
            await expect(after).toBeFocused();

            await page.evaluate(() => {
                document.querySelector('#external-popup-parent')!.appendChild(document.querySelector('.ag-popup')!);
            });

            await after.click();
            await page.keyboard.press('Shift+Tab');
            await expect(dialog).toContainText('Columns');
            expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

            await dialog.evaluate((element) => {
                element.querySelector<HTMLElement>(':scope > .ag-tab-guard-bottom')!.focus();
            });
            await expect(after).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(page.locator('#focus-after-popup-parent')).toBeFocused();
        }
    );
});
