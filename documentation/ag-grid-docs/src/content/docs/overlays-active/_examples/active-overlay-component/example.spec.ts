import { clickAllButtons, ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await clickAllButtons(page);
    });
});
