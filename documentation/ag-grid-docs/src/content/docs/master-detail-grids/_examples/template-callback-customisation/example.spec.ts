import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail rows use a dynamic template showing the master row name', async ({
        agIdFor,
        agFramework,
        page,
    }) => {
        test.skip(agFramework.includes('react'), 'Example not for React.');

        await ensureGridReady(page);
        await waitForGridContent(page);

        // The custom function template replaces the default detail wrapper. onFirstDataRendered expands the
        // row at index 1 (Mila Smith), so one detail grid renders on load.
        const detailHosts = page.locator('[data-ref="eDetailGrid"]');
        await expect(detailHosts).toHaveCount(1);

        // The function template builds a title from the master row's data, e.g. 'Name: Mila Smith'.
        await expect(page.locator('.ag-full-width-row', { hasText: 'Name: Mila Smith' })).toBeVisible();

        // Expanding a different master row produces a template titled with that row's name.
        await agIdFor.groupContracted('3', 'name').click();
        await expect(detailHosts).toHaveCount(2);
        await expect(page.locator('.ag-full-width-row', { hasText: 'Name: Harper Johnson' })).toBeVisible();
    });
});
