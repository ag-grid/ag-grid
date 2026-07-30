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
