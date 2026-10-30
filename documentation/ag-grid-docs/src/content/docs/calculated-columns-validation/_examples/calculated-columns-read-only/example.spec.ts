import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'application definitions are view-only while user columns remain editable',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.cell('0', 'grossMargin')).toContainText('32.4%');
            const header = agIdFor.headerCell('grossMargin');
            await header.hover();
            await header.locator('.ag-header-cell-menu-button').click();
            await expect(page.getByRole('menuitem', { name: 'Remove Calculated Column' })).toHaveAttribute(
                'aria-disabled',
                'true'
            );
            await page.getByRole('menuitem', { name: 'View Calculated Column' }).click();

            const dialog = page.getByRole('dialog', { name: 'View Calculated Column' });
            await expect(dialog.getByRole('textbox', { name: 'Title', exact: true })).toBeFocused();
            for (const name of ['Title', 'Expression']) {
                const field = dialog.getByRole('textbox', { name, exact: true });
                await expect(field).toBeEnabled();
                await expect(field).toHaveAttribute('readonly', '');
                await field.focus();
                await expect(field).toBeFocused();
                const value = await field.inputValue();
                await field.press('ControlOrMeta+A');
                expect(
                    await field.evaluate((input: HTMLInputElement | HTMLTextAreaElement) => [
                        input.selectionStart,
                        input.selectionEnd,
                    ])
                ).toEqual([0, value.length]);
                await field.press('Backspace');
                await expect(field).toHaveValue(value);
            }
            const type = dialog.getByRole('combobox', { name: 'Type', exact: true });
            await expect(type).toHaveAttribute('aria-readonly', 'true');
            await expect(type).toHaveText('Number');
            await type.click();
            await expect(type).toBeFocused();
            for (const key of ['ArrowDown', 'Enter', 'Space']) {
                await type.press(key);
                await expect(type).toHaveAttribute('aria-expanded', 'false');
            }
            await expect(page.locator('.ag-select-list')).toHaveCount(0);
            await type.press('ControlOrMeta+A');
            expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('Number');
            await type.press('Backspace');
            await expect(type).toHaveText('Number');
            await expect(dialog.getByRole('textbox', { name: 'Expression', exact: true })).toHaveValue(
                '([Revenue] - [Cost]) / [Revenue]'
            );
            await expect(dialog.getByRole('button', { name: 'Columns', exact: true })).toBeHidden();
            await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeHidden();
            await dialog.locator('.ag-panel-title-bar-button').click();

            await header.hover();
            await header.locator('.ag-header-cell-menu-button').click();
            await page.getByRole('menuitem', { name: 'Add Calculated Column' }).click();
            const expression = page.locator('.ag-calculated-column-form textarea');
            await expect(expression).toBeEditable();
            await expression.fill('[Revenue] - [Cost]');
            await expect(agIdFor.cell('0', 'calculated_1')).toContainText('46000');
        }
    );
});
