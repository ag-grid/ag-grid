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

// dd/mm/yyyy -> comparable yyyymmdd number (mirrors the example's dateComparator).
function toComparableDate(date: string): number {
    const year = Number.parseInt(date.substring(6, 10));
    const month = Number.parseInt(date.substring(3, 5));
    const day = Number.parseInt(date.substring(0, 2));
    return year * 10000 + month * 100 + day;
}

test.agExample(import.meta, () => {
    test.eachFramework('Athlete column is sorted descending on load', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // athlete has sort: 'desc' in the colDef, so the descending indicator shows on load.
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).toBeVisible();

        const athletes = await orderedValues(page, 'athlete');
        expect(athletes.length).toBeGreaterThan(1);
        const sortedDesc = [...athletes].sort((a, b) => b.localeCompare(a));
        expect(athletes).toEqual(sortedDesc);
    });

    test.eachFramework('Year column shows the un-sorted icon when not sorted', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // year has unSortIcon: true, so it renders the up/down icon while it has no sort applied.
        await expect(agIdFor.headerCell('year').locator('.ag-sort-none-icon')).toBeVisible();
        await expect(agIdFor.headerCell('year').locator('.ag-sort-ascending-icon')).not.toBeVisible();
        await expect(agIdFor.headerCell('year').locator('.ag-sort-descending-icon')).not.toBeVisible();
    });

    test.eachFramework('Date column sorts chronologically via the custom comparator', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('date').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('date').locator('.ag-sort-ascending-icon')).toBeVisible();

        // With the date comparator the strings sort as dates, not lexicographically.
        await expect(async () => {
            const dates = (await orderedValues(page, 'date')).map(toComparableDate);
            expect(dates.length).toBeGreaterThan(1);
            const sortedAsc = [...dates].sort((a, b) => a - b);
            expect(dates).toEqual(sortedAsc);
        }).toPass();
    });
});
