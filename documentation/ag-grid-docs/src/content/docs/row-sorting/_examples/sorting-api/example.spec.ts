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

function expectSorted(values: string[], direction: 'asc' | 'desc') {
    expect(values.length).toBeGreaterThan(1);
    const sorted = [...values].sort((a, b) => (direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
    expect(values).toEqual(sorted);
}

function expectLexicographicallySorted(primary: string[], secondary: string[]) {
    expect(primary.length).toBeGreaterThan(1);
    for (let i = 1, len = primary.length; i < len; ++i) {
        const primaryCmp = primary[i - 1].localeCompare(primary[i]);
        expect(primaryCmp).toBeLessThanOrEqual(0);
        if (primaryCmp === 0) {
            expect(secondary[i - 1].localeCompare(secondary[i])).toBeLessThanOrEqual(0);
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
        await expect(async () => expectSorted(await orderedValues(page, 'athlete'), 'asc')).toPass();
    });

    test.eachFramework('Athlete Descending button sorts athlete descending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Athlete Descending');
        await waitForRowAnimations(page);
        await expect(agIdFor.headerCell('athlete').locator('.ag-sort-descending-icon')).toBeVisible();
        await expect(async () => expectSorted(await orderedValues(page, 'athlete'), 'desc')).toPass();
    });

    test.eachFramework('Country, then Sport applies a two-column sort', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Country, then Sport');
        await waitForRowAnimations(page);
        await expect(async () => {
            expectLexicographicallySorted(await orderedValues(page, 'country'), await orderedValues(page, 'sport'));
        }).toPass();
    });

    test.eachFramework('Sport, then Country applies a two-column sort', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await clickButton(page, 'Sport, then Country');
        await waitForRowAnimations(page);
        await expect(async () => {
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
        await expect(async () => expectSorted(await orderedValues(page, 'athlete'), 'desc')).toPass();
    });
});
