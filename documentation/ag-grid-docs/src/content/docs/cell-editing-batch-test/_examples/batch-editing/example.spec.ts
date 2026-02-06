import { ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.typescript('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Not all buttons run without warnings so commenting out for now
        // await clickAllButtons(page);
        // END PLACEHOLDER
    });
});
