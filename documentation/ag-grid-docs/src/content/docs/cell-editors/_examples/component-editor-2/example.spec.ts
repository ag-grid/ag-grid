import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0: { first_name: 'Bob', last_name: 'Harrison', age: 15, gender: 'Male', mood: 'Happy' }
    test.eachFramework('displays the mix of provided and custom components', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'first_name')).toContainText('Bob');
        await expect(agIdFor.cell('0', 'last_name')).toContainText('Harrison');
        await expect(agIdFor.cell('0', 'age')).toContainText('15');
        // Gender uses a custom cell renderer that prints the value alongside an icon.
        await expect(agIdFor.cell('0', 'gender')).toContainText('Male');
        // Mood uses an image renderer.
        await expect(agIdFor.cell('0', 'mood').locator('img')).toBeVisible();
    });

    test.eachFramework('edits a cell with the provided text editor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'first_name');
        await cell.dblclick();
        const input = cell.locator('input').first();
        await expect(input).toBeVisible();
        await input.fill('Alice');
        await input.press('Enter');
        await expect(cell).toContainText('Alice');
    });

    test.eachFramework('edits a cell with the custom text editor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'last_name');
        await cell.dblclick();
        const input = cell.locator('input.my-simple-editor').first();
        await expect(input).toBeVisible();
        await input.fill('Smith');
        await input.press('Enter');
        await expect(cell).toContainText('Smith');
    });

    // The Provided Number column uses agNumberCellEditor.
    test.eachFramework('edits a cell with the provided number editor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'age');
        await expect(cell).toContainText('15');

        await cell.dblclick();
        const input = cell.locator('input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('21');
        await input.press('Enter');

        await expect(cell).toContainText('21');
    });

    // The Provided Rich Select column offers Male/Female and renders the list with GenderRenderer.
    test.eachFramework('edits a cell with the provided rich select editor', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'gender');
        await expect(cell.locator('i.fa.fa-male')).toBeVisible();

        await cell.dblclick();
        const rows = page.locator('.ag-rich-select-row');
        await expect(rows).toHaveCount(2);
        // The same cell component is used for the editor list entries.
        await expect(rows.locator('i.fa-male')).toHaveCount(1);
        await expect(rows.locator('i.fa-female')).toHaveCount(1);

        // The row is identified by its rendered icon rather than its text, since the renderer
        // wraps the label alongside the icon.
        await rows
            .filter({ has: page.locator('i.fa-female') })
            .first()
            .click();
        await expect(cell).toContainText('Female');
        await expect(cell.locator('i.fa.fa-female')).toBeVisible();
    });

    // The Custom Mood column is a popup editor (cellEditorPopup) that commits via params.stopEditing().
    test.eachFramework('edits a cell with the custom popup mood editor', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood');
        await expect(cell.locator('img')).toHaveAttribute('src', /happy\.png/);

        await cell.dblclick();
        // The editor container carries no class in this example, so select the popup images directly.
        const popupImages = page.locator('.ag-popup img');
        await expect(popupImages).toHaveCount(2);

        // Clicking the sad smiley selects it and stops editing in one go.
        await popupImages.nth(1).click();
        await expect(cell.locator('img')).toHaveAttribute('src', /sad\.png/);
    });

    // MoodEditor handles the left/right arrow keys itself rather than letting the grid navigate.
    test.eachFramework('arrow keys change the mood in the popup editor', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood');
        await cell.dblclick();
        await expect(page.locator('.ag-popup img')).toHaveCount(2);

        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');

        await expect(cell.locator('img')).toHaveAttribute('src', /sad\.png/);
    });
});
