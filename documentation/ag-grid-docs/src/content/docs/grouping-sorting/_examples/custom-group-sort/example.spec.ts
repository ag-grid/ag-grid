import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

const COUNTRY_PREFIX = 'row-group-country-';

// Reads the rendered top-level (country) group rows in visual order, returning the
// leaf-child count shown in each group cell (the trailing "(N)").
async function readTopGroupCounts(page: any, colId: string) {
    return await page.evaluate(
        ({ colId, prefix }: { colId: string; prefix: string }) => {
            const seen = new Set<string>();
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            rows.sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')));
            const out: number[] = [];
            for (let i = 0, len = rows.length; i < len; ++i) {
                const id = rows[i].getAttribute('row-id');
                if (!id || seen.has(id)) {
                    continue;
                }
                seen.add(id);
                if (!id.startsWith(prefix) || id.slice(prefix.length).includes('-year-')) {
                    continue;
                }
                const cell = rows[i].querySelector(`[col-id="${colId}"]`);
                const match = /\((\d+)\)\s*$/.exec(cell ? (cell.textContent ?? '') : '');
                out.push(match ? Number(match[1]) : NaN);
            }
            return out;
        },
        { colId, prefix: COUNTRY_PREFIX }
    );
}

test.agExample(import.meta, () => {
    // Docs: the autoGroupColumnDef.comparator "ignores the data entirely, sorting rows by the
    // number of descendants instead" (nodeA.allLeafChildren.length - nodeB.allLeafChildren.length).
    // The comparator only takes effect once the Group column is sorted; the group cell shows the
    // descendant count as "(N)". Ascending sort => counts ascending, descending sort => descending.
    test.eachFramework('sorting the Group column orders groups by descendant count', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // First click applies an ascending sort to the Group column.
        await agIdFor.headerCell(GROUP_AUTO_COLUMN_ID).click();
        await page.waitForTimeout(300);

        const asc = await readTopGroupCounts(page, GROUP_AUTO_COLUMN_ID);
        expect(asc.length).toBeGreaterThan(1);
        for (let i = 0, len = asc.length; i < len; ++i) {
            expect(Number.isNaN(asc[i])).toBe(false);
        }
        for (let i = 0, len = asc.length - 1; i < len; ++i) {
            expect(asc[i]).toBeLessThanOrEqual(asc[i + 1]);
        }

        // Second click flips to a descending sort.
        await agIdFor.headerCell(GROUP_AUTO_COLUMN_ID).click();
        await page.waitForTimeout(300);

        const desc = await readTopGroupCounts(page, GROUP_AUTO_COLUMN_ID);
        expect(desc.length).toBeGreaterThan(1);
        for (let i = 0, len = desc.length - 1; i < len; ++i) {
            expect(desc[i]).toBeGreaterThanOrEqual(desc[i + 1]);
        }
    });
});
