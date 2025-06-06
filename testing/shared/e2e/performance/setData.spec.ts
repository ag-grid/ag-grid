import { waitFor } from '../../playwright.utils';
import type { Describe } from './benchmarking';
import test from './benchmarking';

const noRowsCheck = () => document.body.textContent.includes('No rows to show');
const athleteCheck = () => document.body.textContent.includes('Athlete');

const describe: Describe = {
    name: 'Compare performance of setting data',
    timeout: 30 * 60_000,
    minIterations: 50,
    testCases: [
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'typescript',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
                await page.getByText('Clear').click({ force: true });
                await waitFor(noRowsCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click({ force: true });
                await waitFor(athleteCheck, page);
            },
            metrics: 'long-animation-frame',
        },
        {
            skip: true,
            name: 'examples/performance-test/lots-of-cells',
            framework: 'reactFunctionalTs',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
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
};

test(`Performance Test - ${describe.name}`, describe);
