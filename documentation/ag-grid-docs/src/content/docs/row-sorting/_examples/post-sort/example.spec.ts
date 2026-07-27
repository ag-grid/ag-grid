import {
    ensureGridReady,
    expect,
    orderedValues,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Post-sort pins Ireland rows to the top', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country is sorted asc, but postSortRows floats every Ireland row to the top.
        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            expect(countries.length).toBeGreaterThan(1);
            expect(countries[0]).toBe('Ireland');
        }).toPass();
    });

    test.eachFramework('Ireland stays on top after re-sorting another column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // postSortRows runs after any sort, so Ireland remains pinned when we sort by athlete.
        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);
        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            expect(countries[0]).toBe('Ireland');
        }).toPass();
    });
});
