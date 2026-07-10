import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Rows: 0 age/14, 1 gender/Female, 2 mood/Happy, 3 age/21, 4 gender/Male, 5 mood/Sad.
    test.eachFramework('displays the typed value rows', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'type')).toContainText('age');
        await expect(agIdFor.cell('0', 'value')).toContainText('14');
        await expect(agIdFor.cell('1', 'type')).toContainText('gender');
        await expect(agIdFor.cell('1', 'value')).toContainText('Female');
        await expect(agIdFor.cell('2', 'type')).toContainText('mood');
        await expect(agIdFor.cell('2', 'value')).toContainText('Happy');
    });

    test.eachFramework('selects the numeric editor for an age row', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'value');
        await cell.dblclick();
        // cellEditorSelector returns the custom NumericCellEditor for type === 'age'.
        const input = cell.locator('input.simple-input-editor').first();
        await expect(input).toBeVisible();
        await input.fill('30');
        await input.press('Enter');
        await expect(cell).toContainText('30');
    });

    test.eachFramework('selects the popup mood editor for a mood row', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('2', 'value');
        await cell.dblclick();
        // cellEditorSelector returns the custom MoodEditor (popup) for type === 'mood'.
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();
        // Two smiley images are offered for selection.
        await expect(popupEditor.locator('img')).toHaveCount(2);
    });
});
