import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Read a column's rendered values in display order, restricted to the top
// contiguous block of rows (row-index 0, 1, 2, ...).
//
// The grid is virtualised, so only a window of rows is in the DOM at any time.
// A sort also animates rows, briefly leaving "zombie" duplicates that share a
// row-index. To get a stable, in-order slice we:
//   - snapshot the whole DOM in one `page.evaluate` so the read is atomic (no
//     interleaving with an in-flight animation between awaits),
//   - scope to the centre scrolling container (avoids pinned-container dupes),
//   - dedupe by row-index, keeping the live row (non-zero opacity) over a zombie,
//   - return only the contiguous run starting at row-index 0.
// Callers must `waitForRowAnimations` before reading so zombies have cleared.
async function orderedValues(page: Page, colId: string): Promise<string[]> {
    const byIndex = await page.evaluate((col) => {
        const result: Record<number, { value: string; live: boolean }> = {};
        const container = document.querySelector('.ag-grid-scrolling-container');
        if (!container) {
            return result;
        }
        const rows = container.querySelectorAll('.ag-row[row-index]');
        for (const row of rows) {
            const idxAttr = row.getAttribute('row-index');
            if (idxAttr == null) {
                continue;
            }
            const idx = Number(idxAttr);
            const cell = row.querySelector(`[col-id="${col}"]`);
            if (!cell) {
                continue;
            }
            const value = (cell.textContent ?? '').trim();
            const live = (row as HTMLElement).style.opacity !== '0';
            const existing = result[idx];
            // Prefer a live row over a zombie when both share an index.
            if (existing == null || (!existing.live && live)) {
                result[idx] = { value, live };
            }
        }
        return result;
    }, colId);

    const values: string[] = [];
    for (let i = 0; byIndex[i] != null; ++i) {
        values.push(byIndex[i].value);
    }
    return values;
}

// AG Grid's default text comparator orders by UTF-16 code point (a < b / a > b),
// not by locale. localeCompare would disagree on accented names (e.g. "Šárka"
// vs "Štepánka"), which populate the top of the athlete-descending window, so we
// match the grid's comparator here.
function codePointCompare(a: string, b: string): number {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

function expectSorted(values: string[], direction: 'asc' | 'desc') {
    expect(values.length).toBeGreaterThan(1);
    const sorted = [...values].sort((a, b) => (direction === 'asc' ? codePointCompare(a, b) : codePointCompare(b, a)));
    expect(values).toEqual(sorted);
}

function expectLexicographicallySorted(primary: string[], secondary: string[]) {
    expect(primary.length).toBeGreaterThan(1);
    for (let i = 1, len = primary.length; i < len; ++i) {
        const primaryCmp = codePointCompare(primary[i - 1], primary[i]);
        expect(primaryCmp).toBeLessThanOrEqual(0);
        if (primaryCmp === 0) {
            expect(codePointCompare(secondary[i - 1], secondary[i])).toBeLessThanOrEqual(0);
        }
    }
}

const clickButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

test.agExample(import.meta, () => {
    test.eachFramework('Athlete Ascending button sorts athlete ascending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Athlete Ascending');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-ascending-icon')).toBeVisible();
        await expect(async () => {
            await waitForRowAnimations(page);
            expectSorted(await orderedValues(page, 'athlete'), 'asc');
        }).toPass();
    });

    test.eachFramework('Athlete Descending button sorts athlete descending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Athlete Descending');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).toBeVisible();
        await expect(async () => {
            await waitForRowAnimations(page);
            expectSorted(await orderedValues(page, 'athlete'), 'desc');
        }).toPass();
    });

    test.eachFramework('Country, then Sport applies a two-column sort', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Country, then Sport');
        await expect(async () => {
            await waitForRowAnimations(page);
            expectLexicographicallySorted(await orderedValues(page, 'country'), await orderedValues(page, 'sport'));
        }).toPass();
    });

    test.eachFramework('Sport, then Country applies a two-column sort', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Sport, then Country');
        await expect(async () => {
            await waitForRowAnimations(page);
            expectLexicographicallySorted(await orderedValues(page, 'sport'), await orderedValues(page, 'country'));
        }).toPass();
    });

    test.eachFramework('Clear Sort removes the applied sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Athlete Ascending');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-ascending-icon')).toBeVisible();

        await clickButton(page, 'Clear Sort');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-ascending-icon')).not.toBeVisible();
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).not.toBeVisible();
    });

    test.eachFramework('Save Sort and Restore from Save round-trips the sort state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Athlete Descending');
        await waitForRowAnimations(page);
        await clickButton(page, 'Save Sort');

        await clickButton(page, 'Clear Sort');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).not.toBeVisible();

        await clickButton(page, 'Restore from Save');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).toBeVisible();
        await expect(async () => {
            await waitForRowAnimations(page);
            expectSorted(await orderedValues(page, 'athlete'), 'desc');
        }).toPass();
    });
});
