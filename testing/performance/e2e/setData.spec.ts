import path from 'path';

import test from '../benchmarking';
import { waitFor } from '../playwright.utils';

const noRowsCheck = () => document.body.textContent!.includes('No Rows To Show');
const athleteCheck = () => document.body.textContent!.includes('Athlete');
const localLotsOfCells = `file://${path.join(__dirname, './lots-of-cells.html')}`;

test(`Performance Test - Compare performance of setting data`, {
    timeout: 40 * 60_000,
    minIterations: 100,
    testCases: [
        {
            name: 'Set data (lots): staging vs local',
            framework: 'typescript',
            control: { version: 'staging', url: localLotsOfCells, shouldInjectScript: true },
            variant: { version: 'local', url: localLotsOfCells, shouldInjectScript: true },
            preSetup: async (page) => {
                await page.getByText('Run grid').click({ force: true });
            },
            setupPreActions: async (page) => {
                await page.getByText('Clear').click({ force: true });
                await waitFor(noRowsCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click({ force: true });
                await waitFor(athleteCheck, page);
            },
            metrics: 'long-animation-frame',
        },
    ],
});
