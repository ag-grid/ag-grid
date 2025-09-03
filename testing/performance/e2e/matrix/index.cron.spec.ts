import type { ElementHandle } from '@playwright/test';

import type { TestCase } from '../../benchmarking';
import { getCdnUrl } from '../../benchmarking';
import test from '../../benchmarking';
import { waitFor } from '../../playwright.utils';

let showBtn: ElementHandle<HTMLButtonElement>;

const url = 'https://localhost:4610/testing/performance/e2e/matrix/index.html';
const athleteCheck = () => document.body.textContent!.includes('Tony Smith');
test(`Performance Test - `, {
    timeout: 20 * 60_000,
    minIterations: 300,
    maxIterations: 500,
    warmupIterations: 5,
    testCases: [
        [10, 10],
        [10, 100],
        [10, 1000],
        [100000, 1000],
        [100, 10],
        [1000, 10],
        [10000, 10],
        [100000, 10],
    ].map(
        ([rowCount, columnCount]) =>
            ({
                name: 'example',
                description: 'Scheduled: demo pages', // currently only full load, but scrolling, filtering, grouping, etc. will be added later
                framework: 'reactFunctionalTs',
                control: {
                    version: 'local',
                    url: `${url}?enterprise=${getCdnUrl('ag-grid-enterprise', 'local', '')}&community=${getCdnUrl('ag-grid-community', 'local', '')}`,
                },
                variant: {
                    version: 'staging',
                    url: `${url}?enterprise=${getCdnUrl('ag-grid-enterprise', 'staging', '')}&community=${getCdnUrl('ag-grid-community', 'staging', '')}`,
                },
                preSetup: async (page) => {
                    showBtn = (await page.waitForSelector('#show')) as ElementHandle<HTMLButtonElement>;
                    const resetBtn = (await page.waitForSelector('#reset')) as ElementHandle<HTMLButtonElement>;
                    const cols = (await page.waitForSelector('#cols')) as ElementHandle<HTMLInputElement>;
                    const rows = (await page.waitForSelector('#rows')) as ElementHandle<HTMLInputElement>;
                    await resetBtn.click();
                    await rows.fill((rowCount / 1000).toFixed(3));
                    await cols.fill(columnCount.toString());
                },
                setupPreActions: (page) =>
                    page.evaluate(() => {
                        performance.clearMarks();
                        performance.clearMeasures();
                    }),
                actions: async (page) => {
                    await Promise.all([showBtn.click(), waitFor(athleteCheck, page)]);
                },
                metrics: 'renderTime',
            }) as TestCase
    ),
});
