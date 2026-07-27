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
function stripHistory(dom: string | null): string | null {
    return (
        dom
            ?.replace(/(class="ag-aria-description-container">).*?(<\/div>)/g, '$1$2')
            .replace(/ag-overlay-loading-wrapper /g, '') ?? null
    );
}

type Page = Parameters<typeof serializeGridDom>[0];

const recreateButton = (page: Page) =>
    page.getByRole('button', { name: 'Recreate Grid with Current State', exact: true });

// Serialise the rendered grid once it has settled: loading is complete, scrolling has stopped
// (`ag-scrollbar-scrolling` is transient mid-settle), and rows are not mid-animation. A freshly
// created grid also applies measured scrollbar sizing and header classes over subsequent frames, so
// poll until two consecutive serialisations agree rather than capturing part-way through settling.
async function captureSettledGrid(page: Page) {
    await expect(page.locator('.ag-overlay-loading-center')).toHaveCount(0);
    await waitForRowAnimations(page);
    await expect(page.locator('.ag-scrollbar-scrolling')).toHaveCount(0);
    let previous: string | null = null;
    let current: string | null = null;
    await expect(async () => {
        previous = current;
        current = stripHistory(await serializeGridDom(page));
        expect(current).toBe(previous);
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

    // Drive the grid through as many state sections as can be applied purely through the UI —
    // sort, row grouping + an expanded group, an opened column group, a pinned column, and an open
    // side bar with a hidden column — then snapshot the rendered grid, recreate it from the
    // captured state, and assert it renders identically.
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
