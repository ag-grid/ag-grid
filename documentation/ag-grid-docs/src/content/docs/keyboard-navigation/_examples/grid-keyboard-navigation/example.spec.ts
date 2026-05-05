import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('arrow key navigation between cells', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.cell('0', 'sport')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('1', 'sport')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowLeft');
        await expect(agIdFor.cell('1', 'country')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp from first row cell enters floating filter', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.floatingFilter('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowUp from floating filter enters column header', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.floatingFilter('athlete')).toBeFocused();

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowUp from column header enters group header', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowUp');
        const participantHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Participant' }).first();
        await expect(participantHeader).toBeFocused();
    });

    test.eachFramework(
        'ArrowDown from group header down through column header, floating filter into cell',
        async ({ agIdFor, page }) => {
            await agIdFor.cell('0', 'athlete').click();
            await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

            // Navigate up to floating filter
            await page.keyboard.press('ArrowUp');
            await expect(agIdFor.floatingFilter('athlete')).toBeFocused();

            // Navigate up to column header
            await page.keyboard.press('ArrowUp');
            await expect(agIdFor.headerCell('athlete')).toBeFocused();

            // Navigate up to group header
            await page.keyboard.press('ArrowUp');
            const participantHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Participant' }).first();
            await expect(participantHeader).toBeFocused();

            // Navigate back down through column header
            await page.keyboard.press('ArrowDown');
            await expect(agIdFor.headerCell('athlete')).toBeFocused();

            // Navigate down to floating filter
            await page.keyboard.press('ArrowDown');
            await expect(agIdFor.floatingFilter('athlete')).toBeFocused();

            // Navigate down into cell
            await page.keyboard.press('ArrowDown');
            await expect(page.locator('[row-index="0"] [col-id="athlete"]')).toHaveClass(/ag-cell-focus/);
        }
    );

    test.eachFramework('ArrowRight and ArrowLeft between column headers', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('country')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('sport')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('total')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('year')).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(agIdFor.headerCell('total')).toBeFocused();
    });

    test.eachFramework('ArrowRight and ArrowLeft between floating filters', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.floatingFilter('athlete')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('country')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('sport')).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(agIdFor.floatingFilter('country')).toBeFocused();
    });

    test.eachFramework('Tab right through cells', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'sport')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework(
        'Shift+Tab from first cell enters floating filter row at last column',
        async ({ agIdFor, page }) => {
            await agIdFor.cell('0', 'ag-Grid-SelectionColumn').click();
            await expect(agIdFor.cell('0', 'ag-Grid-SelectionColumn')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('Shift+Tab');
            await expect(agIdFor.floatingFilter('year')).toBeFocused();
        }
    );

    test.eachFramework('Tab from last floating filter enters first cell', async ({ agIdFor, page }) => {
        // Navigate to floating filter for athlete then arrow right to reach year
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.floatingFilter('athlete')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('country')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('sport')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('total')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.floatingFilter('year')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('[row-index="0"] [col-id="ag-Grid-SelectionColumn"]')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab right through column headers', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('country')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('sport')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('country')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('Tab from last column header enters floating filter row', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('year').click();
        await expect(agIdFor.headerCell('year')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.floatingFilter('ag-Grid-SelectionColumn')).toBeFocused();
    });

    test.eachFramework('Enter on floating filter focuses filter input, Escape exits', async ({ agIdFor, page }) => {
        // Use year (agNumberColumnFilter) — its floating filter input is enabled. Text filters (athlete) are disabled.
        await agIdFor.cell('0', 'year').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.floatingFilter('year')).toBeFocused();

        await page.keyboard.press('Enter');
        await expect(agIdFor.floatingFilter('year').locator('input[type="number"]')).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(agIdFor.floatingFilter('year')).toBeFocused();
    });
});
