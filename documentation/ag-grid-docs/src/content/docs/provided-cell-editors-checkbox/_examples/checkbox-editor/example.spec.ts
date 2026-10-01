import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editorCheckbox = (page: any) => page.locator('.ag-checkbox-edit input[type="checkbox"]').first();

test.agExample(import.meta, () => {
    // agCheckboxCellEditor over boolean values (!!(index % 2)): even rows are false, odd rows true.
    // Boolean cell values render as the Checkbox Cell Renderer; the editor appears on edit.
    test.eachFramework('renders the boolean values as checkboxes', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'boolean').locator('input[type="checkbox"]')).not.toBeChecked();
        await expect(agIdFor.cell('1', 'boolean').locator('input[type="checkbox"]')).toBeChecked();
    });

    test.eachFramework('editing toggles a false value to true', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Focus the cell away from the rendered checkbox, then start editing with F2.
        const cell = agIdFor.cell('0', 'boolean');
        await cell.click({ position: { x: 150, y: 15 } });
        await page.keyboard.press('F2');

        // The checkbox editor appears, reflecting the current (false) value.
        await expect(editorCheckbox(page)).toBeVisible();
        await expect(editorCheckbox(page)).not.toBeChecked();

        // Toggle to true and commit.
        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');

        await expect(page.locator('.ag-checkbox-edit')).toHaveCount(0);
        await expect(cell.locator('input[type="checkbox"]')).toBeChecked();
    });

    test.eachFramework('editing toggles a true value to false', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('1', 'boolean');
        await cell.click({ position: { x: 150, y: 15 } });
        await page.keyboard.press('F2');

        await expect(editorCheckbox(page)).toBeVisible();
        await expect(editorCheckbox(page)).toBeChecked();

        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');

        await expect(page.locator('.ag-checkbox-edit')).toHaveCount(0);
        await expect(cell.locator('input[type="checkbox"]')).not.toBeChecked();
    });

    // Docs: "by default the Checkbox Cell Renderer is shown, and the editor is only displayed
    // when you start editing".
    test.eachFramework('shows the renderer and no editor before editing starts', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'boolean').locator('input[type="checkbox"]')).toBeVisible();
        await expect(page.locator('.ag-checkbox-edit')).toHaveCount(0);
    });

    // Docs: editing is started "e.g. double click within the cell".
    test.eachFramework('double click starts editing and shows the checkbox editor', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'boolean').dblclick();

        await expect(editorCheckbox(page)).toBeVisible();
        await expect(editorCheckbox(page)).not.toBeChecked();
    });
});
