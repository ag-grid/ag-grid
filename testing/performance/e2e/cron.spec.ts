import path from 'path';

import test, { TestCase } from '../benchmarking';
import { waitFor } from '../playwright.utils';

const noRowsCheck = () => document.body.textContent!.includes('No Rows To Show');
const athleteCheck = () => document.body.textContent!.includes('Athlete');
const localLotsOfCells = `file://${path.join(__dirname, './lots-of-cells.html')}`;

const frameworks = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

test(`Performance Test - Compare performance of setting data`, {
    timeout: frameworks.length * 20 * 60_000, // takes about 10 mins per framework, but allow for some overhead
    minIterations: 200,
    testCases: frameworks.map(
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
