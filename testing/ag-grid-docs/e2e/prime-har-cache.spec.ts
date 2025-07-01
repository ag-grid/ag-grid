import { expect, test } from '@playwright/test';

const EXAMPLE_ASSETS_BASE_URL = 'https://www.ag-grid.com/example-assets/';

// Get all .json files in the example-assets directory (non-recursive)
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
    test(`should fetch `, async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium', 'This test only runs on chromium');

        await page.routeFromHAR('./cache/example-assets.har', {
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
});
