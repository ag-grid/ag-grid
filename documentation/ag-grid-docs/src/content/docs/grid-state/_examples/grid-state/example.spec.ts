import {
    ensureGridReady,
    expect,
    serializeGridDom,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

// Attributes that differ across a destroy/recreate cycle without reflecting restored state:
// `grid-id` and the root `data-testid` embed a monotonic grid-instance counter, and tab-guard
// `tabindex` toggles with transient focus. Ignored when comparing the rendered grid before and
// after recreate — column/row identity is still compared via `col-id` / `row-id`.
const RECREATE_VOLATILE_ATTRIBUTES = ['grid-id', 'data-testid', 'tabindex'];

// Serialise the rendered grid once it has settled. `ag-scrollbar-scrolling` is a transient class
// present mid-scroll-settle, so wait for it to clear first — otherwise a snapshot can capture the
// grid at a different point in the scroll-settle than its counterpart.
async function captureSettledGrid(page: Parameters<typeof serializeGridDom>[0]) {
    await waitForRowAnimations(page);
    await expect(page.locator('.ag-scrollbar-scrolling')).toHaveCount(0);
    return serializeGridDom(page, { ignoreAttributes: RECREATE_VOLATILE_ATTRIBUTES });
}

// The grid records every state change (onStateUpdated) and, when recreated, seeds the new
// grid from the previous grid's state so sort/filter/etc. are restored. State changes and
// getState() are logged to the console via the Print State / Recreate buttons.
test.agExample(import.meta, () => {
    test.eachFramework('Sorting fires the state updated event', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        const handler = (msg: { text: () => string }) => logs.push(msg.text());
        page.on('console', handler);

        await ensureGridReady(page);
        await waitForGridContent(page);

        // Click the sort label rather than the cell centre: age is narrow (maxWidth 90) with an
        // always-visible menu button, so a centre click can land on the menu button instead.
        await agIdFor.headerCell('age').locator('.ag-header-cell-label').click();
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

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Print State', exact: true }).click();
        await expect(() => {
            expect(logs.some((l) => l.includes('Grid state'))).toBe(true);
        }).toPass();

        page.off('console', handler);
    });

    test.eachFramework('Recreating the grid restores the applied sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('age').locator('.ag-header-cell-label').click();
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');

        // Recreate destroys the grid and seeds the new one from the previous state.
        await page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true }).click();
        await waitForGridContent(page);

        // The ascending sort on 'age' survives the destroy/recreate cycle via the restored state.
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'ascending');
    });

    test.eachFramework('Recreating the grid restores a runtime-added calculated column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
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
        await page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true }).click();
        await waitForGridContent(page);

        // The calculated column is recreated from the restored userColumns state.
        await expect(calculatedHeader()).toBeVisible();
        await expect(page.locator('.ag-row[row-id="0"] .ag-cell', { hasText: '33' }).first()).toBeVisible();
    });

    // Drive the grid through as many state sections as can be applied purely through the UI —
    // sort, row grouping + an expanded group, an opened column group, a pinned column, a
    // runtime-added calculated column, and an open side bar with a hidden column — then snapshot
    // the rendered grid, recreate it from the captured state, and assert it renders identically.
    test.eachFramework('Recreating the grid restores the whole rendered grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Sort (column state).
        await agIdFor.headerCell('age').locator('.ag-header-cell-label').click();
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

        // Snapshot the rendered grid, then recreate from the captured state.
        const before = await captureSettledGrid(page);
        expect(before).not.toBeNull();

        await page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true }).click();
        await waitForGridContent(page);
        await expect(agIdFor.headerCell('ag-Grid-AutoColumn')).toBeVisible();

        // The recreated grid renders identically to the pre-recreate snapshot.
        expect(await captureSettledGrid(page)).toBe(before);
    });

    test.eachFramework('Recreating the grid restores the current page', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Move to the second page (pagination state).
        await page.locator('[aria-label="Next Page"]').click();

        const before = await captureSettledGrid(page);
        expect(before).not.toBeNull();

        await page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true }).click();
        await waitForGridContent(page);

        expect(await captureSettledGrid(page)).toBe(before);
    });
});
