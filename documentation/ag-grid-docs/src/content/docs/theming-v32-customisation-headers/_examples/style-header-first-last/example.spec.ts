import { clickAllButtons, ensureGridReady, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
            await ensureGridReady(page);
            await waitForGridContent(page);
            await clickAllButtons(page);
            // END PLACEHOLDER
        },
        // The example uses the deprecated `theme: 'legacy'`, which logs warning #306.
        { allowedConsoleMessages: ['warning #306'] }
    );
});
