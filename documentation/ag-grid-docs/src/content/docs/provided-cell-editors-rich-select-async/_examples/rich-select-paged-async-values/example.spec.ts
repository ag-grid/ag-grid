import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should load first page of values and display languages in expected format',
        async ({ agIdFor, page }) => {
            // Verify the first cell shows a value in the expected format
            const cell = agIdFor.cell('0', 'language');
            const cellText = await cell.textContent();
            expect(cellText).toMatch(/^Language \d+$/);

            // Double-click to open the rich select editor
            await cell.dblclick();

            // Wait for the popup to appear
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Wait for the first page to load (300ms server delay)
            const firstOption = popup.locator('.ag-rich-select-row').first();
            await expect(firstOption).toBeVisible({ timeout: 5000 });

            // Verify options follow the expected pattern
            const firstOptionText = await firstOption.textContent();
            expect(firstOptionText).toMatch(/^Language \d+$/);

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should update cell value when selecting an option from the paged dropdown',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'language');

            // Open editor
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Wait for first page to load
            const firstOption = popup.locator('.ag-rich-select-row').first();
            await expect(firstOption).toBeVisible({ timeout: 5000 });

            // Read the text of the first visible option (initial page position depends on current cell value)
            const optionText = (await firstOption.textContent())!.trim();

            // Click it and verify the cell updates to that value
            await firstOption.click();
            await expect(cell).toContainText(optionText);
        }
    );
});
