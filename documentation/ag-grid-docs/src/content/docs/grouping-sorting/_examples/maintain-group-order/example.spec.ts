import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

const COUNTRY_PREFIX = 'row-group-country-';
// groupDisplayType 'multipleColumns' gives each group level its own (sortable) column.
const COUNTRY_COL_ID = `${GROUP_AUTO_COLUMN_ID}-country`;
const YEAR_COL_ID = `${GROUP_AUTO_COLUMN_ID}-year`;

// Reads the rendered top-level (country) group rows in visual order, returning their ids.
async function readCountryOrder(page: any) {
    return await page.evaluate(
        ({ prefix }: { prefix: string }) => {
            const seen = new Set<string>();
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            rows.sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')));
            const out: string[] = [];
            for (let i = 0, len = rows.length; i < len; ++i) {
                const id = rows[i].getAttribute('row-id');
                if (!id || seen.has(id)) {
                    continue;
                }
                seen.add(id);
                if (!id.startsWith(prefix) || id.slice(prefix.length).includes('-year-')) {
                    continue;
                }
                out.push(id);
            }
            return out;
        },
        { prefix: COUNTRY_PREFIX }
    );
}

// Reads the year subgroup rows under a given country group, in visual order.
async function readYearOrder(page: any, parentId: string) {
    return await page.evaluate(
        ({ parentPrefix }: { parentPrefix: string }) => {
            const seen = new Set<string>();
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            rows.sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')));
            const out: string[] = [];
            for (let i = 0, len = rows.length; i < len; ++i) {
                const id = rows[i].getAttribute('row-id');
                if (!id || seen.has(id) || !id.startsWith(parentPrefix)) {
                    continue;
                }
                seen.add(id);
                out.push(id);
            }
            return out;
        },
        { parentPrefix: `${parentId}-year-` }
    );
}

test.agExample(import.meta, () => {
    // Docs: with groupMaintainOrder=true, "sorting a leaf column sorts the rows inside each group;
    // groups stay in structural order".
    test.eachFramework('sorting a leaf column keeps country groups structural', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const before = await readCountryOrder(page);
        expect(before.length).toBeGreaterThan(1);

        // Sort the Total leaf column.
        await agIdFor.headerCell('total').click();
        await page.waitForTimeout(300);

        const after = await readCountryOrder(page);
        // Country groups remain in their structural order despite the leaf sort.
        expect(after).toEqual(before);
    });

    // Docs: "Sorting a group column at one level only re-orders that level's groups; sibling levels
    // keep their structural order. ... sorting `year` re-orders year groups within each country,
    // while country groups remain in their structural slot."
    test.eachFramework('sorting the Year group column isolates to that level', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const countriesBefore = await readCountryOrder(page);
        expect(countriesBefore.length).toBeGreaterThan(0);
        const yearsBefore = await readYearOrder(page, countriesBefore[0]);
        expect(yearsBefore.length).toBeGreaterThan(1);

        // Sort the Year group column.
        await agIdFor.headerCell(YEAR_COL_ID).click();
        await page.waitForTimeout(300);

        const countriesAfter = await readCountryOrder(page);
        const yearsAfter = await readYearOrder(page, countriesBefore[0]);

        // Country level keeps its structural order...
        expect(countriesAfter).toEqual(countriesBefore);
        // ...while the year groups within the first country are re-ordered by the sort.
        expect(yearsAfter).not.toEqual(yearsBefore);
    });
});
