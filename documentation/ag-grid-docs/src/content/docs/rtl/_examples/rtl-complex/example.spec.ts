import { clickAllButtons, ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.typescript('Example', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
    });
});
