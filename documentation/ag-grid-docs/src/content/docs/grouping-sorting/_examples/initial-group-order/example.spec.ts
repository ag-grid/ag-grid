import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

const COUNTRY_PREFIX = 'row-group-country-';
// groupDisplayType 'multipleColumns' gives each group level its own column.
const COUNTRY_COL_ID = `${GROUP_AUTO_COLUMN_ID}-country`;

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
    // Docs: with no sorting applied, initialGroupOrderComparator orders group rows "based on the
    // number of leaf children" (nodeA.allLeafChildren.length - nodeB.allLeafChildren.length).
    // The group cell shows that count as "(N)", so the initial group order is ascending by count.
    test.eachFramework('initial group order ascending by leaf-child count', async ({ page }) => {
        await waitForGridContent(page);

        // A group cell exists before its renderer has written the "(N)" count into it, so read and
        // assert together: a partially-rendered pass reads NaN and is retried rather than failing.
        await expect(async () => {
            const counts = await readTopGroupCounts(page, COUNTRY_COL_ID);
            expect(counts.length).toBeGreaterThan(1);
            for (let i = 0, len = counts.length; i < len; ++i) {
                expect(Number.isNaN(counts[i])).toBe(false);
            }
            for (let i = 0, len = counts.length - 1; i < len; ++i) {
                expect(counts[i]).toBeLessThanOrEqual(counts[i + 1]);
            }
        }).toPass();
    });
});
