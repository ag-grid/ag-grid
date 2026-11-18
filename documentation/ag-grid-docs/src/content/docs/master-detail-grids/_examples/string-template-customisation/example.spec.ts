import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail rows use a static string template with a fixed title', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The custom string template replaces the default detail wrapper, so locate the detail grid by its
        // eDetailGrid host. onFirstDataRendered expands the row at index 1, so one detail grid renders on load.
        const detail = page.locator('[data-ref="eDetailGrid"]');
        await expect(detail).toHaveCount(1);
        await expect(detail).toBeVisible();

        // The custom string template wraps the detail grid with a fixed 'Call Details' title.
        await expect(page.locator('.ag-full-width-row')).toContainText('Call Details');

        // The eDetailGrid ref still hosts a fully functional detail grid with the call-record columns.
        await expect(detail.locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Number',
            'Duration',
            'Switch Code',
        ]);
    });
});
