import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    serializeGridDom,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

// The example sets an explicit `gridId`, so `grid-id` and the root `data-testid` survive a
// destroy/recreate cycle unchanged.
const GRID_ID = 'gridState';

// Normalise the parts of the serialised grid that record how a state was reached rather than the
// state itself: the aria live region holds the most recent screen-reader announcement, and the
// hidden overlay keeps the class of whichever overlay was last shown — only the frameworks that
// drive a `loading` flag put up a loading overlay while fetching, and only on the first fetch.
function stripHistory(dom: string): string {
    return dom
        .replace(/(class="ag-aria-description-container">).*?(<\/div>)/g, '$1$2')
        .replace(/ag-overlay-loading-wrapper /g, '');
}

type Page = Parameters<typeof serializeGridDom>[0];

const recreateButton = (page: Page) =>
    page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true });

// Group header cells carry no colId-based test id that survives a rename, so locate them by the
// name they currently display.
const groupHeader = (page: Page, name: string) => page.locator('.ag-header-group-cell', { hasText: name });

// Serialise the rendered grid once it has settled: loading is complete, scrolling has stopped
// (`ag-scrollbar-scrolling` is transient mid-settle), and rows are not mid-animation. A freshly
// created grid also applies measured scrollbar sizing and header classes over subsequent frames, so
// poll until two consecutive serialisations agree rather than capturing part-way through settling.
const SETTLED_REPEATS = 3;

async function captureSettledGrid(page: Page) {
    await expect(page.locator('.ag-overlay-loading-center')).toHaveCount(0);
    await waitForRowAnimations(page);
    await expect(page.locator('.ag-scrollbar-scrolling')).toHaveCount(0);
    let stableFor = 0;
    let previous: string | null = null;
    let current: string | null = null;
    await expect(async () => {
        previous = current;
        current = stripHistory(await serializeGridDom(page));
        stableFor = current === previous ? stableFor + 1 : 0;
        expect(stableFor).toBeGreaterThanOrEqual(SETTLED_REPEATS);
    }).toPass();
    return current;
}

// The grid records every state change (onStateUpdated) and, when recreated, seeds the new
// grid from the previous grid's state so sort/filter/etc. are restored. State changes and
// getState() are logged to the console via the Print State / Recreate buttons.
test.agExample(import.meta, () => {
    test.eachFramework('Sorting fires the state updated event', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // onStateUpdated logs 'State updated' whenever the grid state changes.
        await expect(() => {
            expect(logs.some((l) => l.includes('State updated'))).toBe(true);
        }).toPass();

        page.off('console', handler);
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

    test.eachFramework('Recreating the grid restores the applied sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // Recreate destroys the grid and seeds the new one from the previous state.
        await recreateButton(page).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // The ascending sort on 'age' survives the destroy/recreate cycle via the restored state.
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
    });

    test.eachFramework('Recreating the grid restores a runtime-added calculated column', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Add a calculated column at runtime via the 'age' header menu.
        const ageHeader = agIdFor.headerCell('age');
        await ageHeader.hover();
        await ageHeader.locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Add Calculated Column' }).click();

        const form = page.locator('.ag-calculated-column-form');
        await expect(form).toBeVisible();

        // Live apply (the default) commits the column as the form is edited: set a title,
        // a numeric type and an expression referencing the Age column.
        await form.locator('.ag-input-field-input').first().fill('Age Plus Ten');
        await form.locator('.ag-picker-field').click();
        await page.locator('.ag-select-list .ag-list-item', { hasText: 'Number' }).click();
        await form.locator('textarea').fill('[Age] + 10');

        // Close the dialog; the runtime-added column remains.
        await page.keyboard.press('Escape');
        await expect(form).toBeHidden();

        // The calculated column renders: Michael Phelps (age 23) => 33.
        const calculatedHeader = () =>
            page.locator('.ag-header-cell.ag-calculated-column').filter({ hasText: 'Age Plus Ten' });
        await expect(calculatedHeader()).toBeVisible();
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '33' }).first()).toBeVisible();

        // Recreate destroys the grid and seeds the new one from the previous state.
        await recreateButton(page).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // The calculated column is recreated from the restored userColumns state.
        await expect(calculatedHeader()).toBeVisible();
        await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '33' }).first()).toBeVisible();
    });

    test.eachFramework('Recreating the grid restores edited header names', async ({ agIdFor, page }) => {
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

        // Recreate destroys the grid and seeds the new one from the previous state.
        await recreateButton(page).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Both edited names survive the destroy/recreate cycle via the restored state.
        await expect(agIdFor.headerCell('athlete')).toContainText('Competitor');
        await expect(groupHeader(page, 'Podium')).toBeVisible();
    });

    // Drive the grid through as many state sections as can be applied purely through the UI —
    // sort, row grouping + an expanded group, an opened column group, a pinned column, a
    // runtime-added calculated column, and an open side bar with a hidden column — then snapshot
    // the rendered grid, recreate it from the captured state, and assert it renders identically.
    test.eachFramework('Recreating the grid restores the whole rendered grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Sort (column state).
        await clickHeaderToSort(agIdFor.headerCell('age'));
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
        await waitForRowAnimations(page);

        // Row group by country (column state) via the column menu.
        const countryHeader = agIdFor.headerCell('country');
        await countryHeader.hover();
        await countryHeader.locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Group by Country' }).click();
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();
        await waitForRowAnimations(page);

        // Expand the first group row (expanded row groups).
        await page.locator('.ag-group-contracted').first().click();
        await waitForRowAnimations(page);

        // Open the Medals column group (opened column groups) — the only group with columnGroupShow children.
        await page
            .locator('.ag-header-group-cell', { hasText: 'Medals' })
            .locator('.ag-header-expand-icon-collapsed')
            .click();
        await expect(agIdFor.headerCell('silver')).toBeVisible();

        // Pin the athlete column left (column state) via the column menu.
        const athleteHeader = agIdFor.headerCell('athlete');
        await athleteHeader.hover();
        await athleteHeader.locator('.ag-header-cell-menu-button').click();
        // 'Pin Column' opens a submenu on hover; the pin options live inside it.
        await page.locator('.ag-menu-option', { hasText: 'Pin Column' }).hover();
        await page.locator('.ag-menu-option-text', { hasText: 'Pin Left' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);

        // Add a runtime calculated column (userColumns state) via the age header menu.
        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCell('age').locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Add Calculated Column' }).click();
        const form = page.locator('.ag-calculated-column-form');
        await expect(form).toBeVisible();
        await form.locator('.ag-input-field-input').first().fill('Age Plus Ten');
        await form.locator('.ag-picker-field').click();
        await page.locator('.ag-select-list .ag-list-item', { hasText: 'Number' }).click();
        await form.locator('textarea').fill('[Age] + 10');
        await page.keyboard.press('Escape');
        await expect(form).toBeHidden();
        await expect(
            page.locator('.ag-header-cell.ag-calculated-column').filter({ hasText: 'Age Plus Ten' })
        ).toBeVisible();

        // Hide the date column (column state) via the Columns tool panel, which the open side bar
        // (side bar state) shows by default.
        await expect(agIdFor.columnToolPanel()).toBeVisible();
        await agIdFor.columnSelectListItemCheckbox('Date Column').click();
        await expect(agIdFor.headerCell('date')).toBeHidden();

        // Tab guards only sit in the tab order while focus is outside the grid, and recreating leaves
        // focus on the Recreate button, so both snapshots are taken with that button focused.
        await recreateButton(page).focus();

        // Snapshot the rendered grid, then recreate from the captured state.
        const before = await captureSettledGrid(page);
        expect(before).not.toBeNull();

        await recreateButton(page).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();

        // The recreated grid renders identically to the pre-recreate snapshot.
        expect(await captureSettledGrid(page)).toBe(before);
    });

    test.eachFramework('Recreating the grid restores the current page', async ({ page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Move to the second page (pagination state). Page size is 100, so the second page starts at
        // row-index 100 — a recreated grid renders page one first and moves to the restored page a
        // moment later, so this is the anchor for both captures being of the same page.
        await page.locator('[aria-label="Next Page"]').click();
        const firstRowOfSecondPage = page.locator('.ag-grid-scrolling-container .ag-row[row-index="100"]');
        await expect(firstRowOfSecondPage).toBeVisible();

        // Clicking Next Page left focus inside the grid, which takes the tab guards out of the tab
        // order — park focus where recreating leaves it so both snapshots agree.
        await recreateButton(page).focus();

        const before = await captureSettledGrid(page);
        expect(before).not.toBeNull();

        await recreateButton(page).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expect(firstRowOfSecondPage).toBeVisible();

        expect(await captureSettledGrid(page)).toBe(before);
    });
});
