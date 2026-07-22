import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Read a column's rendered values in top-to-bottom display order (by row-index).
async function orderedValues(page: Page, colId: string): Promise<string[]> {
    const rows = await page.locator('.ag-row[row-index]').all();
    const seen = new Map<number, string>();
    for (let i = 0, len = rows.length; i < len; ++i) {
        const row = rows[i];
        const idxAttr = await row.getAttribute('row-index');
        if (idxAttr == null) {
            continue;
        }
        const idx = Number(idxAttr);
        if (seen.has(idx)) {
            continue;
        }
        const cell = row.locator(`[col-id="${colId}"]`);
        if ((await cell.count()) === 0) {
            continue;
        }
        seen.set(idx, ((await cell.first().innerText()) ?? '').trim());
    }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

function compare(a: string, b: string, isNumeric: boolean): number {
    return isNumeric ? Number(a) - Number(b) : a.localeCompare(b);
}

// Assert two parallel columns form a lexicographically non-decreasing (primary, secondary) sequence.
function expectLexicographicallySorted(
    primary: string[],
    secondary: string[],
    primaryIsNumeric = false,
    secondaryIsNumeric = false
) {
    expect(primary.length).toBeGreaterThan(1);
    for (let i = 1, len = primary.length; i < len; ++i) {
        const primaryCmp = compare(primary[i - 1], primary[i], primaryIsNumeric);
        expect(primaryCmp).toBeLessThanOrEqual(0);
        if (primaryCmp === 0) {
            expect(compare(secondary[i - 1], secondary[i], secondaryIsNumeric)).toBeLessThanOrEqual(0);
        }
    }
}

test.agExample(import.meta, () => {
    test.eachFramework('Sorts by country then athlete by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onGridReady applies country asc (sortIndex 0) then athlete asc (sortIndex 1).
        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            const athletes = await orderedValues(page, 'athlete');
            expectLexicographicallySorted(countries, athletes);
        }).toPass();
    });

    test.eachFramework('Ctrl-click adds a secondary sort column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Single click replaces the default sort with age ascending.
        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('age').locator('.ag-sort-ascending-icon')).toBeVisible();

        // multiSortKey: 'ctrl' means Ctrl+click adds gold as a secondary sort rather than replacing.
        await agIdFor.headerCell('gold').click({ modifiers: ['Control'] });
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('gold').locator('.ag-sort-ascending-icon')).toBeVisible();
        await expect(agIdFor.headerCell('age').locator('.ag-sort-ascending-icon')).toBeVisible();

        await expect(async () => {
            const ages = await orderedValues(page, 'age');
            const golds = await orderedValues(page, 'gold');
            expectLexicographicallySorted(ages, golds, true, true);
        }).toPass();
    });
});
