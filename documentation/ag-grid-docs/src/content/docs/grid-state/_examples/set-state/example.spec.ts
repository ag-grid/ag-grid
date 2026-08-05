import { clickHeaderToSort, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example sets an explicit `gridId`, so the same selector resolves the grid before and after
// it is recreated.
const GRID_ID = 'setState';

// Group header cells carry no colId-based test id that survives a rename, so locate them by the
// name they currently display.
const groupHeader = (page: Parameters<typeof ensureGridReady>[0], name: string) =>
    page.locator('.ag-header-group-cell', { hasText: name });

// Save State captures the current grid state, Recreate Grid with No State throws it away
// (fresh grid), and Set State restores the saved state onto the existing grid via
// api.setState(). We drive that round-trip with a sort so the restore is observable.
test.agExample(import.meta, () => {
    test.eachFramework(
        'Save then Set State restores the sort after recreating with no state',
        async ({ agIdFor, page }) => {
            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);

            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);

            // Apply a sort so there is meaningful state to save.
            await clickHeaderToSort(agIdFor.headerCell('age'));
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

            // Wait for the state-updated event so the captured state includes the sort.
            await expect(() => {
                expect(logs.some((l) => l.includes('State updated'))).toBe(true);
            }).toPass();

            await page.getByRole('button', { name: 'Save State', exact: true }).click();
            await expect(() => {
                expect(logs.some((l) => l.includes('Saved state'))).toBe(true);
            }).toPass();

            // Recreate with no state: the fresh grid has no sort.
            await page.getByRole('button', { name: 'Recreate Grid with No State', exact: true }).click();
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');

            // Set State restores the saved sort onto the running grid.
            await page.getByRole('button', { name: 'Set State', exact: true }).click();
            await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
            await expect(() => {
                expect(logs.some((l) => l.includes('Set state'))).toBe(true);
            }).toPass();

            page.off('console', handler);
        }
    );

    test.eachFramework('Save then Set State restores edited header names', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Rename a column from its header menu (columnHeaderName state).
        const athlete = agIdFor.headerCell('athlete');
        await athlete.hover();
        await athlete.locator('.ag-header-cell-menu-button').click();
        await page.getByText('Edit Column Name', { exact: true }).click();
        const columnInput = page.locator('.ag-column-header-edit-popup-editor input');
        await expect(columnInput).toHaveValue('Athlete');
        await columnInput.fill('Competitor');
        await columnInput.press('Enter');
        await expect(athlete).toContainText('Competitor');

        // Rename a column group from its header context menu (columnGroup.headerNames state) —
        // group headers have no menu button, so right-click is the only route.
        await groupHeader(page, 'Medals').click({ button: 'right' });
        await page.getByText('Edit Column Name', { exact: true }).click();
        const groupInput = page.locator('.ag-column-header-edit-popup-editor input');
        await expect(groupInput).toHaveValue('Medals');
        await groupInput.fill('Podium');
        await groupInput.press('Enter');
        await expect(groupHeader(page, 'Podium')).toBeVisible();

        await page.getByRole('button', { name: 'Save State', exact: true }).click();

        // Recreate with no state: both headers fall back to their column definition names.
        await page.getByRole('button', { name: 'Recreate Grid with No State', exact: true }).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');
        await expect(groupHeader(page, 'Medals')).toBeVisible();

        // Set State restores both edited names onto the running grid.
        await page.getByRole('button', { name: 'Set State', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toContainText('Competitor');
        await expect(groupHeader(page, 'Podium')).toBeVisible();
    });

    test.eachFramework(
        'Save then Set State restores a runtime-added calculated column, which stays editable in place',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);

            // Add a calculated column from the 'age' header menu, which seats it next to Age.
            const ageHeader = agIdFor.headerCell('age');
            await ageHeader.hover();
            await ageHeader.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Add Calculated Column' }).click();
            const form = page.locator('.ag-calculated-column-form');
            await expect(form).toBeVisible();

            // Live apply (the default) commits the column as the form is edited.
            await form.locator('.ag-input-field-input').first().fill('Age Plus Ten');
            await form.locator('.ag-picker-field').click();
            await page.locator('.ag-select-list .ag-list-item', { hasText: 'Number' }).click();
            await form.locator('textarea').fill('[Age] + 10');
            await page.keyboard.press('Escape');
            await expect(form).toBeHidden();

            const calculatedHeader = (name: string) =>
                page.locator('.ag-header-cell.ag-calculated-column').filter({ hasText: name });
            // Michael Phelps (age 23) => 33.
            await expect(calculatedHeader('Age Plus Ten')).toBeVisible();
            await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '33' }).first()).toBeVisible();

            await page.getByRole('button', { name: 'Save State', exact: true }).click();

            // Recreate with no state: the column is not in `columnDefs`, so nothing recreates it.
            await page.getByRole('button', { name: 'Recreate Grid with No State', exact: true }).click();
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);
            await expect(calculatedHeader('Age Plus Ten')).toHaveCount(0);

            // Set State rebuilds the column on the running grid from the saved userColumns section.
            await page.getByRole('button', { name: 'Set State', exact: true }).click();
            await expect(calculatedHeader('Age Plus Ten')).toBeVisible();
            await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '33' }).first()).toBeVisible();

            // A restored column carries no anchor, so editing it rebuilds the columns down a different
            // path than the one that created it: it must stay put rather than jump to the front of the
            // grid or render up at the column-group header's level.
            await calculatedHeader('Age Plus Ten').hover();
            await calculatedHeader('Age Plus Ten').locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();
            await expect(form).toBeVisible();
            await form.locator('.ag-input-field-input').first().fill('Age Plus Twenty');
            await form.locator('textarea').fill('[Age] + 20');
            await page.keyboard.press('Escape');
            await expect(form).toBeHidden();

            await expect(calculatedHeader('Age Plus Twenty')).toBeVisible();
            await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '43' }).first()).toBeVisible();
            const calcBox = (await calculatedHeader('Age Plus Twenty').boundingBox())!;
            const ageBox = (await agIdFor.headerCell('age').boundingBox())!;
            // Still to the right of Age, and still on the leaf header row rather than a row above it.
            expect(calcBox.x).toBeGreaterThan(ageBox.x);
            expect(calcBox.y).toBe(ageBox.y);
        }
    );

    test.eachFramework('Set State restores a pinned column', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        const athleteHeader = agIdFor.headerCell('athlete');
        await athleteHeader.hover();
        await athleteHeader.locator('.ag-header-cell-menu-button').click();
        // 'Pin Column' opens a submenu on hover; the pin options live inside it.
        await page.locator('.ag-menu-option', { hasText: 'Pin Column' }).hover();
        await page.locator('.ag-menu-option-text', { hasText: 'Pin Left' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);

        await page.getByRole('button', { name: 'Save State', exact: true }).click();

        await page.getByRole('button', { name: 'Recreate Grid with No State', exact: true }).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expect(agIdFor.headerCell('athlete')).not.toHaveClass(/ag-header-cell-last-left-pinned/);

        await page.getByRole('button', { name: 'Set State', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
    });

    test.eachFramework('Set State reverts a sort applied after the state was saved', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Save an unsorted state, then sort.
        await page.getByRole('button', { name: 'Save State', exact: true }).click();
        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // `setState` applies every section it owns, so a section missing from the saved state resets
        // rather than being left alone — the sort applied after the save is undone.
        await page.getByRole('button', { name: 'Set State', exact: true }).click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');
    });

    test.eachFramework('Print State logs the current grid state', async ({ page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Print State', exact: true }).click();
        await expect(() => {
            expect(logs.some((l) => l.includes('Grid state'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });
});
