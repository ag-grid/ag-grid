import { expect, test } from '@playwright/test';

const EXAMPLE_ASSETS_BASE_URL = 'https://www.ag-grid.com/example-assets/';

// All top level *.json files in the example-assets directory (non-recursive)
const assetFiles = [
    'call-data.json',
    'master-detail-data.json',
    'master-detail-dynamic-data.json',
    'master-detail-dynamic-row-height-data.json',
    'monthly-sales.json',
    'olympic-winners.json',
    'row-data.json',
    'small-company-data.json',
    'small-olympic-winners.json',
    'small-row-data.json',
    'small-space-mission-data.json',
    'small-tree-data.json',
    'space-mission-data.json',
    'stocks.json',
    'tree-data.json',
    'weather-se-england.json',
    'wide-spread-of-sports.json',
];

// Test can be used to prime the cache with example assets
test.describe('Prime Example assets', () => {
    /// only run on chrome
    test(`should fetch `, async ({ page }) => {
        await page.routeFromHAR('./e2e/.cache/example-assets.har', {
            url: 'https://www.ag-grid.com/example-assets/*.json',
            update: true,
        });
        for (const file of assetFiles) {
            const url = `${EXAMPLE_ASSETS_BASE_URL}${file}`;
            const response = await page.goto(url);
            // Check that the file loads successfully (status 200)
            expect(response && response.status()).toBe(200);
        }
    });

    //load all frameworks and cache the assets from jsdeliver
    // test(`should cache example assets from jsdeliver`, async ({ page }) => {
    //     await page.routeFromHAR('./e2e/.cache/jsdeliver.har', {
    //         url: 'https://cdn.jsdelivr.net/npm/**/*',
    //         update: true,
    //     });

    //     for (const file of assetFiles) {
    //         const url = `https://cdn.jsdelivr.net/npm/ag-grid-docs-example-assets@latest/${file}`;
    //         const response = await page.goto(url);
    //         // Check that the file loads successfully (status 200)
    //         expect(response && response.status()).toBe(200);
    //     }
    // });
});
