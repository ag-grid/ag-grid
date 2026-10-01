import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cells with notes have indicator class', async ({ agIdFor }) => {
        // Row 1 athlete and Row 3 country have pre-seeded notes
        const notedCell1 = agIdFor.cell('1', 'athlete');
        const notedCell2 = agIdFor.cell('3', 'country');
        const emptyCell = agIdFor.cell('2', 'athlete');

        await expect(notedCell1).toHaveClass(/ag-has-cell-notes/);
        await expect(notedCell2).toHaveClass(/ag-has-cell-notes/);
        await expect(emptyCell).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Hovering a noted cell shows the note popup', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.hover();

        // Wait for the note popup to appear
        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        // Verify the note text is displayed
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'Confirm the athlete biography before the next review.'
        );
    });

    test.eachFramework('Hovering a noted cell opens the note flush to the cell edge', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        const cellBox = await notedCell.boundingBox();
        const popupBox = await popup.boundingBox();

        expect(cellBox).toBeTruthy();
        expect(popupBox).toBeTruthy();
        expect(Math.abs(popupBox!.x - (cellBox!.x + cellBox!.width))).toBeLessThanOrEqual(2);
        expect(Math.abs(popupBox!.y - cellBox!.y)).toBeLessThanOrEqual(2);
    });

    test.eachFramework('Widening a note keeps the textarea width in sync with the popup', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.hover();

        const popup = page.locator('.ag-notes-popup');
        const input = popup.locator('.ag-text-area-input');
        const resizer = popup.locator('.ag-resizer-bottomRight');
        await expect(popup).toBeVisible();

        const beforePopupBox = await popup.boundingBox();
        const beforeInputBox = await input.boundingBox();
        const resizerBox = await resizer.boundingBox();

        expect(beforePopupBox).toBeTruthy();
        expect(beforeInputBox).toBeTruthy();
        expect(resizerBox).toBeTruthy();

        await page.mouse.move(resizerBox!.x + resizerBox!.width / 2, resizerBox!.y + resizerBox!.height / 2);
        await page.mouse.down();
        await page.mouse.move(
            resizerBox!.x + resizerBox!.width / 2 + 260,
            resizerBox!.y + resizerBox!.height / 2 + 20,
            { steps: 10 }
        );
        await page.mouse.up();

        const afterPopupBox = await popup.boundingBox();
        const afterInputBox = await input.boundingBox();

        expect(afterPopupBox).toBeTruthy();
        expect(afterInputBox).toBeTruthy();

        const popupDelta = afterPopupBox!.width - beforePopupBox!.width;
        const inputDelta = afterInputBox!.width - beforeInputBox!.width;

        expect(popupDelta).toBeGreaterThan(180);
        expect(inputDelta).toBeGreaterThan(180);
        expect(Math.abs(popupDelta - inputDelta)).toBeLessThanOrEqual(24);
    });

    test.eachFramework('Shift + F2 opens the note for the focused cell', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.click();

        await page.keyboard.press('Shift+F2');

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'Confirm the athlete biography before the next review.'
        );
    });

    test.eachFramework('Shift + F2 creates a note on a cell that has none', async ({ agIdFor, page }) => {
        const emptyCell = agIdFor.cell('2', 'athlete');
        await emptyCell.click();

        await page.keyboard.press('Shift+F2');

        // A new, empty note editor opens for the focused cell.
        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue('');
    });

    test.eachFramework('The context menu offers the note actions', async ({ agIdFor, page }) => {
        // A cell with a note offers edit and remove.
        await agIdFor.cell('1', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menuOption('Edit Note')).toBeVisible();
        await expect(agIdFor.menuOption('Remove Note')).toBeVisible();
        await page.keyboard.press('Escape');

        // A cell without one offers Add Note instead.
        await agIdFor.cell('2', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menuOption('Add Note')).toBeVisible();
        await expect(agIdFor.menuOption('Edit Note')).toHaveCount(0);
        await page.keyboard.press('Escape');
    });

    test.eachFramework('Remove Note clears the note and its indicator', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await expect(notedCell).toHaveClass(/ag-has-cell-notes/);

        await notedCell.click({ button: 'right' });
        await agIdFor.menuOption('Remove Note').click();

        await expect(notedCell).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Grid renders correct data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Usain Bolt');
        await expect(agIdFor.cell('3', 'country')).toContainText('United States');
    });
});
