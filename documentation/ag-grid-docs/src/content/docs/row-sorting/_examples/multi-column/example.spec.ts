import {
    ensureGridReady,
    expect,
    orderedValues,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

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
        // ControlOrMeta sends Meta on macOS, where Ctrl+click is a context-menu gesture; the grid
        // accepts either modifier for the 'ctrl' multi-sort key.
        await agIdFor.headerCell('gold').click({ modifiers: ['ControlOrMeta'] });
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
