import { clickAllButtons, ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // Minimal smoke test: grid renders and basic interactions run without errors.
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
    });
});
