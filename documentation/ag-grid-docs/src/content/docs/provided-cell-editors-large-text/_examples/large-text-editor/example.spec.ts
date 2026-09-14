import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const textArea = (page: any) => page.locator('.ag-large-text textarea').first();

const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

test.agExample(import.meta, () => {
    // agLargeTextCellEditor (popup) - a standard HTML textarea for multi-line text.
    test.eachFramework('double-click shows a textarea editor and commits a new value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        await cell.dblclick();

        await expect(textArea(page)).toBeVisible();

        await textArea(page).fill('An updated multi-line description.');
        // Plain Enter commits the large text editor (shift+Enter inserts a newline).
        await textArea(page).press('Enter');

        await expect(cell).toContainText('An updated multi-line description.');
    });

    // This column sets no maxLength/rows/cols, so the documented defaults apply:
    // maxLength 200, rows 10, cols 60.
    test.eachFramework('the textarea uses the default maxLength, rows and cols', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'description').dblclick();

        await expect(textArea(page)).toBeVisible();
        await expect(textArea(page)).toHaveAttribute('maxlength', '200');
        await expect(textArea(page)).toHaveAttribute('rows', '10');
        await expect(textArea(page)).toHaveAttribute('cols', '60');
    });

    // The docs pair agLargeTextCellEditor with `cellEditorPopup: true`, so the editor is rendered
    // in a popup rather than inline within the cell.
    test.eachFramework('the editor is shown in a popup, not inline', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        // The description value is a fixed Lorem ipsum string.
        await expect(cell).toContainText(LOREM);

        await cell.dblclick();

        await expect(page.locator('.ag-popup-editor .ag-large-text')).toHaveCount(1);
        await expect(cell.locator('.ag-large-text')).toHaveCount(0);
        await expect(textArea(page)).toHaveValue(LOREM);
    });

    // The editor's key handling: shift+Enter inserts a newline and keeps the editor open,
    // while plain Enter commits.
    test.eachFramework('shift+Enter inserts a newline and keeps the editor open', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        await cell.dblclick();
        await expect(textArea(page)).toBeVisible();

        await textArea(page).fill('First line');
        await textArea(page).press('Shift+Enter');
        await textArea(page).pressSequentially('Second line');

        // The editor is still open and now holds two lines.
        await expect(textArea(page)).toBeVisible();
        await expect(textArea(page)).toHaveValue('First line\nSecond line');

        // Plain Enter then commits the multi-line value.
        await textArea(page).press('Enter');
        await expect(page.locator('.ag-large-text')).toHaveCount(0);
        await expect(cell).toContainText('First line');
        await expect(cell).toContainText('Second line');
    });
});
