import { waitFor } from '../../playwright.utils';
import type { Describe } from './benchmarking';
import test from './benchmarking';

const athleteCheck = (isPresent?: boolean) => isPresent === document.body.textContent.includes('Athlete');

const describe: Describe = {
    name: 'Compare performance of setting data',
    iterations: 50,
    timeout: 15 * 60_000, // 15 minutes
    testCases: [
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'typescript',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
                await page.getByText('Clear').click();
                await waitFor(athleteCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click();
                await waitFor(athleteCheck, page, { args: [true] });
            },
            metrics: 'long-animation-frame',
        },
        {
            name: 'examples/performance-test/lots-of-cells',
            framework: 'reactFunctionalTs',
            control: { version: 'prod' },
            variant: { version: 'staging' },
            setup: async (page) => {
                await page.getByText('Clear').click();
                await waitFor(athleteCheck, page);
            },
            actions: async (page) => {
                await page.getByText('Set Data').click();
                await waitFor(athleteCheck, page, { args: [true] });
            },
            metrics: 'long-animation-frame',
        },
    ],
};

test(`Performance Test - ${describe.name} - ${describe.iterations} iterations`, describe);
