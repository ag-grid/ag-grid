import { clickAllButtons, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // PLACEHOLDER - MINIMAL TEST TO ENSURE GRID LOADS WITHOUT ERRORS
        await ensureGridReady(page);
        await waitForGridContent(page);
        await clickAllButtons(page);
        // END PLACEHOLDER
    });

    test.eachFramework('loads the IBM Plex Sans font stylesheet', async ({ page }) => {
        // Regression (RTI-3399): @astrojs/react@5 post-processes React component output
        // with a regex that strips <link> tags, which silently dropped the example-runner
        // font <link> from built standalone example pages (falling back to system UI). The
        // font now renders via ExampleStyle.astro through Astro's native pipeline.
        await expect(page.locator('link[rel="stylesheet"][href*="IBM+Plex+Sans"]')).toHaveCount(1);
    });
});
