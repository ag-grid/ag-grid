import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

const COUNTRY_PREFIX = 'row-group-country-';

// Reads the currently-rendered top-level (country) group rows in visual order,
// returning each row id and the text shown in the given group column cell.
async function readTopGroups(page: any, colId: string) {
    return await page.evaluate(
        ({ colId, prefix }: { colId: string; prefix: string }) => {
            const seen = new Set<string>();
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            rows.sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')));
            const out: { id: string; text: string }[] = [];
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
                out.push({ id, text: cell ? (cell.textContent ?? '').trim() : '' });
            }
            return out;
        },
        { colId, prefix: COUNTRY_PREFIX }
    );
}

// Reads the year subgroup rows under a given country group, in visual order.
async function readYearGroups(page: any, parentId: string) {
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
                out.push(id.slice(parentPrefix.length));
            }
            return out;
        },
        { parentPrefix: `${parentId}-year-` }
    );
}

const countryOf = (text: string) => text.replace(/\s*\(\d+\)\s*$/, '').trim();

test.agExample(import.meta, () => {
    // Docs: "sorting the country and year columns will sort the row groups". The colDefs set
    // country sort 'desc' and year sort 'asc', so the group rows are ordered accordingly.
    test.eachFramework('country desc / year asc applied to group rows', async ({ page }) => {
        await waitForGridContent(page);

        const groups = await readTopGroups(page, GROUP_AUTO_COLUMN_ID);
        expect(groups.length).toBeGreaterThan(1);

        // Top-level country groups sorted descending by country name.
        for (let i = 0, len = groups.length - 1; i < len; ++i) {
            expect(countryOf(groups[i].text).localeCompare(countryOf(groups[i + 1].text))).toBeGreaterThanOrEqual(0);
        }

        // year subgroups within the first (expanded) country are sorted ascending.
        const years = (await readYearGroups(page, groups[0].id)).map(Number);
        expect(years.length).toBeGreaterThan(1);
        for (let i = 0, len = years.length - 1; i < len; ++i) {
            expect(years[i]).toBeLessThanOrEqual(years[i + 1]);
        }
    });

    // Docs: "clicking to sort the Group column applies sorting to the country and year columns".
    test.eachFramework('sorting the Group column re-sorts the row groups', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const before = (await readTopGroups(page, GROUP_AUTO_COLUMN_ID)).map((g) => g.id);
        expect(before.length).toBeGreaterThan(1);

        await agIdFor.headerCell(GROUP_AUTO_COLUMN_ID).click();
        await page.waitForTimeout(300);

        const after = (await readTopGroups(page, GROUP_AUTO_COLUMN_ID)).map((g) => g.id);
        // Applying a sort via the Group column reorders the country groups.
        expect(after).not.toEqual(before);
    });
});
