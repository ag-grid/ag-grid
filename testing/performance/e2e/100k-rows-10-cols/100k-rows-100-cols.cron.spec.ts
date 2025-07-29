import type { ElementHandle } from '@playwright/test';

import type { TestCase } from '../../benchmarking';
import { getUrl } from '../../benchmarking';
import test from '../../benchmarking';
import { waitFor } from '../../playwright.utils';

let showBtn: ElementHandle<HTMLButtonElement>;
let resetBtn: ElementHandle<HTMLButtonElement>;
let cols: ElementHandle<HTMLInputElement>;
let rows: ElementHandle<HTMLInputElement>;

const url = 'https://localhost:4610/testing/performance/e2e/100k-rows-10-cols/index.html';
const athleteCheck = () => document.body.textContent!.includes('Tony Smith');
test(`Performance Test - `, {
    timeout: 10 * 60_000,
    minIterations: 200,
    maxIterations: 300,
    warmupIterations: 5,
    testCases: [
        {
            name: 'example',
            description: 'Scheduled: demo pages',
            control: { version: 'local', url: getUrl({ url }) },
            variant: {
                version: 'staging',
                url: getUrl({ url }),
            },
            preSetup: async (page) => {
                showBtn = (await page.waitForSelector('#show')) as ElementHandle<HTMLButtonElement>;
                resetBtn = (await page.waitForSelector('#reset')) as ElementHandle<HTMLButtonElement>;
                cols = (await page.waitForSelector('#cols')) as ElementHandle<HTMLInputElement>;
                rows = (await page.waitForSelector('#rows')) as ElementHandle<HTMLInputElement>;
                await resetBtn.click();
                await cols.fill('100');
                await rows.fill('100');
            },
            actions: async (page) => {
                await Promise.all([showBtn.click(), waitFor(athleteCheck, page)]);
            },
        } as TestCase,
    ],
});
