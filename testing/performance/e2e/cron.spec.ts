import path from 'path';

import test, { TestCase, allFrameworks } from '../benchmarking';
import { waitFor } from '../playwright.utils';

const noRowsCheck = () => document.body.textContent!.includes('No Rows To Show');
const athleteCheck = () => document.body.textContent!.includes('Athlete');
const localLotsOfCells = `file://${path.join(__dirname, './lots-of-cells.html')}`;

test(`Performance Test - Compare performance of setting data`, {
    timeout: allFrameworks.length * 20 * 60_000,
    minIterations: 100,
    testCases: allFrameworks.map(
        (framework) =>
            ({
                name: 'Set data (lots): staging vs prod',
                framework,
                control: { version: 'prod', url: localLotsOfCells, shouldInjectScript: true },
                variant: { version: 'staging', url: localLotsOfCells, shouldInjectScript: true },
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
            }) as TestCase
    ),
});
