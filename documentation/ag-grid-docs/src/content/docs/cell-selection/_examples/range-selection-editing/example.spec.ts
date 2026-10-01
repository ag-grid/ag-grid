import { dragOverTo, ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Ctrl + D copies the top row of the range down', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Data comes from small-olympic-winners.json (row 0 = Natalie Coughlin, US).
        const source = agIdFor.cell('0', 'athlete');
        await expect(source).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('1', 'athlete')).not.toContainText('Natalie Coughlin');

        await dragOverTo(source, agIdFor.cell('2', 'country'), undefined);
        await page.keyboard.press('Control+d');

        // Every row in the range takes the top row's values, across all range columns.
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('2', 'country')).toContainText('United States');

        // Rows outside the range are untouched.
        await expect(agIdFor.cell('3', 'athlete')).not.toContainText('Natalie Coughlin');
    });

    test.eachFramework('typing then Ctrl + Enter bulk edits the range', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const source = agIdFor.cell('0', 'athlete');
        await dragOverTo(source, agIdFor.cell('2', 'athlete'), undefined);

        // Typing starts an edit on the focused cell; Ctrl + Enter applies it to the whole range.
        await page.keyboard.type('Bulk Value');
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.press('Control+Enter');

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Bulk Value');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Bulk Value');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Bulk Value');
        await expect(agIdFor.cell('3', 'athlete')).not.toContainText('Bulk Value');
    });

    test.eachFramework('Delete clears every cell in the range', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const source = agIdFor.cell('0', 'gold');
        await expect(source).not.toBeEmpty();

        await dragOverTo(source, agIdFor.cell('1', 'silver'), undefined);
        await page.keyboard.press('Delete');

        await expect(agIdFor.cell('0', 'gold')).toBeEmpty();
        await expect(agIdFor.cell('0', 'silver')).toBeEmpty();
        await expect(agIdFor.cell('1', 'gold')).toBeEmpty();
        await expect(agIdFor.cell('1', 'silver')).toBeEmpty();

        // Cells outside the range keep their values.
        await expect(agIdFor.cell('2', 'gold')).not.toBeEmpty();
    });
});
